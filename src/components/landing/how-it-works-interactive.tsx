'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HowItWorksInteractiveProps {
  locale: string;
}

const steps = [
  { key: 'createWithAi', image: '/img/create-with-ai.png' },
  { key: 'aiGenerating', image: '/img/ai-generating.png' },
  { key: 'editor', image: '/img/editor.png' },
  { key: 'editScreen', image: '/img/edit-screen.png' },
  { key: 'addScreen', image: '/img/add-screen.png' },
  { key: 'chooseDesign', image: '/img/choose-design.png' },
  { key: 'shareGift', image: '/img/share-gift.png' },
];

export function HowItWorksInteractive({ locale }: HowItWorksInteractiveProps) {
  const t = useTranslations('landing.howItWorksInteractive');
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToPrevious = () => {
    setActiveStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
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
          <p className="text-lg sm:text-xl text-joyo-charcoal/70 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Slideshow */}
        <div className="relative">
          {/* Image */}
          <div className="relative mb-8">
            {mounted ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Image
                    src={steps[activeStep].image}
                    alt={t(`steps.${steps[activeStep].key}.title`)}
                    width={2400}
                    height={1600}
                    quality={100}
                    unoptimized
                    className="w-full h-auto rounded-2xl"
                    priority={activeStep === 0}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <Image
                src={steps[activeStep].image}
                alt={t(`steps.${steps[activeStep].key}.title`)}
                width={2400}
                height={1600}
                quality={100}
                unoptimized
                className="w-full h-auto rounded-2xl"
                priority={activeStep === 0}
              />
            )}

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-6 h-6 text-joyo-charcoal" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
              aria-label="Next step"
            >
              <ChevronRight className="w-6 h-6 text-joyo-charcoal" />
            </button>
          </div>

          {/* Step Info */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            {mounted ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-sm font-semibold text-joyo-coral mb-2">
                    {locale === 'en' ? 'Step' : 'Schritt'} {activeStep + 1} {locale === 'en' ? 'of' : 'von'} {steps.length}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-joyo-charcoal mb-3">
                    {t(`steps.${steps[activeStep].key}.title`)}
                  </h3>
                  <p className="text-lg text-joyo-charcoal/70">
                    {t(`steps.${steps[activeStep].key}.description`)}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div>
                <div className="text-sm font-semibold text-joyo-coral mb-2">
                  {locale === 'en' ? 'Step' : 'Schritt'} {activeStep + 1} {locale === 'en' ? 'of' : 'von'} {steps.length}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-joyo-charcoal mb-3">
                  {t(`steps.${steps[activeStep].key}.title`)}
                </h3>
                <p className="text-lg text-joyo-charcoal/70">
                  {t(`steps.${steps[activeStep].key}.description`)}
                </p>
              </div>
            )}
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeStep
                    ? 'bg-joyo-coral w-8 h-2'
                    : 'bg-joyo-charcoal/20 w-2 h-2 hover:bg-joyo-charcoal/40'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
