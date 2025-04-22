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
import { GuideCategory, GuideType } from "@/types/guide"; // Import Guide types

import { createGuideAction } from "../actions"; // Import the create action

// Zod schema for the form - based on BaseGuideType + some GuideType fields
// Simplified schema with nested objects instead of JSON strings
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
  
  // New structured arrays instead of JSON strings
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
      tags: z.string().optional(), // Will be processed into string[]
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
  
  difficulty: z.string().optional(),
  duration: z.string().optional(),
  equipment: z.string().optional(), // Will be processed into string[]
  facilities: z.string().optional(), // Will be processed into string[]
});

type GuideFormValues = z.infer<typeof guideFormSchema>;

// Array of GuideCategory values for the select dropdown
// You might want to fetch this or define it centrally
const guideCategories: GuideCategory[] = [
  "applications-essentielles", "visa-immigration", "sante-medical", "monnaie-change", "communication",
  "plages-spots", "activites-nautiques", "randonnee-trek", "bien-etre-retraites", "sites-culturels",
  "transports-locaux", "ferries-bateaux", "aeroport-ports", "itineraires-parkings",
  "logement-immobilier", "coworking-espaces", "formalites-entreprise", "education-langues", "associations-reseaux",
  "contacts-urgence", "conseils-securite", "assistance-routiere",
  "coutumes-etiquette", "festivals-fetes", "benevolat-associations",
  "meteo-saisons", "actualites-locales", "bons-plans", "conseils-saisonniers"
];

export default function NewGuidePage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      title: "",
      category: "",
      mainImage: "",
      shortDescription: "",
      longDescription: "",
      slug: "",
      rating: 0,
      reviews: 0,
      isFeatured: false,
      tags: "",
      location: "",
      latitude: 0,
      longitude: 0,
      galleryImages: "",
      // Initialize structured arrays
      sections: [{ title: "", content: "", order: 1, iconName: "" }],
      items: [{ title: "", description: "", tags: "" }],
      contacts: [{ name: "", type: "", email: "", phone: "", website: "", address: "", description: "" }],
      difficulty: "",
      duration: "",
      equipment: "",
      facilities: "",
    },
  });
  
  // Setup field arrays for dynamic sections
  const { fields: sectionFields, append: appendSection, remove: removeSection } = 
    useFieldArray({ control: form.control, name: "sections" });
    
  const { fields: itemFields, append: appendItem, remove: removeItem } = 
    useFieldArray({ control: form.control, name: "items" });
    
  const { fields: contactFields, append: appendContact, remove: removeContact } = 
    useFieldArray({ control: form.control, name: "contacts" });

  async function onSubmit(values: GuideFormValues) {
    setIsSubmitting(true);
    try {
      // --- Data Transformation --- 
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const galleryArray = values.galleryImages ? values.galleryImages.split(',').map(url => url.trim()).filter(Boolean) : [];
      const equipmentArray = values.equipment ? values.equipment.split(',').map(item => item.trim()).filter(Boolean) : [];
      const facilitiesArray = values.facilities ? values.facilities.split(',').map(item => item.trim()).filter(Boolean) : [];
      
      // Process item tags into arrays
      const processedItems = values.items?.map(item => ({
        ...item,
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      }));
      
      const formattedGuideData = {
        // BaseGuideType fields
        title: values.title,
        category: values.category as GuideCategory, 
        mainImage: values.mainImage,
        shortDescription: values.shortDescription,
        longDescription: values.longDescription,
        slug: values.slug || undefined,
        rating: values.rating,
        reviews: values.reviews,
        isFeatured: values.isFeatured,
        tags: tagsArray,
        location: values.location || undefined,
        coordinates: values.latitude && values.longitude ? { latitude: values.latitude, longitude: values.longitude } : undefined,
        galleryImages: galleryArray,
        
        // Directly use the structured arrays instead of parsing JSON
        sections: values.sections,
        items: processedItems,
        contacts: values.contacts,
        
        // Extension fields
        difficulty: values.difficulty || undefined,
        duration: values.duration || undefined,
        equipment: equipmentArray,
        facilities: facilitiesArray,
        
        // Default empty values for other fields
        practicalInfo: {},
        recommendations: [],
        testimonials: [],
      };
      
      const result = await createGuideAction(formattedGuideData as any);

      if (result?.success === false) {
        throw new Error(result.error || "An unknown error occurred during creation.");
      }

      toast({
        title: "Success",
        description: "Guide created successfully!",
      });

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
                        {guideCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/-/g, ' ')} 
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
                              onChange={event => field.onChange(+event.target.value)} // Convert to number
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
                              onChange={event => field.onChange(+event.target.value)} // Convert to number
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
          
          {/* --- Sections Card (replacing Complex JSON) --- */}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <FormField
                      control={form.control}
                      name={`sections.${index}.iconName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., info-circle, map-pin" {...field} />
                          </FormControl>
                          <FormDescription>FontAwesome icon name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => appendSection({ title: "", content: "", order: sectionFields.length + 1, iconName: "" })}
              >
                <Plus className="mr-2 size-4" />
                Add Section
              </Button>
            </CardContent>
          </Card>
          
          {/* --- Items Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>List Items</CardTitle>
              <CardDescription>Add specific items covered in this guide (features, beaches, trails, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button" 
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of feature, place, or item" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe this item..." 
                            {...field} 
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.tags`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., feature, premium, beach" {...field} />
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
                onClick={() => appendItem({ title: "", description: "", tags: "" })}
              >
                <Plus className="mr-2 size-4" />
                Add Item
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
                      name={`contacts.${index}.name`}
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
                      name={`contacts.${index}.type`}
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
                      name={`contacts.${index}.email`}
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
                      name={`contacts.${index}.phone`}
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
                    name={`contacts.${index}.website`}
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
                    name={`contacts.${index}.address`}
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
                    name={`contacts.${index}.description`}
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
          
          {/* --- Activity/Place Specific Fields --- */}
          <Card>
            <CardHeader>
              <CardTitle>Specific Details</CardTitle>
              <CardDescription>Add details specific to activities or places</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty (for activities)">
                            <SelectItem value="none">Not applicable</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="difficult">Difficult</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectValue>
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
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., 2 hours, half day, 3 days" {...field} />
                    </FormControl>
                    <FormDescription>How long this activity or visit typically takes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Needed (comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., hiking boots, water bottle, sunscreen"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>Items needed for this activity</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="facilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facilities Available (comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., restrooms, parking, WiFi, restaurants"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>Amenities available at this location</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* --- Submission Button --- */}
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
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