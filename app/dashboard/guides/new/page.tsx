"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { GuideCategory, GuideType } from "@/types/guide"; // Import Guide types

import { createGuideAction } from "../actions"; // Import the create action

// Zod schema for the form - based on BaseGuideType + some GuideType fields
// Adapt this schema carefully based on your GuideType and database structure
const guideFormSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie." }), // Consider using z.enum(GuideCategory values) if possible
  mainImage: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
  shortDescription: z.string().min(10, { message: "La description courte doit contenir au moins 10 caractères." }),
  longDescription: z.string().min(20, { message: "La description longue doit contenir au moins 20 caractères." }),
  slug: z.string().optional(), // Add validation if needed (e.g., regex for slugs)
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional(), // Will be processed into string[] before saving
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  galleryImages: z.string().optional(), // Simple comma-separated URLs for now
  // Placeholder fields for complex types - Needs more elaborate handling
  sections: z.string().optional(), // e.g., JSON string or handled via dedicated UI
  items: z.string().optional(), // e.g., JSON string or handled via dedicated UI
  contacts: z.string().optional(), // e.g., JSON string or handled via dedicated UI
  practicalInfo: z.string().optional(), // e.g., JSON string or handled via dedicated UI
  recommendations: z.string().optional(), // e.g., JSON string or handled via dedicated UI
  testimonials: z.string().optional(), // e.g., JSON string or handled via dedicated UI
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
      sections: "[]", // Default to empty JSON array string
      items: "[]",
      contacts: "[]",
      practicalInfo: "{}", // Default to empty JSON object string
      recommendations: "[]",
      testimonials: "[]",
    },
  });

  async function onSubmit(values: GuideFormValues) {
    setIsSubmitting(true);
    try {
      // --- Data Transformation --- 
      // Transform form values to match the TablesInsert<'guides'> structure
      // This is crucial and depends heavily on your DB schema and GuideType
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const galleryArray = values.galleryImages ? values.galleryImages.split(',').map(url => url.trim()).filter(Boolean) : [];
      
      // Attempt to parse JSON strings, default to basic structure on error
      const parseJsonOrEmpty = (jsonString: string | undefined, defaultVal: any = []) => {
        if (!jsonString) return defaultVal;
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn("Failed to parse JSON string:", jsonString, e);
          toast({ title: "Erreur de format", description: `Le champ JSON '${jsonString.substring(0,20)}...' est invalide.`, variant: "destructive" });
          return defaultVal; // Return default on error to avoid submission failure
        }
      };
      
      const formattedGuideData = {
        // BaseGuideType fields
        title: values.title,
        category: values.category as GuideCategory, 
        mainImage: values.mainImage,
        shortDescription: values.shortDescription,
        longDescription: values.longDescription,
        slug: values.slug || undefined, // Handle optional slug
        rating: values.rating,
        reviews: values.reviews,
        isFeatured: values.isFeatured,
        tags: tagsArray,
        // lastUpdatedAt: will be set by DB trigger or default
        location: values.location || undefined,
        coordinates: values.latitude && values.longitude ? { latitude: values.latitude, longitude: values.longitude } : undefined,
        galleryImages: galleryArray,
        
        // GuideType complex fields (assuming JSON/JSONB columns)
        // Ensure these match your `TablesInsert<'guides'>` expected types
        sections: parseJsonOrEmpty(values.sections, []), // Expects Section[] or similar JSON
        items: parseJsonOrEmpty(values.items, []),       // Expects ListItem[] or similar JSON
        contacts: parseJsonOrEmpty(values.contacts, []), // Expects Contact[] or similar JSON
        practicalInfo: parseJsonOrEmpty(values.practicalInfo, {}), // Expects PracticalInfo or similar JSON
        recommendations: parseJsonOrEmpty(values.recommendations, []), // Expects Recommendation[] or similar JSON
        testimonials: parseJsonOrEmpty(values.testimonials, []), // Expects Testimonial[] or similar JSON
        
        // Add any other required fields for TablesInsert<'guides'> with defaults if needed
        // Example: user_id if you track who created the guide
      };
      
      // --- Server Action Call --- 
      const result = await createGuideAction(formattedGuideData as any); // Use `as any` for now due to potential type mismatches

      if (result?.success === false) { // Check for explicit failure from action
        throw new Error(result.error || "Une erreur inconnue est survenue lors de la création.");
      }

      // If the action redirects, this part might not be reached
      // Otherwise, show success toast and navigate
      toast({
        title: "Succès",
        description: "Guide créé avec succès !",
      });
      // router.push("/dashboard/guides"); // Redirect is handled by the action

    } catch (error) {
      console.error("Error creating guide:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le guide. Veuillez réessayer.",
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
        <h1 className="text-3xl font-bold">Créer un nouveau guide</h1>
      </div>

      <Form {...form}>
        {/* Add novalidate to prevent default browser validation interfering with react-hook-form */}
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
          
          {/* --- General Information Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Détails de base du guide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre du guide" {...field} />
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
                    <FormLabel>Catégorie *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guideCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/-/g, ' ') /* Simple formatting */} 
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
                      <Input placeholder="titre-du-guide-en-minuscules" {...field} />
                    </FormControl>
                    <FormDescription>Partie de l&apos;URL (optionnel, laisser vide pour auto-génération si configuré).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Principale (URL) *</FormLabel>
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
                    <FormLabel>Description Courte *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Une description courte et accrocheuse du guide..."
                        {...field}
                        rows={3} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ce texte est utilisé pour les aperçus et l&apos;optimisation SEO.
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
                    <FormLabel>Description Longue *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenu principal du guide. Utilisez le markdown pour le formatage si nécessaire."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Contenu principal du guide. Utilisez le markdown pour le formatage si nécessaire.
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
                    <FormLabel>Tags (séparés par des virgules)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: visa, santé, plage" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mots-clés pour aider à la recherche et au filtrage.
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
                      <FormLabel>Mettre en avant</FormLabel>
                      <FormDescription>
                        Le guide apparaîtra dans les sections mises en avant.
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
              <CardTitle>Localisation (Optionnel)</CardTitle>
               <CardDescription>Si le guide concerne un lieu spécifique.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu (Optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Koh Phangan, Thailand" {...field} />
                      </FormControl>
                      <FormDescription>
                        Lieu spécifique associé au guide, si pertinent.
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
              <CardTitle>Détails Additionnels</CardTitle>
              <CardDescription>Informations de localisation, galerie, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                   <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (0-5)</FormLabel>
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
                          <FormLabel>Nombre d&apos;avis</FormLabel>
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
                          <FormLabel>Images de la galerie (URLs séparées par des virgules)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="https://exemple.com/img1.jpg, https://exemple.com/img2.jpg"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                           <FormDescription>
                            Ajoutez des URLs d&apos;images supplémentaires pour une galerie.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
            </CardContent>
          </Card>
          
           {/* --- Complex Fields (Placeholders) --- */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu Spécifique (JSON)</CardTitle>
              <CardDescription>Modifier ces champs prudemment. Utilisez un format JSON valide pour les listes ([...]) ou objets (&#123;...&#125;).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sections */}
              <FormField
                control={form.control}
                name="sections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sections (JSON)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-40 font-mono text-sm" placeholder='[{"id":"sec1", "title":"Titre Section", "content":"Contenu...", "order":1}]' {...field} />
                    </FormControl>
                     <FormDescription>Structure JSON pour les sections du guide. Voir `types/guide.ts`.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Éléments de Liste (JSON)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-40 font-mono text-sm" placeholder='[{"id":"item1", "title":"Nom Item", "description":"Desc..."}]' {...field} />
                    </FormControl>
                     <FormDescription>Structure JSON pour les éléments listés (plages, restos...). Voir `types/guide.ts`.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add similar Textarea fields for contacts, practicalInfo, recommendations, testimonials */}
             </CardContent>
          </Card>

          {/* --- Submission Button --- */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Créer le Guide
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 