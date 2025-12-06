'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { EnrollmentService } from '@/lib/services/enrollmentService';
import { verifyToken } from '@/lib/auth/server';

/**
 * Helper to get current user from cookies
 */
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) throw new Error('Not authenticated');
  return verifyToken(token);
}

/**
 * Enroll in course action
 */
export async function enrollInCourseAction(courseId: number) {
  try {
    const user = await getCurrentUser();
    
    const enrollment = await EnrollmentService.enrollInCourse(user.userId, courseId);

    revalidatePath('/student/my-courses');
    revalidatePath(`/courses/${courseId}`);

    return { success: true, data: enrollment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll in course'
    };
  }
}

/**
 * Unenroll from course action
 */
export async function unenrollFromCourseAction(courseId: number) {
  try {
    const user = await getCurrentUser();
    
    await EnrollmentService.unenrollFromCourse(user.userId, courseId);

    revalidatePath('/student/my-courses');
    revalidatePath(`/courses/${courseId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unenroll from course'
    };
  }
}
