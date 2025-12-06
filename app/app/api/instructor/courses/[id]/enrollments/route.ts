import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { Enrollment } from '@/lib/db/models/Enrollment';
import { withAuth } from '@/lib/middleware/auth';
import { courseIdSchema } from '@/lib/validators/course';
import { ApiResponse, UserRole, EnrollmentWithDetails } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/instructor/courses/[id]/enrollments - Get enrollments for a course
 */
async function getCourseEnrollmentsHandler(
  req: NextRequest,
  context: { user: any; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = courseIdSchema.parse({ id: resolvedParams.id });
    const courseId = validatedParams.id;

    // Check if course exists and belongs to instructor (unless admin)
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

    // Only course owner can view enrollments (unless admin)
    if (course.instructor_id !== context.user.userId && context.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'You can only view enrollments for your own courses'
        },
        { status: 403 }
      );
    }

    const enrollments = await Enrollment.getCourseEnrollments(courseId);

    return NextResponse.json<ApiResponse<{ enrollments: EnrollmentWithDetails[]; count: number }>>({
      success: true,
      data: { enrollments, count: enrollments.length }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    
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
        message: 'Error fetching enrollments',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], getCourseEnrollmentsHandler);
