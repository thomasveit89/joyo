'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const t = useTranslations('auth.signup');
  const tApp = useTranslations('app');
  const params = useParams();
  const locale = params.locale as string;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Signup error:', authError);
      setError(t('signupError'));
      setLoading(false);
    } else {
      // Check if email confirmation is required
      if (data?.user && !data.session) {
        // Email confirmation required
        setEmailSent(true);
        setLoading(false);
      } else {
        // Auto-confirmed, redirect to dashboard
        window.location.href = `/${locale}/dashboard`;
      }
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Google signup error:', authError);
      setError(t('googleError'));
      setLoading(false);
    }
  };

  // Show email confirmation screen if email was sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-6xl">📧</div>
            <CardTitle className="text-2xl">{t('checkEmailTitle')}</CardTitle>
            <CardDescription className="text-base">
              {t('checkEmailMessage')} <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('checkEmailDescription')}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              {t('useDifferentEmail')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <Image
              src="/joyo.svg"
              alt="Joyo"
              width={109}
              height={66}
              className="mx-auto"
              priority
            />
          </div>
          <CardDescription className="text-base">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('continueWithGoogle')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('emailLabel')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('passwordLabel')}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                {t('passwordHint')}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t('confirmPasswordLabel')}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? t('creatingAccountButton') : t('createAccountButton')}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('haveAccount')} </span>
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-primary hover:underline"
            >
              {t('signInLink')}
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {t('termsNotice.prefix')}{' '}
            <Link
              href={`/${locale}/terms`}
              className="text-primary hover:underline"
            >
              {t('termsNotice.termsLink')}
            </Link>{' '}
            {t('termsNotice.and')}{' '}
            <Link
              href={`/${locale}/privacy`}
              className="text-primary hover:underline"
            >
              {t('termsNotice.privacyLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
