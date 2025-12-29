'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { addNodeAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import { Loader2, MessageSquare, ListChecks, TextCursorInput, Sparkles, Image as ImageIcon } from 'lucide-react';
import { NodeType } from '@/types/flow';
import { ImagePicker } from './image-picker';
import { ImageData } from '@/types/assets';

interface AddScreenDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  insertAtIndex?: number;
  onAdded: (node: any) => void;
}

const NODE_TYPES = [
  { type: 'hero' as NodeType, label: 'Hero / Story', icon: MessageSquare, description: 'Opening screen with headline and optional image' },
  { type: 'choice' as NodeType, label: 'Multiple Choice', icon: ListChecks, description: 'Question with 2-4 answer options' },
  { type: 'text-input' as NodeType, label: 'Text Input', icon: TextCursorInput, description: 'Free-form text answer from recipient' },
  { type: 'reveal' as NodeType, label: 'Big Reveal', icon: Sparkles, description: 'Surprise moment with confetti and optional CTA' },
  { type: 'media' as NodeType, label: 'Image Display', icon: ImageIcon, description: 'Full-screen image with caption' },
];

export function AddScreenDialog({ open, onClose, projectId, insertAtIndex, onAdded }: AddScreenDialogProps) {
  const [step, setStep] = useState<'select-type' | 'fill-form'>('select-type');
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [content, setContent] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const handleReset = () => {
    setStep('select-type');
    setSelectedType(null);
    setContent({});
    setSaving(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectType = (type: NodeType) => {
    setSelectedType(type);

    // Initialize content based on type
    switch (type) {
      case 'hero':
        setContent({ headline: '', body: '' });
        break;
      case 'choice':
        setContent({
          question: '',
          options: [
            { id: crypto.randomUUID(), label: '' },
            { id: crypto.randomUUID(), label: '' },
          ],
          allowMultiple: false,
        });
        break;
      case 'text-input':
        setContent({ question: '', placeholder: '', maxLength: 200 });
        break;
      case 'reveal':
        setContent({ headline: '', body: '', confetti: true });
        break;
      case 'media':
        setContent({ caption: '' });
        break;
    }

    setStep('fill-form');
  };

  const updateField = (field: string, value: any) => {
    setContent({ ...content, [field]: value });
  };

  const validateContent = (): string | null => {
    switch (selectedType) {
      case 'hero':
        if (!content.headline?.trim()) return 'Headline is required';
        break;
      case 'choice':
        if (!content.question?.trim()) return 'Question is required';
        const validOptions = content.options?.filter((o: any) => o.label.trim());
        if (!validOptions || validOptions.length < 2) return 'At least 2 options are required';
        break;
      case 'text-input':
        if (!content.question?.trim()) return 'Question is required';
        break;
      case 'reveal':
        if (!content.headline?.trim()) return 'Headline is required';
        break;
      case 'media':
        if (!content.image?.url) return 'Image is required';
        break;
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateContent();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);

    const result = await addNodeAction(projectId, selectedType!, content, insertAtIndex);

    if (result.success) {
      onAdded(result.node);
      toast.success(`Screen added ${insertAtIndex !== undefined ? `at position ${insertAtIndex + 1}` : 'at the end'}`);
      handleClose();
    } else {
      toast.error(result.error || 'Failed to add screen');
    }

    setSaving(false);
  };

  const renderForm = () => {
    if (!selectedType) return null;

    switch (selectedType) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline *</Label>
              <Input
                id="headline"
                value={content.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                maxLength={200}
                placeholder="Enter headline..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body Text</Label>
              <Textarea
                id="body"
                value={content.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Enter body text..."
              />
            </div>
            <div className="space-y-2">
              <Label>Background Image (Optional)</Label>
              <ImagePicker
                projectId={projectId}
                value={content.backgroundImage}
                onSelect={(img) => updateField('backgroundImage', img)}
              />
            </div>
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={content.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder="Enter question..."
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options (2-4 required) *</Label>
                {content.options?.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...content.options,
                        { id: crypto.randomUUID(), label: '' },
                      ];
                      updateField('options', newOptions);
                    }}
                  >
                    Add Option
                  </Button>
                )}
              </div>
              {content.options?.map((option: any, index: number) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...content.options];
                      newOptions[index] = { ...option, label: e.target.value };
                      updateField('options', newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                  />
                  {content.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = content.options.filter((_: any, i: number) => i !== index);
                        updateField('options', newOptions);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'text-input':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={content.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder="Enter question..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={content.placeholder || ''}
                onChange={(e) => updateField('placeholder', e.target.value)}
                maxLength={100}
                placeholder="Enter placeholder text..."
              />
            </div>
          </div>
        );

      case 'reveal':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline *</Label>
              <Input
                id="headline"
                value={content.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                maxLength={200}
                placeholder="Enter headline..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body Text</Label>
              <Textarea
                id="body"
                value={content.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Enter body text..."
              />
            </div>
            <div className="space-y-2">
              <Label>Background Image (Optional)</Label>
              <ImagePicker
                projectId={projectId}
                value={content.backgroundImage}
                onSelect={(img) => updateField('backgroundImage', img)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!content.cta}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateField('cta', { label: '', url: '' });
                    } else {
                      const { cta, ...rest } = content;
                      setContent(rest);
                    }
                  }}
                />
                Add Call-to-Action Button
              </Label>
              {content.cta && (
                <div className="ml-6 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ctaLabel">Button Label</Label>
                    <Input
                      id="ctaLabel"
                      value={content.cta.label || ''}
                      onChange={(e) => updateField('cta', { ...content.cta, label: e.target.value })}
                      maxLength={50}
                      placeholder="e.g., Get Your Gift"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">Button URL</Label>
                    <Input
                      id="ctaUrl"
                      type="url"
                      value={content.cta.url || ''}
                      onChange={(e) => updateField('cta', { ...content.cta, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Image *</Label>
              <ImagePicker
                projectId={projectId}
                value={content.image}
                onSelect={(img) => updateField('image', img)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                value={content.caption || ''}
                onChange={(e) => updateField('caption', e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="Enter caption..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'select-type' ? 'Add New Screen' : `Add ${NODE_TYPES.find(t => t.type === selectedType)?.label}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'select-type'
              ? 'Choose the type of screen you want to add'
              : `Fill in the details for your new screen${insertAtIndex !== undefined ? ` (will be inserted at position ${insertAtIndex + 1})` : ''}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'select-type' && (
            <div className="grid gap-3">
              {NODE_TYPES.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => handleSelectType(nodeType.type)}
                    className="flex items-start gap-4 p-4 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{nodeType.label}</h3>
                      <p className="text-sm text-muted-foreground">{nodeType.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'fill-form' && renderForm()}
        </div>

        <DialogFooter>
          {step === 'fill-form' && (
            <Button variant="outline" onClick={() => setStep('select-type')} disabled={saving}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          {step === 'fill-form' && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Screen'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
