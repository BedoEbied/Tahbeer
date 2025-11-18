import apiClient from './client';
import {
  ApiResponse,
  UserWithoutPassword,
  UpdateUserRoleDTO,
  ICourse,
} from '@/types';

/**
 * Admin API functions
 */
export const adminApi = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<ApiResponse<UserWithoutPassword[]>> => {
    const response = await apiClient.get<ApiResponse<UserWithoutPassword[]>>(
      '/api/admin/users'
    );
    return response.data;
  },

  /**
   * Update user role
   */
  updateUserRole: async (
    userId: number,
    data: UpdateUserRoleDTO
  ): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      `/api/admin/users/${userId}/role`,
      data
    );
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      `/api/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * Get all courses (admin view)
   */
  getAllCourses: async (): Promise<ApiResponse<ICourse[]>> => {
    const response = await apiClient.get<ApiResponse<ICourse[]>>(
      '/api/admin/courses'
    );
    return response.data;
  },
};
