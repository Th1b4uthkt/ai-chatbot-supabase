import { createClient } from '@supabase/supabase-js';
import {
  convertToCoreMessages,
  CoreMessage,
  CoreAssistantMessage,
  CoreToolMessage,
  Message,
  streamText,
} from 'ai';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { systemPrompt } from '@/ai/prompts';
import { corsHeaders } from '@/app/api/cors-middleware';
import { validateToken } from '@/lib/supabase/server';
import { MessageRole } from '@/lib/types';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

// Client admin qui contourne RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { persistSession: false }
  }
);

// Helper function to format message content for database storage
function formatMessageContent(message: CoreMessage): string {
  // For user messages, store as plain text
  if (message.role === 'user') {
    return typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);
  }

  // For tool messages, format as array of tool results
  if (message.role === 'tool') {
    return JSON.stringify(
      message.content.map((content) => ({
        type: content.type || 'tool-result',
        toolCallId: content.toolCallId,
        toolName: content.toolName,
        result: content.result,
      }))
    );
  }

  // For assistant messages, format as array of text and tool calls
  if (message.role === 'assistant') {
    if (typeof message.content === 'string') {
      return JSON.stringify([{ type: 'text', text: message.content }]);
    }

    return JSON.stringify(
      message.content.map((content) => {
        if (content.type === 'text') {
          return {
            type: 'text',
            text: content.text,
          };
        }
        return {
          type: 'tool-call',
          toolCallId: content.toolCallId,
          toolName: content.toolName,
          args: content.args,
        };
      })
    );
  }

  return '';
}

export async function POST(request: Request) {
  try {
    // 1. Extraire le jeton d'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Bearer token required' }), {
        status: 401,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    const token = authHeader.substring(7).trim();
    
    // 2. Valider le token et récupérer l'utilisateur
    const { data, error } = await validateToken(token);
    
    if (error || !data.user) {
      return new Response(JSON.stringify({ 
        error: error ? error.message : 'Invalid token' 
      }), {
        status: 401,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    const user = data.user;
    console.log('MOBILE-CHAT: User authenticated:', user.id);
    
    // 3. Récupérer les données de la requête
    const {
      id,
      messages,
      modelId,
    }: { id: string; messages: Array<Message>; modelId: string } = await request.json();

    // 4. Validation de base
    const model = models.find((model) => model.id === modelId);
    if (!model) {
      return new Response(JSON.stringify({ error: 'Model not found' }), { 
        status: 404,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), { 
        status: 400,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 5. Vérifier si le chat existe
    const { data: existingChat } = await supabaseAdmin
      .from('chats')
      .select('id, user_id, title')
      .eq('id', id)
      .single();
    
    // 6. Insérer/vérifier le chat
    if (!existingChat) {
      // Générer un titre pour le nouveau chat
      let title = "Nouvelle conversation";
      if (typeof userMessage.content === 'string') {
        title = userMessage.content.substring(0, 50);
      }
      
      console.log('MOBILE-CHAT: Creating new chat with ID:', id);
      const now = new Date().toISOString();
      
      // Insérer avec le client admin
      const { error: chatError } = await supabaseAdmin
        .from('chats')
        .insert({
          id,
          user_id: user.id,
          title,
          created_at: now,
          updated_at: now,
        });
      
      if (chatError) {
        console.error('MOBILE-CHAT: Chat creation error:', chatError);
        return new Response(JSON.stringify({ 
          error: 'Failed to create chat',
          details: chatError.message
        }), { 
          status: 500,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json'
          }
        });
      }
    } else if (existingChat.user_id !== user.id) {
      // Vérifier que l'utilisateur est autorisé à accéder à ce chat
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 7. Insérer le message de l'utilisateur
    const userMessageId = generateUUID();
    const { error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        id: userMessageId,
        chat_id: id,
        role: userMessage.role as MessageRole,
        content: formatMessageContent(userMessage),
        created_at: new Date().toISOString(),
      });
    
    if (messageError) {
      console.error('MOBILE-CHAT: User message insertion error:', messageError);
      return new Response(JSON.stringify({ 
        error: 'Failed to save user message',
        details: messageError.message
      }), { 
        status: 500,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 8. Générer la réponse avec le modèle AI
    let cachedResponseMessages: (CoreAssistantMessage | CoreToolMessage)[] = [];
    
    const { fullStream } = await streamText({
      model: customModel(model.apiIdentifier),
      system: systemPrompt,
      messages: coreMessages,
      onFinish: ({ responseMessages }) => {
        cachedResponseMessages = responseMessages;
      }
    });
    
    // Consommer le stream pour terminer la génération
    for await (const _ of fullStream) {
      // Nous ne faisons rien avec les chunks ici, nous voulons juste
      // attendre que la génération soit terminée
    }
    
    // 9. Sauvegarder les messages de réponse dans la base de données
    const responseMessagesWithoutIncompleteToolCalls = 
      sanitizeResponseMessages(cachedResponseMessages);
    
    if (responseMessagesWithoutIncompleteToolCalls.length > 0) {
      const dbMessages = responseMessagesWithoutIncompleteToolCalls.map(message => ({
        id: generateUUID(),
        chat_id: id,
        role: message.role as MessageRole,
        content: formatMessageContent(message),
        created_at: new Date().toISOString(),
      }));
      
      const { error: responseSaveError } = await supabaseAdmin
        .from('messages')
        .insert(dbMessages);
      
      if (responseSaveError) {
        console.error('MOBILE-CHAT: Response message insertion error:', responseSaveError);
        // Continuer malgré l'erreur pour retourner la réponse au client
      }
    }
    
    // 10. Retourner la réponse au client mobile
    return new Response(JSON.stringify({
      messages: responseMessagesWithoutIncompleteToolCalls.map(message => ({
        id: generateUUID(),
        role: message.role,
        content: formatMessageContent(message),
      })),
    }), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('MOBILE-CHAT: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handler OPTIONS pour CORS
export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders(),
  });
} 