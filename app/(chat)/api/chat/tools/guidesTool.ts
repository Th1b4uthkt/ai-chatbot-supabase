import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { Guide, GuideCategory } from '@/types/newGuide'; // Correct import path

/**
 * Tool to search for guides based on various filters.
 */
export const guidesTool = {
  description: 'Search for guides on various topics (Culture, Health, Mobility, Real Estate, Wellness) based on filters like title, category, location area, or tags.',
  parameters: z.object({
    title: z.string().optional().describe('Keywords from the title or description of the guide to search for'),
    category: z.nativeEnum(GuideCategory).optional().describe('Specific category of the guide (e.g., CULTURE, MOBILITY)'),
    location: z.string().optional().describe('General location area relevant to the guide (e.g., North, South)'), // Searching based on location.area
    tags: z.array(z.string()).optional().describe('Specific keywords or tags associated with the guide (e.g., visa, yoga, beach)'),
    limit: z.number().int().positive().optional().default(5).describe('Maximum number of guides to return (default: 5)'),
  }),
  execute: async ({
    title,
    category,
    location,
    tags,
    limit = 5
  }: {
    title?: string;
    category?: GuideCategory;
    location?: string;
    tags?: string[];
    limit?: number;
  }): Promise<{ guides: Guide[]; count: number } | { error: string }> => {
    try {
      const supabase = await createClient();
      // Select specific fields based on Guide interface, handle nested JSON if needed
      let query = supabase.from('guides').select(`
        id, name, section, subcategory, images, description, location, contact, hours, rating, tags, prices, features, languages, createdAt, updatedAt, promotion,
        category, lastUpdatedAt, isFeatured, slug, sections, relatedContacts, practicalInfo
      `, { count: 'exact' });

      console.log('DB-QUERY: Searching guides with filters:', { title, category, location, tags, limit });

      // Apply filters
      if (title) {
        // Search in title (name from BasePartner) and potentially description
        query = query.or(`name.ilike.%${title}%,description->>short.ilike.%${title}%,description->>long.ilike.%${title}%`);
        console.log('DB-QUERY: Filtering by title/description:', title);
      }

      if (category) {
        query = query.eq('category', category); // Filter by the specific GuideCategory enum value
        console.log('DB-QUERY: Filtering by category:', category);
      }

      if (location) {
        // Search within the location->>area field specifically
        query = query.ilike('location->>area', `%${location}%`);
        console.log('DB-QUERY: Filtering by location area:', location);
      }

      if (tags && tags.length > 0) {
        // Filter guides that contain ALL of the provided tags (case-insensitive)
        const lowerCaseTags = tags.map(tag => tag.toLowerCase());
        query = query.filter('tags', 'cs', `{${lowerCaseTags.join(',')}}`); // Use 'cs' (contains) operator
        console.log('DB-QUERY: Filtering by tags (contains):', tags);
      }

      // Apply limit
      query = query.limit(limit);

      // Sort by featured status first, then by last update date
      query = query.order('isFeatured', { ascending: false, nullsFirst: false }).order('lastUpdatedAt', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('DB-QUERY: Error fetching guides:', error);
        return { error: `Database error: ${error.message}` };
      }

      console.log(`DB-QUERY: Found ${data?.length ?? 0} guides (Total matches: ${count ?? 0})`);

      // Cast data to Guide[]. Basic validation, ensure nested objects are handled if needed.
      const fetchedGuides: Guide[] = (data || []).map(guide => ({
        ...guide,
        // Ensure fields are correctly typed or provide defaults
        tags: guide.tags || [],
        features: guide.features || [],
        sections: guide.sections || [],
        relatedContacts: guide.relatedContacts || [],
        practicalInfo: guide.practicalInfo || {},
        images: guide.images || { main: '' }, // Ensure images object exists
        description: guide.description || { short: '', long: '' },
        location: guide.location || { address: '' },
        contact: guide.contact || {},
        hours: guide.hours || {},
        rating: guide.rating || {},
        prices: guide.prices || { priceRange: 'Varies' },
        promotion: guide.promotion || { isSponsored: false },
      })) as Guide[];

      return {
        guides: fetchedGuides,
        count: count ?? 0,
      };

    } catch (err: any) {
      console.error('DB-QUERY: Unexpected error in guidesTool:', err);
      return { error: `An unexpected error occurred: ${err.message || err}` };
    }
  },
}; 