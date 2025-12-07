import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { withAuth } from '@/lib/middleware/auth';
import { ApiResponse, UserWithoutPassword, JwtPayload } from '@/types';

async function handler(_req: NextRequest, context: { user: JwtPayload }) {
  try {
    const user = await AuthService.getCurrentUser(context.user.userId);

    return NextResponse.json<ApiResponse<{ user: UserWithoutPassword }>>(
      {
        success: true,
        data: { user }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get me error:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error fetching user data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth('all', handler);
