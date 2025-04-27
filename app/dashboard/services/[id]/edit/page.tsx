import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ServiceEditForm } from '@/components/dashboard/service-edit-form';
import { ServiceType } from '@/types/services';
import { ServiceCategory, Subcategory } from '@/types/common';

export default async function EditServicePage({
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
  
  // Fetch the service being edited (join base_items with services)
  const { data: baseItemData, error: baseItemError } = await supabase
    .from('base_items')
    .select(`
      id, name, type, short_description, long_description, main_image,
      gallery_images, address, coordinates, area, contact_info, hours,
      open_24h, rating, tags, price_range, currency, features, languages,
      updated_at, is_sponsored, is_featured, payment_methods, accessibility
    `)
    .eq('id', id)
    .eq('type', 'service')
    .single();
  
  if (baseItemError || !baseItemData) {
    redirect('/dashboard/services');
  }
  
  // Get the service-specific details
  const { data: serviceDetails, error: serviceError } = await supabase
    .from('services')
    .select('category, subcategory, service_data')
    .eq('id', id)
    .single();
    
  if (serviceError || !serviceDetails) {
    console.error('Error fetching service details:', serviceError);
    redirect('/dashboard/services');
  }
  
  // Format data to match our ServiceType interface
  const service: ServiceType = {
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
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link 
          href={`/dashboard/services/${id}/view`}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Service Details</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Service: {service.name}
        </h1>
        <p className="text-muted-foreground">
          Update service information and details
        </p>
      </div>
      
      <div className="bg-card/50 backdrop-blur border rounded-lg p-6 shadow-sm">
        <ServiceEditForm 
          service={service} 
          redirectUrl={`/dashboard/services/${id}/view`}
        />
      </div>
    </div>
  );
} 