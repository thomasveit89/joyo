'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingBoxProps {
  locale: string;
}

const features = [
  'landing.features.items.unlimited.title',
  'landing.features.items.ai.title',
  'landing.features.items.themes.title',
  'landing.features.items.images.title',
  'landing.features.items.sharing.title',
  'landing.features.items.nocreditcard.title',
];

export function PricingBox({ locale }: PricingBoxProps) {
  const t = useTranslations('landing.pricingBox');
  const tFeatures = useTranslations();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-joyo-coral/20 via-joyo-peach/20 to-joyo-coral/20 rounded-3xl blur-2xl opacity-60" />

          {/* Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-joyo-coral/20 border-2 border-joyo-coral/20 overflow-hidden">
            {/* Badge */}
            <div className="absolute top-6 right-6">
              <motion.div
                initial={{ rotate: -12 }}
                animate={{ rotate: [-12, -8, -12] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg"
              >
                <span className="font-bold text-sm flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {t('badge')}
                </span>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10">
              {/* Title */}
              <h3 className="text-2xl font-bold text-joyo-charcoal mb-3">
                {t('title')}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-joyo-coral">
                    {t('price')}
                  </span>
                  <span className="text-xl text-joyo-charcoal/60">
                    / {t('period')}
                  </span>
                </div>
                <p className="text-joyo-charcoal/70 mt-2">
                  {t('subtitle')}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-joyo-coral/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-joyo-coral" strokeWidth={3} />
                    </div>
                    <span className="text-joyo-charcoal/80">
                      {tFeatures(feature)}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-joyo-coral text-white text-lg hover:bg-joyo-coral-dark shadow-lg hover:shadow-xl transition-all"
              >
                <Link href={`/${locale}/auth/signup`}>
                  {t('cta')}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
