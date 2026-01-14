'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, Infinity, Palette, Images, Share2, CreditCard } from 'lucide-react';

interface FeaturesSectionProps {
  locale: string;
}

const features = [
  {
    key: 'ai',
    icon: Sparkles,
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200/50',
  },
  {
    key: 'unlimited',
    icon: Infinity,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200/50',
  },
  {
    key: 'themes',
    icon: Palette,
    gradient: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200/50',
  },
  {
    key: 'images',
    icon: Images,
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200/50',
  },
  {
    key: 'sharing',
    icon: Share2,
    gradient: 'from-indigo-500/20 to-purple-500/20',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/50',
  },
  {
    key: 'nocreditcard',
    icon: CreditCard,
    gradient: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-200/50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function FeaturesSection({ locale }: FeaturesSectionProps) {
  const t = useTranslations('landing.features');

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative element */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-joyo-peach/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-joyo-coral/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl">
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
          <p className="text-lg sm:text-xl text-joyo-charcoal/70 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                {/* Card */}
                <div
                  className={`
                    relative h-full bg-white rounded-2xl border-2 ${feature.borderColor}
                    p-8 transition-all duration-300
                    hover:shadow-2xl hover:shadow-joyo-coral/10
                  `}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`
                      absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient}
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    `}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`
                        w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient}
                        flex items-center justify-center mb-5
                        group-hover:scale-110 transition-transform duration-300
                      `}
                    >
                      <Icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={2} />
                    </div>

                    {/* Text */}
                    <h3 className="text-xl font-bold text-joyo-charcoal mb-3">
                      {t(`items.${feature.key}.title`)}
                    </h3>
                    <p className="text-joyo-charcoal/70 leading-relaxed">
                      {t(`items.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
