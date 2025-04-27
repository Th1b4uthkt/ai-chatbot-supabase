import { ItemType, ActivityCategory, Subcategory, PriceIndicator } from './common';

export interface BaseActivityItem {
  id: string;
  name: string;
  type: ItemType.ACTIVITY;
  category: ActivityCategory;
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
  
  // Category-specific activity data
  activityData?: ActivityData;
}

// Food & Drink activities
export interface FoodDrinkActivity extends BaseActivityItem {
  category: ActivityCategory.FOOD_DRINK;
}

// Leisure activities
export interface LeisureActivity extends BaseActivityItem {
  category: ActivityCategory.LEISURE;
}

// Culture activities
export interface CultureActivity extends BaseActivityItem {
  category: ActivityCategory.CULTURE;
}

// Shopping activities
export interface ShoppingActivity extends BaseActivityItem {
  category: ActivityCategory.SHOPPING;
}

// Activity type (combined)
export type Activity = 
  | FoodDrinkActivity
  | LeisureActivity
  | CultureActivity
  | ShoppingActivity;

// Common ActivityData type with optional fields for all possible properties
export interface ActivityData {
  // Food & Drink
  cuisine?: string[];
  specialties?: string[];
  takeAway?: boolean;
  delivery?: boolean;
  reservation?: boolean;
  happyHour?: {
    available: boolean;
    time?: string;
  };
  dietaryOptions?: string[];
  atmosphere?: string[];
  
  // Leisure
  activityType?: string;
  activities?: Array<{
    name: string;
    duration: string;
    price: number;
    skillLevel?: string;
  }>;
  equipmentIncluded?: boolean;
  bookingRequired?: boolean;
  minimumAge?: number;
  weatherDependent?: boolean;
  
  // Culture
  venueType?: string;
  upcomingEvents?: Array<{
    name: string;
    date: string;
    ticketPrice?: number;
  }>;
  workshopsAvailable?: boolean;
  photographyAllowed?: boolean;
  
  // Shopping
  productTypes?: string[];
  specialProducts?: string[];
  priceNegotiation?: boolean;
  localCrafts?: boolean;

  // Any other custom properties
  [key: string]: any;
}

// Type Guards
export function isFoodDrinkActivity(activity: Activity): activity is FoodDrinkActivity {
  return activity.category === ActivityCategory.FOOD_DRINK;
}

export function isLeisureActivity(activity: Activity): activity is LeisureActivity {
  return activity.category === ActivityCategory.LEISURE;
}

export function isCultureActivity(activity: Activity): activity is CultureActivity {
  return activity.category === ActivityCategory.CULTURE;
}

export function isShoppingActivity(activity: Activity): activity is ShoppingActivity {
  return activity.category === ActivityCategory.SHOPPING;
}

// Helper to get display name for categories
export function getCategoryDisplayName(category: ActivityCategory): string {
  const displayNames: Record<ActivityCategory, string> = {
    [ActivityCategory.FOOD_DRINK]: 'Food & Drink',
    [ActivityCategory.LEISURE]: 'Leisure & Sports',
    [ActivityCategory.CULTURE]: 'Culture & Events',
    [ActivityCategory.SHOPPING]: 'Shopping'
  };
  
  return displayNames[category] || String(category);
}

// Helper to get display name for subcategories
export function getSubcategoryDisplayName(subcategory: Subcategory): string {
  const displayNames: Partial<Record<Subcategory, string>> = {
    // Food & Drink
    [Subcategory.RESTAURANT]: 'Restaurant',
    [Subcategory.CAFE]: 'Café',
    [Subcategory.BAR]: 'Bar',
    [Subcategory.BEACH_BAR]: 'Beach Bar',
    [Subcategory.FOOD_TRUCK]: 'Food Truck',
    [Subcategory.STREET_FOOD]: 'Street Food',

    // Leisure
    [Subcategory.DIVING]: 'Diving',
    [Subcategory.WATER_SPORTS]: 'Water Sports',
    [Subcategory.EXCURSION]: 'Excursion',
    [Subcategory.HIKING]: 'Hiking',
    [Subcategory.YOGA]: 'Yoga',

    // Culture
    [Subcategory.GALLERY]: 'Gallery',
    [Subcategory.CONCERT_VENUE]: 'Concert Venue',
    [Subcategory.FESTIVAL]: 'Festival',
    [Subcategory.WORKSHOP]: 'Workshop',
    [Subcategory.CLASSES]: 'Classes',

    // Shopping
    [Subcategory.MARKET]: 'Market',
    [Subcategory.CLOTHING_STORE]: 'Clothing Store',
    [Subcategory.SOUVENIR_SHOP]: 'Souvenir Shop',
    [Subcategory.CRAFT_SHOP]: 'Craft Shop'
  };
  
  return displayNames[subcategory] || String(subcategory);
} 