import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { handleApiError } from '@/lib/api/errors';

/**
 * GET /api/auth/logout
 * Added for client compatibility; mirrors POST since logout is stateless.
 */
export async function GET() {
  try {
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Logout successful. Please remove token from client.'
      },
      { status: 200 }
    );
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  // In JWT stateless auth, logout is handled client-side by removing token
  // This endpoint can be used for future token blacklisting/invalidation
  try {
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Logout successful. Please remove token from client.'
      },
      { status: 200 }
    );
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
