import { NextRequest, NextResponse } from 'next/server';
import { Enrollment } from '@/lib/db/models/Enrollment';
import { withAuth } from '@/lib/middleware/auth';
import { enrollCourseParamSchema } from '@/lib/validators/student';
import { ApiResponse, UserRole, JwtPayload } from '@/types';
import { ZodError } from 'zod';

/**
 * DELETE /api/student/unenroll/[courseId] - Unenroll from a course
 */
async function unenrollCourseHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = enrollCourseParamSchema.parse({ courseId: resolvedParams.courseId });
    const courseId = validatedParams.courseId;
    const userId = context.user.userId;

    const unenrolled = await Enrollment.unenroll(userId, courseId);

    if (!unenrolled) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Enrollment not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll error:', error);
    
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
        message: 'Error unenrolling from course',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth([UserRole.STUDENT], unenrollCourseHandler);
