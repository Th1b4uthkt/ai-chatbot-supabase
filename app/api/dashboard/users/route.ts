import { NextRequest, NextResponse } from 'next/server';

import { validateAdminAccess } from '@/lib/auth-utils';
import { createApiClient } from '@/lib/supabase/api';

// Function to check if user is admin
async function isAdmin(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error || !profile?.is_admin) {
    return false;
  }

  return true;
}

// GET /api/dashboard/users - Get all users
export async function GET(request: NextRequest) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;

  // Parse URL search params
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || '';
  
  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  try {
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return NextResponse.json({ 
      data, 
      meta: { 
        total: count,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/users - Create a new user
export async function POST(request: NextRequest) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;

  try {
    const userData = await request.json();

    // Create a new user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Skip email verification
    });

    if (authError) throw authError;

    // Create profile record
    const { data, error } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      join_date: new Date().toISOString(),
      // Add any other required fields
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
} 