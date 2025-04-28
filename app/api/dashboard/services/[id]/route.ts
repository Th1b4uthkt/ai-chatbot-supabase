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

// GET /api/dashboard/services/[id] - Get a specific service
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
  const serviceId = id;

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
      .eq('id', serviceId)
      .eq('type', 'service')
      .single();

    if (baseItemError) throw baseItemError;

    if (!baseItemData) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Fetch the service-specific details
    const { data: serviceDetails, error: serviceError } = await supabase
      .from('services')
      .select('category, subcategory, service_data')
      .eq('id', serviceId)
      .single();
      
    if (serviceError) throw serviceError;
    
    if (!serviceDetails) {
      return NextResponse.json({ error: 'Service details not found' }, { status: 404 });
    }

    // Format data for response
    const formattedService = {
      id: baseItemData.id,
      name: baseItemData.name,
      type: baseItemData.type,
      category: serviceDetails.category,
      subcategory: serviceDetails.subcategory,
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
      serviceData: serviceDetails.service_data
    };

    return NextResponse.json({ data: formattedService });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/services/[id] - Update a service
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
  const serviceId = id;

  try {
    const serviceData = await request.json();
    
    // Update base_items table
    const { data: baseItemData, error: baseItemError } = await supabase
      .from('base_items')
      .update({
        name: serviceData.name,
        short_description: serviceData.shortDescription,
        long_description: serviceData.longDescription,
        main_image: serviceData.mainImage,
        gallery_images: serviceData.galleryImages,
        address: serviceData.address,
        coordinates: serviceData.coordinates,
        area: serviceData.area,
        contact_info: serviceData.contactInfo,
        hours: serviceData.hours,
        open_24h: serviceData.open24h,
        rating: serviceData.rating,
        tags: serviceData.tags,
        price_range: serviceData.priceRange,
        currency: serviceData.currency,
        features: serviceData.features,
        languages: serviceData.languages,
        is_sponsored: serviceData.isSponsored,
        is_featured: serviceData.isFeatured,
        payment_methods: serviceData.paymentMethods,
        accessibility: serviceData.accessibility,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .single();

    if (baseItemError) throw baseItemError;
    
    // Update services table
    const { data: serviceDetailsData, error: serviceDetailsError } = await supabase
      .from('services')
      .update({
        category: serviceData.category,
        subcategory: serviceData.subcategory,
        service_data: serviceData.serviceData || {}
      })
      .eq('id', serviceId)
      .select()
      .single();
      
    if (serviceDetailsError) throw serviceDetailsError;

    // Combine the data for response
    const responseData = {
      ...baseItemData,
      services: [serviceDetailsData]
    };

    return NextResponse.json({ data: responseData });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/services/[id] - Delete a service
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
  const serviceId = id;

  try {
    // Delete from services first due to foreign key constraint
    const { error: serviceDeleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
      
    if (serviceDeleteError) throw serviceDeleteError;
    
    // Then delete from base_items
    const { error: baseItemDeleteError } = await supabase
      .from('base_items')
      .delete()
      .eq('id', serviceId);
      
    if (baseItemDeleteError) throw baseItemDeleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
} 