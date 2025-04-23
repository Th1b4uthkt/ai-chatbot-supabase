"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Guide, GuideCategory, getCategoryDisplayName } from "@/types/newGuide"; // Import from newGuide.ts

import { createGuideAction } from "../actions"; // Import the create action

// Zod schema for the form - based on Guide type
// Simplified schema with nested objects instead of JSON strings
const guideFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  category: z.nativeEnum(GuideCategory, { message: "Please select a category." }), // Use enum from GuideCategory
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
  
  // Match the Guide structure for sections
  sections: z.array(
    z.object({
      id: z.string(), // Required field for the new Guide type
      title: z.string().min(1, { message: "Section title is required" }),
      content: z.string().min(1, { message: "Section content is required" }),
      order: z.number().int().min(1),
    })
  ).optional(),
  
  // Match the Guide structure for relatedContacts
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
  attributes: z.any().optional(),
});

type GuideFormValues = z.infer<typeof guideFormSchema>;

// Use the enum values for the dropdown
const guideCategoryItems = Object.values(GuideCategory).map(category => ({
  value: category,
  label: getCategoryDisplayName(category)
}));

export default function NewGuidePage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      title: "",
      category: undefined, // Will be set from enum
      mainImage: "",
      shortDescription: "",
      longDescription: "",
      slug: "",
      rating: 0,
      reviews: 0,
      isFeatured: false,
      tags: "",
      location: "",
      latitude: undefined,
      longitude: undefined,
      galleryImages: "",
      
      // Initialize structured arrays
      sections: [{ id: crypto.randomUUID(), title: "", content: "", order: 1 }],
      relatedContacts: [{ name: "", type: "", email: "", phone: "", website: "", address: "", description: "" }],
      
      // Initialize practical info
      practicalInfo: {
        requirements: [],
        warnings: [],
        tips: [],
        bestTimeToVisit: "",
      },
      
      // Attributes will be set based on category
      attributes: {},
    },
  });
  
  // Setup field arrays for dynamic sections
  const { fields: sectionFields, append: appendSection, remove: removeSection } = 
    useFieldArray({ control: form.control, name: "sections" });
    
  const { fields: contactFields, append: appendContact, remove: removeContact } = 
    useFieldArray({ control: form.control, name: "relatedContacts" });

  async function onSubmit(values: GuideFormValues) {
    setIsSubmitting(true);
    try {
      // --- Data Transformation --- 
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const galleryArray = values.galleryImages ? values.galleryImages.split(',').map(url => url.trim()).filter(Boolean) : [];
      
      // Format data according to the Guide type structure
      const formattedGuideData: Partial<Guide> = {
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
        
        // Attributes depend on the guide category
        attributes: values.attributes,
        
        // Set the creation/update timestamps
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      };
      
      const result = await createGuideAction(formattedGuideData as any);

      if (result?.success === false) {
        throw new Error(result.error || "An unknown error occurred during creation.");
      }

      toast({
        title: "Success",
        description: "Guide created successfully!",
      });
      
      // Navigate back to guides list
      router.push('/dashboard/guides');

    } catch (error) {
      console.error("Error creating guide:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to create guide. Please try again.",
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
          <Link href="/dashboard/guides">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create a new guide</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
          
          {/* --- General Information Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details of the guide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Guide title" {...field} />
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
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guideCategoryItems.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="guide-title-in-lowercase" {...field} />
                    </FormControl>
                    <FormDescription>Part of the URL (optional, leave blank for auto-generation if configured).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image (URL) *</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short, catchy description of the guide..."
                        {...field}
                        rows={3} 
                      />
                    </FormControl>
                    <FormDescription>
                      This text is used for previews and SEO optimization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Main content of the guide. Use markdown for formatting if needed."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Main content of the guide. Use markdown for formatting if needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: visa, health, beach" {...field} />
                    </FormControl>
                    <FormDescription>
                      Keywords to help with search and filtering.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Feature</FormLabel>
                      <FormDescription>
                        The guide will appear in featured sections.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>
          
          {/* --- Location Information Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Location (Optional)</CardTitle>
              <CardDescription>If the guide relates to a specific place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Koh Phangan, Thailand" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specific location associated with the guide, if relevant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any" // Allows decimal values
                              placeholder="9.739" 
                              {...field}
                              onChange={event => field.onChange(event.target.value ? +event.target.value : undefined)} // Convert to number
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
                              onChange={event => field.onChange(event.target.value ? +event.target.value : undefined)} // Convert to number
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
             </CardContent>
          </Card>
          
           {/* --- Additional Details Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Ratings, reviews, and gallery images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                   <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating (0-5)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="5" placeholder="4.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="reviews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of reviews</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="120" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                  <FormField
                      control={form.control}
                      name="galleryImages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gallery Images (URLs separated by commas)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                           <FormDescription>
                            Add additional image URLs for a gallery.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
            </CardContent>
          </Card>
          
          {/* --- Sections Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
              <CardDescription>Add organized content sections for your guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Section {index + 1}</h4>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button" 
                        onClick={() => removeSection(index)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`sections.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Introduction, Features, How to Use" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`sections.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Main content text for this section..." 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`sections.${index}.order`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormDescription>Position in the guide (1 appears first)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => appendSection({ 
                  id: crypto.randomUUID(),
                  title: "", 
                  content: "", 
                  order: sectionFields.length + 1 
                })}
              >
                <Plus className="mr-2 size-4" />
                Add Section
              </Button>
            </CardContent>
          </Card>
          
          {/* --- Contacts Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Add relevant contact details for this guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Contact {index + 1}</h4>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button" 
                        onClick={() => removeContact(index)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`relatedContacts.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name or organization" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`relatedContacts.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., support, information, emergency" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`relatedContacts.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`relatedContacts.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+66 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`relatedContacts.${index}.website`}
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
                  
                  <FormField
                    control={form.control}
                    name={`relatedContacts.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Physical address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`relatedContacts.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional information about this contact" {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => appendContact({ 
                  id: crypto.randomUUID(),
                  name: "", 
                  type: "", 
                  email: "", 
                  phone: "", 
                  website: "", 
                  address: "", 
                  description: "" 
                })}
              >
                <Plus className="mr-2 size-4" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
          
          {/* --- Practical Information --- */}
          <Card>
            <CardHeader>
              <CardTitle>Practical Information</CardTitle>
              <CardDescription>Helpful details for visitors</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Practical info implementation would go here */}
            </CardContent>
          </Card>

          {/* --- Submission Button --- */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Envoi...
                </>
              ) : (
                "Créer le guide"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 