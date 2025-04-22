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
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie." }),
  mainImage: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
  shortDescription: z.string().min(10, { message: "La description courte doit contenir au moins 10 caractères." }),
  longDescription: z.string().min(20, { message: "La description longue doit contenir au moins 20 caractères." }),
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
          toast({ title: "Erreur de format JSON", description: `Vérifiez la structure des champs JSON.`, variant: "destructive" });
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
        throw new Error(result.error || "Une erreur inconnue est survenue lors de la mise à jour.");
      }

      toast({
        title: "Succès",
        description: "Guide mis à jour avec succès !",
      });
      // No redirect needed here, action handles it

    } catch (error) {
      console.error("Error updating guide:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le guide. Veuillez réessayer.",
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
          <CardHeader><CardTitle>Informations Générales</CardTitle><CardDescription>Détails de base du guide.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
             <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre *</FormLabel><FormControl><Input placeholder="Titre du guide" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Catégorie *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger></FormControl><SelectContent>{guideCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat.replace(/-/g, ' ')}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input placeholder="titre-du-guide-en-minuscules" {...field} /></FormControl><FormDescription>Partie de l&apos;URL.</FormDescription><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="mainImage" render={({ field }) => (<FormItem><FormLabel>Image Principale (URL) *</FormLabel><FormControl><Input type="url" placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="shortDescription" render={({ field }) => (<FormItem><FormLabel>Description Courte *</FormLabel><FormControl><Textarea placeholder="Résumé rapide..." {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="longDescription" render={({ field }) => (<FormItem><FormLabel>Description Longue *</FormLabel><FormControl><Textarea placeholder="Description détaillée..." className="min-h-32" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="tag1, tag2" {...field} /></FormControl><FormDescription>Séparer par des virgules.</FormDescription><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="isFeatured" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Mettre en avant</FormLabel><FormDescription>Apparaîtra en vedette.</FormDescription></div></FormItem>)} />
          </CardContent>
        </Card>
        
         {/* --- Location Information Card --- */} 
        <Card>
          <CardHeader><CardTitle>Localisation (Optionnel)</CardTitle><CardDescription>Si pertinent.</CardDescription></CardHeader>
           <CardContent className="space-y-4">
              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Nom du Lieu</FormLabel><FormControl><Input placeholder="Ex: Plage..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField control={form.control} name="latitude" render={({ field }) => (<FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" placeholder="9.6809" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="longitude" render={({ field }) => (<FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" placeholder="100.0684" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
           </CardContent>
        </Card>
        
         {/* --- Additional Details Card --- */} 
        <Card>
          <CardHeader><CardTitle>Détails Additionnels</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>Note (0-5)</FormLabel><FormControl><Input type="number" step="0.1" min="0" max="5" placeholder="4.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="reviews" render={({ field }) => (<FormItem><FormLabel>Nombre d&apos;avis</FormLabel><FormControl><Input type="number" min="0" placeholder="120" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
               </div>
                <FormField control={form.control} name="galleryImages" render={({ field }) => (<FormItem><FormLabel>Images de Galerie (URLs)</FormLabel><FormControl><Textarea placeholder="https://ex.com/img1.jpg, ..." {...field} /></FormControl><FormDescription>Séparer par des virgules.</FormDescription><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>
        
         {/* --- Complex Fields (Placeholders) --- */}
        <Card>
          <CardHeader><CardTitle>Contenu Structuré (JSON)</CardTitle><CardDescription>Format JSON brut pour l&apos;instant.</CardDescription></CardHeader>
           <CardContent className="space-y-4">
            <FormField control={form.control} name="sections" render={({ field }) => (<FormItem><FormLabel>Sections (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="items" render={({ field }) => (<FormItem><FormLabel>Éléments (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contacts" render={({ field }) => (<FormItem><FormLabel>Contacts (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="practicalInfo" render={({ field }) => (<FormItem><FormLabel>Infos Pratiques (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='{...}' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="recommendations" render={({ field }) => (<FormItem><FormLabel>Recommandations (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="testimonials" render={({ field }) => (<FormItem><FormLabel>Témoignages (JSON)</FormLabel><FormControl><Textarea className="min-h-40 font-mono text-sm" placeholder='[...]' {...field} /></FormControl><FormMessage /></FormItem>)} />
           </CardContent>
        </Card>

        {/* --- Submission Button --- */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Mettre à jour le Guide
          </Button>
        </div>
      </form>
    </Form>
  );
} 