/**
 * Utility functions to map between our Partner types and the database schema
 */
import { Partner, PartnerType } from '@/types/partner';

import { Partner as SupabasePartner } from './types';

/**
 * Maps a partner from our application model to the database schema
 */
export function mapPartnerToDb(partner: PartnerType): Partial<SupabasePartner> {
  // Base fields common to all partner types
  const baseFields = {
    id: partner.id,
    name: partner.name,
    category: partner.category,
    image: partner.image,
    short_description: partner.shortDescription,
    location: partner.location,
    rating: partner.rating,
    reviews: partner.reviews,
    price_range: partner.priceRange,
    features: partner.features,
    open_hours: partner.openHours,
    contact: partner.contact,
    coordinates: partner.coordinates,
    gallery: partner.gallery,
    long_description: partner.longDescription,
    is_sponsored: partner.is_sponsored,
    sponsor_end_date: partner.sponsor_end_date,
    website: partner.website,
    email: partner.email,
    social: partner.social,
    tags: partner.tags,
    availability: partner.availability,
    accessibility: partner.accessibility,
    payment_options: partner.paymentOptions,
    languages: partner.languages,
    discounts: partner.discounts,
    services: partner.services,
    customer_reviews: partner.customerReviews,
    faq: partner.faq,
    updated_at: partner.updatedAt,
  };

  // Type-specific fields
  let typeSpecificFields = {};

  // Handle Vehicle rentals
  if (
    partner.category === 'location-scooter' ||
    partner.category === 'location-voiture' ||
    partner.category === 'location-bateau' ||
    partner.category === 'location-velo'
  ) {
    // As any is used for typecasting because the Partner types don't share a common interface for these fields
    const vehiclePartner = partner as any;
    if (vehiclePartner.rentalOptions) {
      typeSpecificFields = {
        ...typeSpecificFields,
        rental_options: vehiclePartner.rentalOptions,
      };
    }

    // Add type-specific details
    if (partner.category === 'location-scooter' && vehiclePartner.scooterDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        vehicle_details: vehiclePartner.scooterDetails,
      };
    } else if (partner.category === 'location-voiture' && vehiclePartner.carDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        vehicle_details: vehiclePartner.carDetails,
      };
    } else if (partner.category === 'location-bateau' && vehiclePartner.boatDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        vehicle_details: vehiclePartner.boatDetails,
      };
    } else if (partner.category === 'location-velo' && vehiclePartner.bikeDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        vehicle_details: vehiclePartner.bikeDetails,
      };
    }
  }

  // Handle Accommodation
  if (
    partner.category === 'hebergement-appartement' ||
    partner.category === 'hebergement-bungalow' ||
    partner.category === 'hebergement-villa' ||
    partner.category === 'hebergement-guesthouse'
  ) {
    const accommodationPartner = partner as any;
    if (accommodationPartner.accommodationDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        accommodation_details: accommodationPartner.accommodationDetails,
      };
    }

    // Add type-specific details
    if (partner.category === 'hebergement-appartement' && accommodationPartner.apartmentDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        business_details: accommodationPartner.apartmentDetails,
      };
    } else if (partner.category === 'hebergement-bungalow' && accommodationPartner.bungalowDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        business_details: accommodationPartner.bungalowDetails,
      };
    } else if (partner.category === 'hebergement-villa' && accommodationPartner.villaDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        business_details: accommodationPartner.villaDetails,
      };
    } else if (partner.category === 'hebergement-guesthouse' && accommodationPartner.guesthouseDetails) {
      typeSpecificFields = {
        ...typeSpecificFields,
        business_details: accommodationPartner.guesthouseDetails,
      };
    }
  }

  // Handle other business types (restaurants, bars, etc.)
  // This is a simplified approach - in a real implementation you'd want to handle each type
  if ((partner as any).restaurantDetails) {
    typeSpecificFields = {
      ...typeSpecificFields,
      business_details: (partner as any).restaurantDetails,
    };
  } else if ((partner as any).cafeDetails) {
    typeSpecificFields = {
      ...typeSpecificFields,
      business_details: (partner as any).cafeDetails,
    };
  } else if ((partner as any).barDetails) {
    typeSpecificFields = {
      ...typeSpecificFields,
      business_details: (partner as any).barDetails,
    };
  }
  // Add more type-specific mappings as needed

  return {
    ...baseFields,
    ...typeSpecificFields,
  };
}

/**
 * Maps a partner from the database schema to our application model
 * This is a simplified approach, in a real implementation you'd want a more robust type detection
 */
export function mapDbToPartner(dbPartner: SupabasePartner): Partial<Partner> {
  // Helper to safely cast complex JSON fields
  const safeCast = <T>(val: any): T | undefined => {
    if (val === null) return undefined;
    return val as T;
  };

  // Base fields common to all partner types
  const baseFields = {
    id: dbPartner.id,
    name: dbPartner.name,
    category: dbPartner.category as any, // Type assertion needed here
    image: dbPartner.image,
    shortDescription: dbPartner.short_description,
    location: dbPartner.location,
    rating: dbPartner.rating,
    reviews: dbPartner.reviews,
    priceRange: dbPartner.price_range,
    features: dbPartner.features,
    openHours: dbPartner.open_hours,
    contact: dbPartner.contact,
    coordinates: safeCast(dbPartner.coordinates),
    gallery: dbPartner.gallery,
    longDescription: dbPartner.long_description,
    is_sponsored: dbPartner.is_sponsored || false,
    sponsor_end_date: dbPartner.sponsor_end_date || undefined,
    website: dbPartner.website || undefined,
    email: dbPartner.email || undefined,
    social: safeCast(dbPartner.social),
    tags: dbPartner.tags || undefined,
    availability: safeCast(dbPartner.availability),
    accessibility: safeCast(dbPartner.accessibility),
    paymentOptions: safeCast(dbPartner.payment_options),
    languages: dbPartner.languages || undefined,
    discounts: safeCast(dbPartner.discounts),
    services: dbPartner.services || undefined,
    customerReviews: safeCast(dbPartner.customer_reviews),
    faq: safeCast(dbPartner.faq),
    updatedAt: dbPartner.updated_at || undefined,
  };

  // Type-specific enrichments would go here
  // This is a simplified approach - in a real implementation, 
  // you'd want to handle each partner type specifically

  return baseFields as any; // Final type assertion to avoid complex type issues
} 