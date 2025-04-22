"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tables } from "@/lib/supabase/types"
import { PartnerCategory, PartnerType } from "@/types/partner"

import { createPartnerAction } from "../actions"

// Basic schema for initial partner form
const partnerSchema = z.object({
  name: z.string().min(3, { message: "Name must contain at least 3 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  image: z.string().url({ message: "Please enter a valid image URL" }),
  short_description: z.string().min(10, { message: "Short description must contain at least 10 characters" }),
  location: z.string().min(3, { message: "Location must contain at least 3 characters" }),
  price_range: z.string().min(1, { message: "Please select a price range" }),
  open_hours: z.string().min(3, { message: "Please indicate opening hours" }),
  contact: z.string().min(3, { message: "Please indicate a contact" }),
  latitude: z.number(),
  longitude: z.number(),
  is_sponsored: z.boolean().optional(),
  long_description: z.string().min(20, { message: "Long description must contain at least 20 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  rating: z.number().min(0, { message: "Rating must be between 0 and 5" }).max(5),
  reviews: z.number().min(0, { message: "Number of reviews must be positive" }),
});

type FormValues = z.infer<typeof partnerSchema>;

export function NewPartnerForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      category: "",
      image: "",
      short_description: "",
      location: "",
      price_range: "$",
      open_hours: "",
      contact: "",
      latitude: 9.4889,
      longitude: 100.0048, // Default to Koh Phangan coordinates
      is_sponsored: false,
      long_description: "",
      email: "",
      website: "",
      rating: 0,
      reviews: 0,
    },
  });

  // Function to handle form submission
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Prepare data for creation - Pas besoin d'ID, Supabase le génère
      const partnerData: Partial<PartnerType> = {
        name: values.name,
        category: values.category as PartnerCategory,
        image: values.image,
        shortDescription: values.short_description,
        location: values.location,
        rating: values.rating,
        reviews: values.reviews,
        priceRange: values.price_range,
        features: [],
        openHours: values.open_hours,
        contact: values.contact,
        coordinates: {
          latitude: values.latitude,
          longitude: values.longitude,
        },
        gallery: [values.image], // Initialize with main image
        longDescription: values.long_description,
        is_sponsored: values.is_sponsored,
        website: values.website || undefined,
        email: values.email || undefined,
      };

      // Create partner
      const result = await createPartnerAction(partnerData as PartnerType);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Partner created successfully",
        })
        router.push(`/dashboard/partners`)
      } else {
        throw new Error(result.error || "Failed to create partner")
      }
    } catch (error) {
      console.error("Error creating partner:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create partner. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Partner category options
  const categoryOptions = [
    { value: "location-scooter", label: "Scooter Rental" },
    { value: "location-voiture", label: "Car Rental" },
    { value: "location-bateau", label: "Boat Rental" },
    { value: "location-velo", label: "Bike Rental" },
    { value: "hebergement-appartement", label: "Apartment" },
    { value: "hebergement-bungalow", label: "Bungalow" },
    { value: "hebergement-villa", label: "Villa" },
    { value: "hebergement-guesthouse", label: "Guesthouse" },
    { value: "restaurant", label: "Restaurant" },
    { value: "cafe", label: "Café" },
    { value: "bar", label: "Bar" },
    { value: "street-food", label: "Street Food" },
    { value: "salon-massage", label: "Massage Parlor" },
    { value: "spa", label: "Spa" },
    { value: "yoga-meditation", label: "Yoga & Meditation" },
    { value: "medical", label: "Medical Services" },
    { value: "excursion", label: "Excursions" },
    { value: "plongee", label: "Diving" },
    { value: "cours", label: "Courses & Training" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Essential information about the partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Partner Name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le nom officiel du partenaire.
                      </FormDescription>
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
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
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
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Short description of the partner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a price range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="$">$ (Budget)</SelectItem>
                          <SelectItem value="$$">$$ (Mid-range)</SelectItem>
                          <SelectItem value="$$$">$$$ (High-end)</SelectItem>
                          <SelectItem value="$$$$">$$$$ (Luxury)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="5"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>Rating from 0 to 5</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reviews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Reviews</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value, 10))} 
                          />
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
                <CardTitle>Details</CardTitle>
                <CardDescription>Detailed information about the partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full description of the partner" className="min-h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: +66 12 345 6789" {...field} />
                      </FormControl>
                       <FormDescription>Phone number or other main contact.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="open_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Hours</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 9:00 AM - 6:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com" {...field} />
                      </FormControl>
                       <FormDescription>
                        L&apos;URL complète du site web du partenaire.
                       </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Information about the partners location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Beach Road, Thong Sala" {...field} />
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
                          <Input 
                            type="number" 
                            step="any" 
                            placeholder="9.739" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
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
                          <Input 
                            type="number" 
                            step="any" 
                            placeholder="100.015" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_sponsored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Sponsored</FormLabel>
                        <FormDescription>
                          Highlight this partner as sponsored.
                        </FormDescription>
                      </div>
                      <FormControl>
                         {/* Shadcn Switch component */}
                         {/* <Switch checked={field.value} onCheckedChange={field.onChange} /> */}
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Partner"
          )}
        </Button>
      </form>
    </Form>
  )
} 