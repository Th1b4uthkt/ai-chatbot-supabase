import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  ServiceCategory,
  PartnerSubcategory,
} from '../../partner/partner';
import { GuideCategory } from '../../newGuide';

// =============================
// ATTRIBUTS SPÉCIFIQUES: MOBILITÉ & TRANSPORT
// =============================

export interface MobilityAttributes extends PartnerAttributes {
  serviceType: "rental" | "taxi" | "driver" | "tour" | "delivery"; 
  vehicleTypes?: Array<{
    type: string;
    models?: Array<{
      name: string;
      capacity?: number;
      pricePerDay?: number;
      pricePerWeek?: number;
      pricePerMonth?: number;
      details?: any;
      images?: string[];
    }>;
  }>;
  rentalRequirements?: string[];
  services?: {
    delivery?: boolean;
    pickup?: boolean;
    insurance?: boolean;
    roadside?: boolean;
  };
  bookingOptions?: {
    online?: boolean;
    phoneOnly?: boolean;
    inPersonOnly?: boolean;
    minimumDays?: number;
  };
  fleet?: {
    size?: number;
    age?: string;
    condition?: string;
  };
  paymentTerms?: string;
  depositRequired?: boolean;
  depositAmount?: number;
  licenseRequirements?: string[];
}

// =============================
// TYPE GUARD: MOBILITÉ & TRANSPORT
// =============================

export function isMobility(attributes: any): attributes is MobilityAttributes {
  return attributes && typeof attributes.serviceType === 'string';
}

// =============================
// MOCK DATA: MOBILITY (SCOOTER RENTAL)
// =============================

export const mockScooterRental: Partner & { attributes: MobilityAttributes } & { category: GuideCategory } = {
  id: "mob-201",
  name: "Phangan Wheels",
  section: PartnerSection.SERVICE,
  mainCategory: ServiceCategory.MOBILITY,
  category: GuideCategory.MOBILITY,
  subcategory: PartnerSubcategory.SCOOTER_RENTAL,
  images: {
    main: "/images/mob-201-main.jpg",
    gallery: ["/images/mob-201-1.jpg", "/images/mob-201-2.jpg"]
  },
  description: {
    short: "Location de scooters et motos sur Koh Phangan.",
    long: "Notre flotte comprend des scooters Honda et Yamaha bien entretenus, disponibles pour une location journalière, hebdomadaire ou mensuelle. Tous nos scooters sont assurés et nous offrons un service de livraison gratuite à votre hébergement."
  },
  location: {
    address: "24 Beach Road, Thong Sala",
    coordinates: { latitude: 9.7123, longitude: 100.0234 },
    area: "Thong Sala"
  },
  contact: {
    phone: "+66 89 123 4567",
    email: "info@phanganwheels.com",
    website: "www.phanganwheels.com"
  },
  hours: {
    regularHours: "Daily: 8:00 - 18:00"
  },
  rating: {
    score: 4.8,
    reviewCount: 156,
    testimonials: [
      {
        author: "Jean D.",
        rating: 5,
        comment: "Excellent service, scooters en parfait état.",
        date: "2023-11-15"
      }
    ]
  },
  tags: ["scooter", "rental", "transport", "thong sala", "motorbike"],
  prices: {
    priceRange: "€€",
    currency: "THB"
  },
  features: ["Free Delivery", "Insurance Included", "Helmets Provided"],
  languages: ["English", "Thai", "French"],
  createdAt: "2023-08-01T10:00:00Z",
  updatedAt: "2023-12-15T14:30:00Z",
  promotion: {
    isSponsored: false,
    isFeatured: true
  },
  paymentOptions: {
    cash: true,
    creditCard: true,
    mobilePay: false
  },
  attributes: {
    serviceType: "rental",
    vehicleTypes: [
      {
        type: "Scooter",
        models: [
          {
            name: "Honda Click 125i",
            capacity: 2,
            pricePerDay: 200,
            pricePerWeek: 1200,
            details: {
              engineSize: "125cc",
              fuelType: "gasoline",
              automatic: true,
              year: 2022
            },
            images: ["/images/scooter-honda-click.jpg"]
          },
          {
            name: "Yamaha NMAX",
            capacity: 2,
            pricePerDay: 250,
            pricePerWeek: 1500,
            details: {
              engineSize: "155cc",
              fuelType: "gasoline",
              automatic: true,
              year: 2021
            },
            images: ["/images/scooter-yamaha-nmax.jpg"]
          }
        ]
      }
    ],
    rentalRequirements: [
      "Passport or ID Copy",
      "International Driver's License",
      "Deposit (2000 THB or credit card hold)"
    ],
    services: {
      delivery: true,
      pickup: true,
      insurance: true,
      roadside: true
    },
    bookingOptions: {
      online: true,
      phoneOnly: false,
      inPersonOnly: false,
      minimumDays: 1
    },
    fleet: {
      size: 45,
      age: "Less than 2 years",
      condition: "Excellent"
    },
    depositRequired: true,
    depositAmount: 2000,
    licenseRequirements: ["International Driver's License"]
  }
}; 