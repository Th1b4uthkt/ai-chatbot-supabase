import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { PartnerType, PartnerCategory } from '@/types/partner'; // Use the correct singular file

/**
 * Tool to get partners based on filters
 */
export const partnersTool = {
  description: 'Get partners (businesses, services, etc.) based on filters like name, category, location, or tags/services offered.',
  parameters: z.object({
    name: z.string().optional().describe('Name of the partner or business to search for'),
    category: z.string().optional().describe('Category of the partner (e.g., restaurant, location-scooter, spa)'),
    location: z.string().optional().describe('General location, address, or area to search within'),
    tags: z.array(z.string()).optional().describe('Specific services, features, or tags to filter by (e.g., vegan, delivery, swimming pool)'),
    limit: z.number().int().positive().optional().default(10).describe('Maximum number of partners to return'),
  }),
  execute: async ({
    name,
    category,
    location,
    tags,
    limit = 10
  }: {
    name?: string;
    category?: string; // Keep as string for flexibility, could validate against PartnerCategory later
    location?: string;
    tags?: string[];
    limit?: number;
  }): Promise<{ partners: PartnerType[]; count: number } | { error: string }> => {
    try {
      const supabase = await createClient();
      let query = supabase.from('partners').select('*', { count: 'exact' });

      console.log('DB-QUERY: Searching partners with filters:', { name, category, location, tags, limit });

      // Apply filters
      if (name) {
        query = query.ilike('name', `%${name}%`);
        console.log('DB-QUERY: Filtering by name:', name);
      }

      if (category) {
        query = query.ilike('category', `%${category}%`);
        console.log('DB-QUERY: Filtering by category:', category);
      }

      if (location) {
        // Search in both 'location' and potentially address fields if they exist
        query = query.ilike('location', `%${location}%`);
        console.log('DB-QUERY: Filtering by location:', location);
      }

      if (tags && tags.length > 0) {
        // Filter partners that contain ANY of the provided tags (case-insensitive search on 'tags' array)
        // Ensure tags are lowercase for consistent matching if your DB stores them that way
        // Using `cs` (contains) for array type column
        const tagConditions = tags.map((tag: string) => `tags::text[] @> ARRAY['${tag}']::text[]`).join(' OR ');
        query = query.or(tagConditions);
        // Alternatively, for text search within a tags string field:
        // query = query.or(tags.map((tag: string) => `tags.ilike.%${tag}%`).join(','));
        console.log('DB-QUERY: Filtering by tags:', tags);
      }

      // Apply limit
      query = query.limit(limit);

      // Sort by featured status first, then maybe by name or rating
      query = query.order('is_featured', { ascending: false }).order('name');

      // Log the constructed query (optional, for debugging)
      // console.log('DB-QUERY: SQL Query:', query.toString()); // Supabase client might not expose toString directly

      const { data, error, count } = await query;

      if (error) {
        console.error('DB-QUERY: Error fetching partners:', error);
        return { error: `Database error: ${error.message}` };
      }

      console.log(`DB-QUERY: Found ${data?.length ?? 0} partners (Total matches: ${count ?? 0})`);

      // Ensure data conforms to PartnerType structure if necessary
      // Supabase should handle this based on table structure, but explicit mapping can be safer
      const formattedPartners: PartnerType[] = data || [];

      return {
        partners: formattedPartners,
        count: count ?? 0,
      };

    } catch (err: any) {
      console.error('DB-QUERY: Unexpected error in partnersTool:', err);
      return { error: `An unexpected error occurred: ${err.message || err}` };
    }
  },
}; 