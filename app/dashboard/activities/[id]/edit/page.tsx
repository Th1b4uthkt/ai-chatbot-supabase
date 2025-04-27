import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ActivityEditForm } from '@/components/dashboard/activity-edit-form';
import { Activity } from '@/types/activity';
import { ActivityCategory, Subcategory } from '@/types/common';

export default async function EditActivityPage({
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
  
  // Fetch the activity being edited (join base_items with activities)
  const { data: baseItemData, error: baseItemError } = await supabase
    .from('base_items')
    .select(`
      id, name, type, short_description, long_description, main_image,
      gallery_images, address, coordinates, area, contact_info, hours,
      open_24h, rating, tags, price_range, currency, features, languages,
      updated_at, is_sponsored, is_featured, payment_methods, accessibility
    `)
    .eq('id', id)
    .eq('type', 'activity')
    .single();
  
  if (baseItemError || !baseItemData) {
    redirect('/dashboard/activities');
  }
  
  // Get the activity-specific details
  const { data: activityDetails, error: activityError } = await supabase
    .from('activities')
    .select('category, subcategory, activity_data')
    .eq('id', id)
    .single();
    
  if (activityError || !activityDetails) {
    console.error('Error fetching activity details:', activityError);
    redirect('/dashboard/activities');
  }
  
  // Format data to match our Activity interface
  const activity: Activity = {
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
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link 
          href={`/dashboard/activities/${id}/view`}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Activity Details</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Activity: {activity.name}
        </h1>
        <p className="text-muted-foreground">
          Update activity information and details
        </p>
      </div>
      
      <div className="bg-card/50 backdrop-blur border rounded-lg p-6 shadow-sm">
        <ActivityEditForm 
          activity={activity} 
          redirectUrl={`/dashboard/activities/${id}/view`}
        />
      </div>
    </div>
  );
} 