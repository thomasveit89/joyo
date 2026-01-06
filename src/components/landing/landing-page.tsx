'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useScroll, useTransform, motion } from 'framer-motion';
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

  const { scrollY } = useScroll();

  // Parallax transforms for different blob layers
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, 100]);
  const blob3Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const blob4Y = useTransform(scrollY, [0, 1000], [0, 50]);

  const scrollToExamples = () => {
    document.getElementById('examples')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-joyo-cream via-joyo-peach/30 to-white">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-joyo-coral/10 via-transparent to-joyo-peach/20 animate-gradient-shift" />
      </div>

      {/* Organic Blob Shapes with Parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top-right blob */}
        <motion.div
          style={{ y: blob1Y }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-joyo-coral/20 rounded-full blur-3xl animate-blob"
        />
        {/* Left blob */}
        <motion.div
          style={{ y: blob2Y }}
          className="absolute top-1/4 -left-32 w-80 h-80 bg-joyo-peach/30 rounded-full blur-3xl animate-blob animation-delay-2000"
        />
        {/* Bottom blob */}
        <motion.div
          style={{ y: blob3Y }}
          className="absolute bottom-20 right-1/4 w-72 h-72 bg-joyo-coral/15 rounded-full blur-3xl animate-blob animation-delay-4000"
        />
        {/* Center blob */}
        <motion.div
          style={{ y: blob4Y }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-joyo-peach/20 rounded-full blur-3xl animate-blob animation-delay-3000"
        />
      </div>

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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="mb-4 text-3xl font-bold text-joyo-charcoal sm:text-4xl">
            {locale === 'en'
              ? 'Ready to create something special?'
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
