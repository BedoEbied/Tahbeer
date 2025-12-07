import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/services/courseService';
import { withAuth } from '@/lib/middleware/auth';
import { updateCourseSchema, courseIdSchema } from '@/lib/validators/course';
import { ApiResponse, UserRole, ICourse, JwtPayload } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/courses/[id] - Get a single course by ID
 * Public access
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const validatedParams = courseIdSchema.parse({ id: resolvedParams.id });
    const course = await CourseService.getCourseById(validatedParams.id);

    return NextResponse.json<ApiResponse<ICourse>>({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid course ID',
          error: error.issues.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Course not found') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status: 404 }
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

/**
 * PUT /api/courses/[id] - Update a course
 * Instructor/Admin only
 */
async function updateCourseHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = courseIdSchema.parse({ id: resolvedParams.id });
    const body = await req.json();
    const validatedData = updateCourseSchema.parse(body);

    const updatedCourse = await CourseService.updateCourse(
      context.user.userId,
      context.user.role,
      validatedParams.id,
      validatedData
    );

    return NextResponse.json<ApiResponse<ICourse>>({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
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

    if (error instanceof Error) {
      const statusMap: Record<string, number> = {
        'Course not found': 404,
        'Not authorized to update this course': 403,
      };
      const status = statusMap[error.message] || 500;
      
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error updating course',
        error: 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id] - Delete a course
 * Instructor/Admin only
 */
async function deleteCourseHandler(
  req: NextRequest,
  context: { user: JwtPayload; params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const validatedParams = courseIdSchema.parse({ id: resolvedParams.id });

    await CourseService.deleteCourse(
      context.user.userId,
      context.user.role,
      validatedParams.id
    );

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
          message: 'Invalid course ID',
          error: error.issues.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      const statusMap: Record<string, number> = {
        'Course not found': 404,
        'Not authorized to delete this course': 403,
      };
      const status = statusMap[error.message] || 500;
      
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error deleting course',
        error: 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const PUT = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], updateCourseHandler);
export const DELETE = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], deleteCourseHandler);
