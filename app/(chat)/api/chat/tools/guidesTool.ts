import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { GuideType, GuideCategory } from '@/types/guide'; // Import from the correct file

/**
 * Tool to search for guides based on various filters.
 */
export const guidesTool = {
  description: 'Search for guides on various topics (visa, transport, beaches, activities, etc.) based on filters like title, category, location, or tags.',
  parameters: z.object({
    title: z.string().optional().describe('Keywords from the title of the guide to search for'),
    // Consider z.nativeEnum(GuideCategory) if GuideCategory is an enum, otherwise string
    category: z.string().optional().describe('Specific category of the guide (e.g., visa-immigration, plages-spots, transports-locaux)'),
    location: z.string().optional().describe('General location or area relevant to the guide'),
    tags: z.array(z.string()).optional().describe('Specific keywords or tags associated with the guide'),
    limit: z.number().int().positive().optional().default(5).describe('Maximum number of guides to return'),
  }),
  execute: async ({
    title,
    category,
    location,
    tags,
    limit = 5
  }: {
    title?: string;
    category?: string; // Keep as string for flexibility
    location?: string;
    tags?: string[];
    limit?: number;
  }): Promise<{ guides: GuideType[]; count: number } | { error: string }> => {
    try {
      const supabase = await createClient();
      // Assuming your Supabase table for guides is named 'guides'
      let query = supabase.from('guides').select('*', { count: 'exact' });

      console.log('DB-QUERY: Searching guides with filters:', { title, category, location, tags, limit });

      // Apply filters
      if (title) {
        query = query.ilike('title', `%${title}%`);
        // Could also search in shortDescription or longDescription if needed
        // query = query.or(`title.ilike.%${title}%,shortDescription.ilike.%${title}%`);
        console.log('DB-QUERY: Filtering by title:', title);
      }

      if (category) {
        // Use `eq` for exact match on category enum/string
        query = query.eq('category', category);
        console.log('DB-QUERY: Filtering by category:', category);
      }

      if (location) {
        // Search in the specific 'location' field if it exists and is relevant
        query = query.ilike('location', `%${location}%`);
        console.log('DB-QUERY: Filtering by location:', location);
      }

      if (tags && tags.length > 0) {
        // Filter guides that contain ANY of the provided tags in the 'tags' array field
        // Use `cs` (contains) or `@>` (contains) depending on Supabase version and setup
        query = query.overlaps('tags', tags); // `overlaps` checks if arrays have common elements
        // Alternatively, use contains: query = query.contains('tags', tags);
        console.log('DB-QUERY: Filtering by tags:', tags);
      }

      // Apply limit
      query = query.limit(limit);

      // Sort by featured status first, then maybe by update date or title
      query = query.order('isFeatured', { ascending: false }).order('lastUpdatedAt', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('DB-QUERY: Error fetching guides:', error);
        return { error: `Database error: ${error.message}` };
      }

      console.log(`DB-QUERY: Found ${data?.length ?? 0} guides (Total matches: ${count ?? 0})`);

      // Ensure data conforms to GuideType structure.
      // Supabase data might need mapping if column names differ from type properties.
      const formattedGuides: GuideType[] = (data || []).map(guide => ({
        ...guide,
        // Ensure necessary fields are present, potentially provide defaults or map columns
        tags: guide.tags || [],
        sections: guide.sections || [], // Assuming sections are fetched correctly
      })) as GuideType[];

      return {
        guides: formattedGuides,
        count: count ?? 0,
      };

    } catch (err: any) {
      console.error('DB-QUERY: Unexpected error in guidesTool:', err);
      return { error: `An unexpected error occurred: ${err.message || err}` };
    }
  },
}; 