import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { registerSchema } from '@/lib/validators/auth';
import { ApiResponse, LoginResponse } from '@/types';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const result = await AuthService.register(validatedData);

    const response = NextResponse.json<ApiResponse<LoginResponse>>(
      {
        success: true,
        message: 'User registered successfully',
        data: result
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
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

    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Error registering user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
