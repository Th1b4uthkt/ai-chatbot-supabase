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

// GET /api/dashboard/services - Get all services
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
      .eq('type', 'service');

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
    
    // Fetch all service details for these base items
    const serviceIds = baseItemsData.map(item => item.id);
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('id, category, subcategory, service_data')
      .in('id', serviceIds);
    
    if (servicesError) throw servicesError;
    
    // Apply category filter if provided - needs to be done after fetching services
    let filteredData = baseItemsData;
    if (category && servicesData) {
      const filteredServiceIds = servicesData
        .filter(service => service.category === category)
        .map(service => service.id);
      
      filteredData = baseItemsData.filter(item => 
        filteredServiceIds.includes(item.id)
      );
    }
    
    // Create a map of service details for easier lookup
    const serviceDetailsMap = new Map();
    servicesData?.forEach(service => {
      serviceDetailsMap.set(service.id, service);
    });
    
    // Combine the data from both tables
    const combinedData = filteredData.map(item => {
      const serviceDetails = serviceDetailsMap.get(item.id);
      
      if (!serviceDetails) {
        return null;
      }
      
      return {
        ...item,
        services: [serviceDetails]
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
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/services - Create a new service
export async function POST(request: NextRequest) {
  // Validate admin access
  const auth = await validateAdminAccess(request);
  
  // Return error response if authentication or authorization failed
  if (auth.response) {
    return auth.response;
  }
  
  const { supabase } = auth;

  try {
    const serviceData = await request.json();
    
    // Start a Supabase transaction to insert into multiple tables
    // First insert into base_items
    const { data: baseItemData, error: baseItemError } = await supabase
      .from('base_items')
      .insert({
        name: serviceData.name,
        type: 'service',
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
      })
      .select()
      .single();

    if (baseItemError) throw baseItemError;
    
    // Then insert into services with the ID from base_items
    const { data: serviceDetailsData, error: serviceDetailsError } = await supabase
      .from('services')
      .insert({
        id: baseItemData.id,
        category: serviceData.category,
        subcategory: serviceData.subcategory,
        service_data: serviceData.serviceData || {}
      })
      .select()
      .single();
      
    if (serviceDetailsError) {
      // If service insert fails, try to delete the base item to avoid orphaned records
      await supabase.from('base_items').delete().eq('id', baseItemData.id);
      throw serviceDetailsError;
    }

    // Combine the data for response
    const responseData = {
      ...baseItemData,
      services: [serviceDetailsData]
    };

    return NextResponse.json({ data: responseData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
} 