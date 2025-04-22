export type PartnerCategory = 
  // Transport et location
  | "location-scooter" | "location-voiture" | "location-bateau" | "location-velo"
  // Hébergement
  | "hebergement-appartement" | "hebergement-bungalow" | "hebergement-villa" | "hebergement-guesthouse"
  // Nourriture et boissons
  | "restaurant" | "cafe" | "bar" | "street-food"
  // Bien-être et santé
  | "salon-massage" | "spa" | "yoga-meditation" | "medical"
  // Services professionnels
  | "architecte" | "agence-immobiliere" | "location-materiel"
  // Commerce
  | "magasin-vetements" | "supermarche" | "boutique-artisanale"
  // Loisirs et activités
  | "excursion" | "plongee" | "cours"
  // Nightlife
  | "club" | "bar-nuit" | "full-moon-party"
  // Spirituel/Ésotérique
  | "retraite-spirituelle" | "medium" | "meditation"
  // Autres
  | "evenement" | "service-educatif" | "autre";

// Base type for all partners
export interface PartnerType {
  id: string;
  name: string;
  category: PartnerCategory;
  image: string;
  shortDescription: string;
  location: string;
  rating: number;
  reviews: number;
  priceRange: string;
  features: string[];
  openHours: string;
  contact: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  gallery: string[];
  longDescription: string;
  
  // Sponsored fields
  is_sponsored?: boolean;
  sponsor_end_date?: string; // ISO date string when sponsorship ends
  
  // Enhanced fields for better partner information
  website?: string;
  email?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    lineId?: string;
  };
  tags?: string[]; // For searchability and filtering
  availability?: {
    days: string[];
    seasonalClosure?: string[];
  };
  accessibility?: {
    wheelchair?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
  };
  paymentOptions?: {
    cash?: boolean;
    creditCard?: boolean;
    mobilePay?: boolean;
    cryptocurrencies?: boolean;
  };
  languages?: string[]; // Languages spoken
  discounts?: {
    description: string;
    validUntil?: string;
    code?: string;
  }[];
  services?: string[]; // Additional services offered
  customerReviews?: {
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  faq?: {
    question: string;
    answer: string;
  }[];
  updatedAt?: string; // When the partner info was last updated
}

// ======= VEHICULE ET TRANSPORT ========

// Type de base pour tous les véhicules
interface VehicleRentalBase extends PartnerType {
  rentalOptions: {
    pricePerDay: number;
    pricePerWeek?: number;
    pricePerMonth?: number;
    deposit: number;
    requiresLicense: boolean;
    insuranceIncluded: boolean;
    deliveryAvailable?: boolean;
    deliveryFee?: number;
  };
}

// Scooter
export interface ScooterRentalPartner extends VehicleRentalBase {
  category: "location-scooter";
  scooterDetails: {
    types: Array<{
      model: string;
      engineCapacityCC: number;
      type: "standard" | "automatique" | "semi-automatique" | "electrique";
      fuelEfficiency?: string; // km/L
      topSpeed?: number; // km/h
      pricePerDay: number;
      quantity: number;
      images?: string[];
    }>;
    helmetIncluded: boolean;
    raincoatIncluded?: boolean;
  };
}

// Voiture
export interface CarRentalPartner extends VehicleRentalBase {
  category: "location-voiture";
  carDetails: {
    types: Array<{
      model: string;
      brand: string;
      year?: number;
      carType: "compact" | "sedan" | "SUV" | "pickup" | "van" | "jeep";
      transmission: "manuelle" | "automatique";
      fuelType: "essence" | "diesel" | "electrique" | "hybride";
      seatingCapacity: number;
      pricePerDay: number;
      quantity: number;
      images?: string[];
    }>;
    driverAvailable?: boolean;
    driverPricePerDay?: number;
  };
}

// Bateau
export interface BoatRentalPartner extends VehicleRentalBase {
  category: "location-bateau";
  boatDetails: {
    types: Array<{
      type: "longtail" | "speedboat" | "yacht" | "catamaran" | "bateau-peche";
      capacity: number;
      length?: number; // en mètres
      withCaptain: boolean;
      pricePerHour?: number;
      pricePerDay: number;
      includes: string[]; // equipment, refreshments, etc.
      images?: string[];
    }>;
    destinations?: string[];
    privateCharter: boolean;
  };
}

// Vélo
export interface BikeRentalPartner extends VehicleRentalBase {
  category: "location-velo";
  bikeDetails: {
    types: Array<{
      type: "mountain" | "city" | "electric" | "road" | "children";
      frameSize?: string[];
      pricePerDay: number;
      quantity: number;
      images?: string[];
    }>;
    helmetIncluded: boolean;
    lockIncluded: boolean;
    repairKitAvailable?: boolean;
    guidedToursAvailable?: boolean;
  };
}

// ======= HEBERGEMENT ========

// Type de base pour l'hébergement
interface AccommodationBase extends PartnerType {
  category: "hebergement-appartement" | "hebergement-bungalow" | "hebergement-villa" | "hebergement-guesthouse";
  accommodationDetails: {
    units: Array<{
      name?: string;
      rooms: number;
      beds: number;
      maxGuests: number;
      size?: number; // m²
      pricePerNight: number;
      pricePerWeek?: number;
      pricePerMonth?: number;
      images?: string[];
    }>;
    amenities: string[]; // wifi, piscine, etc.
    policies: {
      checkIn: string;
      checkOut: string;
      cancellation: string;
      petsAllowed: boolean;
      smokingAllowed: boolean;
      partiesAllowed: boolean;
    };
    nearbyAttractions?: string[];
    distanceToBeach?: number; // en mètres
    transferService?: boolean;
    breakfast?: boolean;
    cleaning?: boolean;
  };
}

// Types spécifiques pour différencier les propriétés uniques
export interface ApartmentPartner extends AccommodationBase {
  category: "hebergement-appartement";
  apartmentDetails?: {
    floor?: number;
    elevator?: boolean;
    buildingAmenities?: string[];
  };
}

export interface BungalowPartner extends AccommodationBase {
  category: "hebergement-bungalow";
  bungalowDetails?: {
    type: "plage" | "jardin" | "colline" | "jungle";
    construction: "bois" | "bambou" | "pierre" | "moderne" | "mixte";
    privateTerrasse?: boolean;
  };
}

export interface VillaPartner extends AccommodationBase {
  category: "hebergement-villa";
  villaDetails?: {
    privatePiscine: boolean;
    gardien?: boolean;
    jardin?: boolean;
    cuisineEquipee?: boolean;
    staffInclus?: {
      menage?: boolean;
      chef?: boolean;
      chauffeur?: boolean;
    };
  };
}

export interface GuesthousePartner extends AccommodationBase {
  category: "hebergement-guesthouse";
  guesthouseDetails?: {
    isShared: boolean;
    commonAreas: string[];
    mealOptions?: {
      breakfast?: boolean;
      lunch?: boolean;
      dinner?: boolean;
      communalKitchen?: boolean;
    };
    hostLivesOnProperty?: boolean;
  };
}

// ======= NOURRITURE ET BOISSONS ========

// Type de base pour la restauration
interface FoodDrinkBase extends PartnerType {
  menuHighlights?: string[];
  specialDiets?: Array<"vegetarien" | "vegan" | "sans-gluten" | "hallal" | "kasher">;
  priceRange: string;
  atmosphere?: string[];
  bestSellingItems?: string[];
}

export interface RestaurantPartner extends FoodDrinkBase {
  category: "restaurant";
  restaurantDetails: {
    cuisineType: string[];
    mealTimes: Array<"petit-dejeuner" | "dejeuner" | "diner">;
    seating: {
      indoor: boolean;
      outdoor: boolean;
      beachfront?: boolean;
      rooftop?: boolean;
    };
    reservationRequired?: boolean;
    privateEvents?: boolean;
  };
}

export interface CafePartner extends FoodDrinkBase {
  category: "cafe";
  cafeDetails: {
    coffeeOrigins?: string[];
    hasFood: boolean;
    coffeeSpecialties?: string[];
    workFriendly?: boolean;
    powerOutlets?: boolean;
    wifi: boolean;
  };
}

export interface BarPartner extends FoodDrinkBase {
  category: "bar";
  barDetails: {
    barType: Array<"cocktail" | "biere" | "vin" | "sport" | "lounge">;
    liveMusic?: boolean;
    musicGenre?: string[];
    happyHour?: {
      available: boolean;
      timing?: string;
      offers?: string[];
    };
    servesFood?: boolean;
  };
}

export interface StreetFoodPartner extends FoodDrinkBase {
  category: "street-food";
  streetFoodDetails: {
    specialty: string[];
    mobileTruck?: boolean;
    seating?: boolean;
    typicalWaitTime?: string;
  };
}

// ======= BIEN-ETRE ET SANTE ========

export interface MassageSalonPartner extends PartnerType {
  category: "salon-massage";
  massageDetails: {
    treatments: Array<{
      name: string;
      description?: string;
      duration: number; // en minutes
      price: number;
    }>;
    massageStyles: string[]; // thai, suédois, etc.
    oilOptions?: string[];
    homeService?: boolean;
    couplesMassage?: boolean;
  };
}

export interface SpaPartner extends PartnerType {
  category: "spa";
  spaDetails: {
    treatments: Array<{
      name: string;
      description?: string;
      duration: number;
      price: number;
    }>;
    facilities: string[]; // sauna, hammam, etc.
    packages?: Array<{
      name: string;
      treatments: string[];
      duration: number;
      price: number;
      forCouples?: boolean;
    }>;
    products?: string[];
  };
}

export interface YogaMeditationPartner extends PartnerType {
  category: "yoga-meditation";
  yogaDetails: {
    styles: string[]; // hatha, vinyasa, etc.
    classes: Array<{
      name: string;
      level: "debutant" | "intermediaire" | "avance" | "tous-niveaux";
      duration: number;
      price: number;
      schedule: string;
    }>;
    retreats?: Array<{
      name: string;
      duration: number; // jours
      description?: string;
      price: number;
      includes: string[];
    }>;
    privateClasses?: boolean;
    certification?: string;
  };
}

export interface MedicalPartner extends PartnerType {
  category: "medical";
  medicalDetails: {
    specialization?: string[];
    services: string[];
    emergencyService?: boolean;
    insuranceAccepted?: string[];
    languages: string[]; // important for medical
    qualifications?: string[];
    appointmentRequired: boolean;
  };
}

// ======= NIGHTLIFE ========

export interface ClubPartner extends PartnerType {
  category: "club";
  clubDetails: {
    musicGenre: string[];
    coverCharge?: number;
    specialNights?: Array<{
      day: string;
      theme: string;
      description?: string;
    }>;
    dressCode?: string;
    vipService?: boolean;
    danceFloors?: number;
    capacity?: number;
  };
}

export interface NightBarPartner extends PartnerType {
  category: "bar-nuit";
  nightBarDetails: {
    barType: Array<"cocktail" | "biere" | "vin" | "sport" | "lounge">;
    liveMusic?: boolean;
    musicGenre?: string[];
    happyHour?: {
      available: boolean;
      timing?: string;
      offers?: string[];
    };
    servesFood?: boolean;
    danceFloor?: boolean;
    openingHours: string;
    closingHours: string;
  };
}

export interface FullMoonPartyPartner extends PartnerType {
  category: "full-moon-party";
  partyDetails: {
    location: string;
    nextDates: string[];
    entranceFee?: number;
    specialFeatures: string[];
    prePartyEvents?: string[];
    shuttleService?: boolean;
    ticketsAvailableOnline?: boolean;
  };
}

// ======= SPIRITUEL/ESOTERIQUE ========

export interface SpiritualRetreatPartner extends PartnerType {
  category: "retraite-spirituelle";
  retreatDetails: {
    philosophies: string[];
    programLength: Array<{
      duration: number; // jours
      price: number;
      accommodation: "inclus" | "non-inclus";
      meals: "inclus" | "partiel" | "non-inclus";
    }>;
    activities: string[];
    teachersInfo?: Array<{
      name: string;
      specialization: string;
      bio?: string;
    }>;
    silence?: boolean;
    detoxProgram?: boolean;
  };
}

export interface MediumPartner extends PartnerType {
  category: "medium";
  mediumDetails: {
    services: Array<{
      type: string;
      duration: number;
      price: number;
      description?: string;
    }>;
    specializations: string[];
    languages: string[];
    appointmentOnly: boolean;
    onlineConsultation?: boolean;
  };
}

export interface MeditationPartner extends PartnerType {
  category: "meditation";
  meditationDetails: {
    styles: string[];
    classes: Array<{
      name: string;
      level: "debutant" | "intermediaire" | "avance" | "tous-niveaux";
      duration: number;
      price: number;
      schedule: string;
    }>;
    environment: string[];
    teacherExperience?: string;
    dropInAvailable: boolean;
  };
}

// ======= SERVICES PROFESSIONNELS ========

export interface ArchitectPartner extends PartnerType {
  category: "architecte";
  architectDetails: {
    specializations: string[];
    projectTypes: string[];
    pastProjects?: Array<{
      name: string;
      type: string;
      location?: string;
      year?: number;
      images?: string[];
    }>;
    consultationFee?: number;
    certifications?: string[];
  };
}

export interface RealEstatePartner extends PartnerType {
  category: "agence-immobiliere";
  realEstateDetails: {
    services: Array<"vente" | "location" | "gestion" | "investissement">;
    propertiesManaged?: number;
    specializations?: string[];
    rentalCommission?: string;
    saleCommission?: string;
    longTermRentals?: boolean;
    shortTermRentals?: boolean;
  };
}

export interface EquipmentRentalPartner extends PartnerType {
  category: "location-materiel";
  equipmentDetails: {
    categories: string[];
    popularItems: Array<{
      name: string;
      pricePerDay: number;
      deposit?: number;
      quantity: number;
    }>;
    requiresID: boolean;
    deliveryAvailable?: boolean;
    minimumRentalPeriod?: string;
  };
}

// ======= COMMERCE ========

export interface ClothingStorePartner extends PartnerType {
  category: "magasin-vetements";
  storeDetails: {
    clothingTypes: string[];
    brands?: string[];
    priceRange: string;
    customization?: boolean;
    locallyMade?: boolean;
  };
}

export interface SupermarketPartner extends PartnerType {
  category: "supermarche";
  supermarketDetails: {
    sections: string[];
    importedProducts: boolean;
    localProducts: boolean;
    deliveryService?: boolean;
    freshProduce?: boolean;
    alcoholSales?: boolean;
  };
}

export interface CraftShopPartner extends PartnerType {
  category: "boutique-artisanale";
  craftShopDetails: {
    productTypes: string[];
    locallyMade: boolean;
    workshops?: Array<{
      name: string;
      duration: number;
      price: number;
      materials: "inclus" | "non-inclus";
    }>;
    customOrders?: boolean;
  };
}

// ======= ACTIVITES ET LOISIRS ========

export interface ExcursionPartner extends PartnerType {
  category: "excursion";
  excursionDetails: {
    destinations: string[];
    duration: string;
    difficulty: "facile" | "moderate" | "difficile";
    includes: string[];
    excludes: string[];
    minParticipants?: number;
    maxParticipants: number;
    pickupService?: boolean;
    recommended: string[];
  };
}

export interface DivingPartner extends PartnerType {
  category: "plongee";
  divingDetails: {
    diveSpots: string[];
    courses: Array<{
      name: string;
      level: string;
      duration: string;
      price: number;
      certification: string;
    }>;
    funDives: Array<{
      name: string;
      spots: string[];
      price: number;
      includes: string[];
    }>;
    equipmentRental: boolean;
    experienceRequired?: boolean;
    boatType?: string;
  };
}

export interface CoursePartner extends PartnerType {
  category: "cours";
  courseDetails: {
    subjects: string[];
    formats: Array<"individuel" | "groupe" | "intensif" | "regulier">;
    levels: string[];
    duration: Array<{
      length: string;
      price: number;
    }>;
    certification?: boolean;
    materials: "inclus" | "non-inclus" | "optionnel";
    languages: string[];
  };
}

// ======= EDUCATION ========

export interface EducationalServicePartner extends PartnerType {
  category: "service-educatif";
  educationalDetails: {
    serviceType: Array<"ecole-langue" | "tutoring" | "cours-specialise" | "formation-professionnelle">;
    subjects: string[];
    ageGroups?: Array<"enfants" | "adolescents" | "adultes" | "seniors">;
    certification?: string;
    classSize?: number;
    methodology?: string;
    duration: Array<{
      period: string;
      hours: number;
      price: number;
    }>;
  };
}

// ======= EVENEMENTS ========

export interface EventPartner extends PartnerType {
  category: "evenement";
  eventDetails: {
    eventType: string[];
    upcomingEvents: Array<{
      name: string;
      date: string;
      time: string;
      description: string;
      price?: number;
      ticketLink?: string;
    }>;
    regularFrequency?: string;
    venueCapacity?: number;
    amenities?: string[];
    catering?: boolean;
  };
}

// ======= AUTRES ========

export interface CustomPartner extends PartnerType {
  category: "autre";
  customAttributes: Record<string, any>;
}

// Type Union pour tous les partenaires
export type Partner = 
  | ScooterRentalPartner 
  | CarRentalPartner 
  | BoatRentalPartner
  | BikeRentalPartner
  | ApartmentPartner 
  | BungalowPartner 
  | VillaPartner
  | GuesthousePartner
  | RestaurantPartner 
  | CafePartner 
  | BarPartner
  | StreetFoodPartner
  | MassageSalonPartner 
  | SpaPartner 
  | YogaMeditationPartner
  | MedicalPartner
  | ClubPartner 
  | NightBarPartner
  | FullMoonPartyPartner
  | SpiritualRetreatPartner 
  | MediumPartner
  | MeditationPartner
  | ArchitectPartner 
  | RealEstatePartner
  | EquipmentRentalPartner
  | ClothingStorePartner
  | SupermarketPartner
  | CraftShopPartner
  | ExcursionPartner
  | DivingPartner
  | CoursePartner
  | EducationalServicePartner
  | EventPartner
  | CustomPartner;

// Type Guards to check partner types
export function isScooterRental(partner: Partner): partner is ScooterRentalPartner {
  return partner.category === 'location-scooter';
}

export function isCarRental(partner: Partner): partner is CarRentalPartner {
  return partner.category === 'location-voiture';
}

export function isBoatRental(partner: Partner): partner is BoatRentalPartner {
  return partner.category === 'location-bateau';
}

export function isBikeRental(partner: Partner): partner is BikeRentalPartner {
  return partner.category === 'location-velo';
}

export function isApartment(partner: Partner): partner is ApartmentPartner {
  return partner.category === 'hebergement-appartement';
}

export function isBungalow(partner: Partner): partner is BungalowPartner {
  return partner.category === 'hebergement-bungalow';
}

export function isVilla(partner: Partner): partner is VillaPartner {
  return partner.category === 'hebergement-villa';
}

export function isGuesthouse(partner: Partner): partner is GuesthousePartner {
  return partner.category === 'hebergement-guesthouse';
}

export function isRestaurant(partner: Partner): partner is RestaurantPartner {
  return partner.category === 'restaurant';
}

export function isCafe(partner: Partner): partner is CafePartner {
  return partner.category === 'cafe';
}

export function isBar(partner: Partner): partner is BarPartner {
  return partner.category === 'bar';
}

// And so on for other partner types... 