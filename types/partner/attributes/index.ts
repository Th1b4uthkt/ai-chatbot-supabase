// Export all attribute interfaces for establishments only
export * from './accommodation';
export * from './food_drink';
export * from './leisure';
export * from './shopping';
export * from './transport';
export * from './culture';
// Additional establishment attribute files will be exported as they are created

// Import interfaces for the union type
import { AccommodationAttributes } from './accommodation';
import { FoodDrinkAttributes } from './food_drink';
import { LeisureAttributes } from './leisure';
import { ShoppingAttributes } from './shopping';
import { TransportAttributes } from './transport';
import { CultureAttributes } from './culture';

// Import ServiceAttributes
import type { 
  HealthAttributes, 
  MobilityAttributes, 
  RealEstateAttributes,
  WellnessAttributes
} from '../../services/attributes';

// =============================
// UNION TYPE FOR ALL PARTNER ATTRIBUTES
// =============================

export type AllPartnerAttributes =
  // Establishment attributes
  | AccommodationAttributes
  | FoodDrinkAttributes
  | LeisureAttributes
  | ShoppingAttributes
  | TransportAttributes
  | CultureAttributes
  // Service attributes
  | HealthAttributes
  | MobilityAttributes
  | RealEstateAttributes
  | WellnessAttributes;

// Note: Type guards are exported directly from their respective files.
// You can import them like: import { isAccommodation, isFoodDrink } from './attributes'; 