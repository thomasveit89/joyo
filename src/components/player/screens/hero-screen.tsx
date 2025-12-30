'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import type { HeroNode } from '@/types/flow';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface HeroScreenProps {
  node: HeroNode;
  onNext: () => void;
}

export function HeroScreen({ node, onNext }: HeroScreenProps) {
  const t = useTranslations('player.buttons');
  const { headline, body, backgroundImage } = node.content;

  // Check if image URL is valid (not a placeholder)
  const hasValidImage = backgroundImage &&
    backgroundImage.url &&
    !backgroundImage.url.startsWith('UNSPLASH:') &&
    backgroundImage.url.startsWith('http');

  return (
    <Card className="relative overflow-hidden min-h-[400px] flex flex-col justify-center border-none bg-card text-card-foreground"
    >
      {hasValidImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={backgroundImage.url}
              alt={backgroundImage.alt}
              fill
              className="object-cover animate-kenBurns"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/60" />
        </>
      )}

      <div className="relative z-10 p-8 md:p-12 text-center space-y-6">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          style={{ color: hasValidImage ? 'white' : undefined }}
        >
          {headline}
        </h1>

        {body && (
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed"
            style={{ color: hasValidImage ? 'rgba(255,255,255,0.9)' : undefined }}
          >
            {body}
          </p>
        )}

        <Button size="xl" onClick={onNext} className="mt-4">
          {t('continue')}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
