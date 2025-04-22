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
import { PartnerCategory } from "@/types/partner"

import { updatePartnerAction } from "../../actions"

// Define the partner type from Supabase schema
type PartnerRow = Tables<'partners'>;

// Basic schema for initial partner edit form
// Note: This is a simplified schema - in a real app you'd want to handle 
// all the different partner types and their specific fields
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
});

type FormValues = z.infer<typeof partnerSchema>;

interface PartnerEditFormProps {
  initialPartnerData: PartnerRow;
  partnerId: string;
}

export function PartnerEditForm({ initialPartnerData, partnerId }: PartnerEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Initialize form with default values from partner data
  const form = useForm<FormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: initialPartnerData.name,
      category: initialPartnerData.category,
      image: initialPartnerData.image,
      short_description: initialPartnerData.short_description,
      location: initialPartnerData.location,
      price_range: initialPartnerData.price_range,
      open_hours: initialPartnerData.open_hours,
      contact: initialPartnerData.contact,
      latitude: typeof initialPartnerData.coordinates === 'object' ? 
               (initialPartnerData.coordinates as any)?.latitude || 0 : 0,
      longitude: typeof initialPartnerData.coordinates === 'object' ? 
               (initialPartnerData.coordinates as any)?.longitude || 0 : 0,
      is_sponsored: initialPartnerData.is_sponsored || false,
      long_description: initialPartnerData.long_description,
      email: initialPartnerData.email || '',
      website: initialPartnerData.website || '',
    },
  });

  // Function to handle form submission
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Prepare data for update
      const partnerData = {
        ...values,
        coordinates: {
          latitude: values.latitude,
          longitude: values.longitude,
        },
        category: values.category as PartnerCategory,
      };

      // Update partner
      const result = await updatePartnerAction(partnerId, partnerData);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "Partenaire mis à jour avec succès",
        })
        router.push(`/dashboard/partners`)
      } else {
        throw new Error(result.error || "Failed to update partner")
      }
    } catch (error) {
      console.error("Error updating partner:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le partenaire. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Partner category options based on your partner.ts file
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
    // Add all other categories from partner.ts
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
                        <Input placeholder="+66 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="open_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heures d&apos;ouverture</FormLabel>
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
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>L&apos;URL du site web (optionnel).</FormDescription>
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
                <CardDescription>Informations sur l&apos;emplacement du partenaire</CardDescription>
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
                            step="0.000001" 
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
                            step="0.000001" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
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
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Mettre à jour le partenaire
          </Button>
        </div>
      </form>
    </Form>
  )
}