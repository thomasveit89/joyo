import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale } from '@/i18n/config';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const type = requestUrl.searchParams.get('type');
  const origin = requestUrl.origin;

  // Redirect to 'next' URL if provided, otherwise dashboard
  const redirectUrl = next ? `${origin}${next}` : `${origin}/${defaultLocale}/dashboard`;

  // Create the redirect response
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    // Create Supabase client that sets cookies on the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      // Return error redirect without cookies
      return NextResponse.redirect(`${origin}/${defaultLocale}/auth/login?error=auth_failed`);
    }
  }

  // If this is a password recovery, redirect to reset password page
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/${defaultLocale}/auth/reset-password`);
  }

  return response;
}
