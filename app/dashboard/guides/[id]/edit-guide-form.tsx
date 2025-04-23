"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";

import { updateGuideAction } from "@/app/dashboard/guides/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Guide, GuideCategory, getCategoryDisplayName } from "@/types/newGuide";

// Updated Zod schema aligned with the new Guide type
const guideFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  category: z.nativeEnum(GuideCategory, { message: "Please select a category." }),
  mainImage: z.string().url({ message: "Please enter a valid image URL." }),
  shortDescription: z.string().min(10, { message: "Short description must be at least 10 characters long." }),
  longDescription: z.string().min(20, { message: "Long description must be at least 20 characters long." }),
  slug: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional(), // Comma-separated string in form
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  galleryImages: z.string().optional(), // Comma-separated string in form
  
  // Use arrays of objects instead of strings
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1, { message: "Section title is required" }),
      content: z.string().min(1, { message: "Section content is required" }),
      order: z.number().int().min(1),
    })
  ).optional(),
  
  // Updated to match Guide structure
  relatedContacts: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: "Contact name is required" }),
      type: z.string().min(1, { message: "Contact type is required" }),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  
  // Practical info - updated to match Guide structure
  practicalInfo: z.object({
    requirements: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
    tips: z.array(z.string()).optional(),
    bestTimeToVisit: z.string().optional(),
  }).optional(),

  // Additional fields for different guide categories
  attributes: z.any().optional(), // This will be refined based on the specific guide category
});

type GuideFormValues = z.infer<typeof guideFormSchema>;

// Updated to use GuideCategory values
const guideCategoryItems = Object.values(GuideCategory).map(category => ({
  value: category,
  label: getCategoryDisplayName(category)
}));

interface EditGuideFormProps {
  initialData: Guide; 
}

// Helper to safely parse JSON strings or return default
const safeJsonParse = (jsonString: string | unknown, defaultValue: any) => {
  if (typeof jsonString !== 'string' || !jsonString) {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString) || defaultValue;
  } catch (e) {
    console.warn("Failed to parse JSON, returning default:", e);
    return defaultValue;
  }
};

export function EditGuideForm({ initialData }: EditGuideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter(); 
  const { toast } = useToast();
  const guideId = initialData.id; 

  // Ensure arrays are parsed correctly, handling potential non-string types
  const initialSections = Array.isArray(initialData.sections) 
    ? initialData.sections.map(section => ({
        ...section, 
        id: section.id || crypto.randomUUID() // Ensure each section has an ID
      })) 
    : [];
  const initialContacts = Array.isArray(initialData.relatedContacts) ? initialData.relatedContacts : [];
  const initialPracticalInfo = initialData.practicalInfo || {};

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      // Pre-fill based on initialData prop
      title: initialData.name || "",
      category: initialData.category,
      mainImage: initialData.images?.main || "",
      shortDescription: initialData.description?.short || "",
      longDescription: initialData.description?.long || "",
      slug: initialData.slug || "",
      rating: initialData.rating?.score ?? 0,
      reviews: initialData.rating?.reviewCount ?? 0,
      isFeatured: initialData.isFeatured ?? false,
      // Convert arrays back to comma-separated strings for inputs
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : "",
      location: initialData.location?.address || "",
      latitude: initialData.location?.coordinates?.latitude,
      longitude: initialData.location?.coordinates?.longitude,
      galleryImages: Array.isArray(initialData.images?.gallery) ? initialData.images.gallery.join(', ') : "",
      
      // Use parsed arrays/objects
      sections: initialSections,
      relatedContacts: initialContacts,
      
      // Practical info
      practicalInfo: initialPracticalInfo,
      
      // Attributes will depend on the guide category
      attributes: initialData.attributes || {},
    },
  });
  
  // Setup field arrays
  const { fields: sectionFields, append: appendSection, remove: removeSection } = 
    useFieldArray({ control: form.control, name: "sections" });
    
  const { fields: contactFields, append: appendContact, remove: removeContact } = 
    useFieldArray({ control: form.control, name: "relatedContacts" });

  async function onSubmit(values: GuideFormValues) {
    if (!guideId) return;
    setIsSubmitting(true);
    try {
      // --- Data Transformation --- 
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const galleryArray = values.galleryImages ? values.galleryImages.split(',').map(url => url.trim()).filter(Boolean) : [];
      
      // Create a proper DB-compatible object for the update
      const formattedGuideData: any = {
        name: values.title,
        category: values.category,
        images: {
          main: values.mainImage,
          gallery: galleryArray
        },
        description: {
          short: values.shortDescription,
          long: values.longDescription
        },
        slug: values.slug || undefined,
        rating: {
          score: values.rating,
          reviewCount: values.reviews
        },
        isFeatured: values.isFeatured,
        tags: tagsArray,
        location: {
          address: values.location || "",
          coordinates: (values.latitude !== undefined && values.longitude !== undefined) 
            ? { latitude: values.latitude, longitude: values.longitude } 
            : undefined
        },
        
        // Direct assignments from form fields
        sections: values.sections,
        relatedContacts: values.relatedContacts,
        practicalInfo: values.practicalInfo,
        
        // Attributes depend on the guide category - would need more detailed handling
        attributes: values.attributes,
        
        // Set the last updated timestamp
        lastUpdatedAt: new Date().toISOString()
      };

      // Server Action Call
      const result = await updateGuideAction(guideId, formattedGuideData);

      if (result?.success === false) {
        throw new Error(result.error || "An unknown error occurred during the update.");
      }

      toast({
        title: "Success",
        description: "Guide updated successfully!",
      });
      router.refresh(); // Refresh the current route to update the UI

    } catch (error) {
      console.error("Error updating guide:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to update guide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      {/* Add novalidate to prevent default browser validation */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8"> 
        {/* --- General Information Card --- */} 
        <Card>
          <CardHeader><CardTitle>General Information</CardTitle><CardDescription>Basic details of the guide.</CardDescription></CardHeader>
           <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Guide title" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>
                {guideCategoryItems.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input placeholder="guide-title-in-lowercase" {...field} /></FormControl><FormDescription>Part of the URL.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="mainImage" render={({ field }) => (<FormItem><FormLabel>Main Image (URL) *</FormLabel><FormControl><Input type="url" placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="shortDescription" render={({ field }) => (<FormItem><FormLabel>Short Description *</FormLabel><FormControl><Textarea placeholder="Quick summary..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="longDescription" render={({ field }) => (<FormItem><FormLabel>Long Description *</FormLabel><FormControl><Textarea placeholder="Detailed description..." className="min-h-32" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="tag1, tag2" {...field} /></FormControl><FormDescription>Separate with commas.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="isFeatured" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Feature</FormLabel><FormDescription>Will appear featured.</FormDescription></div></FormItem>)} />
           </CardContent>
        </Card>
        
         {/* --- Location Information Card --- */} 
        <Card>
          <CardHeader><CardTitle>Location (Optional)</CardTitle><CardDescription>If relevant.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location Name</FormLabel><FormControl><Input placeholder="Ex: Beach..." {...field} /></FormControl><FormMessage /></FormItem>)} />
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="latitude" render={({ field }) => (<FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" placeholder="9.6809" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="longitude" render={({ field }) => (<FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" placeholder="100.0684" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
               </div>
            </CardContent>
        </Card>
        
         {/* --- Additional Details Card --- */} 
        <Card>
           <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
           <CardContent className="space-y-4">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>Rating (0-5)</FormLabel><FormControl><Input type="number" step="0.1" min="0" max="5" placeholder="4.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="reviews" render={({ field }) => (<FormItem><FormLabel>Number of reviews</FormLabel><FormControl><Input type="number" min="0" placeholder="120" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="galleryImages" render={({ field }) => (<FormItem><FormLabel>Gallery Images (URLs)</FormLabel><FormControl><Textarea placeholder="https://ex.com/img1.jpg, ..." {...field} /></FormControl><FormDescription>Separate with commas.</FormDescription><FormMessage /></FormItem>)} />
           </CardContent>
        </Card>
        
         {/* --- Sections Card (Dynamic) --- */}
         <Card>
           <CardHeader>
             <CardTitle>Sections</CardTitle>
             <CardDescription>Organized content sections for your guide</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             {sectionFields.map((field, index) => (
               <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                 <div className="flex justify-between items-center">
                   <h4 className="font-medium">Section {index + 1}</h4>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     type="button" 
                     className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                     onClick={() => removeSection(index)}
                   >
                     <Trash className="size-4" />
                   </Button>
                 </div>
                 <FormField control={form.control} name={`sections.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input placeholder="Section Title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name={`sections.${index}.content`} render={({ field }) => (<FormItem><FormLabel>Section Content</FormLabel><FormControl><Textarea placeholder="Section Content..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name={`sections.${index}.order`} render={({ field }) => (<FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl><FormMessage /></FormItem>)} />
               </div>
             ))}
             <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSection({ 
               id: crypto.randomUUID(),
               title: "", 
               content: "", 
               order: sectionFields.length + 1
             })}>
               <Plus className="mr-2 size-4" /> Add Section
             </Button>
           </CardContent>
         </Card>

         {/* --- Contacts Card (Dynamic) --- */}
         <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Relevant contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Contact {index + 1}</h4>
                    <Button variant="ghost" size="icon" type="button" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeContact(index)}>
                      <Trash className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`relatedContacts.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Contact Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`relatedContacts.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="Support, Info..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`relatedContacts.${index}.email`} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`relatedContacts.${index}.phone`} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+123..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`relatedContacts.${index}.website`} render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`relatedContacts.${index}.address`} render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Address..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`relatedContacts.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Details..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendContact({ 
                id: crypto.randomUUID(),
                name: "", 
                type: "", 
                email: "", 
                phone: "", 
                website: "", 
                address: "", 
                description: "" 
              })}>
                <Plus className="mr-2 size-4" /> Add Contact
              </Button>
            </CardContent>
          </Card>

        {/* --- Practical Information Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Practical Information</CardTitle>
            <CardDescription>Helpful details for visitors</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Practical info implementation would go here, with array fields for requirements, warnings, tips */}
          </CardContent>
        </Card>

        {/* --- Submission Button --- */}
         <div className="flex justify-end">
           <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
             Update Guide
           </Button>
         </div>
      </form>
    </Form>
  );
}