import { NextResponse } from 'next/server';
import { AppError } from './errors';

/**
 * Maps error codes to HTTP status codes
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  USAGE_LIMIT_EXCEEDED: 429,
  VALIDATION_ERROR: 400,
  AUTH_ERROR: 401,
  AI_SERVICE_ERROR: 503,
};

/**
 * Handles errors in API routes and returns appropriate HTTP responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof AppError) {
    const status = ERROR_STATUS_MAP[error.code] || 500;
    return NextResponse.json(error.toJSON(), { status });
  }

  // Handle Supabase auth errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;

    if (message.includes('Invalid login credentials')) {
      return NextResponse.json(
        { error: 'AUTH_ERROR', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (message.includes('Email not confirmed')) {
      return NextResponse.json(
        { error: 'AUTH_ERROR', message: 'Please verify your email before logging in' },
        { status: 401 }
      );
    }
  }

  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    { status: 500 }
  );
}

/**
 * Standard success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Extracts user ID from request if authenticated
 */
export async function getAuthUserId(
  supabase: { auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } }
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
