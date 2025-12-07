import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { createCourseSchema } from '@/lib/validators/course';
import { ApiResponse, UserRole, ICourse, JwtPayload } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/instructor/courses - Get instructor's own courses
 */
async function getInstructorCoursesHandler(_req: NextRequest, context: { user: JwtPayload }) {
  try {
    const courses = await Course.findByInstructor(context.user.userId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { courses, count: courses.length }
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error fetching courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/courses - Create new course
 */
async function createInstructorCourseHandler(req: NextRequest, context: { user: JwtPayload }) {
  try {
    const body = await req.json();
    const validatedData = createCourseSchema.parse(body);

    const course = await Course.create(validatedData, context.user.userId);

    return NextResponse.json<ApiResponse<ICourse>>(
      {
        success: true,
        message: 'Course created successfully',
        data: course
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);
    
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
        message: 'Error creating course',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], getInstructorCoursesHandler);
export const POST = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], createInstructorCourseHandler);
