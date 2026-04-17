export type KeyType = 'secret' | 'publishable';

export interface BookingPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  booking_type: 'direct' | 'approval';
  max_days_ahead: number;
  buffer_time_minutes: number;
  visibility: 'public' | 'private' | 'team';
  auto_generate_meet_link: boolean;
  is_active: boolean;
  created_at: string;
}

export interface BookingQuestion {
  id: string;
  question_text: string;
  question_type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'phone';
  options: string[] | null;
  is_required: boolean;
  order_index: number;
}

export interface UserProfile {
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  timezone: string | null;
}

export interface BookingPageDetail {
  bookingPage: BookingPage;
  userProfile: UserProfile;
  questions: BookingQuestion[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Booking {
  id: string;
  booking_page_id: string;
  user_id: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  google_meet_link: string | null;
  created_at: string;
}

export interface CreateBookingInput {
  bookingPageId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  responses?: Array<{ questionId: string; answer: string }>;
}

export class ClndrError extends Error {
  public readonly status: number;
  public readonly data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ClndrError';
    this.status = status;
    this.data = data;
  }
}
