import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { Enrollment } from '@/lib/db/models/Enrollment';
import { withAuth } from '@/lib/middleware/auth';
import { enrollCourseParamSchema } from '@/lib/validators/student';
import { ApiResponse, UserRole, IEnrollment, JwtPayload } from '@/types';
import { ZodError } from 'zod';

/**
 * POST /api/student/enroll/[courseId] - Enroll in a course
 */
async function enrollCourseHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = enrollCourseParamSchema.parse({ courseId: resolvedParams.courseId });
    const courseId = validatedParams.courseId;
    const userId = context.user.userId;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Course not found'
        },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.isEnrolled(userId, courseId);
    if (alreadyEnrolled) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Already enrolled in this course'
        },
        { status: 409 }
      );
    }

    // Enroll user
    const enrollment = await Enrollment.enroll(userId, courseId);

    return NextResponse.json<ApiResponse<{ enrollment: IEnrollment }>>(
      {
        success: true,
        message: 'Successfully enrolled in course',
        data: { enrollment }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enroll error:', error);
    
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
        message: 'Error enrolling in course',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth([UserRole.STUDENT], enrollCourseHandler);
