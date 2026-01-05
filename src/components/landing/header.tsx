'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('landing.header');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToExamples = () => {
    document.getElementById('examples')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0">
            <Image
              src="/joyo.svg"
              alt="Joyo"
              width={100}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={scrollToExamples}
              className="text-sm font-medium text-joyo-charcoal hover:text-joyo-coral transition-colors"
            >
              {t('login').includes('Login') ? 'Examples' : 'Beispiele'}
            </button>
            <Link
              href={`/${locale}/pricing`}
              className="text-sm font-medium text-joyo-charcoal hover:text-joyo-coral transition-colors"
            >
              {t('login').includes('Login') ? 'Pricing' : 'Preise'}
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-joyo-charcoal hover:text-joyo-coral"
            >
              <Link href={`/${locale}/auth/login`}>{t('login')}</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-joyo-coral text-white hover:bg-joyo-coral-dark"
            >
              <Link href={`/${locale}/auth/signup`}>{t('startFree')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
