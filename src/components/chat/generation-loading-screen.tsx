'use client';

import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTranslations } from 'next-intl';

interface GenerationLoadingScreenProps {
  isVisible: boolean;
}

const STAGE_DURATIONS = [4000, 5000, 4000, 5000, 3000];

export function GenerationLoadingScreen({ isVisible }: GenerationLoadingScreenProps) {
  const t = useTranslations('chat.loading');
  const [currentStage, setCurrentStage] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Get translated stage texts
  const loadingStages = [
    t('stages.stage1'),
    t('stages.stage2'),
    t('stages.stage3'),
    t('stages.stage4'),
    t('stages.stage5'),
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const cycleStages = () => {
      const stageDuration = STAGE_DURATIONS[currentIndex];

      // Fade out current text
      setFadeIn(false);

      setTimeout(() => {
        // Update to next stage
        currentIndex = (currentIndex + 1) % loadingStages.length;
        setCurrentStage(currentIndex);

        // Fade in new text
        setFadeIn(true);

        // Schedule next transition
        timeoutId = setTimeout(cycleStages, stageDuration);
      }, 300);
    };

    // Start the cycle
    timeoutId = setTimeout(cycleStages, STAGE_DURATIONS[0]);

    return () => clearTimeout(timeoutId);
  }, [isVisible, loadingStages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-8 max-w-md mx-auto px-4">

        {/* Lottie Animation */}
        <div className="w-64 h-64">
          <DotLottieReact
            src="/animations/joyo-loading.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h2
            className={`text-2xl font-semibold transition-opacity duration-300 ${
              fadeIn ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {loadingStages[currentStage]}
          </h2>

          <p className="text-sm text-muted-foreground max-w-sm">
            {t('subtitle')}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {loadingStages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentStage
                  ? 'bg-primary w-8'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
