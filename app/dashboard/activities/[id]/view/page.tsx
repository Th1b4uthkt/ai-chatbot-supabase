import { ArrowLeft, Edit, MapPin, Clock, Tag, Star, Info, Mail, Phone, Globe, Building, Languages, CheckCircle, XCircle, Users, DollarSign, Accessibility, Baby, Dog, CreditCard, Smartphone, Coins } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { Activity, getCategoryDisplayName, getSubcategoryDisplayName } from '@/types/activity';
import { ActivityCategory, Subcategory, PriceIndicator } from '@/types/common';

export default async function ActivityViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
  
  // Fetch the activity being viewed (join base_items with activities)
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
    console.error('Error fetching base item:', baseItemError);
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
    // Consider showing an error message instead of redirecting immediately
    redirect('/dashboard/activities');
  }
  
  // Format data to match our Activity interface - Added explicit type casting
  const activity: Activity = {
    id: baseItemData.id,
    name: baseItemData.name,
    type: baseItemData.type as Activity['type'], // Cast to ItemType.ACTIVITY
    category: activityDetails.category as ActivityCategory,
    subcategory: activityDetails.subcategory as Subcategory,
    mainImage: baseItemData.main_image ?? '',
    galleryImages: baseItemData.gallery_images as string[] | undefined,
    shortDescription: baseItemData.short_description ?? '',
    longDescription: baseItemData.long_description ?? '',
    address: baseItemData.address ?? '',
    coordinates: baseItemData.coordinates as { latitude: number; longitude: number; } | undefined,
    area: baseItemData.area as string | undefined,
    contactInfo: baseItemData.contact_info as Activity['contactInfo'] ?? {},
    hours: (baseItemData.hours as string) ?? '',
    open24h: baseItemData.open_24h ?? undefined,
    rating: baseItemData.rating as Activity['rating'] | undefined, // Cast to expected type
    tags: baseItemData.tags as string[] ?? [],
    priceRange: baseItemData.price_range as PriceIndicator ?? PriceIndicator.VARIES,
    currency: baseItemData.currency ?? 'THB',
    features: baseItemData.features as string[] ?? [],
    languages: baseItemData.languages as string[] | undefined,
    updatedAt: baseItemData.updated_at ?? new Date().toISOString(), // Default to now if null
    isSponsored: baseItemData.is_sponsored ?? undefined,
    isFeatured: baseItemData.is_featured ?? undefined,
    paymentMethods: baseItemData.payment_methods as Activity['paymentMethods'] | undefined,
    accessibility: baseItemData.accessibility as Activity['accessibility'] | undefined,
    activityData: activityDetails.activity_data as Activity['activityData'] | undefined
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard/activities" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Activities</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{activity.name}</h1>
          <p className="text-muted-foreground mt-1">Activity details and management</p>
        </div>
        
        <Link href={`/dashboard/activities/${id}/edit`}>
          <Button>
            <Edit className="mr-2 size-4" />
            Edit Activity
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
              {activity.mainImage ? (
                <Image 
                  src={activity.mainImage} 
                  alt={activity.name}
                  width={500}
                  height={300}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-muted flex items-center justify-center">
                  <Building className="size-16 text-muted-foreground/50" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 capitalize" variant="default">
                {getCategoryDisplayName(activity.category)}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{activity.name}</CardTitle>
                {activity.rating && activity.rating.score > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{activity.rating.score.toFixed(1)}</span>
                    {activity.rating.reviewCount > 0 && (
                      <span className="text-xs text-muted-foreground">({activity.rating.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
              
              <CardDescription>
                {getSubcategoryDisplayName(activity.subcategory)}
              </CardDescription>
            </div>
          </CardHeader>
          
          <Separator className="my-2" />
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{activity.address || 'No location set'}</div>
                  {activity.coordinates && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {activity.coordinates.latitude.toFixed(6)}, {activity.coordinates.longitude.toFixed(6)}
                    </div>
                  )}
                  {activity.area && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Area: {activity.area}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{activity.hours || 'Hours not specified'}</div>
                  {activity.open24h && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Open 24 hours
                    </div>
                  )}
                </div>
              </div>
              
              {activity.contactInfo && (Object.keys(activity.contactInfo).length > 0) && (
                <div className="flex items-start gap-2 text-sm">
                  <Info className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    {activity.contactInfo.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="size-3" /> 
                        <span>{activity.contactInfo.phone}</span>
                      </div>
                    )}
                    {activity.contactInfo.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="size-3" /> 
                        <span>{activity.contactInfo.email}</span>
                      </div>
                    )}
                    {activity.contactInfo.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="size-3" /> 
                        <a 
                          href={activity.contactInfo.website.startsWith('http') ? activity.contactInfo.website : `https://${activity.contactInfo.website}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="size-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {activity.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">Last updated: {new Date(activity.updatedAt).toLocaleDateString()}</p>
          </CardFooter>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Short Description */}
              {activity.shortDescription && (
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{activity.shortDescription}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Long Description */}
              {activity.longDescription && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Use whitespace-pre-wrap to respect newlines from the input */}
                    <p className="text-sm whitespace-pre-wrap">{activity.longDescription}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Category Specific Info */}
              {activity.activityData && Object.keys(activity.activityData).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{getCategoryDisplayName(activity.category)} Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderCategorySpecificInfo(activity)}
                  </CardContent>
                </Card>
              )}
              
              {/* Features */}
              {activity.features && activity.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 list-disc list-inside text-sm">
                      {activity.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activity.paymentMethods ? (
                      <PaymentMethodsSection paymentMethods={activity.paymentMethods} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Not specified</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Accessibility */}
                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activity.accessibility ? (
                      <AccessibilitySection accessibility={activity.accessibility} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Not specified</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Languages Spoken */}
              {activity.languages && activity.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages Spoken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {activity.languages.map((lang: string, index: number) => (
                        <Badge key={index} variant="outline">
                          <Languages className="mr-1 size-3" /> {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                  <CardDescription>Images for {activity.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.galleryImages && activity.galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {activity.galleryImages.map((imgUrl: string, index: number) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                          <Image 
                            src={imgUrl}
                            alt={`${activity.name} gallery image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No gallery images available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Helper component for Payment Methods
function PaymentMethodsSection({ paymentMethods }: { paymentMethods: Activity['paymentMethods'] }) {
  if (!paymentMethods) return <p className="text-sm text-muted-foreground">Not specified</p>;

  const methods = [
    paymentMethods.cash && { icon: Coins, label: 'Cash' },
    paymentMethods.card && { icon: CreditCard, label: 'Card' },
    paymentMethods.mobilePay && { icon: Smartphone, label: 'Mobile Pay' }
  ].filter(Boolean) as { icon: React.ElementType, label: string }[]; // Filter out falsy values and assert type

  if (methods.length === 0) {
    return <p className="text-sm text-muted-foreground">Not specified</p>;
  }

  return (
    <div className="space-y-2">
      {methods.map((method) => (
        <PaymentMethodItem key={method.label} icon={method.icon} label={method.label} />
      ))}
    </div>
  );
}

function PaymentMethodItem({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span>{label} Accepted</span>
    </div>
  );
}

// Helper component for Accessibility
function AccessibilitySection({ accessibility }: { accessibility: Activity['accessibility'] }) {
  if (!accessibility) return <p className="text-sm text-muted-foreground">Not specified</p>;

  const items = [
    { title: 'Wheelchair Accessible', available: accessibility.wheelchairAccessible },
    { title: 'Family Friendly', available: accessibility.familyFriendly },
    { title: 'Pet Friendly', available: accessibility.petFriendly }
  ];

  return (
    <div className="space-y-2">
      {items.map(item => (
        <AccessibilityItem key={item.title} title={item.title} available={item.available} />
      ))}
    </div>
  );
}

function AccessibilityItem({ title, available }: { title: string, available?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {available === true ? (
        <CheckCircle className="size-4 text-green-600" />
      ) : available === false ? (
        <XCircle className="size-4 text-red-600" />
      ) : (
        <span className="size-4 inline-block"></span> // Placeholder if undefined
      )}
      <span>{title}</span>
    </div>
  );
}

// Helper to render category-specific info
function renderCategorySpecificInfo(activity: Activity) {
  const data = activity.activityData;
  if (!data || Object.keys(data).length === 0) return <p className="text-sm text-muted-foreground">No specific details available.</p>;

  // Define a type for activity items in Leisure category for clarity
  type LeisureActivityItem = {
    name: string;
    duration: string;
    price: number;
    skillLevel?: string;
  };

  // Define a type for event items in Culture category
  type CultureEventItem = {
    name: string;
    date: string;
    ticketPrice?: number;
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Food & Drink */}
      {activity.category === ActivityCategory.FOOD_DRINK && (
        <>
          {data.cuisine && data.cuisine.length > 0 && (
            <InfoItem label="Cuisine" value={data.cuisine.join(', ')} />
          )}
          {data.specialties && data.specialties.length > 0 && (
            <InfoItem label="Specialties" value={data.specialties.join(', ')} />
          )}
          {typeof data.takeAway === 'boolean' && (
            <InfoItem label="Take Away" value={data.takeAway ? 'Yes' : 'No'} />
          )}
          {typeof data.delivery === 'boolean' && (
            <InfoItem label="Delivery" value={data.delivery ? 'Yes' : 'No'} />
          )}
          {typeof data.reservation === 'boolean' && (
            <InfoItem label="Reservation" value={data.reservation ? 'Recommended' : 'Not Required'} />
          )}
          {data.happyHour?.available && (
            <InfoItem label="Happy Hour" value={data.happyHour.time || 'Available'} />
          )}
          {data.dietaryOptions && data.dietaryOptions.length > 0 && (
            <InfoItem label="Dietary Options" value={data.dietaryOptions.join(', ')} />
          )}
          {data.atmosphere && data.atmosphere.length > 0 && (
            <InfoItem label="Atmosphere" value={data.atmosphere.join(', ')} />
          )}
        </>
      )}
      
      {/* Leisure */}
      {activity.category === ActivityCategory.LEISURE && (
        <>
          {data.activityType && <InfoItem label="Activity Type" value={data.activityType} />}
          {data.activities && data.activities.length > 0 && (
            <div>
              <p className="font-medium mb-1">Activities Offered:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {(data.activities as LeisureActivityItem[]).map((act: LeisureActivityItem, index: number) => (
                  <li key={index}>
                    {act.name} ({act.duration}, {act.price} {activity.currency})
                    {act.skillLevel && ` - Level: ${act.skillLevel}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typeof data.equipmentIncluded === 'boolean' && (
            <InfoItem label="Equipment Included" value={data.equipmentIncluded ? 'Yes' : 'No'} />
          )}
          {typeof data.bookingRequired === 'boolean' && (
            <InfoItem label="Booking Required" value={data.bookingRequired ? 'Yes' : 'Recommended'} />
          )}
          {data.minimumAge && <InfoItem label="Minimum Age" value={data.minimumAge.toString()} />}
          {typeof data.weatherDependent === 'boolean' && (
            <InfoItem label="Weather Dependent" value={data.weatherDependent ? 'Yes' : 'No'} />
          )}
        </>
      )}
      
      {/* Culture */}
      {activity.category === ActivityCategory.CULTURE && (
        <>
          {data.venueType && <InfoItem label="Venue Type" value={data.venueType} />}
          {data.upcomingEvents && data.upcomingEvents.length > 0 && (
            <div>
              <p className="font-medium mb-1">Upcoming Events:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {(data.upcomingEvents as CultureEventItem[]).map((event: CultureEventItem, index: number) => (
                  <li key={index}>
                    {event.name} ({new Date(event.date).toLocaleDateString()})
                    {event.ticketPrice && ` - ${event.ticketPrice} ${activity.currency}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typeof data.workshopsAvailable === 'boolean' && (
            <InfoItem label="Workshops Available" value={data.workshopsAvailable ? 'Yes' : 'No'} />
          )}
          {typeof data.photographyAllowed === 'boolean' && (
            <InfoItem label="Photography" value={data.photographyAllowed ? 'Allowed' : 'Restricted'} />
          )}
        </>
      )}
      
      {/* Shopping */}
      {activity.category === ActivityCategory.SHOPPING && (
        <>
          {data.productTypes && data.productTypes.length > 0 && (
            <InfoItem label="Product Types" value={data.productTypes.join(', ')} />
          )}
          {data.specialProducts && data.specialProducts.length > 0 && (
            <InfoItem label="Special Products" value={data.specialProducts.join(', ')} />
          )}
          {typeof data.priceNegotiation === 'boolean' && (
            <InfoItem label="Price Negotiation" value={data.priceNegotiation ? 'Possible' : 'Fixed Prices'} />
          )}
          {typeof data.localCrafts === 'boolean' && (
            <InfoItem label="Local Crafts" value={data.localCrafts ? 'Available' : 'Not Featured'} />
          )}
        </>
      )}
    </div>
  );
}

// Generic info item component
function InfoItem({ label, value }: { label: string; value: string | number | boolean }) {
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{displayValue}</span>
    </div>
  );
} 