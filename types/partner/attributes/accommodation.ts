import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
  BasePartner
} from '../partner'; // Adjust path as needed

// =============================
// ATTRIBUTS SPÉCIFIQUES: HÉBERGEMENT
// =============================

export interface AccommodationAttributes extends PartnerAttributes {
  accommodationType: "hotel" | "bungalow" | "villa" | "guesthouse" | "hostel";
  rooms: Array<{
    name?: string;
    capacity: number;
    bedType?: string;
    pricePerNight: number;
    pricePerWeek?: number;
    pricePerMonth?: number;
    amenities?: string[];
    images?: string[];
  }>;
  facilities: string[]; // Piscine, Wifi, etc.
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation?: string;
    extraBed?: {
      available: boolean;
      fee?: number;
    };
    childrenPolicy?: string;
    petsAllowed?: boolean;
  };
  includedServices?: string[];
  nearbyAttractions?: string[];
  distanceToBeach?: number; // En mètres
  transferService?: boolean;
  // Champs spécifiques pour certains types (optionnels)
  propertyDetails?: {
    size?: number; // m²
    floors?: number;
    viewType?: string;
    yearBuilt?: number;
    privatePool?: boolean;
    privateGarden?: boolean;
    kitchen?: boolean;
    livingRoom?: boolean;
    staff?: boolean;
  };
}

// =============================
// TYPE GUARD: HÉBERGEMENT
// =============================

export function isAccommodation(partner: Partner): partner is Partner & { attributes: AccommodationAttributes } {
  return partner.mainCategory === EstablishmentCategory.ACCOMMODATION;
}

// =============================
// MOCK DATA: HÉBERGEMENT (HOTEL)
// =============================

export const mockHotel: Partner & { attributes: AccommodationAttributes } = {
  id: "hotel-123",
  name: "Coconut Beach Resort",
  section: PartnerSection.ESTABLISHMENT,
  mainCategory: EstablishmentCategory.ACCOMMODATION,
  subcategory: PartnerSubcategory.HOTEL,
  images: {
    main: "/images/hotel-123-main.jpg",
    gallery: ["/images/hotel-123-1.jpg", "/images/hotel-123-2.jpg"]
  },
  description: {
    short: "Hôtel en bord de mer avec piscine et restaurants",
    long: "Un magnifique complexe hôtelier situé directement sur la plage de Coconut Beach..."
  },
  location: {
    address: "123 Coconut Beach Road, Koh Phangan",
    coordinates: {
      latitude: 9.7542,
      longitude: 100.0376
    },
    area: "West Coast"
  },
  contact: {
    phone: "+66 77 123 456",
    email: "info@coconutbeachresort.com",
    website: "www.coconutbeachresort.com"
  },
  hours: {
    regularHours: "Check-in: 14:00, Check-out: 11:00",
    open24h: true
  },
  rating: {
    score: 4.5,
    reviewCount: 128
  },
  tags: ["beach", "pool", "family-friendly", "restaurant", "wifi"],
  prices: {
    priceRange: "€€€",
    currency: "THB"
  },
  features: ["Beachfront", "Swimming Pool", "Restaurant", "Free WiFi", "Airport Shuttle"],
  languages: ["English", "Thai", "French", "German"],
  createdAt: "2023-06-15T10:30:00Z",
  updatedAt: "2023-12-20T14:15:00Z",
  promotion: {
    isSponsored: false,
  },
  accessibility: {
    wheelchairAccessible: true,
    familyFriendly: true,
    petFriendly: false,
  },
  paymentOptions: {
    cash: true,
    creditCard: true,
    acceptedCards: ["Visa", "Mastercard", "Amex"],
  },
  faq: [
    { question: "Is breakfast included?", answer: "Yes, buffet breakfast is included for all guests." },
    { question: "Do you have airport transfer?", answer: "Yes, we offer airport transfer service for an additional fee." }
  ],
  attributes: {
    accommodationType: "hotel",
    rooms: [
      {
        name: "Deluxe Sea View",
        capacity: 2,
        bedType: "King",
        pricePerNight: 3500,
        amenities: ["Air Conditioning", "Balcony", "Sea View", "Mini-bar"]
      },
      {
        name: "Family Suite",
        capacity: 4,
        bedType: "King + Twin",
        pricePerNight: 5500,
        amenities: ["Air Conditioning", "Balcony", "Sea View", "Mini-bar", "Living Area"]
      }
    ],
    facilities: ["Swimming Pool", "Restaurant", "Bar", "Spa", "Fitness Center", "Kids Club"],
    policies: {
      checkIn: "14:00",
      checkOut: "11:00",
      cancellation: "Free cancellation up to 3 days before arrival",
      extraBed: {
        available: true,
        fee: 1000
      },
      childrenPolicy: "Children under 6 stay free",
      petsAllowed: false
    },
    includedServices: ["Breakfast", "WiFi", "Beach Towels"],
    nearbyAttractions: ["Coconut Beach", "Thong Sala Night Market"],
    distanceToBeach: 0,
    transferService: true,
    propertyDetails: {
        yearBuilt: 2015,
        viewType: "Ocean View"
    }
  }
}; 