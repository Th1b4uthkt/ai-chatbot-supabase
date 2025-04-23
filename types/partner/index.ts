// Export core partner types
export * from './partner';

// Export establishment-specific attribute types
export * from './attributes/accommodation';
export * from './attributes/food_drink';
export * from './attributes/leisure';
export * from './attributes/shopping';
export * from './attributes/culture';
export * from './attributes/transport';

// Export service-specific attribute types
// TODO: Add service attribute exports as needed

// Export utility functions
export { isEstablishment, isService } from './partner';
export { isAccommodation } from './attributes/accommodation';
export { isFoodDrink } from './attributes/food_drink';
export { isLeisureActivity } from './attributes/leisure';
export { isShopping } from './attributes/shopping';
export { isCulture } from './attributes/culture';
export { isTransportProvider } from './attributes/transport'; 