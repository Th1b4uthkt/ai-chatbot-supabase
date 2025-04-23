import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
} from '../partner'; // Adjust path as needed

// =============================
// ATTRIBUTS SPÉCIFIQUES: TRANSPORTS PARTENAIRES
// =============================

export interface TransportAttributes extends PartnerAttributes {
  transportType: "ferry" | "boat_tour" | "shuttle" | "other";
  routes?: Array<{
    from: string;
    to: string;
    distance?: string;
    duration: string;
    price: number;
    frequency?: string;
    schedule?: Array<{
      departureTime: string;
      arrivalTime?: string;
      days: string[];
    }>;
  }>;
  vehicleFleet?: Array<{
    type: string;
    capacity: number;
    features?: string[];
    image?: string;
  }>;
  ticketOptions?: Array<{
    name: string;
    price: number;
    description?: string;
    benefits?: string[];
  }>;
  onlineBooking?: {
    available: boolean;
    url?: string;
    advanceBookingRequired?: boolean;
    minimumAdvanceTime?: string;
  };
  baggagePolicy?: {
    luggageAllowance: string;
    extraLuggageFee?: number;
    restrictions?: string;
  };
  amenities?: string[];
  seasonality?: {
    highSeason?: string;
    lowSeason?: string;
    weatherRestrictions?: string;
  };
  specialServices?: {
    privateHire: boolean;
    groupDiscounts?: boolean;
    pickupService?: boolean;
  };
}

// =============================
// TYPE GUARD: TRANSPORTS PARTENAIRES
// =============================

export function isTransportProvider(partner: Partner): partner is Partner & { attributes: TransportAttributes } {
  return partner.mainCategory === EstablishmentCategory.TRANSPORT_PROVIDER;
}

// =============================
// MOCK DATA: TRANSPORT (FERRY)
// =============================

export const mockFerryService: Partner & { attributes: TransportAttributes } = {
  id: "trans-001",
  name: "Island Hopper Ferry",
  section: PartnerSection.ESTABLISHMENT,
  mainCategory: EstablishmentCategory.TRANSPORT_PROVIDER,
  subcategory: PartnerSubcategory.FERRY,
  images: {
    main: "/images/trans-001-main.jpg", // Replace with actual path/URL
  },
  description: {
    short: "Fast and reliable ferry service between islands.",
    long: "Travel comfortably between Koh Phangan, Koh Samui, and Koh Tao with our modern ferry fleet. Daily schedules available.",
  },
  location: {
    address: "Thong Sala Pier, Koh Phangan", // Main departure point
    coordinates: { latitude: 9.711, longitude: 100.012 },
    area: "Thong Sala",
  },
  contact: {
    phone: "+66 77 555 111",
    website: "www.islandhopper.com",
  },
  hours: {
    regularHours: "Office: 8:00 - 17:00, Departures: See schedule",
  },
  rating: {
    score: 4.4,
    reviewCount: 210,
  },
  tags: ["ferry", "transport", "island hopping", "samui", "tao"],
  prices: {
    priceRange: "€€", // Represents ticket price
    currency: "THB",
  },
  features: ["Online Booking", "Air Conditioned Cabin", "Luggage Storage"],
  languages: ["English", "Thai"],
  createdAt: "2023-03-15T09:00:00Z",
  updatedAt: "2023-11-30T09:00:00Z",
  promotion: {
    isSponsored: false,
  },
  paymentOptions: {
    cash: true,
    creditCard: true,
  },
  attributes: {
    transportType: "ferry",
    routes: [
      {
        from: "Koh Phangan",
        to: "Koh Samui",
        duration: "30 minutes",
        price: 350,
        frequency: "4 times daily",
      },
      {
        from: "Koh Phangan",
        to: "Koh Tao",
        duration: "1 hour 30 minutes",
        price: 700,
        frequency: "2 times daily",
      },
    ],
    vehicleFleet: [
      {
        type: "Catamaran Ferry",
        capacity: 300,
        features: ["Air Conditioning", "Toilets", "Snack Bar"],
      },
    ],
    onlineBooking: {
      available: true,
      url: "booking.islandhopper.com",
    },
    baggagePolicy: {
      luggageAllowance: "20kg per person",
      extraLuggageFee: 100,
    },
  }
}; 