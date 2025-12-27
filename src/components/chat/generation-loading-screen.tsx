'use client';

import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface GenerationLoadingScreenProps {
  isVisible: boolean;
}

const LOADING_STAGES = [
  { text: 'Shaping your story', duration: 4000 },
  { text: 'Finding perfect visuals', duration: 5000 },
  { text: 'Selecting the right theme', duration: 4000 },
  { text: 'Crafting magical moments', duration: 5000 },
  { text: 'Almost there', duration: 3000 }
];

export function GenerationLoadingScreen({ isVisible }: GenerationLoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const cycleStages = () => {
      const stage = LOADING_STAGES[currentIndex];

      // Fade out current text
      setFadeIn(false);

      setTimeout(() => {
        // Update to next stage
        currentIndex = (currentIndex + 1) % LOADING_STAGES.length;
        setCurrentStage(currentIndex);

        // Fade in new text
        setFadeIn(true);

        // Schedule next transition
        timeoutId = setTimeout(cycleStages, stage.duration);
      }, 300);
    };

    // Start the cycle
    timeoutId = setTimeout(cycleStages, LOADING_STAGES[0].duration);

    return () => clearTimeout(timeoutId);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-8 max-w-md mx-auto px-4">

        {/* Lottie Animation */}
        <div className="w-64 h-64">
          <DotLottieReact
            src="/animations/lazy_cat.lottie"
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
            {LOADING_STAGES[currentStage].text}
          </h2>

          <p className="text-sm text-muted-foreground max-w-sm">
            Creating your personalized gift experience. This usually takes 15-30 seconds.
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {LOADING_STAGES.map((_, index) => (
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

        {/* Optional: Animated gradient ring */}
        <div className="relative w-32 h-1 bg-muted rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
