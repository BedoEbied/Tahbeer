import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { createCourseSchema, getAllCoursesQuerySchema } from '@/lib/validators/course';
import { ApiResponse, UserRole, CourseWithInstructor, ICourse } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/courses - Get all courses with optional filtering and pagination
 * Public access
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    // Validate query parameters
    const validatedQuery = getAllCoursesQuerySchema.parse(queryParams);
    
    let courses: CourseWithInstructor[];
    
    if (validatedQuery.status === 'published') {
      courses = await Course.findPublished();
    } else {
      courses = await Course.findAll();
    }

    // Apply pagination
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCourses = courses.slice(startIndex, endIndex);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: paginatedCourses,
      // @ts-ignore - adding pagination metadata
      pagination: {
        total: courses.length,
        page,
        limit,
        totalPages: Math.ceil(courses.length / limit),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    
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
        message: 'Error fetching courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses - Create a new course
 * Instructor/Admin only
 */
async function createCourseHandler(req: NextRequest, context: { user: any; params: Promise<{}> }) {
  try {
    const body = await req.json();
    
    // Validate request
    const validatedData = createCourseSchema.parse(body);
    const instructorId = context.user.userId;

    const course = await Course.create(validatedData, instructorId);

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

export const POST = withAuth([UserRole.INSTRUCTOR, UserRole.ADMIN], createCourseHandler);
