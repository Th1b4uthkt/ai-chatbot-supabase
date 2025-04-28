import { ArrowLeft, Ban, Calendar, Clock, Coffee, Edit, Globe, Info, Mail, MapPin, ParkingSquare, Phone, Repeat, Star, Tag, Ticket, Users, Wifi } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { EventType } from '@/types/events';

// Format dates
function formatDate(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleDateString('en-GB');
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

// Format time
function formatTime(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error('Error formatting time:', e);
    return dateString;
  }
}

// Define the type for a single ticket directly from its known structure
type TicketItem = { 
    name: string; 
    price: string; 
    description?: string; 
}; 
// Define the type for facilities based on EventType structure
type FacilitiesType = EventType['facilities'];
// Define the type for organizer based on EventType structure
type OrganizerType = EventType['organizer'];

export default async function EventViewPage({
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
  
  // Fetch the event being viewed
  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!eventData) {
    redirect('/dashboard/events');
  }
  
  // Safely parse JSON and construct the event object with defaults
  let facilitiesData: FacilitiesType = {};
  try {
      facilitiesData = typeof eventData.facilities === 'object' && eventData.facilities !== null 
        ? eventData.facilities 
        : typeof eventData.facilities === 'string' 
        ? JSON.parse(eventData.facilities) 
        : {};
  } catch (e) { console.error("Failed to parse facilities JSON:", e); }

  let ticketsData: EventType['tickets'] = { types: [] }; // Default to object with empty types array
   try {
      const parsedTickets = typeof eventData.tickets === 'object' && eventData.tickets !== null 
        ? eventData.tickets 
        : typeof eventData.tickets === 'string' 
        ? JSON.parse(eventData.tickets) 
        : {};
      // Ensure parsedTickets has the correct structure, especially the 'types' array
      ticketsData = {
        url: parsedTickets.url,
        availableCount: parsedTickets.availableCount,
        types: Array.isArray(parsedTickets.types) ? parsedTickets.types : [] 
      };
  } catch (e) { console.error("Failed to parse tickets JSON:", e); }

  const event: EventType = {
    id: eventData.id,
    title: eventData.title ?? '',
    category: eventData.category ?? 'Uncategorized',
    image: eventData.image ?? '', // Provide default image URL if needed
    time: eventData.time ?? '',
    location: eventData.location ?? 'Location not set',
    rating: eventData.rating ?? 0,
    reviews: eventData.reviews ?? 0,
    price: eventData.price ?? 'Free',
    description: eventData.description ?? '',
    latitude: Number(eventData.latitude) || undefined, // Keep as number or undefined
    longitude: Number(eventData.longitude) || undefined, // Keep as number or undefined
    coordinates: {
      latitude: Number(eventData.latitude) || 0,
      longitude: Number(eventData.longitude) || 0
    },
    day: eventData.day ?? 0, // Assuming day exists and providing default
    organizer_name: eventData.organizer_name,
    organizer_image: eventData.organizer_image,
    organizer_contact_email: eventData.organizer_contact_email,
    organizer_contact_phone: eventData.organizer_contact_phone,
    organizer_website: eventData.organizer_website,
    organizer: { // Construct nested object
      name: eventData.organizer_name || '',
      image: eventData.organizer_image,
      contactEmail: eventData.organizer_contact_email,
      contactPhone: eventData.organizer_contact_phone,
      website: eventData.organizer_website
    },
    duration: eventData.duration,
    recurrence_pattern: eventData.recurrence_pattern,
    recurrence_custom_pattern: eventData.recurrence_custom_pattern,
    recurrence_end_date: eventData.recurrence_end_date,
    recurrence: eventData.recurrence_pattern ? { // Construct nested object
      pattern: eventData.recurrence_pattern as NonNullable<EventType['recurrence']>['pattern'], // Use NonNullable to assure TS 'pattern' exists
      customPattern: eventData.recurrence_custom_pattern,
      endDate: eventData.recurrence_end_date
    } : undefined,
    facilities: facilitiesData, // Use safely parsed data
    tickets: ticketsData, // Use safely parsed data
    tags: eventData.tags ?? [],
    capacity: eventData.capacity,
    attendee_count: eventData.attendee_count,
    attendeeCount: eventData.attendee_count ?? 0, // Ensure it's always number
    created_at: eventData.created_at,
    updated_at: eventData.updated_at,
    is_sponsored: eventData.is_sponsored,
    sponsor_end_date: eventData.sponsor_end_date,
  };
  
  // Get recurring pattern text representation
  const getRecurrenceText = () => {
    if (!event.recurrence) return 'One-time event';
    
    switch (event.recurrence.pattern) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return event.recurrence.customPattern || 'Custom schedule';
      default:
        return 'One-time event';
    }
  };
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Events</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground mt-1">Event details and management</p>
        </div>
        
        <Link href={`/dashboard/events/${id}/edit`}>
          <Button>
            <Edit className="mr-2 size-4" />
            Edit Event
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
              {event.image ? (
                <Image 
                  src={event.image} 
                  alt={event.title}
                  layout="fill"
                  objectFit="cover"
                  className="object-cover"
                />
              ) : (
                <div className="size-full bg-muted flex items-center justify-center">
                  <Calendar className="size-16 text-muted-foreground/50" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 capitalize" variant="default">
                {event.category}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {event.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{event.rating.toFixed(1)}</span>
                    {event.reviews > 0 && (
                      <span className="text-xs text-muted-foreground">({event.reviews})</span>
                    )}
                  </div>
                )}
              </div>
              
              <CardDescription>{event.price || 'Free'}</CardDescription>
            </div>
          </CardHeader>
          
          <Separator className="my-2" />
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{event.location || 'No location set'}</div>
                  {event.coordinates && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.coordinates.latitude}, {event.coordinates.longitude}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{formatDate(event.time)}</div>
                  {event.recurrence && event.recurrence.pattern !== 'once' && (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Repeat className="mr-1 size-3" />
                        {getRecurrenceText()}
                      </Badge>
                      {event.recurrence.endDate && (
                        <span className="text-xs text-muted-foreground ml-2">
                          Until {formatDate(event.recurrence.endDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{formatTime(event.time)}</div>
                  {event.duration && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Duration: {event.duration}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Attendee Count Display - Render only if defined and > 0 */}
              {(event.attendeeCount !== undefined && event.attendeeCount > 0) ? (
                <div className="flex items-start gap-2 text-sm">
                   <Users className="size-4 text-muted-foreground mt-0.5" />
                   <div>{event.attendeeCount} Attendees</div>
                </div>
              ) : null}

              {event.tags && event.tags.length > 0 && (
                 <div className="flex items-start gap-2 text-sm">
                    <Tag className="size-4 text-muted-foreground mt-0.5" />
                     <div className="flex flex-wrap gap-1.5">
                       {event.tags.map((tag: string, index: number) => (
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
            <div className="grid grid-cols-2 w-full gap-2 text-center">
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{event.capacity ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{event.attendeeCount}</p>
                <p className="text-xs text-muted-foreground">Attendees</p>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Tabs content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
                  </div>
                </CardContent>
              </Card>
              
              {event.organizer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Organizer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Organizer</h3>
                      <p className="text-sm">{event.organizer.name || 'Not specified'}</p>
                      
                      {event.organizer.website && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">Website</h3>
                          <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {event.organizer.website}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Contact</h3>
                      {event.organizer.contactEmail && (
                        <p className="text-sm mb-1">Email: {event.organizer.contactEmail}</p>
                      )}
                      {event.organizer.contactPhone && (
                        <p className="text-sm">Phone: {event.organizer.contactPhone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ticket Information</CardTitle>
                  <CardDescription>Tickets and pricing options for this event</CardDescription>
                </CardHeader>
                <CardContent>
                  {event.tickets && event.tickets.types && event.tickets.types.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.tickets.types.map((ticket, index) => (
                          <Card key={index} className="bg-muted/50">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-md">{ticket.name}</CardTitle>
                                <Badge>{ticket.price}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{ticket.description || 'No description available.'}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {event.tickets.url && (
                        <div className="pt-4 border-t mt-4">
                          <h3 className="text-sm font-medium mb-2">Ticket Purchase Link</h3>
                          <a href={event.tickets.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            {event.tickets.url}
                          </a>
                        </div>
                      )}
                      
                      {event.tickets.availableCount !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <Ticket className="size-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {event.tickets.availableCount} tickets available
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted/50 rounded-md">
                      <div className="text-center">
                        <Info className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground">No ticket information available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Facilities Tab */}
            <TabsContent value="facilities" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Facilities & Amenities</CardTitle>
                  <CardDescription>Available facilities at this event</CardDescription>
                </CardHeader>
                <CardContent>
                  {event.facilities ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FacilityItem 
                        title="Parking" 
                        available={event.facilities.parking} 
                      />
                      <FacilityItem 
                        title="ATM" 
                        available={event.facilities.atm} 
                      />
                      <FacilityItem 
                        title="Food Available" 
                        available={event.facilities.foodAvailable} 
                      />
                      <FacilityItem 
                        title="Toilets" 
                        available={event.facilities.toilets} 
                      />
                      <FacilityItem 
                        title="Wheelchair Access" 
                        available={event.facilities.wheelchair} 
                      />
                      <FacilityItem 
                        title="WiFi" 
                        available={event.facilities.wifi} 
                      />
                      <FacilityItem 
                        title="Pet Friendly" 
                        available={event.facilities.petFriendly} 
                      />
                      <FacilityItem 
                        title="Child Friendly" 
                        available={event.facilities.childFriendly} 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted/50 rounded-md">
                      <div className="text-center">
                        <Info className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground">No facility information available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Recurrence Tab */}
            <TabsContent value="recurrence" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recurrence Pattern</CardTitle>
                  <CardDescription>Event recurrence settings</CardDescription>
                </CardHeader>
                <CardContent>
                  {event.recurrence ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Repeat className="size-5 text-primary" />
                        <div className="text-lg font-medium">{getRecurrenceText()}</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Pattern</h3>
                          <Badge variant="outline" className="capitalize">
                            {event.recurrence.pattern}
                          </Badge>
                          {event.recurrence.customPattern && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {event.recurrence.customPattern}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">End Date</h3>
                          <p className="text-sm">
                            {event.recurrence.endDate ? formatDate(event.recurrence.endDate) : 'No end date specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Repeat className="size-5 text-muted-foreground" />
                      <div className="text-lg">One-time event</div>
                    </div>
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

// Component for facility item
function FacilityItem({ title, available }: { title: string, available?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-md text-center">
      <div className={`size-3 rounded-full mb-2 ${available === true ? 'bg-green-500' : available === false ? 'bg-red-500' : 'bg-gray-400'}`}></div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{available === true ? 'Available' : available === false ? 'Not available' : 'Unknown'}</p>
    </div>
  );
}

// Helper component for Organizer Info
function OrganizerInfo({ organizer }: { organizer: OrganizerType }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {organizer.image ? (
            <Image 
              src={organizer.image} 
              alt={organizer.name || 'Organizer'} 
              width={40} 
              height={40} 
              className="size-10 rounded-full object-cover" 
            />
          ) : (
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{organizer.name || 'N/A'}</span>
        </div>
        {organizer.contactEmail && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" />
            <a href={`mailto:${organizer.contactEmail}`} className="hover:underline">{organizer.contactEmail}</a>
          </div>
        )}
        {organizer.contactPhone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" />
            <span>{organizer.contactPhone}</span>
          </div>
        )}
        {organizer.website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="size-4" />
            <a 
              href={organizer.website.startsWith('http') ? organizer.website : `https://${organizer.website}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline"
            >
              {organizer.website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for Ticket Info
function TicketInfoSection({ tickets }: { tickets?: EventType['tickets']}) {
  if (!tickets || !tickets.types || tickets.types.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Ticket information not available.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
        {tickets.url && (
          <CardDescription>
            <a 
              href={tickets.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Purchase Tickets Online
            </a>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {tickets.types.map((ticket: TicketItem, index: number) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="font-medium">{ticket.name}</span>
            <div className="text-right">
              <span className="text-primary font-semibold">
                {ticket.price}
              </span>
            </div>
          </div>
        ))}
        {tickets.availableCount !== undefined && (
          <div className="flex items-center gap-2 text-sm pt-3 border-t">
            <Ticket className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {tickets.availableCount} tickets available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for Facilities
function FacilitiesSection({ facilities }: { facilities?: FacilitiesType }) {
  if (!facilities || Object.keys(facilities).length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Facility information not available.</p>;
  }
  
  // Get keys that are present and true/false in the facilities object
  const availableFacilities = Object.entries(facilities).filter(([key]) => key in facilityIcons);

  if (availableFacilities.length === 0) {
      return <p className="text-sm text-muted-foreground p-4 text-center">No specified facilities found.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facilities</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
        {availableFacilities.map(([key, available]: [string, boolean | undefined]) => {
          const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          const Icon = facilityIcons[key] || Ban;
          
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <Icon className={`size-4 ${available ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span>{title} {available === false ? '(N/A)' : ''}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Define facilityIcons with explicit Record type
const facilityIcons: Record<keyof FacilitiesType | string, React.ElementType> = {
  parking: ParkingSquare,
  atm: Users, // Placeholder - needs specific icon
  foodAvailable: Coffee,
  toilets: Users, // Placeholder
  wheelchair: Users, // Placeholder
  wifi: Wifi,
  petFriendly: Users, // Placeholder
  childFriendly: Users // Placeholder
}; 