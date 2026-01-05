'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from './header';
import { ExamplesGallery } from './examples-gallery';
import { HowItWorks } from './how-it-works';
import { Footer } from './footer';
import { getExamplesByLocale } from '@/data/examples';

interface LandingPageProps {
  locale: string;
}

export function LandingPage({ locale }: LandingPageProps) {
  const t = useTranslations('landing.hero');
  const examples = getExamplesByLocale(locale);

  const scrollToExamples = () => {
    document.getElementById('examples')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen bg-joyo-cream">
      {/* Header */}
      <Header locale={locale} />

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline with color accent */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-joyo-charcoal sm:text-5xl lg:text-6xl">
            {locale === 'en' ? (
              <>
                Create <span className="text-joyo-coral">emotional</span> gift
                journeys that touch hearts
              </>
            ) : (
              <>
                Erschaffe{' '}
                <span className="text-joyo-coral">emotionale</span>{' '}
                Geschenkreisen, die Herzen berühren
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-xl text-joyo-charcoal/80 sm:text-2xl max-w-3xl mx-auto">
            {t('subheadline')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-joyo-coral text-white text-lg hover:bg-joyo-coral-dark sm:w-auto"
            >
              <Link href={`/${locale}/auth/signup`}>{t('ctaPrimary')}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToExamples}
              className="w-full text-lg border-joyo-coral text-joyo-coral hover:bg-joyo-coral hover:text-white sm:w-auto"
            >
              {t('ctaSecondary')}
            </Button>
          </div>
        </div>
      </section>

      {/* Examples Gallery */}
      <ExamplesGallery locale={locale} examples={examples} />

      {/* How It Works */}
      <HowItWorks locale={locale} />

      {/* Final CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="mb-4 text-3xl font-bold text-joyo-charcoal sm:text-4xl">
            {locale === 'en'
              ? 'Ready to Create Something Special?'
              : 'Bereit, etwas Besonderes zu erschaffen?'}
          </h3>
          <p className="mb-8 text-xl text-joyo-charcoal/80">
            {locale === 'en'
              ? 'Start creating beautiful gift experiences in minutes'
              : 'Beginne in wenigen Minuten mit der Erstellung wunderschöner Geschenkerlebnisse'}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-joyo-coral text-white text-lg hover:bg-joyo-coral-dark"
          >
            <Link href={`/${locale}/auth/signup`}>
              {locale === 'en' ? 'Start Free' : 'Kostenlos starten'}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
