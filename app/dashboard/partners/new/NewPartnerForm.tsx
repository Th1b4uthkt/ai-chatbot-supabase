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
import { PartnerCategory, PartnerType } from "@/types/partner"

import { createPartnerAction } from "../actions"

// Basic schema for initial partner form
const partnerSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie" }),
  image: z.string().url({ message: "Veuillez entrer une URL d'image valide" }),
  short_description: z.string().min(10, { message: "La description courte doit contenir au moins 10 caractères" }),
  location: z.string().min(3, { message: "Le lieu doit contenir au moins 3 caractères" }),
  price_range: z.string().min(1, { message: "Veuillez sélectionner une gamme de prix" }),
  open_hours: z.string().min(3, { message: "Veuillez indiquer les heures d'ouverture" }),
  contact: z.string().min(3, { message: "Veuillez indiquer un contact" }),
  latitude: z.number(),
  longitude: z.number(),
  is_sponsored: z.boolean().optional(),
  long_description: z.string().min(20, { message: "La description longue doit contenir au moins 20 caractères" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }).optional().or(z.literal('')),
  website: z.string().url({ message: "Veuillez entrer une URL valide" }).optional().or(z.literal('')),
  rating: z.number().min(0, { message: "La note doit être entre 0 et 5" }).max(5),
  reviews: z.number().min(0, { message: "Le nombre d'avis doit être positif" }),
});

type FormValues = z.infer<typeof partnerSchema>;

export function NewPartnerForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      category: "",
      image: "",
      short_description: "",
      location: "",
      price_range: "$",
      open_hours: "",
      contact: "",
      latitude: 9.4889,
      longitude: 100.0048, // Default to Koh Phangan coordinates
      is_sponsored: false,
      long_description: "",
      email: "",
      website: "",
      rating: 0,
      reviews: 0,
    },
  });

  // Function to handle form submission
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Prepare data for creation - Pas besoin d'ID, Supabase le génère
      const partnerData: Partial<PartnerType> = {
        name: values.name,
        category: values.category as PartnerCategory,
        image: values.image,
        shortDescription: values.short_description,
        location: values.location,
        rating: values.rating,
        reviews: values.reviews,
        priceRange: values.price_range,
        features: [],
        openHours: values.open_hours,
        contact: values.contact,
        coordinates: {
          latitude: values.latitude,
          longitude: values.longitude,
        },
        gallery: [values.image], // Initialize with main image
        longDescription: values.long_description,
        is_sponsored: values.is_sponsored,
        website: values.website || undefined,
        email: values.email || undefined,
      };

      // Create partner
      const result = await createPartnerAction(partnerData as PartnerType);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "Partenaire créé avec succès",
        })
        router.push(`/dashboard/partners`)
      } else {
        throw new Error(result.error || "Failed to create partner")
      }
    } catch (error) {
      console.error("Error creating partner:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le partenaire. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Partner category options
  const categoryOptions = [
    { value: "location-scooter", label: "Location de scooter" },
    { value: "location-voiture", label: "Location de voiture" },
    { value: "location-bateau", label: "Location de bateau" },
    { value: "location-velo", label: "Location de vélo" },
    { value: "hebergement-appartement", label: "Appartement" },
    { value: "hebergement-bungalow", label: "Bungalow" },
    { value: "hebergement-villa", label: "Villa" },
    { value: "hebergement-guesthouse", label: "Guesthouse" },
    { value: "restaurant", label: "Restaurant" },
    { value: "cafe", label: "Café" },
    { value: "bar", label: "Bar" },
    { value: "street-food", label: "Street Food" },
    { value: "salon-massage", label: "Salon de massage" },
    { value: "spa", label: "Spa" },
    { value: "yoga-meditation", label: "Yoga & Méditation" },
    { value: "medical", label: "Services médicaux" },
    { value: "excursion", label: "Excursions" },
    { value: "plongee", label: "Plongée" },
    { value: "cours", label: "Cours & Formations" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="location">Localisation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Informations essentielles sur le partenaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du partenaire" {...field} />
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
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
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
                      <FormLabel>Description courte</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description courte du partenaire" {...field} />
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
                      <FormLabel>Gamme de prix</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une gamme de prix" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="$">$ (Économique)</SelectItem>
                          <SelectItem value="$$">$$ (Moyen)</SelectItem>
                          <SelectItem value="$$$">$$$ (Haut de gamme)</SelectItem>
                          <SelectItem value="$$$$">$$$$ (Luxe)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="5"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>Note de 0 à 5</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reviews"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre d avis</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value, 10))} 
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

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails</CardTitle>
                <CardDescription>Informations détaillées sur le partenaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description longue</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description complète du partenaire" className="min-h-32" {...field} />
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
                        <Input placeholder="Ex: +66 12 345 6789" {...field} />
                      </FormControl>
                       <FormDescription>Numéro de téléphone ou autre contact principal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="open_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heures d ouverture</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 9:00 - 18:00" {...field} />
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
                      <FormLabel>Site Web</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com" {...field} />
                      </FormControl>
                       <FormDescription>L URL du site web (optionnel).</FormDescription>
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
                <CardTitle>Localisation</CardTitle>
                <CardDescription>Informations sur l emplacement du partenaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
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
                            step="any" 
                            placeholder="9.739" 
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
                            step="any" 
                            placeholder="100.015" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_sponsored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Sponsorisé</FormLabel>
                        <FormDescription>
                          Mettre en avant ce partenaire comme sponsorisé.
                        </FormDescription>
                      </div>
                      <FormControl>
                         {/* Shadcn Switch component */}
                         {/* <Switch checked={field.value} onCheckedChange={field.onChange} /> */}
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Création...
            </>
          ) : (
            "Créer le partenaire"
          )}
        </Button>
      </form>
    </Form>
  )
} 