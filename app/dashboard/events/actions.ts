'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { createEventQuery, updateEventQuery } from '@/db/queries'; // Use direct queries
import { createClient } from '@/lib/supabase/server'; // Use server client
import { TablesInsert, TablesUpdate } from '@/lib/supabase/types';

export async function createEventAction(formData: TablesInsert<'events'>) {
  const supabase = await createClient();
  try {
    const eventId = await createEventQuery(supabase, formData);
    if (!eventId) {
      throw new Error('Failed to create event in database.');
    }
    revalidatePath('/dashboard/events'); // Revalidate the events list page
    // Optional: Redirect after creation, or return success
    // redirect('/dashboard/events'); 
    return { success: true, eventId: eventId };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export async function updateEventAction(eventId: string, formData: TablesUpdate<'events'>) {
  const supabase = await createClient();
  try {
    const success = await updateEventQuery(supabase, eventId, formData);
    if (!success) {
      throw new Error('Failed to update event in database.');
    }
    revalidatePath('/dashboard/events'); // Revalidate the events list page
    revalidatePath(`/dashboard/events/${eventId}/edit`); // Revalidate the edit page
    // Optional: Redirect after update, or return success
    // redirect('/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

// We might need a delete action later too
// export async function deleteEventAction(eventId: string) { ... } 

// Placeholder for permission check function
async function checkUserPermissions(supabase: SupabaseClient) {
  // In a real app, verify the user's role/permissions here
  // Example: Check if the user is authenticated and has an 'admin' role
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return false;
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // return profile?.role === 'admin';
  return true; // Temporarily allow for development
}

export async function updateEventSponsorship(eventId: string, isSponsored: boolean, endDate?: string | null | undefined) {
  console.log(`[updateEventSponsorship] Called with eventId: ${eventId}, isSponsored: ${isSponsored}, endDate: ${endDate}`);
  
  // Initialize Supabase client
  const supabase = await createClient();

  // 1. Check permissions
  const hasPermission = await checkUserPermissions(supabase);
  if (!hasPermission) {
    console.error("[updateEventSponsorship] Permission check failed");
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate input
  if (isSponsored && !endDate) {
    console.error("[updateEventSponsorship] Missing end date for sponsored event");
    return { success: false, error: "Sponsorship end date is required when marking as sponsored." };
  }
  if (!eventId) {
    console.error("[updateEventSponsorship] Missing event ID");
    return { success: false, error: "Event ID is missing." };
  }

  const updateData: { is_sponsored: boolean; sponsor_end_date: string | null } = {
    is_sponsored: isSponsored,
    sponsor_end_date: isSponsored && endDate ? endDate : null, // Ensure endDate is provided if sponsoring
  };

  try {
    console.log(`[updateEventSponsorship] Updating event ${eventId} with data:`, updateData);
    
    // Perform the update operation
    const { error, data, status, statusText } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select();

    if (error) {
      console.error("[updateEventSponsorship] Supabase update error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }

    console.log(`[updateEventSponsorship] Successfully updated event ${eventId}, status: ${status}`);

    // 3. Revalidate the path and cache tags
    revalidateTag('events_list');
    revalidateTag(`event_${eventId}`);
    revalidatePath('/dashboard/events');
    revalidatePath('/dashboard'); // Also revalidate overview if needed

    return { success: true };
  } catch (e) {
    console.error("[updateEventSponsorship] Unexpected error:", e);
    const message = e instanceof Error ? e.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
} 