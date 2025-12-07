import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/lib/db/models/Course';
import { courseIdSchema } from '@/lib/validators/course';
import { ApiResponse, ICourse } from '@/types';
import { ZodError } from 'zod';

/**
 * GET /api/courses/instructor/[instructorId] - Get all courses by instructor
 * Public access
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ instructorId: string }> }
) {
  try {
    const resolvedParams = await params;
    const validatedParams = courseIdSchema.parse({ id: resolvedParams.instructorId });
    const courses = await Course.findByInstructor(validatedParams.id);

    return NextResponse.json<ApiResponse<ICourse[]>>({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid instructor ID',
          error: error.issues.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error fetching instructor courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
