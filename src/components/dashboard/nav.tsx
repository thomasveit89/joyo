'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';

export function DashboardNav({ user }: { user: User }) {
  const t = useTranslations('dashboard.nav');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
    router.refresh();
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/dashboard`} className="flex items-center">
            <Image
              src="/joyo.svg"
              alt="Joyo"
              width={63}
              height={38}
              priority
            />
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('myGifts')}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            {t('signOut')}
          </Button>
        </div>
      </div>
    </nav>
  );
}
