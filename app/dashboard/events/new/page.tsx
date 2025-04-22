"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  CalendarIcon,
  DollarSignIcon,
  GlobeIcon,
  ImageIcon,
  InfoIcon,
  LinkIcon,
  ListIcon,
  Loader2,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
  BuildingIcon,
  SparklesIcon,
  UtensilsIcon,
  Accessibility,
  WifiIcon,
  DogIcon,
  BabyIcon,
  ContactIcon,
  RecycleIcon,
  ClockIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="size-9 rounded-full shadow-sm">
          <Link href="/dashboard/events">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details below to add a new event.</p>
        </div>
      </div>

      <Form {...form}>
        <Card className="border-border/40 shadow-md rounded-xl overflow-hidden">
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-0">
            <Tabs defaultValue="general" className="w-full">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto rounded-none px-4 border-b-0">
                  <TabsTrigger value="general" className="py-3 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <InfoIcon className="size-4 mr-2 text-primary/70" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="details" className="py-3 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <ListIcon className="size-4 mr-2 text-primary/70" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="organizer" className="py-3 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <ContactIcon className="size-4 mr-2 text-primary/70" />
                    Organizer
                  </TabsTrigger>
                  <TabsTrigger value="facilities" className="py-3 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                    <BuildingIcon className="size-4 mr-2 text-primary/70" />
                    Facilities
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general" className="mt-0 pt-0">
                <CardContent className="space-y-6 p-4 md:p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center text-sm font-medium"><InfoIcon className="size-4 mr-2 text-primary"/>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Amazing Phangan Party" {...field} className="border-input/50 focus:border-primary/50 shadow-sm" />
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
                          <FormLabel className="flex items-center text-sm font-medium"><ListIcon className="size-4 mr-2 text-primary"/>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-input/50 focus:border-primary/50 shadow-sm">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><ImageIcon className="size-4 mr-2"/>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><CalendarIcon className="size-4 mr-2"/>Date & Time</FormLabel>
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
                          <FormLabel className="flex items-center"><MapPinIcon className="size-4 mr-2"/>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Secret Beach" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><DollarSignIcon className="size-4 mr-2"/>Price (THB)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="0 (Free)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
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
                            <FormControl><Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><InfoIcon className="size-4 mr-2"/>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the event..." className="min-h-40" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </TabsContent>

              <TabsContent value="details" className="mt-0 pt-0">
                <CardContent className="space-y-6 p-4 md:p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                    <FormField control={form.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ClockIcon className="size-4 mr-2"/>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="2 hours" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="recurrencePattern" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><RecycleIcon className="size-4 mr-2"/>Recurrence</FormLabel>
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
                    )} />
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
                    <FormField control={form.control} name="tags" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center"><TagIcon className="size-4 mr-2"/>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="music, live, rock" {...field} />
                        </FormControl>
                        <FormDescription>Separate tags with commas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="capacity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><UsersIcon className="size-4 mr-2"/>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="ticketsUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><LinkIcon className="size-4 mr-2"/>Ticket URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/tickets" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="ticketsAvailableCount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><TicketIcon className="size-4 mr-2"/>Tickets Available</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="organizer" className="mt-0 pt-0">
                <CardContent className="space-y-6 p-4 md:p-6">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                    <FormField control={form.control} name="organizerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ContactIcon className="size-4 mr-2"/>Organizer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Organizer Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="organizerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="organizerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><PhoneIcon className="size-4 mr-2"/>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 1 23 45 67 89" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="organizerWebsite" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><GlobeIcon className="size-4 mr-2"/>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="facilities" className="mt-0 pt-0">
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="parking" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="parking" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="parking" className="flex items-center cursor-pointer"><BuildingIcon className="size-4 mr-2 text-primary"/><span className="font-medium">Parking</span></FormLabel>
                          <FormDescription>Parking available on site</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="atm" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="atm" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="atm" className="flex items-center cursor-pointer"><SparklesIcon className="size-4 mr-2 text-primary"/><span className="font-medium">ATM</span></FormLabel>
                          <FormDescription>ATM on site</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="foodAvailable" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="food" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="food" className="flex items-center cursor-pointer"><UtensilsIcon className="size-4 mr-2 text-primary"/><span className="font-medium">Food</span></FormLabel>
                          <FormDescription>Food available on site</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="toilets" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="toilets" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="toilets" className="flex items-center cursor-pointer"><BuildingIcon className="size-4 mr-2 text-primary"/><span className="font-medium">Restrooms</span></FormLabel>
                          <FormDescription>Restrooms available on site</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="wheelchair" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="wheelchair" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="wheelchair" className="flex items-center cursor-pointer"><Accessibility className="size-4 mr-2 text-primary"/><span className="font-medium">Wheelchair Access</span></FormLabel>
                          <FormDescription>Accessible for people with reduced mobility</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="wifi" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="wifi" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="wifi" className="flex items-center cursor-pointer"><WifiIcon className="size-4 mr-2 text-primary"/><span className="font-medium">WiFi</span></FormLabel>
                          <FormDescription>WiFi available on site</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="petFriendly" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="pets" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="pets" className="flex items-center cursor-pointer"><DogIcon className="size-4 mr-2 text-primary"/><span className="font-medium">Pets Allowed</span></FormLabel>
                          <FormDescription>Pets are allowed at the venue</FormDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="childFriendly" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 hover:bg-muted/50 transition-colors hover:shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="child" className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="child" className="flex items-center cursor-pointer"><BabyIcon className="size-4 mr-2 text-primary"/><span className="font-medium">Child Friendly</span></FormLabel>
                          <FormDescription>Event suitable for children</FormDescription>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>

            <CardFooter className="border-t px-6 py-4 bg-muted/20">
              <div className="flex justify-end w-full">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-medium shadow-md transition-all hover:shadow-lg"
                >
                  {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Create Event
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </Form>
    </div>
  )
}
