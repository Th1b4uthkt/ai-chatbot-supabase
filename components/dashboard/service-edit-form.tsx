'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Info, Upload, X, Trash } from 'lucide-react';

import { ServiceType, getCategoryDisplayName } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ServiceCategory, 
  Subcategory, 
  PriceIndicator 
} from '@/types/common';
import { Checkbox } from '@/components/ui/checkbox';

// Basic validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  category: z.string().min(1, { message: 'Category is required' }),
  subcategory: z.string().min(1, { message: 'Subcategory is required' }),
  mainImage: z.string().optional(),
  shortDescription: z.string().min(10, { message: 'Short description must be at least 10 characters' }),
  longDescription: z.string().min(20, { message: 'Long description must be at least 20 characters' }),
  address: z.string().min(5, { message: 'Address is required' }),
  area: z.string().optional(),
  hours: z.string().min(3, { message: 'Hours of operation are required' }),
  open24h: z.boolean().optional(),
  priceRange: z.string().min(1, { message: 'Price range is required' }),
  currency: z.string().optional(),
  isSponsored: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// Tag Input component
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
    if (e.key === 'Enter' && inputValue.trim()) {
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
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground mt-1">Press Enter to add a tag</p>
    </div>
  );
}

// Interface for the component props
interface ServiceEditFormProps {
  service?: ServiceType;
  onSuccess?: () => void;
  redirectUrl?: string;
}

// Interfaces pour les composants spécifiques à chaque catégorie
interface CategoryFieldsProps {
  data: any;
  onChange: (data: any) => void;
}

// Composant pour les services d'hébergement
function AccommodationFields({ data, onChange }: CategoryFieldsProps) {
  const [roomTypes, setRoomTypes] = useState<any[]>(data?.roomTypes || []);
  
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };
  
  const addRoomType = () => {
    const newRoomType = {
      name: '',
      capacity: 2,
      pricePerNight: 0,
      amenities: []
    };
    
    const updatedRooms = [...roomTypes, newRoomType];
    setRoomTypes(updatedRooms);
    updateField('roomTypes', updatedRooms);
  };
  
  const updateRoomType = (index: number, field: string, value: any) => {
    const updatedRooms = [...roomTypes];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    
    setRoomTypes(updatedRooms);
    updateField('roomTypes', updatedRooms);
  };
  
  const removeRoomType = (index: number) => {
    const updatedRooms = roomTypes.filter((_, i) => i !== index);
    setRoomTypes(updatedRooms);
    updateField('roomTypes', updatedRooms);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Check-in Time</label>
          <Input
            type="text"
            value={data?.checkIn || ''}
            onChange={(e) => updateField('checkIn', e.target.value)}
            placeholder="e.g., 14:00"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Check-out Time</label>
          <Input
            type="text"
            value={data?.checkOut || ''}
            onChange={(e) => updateField('checkOut', e.target.value)}
            placeholder="e.g., 11:00"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Distance to Beach (meters)</label>
        <Input
          type="number"
          value={data?.distanceToBeach || ''}
          onChange={(e) => updateField('distanceToBeach', Number(e.target.value))}
          placeholder="Distance in meters"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Cancellation Policy</label>
        <Select
          value={data?.cancellationPolicy || ''}
          onValueChange={(value) => updateField('cancellationPolicy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Flexible">Flexible</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="Strict">Strict</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Room Types</label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addRoomType}
          >
            Add Room Type
          </Button>
        </div>
        
        {roomTypes.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
            No room types added yet
          </div>
        ) : (
          <div className="space-y-4">
            {roomTypes.map((room, index) => (
              <div key={index} className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Room Type {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRoomType(index)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Name</label>
                    <Input
                      value={room.name}
                      onChange={(e) => updateRoomType(index, 'name', e.target.value)}
                      placeholder="e.g., Standard Room"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Price Per Night (THB)</label>
                    <Input
                      type="number"
                      value={room.pricePerNight}
                      onChange={(e) => updateRoomType(index, 'pricePerNight', Number(e.target.value))}
                      placeholder="Price per night"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Capacity (persons)</label>
                    <Input
                      type="number"
                      value={room.capacity}
                      onChange={(e) => updateRoomType(index, 'capacity', Number(e.target.value))}
                      placeholder="Number of guests"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium">Amenities</label>
                  <TagInput
                    tags={room.amenities || []}
                    setTags={(tags) => updateRoomType(index, 'amenities', tags)}
                    placeholder="Add amenity and press Enter"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les services de santé
function HealthFields({ data, onChange }: CategoryFieldsProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emergency-service"
            checked={data?.emergencyService || false}
            onCheckedChange={(checked) => updateField('emergencyService', !!checked)}
          />
          <label htmlFor="emergency-service" className="text-sm font-medium cursor-pointer">
            Emergency Service Available
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="walk-in"
            checked={data?.walkInAccepted || false}
            onCheckedChange={(checked) => updateField('walkInAccepted', !!checked)}
          />
          <label htmlFor="walk-in" className="text-sm font-medium cursor-pointer">
            Walk-in Accepted
          </label>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Emergency Contact Number</label>
        <Input
          value={data?.emergencyNumber || ''}
          onChange={(e) => updateField('emergencyNumber', e.target.value)}
          placeholder="e.g., 1669"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Services Offered</label>
        <TagInput
          tags={data?.services || []}
          setTags={(tags) => updateField('services', tags)}
          placeholder="Add service and press Enter"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Insurance Accepted</label>
        <TagInput
          tags={data?.insuranceAccepted || []}
          setTags={(tags) => updateField('insuranceAccepted', tags)}
          placeholder="Add insurance and press Enter"
        />
      </div>
    </div>
  );
}

// Composant pour les services de bien-être
function WellnessFields({ data, onChange }: CategoryFieldsProps) {
  const [treatments, setTreatments] = useState<any[]>(data?.treatments || []);
  
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };
  
  const addTreatment = () => {
    const newTreatment = {
      name: '',
      price: 0,
      duration: 60
    };
    
    const updatedTreatments = [...treatments, newTreatment];
    setTreatments(updatedTreatments);
    updateField('treatments', updatedTreatments);
  };
  
  const updateTreatment = (index: number, field: string, value: any) => {
    const updatedTreatments = [...treatments];
    updatedTreatments[index] = { ...updatedTreatments[index], [field]: value };
    
    setTreatments(updatedTreatments);
    updateField('treatments', updatedTreatments);
  };
  
  const removeTreatment = (index: number) => {
    const updatedTreatments = treatments.filter((_, i) => i !== index);
    setTreatments(updatedTreatments);
    updateField('treatments', updatedTreatments);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="booking-required"
          checked={data?.bookingRequired || false}
          onCheckedChange={(checked) => updateField('bookingRequired', !!checked)}
        />
        <label htmlFor="booking-required" className="text-sm font-medium cursor-pointer">
          Booking Required
        </label>
      </div>
      
      <div>
        <label className="text-sm font-medium">Specialties</label>
        <TagInput
          tags={data?.specialties || []}
          setTags={(tags) => updateField('specialties', tags)}
          placeholder="Add specialty and press Enter"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Treatments</label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addTreatment}
          >
            Add Treatment
          </Button>
        </div>
        
        {treatments.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
            No treatments added yet
          </div>
        ) : (
          <div className="space-y-4">
            {treatments.map((treatment, index) => (
              <div key={index} className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Treatment {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTreatment(index)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium">Name</label>
                    <Input
                      value={treatment.name}
                      onChange={(e) => updateTreatment(index, 'name', e.target.value)}
                      placeholder="e.g., Thai Massage"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Price (THB)</label>
                    <Input
                      type="number"
                      value={treatment.price}
                      onChange={(e) => updateTreatment(index, 'price', Number(e.target.value))}
                      placeholder="Price"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={treatment.duration}
                      onChange={(e) => updateTreatment(index, 'duration', Number(e.target.value))}
                      placeholder="Duration in minutes"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les services de mobilité
function MobilityFields({ data, onChange }: CategoryFieldsProps) {
  const [vehicles, setVehicles] = useState<any[]>(data?.vehicles || []);
  
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };
  
  const addVehicle = () => {
    const newVehicle = {
      type: '',
      pricePerDay: 0
    };
    
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    updateField('vehicles', updatedVehicles);
  };
  
  const updateVehicle = (index: number, field: string, value: any) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    
    setVehicles(updatedVehicles);
    updateField('vehicles', updatedVehicles);
  };
  
  const removeVehicle = (index: number) => {
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    updateField('vehicles', updatedVehicles);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Service Type</label>
        <Select
          value={data?.serviceType || ''}
          onValueChange={(value) => updateField('serviceType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rental">Rental</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="tour">Tour</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="booking-required"
          checked={data?.bookingRequired || false}
          onCheckedChange={(checked) => updateField('bookingRequired', !!checked)}
        />
        <label htmlFor="booking-required" className="text-sm font-medium cursor-pointer">
          Booking Required
        </label>
      </div>
      
      <div>
        <label className="text-sm font-medium">Rental Requirements</label>
        <TagInput
          tags={data?.rentalRequirements || []}
          setTags={(tags) => updateField('rentalRequirements', tags)}
          placeholder="Add requirement and press Enter"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Vehicles</label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addVehicle}
          >
            Add Vehicle
          </Button>
        </div>
        
        {vehicles.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
            No vehicles added yet
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle, index) => (
              <div key={index} className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Vehicle {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVehicle(index)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium">Type</label>
                    <Input
                      value={vehicle.type}
                      onChange={(e) => updateVehicle(index, 'type', e.target.value)}
                      placeholder="e.g., Honda PCX 150"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Price Per Day (THB)</label>
                    <Input
                      type="number"
                      value={vehicle.pricePerDay}
                      onChange={(e) => updateVehicle(index, 'pricePerDay', Number(e.target.value))}
                      placeholder="Price per day"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les services immobiliers
function RealEstateFields({ data, onChange }: CategoryFieldsProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Years in Business</label>
        <Input
          type="number"
          value={data?.yearsInBusiness || ''}
          onChange={(e) => updateField('yearsInBusiness', Number(e.target.value))}
          placeholder="Number of years"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Services Offered</label>
        <TagInput
          tags={data?.servicesOffered || []}
          setTags={(tags) => updateField('servicesOffered', tags)}
          placeholder="Add service and press Enter"
        />
      </div>
    </div>
  );
}

export function ServiceEditForm({ service, onSuccess, redirectUrl }: ServiceEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(service?.tags || []);
  const [features, setFeatures] = useState<string[]>(service?.features || []);
  const [languages, setLanguages] = useState<string[]>(service?.languages || []);
  const [activeTab, setActiveTab] = useState('basic');
  const [coordinates, setCoordinates] = useState({
    latitude: service?.coordinates?.latitude || 0,
    longitude: service?.coordinates?.longitude || 0
  });
  const [contactInfo, setContactInfo] = useState({
    phone: service?.contactInfo?.phone || '',
    email: service?.contactInfo?.email || '',
    website: service?.contactInfo?.website || '',
    lineId: service?.contactInfo?.lineId || '',
    facebook: service?.contactInfo?.facebook || '',
    instagram: service?.contactInfo?.instagram || ''
  });
  const [accessibility, setAccessibility] = useState({
    wheelchairAccessible: service?.accessibility?.wheelchairAccessible || false,
    familyFriendly: service?.accessibility?.familyFriendly || false,
    petFriendly: service?.accessibility?.petFriendly || false
  });
  const [paymentMethods, setPaymentMethods] = useState({
    cash: service?.paymentMethods?.cash || false,
    card: service?.paymentMethods?.card || false,
    mobilePay: service?.paymentMethods?.mobilePay || false
  });
  
  // Category-specific state
  const [serviceData, setServiceData] = useState(service?.serviceData || {});
  
  const router = useRouter();
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name || '',
      category: service?.category || '',
      subcategory: service?.subcategory || '',
      mainImage: service?.mainImage || '',
      shortDescription: service?.shortDescription || '',
      longDescription: service?.longDescription || '',
      address: service?.address || '',
      area: service?.area || '',
      hours: service?.hours || '',
      open24h: service?.open24h || false,
      priceRange: service?.priceRange || '',
      currency: service?.currency || 'THB',
      isSponsored: service?.isSponsored || false,
      isFeatured: service?.isFeatured || false,
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Combine form values with additional state
      const submitData = {
        ...values,
        tags,
        features,
        languages,
        coordinates,
        contactInfo,
        accessibility,
        paymentMethods,
        serviceData,
      };
      
      // Determine if creating or updating
      const url = service 
        ? `/api/dashboard/services/${service.id}`
        : '/api/dashboard/services';
      
      const method = service ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save service');
      }
      
      const data = await response.json();
      
      toast({
        title: `Service ${service ? 'updated' : 'created'} successfully`,
        description: `"${values.name}" has been ${service ? 'updated' : 'created'}.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get subcategories based on selected category
  const getSubcategoriesForCategory = (category: string) => {
    const subcats: Record<string, Subcategory[]> = {
      [ServiceCategory.ACCOMMODATION]: [
        Subcategory.HOTEL,
        Subcategory.BUNGALOW,
        Subcategory.VILLA,
        Subcategory.GUESTHOUSE,
        Subcategory.HOSTEL,
      ],
      [ServiceCategory.MOBILITY]: [
        Subcategory.SCOOTER_RENTAL,
        Subcategory.CAR_RENTAL,
        Subcategory.TAXI,
        Subcategory.BIKE_RENTAL,
        Subcategory.PRIVATE_DRIVER,
        Subcategory.FERRY,
        Subcategory.BOAT_TOUR,
        Subcategory.SHUTTLE,
      ],
      [ServiceCategory.HEALTH]: [
        Subcategory.HOSPITAL,
        Subcategory.CLINIC,
        Subcategory.DOCTOR,
        Subcategory.PHARMACY,
        Subcategory.EMERGENCY,
      ],
      [ServiceCategory.WELLNESS]: [
        Subcategory.SPA,
        Subcategory.MASSAGE,
        Subcategory.YOGA_STUDIO,
        Subcategory.BEAUTY_SALON,
      ],
      [ServiceCategory.REAL_ESTATE]: [
        Subcategory.REAL_ESTATE_AGENCY,
        Subcategory.PROPERTY_MANAGEMENT,
        Subcategory.LONG_TERM_RENTAL,
      ],
    };
    
    return subcats[category] || [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="category">Category Specific</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter service name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter image URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset subcategory when category changes
                        form.setValue('subcategory', '');
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ServiceCategory).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
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
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!form.watch('category')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getSubcategoriesForCategory(form.watch('category')).map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Brief description of the service"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="longDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Detailed description of the service"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Range</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
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
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="THB" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-3">
              <FormLabel>Tags</FormLabel>
              <TagInput
                tags={tags}
                setTags={setTags}
                placeholder="Add tags (e.g., family-friendly, beachfront)"
              />
            </div>
          </TabsContent>
          
          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Full address of the service"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Thong Sala, Srithanu" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel>Latitude</FormLabel>
                <Input
                  type="number"
                  step="any"
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates({ 
                    ...coordinates, 
                    latitude: parseFloat(e.target.value) || 0 
                  })}
                  placeholder="e.g., 9.7180" 
                />
              </div>
              <div>
                <FormLabel>Longitude</FormLabel>
                <Input
                  type="number"
                  step="any"
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates({ 
                    ...coordinates, 
                    longitude: parseFloat(e.target.value) || 0 
                  })}
                  placeholder="e.g., 100.0030" 
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours of Operation</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Mon-Fri: 9am-5pm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="open24h"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-end space-x-3 space-y-0 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Open 24 hours</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-3">
              <FormLabel>Contact Information</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel className="text-xs">Phone</FormLabel>
                  <Input
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <FormLabel className="text-xs">Email</FormLabel>
                  <Input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <FormLabel className="text-xs">Website</FormLabel>
                  <Input
                    value={contactInfo.website}
                    onChange={(e) => setContactInfo({ ...contactInfo, website: e.target.value })}
                    placeholder="Website URL"
                  />
                </div>
                <div>
                  <FormLabel className="text-xs">Line ID</FormLabel>
                  <Input
                    value={contactInfo.lineId}
                    onChange={(e) => setContactInfo({ ...contactInfo, lineId: e.target.value })}
                    placeholder="Line ID"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <FormLabel>Features</FormLabel>
              <TagInput
                tags={features}
                setTags={setFeatures}
                placeholder="Add features (e.g., pool, free wifi)"
              />
            </div>
            
            <div className="space-y-3">
              <FormLabel>Languages Spoken</FormLabel>
              <TagInput
                tags={languages}
                setTags={setLanguages}
                placeholder="Add languages (e.g., English, Thai)"
              />
            </div>
            
            <div className="space-y-3">
              <FormLabel>Accessibility</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wheelchair"
                    checked={accessibility.wheelchairAccessible}
                    onCheckedChange={(checked) => 
                      setAccessibility({ ...accessibility, wheelchairAccessible: !!checked })
                    }
                  />
                  <label
                    htmlFor="wheelchair"
                    className="text-sm cursor-pointer"
                  >
                    Wheelchair Accessible
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="family"
                    checked={accessibility.familyFriendly}
                    onCheckedChange={(checked) => 
                      setAccessibility({ ...accessibility, familyFriendly: !!checked })
                    }
                  />
                  <label
                    htmlFor="family"
                    className="text-sm cursor-pointer"
                  >
                    Family Friendly
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pet"
                    checked={accessibility.petFriendly}
                    onCheckedChange={(checked) => 
                      setAccessibility({ ...accessibility, petFriendly: !!checked })
                    }
                  />
                  <label
                    htmlFor="pet"
                    className="text-sm cursor-pointer"
                  >
                    Pet Friendly
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <FormLabel>Payment Methods</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cash"
                    checked={paymentMethods.cash}
                    onCheckedChange={(checked) => 
                      setPaymentMethods({ ...paymentMethods, cash: !!checked })
                    }
                  />
                  <label
                    htmlFor="cash"
                    className="text-sm cursor-pointer"
                  >
                    Cash
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="card"
                    checked={paymentMethods.card}
                    onCheckedChange={(checked) => 
                      setPaymentMethods({ ...paymentMethods, card: !!checked })
                    }
                  />
                  <label
                    htmlFor="card"
                    className="text-sm cursor-pointer"
                  >
                    Card
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile"
                    checked={paymentMethods.mobilePay}
                    onCheckedChange={(checked) => 
                      setPaymentMethods({ ...paymentMethods, mobilePay: !!checked })
                    }
                  />
                  <label
                    htmlFor="mobile"
                    className="text-sm cursor-pointer"
                  >
                    Mobile Payment
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="isSponsored"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Sponsored</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Featured</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* Category Specific Tab */}
          <TabsContent value="category" className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Category-specific information</p>
                  <p className="text-sm text-muted-foreground">
                    Please fill out the information specific to {form.watch('category') ? getCategoryDisplayName(form.watch('category') as ServiceCategory) : 'this category'}.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              {!form.watch('category') ? (
                <div className="py-8 text-center text-muted-foreground">
                  Please select a category in the "Basic Info" tab first
                </div>
              ) : form.watch('category') === ServiceCategory.ACCOMMODATION ? (
                <AccommodationFields 
                  data={serviceData} 
                  onChange={(newData) => setServiceData(newData)}
                />
              ) : form.watch('category') === ServiceCategory.HEALTH ? (
                <HealthFields 
                  data={serviceData} 
                  onChange={(newData) => setServiceData(newData)}
                />
              ) : form.watch('category') === ServiceCategory.WELLNESS ? (
                <WellnessFields 
                  data={serviceData} 
                  onChange={(newData) => setServiceData(newData)}
                />
              ) : form.watch('category') === ServiceCategory.MOBILITY ? (
                <MobilityFields 
                  data={serviceData} 
                  onChange={(newData) => setServiceData(newData)}
                />
              ) : form.watch('category') === ServiceCategory.REAL_ESTATE ? (
                <RealEstateFields 
                  data={serviceData} 
                  onChange={(newData) => setServiceData(newData)}
                />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No specific fields for this category
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(redirectUrl || '/dashboard/services')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 