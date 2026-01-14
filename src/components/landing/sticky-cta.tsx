'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface StickyCtaProps {
  locale: string;
}

export function StickyCta({ locale }: StickyCtaProps) {
  const t = useTranslations('landing.hero');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approx 600px)
      const shouldShow = window.scrollY > 600;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        >
          {/* Background with blur */}
          <div className="bg-white/95 backdrop-blur-lg border-t-2 border-joyo-coral/20 shadow-2xl">
            <div className="px-4 py-3">
              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-joyo-coral text-white hover:bg-joyo-coral-dark shadow-lg text-base font-semibold"
              >
                <Link href={`/${locale}/auth/signup`}>
                  {t('ctaPrimary')}
                </Link>
              </Button>

              {/* Micro copy */}
              <p className="text-center text-xs text-joyo-charcoal/60 mt-2">
                {t('ctaMicro').split(' • ')[0]}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
