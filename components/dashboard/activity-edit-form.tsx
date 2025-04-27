'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { X, Plus, Loader2 } from 'lucide-react';
import { 
  Activity, 
  ActivityData,
  getCategoryDisplayName,
  getSubcategoryDisplayName 
} from '@/types/activity';
import { ActivityCategory, Subcategory, PriceIndicator } from '@/types/common';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  category: z.string(),
  subcategory: z.string(),
  shortDescription: z.string().min(10, { message: 'Short description must be at least 10 characters' }),
  longDescription: z.string().min(50, { message: 'Long description must be at least 50 characters' }),
  mainImage: z.string().url({ message: 'Please enter a valid URL' }).optional(),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  area: z.string().optional(),
  hours: z.string(),
  open24h: z.boolean(),
  priceRange: z.string(),
  currency: z.string(),
  features: z.array(z.string()),
  languages: z.array(z.string()),
  isSponsored: z.boolean(),
  isFeatured: z.boolean(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email({ message: 'Please enter a valid email' }).optional(),
    website: z.string().url({ message: 'Please enter a valid URL' }).optional(),
    lineId: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  tags: z.array(z.string()),
  paymentMethods: z.object({
    cash: z.boolean(),
    card: z.boolean(),
    mobilePay: z.boolean(),
  }),
  accessibility: z.object({
    wheelchairAccessible: z.boolean(),
    familyFriendly: z.boolean(),
    petFriendly: z.boolean(),
  }),
  activityData: z.any(),
});

// Define form type using the schema
type ActivityFormValues = z.infer<typeof formSchema>;

// Tag input component
interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

function TagInput({ tags, setTags, placeholder = "Add tag..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-1">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 pl-2">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
}

// Component props
interface ActivityEditFormProps {
  activity?: Activity;
  onSuccess?: () => void;
  redirectUrl?: string;
}

// Category-specific field components
interface CategoryFieldsProps {
  data: any;
  onChange: (data: any) => void;
}

// Component for Food & Drink category-specific fields
function FoodDrinkFields({ data, onChange }: CategoryFieldsProps) {
  const initialData = data || {
    cuisine: [],
    takeAway: false,
    delivery: false,
    reservation: false,
    happyHour: {
      available: false,
      time: ''
    },
    dietaryOptions: [],
    atmosphere: []
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...initialData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Cuisine</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.cuisine || []}
            setTags={(tags) => updateField('cuisine', tags)}
            placeholder="Add cuisine type..."
          />
        </FormControl>
        <FormDescription>
          Add the types of cuisine offered
        </FormDescription>
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.takeAway} 
              onCheckedChange={(value) => updateField('takeAway', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Take Away</FormLabel>
            <FormDescription>
              Offers take away option
            </FormDescription>
          </div>
        </FormItem>

        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.delivery} 
              onCheckedChange={(value) => updateField('delivery', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Delivery</FormLabel>
            <FormDescription>
              Offers delivery service
            </FormDescription>
          </div>
        </FormItem>

        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.reservation} 
              onCheckedChange={(value) => updateField('reservation', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Reservation</FormLabel>
            <FormDescription>
              Accepts reservations
            </FormDescription>
          </div>
        </FormItem>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem className="flex flex-col space-y-1">
          <FormLabel>Happy Hour</FormLabel>
          <div className="flex flex-row items-start space-x-3 rounded-md border p-4">
            <FormControl>
              <Checkbox 
                checked={initialData.happyHour?.available} 
                onCheckedChange={(value) => updateField('happyHour', {
                  ...initialData.happyHour,
                  available: value
                })}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Available</FormLabel>
            </div>
          </div>
          {initialData.happyHour?.available && (
            <FormItem>
              <FormLabel>Happy Hour Time</FormLabel>
              <FormControl>
                <Input 
                  value={initialData.happyHour?.time || ''}
                  onChange={(e) => updateField('happyHour', {
                    ...initialData.happyHour,
                    time: e.target.value
                  })}
                  placeholder="e.g. '17:00-19:00'"
                />
              </FormControl>
            </FormItem>
          )}
        </FormItem>

        <FormItem>
          <FormLabel>Dietary Options</FormLabel>
          <FormControl>
            <TagInput
              tags={initialData.dietaryOptions || []}
              setTags={(tags) => updateField('dietaryOptions', tags)}
              placeholder="Add dietary option..."
            />
          </FormControl>
          <FormDescription>
            E.g. Vegetarian, Vegan, Gluten-free
          </FormDescription>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Atmosphere</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.atmosphere || []}
            setTags={(tags) => updateField('atmosphere', tags)}
            placeholder="Add atmosphere..."
          />
        </FormControl>
        <FormDescription>
          E.g. Romantic, Family-friendly, Beachfront
        </FormDescription>
      </FormItem>
    </div>
  );
}

// Component for Leisure category-specific fields
function LeisureFields({ data, onChange }: CategoryFieldsProps) {
  const initialData = data || {
    activityType: '',
    activities: [],
    equipmentIncluded: false,
    bookingRequired: true,
    minimumAge: 0,
    weatherDependent: false,
    skillLevels: [],
    seasonality: []
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...initialData, [field]: value });
  };

  const addActivity = () => {
    const newActivity = {
      name: '',
      duration: '',
      price: 0,
      skillLevel: ''
    };
    updateField('activities', [...(initialData.activities || []), newActivity]);
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const updatedActivities = [...(initialData.activities || [])];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    updateField('activities', updatedActivities);
  };

  const removeActivity = (index: number) => {
    const updatedActivities = [...(initialData.activities || [])];
    updatedActivities.splice(index, 1);
    updateField('activities', updatedActivities);
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel>Activity Type</FormLabel>
        <FormControl>
          <Input
            value={initialData.activityType || ''}
            onChange={(e) => updateField('activityType', e.target.value)}
            placeholder="e.g. 'Snorkeling Tour', 'Yoga Class'"
          />
        </FormControl>
        <FormDescription>
          Main activity type offered
        </FormDescription>
      </FormItem>

      <FormItem>
        <FormLabel>Skill Levels</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.skillLevels || []}
            setTags={(tags) => updateField('skillLevels', tags)}
            placeholder="Add skill level..."
          />
        </FormControl>
        <FormDescription>
          E.g. Beginner, Intermediate, Advanced
        </FormDescription>
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.equipmentIncluded} 
              onCheckedChange={(value) => updateField('equipmentIncluded', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Equipment Included</FormLabel>
            <FormDescription>
              Check if equipment is provided
            </FormDescription>
          </div>
        </FormItem>

        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.bookingRequired} 
              onCheckedChange={(value) => updateField('bookingRequired', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Booking Required</FormLabel>
            <FormDescription>
              Check if booking is required
            </FormDescription>
          </div>
        </FormItem>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Minimum Age</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={initialData.minimumAge || 0}
              min={0}
              onChange={(e) => updateField('minimumAge', parseInt(e.target.value) || 0)}
            />
          </FormControl>
          <FormDescription>
            Minimum age requirement (0 for no minimum)
          </FormDescription>
        </FormItem>

        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.weatherDependent} 
              onCheckedChange={(value) => updateField('weatherDependent', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Weather Dependent</FormLabel>
            <FormDescription>
              Check if activity depends on weather conditions
            </FormDescription>
          </div>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Seasonality</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.seasonality || []}
            setTags={(tags) => updateField('seasonality', tags)}
            placeholder="Add season..."
          />
        </FormControl>
        <FormDescription>
          E.g. Year-round, Dry season only, High season
        </FormDescription>
      </FormItem>

      <Separator className="my-4" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Activities/Packages</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addActivity}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Activity
          </Button>
        </div>

        {initialData.activities && initialData.activities.length > 0 ? (
          <div className="space-y-4">
            {initialData.activities.map((activity: any, index: number) => (
              <Card key={index} className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeActivity(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        value={activity.name || ''}
                        onChange={(e) => updateActivity(index, 'name', e.target.value)}
                        placeholder="Activity name"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input 
                        value={activity.duration || ''}
                        onChange={(e) => updateActivity(index, 'duration', e.target.value)}
                        placeholder="e.g. '2 hours', 'Full day'"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        value={activity.price || 0}
                        min={0}
                        onChange={(e) => updateActivity(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Skill Level</FormLabel>
                    <FormControl>
                      <Input 
                        value={activity.skillLevel || ''}
                        onChange={(e) => updateActivity(index, 'skillLevel', e.target.value)}
                        placeholder="e.g. 'Beginner', 'All levels'"
                      />
                    </FormControl>
                  </FormItem>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border rounded-md text-muted-foreground">
            <p>No activities added yet. Click the button above to add an activity.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for Culture category-specific fields
function CultureFields({ data, onChange }: CategoryFieldsProps) {
  const initialData = data || {
    venueType: '',
    upcomingEvents: [],
    workshopsAvailable: false,
    photographyAllowed: true,
    culturalFocus: [],
    languages: []
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...initialData, [field]: value });
  };

  const addEvent = () => {
    const newEvent = {
      name: '',
      date: '',
      ticketPrice: 0
    };
    updateField('upcomingEvents', [...(initialData.upcomingEvents || []), newEvent]);
  };

  const updateEvent = (index: number, field: string, value: any) => {
    const updatedEvents = [...(initialData.upcomingEvents || [])];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    updateField('upcomingEvents', updatedEvents);
  };

  const removeEvent = (index: number) => {
    const updatedEvents = [...(initialData.upcomingEvents || [])];
    updatedEvents.splice(index, 1);
    updateField('upcomingEvents', updatedEvents);
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel>Venue Type</FormLabel>
        <FormControl>
          <Input
            value={initialData.venueType || ''}
            onChange={(e) => updateField('venueType', e.target.value)}
            placeholder="e.g. 'Art Gallery', 'Concert Hall', 'Festival Site'"
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Cultural Focus</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.culturalFocus || []}
            setTags={(tags) => updateField('culturalFocus', tags)}
            placeholder="Add cultural focus..."
          />
        </FormControl>
        <FormDescription>
          E.g. Art, Music, Local Heritage, Theatre
        </FormDescription>
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.workshopsAvailable} 
              onCheckedChange={(value) => updateField('workshopsAvailable', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Workshops Available</FormLabel>
            <FormDescription>
              Check if workshops or classes are available
            </FormDescription>
          </div>
        </FormItem>

        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.photographyAllowed} 
              onCheckedChange={(value) => updateField('photographyAllowed', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Photography Allowed</FormLabel>
            <FormDescription>
              Check if photography is allowed
            </FormDescription>
          </div>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Languages</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.languages || []}
            setTags={(tags) => updateField('languages', tags)}
            placeholder="Add language..."
          />
        </FormControl>
        <FormDescription>
          Languages in which the experience is available
        </FormDescription>
      </FormItem>

      <Separator className="my-4" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upcoming Events</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addEvent}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>

        {initialData.upcomingEvents && initialData.upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {initialData.upcomingEvents.map((event: any, index: number) => (
              <Card key={index} className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEvent(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input 
                        value={event.name || ''}
                        onChange={(e) => updateEvent(index, 'name', e.target.value)}
                        placeholder="Event name"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        value={event.date || ''}
                        onChange={(e) => updateEvent(index, 'date', e.target.value)}
                        placeholder="e.g. '2023-12-31', 'Every Friday'"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Ticket Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        value={event.ticketPrice || 0}
                        min={0}
                        onChange={(e) => updateEvent(index, 'ticketPrice', parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border rounded-md text-muted-foreground">
            <p>No events added yet. Click the button above to add an event.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for Shopping category-specific fields
function ShoppingFields({ data, onChange }: CategoryFieldsProps) {
  const initialData = data || {
    productTypes: [],
    specialProducts: [],
    priceNegotiation: false,
    localCrafts: false,
    brands: [],
    shoppingExperience: []
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...initialData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel>Product Types</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.productTypes || []}
            setTags={(tags) => updateField('productTypes', tags)}
            placeholder="Add product type..."
          />
        </FormControl>
        <FormDescription>
          Main types of products available
        </FormDescription>
      </FormItem>

      <FormItem>
        <FormLabel>Special Products</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.specialProducts || []}
            setTags={(tags) => updateField('specialProducts', tags)}
            placeholder="Add special product..."
          />
        </FormControl>
        <FormDescription>
          Signature or unique products offered
        </FormDescription>
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.priceNegotiation} 
              onCheckedChange={(value) => updateField('priceNegotiation', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Price Negotiation</FormLabel>
            <FormDescription>
              Check if price negotiation is possible
            </FormDescription>
          </div>
        </FormItem>

        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox 
              checked={initialData.localCrafts} 
              onCheckedChange={(value) => updateField('localCrafts', value)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Local Crafts</FormLabel>
            <FormDescription>
              Check if local crafts are available
            </FormDescription>
          </div>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Brands</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.brands || []}
            setTags={(tags) => updateField('brands', tags)}
            placeholder="Add brand..."
          />
        </FormControl>
        <FormDescription>
          Main brands carried, if applicable
        </FormDescription>
      </FormItem>

      <FormItem>
        <FormLabel>Shopping Experience</FormLabel>
        <FormControl>
          <TagInput
            tags={initialData.shoppingExperience || []}
            setTags={(tags) => updateField('shoppingExperience', tags)}
            placeholder="Add experience attribute..."
          />
        </FormControl>
        <FormDescription>
          E.g. Eco-friendly, Luxury, Authentic, Traditional
        </FormDescription>
      </FormItem>
    </div>
  );
}

// Main form component
export function ActivityEditForm({ activity, onSuccess, redirectUrl }: ActivityEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryData, setCategoryData] = useState<ActivityData>(activity?.activityData || {});
  const [selectedTab, setSelectedTab] = useState('general');
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: activity ? {
      name: activity.name,
      category: activity.category,
      subcategory: activity.subcategory,
      shortDescription: activity.shortDescription,
      longDescription: activity.longDescription,
      mainImage: activity.mainImage,
      address: activity.address,
      area: activity.area,
      hours: activity.hours,
      open24h: activity.open24h || false,
      priceRange: activity.priceRange,
      currency: activity.currency || 'THB',
      features: activity.features || [],
      languages: activity.languages || [],
      isSponsored: activity.isSponsored || false,
      isFeatured: activity.isFeatured || false,
      contactInfo: activity.contactInfo || {
        phone: '',
        email: '',
        website: '',
        lineId: '',
        facebook: '',
        instagram: ''
      },
      coordinates: activity.coordinates || {
        latitude: 0,
        longitude: 0
      },
      tags: activity.tags || [],
      paymentMethods: activity.paymentMethods || {
        cash: true,
        card: false,
        mobilePay: false
      },
      accessibility: activity.accessibility || {
        wheelchairAccessible: false,
        familyFriendly: false,
        petFriendly: false
      },
      activityData: activity.activityData || {}
    } : {
      name: '',
      category: Object.values(ActivityCategory)[0],
      subcategory: '',
      shortDescription: '',
      longDescription: '',
      address: '',
      hours: '',
      open24h: false,
      priceRange: PriceIndicator.MODERATE,
      currency: 'THB',
      features: [],
      languages: [],
      tags: [],
      isSponsored: false,
      isFeatured: false,
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      paymentMethods: {
        cash: true,
        card: false,
        mobilePay: false
      },
      accessibility: {
        wheelchairAccessible: false,
        familyFriendly: false,
        petFriendly: false
      },
      activityData: {}
    }
  });

  // Form submission handler
  async function onSubmit(values: ActivityFormValues) {
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const submitData = {
        ...values,
        activityData: categoryData
      };
      
      // API endpoint and method
      const endpoint = activity 
        ? `/api/dashboard/activities/${activity.id}` 
        : '/api/dashboard/activities';
      const method = activity ? 'PATCH' : 'POST';
      
      // Submit to API
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save activity');
      }
      
      // Success handling
      toast({
        title: activity ? 'Activity updated' : 'Activity created',
        description: activity 
          ? `${values.name} has been updated successfully.` 
          : `${values.name} has been created successfully.`,
      });
      
      // Callback or redirect
      if (onSuccess) {
        onSuccess();
      } else if (redirectUrl) {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save activity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get subcategories based on selected category
  const getSubcategoriesForCategory = (category: string) => {
    const subcategories: Record<ActivityCategory, Subcategory[]> = {
      [ActivityCategory.FOOD_DRINK]: [
        Subcategory.RESTAURANT,
        Subcategory.CAFE,
        Subcategory.BAR,
        Subcategory.BEACH_BAR,
        Subcategory.FOOD_TRUCK,
        Subcategory.STREET_FOOD,
      ],
      [ActivityCategory.LEISURE]: [
        Subcategory.DIVING,
        Subcategory.WATER_SPORTS,
        Subcategory.EXCURSION,
        Subcategory.HIKING,
        Subcategory.YOGA,
      ],
      [ActivityCategory.CULTURE]: [
        Subcategory.GALLERY,
        Subcategory.CONCERT_VENUE,
        Subcategory.FESTIVAL,
        Subcategory.WORKSHOP,
        Subcategory.CLASSES,
      ],
      [ActivityCategory.SHOPPING]: [
        Subcategory.MARKET,
        Subcategory.CLOTHING_STORE,
        Subcategory.SOUVENIR_SHOP,
        Subcategory.CRAFT_SHOP,
      ],
    };
    
    return subcategories[category as ActivityCategory] || [];
  };

  // Render category-specific fields based on selected category
  const renderCategoryFields = () => {
    const category = form.watch('category') as ActivityCategory;
    
    switch (category) {
      case ActivityCategory.FOOD_DRINK:
        return (
          <FoodDrinkFields
            data={categoryData}
            onChange={(data) => setCategoryData(data)}
          />
        );
      case ActivityCategory.LEISURE:
        return (
          <LeisureFields
            data={categoryData}
            onChange={(data) => setCategoryData(data)}
          />
        );
      case ActivityCategory.CULTURE:
        return (
          <CultureFields
            data={categoryData}
            onChange={(data) => setCategoryData(data)}
          />
        );
      case ActivityCategory.SHOPPING:
        return (
          <ShoppingFields
            data={categoryData}
            onChange={(data) => setCategoryData(data)}
          />
        );
      default:
        return (
          <div className="py-6 text-center text-muted-foreground">
            <p>Please select a category to see additional fields</p>
          </div>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <Tabs defaultValue="general" onValueChange={setSelectedTab} value={selectedTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="category">Category Specific</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        disabled={!!activity}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('subcategory', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ActivityCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {getCategoryDisplayName(category as ActivityCategory)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        disabled={!form.watch('category')}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getSubcategoriesForCategory(form.watch('category')).map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {getSubcategoryDisplayName(subcategory)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control as any}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description (used in listings)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="longDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormDescription>
                    A detailed description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="mainImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    URL to the main image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as any}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Hours</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="open24h"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Open 24 Hours
                      </FormLabel>
                      <FormDescription>
                        Check if the activity is available 24 hours
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="location" className="space-y-4">
            <FormField
              control={form.control as any}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    Zone or area (e.g. Thong Sala, Srithanu)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control as any}
                name="coordinates.latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="coordinates.longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control as any}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        tags={field.value || []}
                        setTags={(tags) => field.onChange(tags)}
                      />
                    </FormControl>
                    <FormDescription>
                      Add search tags for this activity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PriceIndicator).map((price) => (
                          <SelectItem key={price} value={price}>
                            {price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Promotional Settings</CardTitle>
                  <CardDescription>Mark the activity as featured or sponsored</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control as any}
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
                          <FormLabel>
                            Featured Activity
                          </FormLabel>
                          <FormDescription>
                            Featured activities appear in prominent positions
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="category" className="space-y-4">
            {renderCategoryFields()}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activity ? 'Update Activity' : 'Create Activity'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 