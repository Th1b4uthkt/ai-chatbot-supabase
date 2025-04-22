'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createGuideQuery, updateGuideQuery, deleteGuideQuery } from '@/db/queries';
import { createClient } from '@/lib/supabase/server'; // Use server client
import { TablesInsert, TablesUpdate } from '@/lib/supabase/types';

// Adjust the input type based on your form structure and GuideType
// You might need a transformation step if the form data doesn't directly match TablesInsert<'guides'>
export async function createGuideAction(formData: TablesInsert<'guides'>) {
  const supabase = await createClient();
  try {
    const guideId = await createGuideQuery(supabase, formData);
    if (!guideId) {
      throw new Error('Failed to create guide in database.');
    }
    revalidatePath('/dashboard/guides'); // Revalidate the guides list page
    // Redirect to the new guide's detail or edit page, or the list page
    redirect(`/dashboard/guides`); // Redirect to list for now
    // return { success: true, guideId: guideId }; // Or return success
  } catch (error) {
    console.error('Error creating guide:', error);
    // Return error state to the form
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

// Adjust the input type based on your form structure and GuideType
export async function updateGuideAction(guideId: string, formData: TablesUpdate<'guides'>) {
  const supabase = await createClient();
  try {
    const success = await updateGuideQuery(supabase, guideId, formData);
    if (!success) {
      throw new Error('Failed to update guide in database.');
    }
    revalidatePath('/dashboard/guides'); // Revalidate the list page
    revalidatePath(`/dashboard/guides/${guideId}`); // Revalidate detail page (if exists)
    revalidatePath(`/dashboard/guides/${guideId}/edit`); // Revalidate edit page
    redirect(`/dashboard/guides`); // Redirect to list for now
    // return { success: true }; // Or return success
  } catch (error) {
    console.error('Error updating guide:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export async function deleteGuideAction(guideId: string) {
  const supabase = await createClient();
  try {
    const success = await deleteGuideQuery(supabase, guideId);
    if (!success) {
      throw new Error('Failed to delete guide in database.');
    }
    revalidatePath('/dashboard/guides'); // Revalidate the list page
    // No redirect needed if called from the list page, potentially return success
    return { success: true };
  } catch (error) {
    console.error('Error deleting guide:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
} 