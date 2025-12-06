import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/db/models/User';
import { withAuth } from '@/lib/middleware/auth';
import { updateUserRoleSchema, userIdSchema } from '@/lib/validators/admin';
import { ApiResponse, UserRole } from '@/types';
import { ZodError } from 'zod';

/**
 * PUT /api/admin/users/[id]/role - Update user role
 */
async function updateUserRoleHandler(
  req: NextRequest,
  context: { user: any; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = userIdSchema.parse({ id: resolvedParams.id });
    const userId = validatedParams.id;
    
    const body = await req.json();
    const validatedData = updateUserRoleSchema.parse(body);

    const updated = await User.updateRole(userId, validatedData.role);

    if (!updated) {
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
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    
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
        message: 'Error updating user role',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const PUT = withAuth([UserRole.ADMIN, UserRole.INSTRUCTOR], updateUserRoleHandler);
