import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler
 * Exchanges the auth code for a session and redirects to /app
 *
 * This route handles:
 * - Google OAuth callback (FR-102)
 * - Email verification callback (FR-101)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || 'Authentication failed');
    return NextResponse.redirect(loginUrl);
  }

  // Exchange code for session
  if (code) {
    const supabase = await createServerSupabaseClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Code exchange error:', exchangeError.message);
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'Failed to complete authentication');
      return NextResponse.redirect(loginUrl);
    }

    // Successfully authenticated - redirect to app
    return NextResponse.redirect(new URL('/app', requestUrl.origin));
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
