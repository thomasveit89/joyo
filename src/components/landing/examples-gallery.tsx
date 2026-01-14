'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { type Example } from '@/data/examples';

interface ExamplesGalleryProps {
  locale: string;
  examples: Example[];
}

// Gallery items with image, label, positioning, and example mapping
const galleryItems = [
  {
    id: 'new-home',
    image: '/img/new-home.jpg',
    labelEn: 'New home',
    labelDe: 'Neues Zuhause',
    exampleId: 'family2', // Maps to new home example
    style: {
      left: '2%',
      top: '5%',
      rotate: '-8deg',
      zIndex: 1,
    },
  },
  {
    id: 'birthday',
    image: '/img/birthday.jpg',
    labelEn: 'Birthday',
    labelDe: 'Geburtstag',
    exampleId: 'travel2', // Maps to birthday example
    style: {
      left: '18%',
      top: '0%',
      rotate: '4deg',
      zIndex: 2,
    },
  },
  {
    id: 'city-trip',
    image: '/img/city-trip.jpg',
    labelEn: 'City trip',
    labelDe: 'Städtetrip',
    exampleId: 'travel1', // Maps to city trip example
    style: {
      left: '34%',
      top: '8%',
      rotate: '-3deg',
      zIndex: 3,
    },
  },
  {
    id: 'proposal',
    image: '/img/proposal.jpg',
    labelEn: 'Proposal',
    labelDe: 'Heiratsantrag',
    exampleId: 'romantic1', // Maps to proposal example
    style: {
      left: '50%',
      top: '2%',
      rotate: '6deg',
      zIndex: 2,
    },
  },
  {
    id: 'family',
    image: '/img/family.jpg',
    labelEn: 'Family',
    labelDe: 'Familie',
    exampleId: 'family1', // Maps to family example
    style: {
      left: '66%',
      top: '10%',
      rotate: '-5deg',
      zIndex: 1,
    },
  },
  {
    id: 'honeymoon',
    image: '/img/honeymoon.jpg',
    labelEn: 'Honeymoon',
    labelDe: 'Flitterwochen',
    exampleId: 'romantic2', // Maps to honeymoon example
    style: {
      left: '82%',
      top: '5%',
      rotate: '7deg',
      zIndex: 2,
    },
  },
];

export function ExamplesGallery({ locale, examples }: ExamplesGalleryProps) {
  const t = useTranslations('landing.examples');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Create a map of example IDs to their demo URLs
  const exampleMap = new Map(examples.map((ex) => [ex.id, ex.demoUrl]));

  return (
    <section id="examples" className="py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Mobile: Horizontal Scrolling Gallery */}
        <div className="md:hidden">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 py-4">
              {galleryItems.map((item, index) => {
                const demoUrl = exampleMap.get(item.exampleId);

                return (
                  <motion.a
                    key={item.id}
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex-shrink-0 w-[240px] transition-transform duration-300 active:scale-95"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1 * index,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {/* Card */}
                    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                      {/* Image */}
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={item.image}
                          alt={locale === 'de' ? item.labelDe : item.labelEn}
                          fill
                          className="object-cover transition-transform duration-300 group-active:scale-105"
                          sizes="240px"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-active:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Label */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                          <span className="text-sm font-semibold text-joyo-charcoal">
                            {locale === 'de' ? item.labelDe : item.labelEn}
                          </span>
                        </div>
                      </div>

                      {/* View demo button (shown on active) */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-active:opacity-100 transition-opacity duration-300">
                        <div className="bg-joyo-coral text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold whitespace-nowrap">
                          {t('viewExample')}
                        </div>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Scattered Gallery */}
        <div className="hidden md:block relative w-full h-[500px] max-w-6xl mx-auto">
          {galleryItems.map((item, index) => {
            const demoUrl = exampleMap.get(item.exampleId);

            return (
              <motion.a
                key={item.id}
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group absolute transition-all duration-300 ease-out cursor-pointer w-[260px] block"
                style={{
                  left: item.style.left,
                  top: item.style.top,
                  transform: `rotate(${item.style.rotate})`,
                  zIndex: hoveredId === item.id ? 50 : item.style.zIndex,
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.15 * index,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Card */}
                <div
                  className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
                    hoveredId === item.id ? 'scale-110' : 'scale-100'
                  }`}
                >
                    {/* Image */}
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={item.image}
                        alt={locale === 'de' ? item.labelDe : item.labelEn}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="260px"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                  {/* Label */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                      <span className="text-sm font-semibold text-joyo-charcoal">
                        {locale === 'de' ? item.labelDe : item.labelEn}
                      </span>
                    </div>
                  </div>

                  {/* View demo button (shown on hover) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-joyo-coral text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold whitespace-nowrap flex items-center gap-2">
                      {t('viewExample')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Bottom spacing for desktop */}
        <div className="h-20 hidden md:block" />
      </div>
    </section>
  );
}
