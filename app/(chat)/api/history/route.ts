import { corsHeaders } from '@/app/api/cors-middleware';
import { getSession } from '@/db/cached-queries';
import { createClient, validateToken } from '@/lib/supabase/server';

async function getUser(request: Request) {
  // Vérifier d'abord le jeton Bearer (mobile)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await validateToken(token);
    if (!error && data.user) {
      return data.user;
    }
  }

  // Sinon, utiliser l'authentification basée sur les cookies (web)
  return getSession();
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const user = await getUser(request);

  if (!user) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: corsHeaders()
    });
  }

  const { data: chats, error } = await supabase
    .from('chats')
    .select()
    .eq('user_id', user.id!)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify(chats), {
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    }
  });
}

// Ajouter le gestionnaire OPTIONS pour les requêtes préliminaires CORS
export { OPTIONS } from '@/app/api/cors-middleware';
