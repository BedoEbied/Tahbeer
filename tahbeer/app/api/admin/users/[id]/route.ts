import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/db/models/User';
import { withAuth } from '@/lib/middleware/auth';
import { userIdSchema } from '@/lib/validators/admin';
import { ApiResponse, UserRole } from '@/types';
import { ZodError } from 'zod';
import { JwtPayload } from '@/types';

/**
 * DELETE /api/admin/users/[id] - Delete user
 */
async function deleteUserHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = userIdSchema.parse({ id: resolvedParams.id });
    const userId = validatedParams.id;

    // Prevent self-deletion
    if (context.user.userId === userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Cannot delete your own account'
        },
        { status: 400 }
      );
    }

    const deleted = await User.delete(userId);

    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Validation failed',
          error: error.issues.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth([UserRole.ADMIN, UserRole.INSTRUCTOR], deleteUserHandler);
