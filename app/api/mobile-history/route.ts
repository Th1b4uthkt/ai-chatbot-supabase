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
    console.log('MOBILE-HISTORY: User authenticated:', user.id);
    
    // 3. Récupérer l'historique des chats avec le client admin
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (chatsError) {
      console.error('MOBILE-HISTORY: Error fetching chats:', chatsError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch chat history',
        details: chatsError.message
      }), { 
        status: 500,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 4. Retourner la réponse au client mobile
    return new Response(JSON.stringify(chats || []), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('MOBILE-HISTORY: Unexpected error:', error);
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