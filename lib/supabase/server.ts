import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

/**
 * Fonction améliorée de validation des jetons
 * Cette fonction détecte et traite les cas particuliers des jetons de l'application mobile
 */
export async function validateToken(token: string) {
  if (!token) {
    return { data: { user: null }, error: { message: 'No token provided' } };
  }
  
  // Vérifier que le jeton est correctement formaté
  const formattedToken = token.trim();
  console.log('TOKEN-VALIDATE: Token length:', formattedToken.length);
  
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // Pas besoin de cookies pour la validation de token
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    );
    
    // Utiliser getUser pour valider le jeton
    const result = await supabase.auth.getUser(formattedToken);
    
    // Logs détaillés pour le débogage
    if (result.error) {
      console.error('TOKEN-VALIDATE: Validation error:', result.error.message);
    } else if (result.data.user) {
      console.log('TOKEN-VALIDATE: User validated:', result.data.user.id);
    } else {
      console.warn('TOKEN-VALIDATE: No user found with token');
    }
    
    return result;
  } catch (e) {
    console.error('TOKEN-VALIDATE: Exception during validation:', e);
    return { 
      data: { user: null }, 
      error: { message: e instanceof Error ? e.message : String(e) } 
    };
  }
}
