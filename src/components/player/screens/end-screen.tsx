'use client';

import { Card } from '@/components/ui/card';
import type { EndNode } from '@/types/flow';

interface EndScreenProps {
  node: EndNode;
  projectId: string;
}

export function EndScreen({ node }: EndScreenProps) {
  const { headline, body, sharePrompt } = node.content;

  return (
    <Card className="p-8 md:p-12 text-center space-y-6 border-none shadow-2xl">
      <div className="space-y-6">
        <div className="text-6xl">🎉</div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {headline}
        </h1>

        {body && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {body}
          </p>
        )}

        {sharePrompt && (
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">{sharePrompt}</p>
          </div>
        )}

        <div className="pt-8">
          <p className="text-xs text-muted-foreground">
            Created with{' '}
            <span className="font-medium">Experience Builder</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
