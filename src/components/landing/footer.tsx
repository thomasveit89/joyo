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

  const scrollToExamples = () => {
    document.getElementById('examples')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <footer className="bg-joyo-cream border-t border-joyo-charcoal/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="inline-block mb-4">
              <Image
                src="/joyo.svg"
                alt="Joyo"
                width={100}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-joyo-charcoal/70 max-w-xs">
              {t('tagline')}
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-joyo-charcoal mb-4">
              {t('product')}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={scrollToExamples}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('examples')}
                </button>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Use Cases Column */}
          <div>
            <h3 className="font-semibold text-joyo-charcoal mb-4">
              {t('useCases')}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={scrollToExamples}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('proposals')}
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToExamples}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('announcements')}
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToExamples}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('celebrations')}
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToExamples}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('surprises')}
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-joyo-charcoal mb-4">
              {t('company')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/business`}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('business')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-joyo-charcoal/70 hover:text-joyo-coral transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-12 pt-8 border-t border-joyo-charcoal/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-joyo-charcoal/60">{t('copyright')}</p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
