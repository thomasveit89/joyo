'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare, Sparkles, Share2 } from 'lucide-react';

interface HowItWorksProps {
  locale: string;
}

const steps = [
  {
    key: 'step1',
    icon: MessageSquare,
  },
  {
    key: 'step2',
    icon: Sparkles,
  },
  {
    key: 'step3',
    icon: Share2,
  },
];

export function HowItWorks({ locale }: HowItWorksProps) {
  const t = useTranslations('landing.howItWorks');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-joyo-cream">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-joyo-charcoal mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-joyo-charcoal/80 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                {/* Step Number & Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-joyo-coral flex items-center justify-center">
                    <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-joyo-charcoal text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-joyo-charcoal mb-3">
                  {t(`steps.${step.key}.title`)}
                </h3>
                <p className="text-joyo-charcoal/70">
                  {t(`steps.${step.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
