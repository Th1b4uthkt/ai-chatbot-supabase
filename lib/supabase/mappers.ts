/**
 * Utility functions to map between our Partner types and the database schema
 */
import {
  PartnerType,
  PartnerSection,
  EstablishmentCategory,
  ServiceCategory,
  PartnerSubcategory,
  PriceIndicator
} from '@/types/partner/partner'; // Adjust path if needed

import { Tables, TablesInsert, TablesUpdate } from './types'; // Use generated DB types

// Helper function for safe JSON parsing from DB (which might return objects directly for JSONB)
function parseJsonOrObject<T>(dbValue: unknown): T | null {
  if (dbValue === null || dbValue === undefined) return null;
  if (typeof dbValue === 'object') return dbValue as T; // Already an object
  if (typeof dbValue === 'string') {
    try {
      return JSON.parse(dbValue) as T;
    } catch (e) {
      console.error("Failed to parse JSON string from DB:", dbValue, e);
      return null;
    }
  }
  console.warn("Unexpected type for JSON field in DB:", typeof dbValue);
  return null;
}

/**
 * Maps the PartnerType application model to the Supabase database schema (TablesUpdate or TablesInsert).
 */
export function mapPartnerToDb(partner: Partial<PartnerType>): Partial<TablesUpdate<"partners">> {
  
  const dbData: Partial<TablesUpdate<'partners'>> = {
    name: partner.name,
    section: partner.section,
    // main_category: partner.mainCategory, // Removed as it's not in TablesUpdate<'partners'>
    subcategory: partner.subcategory,
    tags: partner.tags,
    features: partner.features,
    languages: partner.languages,
    
    // Map nested PartnerType fields to corresponding DB columns
    image: partner.images?.main,
    gallery_images: partner.images?.gallery,
    short_description: partner.description?.short,
    long_description: partner.description?.long,
    location: partner.location?.address,
    latitude: partner.location?.coordinates?.latitude,
    longitude: partner.location?.coordinates?.longitude,
    area: partner.location?.area,
    // Store complex objects directly if DB column is JSONB
    contact: partner.contact as any, 
    social: partner.contact?.social as any, // Extract social if needed by schema
    // open_hours: partner.hours as any, // Removed as it's not in TablesUpdate<'partners'> 
    rating: partner.rating as any,
    accessibility: partner.accessibility as any,
    payment_options: partner.paymentOptions as any,
    faq: partner.faq as any,
    attributes: partner.attributes as any,
    
    // Map fields that might be structured differently
    price_range: partner.prices?.priceRange,
    currency: partner.prices?.currency,
    email: partner.contact?.email, // Extract from contact object
    website: partner.contact?.website, // Extract from contact object
    is_sponsored: partner.promotion?.isSponsored,
    is_featured: partner.promotion?.isFeatured,
    sponsor_end_date: partner.promotion?.promotionEndsAt ? new Date(partner.promotion.promotionEndsAt).toISOString() : null,

    // updated_at is usually handled by DB trigger/default
  };

  // Remove undefined fields before sending to Supabase
  Object.keys(dbData).forEach(key => {
    const typedKey = key as keyof typeof dbData;
    if (dbData[typedKey] === undefined) {
      delete dbData[typedKey];
    }
    // Convert null sponsor_end_date explicitly if needed by DB/query
    if (typedKey === 'sponsor_end_date' && dbData[typedKey] === null) {
      // Keep it null, Supabase should handle it
    }
  });

  delete dbData.id; // ID is used in .eq() for updates, not in payload
  // delete dbData.created_at; // Let DB handle creation timestamp

  return dbData;
}

/**
 * Maps a partner row from the Supabase database schema (Tables<'partners'>) to the PartnerType application model.
 */
export function mapDbToPartner(dbPartner: Tables<'partners'>): PartnerType {
  // Define default structures for nested objects in PartnerType
  const defaultImages = { main: '', gallery: [] };
  const defaultDescription = { short: '', long: '' };
  const defaultLocation = { address: '' };
  const defaultContact = {};
  const defaultHours = {};
  const defaultRating = { score: 0, reviewCount: 0 };
  const defaultPrices: { priceRange: PriceIndicator, currency?: string } = { priceRange: 'Varies' };
  const defaultPromotion = { isSponsored: false, isFeatured: false };
  const defaultAccessibility = {};
  const defaultPaymentOptions = {};
  const defaultFaq: Array<{ question: string; answer: string }> = [];
  const defaultAttributes = undefined;

  // Construct the PartnerType object by mapping DB columns
  const partner: Partial<PartnerType> = {
    id: dbPartner.id,
    name: dbPartner.name ?? 'Unnamed Partner',
    section: (dbPartner.section as PartnerSection) ?? PartnerSection.ESTABLISHMENT,
    mainCategory: (dbPartner.main_category as EstablishmentCategory | ServiceCategory) ?? EstablishmentCategory.ACCOMMODATION,
    subcategory: (dbPartner.subcategory as PartnerSubcategory) ?? PartnerSubcategory.OTHER,
    tags: dbPartner.tags ?? [],
    features: dbPartner.features ?? [],
    languages: dbPartner.languages ?? [],
    createdAt: dbPartner.created_at ?? new Date().toISOString(),
    updatedAt: dbPartner.updated_at ?? new Date().toISOString(),

    // Reconstruct nested PartnerType fields from DB columns
    images: {
      main: dbPartner.image ?? '',
      gallery: dbPartner.gallery_images ?? [],
    },
    description: {
      short: dbPartner.short_description ?? '',
      long: dbPartner.long_description ?? '',
    },
    location: {
      address: dbPartner.location ?? '',
      coordinates: dbPartner.latitude !== null && dbPartner.longitude !== null ? 
                   { latitude: Number(dbPartner.latitude), longitude: Number(dbPartner.longitude) } : undefined,
      area: dbPartner.area ?? undefined,
    },
    // Parse JSONB fields, providing defaults
    contact: parseJsonOrObject<PartnerType['contact']>(dbPartner.contact) ?? defaultContact,
    hours: parseJsonOrObject<PartnerType['hours']>(dbPartner.open_hours) ?? defaultHours,
    rating: parseJsonOrObject<PartnerType['rating']>(dbPartner.rating) ?? defaultRating,
    accessibility: parseJsonOrObject<PartnerType['accessibility']>(dbPartner.accessibility) ?? defaultAccessibility,
    paymentOptions: parseJsonOrObject<PartnerType['paymentOptions']>(dbPartner.payment_options) ?? defaultPaymentOptions,
    faq: parseJsonOrObject<PartnerType['faq']>(dbPartner.faq) ?? defaultFaq,
    attributes: parseJsonOrObject<PartnerType['attributes']>(dbPartner.attributes) ?? defaultAttributes,
    
    // Reconstruct prices object
    prices: {
      priceRange: (dbPartner.price_range as PriceIndicator) ?? 'Varies',
      currency: dbPartner.currency ?? undefined,
    },
    
    // Reconstruct promotion object
    promotion: {
        isSponsored: dbPartner.is_sponsored ?? false,
        isFeatured: dbPartner.is_featured ?? false,
        promotionEndsAt: dbPartner.sponsor_end_date ?? undefined,
        // discount could be added here if stored separately or in attributes
    },
    
    // Add potentially missing fields to contact object if they were flat in DB
    // (This assumes contact JSONB is the primary source if it exists)
    // contact: {
    //   ...(parseJsonOrObject<PartnerType['contact']>(dbPartner.contact) ?? defaultContact),
    //   email: dbPartner.email ?? (parseJsonOrObject<PartnerType['contact']>(dbPartner.contact) ?? defaultContact).email,
    //   website: dbPartner.website ?? (parseJsonOrObject<PartnerType['contact']>(dbPartner.contact) ?? defaultContact).website,
    //   social: parseJsonOrObject<PartnerType['contact']['social']>(dbPartner.social) ?? (parseJsonOrObject<PartnerType['contact']>(dbPartner.contact) ?? defaultContact).social,
    // },
  };
  
  // Enhance the contact object with potentially flat DB fields if not already present
  partner.contact = partner.contact || {}; // Ensure contact object exists
  if (!partner.contact.email && dbPartner.email) partner.contact.email = dbPartner.email;
  if (!partner.contact.website && dbPartner.website) partner.contact.website = dbPartner.website;
  if (!partner.contact.social) {
     const socialData = parseJsonOrObject<PartnerType['contact']['social']>(dbPartner.social);
     if (socialData) partner.contact.social = socialData;
  }
  

  // Final assertion: ensure the constructed object matches PartnerType
  // This requires confidence that all required fields are populated correctly.
  return partner as PartnerType;
}

// Remove the old mappers if they existed
// export function mapPartnerToDb_OLD(...) { ... }
// export function mapDbToPartner_OLD(...) { ... } 