'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { RevealNode } from '@/types/flow';
import Image from 'next/image';

interface RevealScreenProps {
  node: RevealNode;
  onNext: () => void;
}

export function RevealScreen({ node, onNext }: RevealScreenProps) {
  const { headline, body, cta, confetti: showConfetti, backgroundImage } = node.content;
  const [revealed, setRevealed] = useState(false);

  // Check if image URL is valid (not a placeholder)
  const hasValidImage = backgroundImage &&
    backgroundImage.url &&
    !backgroundImage.url.startsWith('UNSPLASH:') &&
    backgroundImage.url.startsWith('http');

  useEffect(() => {
    setTimeout(() => {
      setRevealed(true);
      if (showConfetti) {
        // Trigger confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);
      }
    }, 300);
  }, [showConfetti]);

  return (
    <Card
      className="relative overflow-hidden min-h-[500px] flex flex-col justify-center border-none"
    >
      {hasValidImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={backgroundImage.url}
              alt={backgroundImage.alt}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      <div className="relative z-10 p-8 md:p-12 text-center space-y-6">
        <h1
          className={`text-4xl md:text-6xl lg:text-7xl font-bold transition-all duration-700 ${
            revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ color: hasValidImage ? 'white' : undefined }}
        >
          {headline}
        </h1>

        {body && (
          <p
            className={`text-xl md:text-2xl max-w-2xl mx-auto transition-all duration-700 delay-300 ${
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: hasValidImage ? 'rgba(255,255,255,0.95)' : undefined }}
          >
            {body}
          </p>
        )}

        <div
          className={`flex flex-col items-center gap-4 transition-all duration-700 delay-500 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {cta && (
            <Button size="lg" asChild>
              <a href={cta.url} target="_blank" rel="noopener noreferrer">
                {cta.label}
              </a>
            </Button>
          )}
          <Button variant={cta ? 'outline' : 'default'} size="lg" onClick={onNext}>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
