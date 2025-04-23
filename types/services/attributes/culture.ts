import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
  ServiceCategory,
} from '../../partner/partner'; // Adjust path as needed
import { GuideCategory } from '../../newGuide'; // Import GuideCategory

// =============================
// ATTRIBUTS SPÉCIFIQUES: CULTURE & ÉVÉNEMENTS
// =============================

export interface CultureAttributes extends PartnerAttributes {
  venueType: "gallery" | "concert_venue" | "festival" | "workshop" | "classes" | "other";
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
}

// =============================
// TYPE GUARD: CULTURE & ÉVÉNEMENTS
// =============================

export function isCulture(attributes: any): attributes is CultureAttributes {
  return attributes && typeof attributes.venueType === 'string';
}

// =============================
// MOCK DATA: CULTURE (GALERIE D'ART)
// =============================

export const mockArtGallery: Partner & { attributes: CultureAttributes } & { category: GuideCategory } = {
  id: "cul-101",
  name: "Phangan Art Collective",
  section: PartnerSection.SERVICE,
  mainCategory: ServiceCategory.PROFESSIONAL,
  category: GuideCategory.CULTURE,
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