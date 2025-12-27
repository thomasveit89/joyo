'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ChoiceNode } from '@/types/flow';
import { Check } from 'lucide-react';

interface ChoiceScreenProps {
  node: ChoiceNode;
  onAnswer: (nodeId: string, answer: string | string[]) => void;
}

export function ChoiceScreen({ node, onAnswer }: ChoiceScreenProps) {
  const { question, options, allowMultiple } = node.content;
  const [selected, setSelected] = useState<string[]>([]);

  const handleOptionClick = (optionId: string) => {
    if (allowMultiple) {
      if (selected.includes(optionId)) {
        setSelected(selected.filter((id) => id !== optionId));
      } else {
        setSelected([...selected, optionId]);
      }
    } else {
      // Single choice - auto submit
      onAnswer(node.id, optionId);
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      onAnswer(node.id, selected);
    }
  };

  return (
    <Card className="p-8 md:p-12 space-y-8 border-none">
      <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight">
        {question}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <Button
              key={option.id}
              variant={isSelected ? 'default' : 'outline'}
              size="lg"
              className="h-auto min-h-[4rem] py-4 px-6 text-lg font-medium relative whitespace-normal text-left"
              onClick={() => handleOptionClick(option.id)}
            >
              <span className={allowMultiple ? 'pr-8' : ''}>
                {option.label}
              </span>
              {allowMultiple && isSelected && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 flex-shrink-0" />
              )}
            </Button>
          );
        })}
      </div>

      {allowMultiple && selected.length > 0 && (
        <div className="text-center pt-4">
          <Button size="lg" onClick={handleSubmit} className="min-w-[200px]">
            Continue ({selected.length} selected)
          </Button>
        </div>
      )}
    </Card>
  );
}
