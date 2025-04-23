import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
// import { PartnerType, PartnerCategory } from '@/types/partner/partner'; // Use the correct singular file - Removed PartnerCategory as it's not used directly and caused lint error
import { PartnerType, PartnerSubcategory } from '@/types/partner/partner'; // Import PartnerSubcategory if needed, or adjust type usage

/**
 * Tool to get partners based on filters
 */
export const partnersTool = {
  description: 'Get partners (businesses, services, etc.) based on filters like name, category, subcategory, location, or tags/features offered.',
  parameters: z.object({
    name: z.string().optional().describe('Name of the partner or business to search for (partial match allowed)'),
    // category: z.string().optional().describe('Main category of the partner (e.g., establishment, service)'), // Might need refinement based on search intention
    subcategory: z.nativeEnum(PartnerSubcategory).optional().describe('Specific subcategory of the partner (e.g., restaurant, spa, scooter_rental)'),
    location: z.string().optional().describe('General location, address, area, or neighborhood to search within'),
    tags: z.array(z.string()).optional().describe('Specific services, features, keywords, or tags to filter by (e.g., vegan, delivery, swimming pool, wifi)'),
    limit: z.number().int().positive().optional().default(10).describe('Maximum number of partners to return (default: 10)'),
  }),
  execute: async ({
    name,
    // category,
    subcategory,
    location,
    tags,
    limit = 10
  }: {
    name?: string;
    // category?: string;
    subcategory?: PartnerSubcategory;
    location?: string;
    tags?: string[];
    limit?: number;
  }): Promise<{ partners: PartnerType[]; count: number } | { error: string }> => {
    try {
      const supabase = await createClient();
      // Select all columns, ensure nested JSONs are fetched correctly. Count total matches.
      let query = supabase.from('partners').select('*, location:location->address, description:description->short', { count: 'exact' }); // Adjust select if needed, accessing nested fields directly can be complex in select

      console.log('DB-QUERY: Searching partners with filters:', { name, subcategory, location, tags, limit });

      // Apply filters
      if (name) {
        // Case-insensitive search on partner name
        query = query.ilike('name', `%${name}%`);
        console.log('DB-QUERY: Filtering by name:', name);
      }

      // if (category) {
      //   // Filter by main category if provided
      //   query = query.eq('mainCategory', category); // Assuming 'mainCategory' column exists
      //   console.log('DB-QUERY: Filtering by mainCategory:', category);
      // }

      if (subcategory) {
        // Filter by specific subcategory
        query = query.eq('subcategory', subcategory); // Assuming 'subcategory' column exists
        console.log('DB-QUERY: Filtering by subcategory:', subcategory);
      }


      if (location) {
        // Search within location fields (address, area). Using text search on JSONB.
        // This might require a more specific index/query depending on performance needs.
        // Searching text representation of location JSON or specific fields like address/area.
        // Using OR to search in different parts of the location object.
        query = query.or(`location->>address.ilike.%${location}%,location->>area.ilike.%${location}%`);
        console.log('DB-QUERY: Filtering by location text:', location);
      }

      if (tags && tags.length > 0) {
        // Filter partners that contain ALL of the provided tags (case-insensitive search on 'tags' array)
        // Use '@>' operator for array containment. Ensure tags in DB are consistently cased or handle case-insensitivity.
        // For case-insensitivity, consider lowercasing tags before querying or using DB functions if available.
        const lowerCaseTags = tags.map(tag => tag.toLowerCase()); // Example: lowercase tags
        query = query.filter('tags', 'cs', `{${lowerCaseTags.join(',')}}`); // 'cs' contains -- use '@>' for exact array elements contains
        // Alternative using @> operator (requires tags to be exact match, case sensitive by default):
        // query = query.filter('tags', '@>', `{${tags.join(',')}}`);
        console.log('DB-QUERY: Filtering by tags (contains):', tags);
      }

      // Apply limit
      query = query.limit(limit);

      // Sort by featured status first, then maybe by name or rating
      // Accessing nested boolean requires specific syntax ->>'isFeatured' cast to boolean might be needed depending on DB/client version
      // query = query.order('promotion->isFeatured', { ascending: false, nullsFirst: false }).order('name');
      // Simplified sorting for now, complex nested sorting might need raw SQL or views
      query = query.order('name');


      // Log the constructed query (optional, for debugging)
      // console.log('DB-QUERY: SQL Query:', query.toString()); // Supabase client might not expose toString directly

      const { data, error, count } = await query;

      if (error) {
        console.error('DB-QUERY: Error fetching partners:', error);
        return { error: `Database error: ${error.message}` };
      }

      // Ensure data is typed correctly - Supabase client generally handles this.
      // Manual validation/mapping might be needed if types diverge significantly.
      const fetchedPartners: PartnerType[] = data || [];

      console.log(`DB-QUERY: Found ${fetchedPartners.length} partners matching criteria (Total matches: ${count ?? 0})`);

      return {
        partners: fetchedPartners,
        count: count ?? 0,
      };

    } catch (err: any) {
      console.error('DB-QUERY: Unexpected error in partnersTool:', err);
      return { error: `An unexpected error occurred: ${err.message || err}` };
    }
  },
}; 