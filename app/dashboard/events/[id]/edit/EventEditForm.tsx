"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/lib/supabase/types"

import { updateEventAction } from "../../actions"

// Define the event type from Supabase schema
type EventRow = Tables<'events'>;

// Schéma de validation pour le formulaire (same as before)
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  image: z.string().url({ message: "Please enter a valid image URL" }),
  time: z.string(),
  location: z.string().min(3, { message: "Location must be at least 3 characters" }),
  price: z.string(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  latitude: z.number(),
  longitude: z.number(),
  organizerName: z.string().min(2, { message: "Organizer name must be at least 2 characters" }),
  recurrencePattern: z.string(),
  recurrenceCustomPattern: z.string().optional(),
  duration: z.string().min(1, { message: "Please enter a duration" }),
  tags: z.string().optional(),
  capacity: z.number().optional(),
  ticketsUrl: z.string().url({ message: "Please enter a valid ticket URL" }).optional(),
  ticketsAvailableCount: z.number().optional(),
  organizerEmail: z.string().email({ message: "Please enter a valid email address" }).optional(),
  organizerPhone: z.string().optional(),
  organizerWebsite: z.string().url({ message: "Please enter a valid URL" }).optional(),
  parking: z.boolean().optional(),
  atm: z.boolean().optional(),
  foodAvailable: z.boolean().optional(),
  toilets: z.boolean().optional(),
  wheelchair: z.boolean().optional(),
  wifi: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  childFriendly: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EventEditFormProps {
  initialEventData: EventRow; // Use the correct type
  eventId: string;
}

// Helper function to prepare default values (run outside the component or memoized)
function prepareDefaultValues(initialEventData: EventRow): FormValues {
  let facilities = {}
  try {
    if (typeof initialEventData.facilities === 'string') {
      facilities = JSON.parse(initialEventData.facilities)
    } else if (initialEventData.facilities && typeof initialEventData.facilities === 'object') {
      facilities = initialEventData.facilities
    }
  } catch (e) {
    console.error('Error parsing facilities:', e)
  }

  let tickets = {}
  try {
    if (typeof initialEventData.tickets === 'string') {
      tickets = JSON.parse(initialEventData.tickets)
    } else if (initialEventData.tickets && typeof initialEventData.tickets === 'object') {
      tickets = initialEventData.tickets
    }
  } catch (e) {
    console.error('Error parsing tickets:', e)
  }

  return {
    title: initialEventData.title || "",
    category: initialEventData.category || "",
    image: initialEventData.image || "",
    time: initialEventData.time || "", // Might need formatting if datetime-local expects specific format
    location: initialEventData.location || "",
    price: initialEventData.price ? initialEventData.price.toString() : "", // price is string in schema, already string? Check DB type
    description: initialEventData.description || "",
    latitude: initialEventData.latitude || 0,
    longitude: initialEventData.longitude || 0,
    organizerName: initialEventData.organizer_name || "",
    recurrencePattern: initialEventData.recurrence_pattern || "none",
    recurrenceCustomPattern: initialEventData.recurrence_custom_pattern || "",
    duration: initialEventData.duration || "",
    tags: Array.isArray(initialEventData.tags) ? initialEventData.tags.join(', ') : initialEventData.tags || "",
    capacity: initialEventData.capacity || 0,
    ticketsUrl: (tickets as any)?.url || "",
    ticketsAvailableCount: (tickets as any)?.availableCount || 0,
    organizerEmail: initialEventData.organizer_contact_email || "",
    organizerPhone: initialEventData.organizer_contact_phone || "",
    organizerWebsite: initialEventData.organizer_website || "",
    parking: (facilities as any)?.parking || false,
    atm: (facilities as any)?.atm || false,
    foodAvailable: (facilities as any)?.foodAvailable || false,
    toilets: (facilities as any)?.toilets || false,
    wheelchair: (facilities as any)?.wheelchair || false,
    wifi: (facilities as any)?.wifi || false,
    petFriendly: (facilities as any)?.petFriendly || false,
    childFriendly: (facilities as any)?.childFriendly || false,
  };
}

export function EventEditForm({ initialEventData, eventId }: EventEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Prepare default values before calling useForm
  const defaultFormValues = prepareDefaultValues(initialEventData);

  // Initialize form with explicit type and pre-calculated default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues, // Use the object directly
  });

  // Function to submit the form using the server action
  // Explicitly type the values parameter to match FormValues
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const eventData = {
        ...values,
        price: parseFloat(values.price) || 0,
        facilities: JSON.stringify({
          parking: values.parking,
          atm: values.atm,
          foodAvailable: values.foodAvailable,
          toilets: values.toilets,
          wheelchair: values.wheelchair,
          wifi: values.wifi,
          petFriendly: values.petFriendly,
          childFriendly: values.childFriendly,
        }),
        tickets: JSON.stringify({
          url: values.ticketsUrl,
          availableCount: values.ticketsAvailableCount,
        }),
      }

      const formattedEventDataForAction = {
        title: eventData.title,
        category: eventData.category,
        image: eventData.image,
        time: eventData.time,
        location: eventData.location,
        description: eventData.description,
        price: eventData.price.toString(),
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        organizer_name: eventData.organizerName,
        organizer_contact_email: eventData.organizerEmail,
        organizer_contact_phone: eventData.organizerPhone,
        organizer_website: eventData.organizerWebsite,
        recurrence_pattern: eventData.recurrencePattern,
        recurrence_custom_pattern: eventData.recurrenceCustomPattern,
        tags: eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()) : undefined,
        facilities: eventData.facilities,
        tickets: eventData.tickets,
        duration: eventData.duration,
        capacity: eventData.capacity,
        day: !isNaN(new Date(values.time).getDay()) ? new Date(values.time).getDay() : null,
      };

      const result = await updateEventAction(eventId, formattedEventDataForAction as any); 
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Event updated successfully",
        })
        router.push(`/dashboard/events`) 
      } else {
        throw new Error(result.error || "Failed to update event via action")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not update the event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // The rest of the return JSX for the form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="organizer">Organizer</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Essential information about the event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Event Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="exhibition">Exhibition</SelectItem>
                          <SelectItem value="sport">Sport</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                   <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date and Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event Location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Event Description" className="min-h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>Additional information about the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="2 hours" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recurrencePattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recurrence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No recurrence</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("recurrencePattern") === "custom" && (
                    <FormField
                      control={form.control}
                      name="recurrenceCustomPattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Recurrence Pattern</FormLabel>
                          <FormControl>
                            <Input placeholder="Every first Monday of the month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="music, live, rock" {...field} />
                        </FormControl>
                        <FormDescription>Separate tags with commas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ticketsUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/tickets" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ticketsAvailableCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of tickets available</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organizer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organizer Information</CardTitle>
                  <CardDescription>Details about the event organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <FormField
                    control={form.control}
                    name="organizerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organizer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Organizer Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="organizerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organizerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 1 23 45 67 89" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="organizerWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facilities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Facilities</CardTitle>
                  <CardDescription>Services and amenities available at the event venue</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="parking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Parking</FormLabel>
                          <FormDescription>Parking available on site</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="atm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>ATM</FormLabel>
                          <FormDescription>ATM on site</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="foodAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Food</FormLabel>
                          <FormDescription>Food available on site</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toilets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Restrooms</FormLabel>
                          <FormDescription>Restrooms available on site</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wheelchair"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Wheelchair Access</FormLabel>
                          <FormDescription>Accessible for people with reduced mobility</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="wifi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>WiFi</FormLabel>
                          <FormDescription>WiFi available on site</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="petFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Pets Allowed</FormLabel>
                          <FormDescription>Pets are allowed at the venue</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="childFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Child Friendly</FormLabel>
                          <FormDescription>Event suitable for children</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

