import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { defaultLocale } from '@/i18n/config';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      // Redirect to login with error
      return NextResponse.redirect(`${origin}/${defaultLocale}/auth/login?error=auth_failed`);
    }
  }

  // Redirect to 'next' URL if provided, otherwise dashboard
  const redirectUrl = next ? `${origin}${next}` : `${origin}/${defaultLocale}/dashboard`;
  return NextResponse.redirect(redirectUrl);
}
