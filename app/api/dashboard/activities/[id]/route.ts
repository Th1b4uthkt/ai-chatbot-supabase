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

// GET /api/dashboard/activities/[id] - Get a specific activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;
  const { id } = await params;
  const activityId = id;

  try {
    // Fetch the base item data
    const { data: baseItemData, error: baseItemError } = await supabase
      .from('base_items')
      .select(`
        id, name, type, short_description, long_description, main_image,
        gallery_images, address, coordinates, area, contact_info, hours,
        open_24h, rating, tags, price_range, currency, features, languages,
        updated_at, is_sponsored, is_featured, payment_methods, accessibility
      `)
      .eq('id', activityId)
      .eq('type', 'activity')
      .single();

    if (baseItemError) throw baseItemError;

    if (!baseItemData) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    
    // Fetch the activity-specific details
    const { data: activityDetails, error: activityError } = await supabase
      .from('activities')
      .select('category, subcategory, activity_data')
      .eq('id', activityId)
      .single();
      
    if (activityError) throw activityError;
    
    if (!activityDetails) {
      return NextResponse.json({ error: 'Activity details not found' }, { status: 404 });
    }

    // Format data for response
    const formattedActivity = {
      id: baseItemData.id,
      name: baseItemData.name,
      type: baseItemData.type,
      category: activityDetails.category,
      subcategory: activityDetails.subcategory,
      mainImage: baseItemData.main_image,
      galleryImages: baseItemData.gallery_images || [],
      shortDescription: baseItemData.short_description,
      longDescription: baseItemData.long_description,
      address: baseItemData.address,
      coordinates: baseItemData.coordinates,
      area: baseItemData.area,
      contactInfo: baseItemData.contact_info || {},
      hours: baseItemData.hours,
      open24h: baseItemData.open_24h,
      rating: baseItemData.rating,
      tags: baseItemData.tags || [],
      priceRange: baseItemData.price_range,
      currency: baseItemData.currency || 'THB',
      features: baseItemData.features || [],
      languages: baseItemData.languages || [],
      updatedAt: baseItemData.updated_at,
      isSponsored: baseItemData.is_sponsored,
      isFeatured: baseItemData.is_featured,
      paymentMethods: baseItemData.payment_methods,
      accessibility: baseItemData.accessibility,
      activityData: activityDetails.activity_data
    };

    return NextResponse.json({ data: formattedActivity });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/activities/[id] - Update an activity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;
  const { id } = await params;
  const activityId = id;

  try {
    const activityData = await request.json();
    
    // Update base_items table
    const { data: baseItemData, error: baseItemError } = await supabase
      .from('base_items')
      .update({
        name: activityData.name,
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
        updated_at: new Date().toISOString()
      })
      .eq('id', activityId)
      .select()
      .single();

    if (baseItemError) throw baseItemError;
    
    // Update activities table
    const { data: activityDetailsData, error: activityDetailsError } = await supabase
      .from('activities')
      .update({
        category: activityData.category,
        subcategory: activityData.subcategory,
        activity_data: activityData.activityData || {}
      })
      .eq('id', activityId)
      .select()
      .single();
      
    if (activityDetailsError) throw activityDetailsError;

    // Combine the data for response
    const responseData = {
      ...baseItemData,
      activities: [activityDetailsData]
    };

    return NextResponse.json({ data: responseData });
  } catch (error: any) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/activities/[id] - Delete an activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;
  const { id } = await params;
  const activityId = id;

  try {
    // Delete from activities first due to foreign key constraint
    const { error: activityDeleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
      
    if (activityDeleteError) throw activityDeleteError;
    
    // Then delete from base_items
    const { error: baseItemDeleteError } = await supabase
      .from('base_items')
      .delete()
      .eq('id', activityId);
      
    if (baseItemDeleteError) throw baseItemDeleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete activity' },
      { status: 500 }
    );
  }
} 