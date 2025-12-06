import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { courseIdParamSchema } from '@/lib/validators/student';
import { ApiResponse, UserRole, CourseWithInstructor, ICourse } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/student/courses - Browse all published courses
 */
async function getPublishedCoursesHandler(req: NextRequest, context: { user: any; params: Promise<{}> }) {
  try {
    const courses = await Course.findPublished();

    return NextResponse.json<ApiResponse<{ courses: CourseWithInstructor[]; count: number }>>({
      success: true,
      data: { courses, count: courses.length }
    });
  } catch (error) {
    console.error('Get courses error:', error);
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

export const GET = withAuth([UserRole.STUDENT], getPublishedCoursesHandler);
