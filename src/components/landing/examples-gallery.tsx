'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { type Example } from '@/data/examples';

interface ExamplesGalleryProps {
  locale: string;
  examples: Example[];
}

// Gallery items with image, label, and positioning
const galleryItems = [
  {
    id: 'new-home',
    image: '/img/new-home.jpg',
    labelEn: 'New home',
    labelDe: 'Neues Zuhause',
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

  return (
    <section id="examples" className="py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Scattered Gallery */}
        <div className="relative w-full h-[500px] max-w-6xl mx-auto">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="absolute transition-all duration-300 ease-out cursor-pointer w-[260px]"
              style={{
                left: item.style.left,
                top: item.style.top,
                transform: `rotate(${item.style.rotate})`,
                zIndex: hoveredId === item.id ? 50 : item.style.zIndex,
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Card */}
              <div
                className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${hoveredId === item.id ? 'scale-110' : 'scale-100'
                  }`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.image}
                    alt={locale === 'de' ? item.labelDe : item.labelEn}
                    fill
                    className="object-cover"
                    sizes="260px"
                  />
                </div>

                {/* Label */}
                <div className="absolute top-3 left-3">
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <span className="text-sm font-medium text-joyo-charcoal">
                      {locale === 'de' ? item.labelDe : item.labelEn}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom spacing for mobile */}
        <div className="h-20" />
      </div>
    </section>
  );
}
