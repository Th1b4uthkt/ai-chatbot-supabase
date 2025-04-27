import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

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

// GET /api/dashboard/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const eventId = params.id;

  // Check if user is authenticated and has admin privileges
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Not authenticated' },
      { status: 401 }
    );
  }

  // Check if user is admin
  const admin = await isAdmin(supabase, user.id);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Transform database record to match the EventType interface
    const formattedEvent = {
      ...data,
      
      // Create coordinates object from latitude/longitude
      coordinates: {
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0
      },
      
      // Create organizer object from separate fields
      organizer: {
        name: data.organizer_name || '',
        image: data.organizer_image || '',
        contactEmail: data.organizer_contact_email || '',
        contactPhone: data.organizer_contact_phone || '',
        website: data.organizer_website || ''
      },
      
      // Parse facilities and tickets if they're strings
      facilities: typeof data.facilities === 'object' ? data.facilities : 
                 typeof data.facilities === 'string' ? JSON.parse(data.facilities) : {},
      
      tickets: typeof data.tickets === 'object' ? data.tickets : 
               typeof data.tickets === 'string' ? JSON.parse(data.tickets) : {},
                       
      // Reconstruct recurrence object
      recurrence: data.recurrence_pattern ? {
        pattern: data.recurrence_pattern,
        customPattern: data.recurrence_custom_pattern,
        endDate: data.recurrence_end_date
      } : null,
      
      // Map attendee_count to attendeeCount for frontend consistency
      attendeeCount: data.attendee_count
    };

    return NextResponse.json({ data: formattedEvent });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/events/[id] - Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const eventId = params.id;

  // Check if user is authenticated and has admin privileges
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Not authenticated' },
      { status: 401 }
    );
  }

  // Check if user is admin
  const admin = await isAdmin(supabase, user.id);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const eventData = await request.json();
    
    // Format the data for Supabase
    const formattedEventData: Record<string, any> = {
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      image: eventData.image,
      time: eventData.time,
      location: eventData.location,
      price: eventData.price,
      day: eventData.day,
      duration: eventData.duration,
      rating: eventData.rating,
      reviews: eventData.reviews,
      
      // Extract from coordinates object
      latitude: eventData.coordinates?.latitude,
      longitude: eventData.coordinates?.longitude,
      
      // Extract from organizer object
      organizer_name: eventData.organizer?.name,
      organizer_image: eventData.organizer?.image,
      organizer_contact_email: eventData.organizer?.contactEmail,
      organizer_contact_phone: eventData.organizer?.contactPhone,
      organizer_website: eventData.organizer?.website,
      
      // Recurrence fields
      recurrence_pattern: eventData.recurrence?.pattern,
      recurrence_custom_pattern: eventData.recurrence?.customPattern,
      recurrence_end_date: eventData.recurrence?.endDate,
      
      // JSON fields
      facilities: eventData.facilities,
      tickets: eventData.tickets,
      
      // Arrays and numbers
      tags: Array.isArray(eventData.tags) ? eventData.tags : [],
      capacity: eventData.capacity,
      attendee_count: eventData.attendeeCount || 0,
    };
    
    // Remove any undefined or null values
    Object.keys(formattedEventData).forEach(key => {
      if (formattedEventData[key] === undefined) {
        delete formattedEventData[key];
      }
    });

    // Update the event record
    const { data, error } = await supabase
      .from('events')
      .update(formattedEventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const eventId = params.id;

  // Check if user is authenticated and has admin privileges
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Not authenticated' },
      { status: 401 }
    );
  }

  // Check if user is admin
  const admin = await isAdmin(supabase, user.id);
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  try {
    // Delete the event
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
} 