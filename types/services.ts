import { ServiceCategory, Subcategory, PriceIndicator } from './common';

// Base service interface with common properties
export interface ServiceType {
  id: string;
  name: string;
  type: 'service';
  category: ServiceCategory;
  subcategory: Subcategory;
  
  // Image & gallery
  mainImage: string;
  galleryImages?: string[];
  
  // Descriptions
  shortDescription: string;
  longDescription: string;
  
  // Location
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  area?: string; // Zone of the island (Thong Sala, Srithanu, etc.)
  
  // Contact info
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    lineId?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Hours
  hours: string;
  open24h?: boolean;
  
  // Rating
  rating?: {
    score: number; // Out of 5 stars
    reviewCount: number;
  };
  
  // Tags for search and filtering
  tags: string[];
  
  // Price 
  priceRange: PriceIndicator;
  currency?: string; // THB by default
  
  // Important features
  features: string[];
  
  // Languages spoken
  languages?: string[];
  
  // Last update
  updatedAt: string;
  
  // Promotion and highlight
  isSponsored?: boolean;
  isFeatured?: boolean;
  
  // Payment methods
  paymentMethods?: {
    cash?: boolean;
    card?: boolean;
    mobilePay?: boolean;
  };
  
  // Accessibility
  accessibility?: {
    wheelchairAccessible?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
  };
  
  // Service-specific data varies by category
  serviceData: any; // This will be typed differently depending on the category
}

// Helper functions to get display names
export function getCategoryDisplayName(category: ServiceCategory): string {
  const displayNames: Record<ServiceCategory, string> = {
    accommodation: 'Accommodation',
    mobility: 'Mobility & Transport',
    health: 'Health & Medical',
    wellness: 'Wellness & Spa',
    real_estate: 'Real Estate'
  };
  
  return displayNames[category] || String(category);
}

export function getSubcategoryDisplayName(subcategory: Subcategory): string {
  const displayNames: Partial<Record<Subcategory, string>> = {
    // Accommodation
    hotel: 'Hotel',
    bungalow: 'Bungalow',
    villa: 'Villa',
    guesthouse: 'Guesthouse',
    hostel: 'Hostel',
    
    // Mobility
    scooter_rental: 'Scooter Rental',
    car_rental: 'Car Rental',
    taxi: 'Taxi',
    bike_rental: 'Bike Rental',
    private_driver: 'Private Driver',
    ferry: 'Ferry Service',
    boat_tour: 'Boat Tour',
    shuttle: 'Shuttle Service',
    
    // Health
    hospital: 'Hospital',
    clinic: 'Clinic',
    doctor: 'Doctor',
    pharmacy: 'Pharmacy',
    emergency: 'Emergency Service',
    
    // Wellness
    spa: 'Spa',
    massage: 'Massage',
    yoga_studio: 'Yoga Studio',
    beauty_salon: 'Beauty Salon',
    
    // Real Estate
    real_estate_agency: 'Real Estate Agency',
    property_management: 'Property Management',
    long_term_rental: 'Long Term Rental'
  };
  
  return displayNames[subcategory] || String(subcategory);
} 