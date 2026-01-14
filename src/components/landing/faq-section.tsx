'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  locale: string;
}

const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

export function FaqSection({ locale }: FaqSectionProps) {
  const t = useTranslations('landing.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-joyo-cream/20">
      <div className="container mx-auto max-w-4xl">
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
          <p className="text-lg sm:text-xl text-joyo-charcoal/70">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white rounded-2xl border-2 border-joyo-charcoal/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Question Button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 sm:px-8 py-6 flex items-start justify-between gap-4 text-left hover:bg-joyo-cream/20 transition-colors"
                >
                  <span className="font-bold text-joyo-charcoal text-lg sm:text-xl pr-4">
                    {t(`items.${faq}.question`)}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-joyo-coral/10 flex items-center justify-center"
                  >
                    <ChevronDown className="w-5 h-5 text-joyo-coral" strokeWidth={2.5} />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.25, ease: 'easeInOut' },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-8 pb-6 pt-2">
                        <p className="text-joyo-charcoal/80 leading-relaxed">
                          {t(`items.${faq}.answer`)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
