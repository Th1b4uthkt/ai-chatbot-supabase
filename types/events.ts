export interface EventType {
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
  coordinates: {
    latitude: number;
    longitude: number;
  };
  day: number; // 0-6 representing days of the week (Sunday-Saturday)

  // New fields for enhanced event data
  organizer?: {
    name: string;
    image?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  };
  duration?: string; // How long the event lasts, e.g. "2 hours", "All day"
  recurrence?: {
    pattern: "once" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
    customPattern?: string; // For irregular schedules like "First Monday of the month"
    endDate?: string; // When the recurring event series ends
  };
  // Added fields for database compatibility
  recurrence_pattern?: string;
  recurrence_custom_pattern?: string;
  recurrence_end_date?: string;
  facilities?: {
    parking?: boolean;
    atm?: boolean;
    foodAvailable?: boolean;
    toilets?: boolean;
    wheelchair?: boolean;
    wifi?: boolean;
    petFriendly?: boolean;
    childFriendly?: boolean;
  };
  tickets?: {
    url?: string;
    availableCount?: number;
    types?: Array<{
      name: string;
      price: string;
      description?: string;
    }>;
  };
  tags?: string[]; // For searchability and filtering
  capacity?: number; // Maximum number of attendees
  attendeeCount?: number; // Current number of confirmed attendees
} 