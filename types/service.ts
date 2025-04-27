import { ItemType, ServiceCategory, Subcategory, PriceIndicator } from './common';

export interface BaseServiceItem {
  id: string;
  name: string;
  type: ItemType.SERVICE;
  category: ServiceCategory;
  subcategory: Subcategory;
  
  // Image main and gallery
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
}

// Accommodation service
export interface AccommodationService extends BaseServiceItem {
  category: ServiceCategory.ACCOMMODATION;
  roomTypes: Array<{
    name: string;
    capacity: number;
    pricePerNight: number;
    amenities?: string[];
  }>;
  checkIn: string;
  checkOut: string;
  cancellationPolicy?: string;
  distanceToBeach?: number; // In meters
  facilities: string[];
}

// Mobility service
export interface MobilityService extends BaseServiceItem {
  category: ServiceCategory.MOBILITY;
  serviceType: "rental" | "taxi" | "driver" | "tour" | "transport";
  vehicles?: Array<{
    type: string;
    pricePerDay?: number;
    pricePerTrip?: number;
  }>;
  rentalRequirements?: string[];
  routes?: Array<{
    from: string;
    to: string;
    duration: string;
    price: number;
  }>;
  bookingRequired: boolean;
}

// Health service
export interface HealthService extends BaseServiceItem {
  category: ServiceCategory.HEALTH;
  services: string[];
  emergencyService: boolean;
  emergencyNumber?: string;
  walkInAccepted: boolean;
  insuranceAccepted?: string[];
  specialists?: Array<{
    name: string;
    specialization: string;
    languages?: string[];
  }>;
}

// Wellness service
export interface WellnessService extends BaseServiceItem {
  category: ServiceCategory.WELLNESS;
  treatments: Array<{
    name: string;
    duration: number; // in minutes
    price: number;
  }>;
  bookingRequired: boolean;
  specialties: string[];
}

// Real Estate service
export interface RealEstateService extends BaseServiceItem {
  category: ServiceCategory.REAL_ESTATE;
  servicesOffered: string[];
  propertySamples?: Array<{
    type: string;
    bedrooms?: number;
    priceRange: string;
  }>;
  yearsInBusiness?: number;
}

// Service type (combined)
export type Service = 
  | AccommodationService
  | MobilityService
  | HealthService
  | WellnessService
  | RealEstateService;

// Type Guards
export function isAccommodationService(service: Service): service is AccommodationService {
  return service.category === ServiceCategory.ACCOMMODATION;
}

export function isMobilityService(service: Service): service is MobilityService {
  return service.category === ServiceCategory.MOBILITY;
}

export function isHealthService(service: Service): service is HealthService {
  return service.category === ServiceCategory.HEALTH;
}

export function isWellnessService(service: Service): service is WellnessService {
  return service.category === ServiceCategory.WELLNESS;
}

export function isRealEstateService(service: Service): service is RealEstateService {
  return service.category === ServiceCategory.REAL_ESTATE;
}

// Helper to get display name for categories
export function getCategoryDisplayName(category: ServiceCategory): string {
  const displayNames: Record<ServiceCategory, string> = {
    [ServiceCategory.ACCOMMODATION]: 'Accommodation',
    [ServiceCategory.MOBILITY]: 'Mobility & Transport',
    [ServiceCategory.HEALTH]: 'Health & Medical',
    [ServiceCategory.WELLNESS]: 'Wellness & Spa',
    [ServiceCategory.REAL_ESTATE]: 'Real Estate'
  };
  
  return displayNames[category] || String(category);
}

// Helper to get display name for subcategories
export function getSubcategoryDisplayName(subcategory: Subcategory): string {
  const displayNames: Partial<Record<Subcategory, string>> = {
    // Accommodation
    [Subcategory.HOTEL]: 'Hotel',
    [Subcategory.BUNGALOW]: 'Bungalow',
    [Subcategory.VILLA]: 'Villa',
    [Subcategory.GUESTHOUSE]: 'Guesthouse',
    [Subcategory.HOSTEL]: 'Hostel',
    
    // Mobility
    [Subcategory.SCOOTER_RENTAL]: 'Scooter Rental',
    [Subcategory.CAR_RENTAL]: 'Car Rental',
    [Subcategory.TAXI]: 'Taxi',
    [Subcategory.BIKE_RENTAL]: 'Bike Rental',
    [Subcategory.PRIVATE_DRIVER]: 'Private Driver',
    [Subcategory.FERRY]: 'Ferry Service',
    [Subcategory.BOAT_TOUR]: 'Boat Tour',
    [Subcategory.SHUTTLE]: 'Shuttle Service',
    
    // Health
    [Subcategory.HOSPITAL]: 'Hospital',
    [Subcategory.CLINIC]: 'Clinic',
    [Subcategory.DOCTOR]: 'Doctor',
    [Subcategory.PHARMACY]: 'Pharmacy',
    [Subcategory.EMERGENCY]: 'Emergency Service',
    
    // Wellness
    [Subcategory.SPA]: 'Spa',
    [Subcategory.MASSAGE]: 'Massage',
    [Subcategory.YOGA_STUDIO]: 'Yoga Studio',
    [Subcategory.BEAUTY_SALON]: 'Beauty Salon',
    
    // Real Estate
    [Subcategory.REAL_ESTATE_AGENCY]: 'Real Estate Agency',
    [Subcategory.PROPERTY_MANAGEMENT]: 'Property Management',
    [Subcategory.LONG_TERM_RENTAL]: 'Long Term Rental'
  };
  
  return displayNames[subcategory] || String(subcategory);
} 