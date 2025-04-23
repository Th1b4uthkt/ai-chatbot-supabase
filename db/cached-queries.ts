import 'server-only';

import { cache } from 'react';
import { unstable_cache, revalidateTag } from 'next/cache';

import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getChatByIdQuery,
  getChatsByUserIdQuery,
  getDocumentByIdQuery,
  getDocumentsByIdQuery,
  getMessagesByChatIdQuery,
  getVotesByChatIdQuery,
  getSuggestionsByDocumentIdQuery,
  getSessionQuery,
  getUserByIdQuery,
  getUserQuery,
  getUsersCountQuery,
  getChatWithMessagesQuery,
  getUserProfileQuery,
  isUserAdminQuery,
  getEventsQuery,
  getEventByIdQuery,
  createEventQuery,
  updateEventQuery,
  deleteEventQuery,
  getPartnersQuery,
  getPartnerByIdQuery,
  getPartnersByCategoryQuery,
  createPartnerQuery,
  updatePartnerQuery,
  deletePartnerQuery,
  getGuidesQuery,
  getGuideByIdQuery,
  createGuideQuery,
  updateGuideQuery,
  deleteGuideQuery
} from '@/db/queries';
import { TablesInsert, TablesUpdate } from '@/lib/supabase/types';
import { Guide } from '@/types/newGuide';

const getSupabase = cache(() => createServerSupabaseClient());

export const getSession = async () => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getSessionQuery(supabase);
    },
    ['session'],
    {
      tags: [`session`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getUsersCount = async () => {
  const supabase = await getSupabase();
  
  return unstable_cache(
    async () => {
      return getUsersCountQuery(supabase);
    },
    ['users_count'],
    {
      tags: ['users_count'],
      revalidate: 30, // Cache for 30 seconds
    }
  )();
};

export const getUserById = async (id: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getUserByIdQuery(supabase, id);
    },
    [`user_by_id`, id.slice(2, 12)],
    {
      tags: [`user_by_id_${id.slice(2, 12)}`],

      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getUser = async (email: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getUserQuery(supabase, email);
    },
    ['user', email],
    {
      tags: [`user_${email}`],
      revalidate: 3600, // Cache for 1 hour
    }
  )();
};

export const getChatById = async (chatId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getChatByIdQuery(supabase, { id: chatId });
    },
    ['chat', chatId],
    {
      tags: [`chat_${chatId}`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getChatsByUserId = async (userId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getChatsByUserIdQuery(supabase, { id: userId });
    },
    ['chats', userId],
    {
      tags: [`user_${userId}_chats`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getMessagesByChatId = async (chatId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getMessagesByChatIdQuery(supabase, { id: chatId });
    },
    ['messages', chatId],
    {
      tags: [`chat_${chatId}_messages`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getVotesByChatId = async (chatId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getVotesByChatIdQuery(supabase, { id: chatId });
    },
    ['votes', chatId],
    {
      tags: [`chat_${chatId}_votes`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getDocumentById = async (documentId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getDocumentByIdQuery(supabase, { id: documentId });
    },
    ['document', documentId],
    {
      tags: [`document_${documentId}`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getDocumentsById = async (documentId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getDocumentsByIdQuery(supabase, { id: documentId });
    },
    ['documents', documentId],
    {
      tags: [`document_${documentId}_versions`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getSuggestionsByDocumentId = async (documentId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getSuggestionsByDocumentIdQuery(supabase, {
        documentId: documentId,
      });
    },
    ['suggestions', documentId],
    {
      tags: [`document_${documentId}_suggestions`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getChatWithMessages = async (chatId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getChatWithMessagesQuery(supabase, { id: chatId });
    },
    ['chat_with_messages', chatId],
    {
      tags: [`chat_${chatId}`, `chat_${chatId}_messages`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getUserProfile = async (userId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getUserProfileQuery(supabase, userId);
    },
    ['user_profile', userId],
    {
      tags: [`user_profile_${userId}`],
      revalidate: 60, // Cache for 60 seconds
    }
  )();
};

export const isUserAdmin = async (userId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return isUserAdminQuery(supabase, userId);
    },
    ['user_admin', userId],
    {
      tags: [`user_admin_${userId}`],
      revalidate: 60, // Cache for 60 seconds
    }
  )();
};

export const getEvents = async () => {
  const client = await getSupabase();
  
  return unstable_cache(
    async () => {
      return getEventsQuery(client);
    },
    ['events_list'],
    {
      tags: ['events_list'],
      revalidate: 5 // Cache for 5 seconds
    }
  )();
};

export const getEventById = async (id: string) => {
  const client = await getSupabase();
  
  return unstable_cache(
    async () => {
      return getEventByIdQuery(client, id);
    },
    ['event', id],
    {
      tags: [`event_${id}`],
      revalidate: 5 // Cache for 5 seconds
    }
  )();
};

export const createEvent = async (eventData: TablesInsert<'events'>) => {
  const client = await getSupabase();
  return createEventQuery(client, eventData);
};

export const updateEvent = async (id: string, eventData: TablesUpdate<'events'>) => {
  const client = await getSupabase();
  return updateEventQuery(client, id, eventData);
};

export const deleteEvent = async (id: string) => {
  const client = await getSupabase();
  return deleteEventQuery(client, id);
};

export const getPartners = async () => {
  const client = await getSupabase();
  
  return unstable_cache(
    async () => {
      console.log('[Cache] Fetching all partners');
      // The query now returns Tables['partners']['Row'][]
      // We need a mapping function here or in the component to convert to PartnerType[]
      // For now, returning the DB rows.
      return getPartnersQuery(client);
    },
    ['partners_list'], // Cache key
    {
      tags: ['partners_list'], // Tag for revalidation
      revalidate: 60 // Revalidate every 60 seconds (adjust as needed)
    }
  )();
};

export const getPartnerById = async (id: string) => {
  const client = await getSupabase();
  
  // Validate ID format if necessary
  if (!id || typeof id !== 'string') {
    console.error("[Cache] Invalid partner ID requested:", id);
    return null;
  }

  return unstable_cache(
    async () => {
      console.log(`[Cache] Fetching partner by ID: ${id}`);
      // The query returns Tables['partners']['Row'] | null
      // Needs mapping to PartnerType | null later.
      return getPartnerByIdQuery(client, id);
    },
    ['partner', id], // Cache key includes the ID
    {
      tags: [`partner_${id}`], // Tag includes the ID
      revalidate: 60 // Revalidate every 60 seconds
    }
  )();
};

export const getPartnersByCategory = async (category: string) => {
  const client = await getSupabase();

  if (!category || typeof category !== 'string') {
    console.error("[Cache] Invalid category requested:", category);
    return [];
  }
  
  // Example implementation - might need refinement based on actual usage
  // Consider if caching this specific query is necessary or if filtering client-side is better
  return getPartnersByCategoryQuery(client, category); // Direct call for now, could be cached
};

export const createPartner = async (partnerData: TablesInsert<'partners'>) => {
  const client = await getSupabase();
  const result = await createPartnerQuery(client, partnerData);
  if (result) {
    // Revalidate caches that depend on the partners list
    revalidateTag('partners_list');
    console.log(`[Cache] Revalidated partners_list after create.`);
  }
  return result;
};

export const updatePartner = async (id: string, partnerData: TablesUpdate<'partners'>) => {
  const client = await getSupabase();
  const result = await updatePartnerQuery(client, id, partnerData);
  if (result) {
    // Revalidate caches for the list and the specific partner
    revalidateTag('partners_list');
    revalidateTag(`partner_${id}`);
    console.log(`[Cache] Revalidated partners_list and partner_${id} after update.`);
  }
  return result;
};

export const deletePartner = async (id: string) => {
  const client = await getSupabase();
  const success = await deletePartnerQuery(client, id);
  if (success) {
    // Revalidate caches for the list and potentially the specific partner (though it's gone)
    revalidateTag('partners_list');
    revalidateTag(`partner_${id}`); // Revalidate to remove it from cache if accessed directly
    console.log(`[Cache] Revalidated partners_list and partner_${id} after delete.`);
  }
  return success;
};

export const getGuides = async () => {
  const client = await getSupabase();
  
  return unstable_cache(
    async () => {
      console.log('[Cache] Fetching all guides');
      return getGuidesQuery(client);
    },
    ['guides_list'],
    {
      tags: ['guides_list'],
      revalidate: 60 // Cache for 60 seconds (adjust as needed)
    }
  )() as Promise<Guide[]>;
};

export const getGuideById = async (id: string) => {
  const client = await getSupabase();
  
  // Validate ID format if necessary
  if (!id || typeof id !== 'string') {
    console.error("[Cache] Invalid guide ID requested:", id);
    return null;
  }

  return unstable_cache(
    async () => {
      console.log(`[Cache] Fetching guide by ID: ${id}`);
      return getGuideByIdQuery(client, id);
    },
    ['guide', id],
    {
      tags: [`guide_${id}`],
      revalidate: 60 // Cache for 60 seconds
    }
  )() as Promise<Guide | null>;
};

export const createGuide = async (guideData: TablesInsert<'guides'>) => {
  const client = await getSupabase();
  const result = await createGuideQuery(client, guideData);
  if (result) {
    // Revalidate caches that depend on the guides list
    revalidateTag('guides_list');
    console.log(`[Cache] Revalidated guides_list after create.`);
  }
  return result;
};

export const updateGuide = async (id: string, guideData: TablesUpdate<'guides'>) => {
  const client = await getSupabase();
  const result = await updateGuideQuery(client, id, guideData);
  if (result) {
    // Revalidate caches for the list and the specific guide
    revalidateTag('guides_list');
    revalidateTag(`guide_${id}`);
    console.log(`[Cache] Revalidated guides_list and guide_${id} after update.`);
  }
  return result;
};

export const deleteGuide = async (id: string) => {
  const client = await getSupabase();
  const success = await deleteGuideQuery(client, id);
  if (success) {
    // Revalidate caches for the list and potentially the specific guide (though it's gone)
    revalidateTag('guides_list');
    revalidateTag(`guide_${id}`); // Revalidate to remove it from cache if accessed directly
    console.log(`[Cache] Revalidated guides_list and guide_${id} after delete.`);
  }
  return success;
};
