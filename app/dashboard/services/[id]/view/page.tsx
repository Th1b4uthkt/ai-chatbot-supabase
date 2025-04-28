import {
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  Edit,
  Globe,
  Info,
  Languages,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { ServiceCategory, Subcategory, PriceIndicator } from '@/types/common';
import { ServiceType, getCategoryDisplayName, getSubcategoryDisplayName } from '@/types/services';

export default async function ServiceViewPage({
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
  
  // Fetch the service being viewed (join base_items with services)
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
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard/services" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Services</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <p className="text-muted-foreground mt-1">Service details and management</p>
        </div>
        
        <Link href={`/dashboard/services/${id}/edit`}>
          <Button>
            <Edit className="mr-2 size-4" />
            Edit Service
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
              {service.mainImage ? (
                <Image
                  src={service.mainImage} 
                  alt={service.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="size-full"
                />
              ) : (
                <div className="size-full bg-muted flex items-center justify-center">
                  <Building className="size-16 text-muted-foreground/50" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 capitalize" variant="default">
                {getCategoryDisplayName(service.category as ServiceCategory)}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{service.name}</CardTitle>
                {service.rating && service.rating.score > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{service.rating.score.toFixed(1)}</span>
                    {service.rating.reviewCount > 0 && (
                      <span className="text-xs text-muted-foreground">({service.rating.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
              
              <CardDescription>
                {getSubcategoryDisplayName(service.subcategory as Subcategory)}
              </CardDescription>
            </div>
          </CardHeader>
          
          <Separator className="my-2" />
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{service.address || 'No location set'}</div>
                  {service.coordinates && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {service.coordinates.latitude}, {service.coordinates.longitude}
                    </div>
                  )}
                  {service.area && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Area: {service.area}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{service.hours || 'Hours not specified'}</div>
                  {service.open24h && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Open 24 hours
                    </div>
                  )}
                </div>
              </div>
              
              {service.contactInfo && (
                <div className="flex items-start gap-2 text-sm">
                  <Info className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    {service.contactInfo.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="size-3" /> 
                        <span>{service.contactInfo.phone}</span>
                      </div>
                    )}
                    {service.contactInfo.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="size-3" /> 
                        <span>{service.contactInfo.email}</span>
                      </div>
                    )}
                    {service.contactInfo.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="size-3" /> 
                        <a href={service.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {service.tags && service.tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="size-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {service.tags.map((tag, index) => (
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
                  <Badge>{service.priceRange}</Badge>
                </div>
                
                {service.languages && service.languages.length > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Languages className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Languages:</span>
                    </div>
                    <div className="text-sm">
                      {service.languages.join(', ')}
                    </div>
                  </div>
                )}
                
                {service.updatedAt && (
                  <div className="text-xs text-right text-muted-foreground">
                    Last updated: {new Date(service.updatedAt).toLocaleDateString()}
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
                  <CardTitle className="text-lg">Service Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <h3 className="text-base font-medium mb-2">Short Description</h3>
                    <p className="mb-4">{service.shortDescription}</p>
                    
                    <h3 className="text-base font-medium mb-2">Long Description</h3>
                    <p className="whitespace-pre-wrap">{service.longDescription}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Features</CardTitle>
                  <CardDescription>Key features and amenities</CardDescription>
                </CardHeader>
                <CardContent>
                  {service.features && service.features.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {service.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="bg-muted/40 p-3 rounded-md text-sm flex items-center gap-2"
                        >
                          <div className="size-2 rounded-full bg-primary"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
                      <div className="text-center">
                        <Info className="size-8 mx-auto mb-2" />
                        <p className="text-muted-foreground">No features specified</p>
                      </div>
                    </div>
                  )}
                  
                  {service.accessibility && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium mb-4">Accessibility</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <AccessibilityItem 
                          title="Wheelchair Accessible" 
                          available={service.accessibility.wheelchairAccessible} 
                        />
                        <AccessibilityItem 
                          title="Family Friendly" 
                          available={service.accessibility.familyFriendly} 
                        />
                        <AccessibilityItem 
                          title="Pet Friendly" 
                          available={service.accessibility.petFriendly} 
                        />
                      </div>
                    </div>
                  )}
                  
                  {service.paymentMethods && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium mb-4">Payment Methods</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <AccessibilityItem 
                          title="Cash" 
                          available={service.paymentMethods.cash} 
                        />
                        <AccessibilityItem 
                          title="Card" 
                          available={service.paymentMethods.card} 
                        />
                        <AccessibilityItem 
                          title="Mobile Payment" 
                          available={service.paymentMethods.mobilePay} 
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
                    {getCategoryDisplayName(service.category as ServiceCategory)} Specific Information
                  </CardTitle>
                  <CardDescription>
                    Details specific to {getCategoryDisplayName(service.category as ServiceCategory)} services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCategorySpecificInfo(service)}
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

// Render different content based on service category
function renderCategorySpecificInfo(service: ServiceType) {
  const category = service.category as ServiceCategory;
  const serviceData = service.serviceData;
  
  switch (category) {
    case ServiceCategory.ACCOMMODATION:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Check-in / Check-out</h3>
              <p className="text-sm">Check-in: {serviceData.checkIn || 'Not specified'}</p>
              <p className="text-sm">Check-out: {serviceData.checkOut || 'Not specified'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Location</h3>
              <p className="text-sm">
                Distance to beach: {serviceData.distanceToBeach ? `${serviceData.distanceToBeach}m` : 'Not specified'}
              </p>
            </div>
          </div>
          
          {serviceData.cancellationPolicy && (
            <div>
              <h3 className="text-sm font-medium mb-2">Cancellation Policy</h3>
              <p className="text-sm">{serviceData.cancellationPolicy}</p>
            </div>
          )}
          
          {serviceData.roomTypes && serviceData.roomTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Room Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceData.roomTypes.map((room: any, index: number) => (
                  <Card key={index} className="bg-muted/30">
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">{room.name}</CardTitle>
                        <Badge variant="outline">
                          {service.currency} {room.pricePerNight}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                      <p className="text-sm mb-2">
                        <span className="text-muted-foreground">Capacity:</span> {room.capacity} guests
                      </p>
                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((amenity: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    
    case ServiceCategory.HEALTH:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Emergency Services</h3>
              <p className="text-sm">Emergency available: {serviceData.emergencyService ? 'Yes' : 'No'}</p>
              {serviceData.emergencyNumber && (
                <p className="text-sm mt-1">
                  Emergency number: <span className="font-medium">{serviceData.emergencyNumber}</span>
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Appointments</h3>
              <p className="text-sm">Walk-in accepted: {serviceData.walkInAccepted ? 'Yes' : 'No'}</p>
              {serviceData.insuranceAccepted && serviceData.insuranceAccepted.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Insurance accepted:</p>
                  <div className="flex flex-wrap gap-1">
                    {serviceData.insuranceAccepted.map((insurance: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {insurance}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {serviceData.services && serviceData.services.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Services Offered</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {serviceData.services.map((item: string, index: number) => (
                  <div key={index} className="bg-muted/40 p-2 rounded text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {serviceData.specialists && serviceData.specialists.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Specialists</h3>
              <div className="space-y-3">
                {serviceData.specialists.map((specialist: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <p className="font-medium">{specialist.name}</p>
                    <p className="text-sm text-muted-foreground mb-1">{specialist.specialization}</p>
                    {specialist.languages && (
                      <div className="flex items-center gap-1 text-xs">
                        <Languages className="size-3" />
                        <span>{specialist.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
    case ServiceCategory.WELLNESS:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Booking Information</h3>
            <p className="text-sm">
              Booking required: {serviceData.bookingRequired ? 'Yes' : 'No'}
            </p>
          </div>
          
          {serviceData.specialties && serviceData.specialties.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {serviceData.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {serviceData.treatments && serviceData.treatments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Treatments</h3>
              <div className="space-y-2">
                {serviceData.treatments.map((treatment: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{treatment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {treatment.duration} minutes
                      </p>
                    </div>
                    <Badge>
                      {service.currency} {treatment.price}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
    case ServiceCategory.MOBILITY:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Service Type</h3>
            <Badge variant="outline" className="capitalize">
              {serviceData.serviceType || 'Not specified'}
            </Badge>
          </div>
          
          {serviceData.rentalRequirements && serviceData.rentalRequirements.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Rental Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {serviceData.rentalRequirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {serviceData.vehicles && serviceData.vehicles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Vehicles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceData.vehicles.map((vehicle: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <p className="font-medium">{vehicle.type}</p>
                    {vehicle.pricePerDay && (
                      <p className="text-sm">
                        Price per day: {service.currency} {vehicle.pricePerDay}
                      </p>
                    )}
                    {vehicle.pricePerTrip && (
                      <p className="text-sm">
                        Price per trip: {service.currency} {vehicle.pricePerTrip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {serviceData.routes && serviceData.routes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Routes</h3>
              <div className="space-y-2">
                {serviceData.routes.map((route: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">
                        {route.from} → {route.to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {route.duration}
                      </p>
                    </div>
                    <Badge>
                      {service.currency} {route.price}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
    case ServiceCategory.REAL_ESTATE:
      return (
        <div className="space-y-6">
          {serviceData.yearsInBusiness && (
            <div>
              <h3 className="text-sm font-medium mb-2">Experience</h3>
              <p className="text-sm">
                Years in business: {serviceData.yearsInBusiness}
              </p>
            </div>
          )}
          
          {serviceData.servicesOffered && serviceData.servicesOffered.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Services Offered</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {serviceData.servicesOffered.map((item: string, index: number) => (
                  <div key={index} className="bg-muted/40 p-2 rounded text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {serviceData.propertySamples && serviceData.propertySamples.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Property Samples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceData.propertySamples.map((property: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <p className="font-medium">{property.type}</p>
                    {property.bedrooms && (
                      <p className="text-sm">
                        Bedrooms: {property.bedrooms}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Price range: {property.priceRange}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
    default:
      return (
        <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
          <div className="text-center">
            <Info className="size-8 mx-auto mb-2" />
            <p className="text-muted-foreground">No specific information available for this category</p>
          </div>
        </div>
      );
  }
} 