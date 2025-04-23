// =============================
// BASE TYPES AND ENUMERATIONS
// =============================

// Enumération principale des catégories par section
export enum PartnerSection {
  ESTABLISHMENT = "establishment", // Lieux & Établissements
  SERVICE = "service"              // Services & Prestations
}

// Catégories pour ESTABLISHMENT (Lieux & Établissements)
export enum EstablishmentCategory {
  // Hébergement
  ACCOMMODATION = "accommodation",
  // Restauration & Bars
  FOOD_DRINK = "food_drink",  
  // Loisirs & Activités
  LEISURE = "leisure",
  // Shopping & Artisanat
  SHOPPING = "shopping",
  // Culture & Événements
  CULTURE = "culture",
  // Transports partenaires (établissements)
  TRANSPORT_PROVIDER = "transport_provider"
}

// Catégories pour SERVICE (Services & Prestations)
export enum ServiceCategory {
  // Transport & Mobilité
  MOBILITY = "mobility",
  // Santé & Urgences
  HEALTH = "health",
  // Bien-être & Esthétique
  WELLNESS = "wellness",
  // Maintenance & Bricolage
  MAINTENANCE = "maintenance",
  // Immobilier & Location
  REAL_ESTATE = "real_estate",
  // Professions Libérales
  PROFESSIONAL = "professional",
  // Automobile & Marine
  VEHICLE_REPAIR = "vehicle_repair"
}

// Sous-catégories pour une organisation plus fine - Extensible si besoin
export enum PartnerSubcategory {
  // Hébergement
  HOTEL = "hotel",
  BUNGALOW = "bungalow",
  VILLA = "villa",
  GUESTHOUSE = "guesthouse",
  HOSTEL = "hostel",
  
  // Restauration & Bars
  RESTAURANT = "restaurant",
  CAFE = "cafe",
  BAR = "bar",
  BEACH_BAR = "beach_bar",
  FOOD_TRUCK = "food_truck",
  STREET_FOOD = "street_food",
  
  // Loisirs & Activités
  DIVING = "diving",
  YOGA = "yoga",
  EXCURSION = "excursion",
  WATER_SPORTS = "water_sports",
  HIKING = "hiking",
  
  // Shopping & Artisanat
  MARKET = "market",
  CLOTHING = "clothing_store",
  SOUVENIR = "souvenir_shop",
  CRAFT_SHOP = "craft_shop",
  
  // Culture & Événements
  GALLERY = "gallery",
  CONCERT_VENUE = "concert_venue",
  FESTIVAL = "festival",
  WORKSHOP = "workshop",
  CLASSES = "classes",
  
  // Transport partenaires
  FERRY = "ferry",
  BOAT_TOUR = "boat_tour",
  SHUTTLE = "shuttle",
  
  // Transport & Mobilité
  TAXI = "taxi",
  SCOOTER_RENTAL = "scooter_rental",
  CAR_RENTAL = "car_rental",
  PRIVATE_DRIVER = "private_driver",
  BIKE_RENTAL = "bike_rental",
  
  // Santé & Urgences
  HOSPITAL = "hospital",
  CLINIC = "clinic",
  DOCTOR = "doctor",
  PHARMACY = "pharmacy",
  EMERGENCY = "emergency",
  
  // Bien-être & Esthétique
  MASSAGE = "massage",
  SPA = "spa",
  SALON = "beauty_salon",
  YOGA_STUDIO = "yoga_studio",
  
  // Maintenance & Bricolage
  ELECTRICIAN = "electrician",
  PLUMBER = "plumber",
  HANDYMAN = "handyman",
  GARDENER = "gardener",
  
  // Immobilier & Location
  REAL_ESTATE_AGENCY = "real_estate_agency",
  PROPERTY_MANAGEMENT = "property_management",
  LONG_TERM_RENTAL = "long_term_rental",
  
  // Professions Libérales
  ARCHITECT = "architect",
  LAWYER = "lawyer",
  ACCOUNTANT = "accountant",
  CONSULTANT = "consultant",
  
  // Automobile & Marine
  CAR_MECHANIC = "car_mechanic",
  SCOOTER_REPAIR = "scooter_repair",
  BOAT_REPAIR = "boat_repair",
  
  // Divers
  OTHER = "other"
}

// =============================
// INTERFACES PRINCIPALES
// =============================

// Interface de base pour tous les partenaires
export interface BasePartner {
  id: string;
  name: string;
  section: PartnerSection;
  mainCategory: EstablishmentCategory | ServiceCategory;
  subcategory: PartnerSubcategory;
  images: {
    main: string;
    gallery?: string[];
  };
  description: {
    short: string;
    long: string;
  };
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    area?: string; // Zone de l'île (Nord, Sud, Est, Ouest, etc.)
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    lineId?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  hours: {
    regularHours?: string; // Ex: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
    seasonalChanges?: string;
    open24h?: boolean;
  };
  rating: {
    score?: number; // Sur 5 étoiles
    reviewCount?: number;
    testimonials?: Array<{
      author: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  tags: string[]; // Pour la recherche et le filtrage
  prices: {
    priceRange: "€" | "€€" | "€€€" | "€€€€"; // Indicateur général
    currency?: string; // THB, USD, EUR
  };
  features: string[]; // Caractéristiques principales
  languages?: string[]; // Langues parlées
  createdAt: string;
  updatedAt: string;
  
  // Champs pour le sponsoring et la mise en avant
  promotion?: {
    isSponsored: boolean;
    isFeatured?: boolean;
    promotionEndsAt?: string;
    discount?: {
      description: string;
      code?: string;
      validUntil: string;
    };
  };
  
  // Champs communs utiles pour plusieurs types
  accessibility?: {
    wheelchairAccessible?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
  };
  
  paymentOptions?: {
    cash?: boolean;
    creditCard?: boolean;
    mobilePay?: boolean;
    cryptoCurrency?: boolean;
    acceptedCards?: string[]; // Visa, Mastercard, etc.
  };
  
  // FAQ du partenaire
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

// =============================
// ATTRIBUTS SPÉCIFIQUES PAR CATÉGORIE
// =============================

// Interface pour les attributs spécifiques à chaque catégorie
export interface PartnerAttributes {
  // Pour éviter d'avoir des champs vides, on utilise un Record dynamique
  [key: string]: any;
}

// =============================
// INTERFACE PRINCIPALE DU PARTENAIRE
// =============================

export interface Partner extends BasePartner {
  // Attributs spécifiques à la catégorie
  attributes: PartnerAttributes;
}

// =============================
// ATTRIBUTS SPÉCIFIQUES PRÉDEFINIS
// =============================

// HÉBERGEMENT
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

// RESTAURATION & BARS
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

// LOISIRS & ACTIVITÉS
export interface LeisureActivityAttributes extends PartnerAttributes {
  activityType: string;
  options: Array<{
    name: string;
    duration: string;
    price: number;
    description?: string;
    difficulty?: "beginner" | "intermediate" | "advanced" | "all-levels";
    minParticipants?: number;
    maxParticipants?: number;
    included?: string[];
    excluded?: string[];
    images?: string[];
  }>;
  equipment?: {
    provided?: string[];
    required?: string[];
    rentAvailable?: boolean;
    rentalPrices?: Record<string, number>;
  };
  bookingInfo: {
    advanceBookingRequired?: boolean;
    cancelPolicy?: string;
    meetingPoint?: string;
    pickupAvailable?: boolean;
  };
  seasonalAvailability?: string;
  suitableFor?: string[]; // Familles, Couples, Solo, etc.
  instructorLanguages?: string[];
  certification?: string[];
  insurance?: {
    included: boolean;
    details?: string;
  };
}

// TRANSPORT & MOBILITÉ
export interface MobilityAttributes extends PartnerAttributes {
  serviceType: "taxi" | "rental" | "transfer" | "tour";
  vehicleTypes?: Array<{
    type: string; // Scooter, Car, Boat, Bike, etc.
    models?: Array<{
      name: string;
      capacity?: number;
      pricePerHour?: number;
      pricePerDay: number;
      pricePerWeek?: number;
      details?: Record<string, any>;
      images?: string[];
    }>;
  }>;
  rentalRequirements?: string[]; // Permis, Passeport, Dépôt, etc.
  routes?: Array<{
    from: string;
    to: string;
    distance?: string;
    duration: string;
    price: number;
    frequency?: string;
  }>;
  services?: {
    delivery?: boolean;
    pickup?: boolean;
    chauffeur?: boolean;
    insurance?: boolean;
    assistance?: boolean;
  };
  bookingOptions?: {
    immediate?: boolean;
    advance?: boolean;
    onlineBooking?: boolean;
    minAdvanceTime?: string;
  };
}

// SANTÉ & URGENCES
export interface HealthAttributes extends PartnerAttributes {
  facilityType: "hospital" | "clinic" | "pharmacy" | "doctor" | "emergency";
  specializations?: string[];
  services: string[];
  emergencyService?: boolean;
  openHours: string;
  doctors?: Array<{
    name: string;
    specialization: string;
    languages: string[];
    available: string;
  }>;
  insuranceAccepted?: string[];
  paymentMethods: string[];
  appointmentRequired?: boolean;
  walkInAccepted?: boolean;
  telehealth?: boolean;
  medicalEquipment?: string[];
  prescriptionService?: boolean;
}

// BIEN-ÊTRE & ESTHÉTIQUE
export interface WellnessAttributes extends PartnerAttributes {
  serviceType: "massage" | "spa" | "salon" | "yoga" | "fitness";
  treatments?: Array<{
    name: string;
    duration: number; // En minutes
    price: number;
    description?: string;
  }>;
  packages?: Array<{
    name: string;
    treatments: string[];
    duration: number;
    price: number;
    description?: string;
  }>;
  techniques?: string[];
  products?: string[];
  specialists?: Array<{
    name: string;
    expertise: string[];
    languages: string[];
  }>;
  facilities?: string[];
  bookingInfo: {
    appointmentRequired: boolean;
    walkInAccepted?: boolean;
    homeService?: boolean;
  };
  giftCertificates?: boolean;
}

// IMMOBILIER & LOCATION
export interface RealEstateAttributes extends PartnerAttributes {
  serviceType: "agency" | "property_management" | "rental";
  services: string[];
  properties?: Array<{
    type: string;
    location: string;
    bedrooms: number;
    price: number;
    available: boolean;
    features?: string[];
    imageUrl?: string;
  }>;
  specializations?: string[];
  commission?: {
    sale?: string;
    rental?: string;
    management?: string;
  };
  licenses?: string[];
  featuredListings?: string[];
  buyerServices?: string[];
  sellerServices?: string[];
}

// =============================
// HELPERS ET TYPE GUARDS
// =============================

export function isEstablishment(partner: Partner): boolean {
  return partner.section === PartnerSection.ESTABLISHMENT;
}

export function isService(partner: Partner): boolean {
  return partner.section === PartnerSection.SERVICE;
}

export function isAccommodation(partner: Partner): partner is Partner & { attributes: AccommodationAttributes } {
  return partner.mainCategory === EstablishmentCategory.ACCOMMODATION;
}

export function isFoodDrink(partner: Partner): partner is Partner & { attributes: FoodDrinkAttributes } {
  return partner.mainCategory === EstablishmentCategory.FOOD_DRINK;
}

export function isLeisureActivity(partner: Partner): partner is Partner & { attributes: LeisureActivityAttributes } {
  return partner.mainCategory === EstablishmentCategory.LEISURE;
}

export function isMobility(partner: Partner): partner is Partner & { attributes: MobilityAttributes } {
  return partner.mainCategory === ServiceCategory.MOBILITY;
}

export function isHealth(partner: Partner): partner is Partner & { attributes: HealthAttributes } {
  return partner.mainCategory === ServiceCategory.HEALTH;
}

export function isWellness(partner: Partner): partner is Partner & { attributes: WellnessAttributes } {
  return partner.mainCategory === ServiceCategory.WELLNESS;
}

export function isRealEstate(partner: Partner): partner is Partner & { attributes: RealEstateAttributes } {
  return partner.mainCategory === ServiceCategory.REAL_ESTATE;
}

// =============================
// EXEMPLES D'UTILISATION
// =============================

// Exemple d'un hôtel
const exampleHotel: Partner = {
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
    transferService: true
  }
};

// Exemple d'un restaurant
const exampleRestaurant: Partner = {
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
    priceRange: "€€"
  },
  features: ["Beachfront", "Live Music", "Cocktails", "Fresh Seafood"],
  createdAt: "2023-07-22T08:45:00Z",
  updatedAt: "2023-11-18T16:30:00Z",
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

// Exemple d'un service de location de scooters
const exampleScooterRental: Partner = {
  id: "scoot-789",
  name: "Island Wheels",
  section: PartnerSection.SERVICE,
  mainCategory: ServiceCategory.MOBILITY,
  subcategory: PartnerSubcategory.SCOOTER_RENTAL,
  images: {
    main: "/images/scoot-789-main.jpg",
    gallery: ["/images/scoot-789-1.jpg", "/images/scoot-789-2.jpg"]
  },
  description: {
    short: "Location de scooters fiables à des prix compétitifs",
    long: "Explorez Koh Phangan en toute liberté avec nos scooters bien entretenus..."
  },
  location: {
    address: "789 Main Road, Thong Sala, Koh Phangan",
    coordinates: {
      latitude: 9.7052,
      longitude: 100.0230
    },
    area: "Thong Sala"
  },
  contact: {
    phone: "+66 77 789 123",
    email: "rent@islandwheels.com",
    lineId: "islandwheels"
  },
  hours: {
    regularHours: "Daily: 8:00-20:00"
  },
  rating: {
    score: 4.3,
    reviewCount: 56
  },
  tags: ["scooter", "rental", "mobility", "transport"],
  prices: {
    priceRange: "€",
    currency: "THB"
  },
  features: ["Free Helmet", "Delivery Option", "Insurance", "New Models"],
  languages: ["English", "Thai"],
  createdAt: "2023-08-10T09:20:00Z",
  updatedAt: "2023-12-05T11:40:00Z",
  attributes: {
    serviceType: "rental",
    vehicleTypes: [
      {
        type: "Scooter",
        models: [
          {
            name: "Honda Click 125cc",
            capacity: 2,
            pricePerDay: 250,
            details: {
              engineSize: "125cc",
              fuelType: "Gasoline",
              automatic: true
            }
          },
          {
            name: "Yamaha NMAX 155cc",
            capacity: 2,
            pricePerDay: 300,
            details: {
              engineSize: "155cc",
              fuelType: "Gasoline",
              automatic: true
            }
          }
        ]
      }
    ],
    rentalRequirements: ["Passport or Copy", "Driving License", "Deposit: 2000 THB"],
    services: {
      delivery: true,
      pickup: true,
      insurance: true,
      assistance: true
    },
    bookingOptions: {
      immediate: true,
      advance: true,
      onlineBooking: true
    }
  }
};