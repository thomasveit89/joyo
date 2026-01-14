'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from './header';
import { FeaturesSection } from './features-section';
import { ExamplesGallery } from './examples-gallery';
import { HowItWorks } from './how-it-works';
import { FaqSection } from './faq-section';
import { StickyCta } from './sticky-cta';
import { Footer } from './footer';
import { getExamplesByLocale } from '@/data/examples';

interface LandingPageProps {
  locale: string;
}

export function LandingPage({ locale }: LandingPageProps) {
  const tHero = useTranslations('landing.hero');
  const tFinalCta = useTranslations('landing.finalCta');
  const examples = getExamplesByLocale(locale);

  const { scrollY } = useScroll();

  // Parallax transforms for different blob layers
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, 100]);
  const blob3Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const blob4Y = useTransform(scrollY, [0, 1000], [0, 50]);

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
      <section className="relative px-4 pt-32 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Headline with color accent */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-6 text-4xl font-bold tracking-tight text-joyo-charcoal sm:text-5xl lg:text-6xl leading-tight"
          >
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
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-8 text-xl text-joyo-charcoal/80 sm:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            {tHero('subheadline')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="w-full bg-joyo-coral text-white text-lg hover:bg-joyo-coral-dark sm:w-auto px-10 py-6 shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href={`/${locale}/auth/signup`}>{tHero('ctaPrimary')}</Link>
            </Button>
            {/* Micro copy */}
            <p className="text-sm text-joyo-charcoal/60">
              {tHero('ctaMicro')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Examples Gallery */}
      <ExamplesGallery locale={locale} examples={examples} />

      {/* Features Section */}
      <FeaturesSection locale={locale} />

      {/* How It Works */}
      <HowItWorks locale={locale} />

      {/* FAQ Section */}
      <FaqSection locale={locale} />

      {/* Final CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-br from-joyo-cream via-joyo-peach/20 to-joyo-coral/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-joyo-coral/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-joyo-peach/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center relative z-10"
        >
          {/* Free badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white text-joyo-coral px-5 py-2 rounded-full shadow-lg border-2 border-joyo-coral/20">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-sm">{tFinalCta('badge')}</span>
            </div>
          </div>

          <h3 className="mb-4 text-4xl sm:text-5xl font-bold text-joyo-charcoal">
            {tFinalCta('title')}
          </h3>
          <p className="mb-10 text-lg sm:text-xl text-joyo-charcoal/80 max-w-2xl mx-auto">
            {tFinalCta('subtitle')}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-joyo-coral text-white text-lg hover:bg-joyo-coral-dark px-10 py-6 shadow-2xl hover:shadow-3xl transition-all"
          >
            <Link href={`/${locale}/auth/signup`}>
              {tFinalCta('button')}
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />

      {/* Sticky Mobile CTA */}
      <StickyCta locale={locale} />
    </div>
  );
}
