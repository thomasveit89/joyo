'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import type { MediaNode } from '@/types/flow';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface MediaScreenProps {
  node: MediaNode;
  onNext: () => void;
}

export function MediaScreen({ node, onNext }: MediaScreenProps) {
  const t = useTranslations('player.buttons');
  const { image, caption } = node.content;

  // Check if image URL is valid (not a placeholder)
  const hasValidImage = image &&
    image.url &&
    !image.url.startsWith('UNSPLASH:') &&
    image.url.startsWith('http');

  // If no valid image, skip this screen using useEffect to avoid updating during render
  useEffect(() => {
    if (!hasValidImage) {
      onNext();
    }
  }, [hasValidImage, onNext]);

  // If no valid image, show nothing (will auto-skip via useEffect)
  if (!hasValidImage) {
    return null;
  }

  return (
    <Card className="p-6 md:p-8 space-y-6 border-none">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {caption && (
        <p className="text-lg md:text-xl text-center text-muted-foreground">
          {caption}
        </p>
      )}

      <div className="text-center pt-4">
        <Button size="xl" onClick={onNext}>
          {t('continue')}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
