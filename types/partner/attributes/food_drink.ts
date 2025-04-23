import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
} from '../partner'; // Adjust path as needed

// =============================
// ATTRIBUTS SPÉCIFIQUES: RESTAURATION & BARS
// =============================

export interface FoodDrinkAttributes extends PartnerAttributes {
  establishmentType: "restaurant" | "cafe" | "bar" | "beach_bar" | "food_truck" | "street_food";
  cuisine: string[];
  specialties?: string[];
  menuHighlights?: string[];
  diningOptions?: {
    takeAway?: boolean;
    delivery?: boolean;
    reservation?: boolean;
    privateEvents?: boolean;
  };
  atmosphere?: string[];
  seating?: {
    indoor?: boolean;
    outdoor?: boolean;
    beachfront?: boolean;
    rooftop?: boolean;
    capacity?: number;
  };
  dietaryOptions?: string[]; // Végétarien, Vegan, Sans Gluten, etc.
  alcoholServed?: boolean;
  specialEvents?: Array<{
    name: string;
    description?: string;
    day: string;
    time?: string;
  }>;
  happyHour?: {
    available: boolean;
    timeSlots?: string;
    details?: string;
  };
}

// =============================
// TYPE GUARD: RESTAURATION & BARS
// =============================

export function isFoodDrink(partner: Partner): partner is Partner & { attributes: FoodDrinkAttributes } {
  return partner.mainCategory === EstablishmentCategory.FOOD_DRINK;
}

// =============================
// MOCK DATA: RESTAURATION (RESTAURANT)
// =============================

export const mockRestaurant: Partner & { attributes: FoodDrinkAttributes } = {
  id: "rest-456",
  name: "Seaside Grill",
  section: PartnerSection.ESTABLISHMENT,
  mainCategory: EstablishmentCategory.FOOD_DRINK,
  subcategory: PartnerSubcategory.RESTAURANT,
  images: {
    main: "/images/rest-456-main.jpg"
  },
  description: {
    short: "Restaurant de fruits de mer en bord de plage",
    long: "Dégustez les meilleurs fruits de mer de l'île avec une vue imprenable sur l'océan..."
  },
  location: {
    address: "456 Sunset Beach, Koh Phangan",
    coordinates: {
      latitude: 9.7123,
      longitude: 100.0234
    },
    area: "South Coast"
  },
  contact: {
    phone: "+66 77 456 789",
    social: {
      facebook: "facebook.com/seasidegrillkp",
      instagram: "instagram.com/seasidegrill"
    }
  },
  hours: {
    regularHours: "Daily: 12:00-22:00"
  },
  rating: {
    score: 4.7,
    reviewCount: 89
  },
  tags: ["seafood", "beach", "sunset", "cocktails"],
  prices: {
    priceRange: "€€",
    currency: "THB"
  },
  features: ["Beachfront", "Live Music", "Cocktails", "Fresh Seafood"],
  languages: ["English", "Thai"],
  createdAt: "2023-07-22T08:45:00Z",
  updatedAt: "2023-11-18T16:30:00Z",
  promotion: {
    isSponsored: true,
    isFeatured: true,
    promotionEndsAt: "2024-08-31T23:59:59Z",
    discount: {
      description: "10% off for sunset dinner",
      validUntil: "2024-08-31T23:59:59Z"
    }
  },
  accessibility: {
    familyFriendly: true,
  },
  paymentOptions: {
    cash: true,
    creditCard: true,
    mobilePay: true,
  },
  attributes: {
    establishmentType: "restaurant",
    cuisine: ["Seafood", "Thai", "International"],
    specialties: ["Grilled Fish", "Tom Yum Goong", "Coconut Curry"],
    diningOptions: {
      takeAway: true,
      delivery: false,
      reservation: true
    },
    atmosphere: ["Romantic", "Sunset View", "Beach"],
    seating: {
      indoor: true,
      outdoor: true,
      beachfront: true,
      capacity: 60
    },
    dietaryOptions: ["Vegetarian Options", "Gluten-Free Options"],
    alcoholServed: true,
    specialEvents: [
      {
        name: "Seafood BBQ Night",
        day: "Friday",
        time: "18:00-22:00"
      }
    ],
    happyHour: {
      available: true,
      timeSlots: "16:00-18:00",
      details: "Buy 1 Get 1 on selected cocktails"
    }
  }
}; 