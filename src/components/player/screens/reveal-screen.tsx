'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { RevealNode } from '@/types/flow';
import type { Theme } from '@/types/flow';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface RevealScreenProps {
  node: RevealNode;
  onNext: () => void;
  theme?: Theme;
  disableConfetti?: boolean;
}

// Theme-aware confetti configurations
const CONFETTI_CONFIGS = {
  'playful-pastel': {
    colors: ['#ff9a9e', '#a29bfe', '#74b9ff', '#fd79a8', '#fdcb6e'],
    particleCount: 100,
    gravity: 0.6,
  },
  'elegant-dark': {
    colors: ['#8b5cf6', '#d4af37', '#ffffff', '#a78bfa', '#fbbf24'],
    particleCount: 150,
    gravity: 0.4,
  },
  'warm-mediterranean': {
    colors: ['#f87171', '#06b6d4', '#fbbf24', '#fb923c', '#34d399'],
    particleCount: 120,
    gravity: 0.5,
  },
  'minimal-zen': {
    colors: ['#1f1f1f', '#6b7280', '#d1d5db', '#9ca3af'],
    particleCount: 80,
    gravity: 0.5,
  },
};

export function RevealScreen({ node, onNext, theme = 'playful-pastel', disableConfetti = false }: RevealScreenProps) {
  const t = useTranslations('player.buttons');
  const { headline, body, cta, confetti: showConfetti, backgroundImage, voucher } = node.content;
  const [revealed, setRevealed] = useState(false);

  // Check if image URL is valid (not a placeholder)
  const hasValidImage = backgroundImage &&
    backgroundImage.url &&
    !backgroundImage.url.startsWith('UNSPLASH:') &&
    backgroundImage.url.startsWith('http');

  // Check if voucher is valid
  const hasValidVoucher = voucher &&
    voucher.url &&
    !voucher.url.startsWith('UNSPLASH:') &&
    voucher.url.startsWith('http');

  // Check if voucher is a PDF
  const isPdfVoucher = hasValidVoucher && voucher.url.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    // Enhanced reveal sequence with better timing
    const revealTimeout = setTimeout(() => {
      setRevealed(true);
    }, 100);

    if (showConfetti && !disableConfetti) {
      const confettiConfig = CONFETTI_CONFIGS[theme];

      // Phase 1: Initial burst after a brief delay
      const phase1 = setTimeout(() => {
        confetti({
          particleCount: confettiConfig.particleCount,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: confettiConfig.colors,
          gravity: confettiConfig.gravity,
          ticks: 80,
          startVelocity: 45,
        });
      }, 500);

      // Phase 2: Side bursts for celebration
      const phase2 = setTimeout(() => {
        confetti({
          particleCount: confettiConfig.particleCount * 0.6,
          spread: 70,
          origin: { x: 0.2, y: 0.6 },
          colors: confettiConfig.colors,
          gravity: confettiConfig.gravity,
          angle: 60,
        });
        confetti({
          particleCount: confettiConfig.particleCount * 0.6,
          spread: 70,
          origin: { x: 0.8, y: 0.6 },
          colors: confettiConfig.colors,
          gravity: confettiConfig.gravity,
          angle: 120,
        });
      }, 800);

      // Phase 3: Continuous celebration
      const duration = 2500;
      const animationEnd = Date.now() + duration;

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = (confettiConfig.particleCount * 0.3) * (timeLeft / duration);
        confetti({
          particleCount,
          spread: 60,
          origin: { x: randomInRange(0.3, 0.7), y: 0 },
          colors: confettiConfig.colors,
          gravity: confettiConfig.gravity,
          ticks: 50,
        });
      }, 300);

      return () => {
        clearTimeout(revealTimeout);
        clearTimeout(phase1);
        clearTimeout(phase2);
        clearInterval(interval);
      };
    }

    return () => {
      clearTimeout(revealTimeout);
    };
  }, [showConfetti, theme]);

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
              className="object-cover animate-kenBurns"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/70" />
        </>
      )}

      <div className="relative z-10 p-8 md:p-12 text-center space-y-8">
        <h1
          className={`text-4xl md:text-6xl lg:text-7xl font-bold transition-all duration-1000 ease-out ${
            revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{
            color: hasValidImage ? 'white' : undefined,
            transitionDelay: '800ms',
          }}
        >
          {headline}
        </h1>

        {body && (
          <p
            className={`text-xl md:text-2xl max-w-2xl mx-auto transition-all duration-700 ease-out ${
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              color: hasValidImage ? 'rgba(255,255,255,0.95)' : undefined,
              transitionDelay: '1500ms',
            }}
          >
            {body}
          </p>
        )}

        <div
          className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '2200ms' }}
        >
          {hasValidVoucher && (
            <div className="w-full max-w-md space-y-3">
              {isPdfVoucher ? (
                <Button size="xl" asChild className="w-full shadow-lg">
                  <a href={voucher.url} download target="_blank" rel="noopener noreferrer">
                    {t('downloadVoucher')}
                  </a>
                </Button>
              ) : (
                <a href={voucher.url} download target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <Image
                      src={voucher.url}
                      alt={voucher.alt || 'Voucher'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </a>
              )}
            </div>
          )}
          {cta && cta.label && cta.url && (
            <Button size="xl" asChild className="shadow-lg">
              <a href={cta.url} target="_blank" rel="noopener noreferrer">
                {cta.label}
              </a>
            </Button>
          )}
          <Button
            variant={cta?.label ? 'outline' : 'default'}
            size="xl"
            onClick={onNext}
            className={hasValidImage ? 'bg-white/10 hover:bg-white/20 text-white border-white/30' : ''}
          >
            {t('continue')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
