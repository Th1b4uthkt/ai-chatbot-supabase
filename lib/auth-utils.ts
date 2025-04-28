import { NextRequest, NextResponse } from 'next/server';

import { createApiClient } from '@/lib/supabase/api';

/**
 * Validates the authorization token from request headers
 * Returns the user if authenticated, or null if not
 */
export async function validateAuthToken(request: NextRequest) {
  const supabase = createApiClient();
  
  // Get the Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Invalid token format' };
  }
  
  const token = authHeader.split(' ')[1];
  
  // Get user with the token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: error?.message || 'Authentication failed' };
  }
  
  return { user, supabase, error: null };
}

/**
 * Validates if the user has admin privileges
 */
export async function isAdmin(supabase: any, userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error || !profile?.is_admin) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Validates admin access for an API route
 * Returns the user and supabase client if authenticated admin
 * Or returns an error response if not
 */
export async function validateAdminAccess(request: NextRequest) {
  const { user, supabase, error } = await validateAuthToken(request);
  
  if (!user) {
    return { 
      response: NextResponse.json(
        { error: error || 'Unauthorized - Not authenticated' },
        { status: 401 }
      )
    };
  }
  
  // Check if user is admin
  const admin = await isAdmin(supabase, user.id);
  if (!admin) {
    return { 
      response: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    };
  }
  
  return { user, supabase, response: null };
} 