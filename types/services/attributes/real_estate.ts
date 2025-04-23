import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  ServiceCategory,
  PartnerSubcategory,
} from '../../partner/partner'; // Adjust path as needed
import { GuideCategory } from '../../newGuide'; // Import GuideCategory

// =============================
// ATTRIBUTS SPÉCIFIQUES: IMMOBILIER & LOCATION
// =============================

export interface RealEstateAttributes extends PartnerAttributes {
  serviceType: "real_estate_agency" | "property_management" | "long_term_rental" | "legal_services";
  servicesOffered?: string[];
  properties?: Array<{
    type: string; // Villa, Apartment, Land, Commercial, etc.
    status: "for_sale" | "for_rent" | "sold" | "rented";
    listingId?: string;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: number; // in square meters
    price?: number; 
    currency?: string;
    description?: string;
    images?: string[];
    listingUrl?: string;
  }>;
  specializations?: string[];
  commission?: string;
  licensing?: {
    licensed?: boolean;
    licenseNumber?: string;
    licenseVerified?: boolean;
  };
  localMarketKnowledge?: string;
  yearsInBusiness?: number;
}

// =============================
// TYPE GUARD: IMMOBILIER & LOCATION
// =============================

export function isRealEstate(attributes: any): attributes is RealEstateAttributes {
  // Basic check for existence and key field
  return attributes && typeof attributes.serviceType === 'string';
}

// =============================
// MOCK DATA: IMMOBILIER (AGENCE IMMOBILIÈRE)
// =============================

export const mockRealEstateAgency: Partner & { attributes: RealEstateAttributes } & { category: GuideCategory } = {
  id: "rea-303",
  name: "Phangan Property Solutions",
  section: PartnerSection.SERVICE,
  mainCategory: ServiceCategory.REAL_ESTATE,
  category: GuideCategory.REAL_ESTATE,
  subcategory: PartnerSubcategory.REAL_ESTATE_AGENCY,
  images: {
    main: "/images/rea-303-main.jpg",
    gallery: ["/images/rea-303-1.jpg", "/images/rea-303-2.jpg"]
  },
  description: {
    short: "Agence immobilière spécialisée dans la vente et la location à Koh Phangan.",
    long: "Nous proposons un service complet d'achat, de vente et de location de propriétés sur l'île. Notre équipe expérimentée vous guide à travers le processus d'investissement immobilier en Thaïlande en toute sécurité."
  },
  location: {
    address: "303 Beach Road, Thong Sala, Koh Phangan",
    coordinates: { latitude: 9.7085, longitude: 100.0215 },
    area: "Thong Sala"
  },
  contact: {
    phone: "+66 77 445 678",
    email: "info@phanganproperty.com",
    website: "www.phanganproperty.com",
    lineId: "phanganproperty",
    social: {
      facebook: "facebook.com/phanganproperty",
      instagram: "instagram.com/phanganproperty"
    }
  },
  hours: {
    regularHours: "Mon-Fri: 9:00-18:00, Sat: 10:00-15:00"
  },
  rating: {
    score: 4.7,
    reviewCount: 42
  },
  tags: ["real estate", "property", "sale", "rental", "villa", "land", "investment"],
  prices: {
    priceRange: "€€€€"
  },
  features: ["Multi-lingual Staff", "Legal Assistance", "Property Management"],
  languages: ["English", "Thai", "French", "German"],
  createdAt: "2023-06-15T10:30:00Z",
  updatedAt: "2023-12-10T11:20:00Z",
  promotion: {
    isSponsored: false
  },
  attributes: {
    serviceType: "real_estate_agency",
    servicesOffered: [
      "Property Sales",
      "Long-term Rentals",
      "Property Management",
      "Investment Consulting",
      "Legal Services"
    ],
    properties: [
      {
        type: "Villa",
        status: "for_sale",
        listingId: "V123",
        location: "Srithanu",
        bedrooms: 3,
        bathrooms: 2,
        size: 220,
        price: 12500000,
        currency: "THB",
        description: "Magnificent sea view villa with private pool",
        images: ["/images/properties/villa1-1.jpg", "/images/properties/villa1-2.jpg"],
        listingUrl: "/property/V123"
      },
      {
        type: "Apartment",
        status: "for_rent",
        listingId: "A456",
        location: "Thong Sala",
        bedrooms: 1,
        bathrooms: 1,
        size: 60,
        price: 20000,
        currency: "THB",
        description: "Modern apartment close to amenities",
        images: ["/images/properties/apt1-1.jpg", "/images/properties/apt1-2.jpg"],
        listingUrl: "/property/A456"
      }
    ],
    specializations: ["Luxury Villas", "Land Investment", "Rental Income Properties"],
    commission: "3% for sales, one month's rent for rentals",
    licensing: {
      licensed: true,
      licenseNumber: "RE-2023-123-KP",
      licenseVerified: true
    },
    localMarketKnowledge: "Established presence on Koh Phangan since 2010",
    yearsInBusiness: 13
  }
}; 