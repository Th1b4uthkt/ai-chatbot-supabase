import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { ActivityCategory, ServiceCategory } from '@/types/common';

/**
 * Tool to search for activities and services on Koh Phangan based on filters
 */
export const activitiesServicesTool = {
  description: 'Search for activities and services on Koh Phangan with various filters',
  parameters: z.object({
    type: z.enum(['activity', 'service', 'both']).describe('Type of items to search for: activity, service, or both'),
    category: z.string().optional().describe('Optional category filter (e.g., "food_drink" for activities or "accommodation" for services)'),
    area: z.string().optional().describe('Optional area/location filter (e.g., "Thong Sala", "Srithanu")'),
    search: z.string().optional().describe('Optional text to search in names and descriptions'),
    tags: z.array(z.string()).optional().describe('Optional tags to filter by'),
    priceRange: z.string().optional().describe('Optional price range filter (e.g., "budget", "mid-range", "luxury")'),
    featuredOnly: z.boolean().optional().describe('If true, return only featured items'),
    limit: z.number().optional().default(5).describe('Maximum number of results to return per type'),
  }),
  execute: async ({ 
    type, 
    category, 
    area, 
    search, 
    tags, 
    priceRange,
    featuredOnly,
    limit = 5
  }: { 
    type: 'activity' | 'service' | 'both';
    category?: string;
    area?: string;
    search?: string;
    tags?: string[];
    priceRange?: string;
    featuredOnly?: boolean;
    limit?: number;
  }) => {
    const supabase = await createClient();
    const results: {
      activities?: any[];
      services?: any[];
      count: number;
    } = {
      count: 0
    };
    
    // Helper function to build the query with common filters
    const buildQuery = (table: 'base_items', itemType: 'activity' | 'service') => {
      let query = supabase
        .from(table)
        .select(`
          id, name, type, short_description, long_description, main_image,
          gallery_images, address, coordinates, area, contact_info, hours,
          open_24h, rating, tags, price_range, currency, features, languages,
          updated_at, is_sponsored, is_featured, payment_methods, accessibility
        `)
        .eq('type', itemType)
        .limit(limit);
      
      // Apply common filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%,long_description.ilike.%${search}%`);
      }
      
      if (area) {
        query = query.ilike('area', `%${area}%`);
      }
      
      if (priceRange) {
        query = query.eq('price_range', priceRange);
      }
      
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }
      
      if (tags && tags.length > 0) {
        // Handle array containment with any of the tags
        const tagConditions = tags.map(tag => `tags.cs.{${tag}}`).join(',');
        query = query.or(tagConditions);
      }
      
      return query;
    };
    
    try {
      // Fetch activities if requested
      if (type === 'activity' || type === 'both') {
        // Get base items for activities
        let activitiesQuery = buildQuery('base_items', 'activity');
        
        const { data: activitiesBaseData, error: activitiesBaseError } = await activitiesQuery;
        
        if (activitiesBaseError) throw activitiesBaseError;
        
        if (activitiesBaseData && activitiesBaseData.length > 0) {
          // Get activity-specific details
          const activityIds = activitiesBaseData.map(item => item.id);
          let activityDetailsQuery = supabase
            .from('activities')
            .select('id, category, subcategory, activity_data')
            .in('id', activityIds);
          
          // Apply category filter if provided
          if (category) {
            activityDetailsQuery = activityDetailsQuery.eq('category', category);
          }
          
          const { data: activityDetails, error: activityDetailsError } = await activityDetailsQuery;
          
          if (activityDetailsError) throw activityDetailsError;
          
          if (activityDetails) {
            // Create a map for faster lookups
            const activityDetailsMap = new Map();
            activityDetails.forEach(detail => {
              activityDetailsMap.set(detail.id, detail);
            });
            
            // Combine data from both tables
            const combinedActivities = activitiesBaseData
              .filter(baseItem => activityDetailsMap.has(baseItem.id))
              .map(baseItem => {
                const details = activityDetailsMap.get(baseItem.id);
                // Format the data for consistent response
                return {
                  id: baseItem.id,
                  name: baseItem.name,
                  type: baseItem.type,
                  category: details.category,
                  subcategory: details.subcategory,
                  mainImage: baseItem.main_image,
                  shortDescription: baseItem.short_description,
                  longDescription: baseItem.long_description,
                  address: baseItem.address,
                  area: baseItem.area,
                  coordinates: baseItem.coordinates,
                  rating: baseItem.rating,
                  tags: baseItem.tags || [],
                  priceRange: baseItem.price_range,
                  isFeatured: baseItem.is_featured,
                  isSponsored: baseItem.is_sponsored,
                  hours: baseItem.hours,
                  activityData: details.activity_data
                };
              });
            
            results.activities = combinedActivities;
            results.count += combinedActivities.length;
          }
        } else {
          results.activities = [];
        }
      }
      
      // Fetch services if requested
      if (type === 'service' || type === 'both') {
        // Get base items for services
        let servicesQuery = buildQuery('base_items', 'service');
        
        const { data: servicesBaseData, error: servicesBaseError } = await servicesQuery;
        
        if (servicesBaseError) throw servicesBaseError;
        
        if (servicesBaseData && servicesBaseData.length > 0) {
          // Get service-specific details
          const serviceIds = servicesBaseData.map(item => item.id);
          let serviceDetailsQuery = supabase
            .from('services')
            .select('id, category, subcategory, service_data')
            .in('id', serviceIds);
          
          // Apply category filter if provided
          if (category) {
            serviceDetailsQuery = serviceDetailsQuery.eq('category', category);
          }
          
          const { data: serviceDetails, error: serviceDetailsError } = await serviceDetailsQuery;
          
          if (serviceDetailsError) throw serviceDetailsError;
          
          if (serviceDetails) {
            // Create a map for faster lookups
            const serviceDetailsMap = new Map();
            serviceDetails.forEach(detail => {
              serviceDetailsMap.set(detail.id, detail);
            });
            
            // Combine data from both tables
            const combinedServices = servicesBaseData
              .filter(baseItem => serviceDetailsMap.has(baseItem.id))
              .map(baseItem => {
                const details = serviceDetailsMap.get(baseItem.id);
                // Format the data for consistent response
                return {
                  id: baseItem.id,
                  name: baseItem.name,
                  type: baseItem.type,
                  category: details.category,
                  subcategory: details.subcategory,
                  mainImage: baseItem.main_image,
                  shortDescription: baseItem.short_description,
                  longDescription: baseItem.long_description,
                  address: baseItem.address,
                  area: baseItem.area,
                  coordinates: baseItem.coordinates,
                  rating: baseItem.rating,
                  tags: baseItem.tags || [],
                  priceRange: baseItem.price_range,
                  isFeatured: baseItem.is_featured,
                  isSponsored: baseItem.is_sponsored,
                  hours: baseItem.hours,
                  serviceData: details.service_data
                };
              });
            
            results.services = combinedServices;
            results.count += combinedServices.length;
          }
        } else {
          results.services = [];
        }
      }
      
      // Return the combined results
      return {
        ...results,
        searchParams: {
          type,
          category: category || 'all',
          area: area || 'all island',
          search: search || '',
          tags: tags || [],
          priceRange: priceRange || 'any'
        }
      };
      
    } catch (error) {
      console.error('Error searching activities and services:', error);
      return { error: 'Failed to search activities and services', count: 0 };
    }
  },
}; 