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
import { PartnerCategory } from "@/types/partner"

import { updatePartnerAction } from "../../actions"

// Define the partner type from Supabase schema
type PartnerRow = Tables<'partners'>;

// Basic schema for initial partner edit form
// Note: This is a simplified schema - in a real app you'd want to handle 
// all the different partner types and their specific fields
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
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

type FormValues = z.infer<typeof partnerSchema>;

interface PartnerEditFormProps {
  initialPartnerData: PartnerRow;
  partnerId: string;
}

export function PartnerEditForm({ initialPartnerData, partnerId }: PartnerEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Initialize form with default values from partner data
  const form = useForm<FormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: initialPartnerData.name,
      category: initialPartnerData.category,
      image: initialPartnerData.image,
      short_description: initialPartnerData.short_description,
      location: initialPartnerData.location,
      price_range: initialPartnerData.price_range,
      open_hours: initialPartnerData.open_hours,
      contact: initialPartnerData.contact,
      latitude: typeof initialPartnerData.coordinates === 'object' ? 
               (initialPartnerData.coordinates as any)?.latitude || 0 : 0,
      longitude: typeof initialPartnerData.coordinates === 'object' ? 
               (initialPartnerData.coordinates as any)?.longitude || 0 : 0,
      is_sponsored: initialPartnerData.is_sponsored || false,
      long_description: initialPartnerData.long_description,
      email: initialPartnerData.email || '',
      website: initialPartnerData.website || '',
    },
  });

  // Function to handle form submission
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Prepare data for update
      const partnerData = {
        ...values,
        coordinates: {
          latitude: values.latitude,
          longitude: values.longitude,
        },
        category: values.category as PartnerCategory,
      };

      // Update partner
      const result = await updatePartnerAction(partnerId, partnerData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Partner updated successfully",
        })
        router.push(`/dashboard/partners`)
      } else {
        throw new Error(result.error || "Failed to update partner")
      }
    } catch (error) {
      console.error("Error updating partner:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not update partner. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Partner category options based on your partner.ts file
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
    // Add all other categories from partner.ts
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
                        <Input placeholder="+66 123 456 789" {...field} />
                      </FormControl>
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
                      <FormLabel>URL du site web</FormLabel>
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
                            step="0.000001" 
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
                            step="0.000001" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
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
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Update Partner
          </Button>
        </div>
      </form>
    </Form>
  )
}