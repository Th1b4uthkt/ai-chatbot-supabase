"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PlusCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form"
import * as z from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { mapPartnerToDb } from "@/lib/supabase/mappers"
import { Tables } from "@/lib/supabase/types"
import { AllPartnerAttributes } from "@/types/partner/attributes"
import { Partner, PriceIndicator, PartnerSection, EstablishmentCategory, ServiceCategory, PartnerSubcategory } from "@/types/partner/partner"

import { createPartnerAction } from "../actions"

// Type for Price Indicator values - needed for Zod enum
const priceIndicatorValues: [PriceIndicator, ...PriceIndicator[]] = [
  "€", "€€", "€€€", "€€€€", "Free", "Varies"
];

// Updated Zod schema reflecting Partner structure
const partnerSchema = z.object({
  name: z.string().min(3, { message: "Name must contain at least 3 characters" }),
  section: z.nativeEnum(PartnerSection),
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
    social: z.object({ // Added social media structure
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
      score: z.number().min(0).max(5).default(0),
      reviewCount: z.number().int().min(0).default(0),
  }).default({ score: 0, reviewCount: 0 }),
  tags: z.array(z.string()).default([]),
  prices: z.object({
      priceRange: z.enum(priceIndicatorValues),
      currency: z.string().optional().default("THB"),
  }),
  features: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  promotion: z.object({
      isSponsored: z.boolean().default(false),
      isFeatured: z.boolean().optional(),
      promotionEndsAt: z.string().optional(),
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
    acceptedCards: z.array(z.string()).optional().default([]),
  }).optional(),
  attributes: z.object({
    roomCount: z.number().optional(),
    hasPool: z.boolean().optional(),
    hasFreeWifi: z.boolean().optional(),
    hasBreakfast: z.boolean().optional(),
    hasAirCon: z.boolean().optional(),
    cuisine: z.string().optional(),
    servesAlcohol: z.boolean().optional(),
    hasVeganOptions: z.boolean().optional(),
    vehicleTypes: z.array(z.string()).optional(),
    requiresLicense: z.boolean().optional(),
    specialties: z.array(z.string()).optional(),
    acceptsInsurance: z.boolean().optional(),
  }).optional().default({}),
});

// TagInput component for handling tags and features
interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

function TagInput({ value = [], onChange, placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleAddTag = () => {
    if (input && !value.includes(input.trim())) {
      onChange([...value, input.trim()]);
      setInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 pb-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
            {tag}
            <button type="button" onClick={() => handleRemoveTag(tag)}>
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={handleAddTag} disabled={!input}>
          <PlusCircle className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// Define the type for our form values
type PartnerFormValues = z.infer<typeof partnerSchema>;

export function NewPartnerForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Type the form properly with PartnerFormValues
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema) as any, // Use 'as any' to bypass the complex type issue
    defaultValues: {
      name: "",
      section: PartnerSection.ESTABLISHMENT,
      mainCategory: EstablishmentCategory.ACCOMMODATION,
      subcategory: PartnerSubcategory.OTHER,
      images: { main: "" },
      description: { short: "", long: "" },
      location: {
        address: "",
        coordinates: { latitude: 9.739, longitude: 100.015 },
        area: "",
       },
      contact: { email: "", website: "" },
      hours: { regularHours: "9:00 AM - 5:00 PM", open24h: false },
      rating: { score: 0, reviewCount: 0 },
      tags: [],
      prices: { priceRange: "Varies", currency: "THB" },
      features: [],
      languages: ["English", "Thai"],
      promotion: { isSponsored: false },
      accessibility: { wheelchairAccessible: false, familyFriendly: false, petFriendly: false },
      paymentOptions: { cash: true, creditCard: false, mobilePay: false, cryptoCurrency: false },
      attributes: {},
    },
  });

  // Function to handle form submission - use SubmitHandler for proper typing
  const handleFormSubmit: SubmitHandler<PartnerFormValues> = async (values) => {
    setIsSubmitting(true)
    try {
       // Filter attributes based on category to avoid sending irrelevant fields
       let filteredAttributes: any = {};
       
       if (values.section === PartnerSection.ESTABLISHMENT) {
         if (values.mainCategory === EstablishmentCategory.ACCOMMODATION) {
           // Only include accommodation-relevant attributes
           const { roomCount, hasPool, hasFreeWifi, hasBreakfast, hasAirCon } = values.attributes || {};
           filteredAttributes = { 
             accommodationType: "hotel", // Set a default type
             rooms: [],
             facilities: [
               ...(hasPool ? ["Swimming Pool"] : []),
               ...(hasFreeWifi ? ["Free WiFi"] : []),
               ...(hasBreakfast ? ["Breakfast Included"] : []),
               ...(hasAirCon ? ["Air Conditioning"] : []),
             ],
             policies: {
               checkIn: "14:00",
               checkOut: "11:00"
             }
           };
           if (roomCount) {
             filteredAttributes.roomCount = roomCount;
           }
         } else if (values.mainCategory === EstablishmentCategory.FOOD_DRINK) {
           // Only include food & drink relevant attributes
           const { cuisine, servesAlcohol, hasVeganOptions } = values.attributes || {};
           filteredAttributes = { 
             establishmentType: "restaurant", // Set a default type
             cuisine: cuisine ? [cuisine] : ["General"],
             dietaryOptions: hasVeganOptions ? ["Vegan Options"] : [],
             alcoholServed: servesAlcohol || false
           };
         } else if (values.mainCategory === EstablishmentCategory.TRANSPORT_PROVIDER) {
           // Only include transport relevant attributes
           const { vehicleTypes, requiresLicense } = values.attributes || {};
           filteredAttributes = { 
             transportType: "general",
             vehicles: vehicleTypes || [],
             requiresLicense: requiresLicense || false,
             services: []
           };
         }
       } else if (values.section === PartnerSection.SERVICE) {
         if (values.mainCategory === ServiceCategory.HEALTH) {
           // Only include health service relevant attributes
           const { specialties, acceptsInsurance } = values.attributes || {};
           filteredAttributes = {
             serviceType: "medical",
             specialties: specialties || [],
             insurance: {
               acceptsInsurance: acceptsInsurance || false
             },
             emergency: false
           };
         }
       }
       
       const partnerToCreate: Partial<Partner> = {
         ...values,
         mainCategory: values.mainCategory as EstablishmentCategory | ServiceCategory,
         prices: {
           ...values.prices,
           priceRange: values.prices.priceRange as PriceIndicator,
         },
         rating: values.rating,
         promotion: values.promotion,
         tags: values.tags,
         features: values.features,
         languages: values.languages,
         accessibility: values.accessibility,
         paymentOptions: values.paymentOptions,
         attributes: Object.keys(filteredAttributes).length > 0 ? filteredAttributes as AllPartnerAttributes : undefined,
       };
       const result = await createPartnerAction(partnerToCreate as Partner);

      if (result.success) {
        toast({
          title: "Success",
          description: `Partner "${values.name}" created successfully`,
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

  // Regenerate category options based on enums (same as edit form)
   const establishmentCategories = Object.entries(EstablishmentCategory).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value,
  }));
  const serviceCategories = Object.entries(ServiceCategory).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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

  // Watch the main category to dynamically show category-specific fields
  const selectedMainCategory = form.watch("mainCategory");
  
  // Helper function to determine if we should show accommodation-specific fields
  const isAccommodation = selectedSection === PartnerSection.ESTABLISHMENT && 
                        selectedMainCategory === EstablishmentCategory.ACCOMMODATION;
  
  // Helper function to determine if we should show food & drink specific fields
  const isFoodDrink = selectedSection === PartnerSection.ESTABLISHMENT && 
                     selectedMainCategory === EstablishmentCategory.FOOD_DRINK;

  // Helper function to show specific fields for transport providers
  const isTransport = selectedSection === PartnerSection.ESTABLISHMENT && 
                    selectedMainCategory === EstablishmentCategory.TRANSPORT_PROVIDER;
  
  // Helper for service-specific fields
  const isHealthService = selectedSection === PartnerSection.SERVICE && 
                         selectedMainCategory === ServiceCategory.HEALTH;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
         {/* Tabs and General Tab */}
        <Tabs defaultValue="general" className="w-full">
           <TabsList className="grid w-full grid-cols-5">
             <TabsTrigger value="general">General</TabsTrigger>
             <TabsTrigger value="details">Details</TabsTrigger>
             <TabsTrigger value="location">Location</TabsTrigger>
             <TabsTrigger value="features">Features & Tags</TabsTrigger>
             <TabsTrigger value="category">Category Details</TabsTrigger>
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
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a section" />
                          </SelectTrigger>
                        </FormControl>
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a main category" />
                          </SelectTrigger>
                        </FormControl>
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                        </FormControl>
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a price range" />
                          </SelectTrigger>
                        </FormControl>
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
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                   <FormField
                    control={form.control}
                    name="rating.score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating Score (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" max="5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating.reviewCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Count (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
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
                        <Input placeholder="Ex: +66 12 345 6789" {...field} />
                      </FormControl>
                       <FormDescription>Phone number or other main contact.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hours.regularHours"
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
                  name="hours.open24h"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Open 24/7</FormLabel>
                        <FormDescription>
                          This location is open 24 hours a day, 7 days a week.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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

          {/* Location Tab */}
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
                            placeholder="9.739" 
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
                            placeholder="100.015" 
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
                
                {/* Accessibility fields */}
                <div className="space-y-4 pt-4">
                  <div className="font-medium">Accessibility Options</div>
                  <FormField
                    control={form.control}
                    name="accessibility.wheelchairAccessible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Wheelchair Accessible</FormLabel>
                          <FormDescription>
                            This location is accessible for people with mobility impairments.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value || false} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accessibility.familyFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Family Friendly</FormLabel>
                          <FormDescription>
                            This location is suitable for families with children.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value || false} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accessibility.petFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Pet Friendly</FormLabel>
                          <FormDescription>
                            This location welcomes pets.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value || false} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="promotion.isSponsored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Sponsored</FormLabel>
                        <FormDescription>
                          Highlight this partner as sponsored.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Features & Tags Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Features & Tags</CardTitle>
                <CardDescription>Add special features and tags to help users find this partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tags field */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormDescription>
                        Add tags to help users discover this partner through search and filtering.
                      </FormDescription>
                      <FormControl>
                        <TagInput 
                          value={field.value} 
                          onChange={field.onChange} 
                          placeholder="Add a tag and press Enter..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Features field */}
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormDescription>
                        Add special features or amenities offered by this partner.
                      </FormDescription>
                      <FormControl>
                        <TagInput 
                          value={field.value} 
                          onChange={field.onChange} 
                          placeholder="Add a feature and press Enter..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Languages field */}
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages Spoken</FormLabel>
                      <FormDescription>
                        Add languages spoken at this establishment.
                      </FormDescription>
                      <FormControl>
                        <TagInput 
                          value={field.value} 
                          onChange={field.onChange} 
                          placeholder="Add a language and press Enter..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment options */}
                <div className="space-y-4 pt-2">
                  <div className="font-medium">Payment Options</div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="paymentOptions.cash"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>Cash</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value || false} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentOptions.creditCard"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>Credit Card</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value || false} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentOptions.mobilePay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>Mobile Payment</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value || false} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentOptions.cryptoCurrency"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>Cryptocurrency</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value || false} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category-specific Tab */}
          <TabsContent value="category" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category-Specific Details</CardTitle>
                <CardDescription>
                  {selectedSection === PartnerSection.ESTABLISHMENT 
                    ? "Additional details specific to this establishment type" 
                    : "Additional details specific to this service type"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display different fields based on category */}
                {isAccommodation && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Accommodation Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="attributes.roomCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Rooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="Total number of rooms" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Amenities checkbox group would go here */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="attributes.hasPool"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Swimming Pool</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="attributes.hasFreeWifi"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Free Wi-Fi</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="attributes.hasBreakfast"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Breakfast Included</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="attributes.hasAirCon"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Air Conditioning</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {isFoodDrink && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Food & Drink Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="attributes.cuisine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuisine Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Thai, Italian, Fusion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="attributes.servesAlcohol"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Serves Alcohol</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="attributes.hasVeganOptions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Vegan Options</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {isTransport && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Transport Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="attributes.vehicleTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Types</FormLabel>
                          <FormDescription>
                            Add the types of vehicles available
                          </FormDescription>
                          <FormControl>
                            <TagInput 
                              value={field.value || []} 
                              onChange={field.onChange} 
                              placeholder="E.g., Car, Scooter, Boat..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="attributes.requiresLicense"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Requires License</FormLabel>
                            <FormDescription>
                              Customer needs a valid license to rent
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value || false} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {isHealthService && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Health Service Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="attributes.specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialties</FormLabel>
                          <FormDescription>
                            Add medical specialties offered
                          </FormDescription>
                          <FormControl>
                            <TagInput 
                              value={field.value || []} 
                              onChange={field.onChange} 
                              placeholder="E.g., Emergency, Pediatrics..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="attributes.acceptsInsurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <FormLabel>Accepts Insurance</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value || false} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Default message if no specific fields */}
                {!isAccommodation && !isFoodDrink && !isTransport && !isHealthService && (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Select a specific category to see additional fields</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
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