// Re-export types from backend for frontend use
export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  INSTRUCTOR = 'instructor'
}

export interface IUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date | string;
}

export interface ICourse {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number;
  price: number;
  image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  slot_duration: number;
  price_per_slot: number;
  meeting_platform: 'zoom' | 'google_meet' | 'manual';
  meeting_link: string | null;
  currency: string;
  created_at: Date | string;
}

export interface IEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: Date | string;
}

export interface ITimeSlot {
  id: number;
  course_id: number;
  start_time: Date | string;
  end_time: Date | string;
  is_available: boolean;
  booked_by: number | null;
  created_at: Date | string;
}

export interface IBooking {
  id: number;
  user_id: number;
  course_id: number;
  slot_id: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method: string;
  payment_id: string | null;
  transaction_id: string | null;
  amount: number;
  meeting_link: string | null;
  meeting_id: string | null;
  meeting_platform: 'zoom' | 'google_meet' | 'manual';
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  booked_at: Date | string;
  cancelled_at: Date | string | null;
}

export interface CourseWithInstructor extends ICourse {
  instructor_name: string;
  instructor_email: string;
}

export interface EnrollmentWithDetails extends IEnrollment {
  course_title: string;
  course_price: number;
  student_name: string;
  student_email: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth DTOs
export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

// Course DTOs
export interface CreateCourseDTO {
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  status?: 'draft' | 'published';
  slot_duration?: number;
  price_per_slot: number;
  meeting_platform?: 'zoom' | 'google_meet' | 'manual';
  meeting_link?: string;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  price?: number;
  image_url?: string;
  status?: 'draft' | 'published' | 'archived';
  slot_duration?: number;
  price_per_slot?: number;
  meeting_platform?: 'zoom' | 'google_meet' | 'manual';
  meeting_link?: string;
}

// Time Slot DTOs
export interface CreateTimeSlotDTO {
  course_id: number;
  start_time: Date | string;
  end_time: Date | string;
}

export interface UpdateTimeSlotDTO {
  start_time?: Date | string;
  end_time?: Date | string;
}

// Booking DTOs
export interface CreateBookingDTO {
  user_id: number;
  course_id: number;
  slot_id: number;
  amount: number;
}

export interface CreatePaymentDTO {
  booking_id: number;
  amount: number;
  email: string;
  phone: string;
}

// Auth Context Types
export interface AuthContextType {
  user: IUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
