import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

/**
 * Tool to get upcoming events on Koh Phangan based on filters
 */
export const eventsTool = {
  description: 'Get upcoming events on Koh Phangan based on filters',
  parameters: z.object({
    timeFrame: z.enum(['today', 'tomorrow', 'this week', 'this weekend', 'next week', 'this month']).describe('Time period to search for events'),
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
    timeFrame: 'today' | 'tomorrow' | 'this week' | 'this weekend' | 'next week' | 'this month'; 
    date?: string;
    category?: string;
    tags?: string[];
    location?: string;
  }) => {
    const supabase = await createClient();
    
    // Get current date info
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    console.log('DB-QUERY: Current day of week:', currentDay);
    
    // On commence avec deux requêtes - une pour les événements spécifiques et une pour les récurrents
    let querySpecific = supabase.from('events').select('*');
    let queryRecurring = supabase.from('events').select('*');
    
    // Pour les événements récurrents, filtrer ceux qui ont un modèle de récurrence
    queryRecurring = queryRecurring
      .or('recurrence_pattern.neq.null,recurrence_pattern.neq.once');
    
    // Variables pour suivre les plages de dates et jours de la semaine
    let daysToInclude: number[] = [];
    let dateRange = { start: '', end: '' };
    let specificDate = '';
    
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
          
          dayOfWeek = targetDate.getDay();
          daysToInclude = [dayOfWeek];
          specificDate = dateStr;
          
          // IMPORTANT: Filtrer par le VRAI jour de l'événement, pas seulement le jour de la semaine
          // On cherche les événements dont la date commence par YYYY-MM-DD
          if (dateStr) {
            querySpecific = querySpecific.filter('time', 'ilike', `${dateStr}%`);
            console.log('DB-QUERY: Filtering specific events by date string:', dateStr);
            
            // Pour les événements récurrents, on filtre par le jour de la semaine
            queryRecurring = queryRecurring.eq('day', dayOfWeek);
            console.log('DB-QUERY: Filtering recurring events by day of week:', dayOfWeek);
          } 
          // Si on n'a pas pu déterminer une date précise mais qu'on a un jour de semaine
          else if (dayOfWeek >= 0) {
            querySpecific = querySpecific.eq('day', dayOfWeek);
            queryRecurring = queryRecurring.eq('day', dayOfWeek);
            console.log('DB-QUERY: Filtering by day of week for both queries:', dayOfWeek);
          }
          
          // Combiner les résultats et retourner
          return combineAndFormatEvents(querySpecific, queryRecurring, data => ({
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
          querySpecific = querySpecific.filter('time', 'ilike', `${today}%`);
          
          // Pour les événements récurrents, on filtre par le jour de la semaine actuel
          queryRecurring = queryRecurring.eq('day', currentDay);
          
          daysToInclude = [currentDay];
          specificDate = today;
          
          console.log('DB-QUERY: Filtering by today:', today, 'day of week:', currentDay);
          break;
        }
        case 'tomorrow': {
          const tomorrow = new Date(now);
          tomorrow.setDate(now.getDate() + 1);
          const tomorrowDay = tomorrow.getDay();
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          
          querySpecific = querySpecific.filter('time', 'ilike', `${tomorrowStr}%`);
          queryRecurring = queryRecurring.eq('day', tomorrowDay);
          
          daysToInclude = [tomorrowDay];
          specificDate = tomorrowStr;
          
          console.log('DB-QUERY: Filtering by tomorrow:', tomorrowStr, 'day of week:', tomorrowDay);
          break;
        }
        case 'this week': {
          // This week = Monday-Sunday of the current week
          // Calculate the start of the current week (Monday)
          const startOfWeek = new Date(now);
          const daysSinceMonday = (now.getDay() + 6) % 7; // Convert day of week to days since Monday (0 = Monday)
          startOfWeek.setDate(now.getDate() - daysSinceMonday);
          
          // Calculate the end of the current week (Sunday)
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
          const endOfWeekStr = endOfWeek.toISOString().split('T')[0];
          
          // Include events from today until end of the week
          const todayStr = now.toISOString().split('T')[0];
          
          querySpecific = querySpecific.filter('time', 'gte', `${todayStr}`).filter('time', 'lt', `${endOfWeekStr}T23:59:59`);
          
          // Pour les événements récurrents, on inclut tous les jours restants de la semaine
          // Calculer les jours restants de la semaine (de aujourd'hui à dimanche)
          daysToInclude = [];
          for (let i = currentDay; i <= 6; i++) {
            daysToInclude.push(i);
          }
          
          // Si on est pas encore dimanche
          if (daysToInclude.length > 0) {
            queryRecurring = queryRecurring.in('day', daysToInclude);
          }
          
          dateRange = { start: todayStr, end: endOfWeekStr };
          
          console.log('DB-QUERY: Filtering specific events by this week (from today):', todayStr, 'to', endOfWeekStr);
          console.log('DB-QUERY: Filtering recurring events by days:', daysToInclude.join(', '));
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
          
          querySpecific = querySpecific.or(`time.ilike.${saturdayStr}%,time.ilike.${sundayStr}%`);
          queryRecurring = queryRecurring.in('day', [6, 0]); // Samedi (6) et Dimanche (0)
          
          daysToInclude = [6, 0]; // Samedi et Dimanche
          dateRange = { start: saturdayStr, end: sundayStr };
          
          console.log('DB-QUERY: Filtering by weekend:', saturdayStr, sundayStr);
          break;
        }
        case 'next week': {
          // Next week = Monday-Sunday of the next week
          const nextMonday = new Date(now);
          const daysSinceMonday = (now.getDay() + 6) % 7; // Convert day of week to days since Monday (0 = Monday)
          nextMonday.setDate(now.getDate() - daysSinceMonday + 7); // Add 7 days to get to next Monday
          
          const nextSunday = new Date(nextMonday);
          nextSunday.setDate(nextMonday.getDate() + 6); // Add 6 days to get to next Sunday
          
          const nextMondayStr = nextMonday.toISOString().split('T')[0];
          const nextSundayStr = nextSunday.toISOString().split('T')[0];
          
          querySpecific = querySpecific.filter('time', 'gte', `${nextMondayStr}`).filter('time', 'lt', `${nextSundayStr}T23:59:59`);
          
          // Pour les événements récurrents, on inclut tous les jours de la semaine prochaine
          queryRecurring = queryRecurring.in('day', [1, 2, 3, 4, 5, 6, 0]); // Tous les jours de la semaine
          
          daysToInclude = [1, 2, 3, 4, 5, 6, 0]; // Tous les jours
          dateRange = { start: nextMondayStr, end: nextSundayStr };
          
          console.log('DB-QUERY: Filtering by next week:', nextMondayStr, 'to', nextSundayStr);
          break;
        }
        case 'this month': {
          // Ce mois-ci = du 1er au dernier jour du mois en cours
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          
          const firstDayStr = firstDay.toISOString().split('T')[0];
          const lastDayStr = lastDay.toISOString().split('T')[0];
          
          querySpecific = querySpecific.filter('time', 'gte', `${firstDayStr}`).filter('time', 'lt', `${lastDayStr}T23:59:59`);
          
          // Pour les événements récurrents, on inclut tous les jours
          queryRecurring = queryRecurring.in('day', [1, 2, 3, 4, 5, 6, 0]); // Tous les jours de la semaine
          
          daysToInclude = [1, 2, 3, 4, 5, 6, 0]; // Tous les jours
          dateRange = { start: firstDayStr, end: lastDayStr };
          
          console.log('DB-QUERY: Filtering by this month:', firstDayStr, 'to', lastDayStr);
          break;
        }
      }
    }
    
    // Apply optional filters to both queries
    if (category) {
      querySpecific = querySpecific.ilike('category', `%${category}%`);
      queryRecurring = queryRecurring.ilike('category', `%${category}%`);
    }
    
    if (tags && tags.length > 0) {
      // Filter events that contain ANY of the provided tags
      const tagFilter = tags.map((tag: string) => `tags.cs.{${tag}}`).join(',');
      querySpecific = querySpecific.or(tagFilter);
      queryRecurring = queryRecurring.or(tagFilter);
    }
    
    if (location) {
      querySpecific = querySpecific.ilike('location', `%${location}%`);
      queryRecurring = queryRecurring.ilike('location', `%${location}%`);
    }
    
    // Sort by day and time
    querySpecific = querySpecific.order('day').order('time');
    queryRecurring = queryRecurring.order('day').order('time');
    
    // Lire la requête SQL pour le debug
    console.log('DB-QUERY: SQL Query Specific:', querySpecific.toString());
    console.log('DB-QUERY: SQL Query Recurring:', queryRecurring.toString());
    
    // Combine des résultats et retourner
    return combineAndFormatEvents(querySpecific, queryRecurring, data => ({
      events: data,
      count: data.length,
      timeFrame,
      // Add time range details for better context
      timeRangeDetails: getTimeRangeDetails(timeFrame, now)
    }));
  },
};

// Helper function to combine and format events from specific and recurring queries
async function combineAndFormatEvents<T>(
  querySpecific: any,
  queryRecurring: any,
  formatter: (events: any[]) => T
): Promise<T | { error: string }> {
  try {
    // Exécuter les deux requêtes
    const [specificResult, recurringResult] = await Promise.all([
      querySpecific,
      queryRecurring
    ]);
    
    if (specificResult.error) {
      console.error('DB-QUERY: Error fetching specific events:', specificResult.error);
      return { error: specificResult.error.message };
    }
    
    if (recurringResult.error) {
      console.error('DB-QUERY: Error fetching recurring events:', recurringResult.error);
      return { error: recurringResult.error.message };
    }
    
    // Combiner et dédupliquer les résultats
    const specificEvents = specificResult.data || [];
    const recurringEvents = recurringResult.data || [];
    
    console.log(`DB-QUERY: Found ${specificEvents.length} specific events and ${recurringEvents.length} recurring events`);
    
    // Utiliser un Map pour dédupliquer par ID
    const eventMap = new Map();
    
    // Ajouter d'abord les événements spécifiques
    specificEvents.forEach((event: any) => {
      eventMap.set(event.id, event);
    });
    
    // Ajouter ensuite les événements récurrents s'ils n'existent pas déjà
    recurringEvents.forEach((event: any) => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });
    
    // Convertir le Map en tableau
    const combinedEvents = Array.from(eventMap.values());
    
    // Trier par jour et heure
    combinedEvents.sort((a, b) => {
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      return a.time.localeCompare(b.time);
    });
    
    console.log(`DB-QUERY: Combined total of ${combinedEvents.length} events after deduplication`);
    
    // Add popular venues information when no events are found
    if (combinedEvents.length === 0) {
      const popularVenues = [
        "Lighthouse", "Chill Up", "Echo Beach", "Eden Garden", 
        "Loi Lay", "Jungle Experience", "Half Moon Festival", "Rhythm & Sands"
      ];
      
      // Get random popular venues to mention (2-3)
      const venuesToMention = [];
      const numVenues = Math.floor(Math.random() * 2) + 2; // 2-3 venues
      const shuffled = [...popularVenues].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numVenues && i < shuffled.length; i++) {
        venuesToMention.push(shuffled[i]);
      }
      
      // Add to the formatted result
      const formattedResult = formatter(combinedEvents);
      if (formattedResult && typeof formattedResult === 'object' && !('error' in formattedResult)) {
        return {
          ...formattedResult,
          popularVenues: venuesToMention,
          suggestions: [
            "Check back closer to the date for updated event listings",
            "Contact venues directly for the most current information",
            "Look for impromptu events or gatherings that may not be listed"
          ]
        };
      }
    }
    
    // Format les événements combinés
    const formattedEvents = combinedEvents.map((event: any) => ({
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
      coordinates: {
        latitude: event.latitude || 0,
        longitude: event.longitude || 0
      },
      day: event.day,
      // Include optional fields if they exist
      organizer: {
        name: event.organizer_name || '',
        image: event.organizer_image,
        contactEmail: event.organizer_contact_email,
        contactPhone: event.organizer_contact_phone,
        website: event.organizer_website
      },
      duration: event.duration,
      recurrence: {
        pattern: event.recurrence_pattern || 'once',
        customPattern: event.recurrence_custom_pattern,
        endDate: event.recurrence_end_date
      },
      capacity: event.capacity,
      attendeeCount: event.attendee_count,
      facilities: event.facilities,
      tickets: event.tickets
    }));
    
    // Use the provided formatter to format the response
    return formatter(formattedEvents);
  } catch (error) {
    console.error('DB-QUERY: Error combining and formatting events:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to get time range details for better context in responses
function getTimeRangeDetails(timeFrame: string, now: Date): string {
  switch(timeFrame) {
    case 'today':
      return now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    case 'tomorrow': {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    case 'this week': {
      const startOfWeek = new Date(now);
      const daysSinceMonday = (now.getDay() + 6) % 7;
      startOfWeek.setDate(now.getDate() - daysSinceMonday);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const todayStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      const endOfWeekStr = endOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      
      return `from ${todayStr} to ${endOfWeekStr}`;
    }
    case 'this weekend': {
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - now.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      
      const saturdayStr = saturday.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      const sundayStr = sunday.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      
      return `${saturdayStr} and ${sundayStr}`;
    }
    case 'next week': {
      const nextMonday = new Date(now);
      const daysSinceMonday = (now.getDay() + 6) % 7;
      nextMonday.setDate(now.getDate() - daysSinceMonday + 7);
      
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      
      const nextMondayStr = nextMonday.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      const nextSundayStr = nextSunday.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      
      return `from ${nextMondayStr} to ${nextSundayStr}`;
    }
    case 'this month': {
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    default:
      return '';
  }
} 