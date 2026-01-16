'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('landing.footer');

  return (
    <footer className="bg-joyo-cream border-t border-joyo-charcoal/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="inline-block">
            <Image
              src="/joyo.svg"
              alt="Joyo"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          {/* Tagline */}
          <p className="text-sm text-joyo-charcoal/70 max-w-md">
            {t('tagline')}
          </p>

          {/* Divider */}
          <div className="w-full max-w-md border-t border-joyo-charcoal/10" />

          {/* Links Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <p className="text-sm text-joyo-charcoal/60">{t('copyright')}</p>
            <Link
              href={`/${locale}/terms`}
              className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
            >
              {t('terms')}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
            >
              {t('privacy')}
            </Link>
            <a
              href="/llm.txt"
              className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              AI Info
            </a>
            <LanguageSwitcher />
          </div>

          {/* Made by */}
          <div className="mt-4 pt-4 border-t border-joyo-charcoal/10 w-full max-w-md">
            <p className="text-xs text-joyo-charcoal/50">
              Made with care by{' '}
              <a
                href="https://designsnack.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-joyo-charcoal/70 hover:text-joyo-coral transition-colors font-semibold"
              >
                DESIGNSNACK
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
