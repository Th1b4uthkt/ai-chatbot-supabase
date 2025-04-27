import { SupabaseClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          name: string | null;
          bio: string | null;
          avatar: string | null;
          join_date: string | null;
          location: string | null;
          events_attended: number | null;
          favorite_places: string[] | null;
          interests: string[] | null;
          social_links: Json | null;
          notifications: Json | null;
          privacy_settings: Json | null;
          preferences: Json | null;
          payment_methods: Json | null;
          created_at: string | null;
          updated_at: string | null;
          email: string | null;
          is_admin: boolean;
          saved_events: string[] | null;
          favorite_partners: string[] | null;
          saved_guides: string[] | null;
          achievements: Json | null;
          membership_tier: string | null;
          verification_status: Json | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          name?: string | null;
          bio?: string | null;
          avatar?: string | null;
          join_date?: string | null;
          location?: string | null;
          events_attended?: number | null;
          favorite_places?: string[] | null;
          interests?: string[] | null;
          social_links?: Json | null;
          notifications?: Json | null;
          privacy_settings?: Json | null;
          preferences?: Json | null;
          payment_methods?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          email?: string | null;
          is_admin?: boolean;
          saved_events?: string[] | null;
          favorite_partners?: string[] | null;
          saved_guides?: string[] | null;
          achievements?: Json | null;
          membership_tier?: string | null;
          verification_status?: Json | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          name?: string | null;
          bio?: string | null;
          avatar?: string | null;
          join_date?: string | null;
          location?: string | null;
          events_attended?: number | null;
          favorite_places?: string[] | null;
          interests?: string[] | null;
          social_links?: Json | null;
          notifications?: Json | null;
          privacy_settings?: Json | null;
          preferences?: Json | null;
          payment_methods?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          email?: string | null;
          is_admin?: boolean;
          saved_events?: string[] | null;
          favorite_partners?: string[] | null;
          saved_guides?: string[] | null;
          achievements?: Json | null;
          membership_tier?: string | null;
          verification_status?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          title: string;
          category: string;
          image: string;
          time: string;
          location: string;
          rating: number;
          reviews: number;
          price: string;
          description: string;
          latitude: number;
          longitude: number;
          day: number;
          organizer_name: string | null;
          organizer_image: string | null;
          organizer_contact_email: string | null;
          organizer_contact_phone: string | null;
          organizer_website: string | null;
          duration: string | null;
          recurrence_pattern: string | null;
          recurrence_custom_pattern: string | null;
          recurrence_end_date: string | null;
          facilities: Json | null;
          tickets: Json | null;
          tags: string[] | null;
          capacity: number | null;
          attendee_count: number | null;
          created_at: string;
          updated_at: string;
          is_sponsored: boolean | null;
          sponsor_end_date: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          image: string;
          time: string;
          location: string;
          rating: number;
          reviews: number;
          price: string;
          description: string;
          latitude: number;
          longitude: number;
          day: number;
          organizer_name?: string | null;
          organizer_image?: string | null;
          organizer_contact_email?: string | null;
          organizer_contact_phone?: string | null;
          organizer_website?: string | null;
          duration?: string | null;
          recurrence_pattern?: string | null;
          recurrence_custom_pattern?: string | null;
          recurrence_end_date?: string | null;
          facilities?: Json | null;
          tickets?: Json | null;
          tags?: string[] | null;
          capacity?: number | null;
          attendee_count?: number | null;
          created_at?: string;
          updated_at?: string;
          is_sponsored?: boolean | null;
          sponsor_end_date?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          image?: string;
          time?: string;
          location?: string;
          rating?: number;
          reviews?: number;
          price?: string;
          description?: string;
          latitude?: number;
          longitude?: number;
          day?: number;
          organizer_name?: string | null;
          organizer_image?: string | null;
          organizer_contact_email?: string | null;
          organizer_contact_phone?: string | null;
          organizer_website?: string | null;
          duration?: string | null;
          recurrence_pattern?: string | null;
          recurrence_custom_pattern?: string | null;
          recurrence_end_date?: string | null;
          facilities?: Json | null;
          tickets?: Json | null;
          tags?: string[] | null;
          capacity?: number | null;
          attendee_count?: number | null;
          created_at?: string;
          updated_at?: string;
          is_sponsored?: boolean | null;
          sponsor_end_date?: string | null;
        };
        Relationships: [];
      };
      chats: {
        Row: {
          created_at: string;
          id: string;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chats_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      documents: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          title: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      file_uploads: {
        Row: {
          bucket_id: string;
          chat_id: string;
          content_type: string;
          created_at: string;
          filename: string;
          id: string;
          original_name: string;
          size: number;
          storage_path: string;
          url: string;
          user_id: string;
          version: number;
        };
        Insert: {
          bucket_id?: string;
          chat_id: string;
          content_type: string;
          created_at?: string;
          filename: string;
          id?: string;
          original_name: string;
          size: number;
          storage_path: string;
          url: string;
          user_id: string;
          version?: number;
        };
        Update: {
          bucket_id?: string;
          chat_id?: string;
          content_type?: string;
          created_at?: string;
          filename?: string;
          id?: string;
          original_name?: string;
          size?: number;
          storage_path?: string;
          url?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'file_uploads_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          chat_id: string;
          content: Json;
          created_at: string;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          chat_id: string;
          content: Json;
          created_at?: string;
          id?: string;
          role: string;
          updated_at?: string;
        };
        Update: {
          chat_id?: string;
          content?: Json;
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
        ];
      };
      suggestions: {
        Row: {
          created_at: string;
          description: string | null;
          document_created_at: string;
          document_id: string;
          id: string;
          is_resolved: boolean;
          original_text: string;
          suggested_text: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          document_created_at: string;
          document_id: string;
          id?: string;
          is_resolved?: boolean;
          original_text: string;
          suggested_text: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          document_created_at?: string;
          document_id?: string;
          id?: string;
          is_resolved?: boolean;
          original_text?: string;
          suggested_text?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'suggestions_document_id_document_created_at_fkey';
            columns: ['document_id', 'document_created_at'];
            isOneToOne: false;
            referencedRelation: 'documents';
            referencedColumns: ['id', 'created_at'];
          },
          {
            foreignKeyName: 'suggestions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          chat_id: string;
          is_upvoted: boolean;
          message_id: string;
        };
        Insert: {
          chat_id: string;
          is_upvoted: boolean;
          message_id: string;
        };
        Update: {
          chat_id?: string;
          is_upvoted?: boolean;
          message_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_document_latest_version: {
        Args: {
          doc_id: string;
        };
        Returns: string;
      };
      get_latest_document: {
        Args: {
          doc_id: string;
          auth_user_id: string;
        };
        Returns: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
        }[];
      };
      get_next_file_version: {
        Args: {
          p_bucket_id: string;
          p_storage_path: string;
        };
        Returns: number;
      };
      gtrgm_compress: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: {
          '': unknown;
        };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      set_limit: {
        Args: {
          '': number;
        };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: {
          '': string;
        };
        Returns: string[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  auth: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Client = SupabaseClient<Database>;

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Add types for tool invocations and annotations
export interface ToolInvocation {
  state: 'call' | 'result';
  toolCallId: string;
  toolName: string;
  args?: any;
  result?: any;
}

export interface MessageAnnotation {
  messageIdFromServer?: string;
}

// Update Message interface to match AI library format
export interface Message {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string | Record<string, unknown>;
  created_at: string;
  toolInvocations?: ToolInvocation[];
  annotations?: MessageAnnotation[];
}

export interface PostgrestError {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}

export function handleDatabaseError(error: PostgrestError | null) {
  if (!error) return null;

  console.error('Database error:', error);

  switch (error.code) {
    case '23505': // Unique violation
      if (error.message.includes('messages_pkey')) {
        throw new Error('Message ID already exists');
      }
      if (error.message.includes('chats_pkey')) {
        throw new Error('Chat ID already exists');
      }
      throw new Error('Unique constraint violation');
    case '23503': // Foreign key violation
      throw new Error('Referenced record does not exist');
    case '42501': // RLS violation
      throw new Error('Unauthorized access');
    case 'PGRST116': // Not found
      return null;
    case 'PGRST204': // Column not found
      throw new Error('Invalid column name');
    default:
      throw error;
  }
}

// Add Document type
export type Document = Database['public']['Tables']['documents']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type Chat = Database['public']['Tables']['chats']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Suggestion = Database['public']['Tables']['suggestions']['Row'];

// Add DatabaseMessage type to match the database schema
export interface DatabaseMessage {
  id: string;
  chat_id: string;
  role: string;
  content: string; // Always stored as string in database
  created_at: string;
}

// Helper function to convert between formats
export function convertToDBMessage(message: Message): DatabaseMessage {
  let content = message.content;

  // Convert content to string if it's an object
  if (typeof content === 'object') {
    const messageData: any = { content };

    // Add tool invocations if present
    if (message.toolInvocations?.length) {
      messageData.toolInvocations = message.toolInvocations;
    }

    // Add annotations if present
    if (message.annotations?.length) {
      messageData.annotations = message.annotations;
    }

    content = JSON.stringify(messageData);
  }

  return {
    id: message.id,
    chat_id: message.chat_id,
    role: message.role,
    content: content as string,
    created_at: message.created_at,
  };
}

// Helper function to parse database message
export function parseDBMessage(dbMessage: DatabaseMessage): Message {
  try {
    const content = JSON.parse(dbMessage.content);

    // Check if content is a message data object
    if (content && typeof content === 'object' && 'content' in content) {
      return {
        ...dbMessage,
        content: content.content,
        toolInvocations: content.toolInvocations,
        annotations: content.annotations,
        role: dbMessage.role as MessageRole,
      };
    }

    // If not a special format, return as is
    return {
      ...dbMessage,
      content: dbMessage.content,
      role: dbMessage.role as MessageRole,
    };
  } catch {
    // If not valid JSON, return as plain text
    return {
      ...dbMessage,
      content: dbMessage.content,
      role: dbMessage.role as MessageRole,
    };
  }
}

// Add these types to your existing types file

export interface FileUpload {
  id: string;
  created_at: string;
  chat_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
}

export interface StorageError {
  message: string;
  statusCode: string;
}
