import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback handler
 * Exchanges the auth code for a session and redirects appropriately
 *
 * This route handles:
 * - Google OAuth callback (FR-102)
 * - Email verification callback (FR-101)
 * - Password reset callback (FR-104)
 *
 * NOTE: This route manually sets session cookies because exchangeCodeForSession
 * doesn't trigger the setAll callback synchronously before the redirect.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const type = requestUrl.searchParams.get('type');

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || 'Authentication failed');
    return NextResponse.redirect(loginUrl);
  }

  // Exchange code for session
  if (code) {
    // Determine redirect URL
    let redirectUrl = new URL('/app', requestUrl.origin);
    if (type === 'recovery') {
      redirectUrl = new URL('/reset-password/confirm', requestUrl.origin);
    }

    // Create response first so we can set cookies on it
    const response = NextResponse.redirect(redirectUrl);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Note: setAll is not called synchronously by exchangeCodeForSession
            // We handle cookie setting manually below
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Code exchange error:', exchangeError.message);
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'Failed to complete authentication');
      return NextResponse.redirect(loginUrl);
    }

    // Manually set session cookies
    if (data.session) {
      const { access_token, refresh_token, expires_at, expires_in } = data.session;

      // Create the auth token value (same format Supabase uses)
      const authToken = JSON.stringify({
        access_token,
        refresh_token,
        expires_at,
        expires_in,
        token_type: 'bearer',
        user: data.user,
      });

      // Get the project ref from the Supabase URL
      const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0];
      const cookieName = `sb-${projectRef}-auth-token`;
      const maxChunkSize = 3180; // Leave room for cookie overhead

      const cookieOptions = {
        path: '/',
        sameSite: 'lax' as const,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      };

      if (authToken.length <= maxChunkSize) {
        response.cookies.set(cookieName, authToken, cookieOptions);
      } else {
        // Chunk the token for large payloads
        const chunks = Math.ceil(authToken.length / maxChunkSize);
        for (let i = 0; i < chunks; i++) {
          const chunk = authToken.slice(i * maxChunkSize, (i + 1) * maxChunkSize);
          response.cookies.set(`${cookieName}.${i}`, chunk, cookieOptions);
        }
      }
    }

    return response;
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
