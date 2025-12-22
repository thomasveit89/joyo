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
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Magic link error:', authError);
      setError('Failed to send magic link. Please try again.');
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-6xl">📧</div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to sign in. You can close this window.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">✨</div>
          <CardTitle className="text-3xl font-bold">Experience Builder</CardTitle>
          <CardDescription className="text-base mt-2">
            Create beautiful, emotional gift journeys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              No password needed. We&apos;ll email you a secure link.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
