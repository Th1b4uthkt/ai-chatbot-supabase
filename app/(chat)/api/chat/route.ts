import {
  convertToCoreMessages,
  CoreMessage,
  CoreAssistantMessage,
  CoreToolMessage,
  Message,
  StreamData,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { blocksPrompt, regularPrompt, systemPrompt } from '@/ai/prompts';
import { corsHeaders } from '@/app/api/cors-middleware';
import { getChatById, getDocumentById, getSession } from '@/db/cached-queries';
import {
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
  deleteChatById,
} from '@/db/mutations';
import { createClient, validateToken } from '@/lib/supabase/server';
import { MessageRole } from '@/lib/types';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { allTools, tools } from './tools';
import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

async function getUser(request: Request) {
  // Extraire l'en-tête d'autorisation 
  const authHeader = request.headers.get('Authorization');
  
  // Log détaillé pour le débogage
  console.log('CHAT-API: Auth header:', authHeader ? 'Bearer [REDACTED]' : 'null');
  console.log('CHAT-API: Headers:', Object.fromEntries([...request.headers.entries()]));
  
  // Vérifier d'abord le jeton Bearer (mobile)
  if (authHeader?.startsWith('Bearer ')) {
    console.log('CHAT-API: Bearer token detected, using mobile auth flow');
    const token = authHeader.substring(7).trim();
    console.log('CHAT-API: Token length:', token.length);
    
    // Utiliser validateToken au lieu de getUser directement
    const { data, error } = await validateToken(token);
    
    if (error) {
      console.error('CHAT-API: Token validation error:', error);
      throw new Error(`Unauthorized: ${error.message}`);
    }
    
    if (!data.user) {
      console.error('CHAT-API: No user found for token');
      throw new Error('Unauthorized: Invalid token');
    }
    
    console.log('CHAT-API: Mobile auth successful for user ID:', data.user.id);
    return data.user;
  }
  
  // Sinon, utiliser l'authentification basée sur les cookies (web)
  console.log('CHAT-API: No Bearer token, using web auth flow');
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('CHAT-API: Web auth error:', error?.message || 'No user found');
    throw new Error('Unauthorized');
  }

  console.log('CHAT-API: Web auth successful for user ID:', user.id);
  return user;
}

// Add helper function to format message content for database storage
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
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const user = await getUser(request);

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Détecter le type de plateforme à partir de l'en-tête User-Agent
  const userAgent = request.headers.get('user-agent') || '';
  const isNativeMobile = userAgent.includes('Expo') || userAgent.includes('React Native');

  try {
    const chat = await getChatById(id);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      
      console.log('DB-INSERT: Attempting to insert chat with user ID:', user.id);
      console.log('DB-INSERT: Insert data prepared:', {
        id: id,
        user_id: user.id,
        title: title
      });
      
      try {
        await saveChat({ id, userId: user.id, title });
        console.log('DB-INSERT: Chat inserted successfully:', id);
      } catch (error) {
        console.error('DB-INSERT: Database error during chat insertion:', error);
        throw error;
      }
    } else if (chat.user_id !== user.id) {
      console.error('DB-INSERT: Unauthorized access attempt, chat belongs to user:', chat.user_id);
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('DB-INSERT: Attempting to insert message for chat:', id);
    
    const messageData = {
      id: generateUUID(),
      chat_id: id,
      role: userMessage.role as MessageRole,
      content: formatMessageContent(userMessage),
      created_at: new Date().toISOString(),
    };
    
    console.log('DB-INSERT: Message data prepared:', {
      id: messageData.id,
      chat_id: messageData.chat_id,
      role: messageData.role,
      created_at: messageData.created_at
    });
    
    try {
      await saveMessages({
        chatId: id,
        messages: [messageData],
      });
      console.log('DB-INSERT: Message inserted successfully');
    } catch (error) {
      console.error('DB-INSERT: Database error during message insertion:', error);
      throw error;
    }

    const streamingData = new StreamData();
    let cachedResponseMessages: (CoreAssistantMessage | CoreToolMessage)[] = [];

    const result = await streamText({
      model: customModel(model.apiIdentifier),
      system: systemPrompt,
      messages: coreMessages,
      maxSteps: 5,
      experimental_activeTools: ['getWeather', 'getEvents'],
      tools: {
        getWeather: tools.getWeather,
        getEvents: tools.getEvents,
      },
      onFinish: async ({ responseMessages }) => {
        // Stocker les messages pour une utilisation ultérieure par les clients mobiles
        cachedResponseMessages = responseMessages;
        
        // Sauvegarder les messages dans la base de données
        if (user && user.id) {
          try {
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(responseMessages);

            await saveMessages({
              chatId: id,
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  const messageId = generateUUID();

                  if (message.role === 'assistant') {
                    streamingData.appendMessageAnnotation({
                      messageIdFromServer: messageId,
                    });
                  }

                  return {
                    id: messageId,
                    chat_id: id,
                    role: message.role as MessageRole,
                    content: formatMessageContent(message),
                    created_at: new Date().toISOString(),
                  };
                }
              ),
            });
          } catch (error) {
            console.error('Failed to save chat:', error);
          }
        }

        streamingData.close();
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
    });
    
    // Retourner une réponse appropriée selon la plateforme
    if (isNativeMobile) {
      // Pour mobile, attendre que le traitement soit terminé et renvoyer du JSON
      // Utiliser les messages mis en cache par onFinish
      const responseMessagesWithoutIncompleteToolCalls = 
        sanitizeResponseMessages(cachedResponseMessages);
        
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
    } else {
      // Pour web, continuer à utiliser la réponse en streaming
      return result.toDataStreamResponse({
        data: streamingData,
      });
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    if (error instanceof Error && error.message === 'Chat ID already exists') {
      // If chat already exists, just continue with the message saving
      await saveMessages({
        chatId: id,
        messages: [
          {
            id: generateUUID(),
            chat_id: id,
            role: userMessage.role as MessageRole,
            content: formatMessageContent(userMessage),
            created_at: new Date().toISOString(),
          },
        ],
      });
    } else {
      throw error; // Re-throw other errors
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const user = await getUser(request);

  try {
    const chat = await getChatById(id);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById(id, user.id);

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}

// Ajouter le gestionnaire OPTIONS pour les requêtes préliminaires CORS
export { OPTIONS } from '@/app/api/cors-middleware';