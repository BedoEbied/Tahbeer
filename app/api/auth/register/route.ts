import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { registerSchema } from '@/lib/validators/auth';
import { ApiResponse, LoginResponse } from '@/types';
import { ApiError, ApiErrorCode, handleApiError } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
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
    console.error(`[${requestId ?? 'no-id'}] Registration error:`, error);
    const wrapped =
      error instanceof Error && error.message === 'User with this email already exists'
        ? new ApiError(error.message, 409, ApiErrorCode.VALIDATION_ERROR)
        : error;
    return handleApiError(wrapped, requestId);
  }
}
