import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  EstablishmentCategory,
  PartnerSubcategory,
} from '../partner'; // Adjust path as needed

// =============================
// ATTRIBUTS SPÉCIFIQUES: SHOPPING & ARTISANAT
// =============================

export interface ShoppingAttributes extends PartnerAttributes {
  shopType: "market" | "clothing_store" | "souvenir_shop" | "craft_shop" | "other";
  productTypes: string[];
  specialties?: string[];
  locallyMade?: boolean;
  sustainablePractices?: string[];
  priceLevel?: "budget" | "mid_range" | "premium" | "luxury";
  returns?: {
    returnsAccepted: boolean;
    policy?: string;
  };
  shipping?: {
    internationalShipping: boolean;
    domesticShipping: boolean;
    details?: string;
  };
  brands?: string[];
  customization?: {
    available: boolean;
    details?: string;
  };
  paymentOptions?: {
    cash: boolean;
    creditCard: boolean;
    mobilePay: boolean;
    other?: string[];
  };
}

// =============================
// TYPE GUARD: SHOPPING & ARTISANAT
// =============================

export function isShopping(partner: Partner): partner is Partner & { attributes: ShoppingAttributes } {
  return partner.mainCategory === EstablishmentCategory.SHOPPING;
}

// =============================
// MOCK DATA: SHOPPING (CLOTHING STORE)
// =============================

export const mockClothingStore: Partner & { attributes: ShoppingAttributes } = {
  id: "shop-001",
  name: "Island Style Boutique",
  section: PartnerSection.ESTABLISHMENT,
  mainCategory: EstablishmentCategory.SHOPPING,
  subcategory: PartnerSubcategory.CLOTHING,
  images: {
    main: "/images/shop-001-main.jpg", // Replace with actual path/URL
  },
  description: {
    short: "Trendy beachwear and casual clothing.",
    long: "Find the perfect outfit for your island adventures. We offer a curated selection of local and international brands.",
  },
  location: {
    address: "789 Main Street, Haad Rin",
    coordinates: { latitude: 9.676, longitude: 100.067 },
    area: "Haad Rin",
  },
  contact: {
    phone: "+66 77 987 654",
  },
  hours: {
    regularHours: "Daily 10:00 - 20:00",
  },
  rating: {
    score: 4.2,
    reviewCount: 35,
  },
  tags: ["clothing", "fashion", "beachwear", "accessories"],
  prices: {
    priceRange: "€€",
    currency: "THB",
  },
  features: ["Air Conditioning", "Fitting Rooms"],
  languages: ["English", "Thai"],
  createdAt: "2023-08-01T11:00:00Z",
  updatedAt: "2023-11-25T11:00:00Z",
  promotion: {
    isSponsored: false,
  },
  paymentOptions: {
    cash: true,
    creditCard: true,
  },
  attributes: {
    shopType: "clothing_store",
    productTypes: ["Beachwear", "Dresses", "Shirts", "Shorts", "Accessories"],
    locallyMade: false,
    priceLevel: "mid_range",
    returns: {
      returnsAccepted: true,
      policy: "Returns accepted within 14 days with receipt.",
    },
  }
}; 