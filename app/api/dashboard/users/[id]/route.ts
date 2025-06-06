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

// GET /api/dashboard/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;
  const { id } = await params;
  const userId = id;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;
  const { id } = await params;
  const userId = id;

  try {
    const userData = await request.json();

    // Check if user is trying to update email
    if (userData.email) {
      // Update user email in Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: userData.email }
      );

      if (authError) throw authError;
    }

    // Update profile in database
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;
  const { id } = await params;
  const userId = id;

  try {
    // Delete user from Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    // Delete user profile from database
    // Note: You may want to consider soft deleting users instead
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
} 