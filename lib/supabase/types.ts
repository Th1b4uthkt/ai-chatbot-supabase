import { SupabaseClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          capacity: number | null
          category: string
          created_at: string
          day: number
          description: string
          duration: string | null
          facilities: Json | null
          id: string
          image: string
          is_sponsored: boolean | null
          latitude: number
          location: string
          longitude: number
          organizer_contact_email: string | null
          organizer_contact_phone: string | null
          organizer_image: string | null
          organizer_name: string | null
          organizer_website: string | null
          price: string
          rating: number
          recurrence_custom_pattern: string | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          reviews: number
          sponsor_end_date: string | null
          tags: string[] | null
          tickets: Json | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number | null
          capacity?: number | null
          category: string
          created_at?: string
          day: number
          description: string
          duration?: string | null
          facilities?: Json | null
          id?: string
          image: string
          is_sponsored?: boolean | null
          latitude: number
          location: string
          longitude: number
          organizer_contact_email?: string | null
          organizer_contact_phone?: string | null
          organizer_image?: string | null
          organizer_name?: string | null
          organizer_website?: string | null
          price: string
          rating: number
          recurrence_custom_pattern?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reviews: number
          sponsor_end_date?: string | null
          tags?: string[] | null
          tickets?: Json | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number | null
          capacity?: number | null
          category?: string
          created_at?: string
          day?: number
          description?: string
          duration?: string | null
          facilities?: Json | null
          id?: string
          image?: string
          is_sponsored?: boolean | null
          latitude?: number
          location?: string
          longitude?: number
          organizer_contact_email?: string | null
          organizer_contact_phone?: string | null
          organizer_image?: string | null
          organizer_name?: string | null
          organizer_website?: string | null
          price?: string
          rating?: number
          recurrence_custom_pattern?: string | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reviews?: number
          sponsor_end_date?: string | null
          tags?: string[] | null
          tickets?: Json | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          bucket_id: string
          chat_id: string
          content_type: string
          created_at: string
          filename: string
          id: string
          original_name: string
          size: number
          storage_path: string
          url: string
          user_id: string
          version: number
        }
        Insert: {
          bucket_id?: string
          chat_id: string
          content_type: string
          created_at?: string
          filename: string
          id?: string
          original_name: string
          size: number
          storage_path: string
          url: string
          user_id: string
          version?: number
        }
        Update: {
          bucket_id?: string
          chat_id?: string
          content_type?: string
          created_at?: string
          filename?: string
          id?: string
          original_name?: string
          size?: number
          storage_path?: string
          url?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          accessibility: Json | null
          area: string | null
          attributes: Json | null
          category: string
          contact: Json | null
          created_at: string | null
          currency: string | null
          description: string | null
          faq: Json | null
          features: string[] | null
          gallery_images: string[] | null
          hours: Json | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          languages: string[] | null
          last_updated: string | null
          latitude: number | null
          location: string | null
          long_description: string | null
          longitude: number | null
          name: string
          payment_options: Json | null
          practical_info: Json | null
          price_range: string | null
          rating: Json | null
          related_contacts: Json | null
          section: string
          sections: Json | null
          slug: string | null
          sponsor_end_date: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          accessibility?: Json | null
          area?: string | null
          attributes?: Json | null
          category: string
          contact?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          faq?: Json | null
          features?: string[] | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          languages?: string[] | null
          last_updated?: string | null
          latitude?: number | null
          location?: string | null
          long_description?: string | null
          longitude?: number | null
          name: string
          payment_options?: Json | null
          practical_info?: Json | null
          price_range?: string | null
          rating?: Json | null
          related_contacts?: Json | null
          section: string
          sections?: Json | null
          slug?: string | null
          sponsor_end_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          accessibility?: Json | null
          area?: string | null
          attributes?: Json | null
          category?: string
          contact?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          faq?: Json | null
          features?: string[] | null
          gallery_images?: string[] | null
          hours?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          languages?: string[] | null
          last_updated?: string | null
          latitude?: number | null
          location?: string | null
          long_description?: string | null
          longitude?: number | null
          name?: string
          payment_options?: Json | null
          practical_info?: Json | null
          price_range?: string | null
          rating?: Json | null
          related_contacts?: Json | null
          section?: string
          sections?: Json | null
          slug?: string | null
          sponsor_end_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: Json
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          chat_id: string
          content: Json
          created_at?: string
          id?: string
          role: string
          updated_at?: string
        }
        Update: {
          chat_id?: string
          content?: Json
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          accessibility: Json | null
          area: string | null
          attributes: Json | null
          contact: Json | null
          created_at: string | null
          currency: string | null
          email: string | null
          faq: Json | null
          features: string[] | null
          gallery_images: string[] | null
          id: string
          image: string | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          languages: string[] | null
          latitude: number | null
          location: string | null
          long_description: string | null
          longitude: number | null
          main_category: string
          name: string
          open_hours: Json | null
          payment_options: Json | null
          price_range: string | null
          rating: Json | null
          ref_id: string | null
          section: string
          short_description: string | null
          social: Json | null
          sponsor_end_date: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accessibility?: Json | null
          area?: string | null
          attributes?: Json | null
          contact?: Json | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          faq?: Json | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          location?: string | null
          long_description?: string | null
          longitude?: number | null
          main_category: string
          name: string
          open_hours?: Json | null
          payment_options?: Json | null
          price_range?: string | null
          rating?: Json | null
          ref_id?: string | null
          section: string
          short_description?: string | null
          social?: Json | null
          sponsor_end_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accessibility?: Json | null
          area?: string | null
          attributes?: Json | null
          contact?: Json | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          faq?: Json | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          location?: string | null
          long_description?: string | null
          longitude?: number | null
          name?: string
          payment_options?: Json | null
          practical_info?: Json | null
          price_range?: string | null
          rating?: Json | null
          ref_id?: string | null
          section?: string
          short_description?: string | null
          social?: Json | null
          sponsor_end_date?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          events_attended: number | null
          favorite_places: string[] | null
          id: string
          interests: string[] | null
          is_admin: boolean
          join_date: string | null
          location: string | null
          name: string | null
          notifications: Json | null
          payment_methods: Json | null
          preferences: Json | null
          privacy_settings: Json | null
          social_links: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          events_attended?: number | null
          favorite_places?: string[] | null
          id: string
          interests?: string[] | null
          is_admin?: boolean
          join_date?: string | null
          location?: string | null
          name?: string | null
          notifications?: Json | null
          payment_methods?: Json | null
          preferences?: Json | null
          privacy_settings?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          events_attended?: number | null
          favorite_places?: string[] | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean
          join_date?: string | null
          location?: string | null
          name?: string | null
          notifications?: Json | null
          payment_methods?: Json | null
          preferences?: Json | null
          privacy_settings?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          created_at: string
          description: string | null
          document_created_at: string
          document_id: string
          id: string
          is_resolved: boolean
          original_text: string
          suggested_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_created_at: string
          document_id: string
          id?: string
          is_resolved?: boolean
          original_text: string
          suggested_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_created_at?: string
          document_id?: string
          id?: string
          is_resolved?: boolean
          original_text?: string
          suggested_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_document_id_document_created_at_fkey"
            columns: ["document_id", "document_created_at"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "created_at"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          chat_id: string
          is_upvoted: boolean
          message_id: string
        }
        Insert: {
          chat_id: string
          is_upvoted: boolean
          message_id: string
        }
        Update: {
          chat_id?: string
          is_upvoted?: boolean
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: { query_text: string }
        Returns: Json
      }
      get_document_latest_version: {
        Args: { doc_id: string }
        Returns: string
      }
      get_latest_document: {
        Args: { doc_id: string; auth_user_id: string }
        Returns: {
          id: string
          user_id: string
          title: string
          content: string
          created_at: string
        }[]
      }
      get_next_file_version: {
        Args: { p_bucket_id: string; p_storage_path: string }
        Returns: number
      }
      get_total_users_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Add Partner type from database schema
export type Partner = Database['public']['Tables']['partners']['Row'];