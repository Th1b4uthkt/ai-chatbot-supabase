import { Partner } from './partner';
import { ServiceAttributes } from '.';

// Guide main categories matching the Partner categories
export enum GuideCategory {
  CULTURE = 'culture',
  HEALTH = 'health',
  MOBILITY = 'mobility',
  REAL_ESTATE = 'real_estate',
  WELLNESS = 'wellness',
}

// Core type for a guide (based on Partner structure)
export interface Guide extends Omit<Partner, 'mainCategory' | 'attributes'> {
  category: GuideCategory;
  attributes: ServiceAttributes;
  
  // Guide-specific fields
  lastUpdatedAt: string;
  isFeatured?: boolean;
  slug?: string;
  
  // Additional guide content sections
  sections?: {
    id: string;
    title: string;
    content: string;
    order: number;
  }[];
  
  // For contact information related to the guide
  relatedContacts?: {
    id?: string;
    name: string;
    type: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    description?: string;
  }[];
  
  // Practical information specific to guides
  practicalInfo?: {
    requirements?: string[];
    warnings?: string[];
    tips?: string[];
    bestTimeToVisit?: string;
  };
}

// Helper function to get display name for guide categories
export const getCategoryDisplayName = (category: GuideCategory): string => {
  const displayNames: Record<GuideCategory, string> = {
    [GuideCategory.CULTURE]: 'Culture',
    [GuideCategory.HEALTH]: 'Health & Medical',
    [GuideCategory.MOBILITY]: 'Transport & Mobility',
    [GuideCategory.REAL_ESTATE]: 'Real Estate',
    [GuideCategory.WELLNESS]: 'Wellness & Spa',
  };
  
  return displayNames[category] || String(category);
};

// Type guards for checking guide types
export const isGuideType = (guide: Guide, categoryCheck: GuideCategory): boolean => {
  return guide.category === categoryCheck;
};

// Functions to create type-safe guides with specific attributes
export function createCultureGuide(guide: Omit<Guide, 'category' | 'attributes'> & { attributes: import('./services/attributes/culture').CultureAttributes }): Guide {
  return {
    ...guide,
    category: GuideCategory.CULTURE,
  };
}

export function createHealthGuide(guide: Omit<Guide, 'category' | 'attributes'> & { attributes: import('./services/attributes/health').HealthAttributes }): Guide {
  return {
    ...guide,
    category: GuideCategory.HEALTH,
  };
}

export function createMobilityGuide(guide: Omit<Guide, 'category' | 'attributes'> & { attributes: import('./services/attributes/mobility').MobilityAttributes }): Guide {
  return {
    ...guide,
    category: GuideCategory.MOBILITY,
  };
}

export function createRealEstateGuide(guide: Omit<Guide, 'category' | 'attributes'> & { attributes: import('./services/attributes/real_estate').RealEstateAttributes }): Guide {
  return {
    ...guide,
    category: GuideCategory.REAL_ESTATE,
  };
}

export function createWellnessGuide(guide: Omit<Guide, 'category' | 'attributes'> & { attributes: import('./services/attributes/wellness').WellnessAttributes }): Guide {
  return {
    ...guide,
    category: GuideCategory.WELLNESS,
  };
} 