"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

import { createEventAction } from "../actions"

// Schéma de validation pour le formulaire
const formSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie" }),
  image: z.string().url({ message: "Veuillez entrer une URL d'image valide" }),
  time: z.string(),
  location: z.string().min(3, { message: "Le lieu doit contenir au moins 3 caractères" }),
  price: z.string(),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères" }),
  latitude: z.number(),
  longitude: z.number(),
  organizerName: z.string().min(2, { message: "Le nom de l'organisateur doit contenir au moins 2 caractères" }),
  recurrencePattern: z.string(),
  recurrenceCustomPattern: z.string().optional(),
  duration: z.string().min(1, { message: "Veuillez entrer une durée" }),
  tags: z.string().optional(),
  capacity: z.number().optional(),
  ticketsUrl: z.string().url({ message: "Veuillez entrer une URL de billetterie valide" }).optional(),
  ticketsAvailableCount: z.number().optional(),
  organizerEmail: z.string().email({ message: "Veuillez entrer une adresse email valide" }).optional(),
  organizerPhone: z.string().optional(),
  organizerWebsite: z.string().url({ message: "Veuillez entrer une URL valide" }).optional(),
  parking: z.boolean().optional(),
  atm: z.boolean().optional(),
  foodAvailable: z.boolean().optional(),
  toilets: z.boolean().optional(),
  wheelchair: z.boolean().optional(),
  wifi: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  childFriendly: z.boolean().optional(),
})

// Définir le type à partir du schéma
type FormValues = z.infer<typeof formSchema>

export default function NewEventPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Initialiser le formulaire avec des valeurs par défaut
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      image: "",
      time: "",
      location: "",
      price: "",
      description: "",
      latitude: 0,
      longitude: 0,
      organizerName: "",
      recurrencePattern: "none",
      duration: "",
      tags: "",
      capacity: 0,
      ticketsUrl: "",
      ticketsAvailableCount: 0,
      organizerEmail: "",
      organizerPhone: "",
      organizerWebsite: "",
      parking: false,
      atm: false,
      foodAvailable: false,
      toilets: false,
      wheelchair: false,
      wifi: false,
      petFriendly: false,
      childFriendly: false,
    },
  })

  // Function to handle form submission using the server action
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Format the data for the database action (similar to before)
      let dayOfWeek = ""
      try {
        const date = new Date(values.time)
        dayOfWeek = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)
      } catch (e) {
        console.error("Error parsing date:", e)
      }

      const formattedEventData = {
        title: values.title,
        category: values.category,
        image: values.image,
        time: values.time,
        location: values.location,
        description: values.description,
        price: values.price.toString(),
        latitude: values.latitude,
        longitude: values.longitude,
        organizer_name: values.organizerName,
        organizer_contact_email: values.organizerEmail,
        organizer_contact_phone: values.organizerPhone,
        organizer_website: values.organizerWebsite,
        recurrence_pattern: values.recurrencePattern,
        recurrence_custom_pattern: values.recurrenceCustomPattern,
        // Ensure 'day' is calculated correctly or handle potential errors
        day: !isNaN(new Date(values.time).getDay()) ? new Date(values.time).getDay() : null, 
        rating: 0, // Default value
        reviews: 0, // Default value
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        facilities: JSON.stringify({
          parking: values.parking,
          atm: values.atm,
          foodAvailable: values.foodAvailable,
          toilets: values.toilets,
          wheelchair: values.wheelchair,
          wifi: values.wifi,
          petFriendly: values.petFriendly,
          childFriendly: values.childFriendly,
        }),
        tickets: JSON.stringify({
          url: values.ticketsUrl,
          availableCount: values.ticketsAvailableCount,
        }),
        duration: values.duration,
        capacity: values.capacity,
      };

      // Call the server action
      const result = await createEventAction(formattedEventData as any); // Cast as any for now, refine type if needed

      if (result.success) {
        toast({
          title: "Succès",
          description: "Événement créé avec succès",
        });
        router.push(`/dashboard/events`);
      } else {
        throw new Error(result.error || "Failed to create event via action");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer l'événement. Veuillez réessayer.",
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
          <Link href="/dashboard/events">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer un nouvel événement</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="organizer">Organisateur</TabsTrigger>
              <TabsTrigger value="facilities">Équipements</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>Informations essentielles sur l événement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre de l'événement" {...field} />
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
                            <SelectItem value="party">Party</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="market">Marché</SelectItem>
                            <SelectItem value="workshop">Atelier</SelectItem>
                            <SelectItem value="culture">Culturel</SelectItem>
                            <SelectItem value="sport">Sportif</SelectItem>
                            <SelectItem value="wellness">Bien-être</SelectItem>
                            <SelectItem value="kids">Enfants</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Type d&apos;événement (e.g., party, festival, marché, etc.)
                        </FormDescription>
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date et heure</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu</FormLabel>
                          <FormControl>
                            <Input placeholder="Lieu de l'événement" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description de l'événement" className="min-h-32" {...field} />
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
                            <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                            <Input type="number" step="0.000001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Détails supplémentaires</CardTitle>
                  <CardDescription>Informations complémentaires sur l&apos;événement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée</FormLabel>
                        <FormControl>
                          <Input placeholder="2 heures" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurrencePattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Récurrence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une récurrence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Pas de récurrence</SelectItem>
                            <SelectItem value="daily">Quotidien</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuel</SelectItem>
                            <SelectItem value="custom">Personnalisé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("recurrencePattern") === "custom" && (
                    <FormField
                      control={form.control}
                      name="recurrenceCustomPattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motif de récurrence personnalisé</FormLabel>
                          <FormControl>
                            <Input placeholder="Tous les premiers lundis du mois" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="musique, live, rock" {...field} />
                        </FormControl>
                        <FormDescription>Séparez les tags par des virgules</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ticketsUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de billetterie</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/tickets" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ticketsAvailableCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de billets disponibles</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organizer" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organisateur</CardTitle>
                  <CardDescription>
                    Informations sur l&apos;organisateur de l&apos;événement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organizerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l organisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'organisateur" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizerEmail"
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
                    name="organizerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 1 23 45 67 89" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizerWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facilities" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Équipements disponibles</CardTitle>
                  <CardDescription>Services et commodités disponibles sur le lieu de l&apos;événement</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="parking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Parking</FormLabel>
                          <FormDescription>Parking disponible sur place</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="atm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Distributeur de billets</FormLabel>
                          <FormDescription>Distributeur de billets sur place</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foodAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Nourriture</FormLabel>
                          <FormDescription>Nourriture disponible sur place</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toilets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Toilettes</FormLabel>
                          <FormDescription>Toilettes disponibles sur place</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wheelchair"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Accès fauteuil roulant</FormLabel>
                          <FormDescription>Accessible aux personnes à mobilité réduite</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wifi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>WiFi</FormLabel>
                          <FormDescription>WiFi disponible sur place</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="petFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Animaux acceptés</FormLabel>
                          <FormDescription>Les animaux sont acceptés sur le lieu</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="childFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Adapté aux enfants</FormLabel>
                          <FormDescription>Événement adapté aux enfants</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Créer l&apos;événement
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
