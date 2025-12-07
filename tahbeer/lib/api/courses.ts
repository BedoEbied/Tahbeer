import apiClient from './client';
import {
  ApiResponse,
  ICourse,
  CreateCourseDTO,
  UpdateCourseDTO,
  CourseWithInstructor,
  EnrollmentWithDetails,
} from '@/types';

/**
 * Course API functions
 */
export const courseApi = {
  /**
   * Get all published courses (student view)
   */
  getAllCourses: async (): Promise<ApiResponse<CourseWithInstructor[]>> => {
    const response = await apiClient.get<ApiResponse<CourseWithInstructor[]>>(
      '/api/student/courses'
    );
    return response.data;
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: number): Promise<ApiResponse<CourseWithInstructor>> => {
    const response = await apiClient.get<ApiResponse<CourseWithInstructor>>(
      `/api/student/courses/${id}`
    );
    return response.data;
  },

  /**
   * Enroll in a course (student)
   */
  enrollInCourse: async (courseId: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      `/api/student/enroll/${courseId}`
    );
    return response.data;
  },

  /**
   * Get enrolled courses (student)
   */
  getEnrolledCourses: async (): Promise<ApiResponse<CourseWithInstructor[]>> => {
    const response = await apiClient.get<ApiResponse<CourseWithInstructor[]>>(
      '/api/student/my-courses'
    );
    return response.data;
  },

  /**
   * Create new course (instructor)
   */
  createInstructorCourse: async (data: CreateCourseDTO): Promise<ApiResponse<ICourse>> => {
    const response = await apiClient.post<ApiResponse<ICourse>>(
      '/api/instructor/courses',
      data
    );
    return response.data;
  },

  /**
   * Update course (instructor)
   */
  updateInstructorCourse: async (
    id: number,
    data: UpdateCourseDTO
  ): Promise<ApiResponse<ICourse>> => {
    const response = await apiClient.put<ApiResponse<ICourse>>(
      `/api/instructor/courses/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete course (instructor)
   */
  deleteInstructorCourse: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      `/api/instructor/courses/${id}`
    );
    return response.data;
  },

  /**
   * Get instructor's courses
   */
  getInstructorCourses: async (): Promise<ApiResponse<ICourse[]>> => {
    const response = await apiClient.get<ApiResponse<ICourse[]>>(
      '/api/instructor/courses'
    );
    return response.data;
  },

  /**
   * Get course enrollments (instructor)
   */
  getCourseEnrollments: async (
    courseId: number
  ): Promise<ApiResponse<EnrollmentWithDetails[]>> => {
    const response = await apiClient.get<ApiResponse<EnrollmentWithDetails[]>>(
      `/api/instructor/courses/${courseId}/enrollments`
    );
    return response.data;
  },
};
