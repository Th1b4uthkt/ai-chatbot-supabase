import {
  Partner,
  PartnerAttributes,
  PartnerSection,
  ServiceCategory,
  PartnerSubcategory,
} from '../../partner/partner';
import { GuideCategory } from '../../newGuide';

// =============================
// ATTRIBUTS SPÉCIFIQUES: SANTÉ & URGENCES
// =============================

export interface HealthAttributes extends PartnerAttributes {
  facilityType: "hospital" | "clinic" | "doctor" | "pharmacy" | "emergency_service";
  services?: string[];
  specializations?: string[];
  emergencyService?: boolean;
  emergencyNumber?: string;
  ambulanceService?: boolean;
  appointmentRequired?: boolean;
  walkInAccepted?: boolean;
  homeVisits?: boolean;
  insuranceAccepted?: string[];
  openHours: string;
  doctors?: Array<{
    name: string;
    specialization: string;
    languages?: string[];
    available?: string;
  }>;
}

// =============================
// TYPE GUARD: SANTÉ & URGENCES
// =============================

export function isHealth(attributes: any): attributes is HealthAttributes {
  return attributes &&
         typeof attributes.facilityType === 'string' &&
         (Array.isArray(attributes.services) || attributes.services === undefined) &&
         typeof attributes.openHours === 'string';
}

// =============================
// MOCK DATA: HEALTH (CLINIC)
// =============================

export const mockClinic: Partner & { attributes: HealthAttributes } & { category: GuideCategory } = {
  id: "health-001",
  name: "Phangan Health Clinic",
  section: PartnerSection.SERVICE,
  mainCategory: ServiceCategory.HEALTH,
  category: GuideCategory.HEALTH,
  subcategory: PartnerSubcategory.CLINIC,
  images: { main: "/mock-images/clinic-main.jpg" },
  description: { short: "General practice clinic near the pier.", long: "Providing primary care, travel medicine, and minor treatments." },
  location: { address: "45 Health Way, Thong Sala" },
  contact: { phone: "+66 77 123 456" },
  hours: { regularHours: "Mon-Fri 09:00-17:00, Sat 09:00-12:00" },
  rating: { score: 4.5, reviewCount: 88 },
  tags: ["clinic", "doctor", "health", "vaccination", "thong sala"],
  prices: { priceRange: "€€" },
  features: ["English Speaking Staff", "Appointment Booking"],
  createdAt: "2023-01-15T09:00:00Z",
  updatedAt: "2024-01-10T10:00:00Z",
  attributes: {
    facilityType: "clinic",
    services: ["General Consultation", "Minor Injury Treatment", "Vaccinations", "Travel Medicine"],
    specializations: ["General Practice"],
    emergencyService: false,
    appointmentRequired: true,
    walkInAccepted: true,
    insuranceAccepted: ["AXA", "Allianz", "Bupa"],
    openHours: "Mon-Fri 09:00-17:00, Sat 09:00-12:00",
    doctors: [
      {
        name: "Dr. Somchai",
        specialization: "General Practitioner",
        languages: ["Thai", "English"],
        available: "Mon-Fri"
      }
    ]
  }
}; 