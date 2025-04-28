import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

// Create a Supabase client specifically for API routes
// This doesn't rely on cookies from next/headers
export function createApiClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Function to create authenticated client with user's token
export function createAuthenticatedApiClient(authToken: string) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    }
  );
} 