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
import { mapDbToPartner, mapPartnerToDb } from "@/lib/supabase/mappers"
import { Tables } from "@/lib/supabase/types"
import { Partner, PriceIndicator, PartnerSection, EstablishmentCategory, ServiceCategory, PartnerSubcategory } from "@/types/partner/partner"

import { updatePartnerAction } from "../../actions"

// Define the partner type from Supabase schema
type PartnerRow = Tables<'partners'>;
type PartnerFormValues = z.infer<typeof partnerSchema>; // USE Zod-inferred type

// Type for Price Indicator values - needed for Zod enum
const priceIndicatorValues: [PriceIndicator, ...PriceIndicator[]] = [
  "€", "€€", "€€€", "€€€€", "Free", "Varies"
];

// Updated Zod schema reflecting Partner structure
const partnerSchema = z.object({
  id: z.string(), // Keep id for reference
  name: z.string().min(3, { message: "Name must contain at least 3 characters" }),
  section: z.nativeEnum(PartnerSection),
  // Use union of enums for mainCategory validation
  mainCategory: z.union([
      z.nativeEnum(EstablishmentCategory),
      z.nativeEnum(ServiceCategory)
  ]),
  subcategory: z.nativeEnum(PartnerSubcategory),
  images: z.object({
    main: z.string().url({ message: "Please enter a valid main image URL" }),
    gallery: z.array(z.string().url()).optional(),
  }),
  description: z.object({
    short: z.string().min(10, { message: "Short description must contain at least 10 characters" }),
    long: z.string().min(20, { message: "Long description must contain at least 20 characters" }),
  }),
  location: z.object({
    address: z.string().min(3, { message: "Address must contain at least 3 characters" }),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    area: z.string().optional(),
  }),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
    website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
    lineId: z.string().optional(),
    social: z.object({
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
    }).optional(),
  }),
  hours: z.object({
      regularHours: z.string().optional(),
      seasonalChanges: z.string().optional(),
      open24h: z.boolean().optional(),
  }),
  rating: z.object({
      score: z.number().min(0).max(5).optional(),
      reviewCount: z.number().int().min(0).optional(),
      // testimonials are complex, handle separately if needed in form
  }).optional(),
  tags: z.array(z.string()).optional(),
  prices: z.object({
      priceRange: z.enum(priceIndicatorValues), // Validate against specific PriceIndicator values
      currency: z.string().optional(),
  }),
  features: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  // createdAt and updatedAt are managed by DB
  promotion: z.object({
      isSponsored: z.boolean(),
      isFeatured: z.boolean().optional(),
      promotionEndsAt: z.string().optional(), // Consider date validation
      // discount object - handle separately if needed
  }).optional(),
  accessibility: z.object({
      wheelchairAccessible: z.boolean().optional(),
      familyFriendly: z.boolean().optional(),
      petFriendly: z.boolean().optional(),
  }).optional(),
  paymentOptions: z.object({
    cash: z.boolean().optional(),
    creditCard: z.boolean().optional(),
    mobilePay: z.boolean().optional(),
    cryptoCurrency: z.boolean().optional(),
    acceptedCards: z.array(z.string()).optional(),
  }).optional(),
  // faq - handle separately if needed
  // attributes - handle dynamically based on category
});

// We need a mapper from DB Row to Form Values (PartnerType)
// This might be complex due to JSON fields in DB needing parsing
function mapPartnerRowToFormValues(dbRow: PartnerRow): PartnerFormValues {
  // Basic mapping, assuming mapDbToPartner exists and handles JSON parsing
  const partnerType = mapDbToPartner(dbRow); // Use the central mapper

  // Ensure all required fields for the form schema are present, providing defaults if necessary
  // This depends heavily on the exact implementation of mapDbToPartner and the schema
  return {
    ...partnerType,
    // Ensure nested objects exist for the form, even if parts are null/undefined from DB
    images: partnerType.images ?? { main: dbRow.image || '' }, // Fallback for main image if needed
    description: partnerType.description ?? { short: dbRow.short_description || '', long: dbRow.long_description || '' },
    location: partnerType.location ?? { address: dbRow.location || '', coordinates: { latitude: dbRow.latitude || 0, longitude: dbRow.longitude || 0 } },
    contact: partnerType.contact ?? { phone: '', email: dbRow.email || '', website: dbRow.website || '' },
    hours: partnerType.hours ?? { regularHours: typeof dbRow.open_hours === 'string' ? dbRow.open_hours : JSON.stringify(dbRow.open_hours) || '' }, // Handle potential JSON open_hours
    rating: partnerType.rating ?? { score: 0, reviewCount: 0}, // Default rating object
    prices: partnerType.prices ?? { priceRange: dbRow.price_range || 'Varies' }, // Default price object
    promotion: partnerType.promotion ?? { isSponsored: dbRow.is_sponsored ?? false, promotionEndsAt: dbRow.sponsor_end_date || undefined },
    // Add other defaults as required by the Zod schema
  };
}

interface PartnerEditFormProps {
  initialPartnerData: PartnerRow;
  partnerId: string;
}

export function PartnerEditForm({ initialPartnerData, partnerId }: PartnerEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Initialize form using the mapped data
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    // Map initial DB data to the nested PartnerType structure for the form
    defaultValues: mapPartnerRowToFormValues(initialPartnerData),
  });

  // Function to handle form submission
  async function handleFormSubmit(values: PartnerFormValues) {
    setIsSubmitting(true)
    try {
      // The Zod schema should now infer types closer to Partial<Partner>
      // Pass values directly, assuming mapPartnerToDb handles conversion inside the action if needed
      const result = await updatePartnerAction(partnerId, values);
      
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

  // Partner category options - dynamically generate based on enums
   const establishmentCategories = Object.entries(EstablishmentCategory).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format label
    value: value,
  }));

  const serviceCategories = Object.entries(ServiceCategory).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format label
    value: value,
  }));

  const subcategoryOptions = Object.entries(PartnerSubcategory).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value,
  }));

  const priceIndicatorOptions: { value: PriceIndicator, label: string }[] = [
    { value: "Free", label: "Free" },
    { value: "Varies", label: "Varies" },
    { value: "€", label: "€ (Budget)" },
    { value: "€€", label: "€€ (Mid-range)" },
    { value: "€€€", label: "€€€ (High-end)" },
    { value: "€€€€", label: "€€€€ (Luxury)" },
  ];

  // Watch the section to dynamically show main category options
  const selectedSection = form.watch("section");

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
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Object.entries(PartnerSection).map(([key, value]) => (
                            <SelectItem key={value} value={value}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mainCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSection}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a main category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {(selectedSection === PartnerSection.ESTABLISHMENT ? establishmentCategories : serviceCategories).map(option => (
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
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a subcategory" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {subcategoryOptions.map(option => (
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
                  name="images.main"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description.short"
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
                  name="prices.priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select a price range" /></SelectTrigger></FormControl>
                        <SelectContent>
                           {priceIndicatorOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
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
                  name="description.long"
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
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+66 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hours.regularHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Hours (Text)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mon-Fri 9am-6pm, Sat 10am-4pm" {...field} />
                      </FormControl>
                       <FormDescription>Describe opening hours textually.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.email"
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
                  name="contact.website"
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
                  name="location.address"
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
                    name="location.coordinates.latitude"
                    render={({ field }) => (
                       <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location.coordinates.longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                           <Input
                            type="number"
                            step="any"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                             value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location.area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., West Coast, Srithanu" {...field} />
                      </FormControl>
                      <FormDescription>Specify the general area on the island.</FormDescription>
                      <FormMessage />
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
            Update Partner
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Helper function to get category label (replace the old one)
const getCategoryLabel = (mainCategoryValue?: string | null, subcategoryValue?: string | null): string => {
  if (!mainCategoryValue && !subcategoryValue) return "Unknown";

  const findLabel = (enumObj: any, value: string | null | undefined): string | undefined => {
      if (!value) return undefined;
      const entry = Object.entries(enumObj).find(([_, val]) => val === value);
      return entry ? entry[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : undefined;
  };

  const subLabel = findLabel(PartnerSubcategory, subcategoryValue);
  if (subLabel) return subLabel; // Prefer subcategory label if specific

  const mainLabelEst = findLabel(EstablishmentCategory, mainCategoryValue);
  if (mainLabelEst) return mainLabelEst;

  const mainLabelSvc = findLabel(ServiceCategory, mainCategoryValue);
  if (mainLabelSvc) return mainLabelSvc;

  return subcategoryValue || mainCategoryValue || "Unknown"; // Fallback to raw value
};