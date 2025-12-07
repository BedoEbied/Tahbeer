import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { courseIdParamSchema } from '@/lib/validators/student';
import { ApiResponse, UserRole, ICourse, JwtPayload } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/student/courses/[id] - Get course details
 */
async function getCourseDetailsHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = courseIdParamSchema.parse({ id: resolvedParams.id });
    const course = await Course.findById(validatedParams.id);

    if (!course) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Course not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<{ course: ICourse }>>({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    
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
        message: 'Error fetching course',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth([UserRole.STUDENT], getCourseDetailsHandler);
