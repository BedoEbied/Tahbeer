import { NextResponse, type NextRequest } from 'next/server';

const REQUEST_ID_HEADER = 'x-request-id';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const rateBuckets = new Map<string, { count: number; expiresAt: number }>();
const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    if (ip) return ip;
  }
  // NextRequest.ip is not available in all runtimes; fallback to unknown
  return 'unknown';
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.expiresAt < now) {
    rateBuckets.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    throw new Error('Too many requests');
  }
}

export function middleware(req: NextRequest) {
  const requestId = req.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();

  // Ensure CSRF token cookie exists for safe requests (for browsers)
  const res = NextResponse.next();
  const existingCsrf = req.cookies.get(CSRF_COOKIE)?.value;
  if (!existingCsrf) {
    const token = crypto.randomUUID();
    res.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  // Basic CSRF guard for mutating API calls: require same-origin for Origin/Referer
  if (!SAFE_METHODS.has(req.method) && req.nextUrl.pathname.startsWith('/api')) {
    const origin = req.headers.get('origin') || req.headers.get('referer');
    if (origin) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== req.nextUrl.host) {
          return NextResponse.json(
            { success: false, message: 'CSRF protection: invalid origin' },
            { status: 403, headers: { [REQUEST_ID_HEADER]: requestId } }
          );
        }
      } catch {
        // If Origin/Referer is malformed, block the request
        return NextResponse.json(
          { success: false, message: 'CSRF protection: invalid origin' },
          { status: 403, headers: { [REQUEST_ID_HEADER]: requestId } }
        );
      }
    }

    // Double-submit check for browser-originated requests (when Origin present)
    if (origin) {
      const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value;
      const csrfHeader = req.headers.get(CSRF_HEADER);
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json(
          { success: false, message: 'CSRF token missing or invalid' },
          { status: 403, headers: { [REQUEST_ID_HEADER]: requestId } }
        );
      }
    }

    // Lightweight rate limit on mutating API calls (per IP+path)
    try {
      const ip = getClientIp(req);
      const key = `${ip}:${req.nextUrl.pathname}`;
      checkRateLimit(key);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429, headers: { [REQUEST_ID_HEADER]: requestId } }
      );
    }
  }

  res.headers.set(REQUEST_ID_HEADER, requestId);
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
