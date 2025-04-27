'use client';

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

// GET /api/dashboard/events - Get all events
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
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

  // Parse URL search params
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  
  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  try {
    let query = supabase.from('events').select('*', { count: 'exact' });

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Apply pagination
    const { data, error, count } = await query.range(start, end).order('time', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ 
      data, 
      meta: { 
        total: count,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/events - Create a new event
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
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
    const formattedEventData = {
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
    
    // Create the event record
    const { data, error } = await supabase
      .from('events')
      .insert(formattedEventData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
} 