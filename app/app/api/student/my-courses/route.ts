import { NextRequest, NextResponse } from 'next/server';
import { Enrollment } from '@/lib/db/models/Enrollment';
import { withAuth } from '@/lib/middleware/auth';
import { ApiResponse, UserRole, EnrollmentWithDetails } from '@/types';

/**
 * GET /api/student/my-courses - Get user's enrolled courses
 */
async function getMyCoursesHandler(req: NextRequest, context: { user: any; params: Promise<{}> }) {
  try {
    const enrollments = await Enrollment.getUserEnrollments(context.user.userId);

    return NextResponse.json<ApiResponse<{ enrollments: EnrollmentWithDetails[]; count: number }>>({
      success: true,
      data: { enrollments, count: enrollments.length }
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error fetching enrolled courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth([UserRole.STUDENT], getMyCoursesHandler);
