'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { createPartnerQuery, updatePartnerQuery, deletePartnerQuery } from '@/db/queries'; // Use direct queries
import { mapPartnerToDb } from '@/lib/supabase/mappers';
import { createClient } from '@/lib/supabase/server'; // Use server client
import { TablesInsert, TablesUpdate } from '@/lib/supabase/types';
import { PartnerType } from '@/types/partner';

export async function createPartnerAction(partner: PartnerType) {
  const supabase = await createClient();
  try {
    // Convert from frontend model to database model
    const partnerData = mapPartnerToDb(partner);
    
    const result = await createPartnerQuery(supabase, partnerData as TablesInsert<'partners'>);
    if (!result) {
      throw new Error('Failed to create partner in database.');
    }
    
    revalidatePath('/dashboard/partners'); // Revalidate the partners list page
    // Optional: Redirect after creation, or return success
    // redirect('/dashboard/partners');
    return { success: true, partnerId: result.id };
  } catch (error) {
    console.error('Error creating partner:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export async function updatePartnerAction(partnerId: string, partnerData: Partial<PartnerType>) {
  const supabase = await createClient();
  try {
    // Convert from frontend model to database model for update
    const dbPartnerData = mapPartnerToDb(partnerData as PartnerType);
    
    const result = await updatePartnerQuery(supabase, partnerId, dbPartnerData as TablesUpdate<'partners'>);
    if (!result) {
      throw new Error('Failed to update partner in database.');
    }
    
    revalidatePath('/dashboard/partners'); // Revalidate the partners list page
    revalidatePath(`/dashboard/partners/${partnerId}/edit`); // Revalidate the edit page
    // Optional: Redirect after update, or return success
    // redirect('/dashboard/partners');
    return { success: true };
  } catch (error) {
    console.error('Error updating partner:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export async function deletePartnerAction(partnerId: string) {
  const supabase = await createClient();
  try {
    const success = await deletePartnerQuery(supabase, partnerId);
    if (!success) {
      throw new Error('Failed to delete partner from database.');
    }
    
    revalidatePath('/dashboard/partners'); // Revalidate the partners list page
    // Optional: Redirect after deletion, or return success
    // redirect('/dashboard/partners');
    return { success: true };
  } catch (error) {
    console.error('Error deleting partner:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

// Placeholder for permission check function
async function checkUserPermissions(supabase: SupabaseClient) {
  // In a real app, verify the user's role/permissions here
  // This function can be shared or adapted based on specific permission needs
  return true; // Temporarily allow for development
}

export async function updatePartnerSponsorship(partnerId: string, isSponsored: boolean, endDate?: string | null | undefined) {
  console.log(`[updatePartnerSponsorship] Called with partnerId: ${partnerId}, isSponsored: ${isSponsored}, endDate: ${endDate}`);
  
  // Initialize Supabase client
  const supabase = await createClient();

  // 1. Check permissions
  const hasPermission = await checkUserPermissions(supabase);
  if (!hasPermission) {
    console.error("[updatePartnerSponsorship] Permission check failed");
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input
  if (isSponsored && !endDate) {
    console.error("[updatePartnerSponsorship] Missing end date for sponsored partner");
    return { success: false, error: "Sponsorship end date is required when marking as sponsored." };
  }
  if (!partnerId) {
    console.error("[updatePartnerSponsorship] Missing partner ID");
    return { success: false, error: "Partner ID is missing." };
  }

  const updateData: { is_sponsored: boolean; sponsor_end_date: string | null } = {
    is_sponsored: isSponsored,
    sponsor_end_date: isSponsored && endDate ? endDate : null, // Ensure endDate is provided if sponsoring
  };

  try {
    console.log(`[updatePartnerSponsorship] Updating partner ${partnerId} with data:`, updateData);
    
    // Perform the update operation
    const { error, data, status, statusText } = await supabase
      .from('partners') // Target the 'partners' table
      .update(updateData)
      .eq('id', partnerId)
      .select();

    if (error) {
      console.error("[updatePartnerSponsorship] Supabase update error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }

    console.log(`[updatePartnerSponsorship] Successfully updated partner ${partnerId}, status: ${status}`);

    // 3. Revalidate the path and cache tags
    revalidateTag('partners_list');
    revalidateTag(`partner_${partnerId}`);
    revalidatePath('/dashboard/partners');
    revalidatePath('/dashboard'); // Also revalidate overview if needed

    return { success: true };
  } catch (e) {
    console.error("[updatePartnerSponsorship] Unexpected error:", e);
    const message = e instanceof Error ? e.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
} 