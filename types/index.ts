import { CultureAttributes, isCulture, mockArtGallery } from './services/attributes/culture';
import { HealthAttributes, isHealth, mockClinic } from './services/attributes/health';
import { MobilityAttributes, isMobility, mockScooterRental } from './services/attributes/mobility';
import { RealEstateAttributes, isRealEstate, mockRealEstateAgency } from './services/attributes/real_estate';
import { WellnessAttributes, isWellness, mockSpa } from './services/attributes/wellness';

// Export all attribute types
export type {
  CultureAttributes,
  HealthAttributes,
  MobilityAttributes,
  RealEstateAttributes,
  WellnessAttributes,
};

export {
  // Type guards
  isCulture,
  isHealth,
  isMobility,
  isRealEstate,
  isWellness,
  // Mock data
  mockArtGallery,
  mockClinic,
  mockScooterRental,
  mockRealEstateAgency,
  mockSpa
};

// Create a union type for all service attributes
export type ServiceAttributes = 
  | CultureAttributes
  | HealthAttributes
  | MobilityAttributes
  | RealEstateAttributes
  | WellnessAttributes;

// Mock data collection for testing
export const mockServiceData = [
  mockArtGallery,
  mockClinic,
  mockScooterRental,
  mockRealEstateAgency,
  mockSpa
]; 