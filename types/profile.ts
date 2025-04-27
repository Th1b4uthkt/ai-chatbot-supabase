/**
 * User Profile Types
 * 
 * This file defines the profile-related types for the Phangan Pirate application.
 * The profile structure is designed to prioritize user experience while meeting
 * business requirements for data collection and personalization.
 */

// Core user identity information
export interface ProfileIdentity {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  joinDate: string;
  location: string;
}

// User preferences for personalization
export interface ProfilePreferences {
  interests: string[];
  favoritePlaces: string[];
  categories: {
    events: string[];
    guides: string[];
    partners: string[];
  };
  priceRanges: string[];
  language: string;
  accessibility: {
    wheelchair: boolean;
    familyFriendly: boolean;
    petFriendly: boolean;
  };
}

// Social connections and public profile elements
export interface ProfileSocial {
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    lineId?: string;
  };
  eventsAttended: number;
  followers?: number;
  following?: number;
}

// Privacy and security settings
export interface ProfilePrivacy {
  showLocation: boolean;
  showInterests: boolean;
  showAttendedEvents: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
}

// App-specific notification preferences
export interface ProfileNotifications {
  events: boolean;
  messages: boolean;
  updates: boolean;
  partnersDeals: boolean;
  pushEnabled?: boolean;
  emailDigest?: 'daily' | 'weekly' | 'monthly' | 'never';
}

// User content collections and activity
export interface ProfileContent {
  interests: string[];
  favoritePlaces: string[];
  eventsAttended: number;
  savedEvents: string[];
  favoritePartners: string[];
  savedGuides: string[];
  achievements?: AchievementItem[];
}

// Payment and transaction information
export interface ProfilePayment {
  paymentMethods: {
    cards: PaymentCard[];
    mobilePay: boolean;
    cryptocurrencies: boolean;
  };
  membershipTier?: 'standard' | 'premium' | 'vip';
  subscriptionDetails?: {
    plan: string;
    renewalDate?: string;
    autoRenew: boolean;
  };
}

// Verification status for trust and security
export interface ProfileVerification {
  email: boolean;
  phone: boolean;
  identity: boolean;
  lastVerifiedDate?: string;
}

// Activity feed item
export interface ActivityItem {
  id: string;
  type: 'event_attend' | 'guide_save' | 'partner_visit' | 'review' | 'comment';
  timestamp: string;
  entityId: string;
  details?: string;
}

// Review item
export interface ReviewItem {
  id: string;
  entityType: 'event' | 'guide' | 'partner';
  entityId: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

// Achievement item
export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateUnlocked?: string; // Optional for in-progress achievements
  progress?: number; // Percentage progress for partially completed achievements
}

// Payment card information
export interface PaymentCard {
  id: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  expiryDate?: string;
}

// Combined profile type for complete user profile
export interface ProfileType {
  // Core identity (always required)
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  joinDate: string;
  location: string;
  
  // Preferences and personalization
  interests: string[];
  favoritePlaces: string[];
  preferences: {
    eventCategories: string[];
    guideCategories: string[];
    partnerCategories: string[];
    priceRanges: string[];
    accessibility: {
      wheelchair: boolean;
      familyFriendly: boolean;
      petFriendly: boolean;
    };
  };
  language?: string;
  
  // Social elements
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    lineId?: string;
  };
  eventsAttended: number;
  
  // Privacy settings
  privacySettings: {
    showLocation: boolean;
    showInterests: boolean;
    showAttendedEvents: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  
  // Notifications
  notifications: {
    events: boolean;
    messages: boolean;
    updates: boolean;
    partnersDeals: boolean;
    pushEnabled?: boolean;
    emailDigest?: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  
  // Content & activity
  savedEvents?: string[];
  savedGuides?: string[];
  favoritePartners?: string[];
  createdItineraries?: string[];
  activityFeed?: ActivityItem[];
  reviews?: ReviewItem[];
  achievements?: AchievementItem[];
  
  // Payment & membership
  paymentMethods?: {
    cards: PaymentCard[];
    mobilePay: boolean;
    cryptocurrencies: boolean;
  };
  membershipTier?: 'standard' | 'premium' | 'vip';
  
  // Verification
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    lastVerifiedDate?: string;
  };
}

// Profile edit skeleton for form handling
export interface ProfileEditSkeletonType {
  personal: {
    name: string;
    username: string;
    email: string;
    bio: string;
    location: string;
    avatar: string | null;
  };
  preferences: {
    interests: string[];
    favoritePlaces: string[];
    eventCategories: string[];
    guideCategories: string[];
    partnerCategories: string[];
    accessibility: {
      wheelchair: boolean;
      familyFriendly: boolean;
      petFriendly: boolean;
    };
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    lineId: string;
  };
  notifications: {
    events: boolean;
    messages: boolean;
    updates: boolean;
    partnersDeals: boolean;
    pushEnabled?: boolean;
    emailDigest?: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  privacy: {
    showLocation: boolean;
    showInterests: boolean;
    showAttendedEvents: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  paymentInfo: {
    hasPaymentMethods: boolean;
    defaultMethod?: string;
  };
}

// Partial profile type for updating specific sections
export type PartialProfileUpdate = Partial<ProfileType>;

// Helper function to extract public profile information
export function getPublicProfile(profile: ProfileType): Partial<ProfileType> {
  // Only return information based on user's privacy settings
  const publicProfile: Partial<ProfileType> = {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    joinDate: profile.joinDate,
  };
  
  if (profile.privacySettings.showLocation) {
    publicProfile.location = profile.location;
  }
  
  if (profile.privacySettings.showInterests) {
    publicProfile.interests = profile.interests;
    publicProfile.favoritePlaces = profile.favoritePlaces;
  }
  
  if (profile.privacySettings.showAttendedEvents) {
    publicProfile.eventsAttended = profile.eventsAttended;
  }
  
  return publicProfile;
}

// Helper function to check if profile is complete
export function isProfileComplete(profile: ProfileType): boolean {
  const requiredFields = [
    profile.name,
    profile.username,
    profile.email,
    profile.avatar,
    profile.bio,
    profile.location
  ];
  
  return requiredFields.every(field => field && field.trim().length > 0);
} 