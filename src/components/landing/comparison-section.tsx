'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

interface ComparisonSectionProps {
  locale: string;
}

const comparisonItems = [
  { traditional: 'card', joyo: 'interactive' },
  { traditional: 'moment', joyo: 'lasting' },
  { traditional: 'generic', joyo: 'personalized' },
  { traditional: 'limited', joyo: 'emotional' },
  { traditional: 'forgotten', joyo: 'unforgettable' },
];

export function ComparisonSection({ locale }: ComparisonSectionProps) {
  const t = useTranslations('landing.comparison');

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-joyo-cream/30 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-joyo-coral/30 to-transparent" />

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-joyo-charcoal mb-4">
            {t('title')}
          </h2>
          <p className="text-lg sm:text-xl text-joyo-charcoal/70 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl shadow-joyo-coral/10 overflow-hidden border border-joyo-charcoal/5"
        >
          {/* Headers */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-joyo-cream/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-3">
                <X className="w-6 h-6 text-gray-500" strokeWidth={2.5} />
              </div>
              <p className="font-bold text-gray-700 text-sm sm:text-base">
                {t('traditional.label')}
              </p>
            </div>

            <div className="flex items-center justify-center px-4">
              <ArrowRight className="w-8 h-8 text-joyo-coral hidden sm:block" strokeWidth={2} />
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-joyo-coral mb-3">
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <p className="font-bold text-joyo-coral text-sm sm:text-base">
                {t('joyo.label')}
              </p>
            </div>
          </div>

          {/* Comparison Items */}
          <div className="divide-y divide-joyo-charcoal/5">
            {comparisonItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="grid grid-cols-[1fr,auto,1fr] gap-4 p-6 sm:p-8 hover:bg-joyo-cream/10 transition-colors"
              >
                {/* Traditional */}
                <div className="flex items-center justify-center text-center">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 hidden sm:block" strokeWidth={2} />
                    <p className="text-gray-600 text-sm sm:text-base">
                      {t(`traditional.items.${item.traditional}`)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center px-2 sm:px-4">
                  <div className="w-px h-full bg-joyo-charcoal/10" />
                </div>

                {/* Joyo */}
                <div className="flex items-center justify-center text-center">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-joyo-coral flex-shrink-0 hidden sm:block" strokeWidth={2.5} />
                    <p className="text-joyo-charcoal font-semibold text-sm sm:text-base">
                      {t(`joyo.items.${item.joyo}`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom highlight */}
          <div className="bg-gradient-to-r from-joyo-coral/5 via-joyo-peach/5 to-joyo-coral/5 p-6 sm:p-8 text-center">
            <p className="text-joyo-charcoal/70 text-sm sm:text-base">
              ✨ {locale === 'en' ? 'All features, completely free—no credit card required' : 'Alle Funktionen, komplett kostenlos—keine Kreditkarte erforderlich'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
