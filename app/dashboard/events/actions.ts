'use server';

import { revalidatePath } from 'next/cache';
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