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
  created_at: Date | string;
}

export interface IEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: Date | string;
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
export interface ApiResponse<T = any> {
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
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  price?: number;
  image_url?: string;
  status?: 'draft' | 'published' | 'archived';
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
