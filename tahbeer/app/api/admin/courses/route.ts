import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { withAuth } from '@/lib/middleware/auth';
import { ApiResponse, UserRole, CourseWithInstructor } from '@/types';
import { JwtPayload } from '@/types';

/**
 * GET /api/admin/courses - Get all courses (including drafts)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAllAdminCoursesHandler(_req: NextRequest, _context: { user: JwtPayload }) {
  try {
    const courses = await Course.findAll();

    return NextResponse.json<ApiResponse<{ courses: CourseWithInstructor[]; count: number }>>({
      success: true,
      data: { courses, count: courses.length }
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
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

export const GET = withAuth([UserRole.ADMIN, UserRole.INSTRUCTOR], getAllAdminCoursesHandler);
