// =============================
// BASE TYPES AND ENUMERATIONS
// =============================

// Type for Price Indicator
export type PriceIndicator = "€" | "€€" | "€€€" | "€€€€" | "Free" | "Varies";

// Enumération principale des catégories par section
export enum PartnerSection {
  ESTABLISHMENT = "establishment", // Lieux & Établissements
  SERVICE = "service"              // Services & Prestations
}

// Catégories pour ESTABLISHMENT (Lieux & Établissements)
export enum EstablishmentCategory {
  // Hébergement
  ACCOMMODATION = "accommodation",
  // Restauration & Bars
  FOOD_DRINK = "food_drink",
  // Loisirs & Activités
  LEISURE = "leisure",
  // Shopping & Artisanat
  SHOPPING = "shopping",
  // Culture & Événements
  CULTURE = "culture",
  // Transports partenaires (établissements)
  TRANSPORT_PROVIDER = "transport_provider"
}

// Catégories pour SERVICE (Services & Prestations)
export enum ServiceCategory {
  // Transport & Mobilité
  MOBILITY = "mobility",
  // Santé & Urgences
  HEALTH = "health",
  // Bien-être & Esthétique
  WELLNESS = "wellness",
  // Maintenance & Bricolage
  MAINTENANCE = "maintenance",
  // Immobilier & Location
  REAL_ESTATE = "real_estate",
  // Professions Libérales
  PROFESSIONAL = "professional",
  // Automobile & Marine
  VEHICLE_REPAIR = "vehicle_repair"
}

// Sous-catégories pour une organisation plus fine - Extensible si besoin
export enum PartnerSubcategory {
  // Hébergement
  HOTEL = "hotel",
  BUNGALOW = "bungalow",
  VILLA = "villa",
  GUESTHOUSE = "guesthouse",
  HOSTEL = "hostel",

  // Restauration & Bars
  RESTAURANT = "restaurant",
  CAFE = "cafe",
  BAR = "bar",
  BEACH_BAR = "beach_bar",
  FOOD_TRUCK = "food_truck",
  STREET_FOOD = "street_food",

  // Loisirs & Activités
  DIVING = "diving",
  YOGA = "yoga",
  EXCURSION = "excursion",
  WATER_SPORTS = "water_sports",
  HIKING = "hiking",

  // Shopping & Artisanat
  MARKET = "market",
  CLOTHING = "clothing_store",
  SOUVENIR = "souvenir_shop",
  CRAFT_SHOP = "craft_shop",

  // Culture & Événements
  GALLERY = "gallery",
  CONCERT_VENUE = "concert_venue",
  FESTIVAL = "festival",
  WORKSHOP = "workshop",
  CLASSES = "classes",

  // Transport partenaires
  FERRY = "ferry",
  BOAT_TOUR = "boat_tour",
  SHUTTLE = "shuttle",

  // Transport & Mobilité
  TAXI = "taxi",
  SCOOTER_RENTAL = "scooter_rental",
  CAR_RENTAL = "car_rental",
  PRIVATE_DRIVER = "private_driver",
  BIKE_RENTAL = "bike_rental",

  // Santé & Urgences
  HOSPITAL = "hospital",
  CLINIC = "clinic",
  DOCTOR = "doctor",
  PHARMACY = "pharmacy",
  EMERGENCY = "emergency",

  // Bien-être & Esthétique
  MASSAGE = "massage",
  SPA = "spa",
  SALON = "beauty_salon",
  YOGA_STUDIO = "yoga_studio",

  // Maintenance & Bricolage
  ELECTRICIAN = "electrician",
  PLUMBER = "plumber",
  HANDYMAN = "handyman",
  GARDENER = "gardener",

  // Immobilier & Location
  REAL_ESTATE_AGENCY = "real_estate_agency",
  PROPERTY_MANAGEMENT = "property_management",
  LONG_TERM_RENTAL = "long_term_rental",

  // Professions Libérales
  ARCHITECT = "architect",
  LAWYER = "lawyer",
  ACCOUNTANT = "accountant",
  CONSULTANT = "consultant",

  // Automobile & Marine
  CAR_MECHANIC = "car_mechanic",
  SCOOTER_REPAIR = "scooter_repair",
  BOAT_REPAIR = "boat_repair",

  // Divers
  OTHER = "other"
}

// =============================
// INTERFACES PRINCIPALES
// =============================

// Interface de base pour tous les partenaires
export interface BasePartner {
  id: string;
  name: string;
  section: PartnerSection;
  mainCategory: EstablishmentCategory | ServiceCategory;
  subcategory: PartnerSubcategory;
  images: {
    main: string;
    gallery?: string[];
  };
  description: {
    short: string;
    long: string;
  };
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    area?: string; // Zone de l'île (Nord, Sud, Est, Ouest, etc.)
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    lineId?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  hours: {
    regularHours?: string; // Ex: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
    seasonalChanges?: string;
    open24h?: boolean;
  };
  rating: {
    score?: number; // Sur 5 étoiles
    reviewCount?: number;
    testimonials?: Array<{
      author: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  tags: string[]; // Pour la recherche et le filtrage
  prices: {
    priceRange: PriceIndicator; // Indicateur général
    currency?: string; // THB, USD, EUR
  };
  features: string[]; // Caractéristiques principales
  languages?: string[]; // Langues parlées
  createdAt: string;
  updatedAt: string;

  // Champs pour le sponsoring et la mise en avant
  promotion?: {
    isSponsored: boolean;
    isFeatured?: boolean;
    promotionEndsAt?: string;
    discount?: {
      description: string;
      code?: string;
      validUntil: string;
    };
  };

  // Champs communs utiles pour plusieurs types
  accessibility?: {
    wheelchairAccessible?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
  };

  paymentOptions?: {
    cash?: boolean;
    creditCard?: boolean;
    mobilePay?: boolean;
    cryptoCurrency?: boolean;
    acceptedCards?: string[]; // Visa, Mastercard, etc.
  };

  // FAQ du partenaire
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

// =============================
// ATTRIBUTS SPÉCIFIQUES (Placeholder - will be refined)
// =============================

// Interface pour les attributs spécifiques à chaque catégorie
export interface PartnerAttributes {
  // Pour éviter d'avoir des champs vides, on utilise un Record dynamique pour l'instant
  // Ceci sera remplacé par une Union Type une fois les fichiers d'attributs créés
  [key: string]: any;
}

// Import the union type for all specific attributes
import { AllPartnerAttributes } from './attributes'; // Assuming index.ts is in attributes folder

// =============================
// INTERFACE PRINCIPALE DU PARTENAIRE
// =============================

export interface Partner extends BasePartner {
  // Attributs spécifiques à la catégorie, using the union type
  // Make attributes optional to handle cases where they might be missing or null in DB/parsing
  attributes?: AllPartnerAttributes;
}

// =============================
// HELPERS ET TYPE GUARDS
// =============================

export function isEstablishment(partner: Partner): boolean {
  return partner.section === PartnerSection.ESTABLISHMENT;
}

export function isService(partner: Partner): boolean {
  return partner.section === PartnerSection.SERVICE;
}

// D'autres type guards spécifiques (isAccommodation, isFoodDrink, etc.)
// seront ajoutés dans les fichiers d'attributs correspondants.

// Export PartnerType as alias of Partner for backward compatibility
export type PartnerType = Partner; 