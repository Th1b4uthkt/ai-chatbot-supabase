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
  
  // Database fields
  latitude?: number;
  longitude?: number;
  
  // Computed fields mapped from database
  coordinates: {
    latitude: number;
    longitude: number;
  };
  
  day: number; // 0-6 representing days of the week (Sunday-Saturday)

  // Database organizer fields
  organizer_name?: string;
  organizer_image?: string;
  organizer_contact_email?: string;
  organizer_contact_phone?: string;
  organizer_website?: string;
  
  // Computed organizer object
  organizer: {
    name: string;
    image?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  };
  
  duration?: string; // How long the event lasts, e.g. "2 hours", "All day"
  
  // Database recurrence fields
  recurrence_pattern?: string;
  recurrence_custom_pattern?: string;
  recurrence_end_date?: string;
  
  // Computed recurrence object
  recurrence?: {
    pattern: "once" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
    customPattern?: string; // For irregular schedules like "First Monday of the month"
    endDate?: string; // When the recurring event series ends
  };
  
  // Facilities can be stored as JSON in the database
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
  
  // Tickets can be stored as JSON in the database
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
  attendee_count?: number; // Database field
  attendeeCount?: number; // Computed field (mapped from attendee_count)
  
  // Additional database fields
  created_at?: string;
  updated_at?: string;
  is_sponsored?: boolean;
  sponsor_end_date?: string | null;
} 