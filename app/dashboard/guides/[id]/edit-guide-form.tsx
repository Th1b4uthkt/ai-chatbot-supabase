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
import { GuideCategory, GuideType } from "@/types/guide";

// Updated Zod schema to match new/page.tsx structure for arrays
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
  tags: z.string().optional(), // Comma-separated string in form
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  galleryImages: z.string().optional(), // Comma-separated string in form
  
  // Use arrays of objects instead of strings
  sections: z.array(
    z.object({
      title: z.string().min(1, { message: "Section title is required" }),
      content: z.string().min(1, { message: "Section content is required" }),
      order: z.number().int().min(1),
      iconName: z.string().optional(),
    })
  ).optional(),
  
  items: z.array(
    z.object({
      title: z.string().min(1, { message: "Item title is required" }),
      description: z.string().min(1, { message: "Item description is required" }),
      tags: z.string().optional(), // Comma-separated string in form item
    })
  ).optional(),
  
  contacts: z.array(
    z.object({
      name: z.string().min(1, { message: "Contact name is required" }),
      type: z.string().min(1, { message: "Contact type is required" }),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  
  // Added missing fields
  difficulty: z.string().optional(),
  duration: z.string().optional(),
  equipment: z.string().optional(), // Comma-separated string in form
  facilities: z.string().optional(), // Comma-separated string in form
  
  // Kept these for potential future use or if they exist in initialData, but they won't have dedicated UI for now
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
  // Using GuideType here for better typing, adjust if needed
  initialData: GuideType; 
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
  const initialSections = Array.isArray(initialData.sections) ? initialData.sections : safeJsonParse(initialData.sections, []);
  const initialItems = Array.isArray(initialData.items) ? initialData.items?.map(item => ({
    ...item,
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : '', // Convert item tags array to string for form
  })) : safeJsonParse(initialData.items, []).map((item: any) => ({
     ...item,
     tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
  }));
  const initialContacts = Array.isArray(initialData.contacts) ? initialData.contacts : safeJsonParse(initialData.contacts, []);
  const initialPracticalInfo = typeof initialData.practicalInfo === 'object' ? initialData.practicalInfo : safeJsonParse(initialData.practicalInfo, {});
  const initialRecommendations = Array.isArray(initialData.recommendations) ? initialData.recommendations : safeJsonParse(initialData.recommendations, []);
  const initialTestimonials = Array.isArray(initialData.testimonials) ? initialData.testimonials : safeJsonParse(initialData.testimonials, []);


  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      // Pre-fill based on initialData prop
      title: initialData.title || "",
      category: initialData.category || "",
      mainImage: initialData.mainImage || "", 
      shortDescription: initialData.shortDescription || "",
      longDescription: initialData.longDescription || "",
      slug: initialData.slug || "",
      rating: initialData.rating ?? 0,
      reviews: initialData.reviews ?? 0,
      isFeatured: initialData.isFeatured ?? false,
      // Convert arrays back to comma-separated strings for inputs
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : "",
      location: initialData.location || "",
      latitude: initialData.coordinates?.latitude ?? 0,
      longitude: initialData.coordinates?.longitude ?? 0,
      galleryImages: Array.isArray(initialData.galleryImages) ? initialData.galleryImages.join(', ') : "",
      
      // Use parsed arrays/objects
      sections: initialSections,
      items: initialItems,
      contacts: initialContacts,
      
      // Added missing fields
      difficulty: initialData.difficulty || "",
      duration: initialData.duration || "",
      equipment: Array.isArray(initialData.equipment) ? initialData.equipment.join(', ') : "",
      facilities: Array.isArray(initialData.facilities) ? initialData.facilities.join(', ') : "",
      
      // Keep stringified versions for hidden/unused fields for now
      practicalInfo: JSON.stringify(initialPracticalInfo, null, 2),
      recommendations: JSON.stringify(initialRecommendations, null, 2),
      testimonials: JSON.stringify(initialTestimonials, null, 2),
    },
  });
  
  // Setup field arrays
  const { fields: sectionFields, append: appendSection, remove: removeSection } = 
    useFieldArray({ control: form.control, name: "sections" });
    
  const { fields: itemFields, append: appendItem, remove: removeItem } = 
    useFieldArray({ control: form.control, name: "items" });
    
  const { fields: contactFields, append: appendContact, remove: removeContact } = 
    useFieldArray({ control: form.control, name: "contacts" });

  async function onSubmit(values: GuideFormValues) {
    if (!guideId) return;
    setIsSubmitting(true);
    try {
      // --- Data Transformation --- 
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const galleryArray = values.galleryImages ? values.galleryImages.split(',').map(url => url.trim()).filter(Boolean) : [];
      const equipmentArray = values.equipment ? values.equipment.split(',').map(item => item.trim()).filter(Boolean) : [];
      const facilitiesArray = values.facilities ? values.facilities.split(',').map(item => item.trim()).filter(Boolean) : [];
      
      // Process item tags from string back to array
      const processedItems = values.items?.map(item => ({
        ...item,
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      }));
      
      // No need to parse JSON strings anymore for main arrays
      const formattedGuideData = {
        title: values.title,
        category: values.category as GuideCategory,
        main_image: values.mainImage, // Use DB column names if different (like mainImage -> main_image)
        short_description: values.shortDescription,
        long_description: values.longDescription,
        slug: values.slug || undefined,
        rating: values.rating,
        reviews: values.reviews,
        is_featured: values.isFeatured,
        tags: tagsArray,
        location: values.location || undefined,
        coordinates: (values.latitude !== undefined && values.longitude !== undefined) ? { latitude: values.latitude, longitude: values.longitude } : undefined,
        gallery_images: galleryArray,
        
        // Use the arrays directly from form values
        sections: values.sections,
        items: processedItems, // Use processed items with array tags
        contacts: values.contacts,
        
        // Added fields
        difficulty: values.difficulty || undefined,
        duration: values.duration || undefined,
        equipment: equipmentArray,
        facilities: facilitiesArray,
        
        // Parse the remaining JSON string fields (if they were edited)
        practical_info: safeJsonParse(values.practicalInfo, {}),
        recommendations: safeJsonParse(values.recommendations, []),
        testimonials: safeJsonParse(values.testimonials, []),
      };

      // Server Action Call
      const result = await updateGuideAction(guideId, formattedGuideData as any); // Cast as any for now

      if (result?.success === false) {
        throw new Error(result.error || "An unknown error occurred during the update.");
      }

      toast({
        title: "Success",
        description: "Guide updated successfully!",
      });
      // Consider if redirect is needed/handled by action
      // router.push('/dashboard/guides'); // Optional: redirect after successful update

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
          {/* ... Keep existing fields for title, category, slug, mainImage, shortDescription, longDescription, tags, isFeatured ... */}
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
          {/* ... Keep existing fields for location, latitude, longitude ... */}
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
          {/* ... Keep existing fields for rating, reviews, galleryImages ... */}
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
               <div key={field.id} className="p-4 border rounded-md space-y-4 relative"> {/* Added relative positioning */}
                 <div className="flex justify-between items-center">
                   <h4 className="font-medium">Section {index + 1}</h4>
                   {/* Position trash icon absolutely */}
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     type="button" 
                     className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" // Positioning and styling
                     onClick={() => removeSection(index)}
                   >
                     <Trash className="size-4" />
                   </Button>
                 </div>
                 <FormField control={form.control} name={`sections.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input placeholder="Section Title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name={`sections.${index}.content`} render={({ field }) => (<FormItem><FormLabel>Section Content</FormLabel><FormControl><Textarea placeholder="Section Content..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField control={form.control} name={`sections.${index}.order`} render={({ field }) => (<FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name={`sections.${index}.iconName`} render={({ field }) => (<FormItem><FormLabel>Icon (Optional)</FormLabel><FormControl><Input placeholder="info-circle" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
               </div>
             ))}
             <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSection({ title: "", content: "", order: sectionFields.length + 1, iconName: "" })}>
               <Plus className="mr-2 size-4" /> Add Section
             </Button>
           </CardContent>
         </Card>

         {/* --- Items Card (Dynamic) --- */}
          <Card>
            <CardHeader>
              <CardTitle>List Items</CardTitle>
              <CardDescription>Specific items (features, beaches, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                   <div className="flex justify-between items-center">
                     <h4 className="font-medium">Item {index + 1}</h4>
                     <Button variant="ghost" size="icon" type="button" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeItem(index)}>
                       <Trash className="size-4" />
                     </Button>
                   </div>
                  <FormField control={form.control} name={`items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Item Title</FormLabel><FormControl><Input placeholder="Item Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Item Description</FormLabel><FormControl><Textarea placeholder="Item Description..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`items.${index}.tags`} render={({ field }) => (<FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input placeholder="tagA, tagB" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendItem({ title: "", description: "", tags: "" })}>
                <Plus className="mr-2 size-4" /> Add Item
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
                    <FormField control={form.control} name={`contacts.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Contact Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`contacts.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="Support, Info..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`contacts.${index}.email`} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`contacts.${index}.phone`} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+123..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`contacts.${index}.website`} render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`contacts.${index}.address`} render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Address..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`contacts.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Details..." {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendContact({ name: "", type: "", email: "", phone: "", website: "", address: "", description: "" })}>
                <Plus className="mr-2 size-4" /> Add Contact
              </Button>
            </CardContent>
          </Card>

        {/* --- Activity/Place Specific Fields (Added) --- */}
          <Card>
            <CardHeader>
              <CardTitle>Specific Details</CardTitle>
              <CardDescription>Details specific to activities or places</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Not applicable</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="difficult">Difficult</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>For activities, hikes, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="2 hours, half day..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="equipment" render={({ field }) => (<FormItem><FormLabel>Equipment Needed</FormLabel><FormControl><Textarea placeholder="hiking boots, water..." {...field} rows={2} /></FormControl><FormDescription>Separate with commas.</FormDescription><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="facilities" render={({ field }) => (<FormItem><FormLabel>Facilities Available</FormLabel><FormControl><Textarea placeholder="restrooms, parking..." {...field} rows={2} /></FormControl><FormDescription>Separate with commas.</FormDescription><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
          
         {/* --- Hidden Fields (Optional - keep if needed for backend) --- */}
         {/* You might want to hide these if they are not meant to be user-editable in this form */}
         {/* <FormField control={form.control} name="practicalInfo" render={({ field }) => (<FormItem className="hidden"><FormLabel>Practical Info (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='{...}' {...field} /></FormControl><FormMessage /></FormItem>)} /> */}
         {/* <FormField control={form.control} name="recommendations" render={({ field }) => (<FormItem className="hidden"><FormLabel>Recommendations (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} /> */}
         {/* <FormField control={form.control} name="testimonials" render={({ field }) => (<FormItem className="hidden"><FormLabel>Testimonials (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} /> */}

        {/* --- Submission Button --- */}
        {/* ... Keep existing submission button ... */}
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