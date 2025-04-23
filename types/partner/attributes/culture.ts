import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
  PriceIndicator
} from '../partner'; // Adjust path as needed

// =============================
// ATTRIBUTS SPÉCIFIQUES: CULTURE & ÉVÉNEMENTS
// =============================

export interface CultureAttributes extends PartnerAttributes {
  venueType: "gallery" | "museum" | "theater" | "cinema" | "cultural_center" | "temple" | "historical_site";
  eventTypes?: string[];
  upcomingEvents?: Array<{
    name: string;
    description?: string;
    date: string;
    time?: string;
    ticketRequired: boolean;
    ticketPrice?: number;
    ticketUrl?: string;
  }>;
  exhibits?: Array<{
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    artist?: string;
  }>;
  workshops?: Array<{
    name: string;
    description?: string;
    schedule?: string;
    pricePerPerson: number;
    duration: string;
    languagesOffered: string[];
    skillLevel?: "beginner" | "intermediate" | "advanced" | "all_levels";
  }>;
  specialFeatures?: string[];
  photography?: {
    allowed: boolean;
    restrictions?: string;
  };
  seasonalSchedule?: {
    highSeason?: string;
    lowSeason?: string;
    closedPeriods?: string[];
  };
  entryFee?: PriceIndicator;
}

// =============================
// TYPE GUARD: CULTURE & ÉVÉNEMENTS
// =============================

export function isCulture(partner: Partner): partner is Partner & { attributes: CultureAttributes } {
  return partner.mainCategory === EstablishmentCategory.CULTURE;
}

// =============================
// MOCK DATA: CULTURE (GALERIE D'ART)
// =============================

export const mockArtGallery: Partner & { attributes: CultureAttributes } = {
  id: "cul-101",
  name: "Phangan Art Collective",
  section: PartnerSection.ESTABLISHMENT,
  mainCategory: EstablishmentCategory.CULTURE,
  subcategory: PartnerSubcategory.GALLERY,
  images: {
    main: "/images/cul-101-main.jpg", // Replace with actual path/URL
  },
  description: {
    short: "Contemporary art from local and international artists.",
    long: "Discover unique artworks in a serene setting. We host regular exhibitions and events.",
  },
  location: {
    address: "1 Art Lane, Srithanu",
    coordinates: { latitude: 9.759, longitude: 99.984 },
    area: "Srithanu",
  },
  contact: {
    email: "info@phanganart.com",
    website: "www.phanganart.com",
  },
  hours: {
    regularHours: "Tue-Sun 11:00 - 18:00",
  },
  rating: {
    score: 4.6,
    reviewCount: 42,
  },
  tags: ["art", "gallery", "contemporary", "exhibition", "local artists"],
  prices: {
    priceRange: "€€€", // Represents price of artworks, entry might be free
    currency: "THB",
  },
  features: ["Exhibitions", "Artist Talks", "Air Conditioning"],
  languages: ["English", "Thai", "French"],
  createdAt: "2023-09-10T14:00:00Z",
  updatedAt: "2023-12-01T14:00:00Z",
  promotion: {
    isSponsored: true,
    promotionEndsAt: "2024-12-31T23:59:59Z"
  },
  accessibility: {
    wheelchairAccessible: true,
  },
  attributes: {
    venueType: "gallery",
    eventTypes: ["Exhibition Opening", "Artist Talk"],
    exhibits: [
      {
        name: "Island Hues",
        description: "A collection of vibrant landscapes by local painters.",
        startDate: "2023-12-01",
        endDate: "2024-01-15",
      },
    ],
    photography: {
      allowed: true,
      restrictions: "No flash photography.",
    },
  }
};

export interface CulturePartnerBase {
  venueType: 'gallery' | 'museum' | 'theater' | 'cinema' | 'cultural_center' | 'temple' | 'historical_site';
  entryFee?: PriceIndicator;
}

export interface Gallery extends CulturePartnerBase {
  venueType: 'gallery';
  eventTypes?: Array<'exhibition' | 'workshop' | 'artist_talk' | 'opening' | 'auction'>;
  exhibits?: Array<'paintings' | 'sculptures' | 'photography' | 'mixed_media' | 'digital_art' | 'installations'>;
  photographyAllowed?: boolean;
}

export interface Museum extends CulturePartnerBase {
  venueType: 'museum';
  exhibitTypes?: Array<'historical' | 'science' | 'art' | 'natural_history' | 'local_heritage'>;
  guidedTours?: boolean;
  audioGuides?: boolean;
}

export interface Theater extends CulturePartnerBase {
  venueType: 'theater';
  performanceTypes?: Array<'play' | 'musical' | 'dance' | 'comedy' | 'opera'>;
  seatingCapacity?: number;
  reservationRequired?: boolean;
}

export interface Cinema extends CulturePartnerBase {
  venueType: 'cinema';
  screenCount?: number;
  movieTypes?: Array<'new_releases' | 'international' | 'indie' | 'thai_films' | 'classics'>;
  dolbySound?: boolean;
}

export interface CulturalCenter extends CulturePartnerBase {
  venueType: 'cultural_center';
  activities?: Array<'classes' | 'performances' | 'exhibitions' | 'workshops' | 'community_events'>;
  focusAreas?: Array<'local_traditions' | 'international_exchange' | 'arts_crafts' | 'music' | 'dance'>;
}

export interface Temple extends CulturePartnerBase {
  venueType: 'temple';
  religion?: 'buddhist' | 'hindu' | 'christian' | 'muslim' | 'other';
  dressCodes?: Array<'covered_shoulders' | 'covered_knees' | 'no_shoes' | 'head_covering'>;
  activeTimes?: Array<'morning_chanting' | 'evening_ceremony' | 'meditation_sessions'>;
}

export interface HistoricalSite extends CulturePartnerBase {
  venueType: 'historical_site';
  period?: string;
  significance?: string;
  preservationStatus?: 'well_preserved' | 'partially_restored' | 'ruins' | 'reconstruction';
}

export type CulturePartnerAttributes = Gallery | Museum | Theater | Cinema | CulturalCenter | Temple | HistoricalSite; 