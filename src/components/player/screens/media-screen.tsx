'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import type { MediaNode } from '@/types/flow';
import Image from 'next/image';

interface MediaScreenProps {
  node: MediaNode;
  onNext: () => void;
}

export function MediaScreen({ node, onNext }: MediaScreenProps) {
  const { image, caption } = node.content;

  return (
    <Card className="p-6 md:p-8 space-y-6 border-none shadow-2xl">
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
        <Button size="lg" onClick={onNext}>
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
