import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EventEditForm } from '@/components/dashboard/event-edit-form';
import { EventType } from '@/types/events';

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  
  // Next.js 15 requires awaiting params
  const { id } = await params;
  
  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch user metadata to check if admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  // Redirect if not admin
  if (!adminProfile?.is_admin) {
    redirect('/');
  }
  
  // Fetch the event being edited
  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!eventData) {
    redirect('/dashboard/events');
  }
  
  // Parse nested JSON objects
  const event = {
    ...eventData,
    // Create coordinates object from latitude/longitude
    coordinates: {
      latitude: Number(eventData.latitude) || 0,
      longitude: Number(eventData.longitude) || 0
    },
    
    // Create organizer object from separate fields
    organizer: {
      name: eventData.organizer_name || '',
      image: eventData.organizer_image || '',
      contactEmail: eventData.organizer_contact_email || '',
      contactPhone: eventData.organizer_contact_phone || '',
      website: eventData.organizer_website || ''
    },
    
    // Handle facilities and tickets which are already JSON objects in the database
    facilities: typeof eventData.facilities === 'object' ? eventData.facilities : 
               typeof eventData.facilities === 'string' ? JSON.parse(eventData.facilities) : {},
      
    tickets: typeof eventData.tickets === 'object' ? eventData.tickets : 
             typeof eventData.tickets === 'string' ? JSON.parse(eventData.tickets) : {},
    
    // Reconstruct recurrence object
    recurrence: eventData.recurrence_pattern ? {
      pattern: eventData.recurrence_pattern,
      customPattern: eventData.recurrence_custom_pattern,
      endDate: eventData.recurrence_end_date
    } : null,
    
    // Map attendee_count to attendeeCount for frontend consistency
    attendeeCount: eventData.attendee_count
  } as EventType;
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link 
          href={`/dashboard/events/${id}/view`}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Event Details</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Event: {event.title}
        </h1>
        <p className="text-muted-foreground">
          Update event information and details
        </p>
      </div>
      
      <div className="bg-card/50 backdrop-blur border rounded-lg p-6 shadow-sm">
        <EventEditForm 
          event={event} 
          redirectUrl={`/dashboard/events/${id}/view`}
        />
      </div>
    </div>
  );
} 