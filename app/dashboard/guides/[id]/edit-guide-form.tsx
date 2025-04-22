"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { GuideCategory, GuideType } from "@/types/guide";

// Zod schema (same as before)
const guideFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  category: z.string().min(1, { message: "Please select a category." }),
  mainImage: z.string().url({ message: "Please enter a valid image URL." }),
  shortDescription: z.string().min(10, { message: "Short description must be at least 10 characters long." }),
  longDescription: z.string().min(20, { message: "Long description must be at least 20 characters long." }),
  slug: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  galleryImages: z.string().optional(),
  sections: z.string().optional(),
  items: z.string().optional(),
  contacts: z.string().optional(),
  practicalInfo: z.string().optional(),
  recommendations: z.string().optional(),
  testimonials: z.string().optional(),
});

type GuideFormValues = z.infer<typeof guideFormSchema>;

const guideCategories: GuideCategory[] = [
  "applications-essentielles", "visa-immigration", "sante-medical", "monnaie-change", "communication",
  "plages-spots", "activites-nautiques", "randonnee-trek", "bien-etre-retraites", "sites-culturels",
  "transports-locaux", "ferries-bateaux", "aeroport-ports", "itineraires-parkings",
  "logement-immobilier", "coworking-espaces", "formalites-entreprise", "education-langues", "associations-reseaux",
  "contacts-urgence", "conseils-securite", "assistance-routiere",
  "coutumes-etiquette", "festivals-fetes", "benevolat-associations",
  "meteo-saisons", "actualites-locales", "bons-plans", "conseils-saisonniers"
];

interface EditGuideFormProps {
  // Define a more specific type based on your actual DB guide structure
  // This should match the return type of getGuideByIdQuery eventually
  initialData: any; 
}

export function EditGuideForm({ initialData }: EditGuideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter(); // Use router for potential client-side navigation if needed
  const { toast } = useToast();
  const guideId = initialData.id; // Get ID from the initial data

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      // Pre-fill based on initialData prop
      title: initialData.title || "",
      category: initialData.category || "",
      mainImage: initialData.main_image || "", // Adjust field names based on DB (e.g., main_image)
      shortDescription: initialData.short_description || "",
      longDescription: initialData.long_description || "",
      slug: initialData.slug || "",
      rating: initialData.rating ?? 0,
      reviews: initialData.reviews ?? 0,
      isFeatured: initialData.is_featured ?? false,
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : "",
      location: initialData.location || "",
      latitude: initialData.coordinates?.latitude ?? 0,
      longitude: initialData.coordinates?.longitude ?? 0,
      galleryImages: Array.isArray(initialData.gallery_images) ? initialData.gallery_images.join(', ') : "",
      // Stringify JSON fields for Textarea
      sections: initialData.sections ? JSON.stringify(initialData.sections, null, 2) : "[]",
      items: initialData.items ? JSON.stringify(initialData.items, null, 2) : "[]",
      contacts: initialData.contacts ? JSON.stringify(initialData.contacts, null, 2) : "[]",
      practicalInfo: initialData.practical_info ? JSON.stringify(initialData.practical_info, null, 2) : "{}",
      recommendations: initialData.recommendations ? JSON.stringify(initialData.recommendations, null, 2) : "[]",
      testimonials: initialData.testimonials ? JSON.stringify(initialData.testimonials, null, 2) : "[]",
    },
  });

  async function onSubmit(values: GuideFormValues) {
    if (!guideId) return;
    setIsSubmitting(true);
    try {
      // Data Transformation (identical to previous edit page)
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const galleryArray = values.galleryImages ? values.galleryImages.split(',').map(url => url.trim()).filter(Boolean) : [];
      
      const parseJsonOrEmpty = (jsonString: string | undefined, defaultVal: any = []) => {
        if (!jsonString) return defaultVal;
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn("Failed to parse JSON string:", jsonString, e);
          toast({ title: "JSON Format Error", description: `Check the structure of JSON fields.`, variant: "destructive" });
          throw new Error("Invalid JSON format in form data."); 
        }
      };
      
      const formattedGuideData = {
        title: values.title,
        category: values.category as GuideCategory,
        main_image: values.mainImage, // Use DB column names
        short_description: values.shortDescription,
        long_description: values.longDescription,
        slug: values.slug || undefined,
        rating: values.rating,
        reviews: values.reviews,
        is_featured: values.isFeatured,
        tags: tagsArray,
        location: values.location || undefined,
        coordinates: values.latitude && values.longitude ? { latitude: values.latitude, longitude: values.longitude } : undefined,
        gallery_images: galleryArray,
        sections: parseJsonOrEmpty(values.sections, []),
        items: parseJsonOrEmpty(values.items, []),
        contacts: parseJsonOrEmpty(values.contacts, []),
        practical_info: parseJsonOrEmpty(values.practicalInfo, {}),
        recommendations: parseJsonOrEmpty(values.recommendations, []),
        testimonials: parseJsonOrEmpty(values.testimonials, []),
      };

      // Server Action Call
      const result = await updateGuideAction(guideId, formattedGuideData as any);

      if (result?.success === false) {
        throw new Error(result.error || "An unknown error occurred during the update.");
      }

      toast({
        title: "Success",
        description: "Guide updated successfully!",
      });
      // No redirect needed here, action handles it

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
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
        {/* --- General Information Card --- */} 
        <Card>
          <CardHeader><CardTitle>General Information</CardTitle><CardDescription>Basic details of the guide.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
             <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Guide title" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{guideCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ')}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
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
        
         {/* --- Complex Fields (Placeholders) --- */}
        <Card>
          <CardHeader><CardTitle>Structured Content (JSON)</CardTitle><CardDescription>Raw JSON format for now.</CardDescription></CardHeader>
           <CardContent className="space-y-4">
            <FormField control={form.control} name="sections" render={({ field }) => (<FormItem><FormLabel>Sections (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="items" render={({ field }) => (<FormItem><FormLabel>Items (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contacts" render={({ field }) => (<FormItem><FormLabel>Contacts (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="practicalInfo" render={({ field }) => (<FormItem><FormLabel>Practical Info (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='{...}' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="recommendations" render={({ field }) => (<FormItem><FormLabel>Recommendations (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="testimonials" render={({ field }) => (<FormItem><FormLabel>Testimonials (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
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