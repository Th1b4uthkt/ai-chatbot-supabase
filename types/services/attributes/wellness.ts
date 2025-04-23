import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  ServiceCategory,
  PartnerSubcategory,
} from '../../partner/partner';
import { GuideCategory } from '../../newGuide';

// =============================
// ATTRIBUTS SPÉCIFIQUES: BIEN-ÊTRE & SPA
// =============================

export interface WellnessAttributes extends PartnerAttributes {
  serviceType: "spa" | "massage" | "yoga_studio" | "beauty_salon" | "fitness" | "retreat";
  treatments?: Array<{
    name: string;
    duration: number; // in minutes
    price: number;
    category?: string;
    description?: string;
  }>;
  packages?: Array<{
    name: string;
    treatmentsIncluded: string[];
    duration: number; // in minutes
    price: number;
    description?: string;
  }>;
  classes?: Array<{
    name: string;
    schedule: string;
    description?: string;
    price?: number;
    instructor?: string;
    level?: string;
  }>;
  techniques?: string[];
  specialties?: string[];
  products?: Array<{
    name: string;
    type: string;
    brand?: string;
    organic?: boolean;
  }>;
  specialists?: Array<{
    name: string;
    specialty: string;
    experience?: number; // years
    certification?: string[];
    availability?: string;
    bio?: string;
  }>;
  facilities?: string[];
  booking?: {
    advanceRequired?: boolean;
    onlineBooking?: boolean;
    cancellationPolicy?: string;
  };
  giftCertificates?: boolean;
  membershipOptions?: string;
}

// =============================
// TYPE GUARD: BIEN-ÊTRE & SPA
// =============================

export function isWellness(attributes: any): attributes is WellnessAttributes {
  return attributes && typeof attributes.serviceType === 'string' &&
    (Array.isArray(attributes.treatments) || attributes.treatments === undefined);
}

// =============================
// MOCK DATA: WELLNESS (SPA)
// =============================

export const mockSpa: Partner & { attributes: WellnessAttributes } & { category: GuideCategory } = {
  id: "wel-505",
  name: "Serenity Spa & Wellness",
  section: PartnerSection.SERVICE,
  mainCategory: ServiceCategory.WELLNESS,
  category: GuideCategory.WELLNESS,
  subcategory: PartnerSubcategory.SPA,
  images: {
    main: "/images/wel-505-main.jpg",
    gallery: ["/images/wel-505-1.jpg", "/images/wel-505-2.jpg"]
  },
  description: {
    short: "Centre de guérison holistique et spa proposant yoga, désintoxication et soins.",
    long: "Un sanctuaire paisible pour le rajeunissement du corps et de l'esprit. Offrant une large gamme de soins de spa, de massages thérapeutiques, de cours de yoga quotidiens et de programmes de désintoxication renommés."
  },
  location: {
    address: "15/2 Moo 8, Srithanu, Koh Phangan",
    coordinates: { latitude: 9.7654, longitude: 99.9876 },
    area: "Srithanu (West Coast)"
  },
  contact: {
    phone: "+66 77 987 654",
    email: "info@serenityspa.com",
    website: "www.serenityspa.com",
    social: {
      facebook: "facebook.com/serenityspa",
      instagram: "instagram.com/serenityspa"
    }
  },
  hours: {
    regularHours: "Daily: 9:00 - 20:00"
  },
  rating: {
    score: 4.7,
    reviewCount: 350,
    testimonials: [
      {
        author: "Sophie L.",
        rating: 5,
        comment: "Une expérience de massage traditionnelle thaïlandaise incroyable. Je me sens complètement détendue!",
        date: "2023-12-01"
      }
    ]
  },
  tags: ["spa", "yoga", "detox", "massage", "holistic", "wellness", "relaxation"],
  prices: {
    priceRange: "€€€",
    currency: "THB"
  },
  features: ["Yoga Shalas", "Herbal Steam Room", "Ocean View", "Natural Products"],
  languages: ["English", "Thai", "French"],
  createdAt: "2019-03-15T08:30:00Z",
  updatedAt: "2023-11-20T14:45:00Z",
  promotion: {
    isSponsored: false
  },
  accessibility: {
    familyFriendly: true
  },
  paymentOptions: {
    cash: true,
    creditCard: true,
    mobilePay: true
  },
  attributes: {
    serviceType: "spa",
    treatments: [
      {
        name: "Traditional Thai Massage",
        duration: 90,
        price: 700,
        category: "Massage"
      },
      {
        name: "Aromatherapy Massage",
        duration: 60,
        price: 900,
        category: "Massage"
      },
      {
        name: "Herbal Compress Treatment",
        duration: 120,
        price: 1200,
        category: "Therapeutic"
      }
    ],
    packages: [
      {
        name: "Day of Serenity",
        treatmentsIncluded: ["Traditional Thai Massage", "Herbal Steam", "Facial"],
        duration: 240,
        price: 2500,
        description: "A full day of rejuvenation"
      }
    ],
    classes: [
      {
        name: "Hatha Yoga",
        schedule: "Daily 7:00 - 8:30",
        price: 400,
        instructor: "Marie",
        level: "All Levels"
      },
      {
        name: "Vinyasa Flow",
        schedule: "Mon-Fri 17:00 - 18:30",
        price: 400,
        instructor: "David",
        level: "Intermediate"
      }
    ],
    techniques: ["Traditional Thai", "Swedish", "Deep Tissue", "Reflexology", "Hot Stone"],
    specialties: ["Stress Relief", "Detoxification", "Body Alignment", "Energy Healing"],
    products: [
      {
        name: "Thai Herbal Compress",
        type: "Therapy Tools",
        organic: true
      },
      {
        name: "Coconut Oil",
        type: "Massage Oil",
        brand: "Local Organic",
        organic: true
      }
    ],
    specialists: [
      {
        name: "Nok",
        specialty: "Traditional Thai Massage",
        experience: 15,
        certification: ["Wat Po Traditional Medical School"],
        availability: "Mon-Sat"
      },
      {
        name: "Marie",
        specialty: "Yoga Instructor",
        experience: 8,
        certification: ["RYT 500"],
        availability: "Daily Morning Classes"
      }
    ],
    facilities: ["Yoga Studio", "Steam Room", "Open-air Treatment Rooms", "Ocean View Relaxation Area"],
    booking: {
      advanceRequired: true,
      onlineBooking: true,
      cancellationPolicy: "24-hour notice required for cancellation without charge"
    },
    giftCertificates: true,
    membershipOptions: "Monthly yoga passes and spa membership packages available"
  }
}; 