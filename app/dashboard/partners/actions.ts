'use server';

import { revalidatePath } from 'next/cache';
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