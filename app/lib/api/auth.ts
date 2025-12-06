import apiClient from './client';
import {
  LoginDTO,
  RegisterDTO,
  LoginResponse,
  ApiResponse,
  UserWithoutPassword,
} from '@/types';

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterDTO): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginDTO): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      data
    );
    return response.data;
  },

  /**
   * Get current user
   */
  getMe: async (): Promise<ApiResponse<UserWithoutPassword>> => {
    const response = await apiClient.get<ApiResponse<UserWithoutPassword>>(
      '/api/auth/me'
    );
    return response.data;
  },

  /**
   * Logout user (client-side)
   */
  logout: () => {
    if (globalThis.window !== undefined) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      globalThis.window.location.href = '/login';
    }
  },
};
