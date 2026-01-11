'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project, Node } from '@/types/flow';

interface LivePreviewProps {
  project: Project;
  nodes: Node[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
}

export function LivePreview({
  project,
  nodes,
  currentSlideIndex,
  onSlideChange,
}: LivePreviewProps) {
  const [key, setKey] = useState(0);

  // Force re-render when currentSlideIndex changes externally (from node list click)
  useEffect(() => {
    setKey((prev: number) => prev + 1);
  }, [currentSlideIndex]);

  const handleNext = () => {
    if (currentSlideIndex < nodes.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg">
        <p className="text-muted-foreground">No screens to preview</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden">
      {/* Preview Container */}
      <div className="flex-1 bg-background rounded-xl overflow-hidden border border-border flex flex-col">
        {/* Browser chrome */}
        <div className="h-10 bg-muted/50 border-b flex items-center px-4 gap-2 flex-shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 bg-background rounded px-3 flex items-center text-xs text-muted-foreground">
              joyo.ch/{project.shareSlug || 'preview'}
            </div>
          </div>
        </div>

        {/* Content area - no scaling, let it render naturally */}
        <div className="flex-1 overflow-auto">
          <PreviewFrame
            key={key}
            project={project}
            nodes={nodes}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={onSlideChange}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentSlideIndex + 1} / {nodes.length}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentSlideIndex === nodes.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simple preview frame that shows just the current slide
function PreviewFrame({
  project,
  nodes,
  currentSlideIndex,
  onSlideChange,
}: {
  project: Project;
  nodes: Node[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
}) {
  const currentNode = nodes[currentSlideIndex];

  if (!currentNode) {
    return null;
  }

  // Dynamic imports using require (needed for preview isolation)
  const { HeroScreen } = require('@/components/player/screens/hero-screen');
  const { ChoiceScreen } = require('@/components/player/screens/choice-screen');
  const { TextInputScreen } = require('@/components/player/screens/text-input-screen');
  const { RevealScreen } = require('@/components/player/screens/reveal-screen');
  const { MediaScreen } = require('@/components/player/screens/media-screen');

  const renderScreen = () => {
    // Handler that advances to next slide (if not last)
    const handleNext = () => {
      if (currentSlideIndex < nodes.length - 1) {
        onSlideChange(currentSlideIndex + 1);
      }
    };

    switch (currentNode.type) {
      case 'hero':
        return <HeroScreen node={currentNode} onNext={handleNext} />;
      case 'choice':
        return <ChoiceScreen node={currentNode} onAnswer={handleNext} />;
      case 'text-input':
        return <TextInputScreen node={currentNode} onAnswer={handleNext} />;
      case 'reveal':
        return <RevealScreen node={currentNode} theme={project.theme} disableConfetti={true} />;
      case 'media':
        return <MediaScreen node={currentNode} onNext={handleNext} />;
      default:
        return <div className="p-8 text-center">Unknown screen type</div>;
    }
  };

  // Get theme colors as inline styles
  const { themes } = require('@/config/themes');
  const theme = themes[project.theme];

  const themeStyles = {
    '--primary': theme.colors.primary,
    '--primary-foreground': theme.colors.primaryForeground,
    '--secondary': theme.colors.secondary,
    '--secondary-foreground': theme.colors.secondaryForeground,
    '--background': theme.colors.background,
    '--foreground': theme.colors.foreground,
    '--muted': theme.colors.muted,
    '--muted-foreground': theme.colors.mutedForeground,
    '--accent': theme.colors.accent,
    '--accent-foreground': theme.colors.accentForeground,
    '--card': theme.colors.card,
    '--card-foreground': theme.colors.cardForeground,
  } as React.CSSProperties;

  return (
    <div
      className="h-[600px] flex items-center justify-center p-8 md:p-12"
      style={{
        ...themeStyles,
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
      }}
    >
      <div className="w-full max-w-2xl mx-auto transform md:scale-80">
        {renderScreen()}
      </div>
    </div>
  );
}
