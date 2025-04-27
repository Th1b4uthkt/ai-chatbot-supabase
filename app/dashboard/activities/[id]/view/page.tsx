import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Clock, 
  Tag,
  Star,
  Info,
  Mail,
  Phone,
  Globe,
  Building,
  Languages
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Activity, getCategoryDisplayName, getSubcategoryDisplayName } from '@/types/activity';
import { ActivityCategory, Subcategory, PriceIndicator } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default async function ActivityViewPage({
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
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard/activities" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
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
            <Edit className="mr-2 h-4 w-4" />
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
                <img 
                  src={activity.mainImage} 
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Building className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 capitalize" variant="default">
                {getCategoryDisplayName(activity.category as ActivityCategory)}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{activity.name}</CardTitle>
                {activity.rating && activity.rating.score > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{activity.rating.score.toFixed(1)}</span>
                    {activity.rating.reviewCount > 0 && (
                      <span className="text-xs text-muted-foreground">({activity.rating.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
              
              <CardDescription>
                {getSubcategoryDisplayName(activity.subcategory as Subcategory)}
              </CardDescription>
            </div>
          </CardHeader>
          
          <Separator className="my-2" />
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{activity.address || 'No location set'}</div>
                  {activity.coordinates && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {activity.coordinates.latitude}, {activity.coordinates.longitude}
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
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{activity.hours || 'Hours not specified'}</div>
                  {activity.open24h && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Open 24 hours
                    </div>
                  )}
                </div>
              </div>
              
              {activity.contactInfo && (
                <div className="flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    {activity.contactInfo.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> 
                        <span>{activity.contactInfo.phone}</span>
                      </div>
                    )}
                    {activity.contactInfo.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> 
                        <span>{activity.contactInfo.email}</span>
                      </div>
                    )}
                    {activity.contactInfo.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> 
                        <a href={activity.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {activity.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="w-full">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price Range:</span>
                  <Badge>{activity.priceRange}</Badge>
                </div>
                
                {activity.languages && activity.languages.length > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Languages:</span>
                    </div>
                    <div className="text-sm">
                      {activity.languages.join(', ')}
                    </div>
                  </div>
                )}
                
                {activity.updatedAt && (
                  <div className="text-xs text-right text-muted-foreground">
                    Last updated: {new Date(activity.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Tabs content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="category-specific">Category Info</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <h3 className="text-base font-medium mb-2">Short Description</h3>
                    <p className="mb-4">{activity.shortDescription}</p>
                    
                    <h3 className="text-base font-medium mb-2">Long Description</h3>
                    <p className="whitespace-pre-wrap">{activity.longDescription}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Features</CardTitle>
                  <CardDescription>Key features and amenities</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.features && activity.features.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activity.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="bg-muted/40 p-3 rounded-md text-sm flex items-center gap-2"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
                      <div className="text-center">
                        <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground">No features specified</p>
                      </div>
                    </div>
                  )}
                  
                  {activity.accessibility && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium mb-4">Accessibility</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <AccessibilityItem 
                          title="Wheelchair Accessible" 
                          available={activity.accessibility.wheelchairAccessible} 
                        />
                        <AccessibilityItem 
                          title="Family Friendly" 
                          available={activity.accessibility.familyFriendly} 
                        />
                        <AccessibilityItem 
                          title="Pet Friendly" 
                          available={activity.accessibility.petFriendly} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {activity.paymentMethods && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium mb-4">Payment Methods</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <AccessibilityItem 
                          title="Cash" 
                          available={activity.paymentMethods.cash} 
                        />
                        <AccessibilityItem 
                          title="Card" 
                          available={activity.paymentMethods.card} 
                        />
                        <AccessibilityItem 
                          title="Mobile Payment" 
                          available={activity.paymentMethods.mobilePay} 
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Category Specific Tab */}
            <TabsContent value="category-specific" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getCategoryDisplayName(activity.category as ActivityCategory)} Specific Information
                  </CardTitle>
                  <CardDescription>
                    Details specific to {getCategoryDisplayName(activity.category as ActivityCategory)} activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCategorySpecificInfo(activity)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Component for accessibility/feature items
function AccessibilityItem({ title, available }: { title: string, available?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-md text-center">
      <div className={`h-3 w-3 rounded-full mb-2 ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{available ? 'Available' : 'Not available'}</p>
    </div>
  );
}

// Render different content based on activity category
function renderCategorySpecificInfo(activity: Activity) {
  const category = activity.category as ActivityCategory;
  const activityData = activity.activityData || {};
  
  switch (category) {
    case ActivityCategory.FOOD_DRINK:
      return (
        <div className="space-y-6">
          {activityData.cuisine && activityData.cuisine.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Cuisine</h3>
              <div className="flex flex-wrap gap-2">
                {activityData.cuisine.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Dining Options</h3>
              <div className="space-y-1">
                <p className="text-sm">Take Away: {activityData.takeAway ? 'Available' : 'Not available'}</p>
                <p className="text-sm">Delivery: {activityData.delivery ? 'Available' : 'Not available'}</p>
                <p className="text-sm">Reservation: {activityData.reservation ? 'Accepted' : 'Not needed'}</p>
              </div>
            </div>
            
            {activityData.happyHour && (
              <div>
                <h3 className="text-sm font-medium mb-2">Happy Hour</h3>
                <p className="text-sm">{activityData.happyHour.available ? `Yes - ${activityData.happyHour.time || ''}` : 'Not available'}</p>
              </div>
            )}
          </div>
          
          {activityData.dietaryOptions && activityData.dietaryOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Dietary Options</h3>
              <div className="flex flex-wrap gap-2">
                {activityData.dietaryOptions.map((option: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {activityData.atmosphere && activityData.atmosphere.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Atmosphere</h3>
              <div className="flex flex-wrap gap-2">
                {activityData.atmosphere.map((item: string, index: number) => (
                  <span key={index} className="bg-muted/40 px-2 py-1 rounded text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    
    case ActivityCategory.LEISURE:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Activity Type</h3>
              <p className="text-sm font-medium">{activityData.activityType}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Requirements</h3>
              <div className="space-y-1">
                <p className="text-sm">Equipment Included: {activityData.equipmentIncluded ? 'Yes' : 'No'}</p>
                <p className="text-sm">Booking Required: {activityData.bookingRequired ? 'Yes' : 'No'}</p>
                {activityData.minimumAge && (
                  <p className="text-sm">Minimum Age: {activityData.minimumAge}</p>
                )}
                <p className="text-sm">Weather Dependent: {activityData.weatherDependent ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
          
          {activityData.activities && activityData.activities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Available Activities</h3>
              <div className="space-y-2">
                {activityData.activities.map((act: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{act.name}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Duration: {act.duration}</span>
                        {act.skillLevel && (
                          <span>Level: {act.skillLevel}</span>
                        )}
                      </div>
                    </div>
                    <Badge>
                      {activity.currency} {act.price}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
    case ActivityCategory.CULTURE:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Venue Type</h3>
            <Badge variant="outline" className="capitalize">
              {activityData.venueType}
            </Badge>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 p-2 rounded text-sm">
                Workshops Available: {activityData.workshopsAvailable ? 'Yes' : 'No'}
              </div>
              <div className="bg-muted/40 p-2 rounded text-sm">
                Photography Allowed: {activityData.photographyAllowed ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          
          {activityData.upcomingEvents && activityData.upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Upcoming Events</h3>
              <div className="space-y-2">
                {activityData.upcomingEvents.map((event: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <p className="font-medium">{event.name}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      {event.ticketPrice && (
                        <Badge>
                          {activity.currency} {event.ticketPrice}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
    case ActivityCategory.SHOPPING:
      return (
        <div className="space-y-6">
          {activityData.productTypes && activityData.productTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Product Types</h3>
              <div className="flex flex-wrap gap-2">
                {activityData.productTypes.map((type: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {activityData.specialProducts && activityData.specialProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Special Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {activityData.specialProducts.map((product: string, index: number) => (
                  <div key={index} className="bg-muted/40 p-2 rounded text-sm">
                    {product}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Shopping Features</h3>
              <div className="space-y-1">
                <p className="text-sm">Price Negotiation: {activityData.priceNegotiation ? 'Possible' : 'Fixed prices'}</p>
                <p className="text-sm">Local Crafts: {activityData.localCrafts ? 'Available' : 'Not available'}</p>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
          <div className="text-center">
            <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No specific information available for this category</p>
          </div>
        </div>
      );
  }
} 