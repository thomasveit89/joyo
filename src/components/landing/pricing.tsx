'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingProps {
  locale: string;
}

export function Pricing({ locale }: PricingProps) {
  const t = useTranslations('landing.pricing');

  const features = [
    'unlimited',
    'ai',
    'themes',
    'images',
    'sharing',
    'support',
  ];

  const faqs = ['q1', 'q2', 'q3'];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-joyo-charcoal mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-joyo-charcoal/80 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto mb-20">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-joyo-coral p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-joyo-charcoal mb-2">
              {t('free.title')}
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-joyo-coral">
                {t('free.price')}
              </span>
              <span className="text-joyo-charcoal/60">
                {t('free.period')}
              </span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-4 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-joyo-coral/10 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-joyo-coral" strokeWidth={3} />
                </div>
                <span className="text-joyo-charcoal/80">
                  {t(`free.features.${feature}`)}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            asChild
            size="lg"
            className="w-full bg-joyo-coral text-white hover:bg-joyo-coral-dark"
          >
            <Link href={`/${locale}/auth/signup`}>{t('free.cta')}</Link>
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-joyo-charcoal text-center mb-12">
          {t('faq.title')}
        </h2>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <div key={faq}>
              <h3 className="text-lg font-semibold text-joyo-charcoal mb-2">
                {t(`faq.${faq}.question`)}
              </h3>
              <p className="text-joyo-charcoal/70">
                {t(`faq.${faq}.answer`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
