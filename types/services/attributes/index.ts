// Export all attribute interfaces for services
export * from './culture';
export * from './health';
export * from './mobility';
export * from './real_estate';
export * from './wellness';
// Additional service attribute files will be exported as they are created

// Import interfaces for the union type
import { CultureAttributes } from './culture';
import { HealthAttributes } from './health';
import { MobilityAttributes } from './mobility';
import { RealEstateAttributes } from './real_estate';
import { WellnessAttributes } from './wellness';

// =============================
// UNION TYPE FOR ALL SERVICE ATTRIBUTES
// =============================

export type ServiceAttributes =
  | CultureAttributes
  | HealthAttributes
  | MobilityAttributes
  | RealEstateAttributes
  | WellnessAttributes;

// The type guards are exported directly from their respective files. 