'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';
import { HeroScreen } from './screens/hero-screen';
import { ChoiceScreen } from './screens/choice-screen';
import { TextInputScreen } from './screens/text-input-screen';
import { RevealScreen } from './screens/reveal-screen';
import { MediaScreen } from './screens/media-screen';
import { themes } from '@/config/themes';
import { createSessionAction, updateSessionAction } from '@/app/actions/sessions';
import type { Project, Node, SessionAnswer } from '@/types/flow';

interface PlayerProps {
  project: Project;
  nodes: Node[];
}

export function Player({ project, nodes }: PlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const theme = themes[project.theme];
  const currentNode = nodes[currentIndex];
  const progress = ((currentIndex + 1) / nodes.length) * 100;

  // Extract attribution from current node based on type
  const getAttribution = (): string | null => {
    if (currentNode.type === 'hero' && currentNode.content.backgroundImage?.attribution) {
      return currentNode.content.backgroundImage.attribution;
    }
    if (currentNode.type === 'reveal' && currentNode.content.backgroundImage?.attribution) {
      return currentNode.content.backgroundImage.attribution;
    }
    if (currentNode.type === 'media' && currentNode.content.image?.attribution) {
      return currentNode.content.image.attribution;
    }
    return null;
  };

  const attribution = getAttribution();

  // Create session on mount
  useEffect(() => {
    const initSession = async () => {
      const result = await createSessionAction(project.id);
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
      }
    };
    initSession();
  }, [project.id]);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Map theme colors to Tailwind CSS variables
    const colorMap: Record<string, string> = {
      primary: '--primary',
      primaryForeground: '--primary-foreground',
      secondary: '--secondary',
      secondaryForeground: '--secondary-foreground',
      background: '--background',
      foreground: '--foreground',
      muted: '--muted',
      mutedForeground: '--muted-foreground',
      accent: '--accent',
      accentForeground: '--accent-foreground',
      card: '--card',
      cardForeground: '--card-foreground',
    };

    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = colorMap[key];
      if (cssVar) {
        root.style.setProperty(cssVar, value);
      }
    });

    // Cleanup: restore original values when component unmounts
    return () => {
      Object.values(colorMap).forEach((cssVar) => {
        root.style.removeProperty(cssVar);
      });
    };
  }, [theme]);

  const handleAnswer = (nodeId: string, answer: string | string[]) => {
    const newAnswer: SessionAnswer = {
      nodeId,
      answer,
      timestamp: new Date().toISOString(),
    };

    setAnswers([...answers, newAnswer]);

    // Auto-advance
    if (currentIndex < nodes.length - 1) {
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentIndex < nodes.length - 1) {
      setDirection('forward');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Save answers on change
  useEffect(() => {
    if (sessionId && answers.length > 0) {
      const isCompleted = currentIndex === nodes.length - 1;
      updateSessionAction(sessionId, answers, isCompleted);
    }
  }, [answers, sessionId, currentIndex, nodes.length]);

  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  const renderScreen = () => {
    switch (currentNode.type) {
      case 'hero':
        return <HeroScreen node={currentNode} onNext={handleNext} />;
      case 'choice':
        return <ChoiceScreen node={currentNode} onAnswer={handleAnswer} />;
      case 'text-input':
        return <TextInputScreen node={currentNode} onAnswer={handleAnswer} />;
      case 'reveal':
        return <RevealScreen node={currentNode} onNext={handleNext} />;
      case 'media':
        return <MediaScreen node={currentNode} onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Screen content */}
      <div className="min-h-screen flex items-center justify-center p-4 pt-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full max-w-2xl"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back Navigation */}
      {currentIndex > 0 && currentNode.type !== 'reveal' && (
        <div className="fixed bottom-8 left-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image Attribution */}
      {attribution && (
        <div className="fixed bottom-2 right-2 z-50">
          <p className="text-xs text-muted-foreground opacity-60">
            {attribution}
          </p>
        </div>
      )}
    </div>
  );
}
