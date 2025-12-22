'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import type { TextInputNode } from '@/types/flow';

interface TextInputScreenProps {
  node: TextInputNode;
  onAnswer: (nodeId: string, answer: string) => void;
}

export function TextInputScreen({ node, onAnswer }: TextInputScreenProps) {
  const { question, placeholder, maxLength } = node.content;
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAnswer(node.id, value);
    }
  };

  return (
    <Card className="p-8 md:p-12 border-none shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight">
          {question}
        </h2>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || 'Type your answer...'}
          maxLength={maxLength}
          rows={6}
          className="resize-none text-lg"
          autoFocus
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {value.length} / {maxLength} characters
          </span>
          <Button type="submit" size="lg" disabled={!value.trim()}>
            Continue
          </Button>
        </div>
      </form>
    </Card>
  );
}
