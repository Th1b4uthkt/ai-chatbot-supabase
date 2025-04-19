import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

/**
 * Tool to get upcoming events on Koh Phangan based on filters
 */
export const eventsTool = {
  description: 'Get upcoming events on Koh Phangan based on filters',
  parameters: z.object({
    timeFrame: z.enum(['today', 'tomorrow', 'this weekend', 'next week', 'this month']).describe('Time period to search for events'),
    date: z.string().optional().describe('Specific date in format DD or "19 April" to filter events'),
    category: z.string().optional().describe('Optional category filter'),
    tags: z.array(z.string()).optional().describe('Optional tags to filter by'),
    location: z.string().optional().describe('Optional location filter'),
  }),
  execute: async ({ 
    timeFrame, 
    date, 
    category, 
    tags, 
    location 
  }: { 
    timeFrame: 'today' | 'tomorrow' | 'this weekend' | 'next week' | 'this month'; 
    date?: string;
    category?: string;
    tags?: string[];
    location?: string;
  }) => {
    const supabase = await createClient();
    
    // Get current date info
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    let query = supabase.from('events').select('*');
    
    // Essayer de gérer une date spécifique si elle est fournie
    if (date) {
      console.log('DB-QUERY: Specific date requested:', date);
      
      try {
        // Convertir la date en objet Date
        let targetDate;
        let dayOfWeek = -1; // Jour de la semaine (0-6)
        let dateStr = '';
        
        // Si une date comme "19 April" est fournie
        if (date.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i)) {
          // Extraire le jour et le mois
          const dayMatch = date.match(/\b(\d{1,2})\b/);
          const monthMatch = date.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
          
          if (dayMatch && monthMatch) {
            const day = parseInt(dayMatch[1], 10);
            const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                              'july', 'august', 'september', 'october', 'november', 'december'];
            const month = monthNames.findIndex(m => m.toLowerCase() === monthMatch[1].toLowerCase());
            
            if (month !== -1) {
              const year = new Date().getFullYear();
              targetDate = new Date(year, month, day);
              dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
          }
        } 
        // Si jour de la semaine fourni (ex: "samedi")
        else if (date.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)) {
          const dayNameMatch = date.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
          if (dayNameMatch) {
            const dayName = dayNameMatch[1].toLowerCase();
            const dayMap: { [key: string]: number } = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            dayOfWeek = dayMap[dayName];
          
            // Trouver la prochaine occurrence de ce jour
            const daysToAdd = (7 + dayOfWeek - now.getDay()) % 7;
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() + daysToAdd);
            
            // Si un jour du mois est aussi mentionné, ajuster le mois si nécessaire
            const dayMatch = date.match(/\b(\d{1,2})\b/);
            if (dayMatch) {
              const dayOfMonth = parseInt(dayMatch[1], 10);
              targetDate.setDate(dayOfMonth);
              // Si cette date est déjà passée ce mois-ci, aller au mois suivant
              if (targetDate < now) {
                targetDate.setMonth(targetDate.getMonth() + 1);
              }
            }
            
            dateStr = targetDate.toISOString().split('T')[0];
          }
        }
        // Si seulement un nombre comme "19" est fourni
        else if (date.match(/\b\d{1,2}\b/)) {
          const dayMatch = date.match(/\b(\d{1,2})\b/);
          if (dayMatch) {
            const day = parseInt(dayMatch[0], 10);
            const year = now.getFullYear();
            const month = now.getMonth();
            
            // Créer une date pour ce jour dans le mois en cours
            targetDate = new Date(year, month, day);
            
            // Si cette date est déjà passée ce mois-ci, aller au mois suivant
            if (targetDate < now) {
              targetDate.setMonth(month + 1);
            }
            
            dateStr = targetDate.toISOString().split('T')[0];
          }
        }
        
        if (targetDate && !isNaN(targetDate.getTime())) {
          console.log('DB-QUERY: Resolved to date:', targetDate.toDateString());
          console.log('DB-QUERY: Day of week:', targetDate.getDay());
          
          // Mettre à jour le timeFrame pour l'affichage
          const customTimeFrame = `on ${targetDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}`;
          
          // IMPORTANT: Filtrer par le VRAI jour de l'événement, pas seulement le jour de la semaine
          // On cherche les événements dont la date commence par YYYY-MM-DD
          if (dateStr) {
            query = query.filter('time', 'ilike', `${dateStr}%`);
            console.log('DB-QUERY: Filtering by date string:', dateStr);
          } 
          // Si on n'a pas pu déterminer une date précise mais qu'on a un jour de semaine
          else if (dayOfWeek >= 0) {
            query = query.eq('day', dayOfWeek);
            console.log('DB-QUERY: Filtering by day of week:', dayOfWeek);
          }
          
          // Store the custom timeFrame for the response
          return getFormattedEvents(query, data => ({
            events: data,
            count: data.length,
            timeFrame: customTimeFrame
          }));
        } else {
          console.log('DB-QUERY: Could not parse date:', date);
        }
      } catch (error) {
        console.error('DB-QUERY: Error parsing date:', error);
      }
    } else {
      // Apply standard time frame filter
      console.log('DB-QUERY: Using standard timeFrame filter:', timeFrame);
      
      switch(timeFrame) {
        case 'today': {
          const today = now.toISOString().split('T')[0];
          query = query.filter('time', 'ilike', `${today}%`);
          console.log('DB-QUERY: Filtering by today:', today);
          break;
        }
        case 'tomorrow': {
          const tomorrow = new Date(now);
          tomorrow.setDate(now.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          query = query.filter('time', 'ilike', `${tomorrowStr}%`);
          console.log('DB-QUERY: Filtering by tomorrow:', tomorrowStr);
          break;
        }
        case 'this weekend': {
          // Weekend = Saturday and Sunday of this week
          const saturday = new Date(now);
          saturday.setDate(now.getDate() + (6 - now.getDay()));
          const sunday = new Date(saturday);
          sunday.setDate(saturday.getDate() + 1);
          
          const saturdayStr = saturday.toISOString().split('T')[0];
          const sundayStr = sunday.toISOString().split('T')[0];
          
          query = query.or(`time.ilike.${saturdayStr}%,time.ilike.${sundayStr}%`);
          console.log('DB-QUERY: Filtering by weekend:', saturdayStr, sundayStr);
          break;
        }
        case 'next week': {
          // Next week = du lundi au dimanche de la semaine prochaine
          const nextMonday = new Date(now);
          nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
          const nextSunday = new Date(nextMonday);
          nextSunday.setDate(nextMonday.getDate() + 6);
          
          const nextMondayStr = nextMonday.toISOString().split('T')[0];
          const nextSundayStr = nextSunday.toISOString().split('T')[0];
          
          query = query.filter('time', 'gte', `${nextMondayStr}`).filter('time', 'lt', `${nextSundayStr}T23:59:59`);
          console.log('DB-QUERY: Filtering by next week:', nextMondayStr, 'to', nextSundayStr);
          break;
        }
        case 'this month': {
          // Ce mois-ci = du 1er au dernier jour du mois en cours
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          
          const firstDayStr = firstDay.toISOString().split('T')[0];
          const lastDayStr = lastDay.toISOString().split('T')[0];
          
          query = query.filter('time', 'gte', `${firstDayStr}`).filter('time', 'lt', `${lastDayStr}T23:59:59`);
          console.log('DB-QUERY: Filtering by this month:', firstDayStr, 'to', lastDayStr);
          break;
        }
      }
    }
    
    // Apply optional filters
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    
    if (tags && tags.length > 0) {
      // Filter events that contain ANY of the provided tags
      query = query.or(tags.map((tag: string) => `tags.cs.{${tag}}`).join(','));
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    // Sort by day and time
    query = query.order('day').order('time');
    
    // Lire la requête SQL pour le debug
    console.log('DB-QUERY: SQL Query:', query.toString());
    
    return getFormattedEvents(query, data => ({
      events: data,
      count: data.length,
      timeFrame
    }));
  },
};

// Helper function to get formatted events
async function getFormattedEvents<T>(
  query: any, 
  formatter: (events: any[]) => T
): Promise<T | { error: string }> {
  const { data, error } = await query;
  
  if (error) {
    console.error('DB-QUERY: Error fetching events:', error);
    return { error: error.message };
  }
  
  console.log(`DB-QUERY: Found ${data.length} events`);
  
  // Format the results for better display
  const formattedEvents = data.map((event: any) => ({
    id: event.id,
    title: event.title,
    category: event.category,
    time: event.time,
    location: event.location,
    price: event.price,
    description: event.description,
    image: event.image,
    rating: event.rating,
    reviews: event.reviews,
    tags: event.tags || [],
    coordinates: event.coordinates,
    day: event.day,
    // Include optional fields if they exist
    organizer: event.organizer,
    duration: event.duration,
    recurrence: {
      pattern: event.recurrence_pattern,
      customPattern: event.recurrence_custom_pattern,
      endDate: event.recurrence_end_date
    },
    capacity: event.capacity,
    attendeeCount: event.attendeeCount,
    facilities: event.facilities,
    tickets: event.tickets
  }));
  
  // Use the provided formatter to format the response
  return formatter(formattedEvents);
} 