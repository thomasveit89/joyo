'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Gift, Users, Heart, Shield, CreditCard, Infinity, Lock } from 'lucide-react';

interface SocialProofProps {
  locale: string;
}

const stats = [
  {
    key: 'gifts',
    icon: Gift,
    color: 'text-joyo-coral',
  },
  {
    key: 'recipients',
    icon: Users,
    color: 'text-purple-600',
  },
  {
    key: 'rating',
    icon: Heart,
    color: 'text-rose-600',
  },
];

const badges = [
  {
    key: 'free',
    icon: Infinity,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'nocard',
    icon: CreditCard,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  {
    key: 'unlimited',
    icon: Gift,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600',
  },
  {
    key: 'secure',
    icon: Lock,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-600',
  },
];

export function SocialProof({ locale }: SocialProofProps) {
  const t = useTranslations('landing.socialProof');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-joyo-cream/30">
      <div className="container mx-auto max-w-6xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-joyo-charcoal mb-2">
            {t('title')}
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} strokeWidth={2} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-joyo-charcoal mb-1">
                  {t(`stats.${stat.key}`).split(' ')[0]}
                </p>
                <p className="text-joyo-charcoal/70">
                  {t(`stats.${stat.key}`).split(' ').slice(1).join(' ')}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-8 border-t border-joyo-charcoal/10"
        >
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                className={`
                  ${badge.bgColor} ${badge.textColor}
                  rounded-full px-5 py-3
                  flex items-center gap-2
                  border-2 border-transparent hover:border-current
                  transition-all duration-300
                  shadow-sm hover:shadow-md
                `}
              >
                <Icon className={`w-4 h-4 ${badge.iconColor}`} strokeWidth={2.5} />
                <span className="font-semibold text-sm whitespace-nowrap">
                  {t(`badges.${badge.key}`)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
