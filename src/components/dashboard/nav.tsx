'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export function DashboardNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span>Experience Builder</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            My Gifts
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
