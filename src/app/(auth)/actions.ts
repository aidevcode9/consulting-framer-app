'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export type AuthResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Sign up with email and password
 * FR-101: Email/password signup
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string | null;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const supabase = await createServerSupabaseClient();
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName || email.split('@')[0],
      },
    },
  });

  if (error) {
    console.error('[Auth] Signup error:', error.message);

    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists' };
    }

    return { error: error.message };
  }

  return {
    success: true,
    message: 'Check your email for a verification link',
  };
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[Auth] Login error:', error.message);

    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password' };
    }

    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email before logging in' };
    }

    return { error: error.message };
  }

  redirect('/app');
}

/**
 * Sign in with Google OAuth
 * FR-102: OAuth login (Google)
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('[Auth] Google OAuth error:', error.message);
    return { error: 'Failed to initiate Google sign-in' };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: 'Failed to get OAuth URL' };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Request password reset email
 * FR-104: Password reset
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  const supabase = await createServerSupabaseClient();
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  if (error) {
    console.error('[Auth] Password reset error:', error.message);
    return { error: 'Failed to send reset email. Please try again.' };
  }

  return {
    success: true,
    message: 'Check your email for a password reset link',
  };
}

/**
 * Update password (after clicking reset link)
 * FR-104: Password reset
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { error: 'Password is required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error('[Auth] Update password error:', error.message);
    return { error: 'Failed to update password. Please try again.' };
  }

  return {
    success: true,
    message: 'Password updated successfully',
  };
}
