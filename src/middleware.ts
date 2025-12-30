import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export async function middleware(request: NextRequest) {
  // First, handle i18n routing
  const intlResponse = intlMiddleware(request);

  // Then, update the Supabase session
  const supabaseResponse = await updateSession(request);

  // Merge headers from both responses
  if (intlResponse) {
    const response = NextResponse.next({
      request: {
        headers: intlResponse.headers,
      },
    });

    // Copy Supabase headers to the response
    supabaseResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
