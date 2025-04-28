'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Save,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { EventType } from '@/types/events';

// Define the form schema using Zod
const formSchema = z.object({
  // Basic Info
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  image: z.string().optional(),

  // Time & Location
  time: z.string().optional(),
  day: z.number().min(0).max(6).optional(),
  location: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  duration: z.string().optional(),

  // Pricing & Ratings
  price: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().min(0).optional(),

  // Organizer
  organizer: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
  }).optional(),

  // Recurrence
  recurrence: z.object({
    pattern: z.enum(["once", "daily", "weekly", "monthly", "yearly", "custom"]).optional(),
    customPattern: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),

  // Facilities
  facilities: z.object({
    parking: z.boolean().optional(),
    atm: z.boolean().optional(),
    foodAvailable: z.boolean().optional(),
    toilets: z.boolean().optional(),
    wheelchair: z.boolean().optional(),
    wifi: z.boolean().optional(),
    petFriendly: z.boolean().optional(),
    childFriendly: z.boolean().optional(),
  }).optional(),

  // Tickets
  tickets: z.object({
    url: z.string().optional(),
    availableCount: z.number().optional(),
    types: z.array(
      z.object({
        name: z.string(),
        price: z.string(),
        description: z.string().optional(),
      })
    ).optional(),
  }).optional(),

  // Additional
  tags: z.array(z.string()).optional(),
  capacity: z.number().positive().optional(),
  attendeeCount: z.number().min(0).optional(),
});

// Custom component for tag inputs
interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

function TagInput({ tags, setTags, placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState("");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="text-xs hover:bg-gray-200 rounded-full size-4 inline-flex items-center justify-center"
            >
              <span className="sr-only">Remove</span>
              ×
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}

// Ticket type component
interface TicketTypeInputProps {
  value: { name: string; price: string; description?: string }[];
  onChange: (value: { name: string; price: string; description?: string }[]) => void;
}

function TicketTypeInput({ value, onChange }: TicketTypeInputProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  
  const addTicketType = () => {
    if (name.trim() && price.trim()) {
      onChange([...value, { name, price, description }]);
      setName("");
      setPrice("");
      setDescription("");
    }
  };
  
  const removeTicketType = (index: number) => {
    const newTicketTypes = [...value];
    newTicketTypes.splice(index, 1);
    onChange(newTicketTypes);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {value.map((ticket, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex-1">
              <div className="font-medium">{ticket.name}</div>
              <div className="text-sm text-muted-foreground">
                {ticket.price} {ticket.description && `- ${ticket.description}`}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTicketType(index)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ticket name"
          />
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTicketType}
          disabled={!name.trim() || !price.trim()}
        >
          Add Ticket Type
        </Button>
      </div>
    </div>
  );
}

interface EventEditFormProps {
  event?: EventType;
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function EventEditForm({ event, onSuccess, redirectUrl }: EventEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [ticketTypes, setTicketTypes] = useState<{ name: string; price: string; description?: string }[]>(
    event?.tickets?.types || []
  );

  // Initialize form with event data (if editing) or defaults (if creating)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      category: event?.category || '',
      image: event?.image || '',
      time: event?.time || new Date().toISOString(),
      day: event?.day !== undefined ? event.day : new Date().getDay(),
      location: event?.location || '',
      coordinates: event?.coordinates || { latitude: 0, longitude: 0 },
      duration: event?.duration || '',
      price: event?.price || '',
      rating: event?.rating || 0,
      reviews: event?.reviews || 0,
      organizer: event?.organizer || {
        name: '',
        image: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
      },
      recurrence: event?.recurrence || {
        pattern: 'once',
        customPattern: '',
        endDate: '',
      },
      facilities: event?.facilities || {
        parking: false,
        atm: false,
        foodAvailable: false,
        toilets: false,
        wheelchair: false,
        wifi: false,
        petFriendly: false,
        childFriendly: false,
      },
      tickets: event?.tickets || {
        url: '',
        availableCount: 0,
        types: [],
      },
      tags: event?.tags || [],
      capacity: event?.capacity || undefined,
      attendeeCount: event?.attendeeCount || 0,
    },
  });

  // Category options
  const categoryOptions = [
    "Music",
    "Art",
    "Food",
    "Sports",
    "Markets",
    "Nightlife",
    "Culture",
    "Comedy",
    "Wellness",
    "Education",
    "Other"
  ];

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      // Add ticket types from state
      const formData = {
        ...values,
        tickets: {
          ...values.tickets,
          types: ticketTypes,
        },
      };
      
      const url = event 
        ? `/api/dashboard/events/${event.id}` 
        : '/api/dashboard/events';
      
      const method = event ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Failed to ${event ? 'update' : 'create'} event`);
      }
      
      toast({
        title: event ? 'Event updated' : 'Event created',
        description: event 
          ? 'The event has been updated successfully' 
          : 'The event has been created successfully',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save event',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="time-location">Time & Location</TabsTrigger>
            <TabsTrigger value="details">Additional Details</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                  <FormItem className="col-span-2">
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of the event image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter event description" 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput 
                      tags={field.value || []} 
                      setTags={(newTags) => field.onChange(newTags)}
                      placeholder="Add tags and press Enter"
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help categorize and find the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Time & Location Tab */}
          <TabsContent value="time-location" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP p")
                            ) : (
                              <span>Select date and time</span>
                            )}
                            <CalendarIcon className="mr-2 size-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const currentDate = field.value ? new Date(field.value) : new Date();
                              const hours = currentDate.getHours();
                              const minutes = currentDate.getMinutes();
                              
                              date.setHours(hours);
                              date.setMinutes(minutes);
                              
                              field.onChange(date.toISOString());
                              // Also update the day of week
                              form.setValue('day', date.getDay());
                            }
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const date = field.value ? new Date(field.value) : new Date();
                              date.setHours(hours);
                              date.setMinutes(minutes);
                              field.onChange(date.toISOString());
                            }}
                            defaultValue={
                              field.value
                                ? `${new Date(field.value).getHours().toString().padStart(2, '0')}:${new Date(field.value).getMinutes().toString().padStart(2, '0')}`
                                : undefined
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
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
                      <Input placeholder="e.g. 2 hours, All day" {...field} />
                    </FormControl>
                    <FormDescription>
                      How long the event will last
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coordinates.latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="e.g. 13.7563" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value?.toString() || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coordinates.longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="e.g. 100.5018" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value?.toString() || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Recurrence Pattern</h3>
                  
                  <FormField
                    control={form.control}
                    name="recurrence.pattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Frequency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="once">One-time event</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('recurrence.pattern') === 'custom' && (
                    <FormField
                      control={form.control}
                      name="recurrence.customPattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Pattern</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. First Monday of each month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('recurrence.pattern') !== 'once' && (
                    <FormField
                      control={form.control}
                      name="recurrence.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Select end date</span>
                                  )}
                                  <Clock className="mr-2 size-4" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => date && field.onChange(date.toISOString())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the recurring event will end
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Additional Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $15, Free, $10-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Maximum number of attendees" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value?.toString() || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Organizer Information</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organizer.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organizer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organizer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="organizer.contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="organizer.contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="organizer.website"
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
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Facilities & Amenities</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="facilities.parking"
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
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.atm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>ATM</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.foodAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Food</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.toilets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Toilets</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.wheelchair"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Wheelchair</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.wifi"
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
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.petFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Pet Friendly</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facilities.childFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Child Friendly</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="tickets.url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Purchase URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/tickets" {...field} />
                    </FormControl>
                    <FormDescription>
                      External link where users can purchase tickets
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tickets.availableCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Tickets</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Number of available tickets" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value?.toString() || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Ticket Types</FormLabel>
                <TicketTypeInput 
                  value={ticketTypes}
                  onChange={setTicketTypes}
                />
                <FormDescription>
                  Define different ticket types and prices
                </FormDescription>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="sticky bottom-0 py-4 bg-background/95 backdrop-blur border-t mt-8">
          <div className="container flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {event ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  {event ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 