"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

import { createEventAction } from "../actions"

// Schéma de validation pour le formulaire
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
})

// Définir le type à partir du schéma
type FormValues = z.infer<typeof formSchema>

export default function NewEventPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Initialiser le formulaire avec des valeurs par défaut
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      image: "",
      time: "",
      location: "",
      price: "",
      description: "",
      latitude: 0,
      longitude: 0,
      organizerName: "",
      recurrencePattern: "none",
      duration: "",
      tags: "",
      capacity: 0,
      ticketsUrl: "",
      ticketsAvailableCount: 0,
      organizerEmail: "",
      organizerPhone: "",
      organizerWebsite: "",
      parking: false,
      atm: false,
      foodAvailable: false,
      toilets: false,
      wheelchair: false,
      wifi: false,
      petFriendly: false,
      childFriendly: false,
    },
  })

  // Function to handle form submission using the server action
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Format the data for the database action (similar to before)
      let dayOfWeek = ""
      try {
        const date = new Date(values.time)
        dayOfWeek = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)
      } catch (e) {
        console.error("Error parsing date:", e)
      }

      const formattedEventData = {
        title: values.title,
        category: values.category,
        image: values.image,
        time: values.time,
        location: values.location,
        description: values.description,
        price: values.price.toString(),
        latitude: values.latitude,
        longitude: values.longitude,
        organizer_name: values.organizerName,
        organizer_contact_email: values.organizerEmail,
        organizer_contact_phone: values.organizerPhone,
        organizer_website: values.organizerWebsite,
        recurrence_pattern: values.recurrencePattern,
        recurrence_custom_pattern: values.recurrenceCustomPattern,
        // Ensure 'day' is calculated correctly or handle potential errors
        day: !isNaN(new Date(values.time).getDay()) ? new Date(values.time).getDay() : null, 
        rating: 0, // Default value
        reviews: 0, // Default value
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
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
        duration: values.duration,
        capacity: values.capacity,
      };

      // Call the server action
      const result = await createEventAction(formattedEventData as any); // Cast as any for now, refine type if needed

      if (result.success) {
        toast({
          title: "Success",
          description: "Event created successfully",
        });
        router.push(`/dashboard/events`);
      } else {
        throw new Error(result.error || "Failed to create event via action");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/events">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create a New Event</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="pt-4">
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
                            <SelectItem value="party">Party</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="market">Market</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="culture">Cultural</SelectItem>
                            <SelectItem value="sport">Sport</SelectItem>
                            <SelectItem value="wellness">Wellness</SelectItem>
                            <SelectItem value="kids">Kids</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Event type (e.g., party, festival, market, etc.)
                        </FormDescription>
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

            <TabsContent value="details" className="pt-4">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <TabsContent value="organizer" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                  <CardDescription>
                    Information about the event organizer
                  </CardDescription>
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

            <TabsContent value="facilities" className="pt-4">
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Event
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
