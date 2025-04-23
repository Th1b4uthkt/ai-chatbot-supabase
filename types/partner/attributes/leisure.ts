import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
} from '../partner'; // Adjust path as needed

// =============================
// ATTRIBUTS SPÉCIFIQUES: LOISIRS & ACTIVITÉS
// =============================

export interface LeisureAttributes extends PartnerAttributes {
  activityType: "diving" | "yoga" | "excursion" | "water_sports" | "hiking" | "other";
  sessions?: Array<{
    name: string;
    duration: string;
    startTime?: string;
    endTime?: string;
    pricePerPerson: number;
  }>;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "all_levels";
  includesEquipment?: boolean;
  equipment?: string[];
  minimumAge?: number;
  maximumGroupSize?: number;
  includes?: string[];
  requirements?: string[];
  weatherDependent?: boolean;
  seasonality?: {
    highSeason?: string;
    lowSeason?: string;
    closedPeriods?: string[];
  };
  location?: {
    meetingPoint: string;
    destinationPoint?: string;
    indoorActivity?: boolean;
    outdoorActivity?: boolean;
  };
  instructors?: Array<{
    name: string;
    qualifications?: string[];
    languages?: string[];
    experience?: string;
  }>;
  bookingPolicy?: {
    advanceBookingRequired: boolean;
    minimumAdvanceTime?: string;
    cancellationPolicy?: string;
    privateSessionsAvailable?: boolean;
  };
}

// =============================
// TYPE GUARD: LOISIRS & ACTIVITÉS
// =============================

export function isLeisureActivity(partner: Partner): partner is Partner & { attributes: LeisureAttributes } {
  return partner.mainCategory === EstablishmentCategory.LEISURE;
}

// =============================
// MOCK DATA: LOISIRS (PLONGÉE)
// =============================

export const mockDivingCenter: Partner & { attributes: LeisureAttributes } = {
  id: "leisure-789",
  name: "Deep Blue Divers",
  section: PartnerSection.ESTABLISHMENT,
  mainCategory: EstablishmentCategory.LEISURE,
  subcategory: PartnerSubcategory.DIVING,
  images: {
    main: "https://example.com/diving-center.jpg",
    gallery: [
      "https://example.com/diving1.jpg",
      "https://example.com/diving2.jpg",
      "https://example.com/diving3.jpg",
    ]
  },
  description: {
    short: "Professional diving center offering courses and trips for all levels.",
    long: "Explore the underwater world with our experienced team of diving instructors. We offer a range of PADI courses and daily trips to the best dive sites around Koh Phangan. Perfect for beginners and experienced divers alike."
  },
  location: {
    address: "123 Beach Road, Thong Sala, Koh Phangan",
    coordinates: {
      latitude: 9.7193,
      longitude: 100.0028
    },
    area: "Thong Sala"
  },
  contact: {
    phone: "+66 77 123 456",
    email: "info@deepbluedivers.com",
    website: "deepbluedivers.com",
    social: {
      facebook: "facebook.com/deepbluedivers",
      instagram: "instagram.com/deepbluedivers"
    }
  },
  hours: {
    regularHours: "Open daily 7:30 AM - 6:00 PM",
    open24h: false
  },
  rating: {
    score: 4.8,
    reviewCount: 156,
    testimonials: [
      {
        author: "Jane D.",
        rating: 5,
        comment: "Amazing experience with really professional instructors!",
        date: "2023-05-15"
      }
    ]
  },
  tags: ["Diving", "Courses", "Snorkeling", "Boat Trips", "PADI"],
  prices: {
    priceRange: "€€",
    currency: "THB"
  },
  features: ["PADI Certified", "Air-conditioned classroom", "Modern equipment", "Small groups"],
  languages: ["English", "Thai", "German", "French"],
  createdAt: "2023-01-10",
  updatedAt: "2023-06-05",
  accessibility: {
    wheelchairAccessible: false,
    familyFriendly: true,
    petFriendly: false
  },
  attributes: {
    activityType: "diving",
    sessions: [
      {
        name: "Discover Scuba Diving",
        duration: "Half Day",
        startTime: "09:00",
        endTime: "13:00",
        pricePerPerson: 3500
      },
      {
        name: "2 Fun Dives (Certified Divers)",
        duration: "Full Day",
        startTime: "08:00",
        endTime: "16:00",
        pricePerPerson: 3000
      },
      {
        name: "PADI Open Water Course",
        duration: "3 Days",
        pricePerPerson: 14500
      }
    ],
    skillLevel: "all_levels",
    includesEquipment: true,
    equipment: ["BCD", "Regulator", "Wetsuit", "Mask", "Fins", "Dive Computer"],
    minimumAge: 10,
    maximumGroupSize: 4,
    includes: ["Equipment rental", "Boat transportation", "Drinks", "Snacks", "Towels"],
    requirements: ["Good health", "Comfortable in water", "Passport/photo ID"],
    weatherDependent: true,
    location: {
      meetingPoint: "Deep Blue Divers Shop",
      destinationPoint: "Sail Rock & Southwest Pinnacles",
      indoorActivity: false,
      outdoorActivity: true
    },
    instructors: [
      {
        name: "John Smith",
        qualifications: ["PADI Course Director", "Emergency First Response Instructor"],
        languages: ["English", "Thai"],
        experience: "15+ years"
      },
      {
        name: "Sarah Johnson",
        qualifications: ["PADI Master Instructor"],
        languages: ["English", "German", "French"],
        experience: "8 years"
      }
    ],
    bookingPolicy: {
      advanceBookingRequired: true,
      minimumAdvanceTime: "24 hours",
      cancellationPolicy: "Free cancellation up to 48 hours before activity",
      privateSessionsAvailable: true
    }
  }
}; 