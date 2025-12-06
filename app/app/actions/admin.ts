'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { AdminService } from '@/lib/services/adminService';
import { verifyToken } from '@/lib/auth/server';
import { updateUserRoleSchema } from '@/lib/validators/admin';
import { UserRole } from '@/types';

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
 * Update user role action
 */
export async function updateUserRoleAction(userId: number, role: UserRole) {
  try {
    const user = await getCurrentUser();
    
    // Only admins can use this action
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.INSTRUCTOR) {
      throw new Error('Unauthorized');
    }

    const validatedData = updateUserRoleSchema.parse({ role });
    await AdminService.updateUserRole(userId, validatedData.role);

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role'
    };
  }
}

/**
 * Delete user action
 */
export async function deleteUserAction(userId: number) {
  try {
    const user = await getCurrentUser();
    
    // Only admins can use this action
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.INSTRUCTOR) {
      throw new Error('Unauthorized');
    }

    await AdminService.deleteUser(user.userId, userId);

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    };
  }
}

/**
 * Delete course (admin) action
 */
export async function deleteCourseAdminAction(courseId: number) {
  try {
    const user = await getCurrentUser();
    
    // Only admins can use this action
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.INSTRUCTOR) {
      throw new Error('Unauthorized');
    }

    await AdminService.deleteCourse(courseId);

    revalidatePath('/admin/courses');
    revalidatePath('/courses');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete course'
    };
  }
}
