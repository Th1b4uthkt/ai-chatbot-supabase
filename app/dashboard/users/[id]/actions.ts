'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { EnhancedProfile } from '@/types/profile';

/**
 * Fetch a user profile by ID
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error.message);
    throw new Error('Failed to fetch user profile');
  }
  
  return data;
}

/**
 * Update a user profile
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<EnhancedProfile>
) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user profile:', error.message);
    throw new Error('Failed to update user profile');
  }
  
  // Revalidate the user profile page to show updated data
  revalidatePath(`/dashboard/users/${userId}`);
  revalidatePath('/dashboard/users');
  
  return { success: true };
}

// Action to toggle admin status
export async function toggleUserAdminStatus(userId: string, isAdmin: boolean) {
  // ... existing code ...
} 