import { createClient, validateToken } from '@/lib/supabase/server';

import { corsHeaders } from '../cors-middleware';

export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: Request) {
  try {
    // Extraire le jeton Bearer
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // Log de débogage
    console.log('DEBUG-AUTH: Request headers:', Object.fromEntries([...request.headers.entries()]));
    console.log('DEBUG-AUTH: Auth header:', authHeader);
    console.log('DEBUG-AUTH: Token (masked):', token ? `${token.substring(0, 10)}...` : null);
    
    // Vérifier le User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const isNativeMobile = userAgent.includes('Expo') || userAgent.includes('React Native');
    console.log('DEBUG-AUTH: User agent:', userAgent);
    console.log('DEBUG-AUTH: Is mobile:', isNativeMobile);
    
    // Valider le jeton et obtenir l'utilisateur
    let userData = null;
    let error = null;
    
    if (token) {
      try {
        const result = await validateToken(token);
        userData = result.data;
        error = result.error;
        console.log('DEBUG-AUTH: Token validation result:', error ? 'ERROR' : 'SUCCESS');
        
        if (error) {
          console.error('DEBUG-AUTH: Token validation error:', error);
        } else if (userData.user) {
          console.log('DEBUG-AUTH: Authenticated user ID:', userData.user.id);
        }
      } catch (e) {
        console.error('DEBUG-AUTH: Token validation exception:', e);
        error = { message: e instanceof Error ? e.message : String(e) };
      }
    }
    
    // Renvoyer les résultats
    return new Response(JSON.stringify({
      token: token ? `${token.substring(0, 10)}...` : null, // Seulement les premiers caractères par sécurité
      user: userData?.user || null,
      error: error,
      isMobile: isNativeMobile,
      headers: {
        userAgent: userAgent,
        authorization: authHeader ? 'Bearer [REDACTED]' : null
      }
    }), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  } catch (e) {
    console.error('DEBUG-AUTH: Unexpected error:', e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : String(e) 
    }), {
      status: 500,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      }
    });
  }
} 