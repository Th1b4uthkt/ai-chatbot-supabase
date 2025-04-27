import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag,
  Users,
  Ticket,
  Star,
  Repeat,
  Info
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EventType } from '@/types/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Format dates
function formatDate(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
}

// Format time
function formatTime(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateString;
  }
}

export default async function EventViewPage({
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
  
  // Fetch the event being viewed
  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!eventData) {
    redirect('/dashboard/events');
  }
  
  // Parse nested JSON objects
  const event = {
    ...eventData,
    // Create coordinates object from latitude/longitude
    coordinates: {
      latitude: Number(eventData.latitude) || 0,
      longitude: Number(eventData.longitude) || 0
    },
    
    // Create organizer object from separate fields
    organizer: {
      name: eventData.organizer_name || '',
      image: eventData.organizer_image || '',
      contactEmail: eventData.organizer_contact_email || '',
      contactPhone: eventData.organizer_contact_phone || '',
      website: eventData.organizer_website || ''
    },
    
    // Handle facilities and tickets which are already JSON objects in the database
    facilities: typeof eventData.facilities === 'object' ? eventData.facilities : 
               typeof eventData.facilities === 'string' ? JSON.parse(eventData.facilities) : {},
      
    tickets: typeof eventData.tickets === 'object' ? eventData.tickets : 
             typeof eventData.tickets === 'string' ? JSON.parse(eventData.tickets) : {},
    
    // Reconstruct recurrence object
    recurrence: eventData.recurrence_pattern ? {
      pattern: eventData.recurrence_pattern,
      customPattern: eventData.recurrence_custom_pattern,
      endDate: eventData.recurrence_end_date
    } : null,
    
    // Map attendee_count to attendeeCount for frontend consistency
    attendeeCount: eventData.attendee_count
  } as EventType;
  
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
          <ArrowLeft className="h-4 w-4" />
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
            <Edit className="mr-2 h-4 w-4" />
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
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-muted-foreground/50" />
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
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
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
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
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
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{formatDate(event.time)}</div>
                  {event.recurrence && event.recurrence.pattern !== 'once' && (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs">
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
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{formatTime(event.time)}</div>
                  {event.duration && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Duration: {event.duration}
                    </div>
                  )}
                </div>
              </div>
              
              {event.organizer && event.organizer.name && (
                <div className="flex items-start gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div>Organized by: {event.organizer.name}</div>
                    {event.organizer.contactEmail && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Email: {event.organizer.contactEmail}
                      </div>
                    )}
                    {event.organizer.contactPhone && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Phone: {event.organizer.contactPhone}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {event.tags && event.tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, index) => (
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
                <p className="text-lg font-medium">{event.capacity || '∞'}</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{event.attendeeCount || 0}</p>
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
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{event.description || 'No description available.'}</p>
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
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {event.tickets.availableCount} tickets available
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted/50 rounded-md">
                      <div className="text-center">
                        <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
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
                        <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
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
                        <Repeat className="h-5 w-5 text-primary" />
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
                      <Repeat className="h-5 w-5 text-muted-foreground" />
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
      <div className={`h-3 w-3 rounded-full mb-2 ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{available ? 'Available' : 'Not available'}</p>
    </div>
  );
} 