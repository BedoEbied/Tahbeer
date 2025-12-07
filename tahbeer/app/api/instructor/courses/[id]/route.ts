import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { updateCourseSchema, courseIdSchema } from '@/lib/validators/course';
import { ApiResponse, UserRole, JwtPayload } from '@/types';
import { ZodError } from 'zod';

/**
 * PUT /api/instructor/courses/[id] - Update own course
 */
async function updateInstructorCourseHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = courseIdSchema.parse({ id: resolvedParams.id });
    const courseId = validatedParams.id;
    
    const body = await req.json();
    const validatedData = updateCourseSchema.parse(body);

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

    // Only course owner can update (unless admin)
    if (course.instructor_id !== context.user.userId && context.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'You can only update your own courses'
        },
        { status: 403 }
      );
    }

    const updated = await Course.update(courseId, validatedData);

    if (!updated) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'No updates provided'
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    
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
        message: 'Error updating course',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/courses/[id] - Delete own course
 */
async function deleteInstructorCourseHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ id: string }> }
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

    // Only course owner can delete (unless admin)
    if (course.instructor_id !== context.user.userId && context.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'You can only delete your own courses'
        },
        { status: 403 }
      );
    }

    await Course.delete(courseId);

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

export const PUT = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], updateInstructorCourseHandler);
export const DELETE = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], deleteInstructorCourseHandler);
