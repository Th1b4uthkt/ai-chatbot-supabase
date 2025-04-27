export interface Booking {
  id: string;
  user_id: string;
  activity_id: string;
  activity_name: string;
  activity_image: string | null;
  service: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string; // ISO string format for timestamp with timezone
  booking_time: string; // Format HH:MM
  booking_end_date: string | null; // ISO string format for timestamp with timezone
  booking_end_time: string | null; // Format HH:MM
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string; // ISO string format for timestamp with timezone
  updated_at?: string; // Optionnel pour la création, sera généré par Supabase
}

export type BookingFormData = Omit<Booking, 'id' | 'created_at' | 'status'>;

export interface BookingFilter {
  status?: 'pending' | 'confirmed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  activityId?: string;
  userId?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
} 