import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { userIdSchema } from '@/lib/validators/admin';
import { ApiResponse, UserRole } from '@/types';
import { ZodError } from 'zod';

/**
 * DELETE /api/admin/courses/[id] - Delete any course
 */
async function deleteAdminCourseHandler(
  req: NextRequest,
  context: { user: any; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = userIdSchema.parse({ id: resolvedParams.id });
    const courseId = validatedParams.id;

    const deleted = await Course.delete(courseId);

    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Course not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    
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
        message: 'Error deleting course',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth([UserRole.ADMIN, UserRole.INSTRUCTOR], deleteAdminCourseHandler);
