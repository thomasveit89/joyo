import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export async function middleware(request: NextRequest) {
  // Handle i18n routing first
  let response = intlMiddleware(request);

  // If i18n didn't return a response, create a basic one
  if (!response) {
    response = NextResponse.next();
  }

  // Update Supabase auth session and merge cookies into the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - images, videos, fonts, and other static assets
     * - api routes (must not go through i18n middleware)
     * - animations, img, examples folders (static assets)
     * - txt files (robots.txt, llm.txt, ai.txt)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|animations|img|examples|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|lottie|txt)$).*)',
  ],
};
