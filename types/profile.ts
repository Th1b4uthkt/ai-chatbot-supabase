import { Database } from '@/lib/supabase/types';

// Base profile type from the database
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Social links type
export interface SocialLinks {
  lineId: string;
  twitter: string;
  facebook: string;
  instagram: string;
}

// Notification preferences
export interface NotificationPreferences {
  events: boolean;
  updates: boolean;
  messages: boolean;
  partnersDeals: boolean;
}

// Privacy settings
export interface PrivacySettings {
  showLocation: boolean;
  showInterests: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  showAttendedEvents: boolean;
}

// Accessibility preferences
export interface AccessibilityPreferences {
  wheelchair: boolean;
  petFriendly: boolean;
  familyFriendly: boolean;
}

// User preferences
export interface UserPreferences {
  priceRanges: string[];
  accessibility: AccessibilityPreferences;
  eventCategories: string[];
  guideCategories: string[];
  partnerCategories: string[];
}

// Payment methods
export interface PaymentMethods {
  cards: {
    type: string;
    lastFour: string;
    expiryDate: string;
  }[];
  mobilePay: boolean;
  cryptocurrencies: boolean;
}

// Enhanced Profile type with typed JSON fields
export interface EnhancedProfile extends Omit<Profile, 'social_links' | 'notifications' | 'privacy_settings' | 'preferences' | 'payment_methods'> {
  social_links: SocialLinks;
  notifications: NotificationPreferences;
  privacy_settings: PrivacySettings;
  preferences: UserPreferences;
  payment_methods: PaymentMethods;
} 