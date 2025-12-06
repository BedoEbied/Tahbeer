import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

/**
 * GET /api/auth/logout
 * Added for client compatibility; mirrors POST since logout is stateless.
 */
export async function GET() {
  return NextResponse.json<ApiResponse>(
    {
      success: true,
      message: 'Logout successful. Please remove token from client.'
    },
    { status: 200 }
  );
}

export async function POST() {
  // In JWT stateless auth, logout is handled client-side by removing token
  // This endpoint can be used for future token blacklisting/invalidation
  return NextResponse.json<ApiResponse>(
    {
      success: true,
      message: 'Logout successful. Please remove token from client.'
    },
    { status: 200 }
  );
}
