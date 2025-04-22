import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

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
} from '@/db/queries';
import { TablesInsert, TablesUpdate } from '@/lib/supabase/types';

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
      return getPartnersQuery(client);
    },
    ['partners_list'],
    {
      tags: ['partners_list'],
      revalidate: 5 // Cache for 5 seconds
    }
  )();
};

export const getPartnerById = async (id: string) => {
  const client = await getSupabase();
  
  return unstable_cache(
    async () => {
      return getPartnerByIdQuery(client, id);
    },
    ['partner', id],
    {
      tags: [`partner_${id}`],
      revalidate: 5 // Cache for 5 seconds
    }
  )();
};

export const getPartnersByCategory = async (category: string) => {
  const client = await getSupabase();
  return getPartnersByCategoryQuery(client, category);
};

export const createPartner = async (partnerData: TablesInsert<'partners'>) => {
  const client = await getSupabase();
  return createPartnerQuery(client, partnerData);
};

export const updatePartner = async (id: string, partnerData: TablesUpdate<'partners'>) => {
  const client = await getSupabase();
  return updatePartnerQuery(client, id, partnerData);
};

export const deletePartner = async (id: string) => {
  const client = await getSupabase();
  return deletePartnerQuery(client, id);
};

export const getGuides = async () => {
  const client = await getSupabase();
  return getGuidesQuery(client);
};

export const getGuideById = async (id: string) => {
  const client = await getSupabase();
  return getGuideByIdQuery(client, id);
};
