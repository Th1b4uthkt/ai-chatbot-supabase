import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: Avoid writing sensitive keys to logs when developing locally
    // console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
    // console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // --- Base redirect logic ---
    // Redirect unauthenticated users trying to access protected root
    if (!user && request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/register', request.url));
    }

    // Redirect authenticated users away from auth pages
    if (
      user &&
      (request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/register')
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // --- Dashboard Admin Check ---
    if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      // Handle potential error fetching profile
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: row not found, handled below
        console.error('Error fetching profile:', profileError);
        // Decide how to handle DB errors, maybe redirect to an error page or home
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (!profile?.is_admin) {
        // Redirect non-admin users trying to access dashboard
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        // Redirect unauthenticated users trying to access dashboard
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }


    // All checks passed, continue with the response
    return response;
  } catch (e) {
    // An error occurred, likely during supabase client creation or session fetching.
    // Returning a basic next response allows the application to handle errors gracefully.
    console.error('Error in middleware:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
