'use server'

import { cookies } from 'next/headers';
import { AuthService } from '@/lib/services/authService';
import { verifyToken } from '@/lib/auth/server';
import { registerSchema, loginSchema } from '@/lib/validators/auth';
import { UserWithoutPassword } from '@/types';

/**
 * Register action for forms
 */
export async function registerAction(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as string | undefined,
    };

    const validatedData = registerSchema.parse(data);
    const result = await AuthService.register(validatedData);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    };
  }
}

/**
 * Login action for forms
 */
export async function loginAction(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = loginSchema.parse(data);
    const result = await AuthService.login(validatedData.email, validatedData.password);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    };
  }
}

/**
 * Get current user (server-side helper)
 */
export async function getCurrentUserAction(): Promise<{ success: boolean; data?: UserWithoutPassword; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      // Try from header for API clients
      return { success: false, error: 'Not authenticated' };
    }

    const decoded = verifyToken(token);
    const user = await AuthService.getCurrentUser(decoded.userId);

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user'
    };
  }
}
