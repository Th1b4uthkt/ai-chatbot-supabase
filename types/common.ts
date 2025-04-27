// Common types for the app

// Main types of items
export enum ItemType {
  SERVICE = 'service',
  ACTIVITY = 'activity'
}

// Price indicator
export enum PriceIndicator {
  BUDGET = '€',
  MODERATE = '€€',
  PREMIUM = '€€€',
  LUXURY = '€€€€',
  FREE = 'Free',
  VARIES = 'Varies'
}

// Service categories
export enum ServiceCategory {
  ACCOMMODATION = 'accommodation',
  MOBILITY = 'mobility',
  HEALTH = 'health',
  WELLNESS = 'wellness',
  REAL_ESTATE = 'real_estate'
}

// Activity categories
export enum ActivityCategory {
  FOOD_DRINK = 'food_drink',
  LEISURE = 'leisure',
  CULTURE = 'culture',
  SHOPPING = 'shopping'
}

// Subcategories for both services and activities
export enum Subcategory {
  // Accommodation
  HOTEL = 'hotel',
  BUNGALOW = 'bungalow',
  VILLA = 'villa',
  GUESTHOUSE = 'guesthouse',
  HOSTEL = 'hostel',

  // Mobility
  SCOOTER_RENTAL = 'scooter_rental',
  CAR_RENTAL = 'car_rental',
  TAXI = 'taxi',
  BIKE_RENTAL = 'bike_rental',
  PRIVATE_DRIVER = 'private_driver',
  FERRY = 'ferry',
  BOAT_TOUR = 'boat_tour',
  SHUTTLE = 'shuttle',

  // Health
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
  EMERGENCY = 'emergency',

  // Wellness
  SPA = 'spa',
  MASSAGE = 'massage',
  YOGA_STUDIO = 'yoga_studio',
  BEAUTY_SALON = 'beauty_salon',

  // Real Estate
  REAL_ESTATE_AGENCY = 'real_estate_agency',
  PROPERTY_MANAGEMENT = 'property_management',
  LONG_TERM_RENTAL = 'long_term_rental',

  // Food & Drink
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  BAR = 'bar',
  BEACH_BAR = 'beach_bar',
  FOOD_TRUCK = 'food_truck',
  STREET_FOOD = 'street_food',

  // Leisure
  DIVING = 'diving',
  WATER_SPORTS = 'water_sports',
  EXCURSION = 'excursion',
  HIKING = 'hiking',
  YOGA = 'yoga',

  // Culture
  GALLERY = 'gallery',
  CONCERT_VENUE = 'concert_venue',
  FESTIVAL = 'festival',
  WORKSHOP = 'workshop',
  CLASSES = 'classes',

  // Shopping
  MARKET = 'market',
  CLOTHING_STORE = 'clothing_store',
  SOUVENIR_SHOP = 'souvenir_shop',
  CRAFT_SHOP = 'craft_shop'
}

// Type guards for checking categories
export function isServiceCategory(category: string): category is ServiceCategory {
  return Object.values(ServiceCategory).includes(category as ServiceCategory);
}

export function isActivityCategory(category: string): category is ActivityCategory {
  return Object.values(ActivityCategory).includes(category as ActivityCategory);
} 