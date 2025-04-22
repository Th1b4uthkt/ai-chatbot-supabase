'use server';

import { revalidateTag } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

export async function toggleUserAdminStatus(userId: string, isAdmin: boolean) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    // Revalidate the cache for this user
    revalidateTag(`user_profile_${userId}`);
    revalidateTag(`user_admin_${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return { success: false, error: (error as Error).message };
  }
} 