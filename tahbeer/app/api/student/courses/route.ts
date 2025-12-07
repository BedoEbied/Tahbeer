import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { ApiResponse, UserRole, CourseWithInstructor, JwtPayload } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getPublishedCoursesHandler(_req: NextRequest, _context: { user: JwtPayload }) {
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
