'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { generateFlowAction } from '@/app/actions/generate-flow';
import { useRouter } from 'next/navigation';
import { themes } from '@/config/themes';
import type { Theme } from '@/types/flow';
import { GenerationLoadingScreen } from './generation-loading-screen';

interface ExamplePrompt {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
  theme: Theme;
  category: 'romantic' | 'family' | 'travel' | 'celebrations';
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  // 💍 Romantic Moments (3 examples)
  {
    id: 'romantic-1',
    emoji: '💍',
    title: 'Proposal in Paris',
    prompt: 'Create a playful proposal for Sarah who loves Paris and coffee. Include 2 fun questions about our relationship. Reveal at the end that I\'m proposing and taking her to Barcelona.',
    theme: 'elegant-dark',
    category: 'romantic'
  },
  {
    id: 'romantic-2',
    emoji: '💕',
    title: 'Anniversary Surprise',
    prompt: 'Design a romantic anniversary experience for 5 years together. Include memories from each year. Ask about favorite moments. Reveal a weekend getaway surprise at the end.',
    theme: 'elegant-dark',
    category: 'romantic'
  },
  {
    id: 'romantic-3',
    emoji: '🌹',
    title: 'Love Story Journey',
    prompt: 'Create an elegant journey through our love story from first date to now. Include questions about what love means. Build up to a big romantic gesture reveal.',
    theme: 'elegant-dark',
    category: 'romantic'
  },

  // 👶 Family Announcements (3 examples)
  {
    id: 'family-1',
    emoji: '👶',
    title: 'Pregnancy Reveal',
    prompt: 'Design a pregnancy announcement for my family with 6-8 screens. Make it warm and exciting! Include fun questions about baby predictions. End with the big reveal.',
    theme: 'playful-pastel',
    category: 'family'
  },
  {
    id: 'family-2',
    emoji: '🏠',
    title: 'New Home Announcement',
    prompt: 'Build a "we\'re moving to New York" announcement for friends and family. Show pictures of the new place. Ask about visit plans. Make it exciting and personal.',
    theme: 'warm-mediterranean',
    category: 'family'
  },
  {
    id: 'family-3',
    emoji: '🎓',
    title: 'Graduation Celebration',
    prompt: 'Create a graduation announcement journey for college completion. Reflect on the journey, challenges overcome. Include family questions. End with celebration plans.',
    theme: 'minimal-zen',
    category: 'family'
  },

  // ✈️ Travel Surprises (3 examples)
  {
    id: 'travel-1',
    emoji: '✈️',
    title: 'Barcelona Trip Reveal',
    prompt: 'Make a surprise trip reveal to Barcelona for my partner. Ask questions about favorite travel memories. Build anticipation. Show beautiful Barcelona imagery. End with departure date reveal.',
    theme: 'warm-mediterranean',
    category: 'travel'
  },
  {
    id: 'travel-2',
    emoji: '🗼',
    title: 'Paris Adventure',
    prompt: 'Create an elegant Paris trip surprise for someone who dreams of visiting. Include questions about French culture interests. Reveal flights are booked for next month.',
    theme: 'elegant-dark',
    category: 'travel'
  },
  {
    id: 'travel-3',
    emoji: '🏝️',
    title: 'Island Getaway',
    prompt: 'Design a playful tropical island vacation reveal. Ask about beach vs mountain preferences. Show stunning island photos. End with resort booking confirmation.',
    theme: 'playful-pastel',
    category: 'travel'
  },

  // 🎉 Celebrations (3 examples)
  {
    id: 'celebration-1',
    emoji: '🎉',
    title: 'Birthday Surprise Party',
    prompt: 'Create a fun birthday surprise experience leading up to a party reveal. Include questions about the birthday person\'s year. Build excitement. End with party details.',
    theme: 'playful-pastel',
    category: 'celebrations'
  },
  {
    id: 'celebration-2',
    emoji: '🎊',
    title: 'Job Promotion',
    prompt: 'Design a celebration for a big promotion or career milestone. Reflect on the journey. Ask career aspiration questions. End with congratulations and celebration plans.',
    theme: 'minimal-zen',
    category: 'celebrations'
  },
  {
    id: 'celebration-3',
    emoji: '🥂',
    title: 'Retirement Journey',
    prompt: 'Create an elegant retirement celebration experience. Honor career achievements. Include reflection questions. End with exciting retirement adventure plans.',
    theme: 'elegant-dark',
    category: 'celebrations'
  }
];

const CATEGORY_CONFIG = {
  romantic: { label: 'Romantic Moments', emoji: '💍' },
  family: { label: 'Family Announcements', emoji: '👶' },
  travel: { label: 'Travel Surprises', emoji: '✈️' },
  celebrations: { label: 'Celebrations', emoji: '🎉' }
};

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Group examples by category (memoized for performance)
  const examplesByCategory = useMemo(() => ({
    romantic: EXAMPLE_PROMPTS.filter(e => e.category === 'romantic'),
    family: EXAMPLE_PROMPTS.filter(e => e.category === 'family'),
    travel: EXAMPLE_PROMPTS.filter(e => e.category === 'travel'),
    celebrations: EXAMPLE_PROMPTS.filter(e => e.category === 'celebrations')
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await generateFlowAction(input);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.success && result.projectId) {
        // Navigate to project editor
        router.push(`/dashboard/projects/${result.projectId}`);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    // Scroll to textarea and focus
    document.querySelector('textarea')?.focus();
  };

  const getThemeColors = (theme: Theme) => {
    return themes[theme].colors;
  };

  const getThemeDisplayName = (theme: Theme): string => {
    const names: Record<Theme, string> = {
      'playful-pastel': 'Playful Pastel',
      'elegant-dark': 'Elegant Dark',
      'warm-mediterranean': 'Warm Mediterranean',
      'minimal-zen': 'Minimal Zen'
    };
    return names[theme];
  };

  return (
    <>
      {/* Full-screen Loading Animation */}
      <GenerationLoadingScreen isVisible={loading} />

      <div className="min-h-screen">
        <div className="container mx-auto px-4">
          <div className="space-y-8">

            {/* Header - Compact */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Create Your Gift Experience</h1>
              </div>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Describe your gift and AI will create a beautiful journey for your recipient.
              </p>
            </div>

            {/* Chat Form - Hero Element */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your gift experience... Who's it for and what's the occasion?"
                  rows={6}
                  disabled={loading}
                  className="resize-none text-base min-h-[200px]"
                  maxLength={2000}
                />
                <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {input.length} / 2000
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating your experience...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Gift Experience
                  </>
                )}
              </Button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Examples Section - Only show when not loading */}
            {!loading && (
              <div className="space-y-8 mt-16">

                {/* Category: Romantic Moments */}
                <CategorySection
                  category="romantic"
                  examples={examplesByCategory.romantic}
                  onExampleClick={handleExampleClick}
                  getThemeColors={getThemeColors}
                  getThemeDisplayName={getThemeDisplayName}
                />

                {/* Category: Family Announcements */}
                <CategorySection
                  category="family"
                  examples={examplesByCategory.family}
                  onExampleClick={handleExampleClick}
                  getThemeColors={getThemeColors}
                  getThemeDisplayName={getThemeDisplayName}
                />

                {/* Category: Travel Surprises */}
                <CategorySection
                  category="travel"
                  examples={examplesByCategory.travel}
                  onExampleClick={handleExampleClick}
                  getThemeColors={getThemeColors}
                  getThemeDisplayName={getThemeDisplayName}
                />

                {/* Category: Celebrations */}
                <CategorySection
                  category="celebrations"
                  examples={examplesByCategory.celebrations}
                  onExampleClick={handleExampleClick}
                  getThemeColors={getThemeColors}
                  getThemeDisplayName={getThemeDisplayName}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Category Section Component
interface CategorySectionProps {
  category: keyof typeof CATEGORY_CONFIG;
  examples: ExamplePrompt[];
  onExampleClick: (prompt: string) => void;
  getThemeColors: (theme: Theme) => any;
  getThemeDisplayName: (theme: Theme) => string;
}

function CategorySection({ category, examples, onExampleClick, getThemeColors, getThemeDisplayName }: CategorySectionProps) {
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-2xl">{config.emoji}</span>
        {config.label}
      </h3>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {examples.map((example) => (
          <ExampleCard
            key={example.id}
            example={example}
            onClick={() => onExampleClick(example.prompt)}
            getThemeColors={getThemeColors}
            getThemeDisplayName={getThemeDisplayName}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {examples.map((example) => (
          <div key={example.id} className="shrink-0 w-[85%] snap-center">
            <ExampleCard
              example={example}
              onClick={() => onExampleClick(example.prompt)}
              getThemeColors={getThemeColors}
              getThemeDisplayName={getThemeDisplayName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Example Card Component
interface ExampleCardProps {
  example: ExamplePrompt;
  onClick: () => void;
  getThemeColors: (theme: Theme) => any;
  getThemeDisplayName: (theme: Theme) => string;
}

function ExampleCard({ example, onClick, getThemeColors, getThemeDisplayName }: ExampleCardProps) {
  const themeColors = getThemeColors(example.theme);

  return (
    <Card
      className="group relative overflow-hidden hover:border-primary/50 transition-all cursor-pointer h-full"
      onClick={onClick}
    >


      <div className="relative z-10 p-6 space-y-3 flex flex-col h-full">
        {/* Header */}
        <span className="text-4xl">{example.emoji}</span>

        {/* Title */}
        <h3 className="font-semibold text-sm">{example.title}</h3>

        {/* Prompt preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed grow">
          {example.prompt}
        </p>

        {/* Theme indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <div className="flex gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: themeColors.primary }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: themeColors.secondary }}
            />
          </div>
          <span className="text-xs text-muted-foreground capitalize">
            {getThemeDisplayName(example.theme)}
          </span>
        </div>
      </div>
    </Card>
  );
}
