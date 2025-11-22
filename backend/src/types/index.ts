import { Request } from 'express';

// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  INSTRUCTOR = 'instructor'
}

// Database Models
export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  created_at: Date;
}

export interface ICourse {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number;
  price: number;
  image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: Date;
}

export interface IEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: Date;
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extended Express Request with User
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
}

// Auth DTOs (Data Transfer Objects)
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
  user: Omit<IUser, 'password'>;
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

// User DTOs
export interface UpdateUserRoleDTO {
  role: UserRole;
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// Database Query Results
export type UserWithoutPassword = Omit<IUser, 'password'>;

export interface CourseWithInstructor extends ICourse {
 
  instructor :{
  instructor_name: string;
  instructor_email: string;
  }
}

export interface EnrollmentWithDetails extends IEnrollment {
  course_title: string;
  course_price: number;
  student_name: string;
  student_email: string;
}
