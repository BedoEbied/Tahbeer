import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { loginSchema } from '@/lib/validators/auth';
import { ApiResponse, LoginResponse } from '@/types';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    const result = await AuthService.login(validatedData.email, validatedData.password);

    return NextResponse.json<ApiResponse<LoginResponse>>(
      {
        success: true,
        message: 'Login successful',
        data: result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
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

    if (error instanceof Error && error.message === 'Invalid email or password') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error logging in',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
