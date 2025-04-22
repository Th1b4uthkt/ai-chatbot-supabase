"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import { Tables } from "@/lib/supabase/types"

import { updateEventAction } from "../../actions"

// Define the event type from Supabase schema
type EventRow = Tables<'events'>;

// Schéma de validation pour le formulaire (same as before)
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
});

type FormValues = z.infer<typeof formSchema>;

interface EventEditFormProps {
  initialEventData: EventRow; // Use the correct type
  eventId: string;
}

// Helper function to prepare default values (run outside the component or memoized)
function prepareDefaultValues(initialEventData: EventRow): FormValues {
  let facilities = {}
  try {
    if (typeof initialEventData.facilities === 'string') {
      facilities = JSON.parse(initialEventData.facilities)
    } else if (initialEventData.facilities && typeof initialEventData.facilities === 'object') {
      facilities = initialEventData.facilities
    }
  } catch (e) {
    console.error('Error parsing facilities:', e)
  }

  let tickets = {}
  try {
    if (typeof initialEventData.tickets === 'string') {
      tickets = JSON.parse(initialEventData.tickets)
    } else if (initialEventData.tickets && typeof initialEventData.tickets === 'object') {
      tickets = initialEventData.tickets
    }
  } catch (e) {
    console.error('Error parsing tickets:', e)
  }

  return {
    title: initialEventData.title || "",
    category: initialEventData.category || "",
    image: initialEventData.image || "",
    time: initialEventData.time || "", // Might need formatting if datetime-local expects specific format
    location: initialEventData.location || "",
    price: initialEventData.price ? initialEventData.price.toString() : "", // price is string in schema, already string? Check DB type
    description: initialEventData.description || "",
    latitude: initialEventData.latitude || 0,
    longitude: initialEventData.longitude || 0,
    organizerName: initialEventData.organizer_name || "",
    recurrencePattern: initialEventData.recurrence_pattern || "none",
    recurrenceCustomPattern: initialEventData.recurrence_custom_pattern || "",
    duration: initialEventData.duration || "",
    tags: Array.isArray(initialEventData.tags) ? initialEventData.tags.join(', ') : initialEventData.tags || "",
    capacity: initialEventData.capacity || 0,
    ticketsUrl: (tickets as any)?.url || "",
    ticketsAvailableCount: (tickets as any)?.availableCount || 0,
    organizerEmail: initialEventData.organizer_contact_email || "",
    organizerPhone: initialEventData.organizer_contact_phone || "",
    organizerWebsite: initialEventData.organizer_website || "",
    parking: (facilities as any)?.parking || false,
    atm: (facilities as any)?.atm || false,
    foodAvailable: (facilities as any)?.foodAvailable || false,
    toilets: (facilities as any)?.toilets || false,
    wheelchair: (facilities as any)?.wheelchair || false,
    wifi: (facilities as any)?.wifi || false,
    petFriendly: (facilities as any)?.petFriendly || false,
    childFriendly: (facilities as any)?.childFriendly || false,
  };
}

export function EventEditForm({ initialEventData, eventId }: EventEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Prepare default values before calling useForm
  const defaultFormValues = prepareDefaultValues(initialEventData);

  // Initialize form with explicit type and pre-calculated default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues, // Use the object directly
  });

  // Function to submit the form using the server action
  // Explicitly type the values parameter to match FormValues
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const eventData = {
        ...values,
        price: parseFloat(values.price) || 0,
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
      }

      const formattedEventDataForAction = {
        title: eventData.title,
        category: eventData.category,
        image: eventData.image,
        time: eventData.time,
        location: eventData.location,
        description: eventData.description,
        price: eventData.price.toString(),
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        organizer_name: eventData.organizerName,
        organizer_contact_email: eventData.organizerEmail,
        organizer_contact_phone: eventData.organizerPhone,
        organizer_website: eventData.organizerWebsite,
        recurrence_pattern: eventData.recurrencePattern,
        recurrence_custom_pattern: eventData.recurrenceCustomPattern,
        tags: eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()) : undefined,
        facilities: eventData.facilities,
        tickets: eventData.tickets,
        duration: eventData.duration,
        capacity: eventData.capacity,
        day: !isNaN(new Date(values.time).getDay()) ? new Date(values.time).getDay() : null,
      };

      const result = await updateEventAction(eventId, formattedEventDataForAction as any); 
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "Événement mis à jour avec succès",
        })
        router.push(`/dashboard/events`) 
      } else {
        throw new Error(result.error || "Failed to update event via action")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour l'événement. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // The rest of the return JSX for the form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="organizer">Organisateur</TabsTrigger>
            <TabsTrigger value="facilities">Équipements</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Informations essentielles sur l&apos;événement</CardDescription>
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
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="conference">Conférence</SelectItem>
                          <SelectItem value="exhibition">Exposition</SelectItem>
                          <SelectItem value="sport">Sport</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
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

           <TabsContent value="details" className="space-y-4">
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
                        <Select onValueChange={field.onChange} value={field.value}>
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

            <TabsContent value="organizer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations sur l&apos;organisateur</CardTitle>
                  <CardDescription>Détails sur l&apos;organisation de l&apos;événement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <FormField
                    control={form.control}
                    name="organizerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l&apos;organisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l&apos;organisateur" {...field} />
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

            <TabsContent value="facilities" className="space-y-4">
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              "Mettre à jour l&apos;événement"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

