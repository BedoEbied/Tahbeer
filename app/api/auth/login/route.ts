import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { loginSchema } from '@/lib/validators/auth';
import { ApiResponse, LoginResponse } from '@/types';
import { ApiError, ApiErrorCode, handleApiError } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    const result = await AuthService.login(validatedData.email, validatedData.password);

    const response = NextResponse.json<ApiResponse<LoginResponse>>(
      {
        success: true,
        message: 'Login successful',
        data: result
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error(`[${requestId ?? 'no-id'}] Login error:`, error);
    const wrapped =
      error instanceof Error && error.message === 'Invalid email or password'
        ? new ApiError(error.message, 401, ApiErrorCode.AUTH_FAILED)
        : error;
    return handleApiError(wrapped, requestId);
  }
}
