import { createClient } from '@supabase/supabase-js';

import { corsHeaders } from '@/app/api/cors-middleware';
import { validateToken } from '@/lib/supabase/server';

// Client admin qui contourne RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { persistSession: false }
  }
);

export async function GET(request: Request) {
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
    
    // 3. Extraire l'ID du chat des paramètres de requête
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    
    if (!chatId) {
      return new Response(JSON.stringify({ error: 'Missing chatId parameter' }), {
        status: 400,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log(`MOBILE-MESSAGES: User ${user.id} requesting messages for chat ${chatId}`);
    
    // 4. Vérifier que l'utilisateur est propriétaire du chat
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('id, user_id')
      .eq('id', chatId)
      .single();
    
    if (chatError) {
      console.error('MOBILE-MESSAGES: Error fetching chat:', chatError);
      return new Response(JSON.stringify({ 
        error: 'Chat not found',
        details: chatError.message
      }), { 
        status: 404,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (chat.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 5. Récupérer les messages du chat
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('MOBILE-MESSAGES: Error fetching messages:', messagesError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch messages',
        details: messagesError.message
      }), { 
        status: 500,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 6. Retourner la réponse au client mobile
    return new Response(JSON.stringify(messages || []), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('MOBILE-MESSAGES: Unexpected error:', error);
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