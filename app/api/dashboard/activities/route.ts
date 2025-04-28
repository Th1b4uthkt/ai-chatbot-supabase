import { NextRequest, NextResponse } from 'next/server';

import { validateAdminAccess } from '@/lib/auth-utils';
import { createApiClient } from '@/lib/supabase/api';

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

// GET /api/dashboard/activities - Get all activities
export async function GET(request: NextRequest) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;

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
    // First get base_items
    let baseItemsQuery = supabase
      .from('base_items')
      .select(`
        id, name, type, short_description, long_description, main_image,
        gallery_images, address, coordinates, area, contact_info, hours,
        open_24h, rating, tags, price_range, currency, features, languages,
        updated_at, is_sponsored, is_featured, payment_methods, accessibility
      `, { count: 'exact' })
      .eq('type', 'activity');

    // Add search filter if provided
    if (search) {
      baseItemsQuery = baseItemsQuery.or(`name.ilike.%${search}%,short_description.ilike.%${search}%,long_description.ilike.%${search}%,address.ilike.%${search}%`);
    }

    // Apply pagination
    const { data: baseItemsData, error: baseItemsError, count } = await baseItemsQuery
      .range(start, end)
      .order('updated_at', { ascending: false });

    if (baseItemsError) throw baseItemsError;
    
    if (!baseItemsData || baseItemsData.length === 0) {
      return NextResponse.json({ 
        data: [], 
        meta: { 
          total: 0,
          page,
          pageSize,
          pageCount: 0
        } 
      });
    }
    
    // Fetch all activity details for these base items
    const activityIds = baseItemsData.map(item => item.id);
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('id, category, subcategory, activity_data')
      .in('id', activityIds);
    
    if (activitiesError) throw activitiesError;
    
    // Apply category filter if provided - needs to be done after fetching activities
    let filteredData = baseItemsData;
    if (category && activitiesData) {
      const filteredActivityIds = activitiesData
        .filter(activity => activity.category === category)
        .map(activity => activity.id);
      
      filteredData = baseItemsData.filter(item => 
        filteredActivityIds.includes(item.id)
      );
    }
    
    // Create a map of activity details for easier lookup
    const activityDetailsMap = new Map();
    activitiesData?.forEach(activity => {
      activityDetailsMap.set(activity.id, activity);
    });
    
    // Combine the data from both tables
    const combinedData = filteredData.map(item => {
      const activityDetails = activityDetailsMap.get(item.id);
      
      if (!activityDetails) {
        return null;
      }
      
      return {
        ...item,
        activities: [activityDetails]
      };
    }).filter(Boolean);

    return NextResponse.json({ 
      data: combinedData, 
      meta: { 
        total: count,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/activities - Create a new activity
export async function POST(request: NextRequest) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;

  try {
    const activityData = await request.json();
    
    // Start a Supabase transaction to insert into multiple tables
    // First insert into base_items
    const { data: baseItemData, error: baseItemError } = await supabase
      .from('base_items')
      .insert({
        name: activityData.name,
        type: 'activity',
        short_description: activityData.shortDescription,
        long_description: activityData.longDescription,
        main_image: activityData.mainImage,
        gallery_images: activityData.galleryImages,
        address: activityData.address,
        coordinates: activityData.coordinates,
        area: activityData.area,
        contact_info: activityData.contactInfo,
        hours: activityData.hours,
        open_24h: activityData.open24h,
        rating: activityData.rating,
        tags: activityData.tags,
        price_range: activityData.priceRange,
        currency: activityData.currency,
        features: activityData.features,
        languages: activityData.languages,
        is_sponsored: activityData.isSponsored,
        is_featured: activityData.isFeatured,
        payment_methods: activityData.paymentMethods,
        accessibility: activityData.accessibility,
      })
      .select()
      .single();

    if (baseItemError) throw baseItemError;
    
    // Then insert into activities with the ID from base_items
    const { data: activityDetailsData, error: activityDetailsError } = await supabase
      .from('activities')
      .insert({
        id: baseItemData.id,
        category: activityData.category,
        subcategory: activityData.subcategory,
        activity_data: activityData.activityData || {}
      })
      .select()
      .single();
      
    if (activityDetailsError) {
      // If activity insert fails, try to delete the base item to avoid orphaned records
      await supabase.from('base_items').delete().eq('id', baseItemData.id);
      throw activityDetailsError;
    }

    // Combine the data for response
    const responseData = {
      ...baseItemData,
      activities: [activityDetailsData]
    };

    return NextResponse.json({ data: responseData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create activity' },
      { status: 500 }
    );
  }
} 