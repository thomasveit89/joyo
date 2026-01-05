'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { type Example } from '@/data/examples';

interface ExamplesGalleryProps {
  locale: string;
  examples: Example[];
}

const categoryEmojis = {
  romantic: '💍',
  family: '👶',
  travel: '✈️',
  celebrations: '🎉',
};

export function ExamplesGallery({ locale, examples }: ExamplesGalleryProps) {
  const t = useTranslations('landing.examples');

  return (
    <section id="examples" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-joyo-charcoal mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-joyo-charcoal/80 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => (
            <div
              key={example.id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gradient-to-br from-joyo-peach to-joyo-cream">
                <Image
                  src={example.thumbnailUrl}
                  alt={t(`items.${example.id}.title`)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    // Fallback to placeholder gradient if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-1.5 bg-joyo-peach text-joyo-charcoal text-xs font-medium px-3 py-1 rounded-full mb-3">
                  <span>{categoryEmojis[example.category]}</span>
                  <span>{t(`categories.${example.category}`)}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-joyo-charcoal mb-2">
                  {t(`items.${example.id}.title`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-joyo-charcoal/70 mb-4 line-clamp-2">
                  {t(`items.${example.id}.description`)}
                </p>

                {/* CTA */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-joyo-coral text-joyo-coral hover:bg-joyo-coral hover:text-white transition-colors"
                >
                  <a
                    href={example.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('viewExample')}
                  </a>
                </Button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-joyo-coral/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
