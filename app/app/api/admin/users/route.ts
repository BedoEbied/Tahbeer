import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/db/models/User';
import { withAuth } from '@/lib/middleware/auth';
import { updateUserRoleSchema, userIdSchema } from '@/lib/validators/admin';
import { ApiResponse, UserRole, UserWithoutPassword } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/admin/users - Get all users
 */
async function getAllUsersHandler(req: NextRequest, context: { user: any; params: Promise<{}> }) {
  try {
    const users = await User.findAll();

    return NextResponse.json<ApiResponse<{ users: UserWithoutPassword[]; count: number }>>({
      success: true,
      data: { users, count: users.length }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth([UserRole.ADMIN, UserRole.INSTRUCTOR], getAllUsersHandler);
