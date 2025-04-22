// Types de base harmonisés
export type GuideCategory =
  // 1. Services & Utilitaires Indispensables
  | "applications-essentielles"
  | "visa-immigration"
  | "sante-medical"
  | "monnaie-change"
  | "communication"
  // 2. Explorer & Découvrir
  | "plages-spots"
  | "activites-nautiques"
  | "randonnee-trek"
  | "bien-etre-retraites"
  | "sites-culturels"
  // 3. Transport & Mobilité
  | "transports-locaux"
  | "ferries-bateaux"
  | "aeroport-ports"
  | "itineraires-parkings"
  // 4. Vie d'Expat & Communauté Locale
  | "logement-immobilier"
  | "coworking-espaces"
  | "formalites-entreprise"
  | "education-langues"
  | "associations-reseaux"
  // 5. Sécurité & Urgences
  | "contacts-urgence"
  | "conseils-securite"
  | "assistance-routiere"
  // 6. Culture & Vie Locale
  | "coutumes-etiquette"
  | "festivals-fetes"
  | "benevolat-associations"
  // 7. Astuces & Infos Pratiques
  | "meteo-saisons"
  | "actualites-locales"
  | "bons-plans"
  | "conseils-saisonniers";

// Structure de base pour tous les guides
export interface BaseGuideType {
  id: string;
  title: string;
  category: GuideCategory;
  mainImage: string;
  shortDescription: string;
  longDescription: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
  tags: string[];
  lastUpdatedAt: string;
  
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  galleryImages?: string[];
}

// Type pour les éléments génériques de liste qui peuvent être utilisés dans plusieurs guides
export interface ListItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  details?: Record<string, any>; // Pour stocker des détails spécifiques au type d'élément
}

// Structure harmonisée pour tous les guides avec composants modulaires
export interface GuideType extends BaseGuideType {
  // Contenu principal structuré en sections
  sections: Section[];
  
  // Éléments de liste principaux spécifiques à la catégorie (plages, restaurants, services, etc.)
  items?: ListItem[];
  
  // Contacts importants liés au guide
  contacts?: Contact[];
  
  // Informations pratiques communes à plusieurs catégories
  practicalInfo?: PracticalInfo;
  
  // Recommandations
  recommendations?: Recommendation[];
  
  // Avis et témoignages
  testimonials?: Testimonial[];
}

// TYPES MODULAIRES RÉUTILISABLES

// Section: élément structurel de base pour organiser le contenu
export interface Section {
  id: string;
  title: string;
  content: string | Section[]; // Contenu texte ou sous-sections
  order: number;
  iconName?: string;
  media?: Media[];
}

// Media: images, vidéos ou autres médias
export interface Media {
  type: "image" | "video" | "document" | "audio";
  url: string;
  caption?: string;
  thumbnailUrl?: string;
}

// Contact: personne ou organisation
export interface Contact {
  name: string;
  type: string; // ex: "hospital", "school", "agency", etc.
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  openingHours?: string;
  description?: string;
}

// Informations pratiques communes
export interface PracticalInfo {
  pricing?: {
    range: string;
    currency: string;
    details?: string;
  };
  schedule?: {
    openingHours?: string;
    bestTimeToVisit?: string;
    seasonality?: string;
  };
  accessibility?: {
    wheelchair?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
    languageSupport?: string[];
  };
  requirements?: string[];
  warnings?: string[];
  tips?: string[];
}

// Recommandation
export interface Recommendation {
  title: string;
  description: string;
  type: string; // ex: "budget", "luxury", "family", etc.
  rating?: number;
}

// Témoignage
export interface Testimonial {
  author: string;
  content: string;
  date: string;
  rating?: number;
  authorImage?: string;
}

// Extensions spécifiques pour certaines catégories qui nécessitent des champs très particuliers
// Ces extensions sont optionnelles et n'ajoutent que les champs vraiment essentiels

// Pour les transports
export interface TransportGuideExtension {
  routes?: {
    from: string;
    to: string;
    duration: string;
    price: string;
    frequency?: string;
  }[];
  providers?: {
    name: string;
    services: string[];
    contact: Contact;
  }[];
}

// Pour les activités
export interface ActivityGuideExtension {
  difficulty?: "easy" | "moderate" | "difficult" | "expert";
  duration?: string;
  equipment?: string[];
  bestSeason?: string;
}

// Pour les services
export interface ServiceGuideExtension {
  services: {
    name: string;
    description: string;
    price?: string;
    availability?: string;
  }[];
  requirements?: string[];
}

// Pour les lieux
export interface PlaceGuideExtension {
  facilities?: string[];
  nearbyAttractions?: string[];
  entranceFee?: string;
}

// Utilisation des extensions
export type TransportGuide = GuideType & TransportGuideExtension;
export type ActivityGuide = GuideType & ActivityGuideExtension;
export type ServiceGuide = GuideType & ServiceGuideExtension;
export type PlaceGuide = GuideType & PlaceGuideExtension;