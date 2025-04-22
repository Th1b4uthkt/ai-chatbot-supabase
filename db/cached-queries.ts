import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { createClient } from '@/lib/supabase/client';
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

const getSupabase = cache(() => createClient());

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
  const client = await createClient();
  return getEventsQuery(client);
};

export const getEventById = async (id: string) => {
  const client = await createClient();
  return getEventByIdQuery(client, id);
};

export const createEvent = async (eventData: TablesInsert<'events'>) => {
  const client = await createClient();
  return createEventQuery(client, eventData);
};

export const updateEvent = async (id: string, eventData: TablesUpdate<'events'>) => {
  const client = await createClient();
  return updateEventQuery(client, id, eventData);
};

export const deleteEvent = async (id: string) => {
  const client = await createClient();
  return deleteEventQuery(client, id);
};

export const getPartners = async () => {
  const client = await createClient();
  return getPartnersQuery(client);
};

export const getPartnerById = async (id: string) => {
  const client = await createClient();
  return getPartnerByIdQuery(client, id);
};

export const getPartnersByCategory = async (category: string) => {
  const client = await createClient();
  return getPartnersByCategoryQuery(client, category);
};

export const createPartner = async (partnerData: TablesInsert<'partners'>) => {
  const client = await createClient();
  return createPartnerQuery(client, partnerData);
};

export const updatePartner = async (id: string, partnerData: TablesUpdate<'partners'>) => {
  const client = await createClient();
  return updatePartnerQuery(client, id, partnerData);
};

export const deletePartner = async (id: string) => {
  const client = await createClient();
  return deletePartnerQuery(client, id);
};

export const getGuides = async () => {
  const client = await createClient();
  return getGuidesQuery(client);
};

export const getGuideById = async (id: string) => {
  const client = await createClient();
  return getGuideByIdQuery(client, id);
};
