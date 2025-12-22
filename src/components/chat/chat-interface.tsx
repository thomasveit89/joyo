'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { generateFlowAction } from '@/app/actions/generate-flow';
import { useRouter } from 'next/navigation';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const examplePrompts = [
    'Create a playful proposal for Sarah who loves Paris and coffee. Include 2 fun questions and reveal at the end.',
    'Design a pregnancy announcement for my family with 6-8 screens. Make it warm and exciting!',
    'Make a surprise trip reveal to Barcelona. Ask questions about favorite travel memories.',
    "Build a 'we're moving to New York' announcement with photos and personal touches.",
  ];

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
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-primary" />
          Create Your Gift Experience
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Describe your gift and AI will create a beautiful, emotional journey for your
          recipient. Be as detailed as you like!
        </p>
      </div>

      {/* Example prompts */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Try an example or write your own:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.map((prompt, i) => (
            <Card
              key={i}
              className="p-4 cursor-pointer hover:border-primary hover:shadow-sm transition-all group"
              onClick={() => handleExampleClick(prompt)}
            >
              <p className="text-sm group-hover:text-primary transition-colors">
                {prompt}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your gift experience in detail...

For example: 'Create a romantic proposal for Alex. We met in Tokyo and both love Japanese culture. Include 8 screens with questions about our relationship. Ask about favorite memories. Reveal at the end that I'm taking them back to Tokyo and proposing at the same café where we met. Make it elegant and emotional.'

The more details you provide, the better the experience will be!"
            rows={10}
            disabled={loading}
            className="resize-none text-base"
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {input.length} / 2000
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-base"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating your experience...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Generate Gift Experience
            </>
          )}
        </Button>
      </form>

      {/* Help text */}
      {loading && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Creating your personalized gift experience...
          </p>
          <p className="text-xs text-muted-foreground">
            This usually takes 15-30 seconds. We're generating content, selecting themes, and finding perfect images.
          </p>
        </div>
      )}

      {!loading && (
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Tips for best results:</p>
          <ul className="text-xs space-y-1 max-w-md mx-auto text-left list-disc list-inside">
            <li>Include the recipient's name and what they love</li>
            <li>Mention the occasion (proposal, announcement, surprise, etc.)</li>
            <li>Specify how many screens you want (4-12 recommended)</li>
            <li>Describe the emotional tone (playful, romantic, elegant, etc.)</li>
            <li>Add personal details that make it unique</li>
          </ul>
        </div>
      )}
    </div>
  );
}
