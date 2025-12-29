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
import { updateNodeAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ImagePicker } from './image-picker';

interface NodeEditorProps {
  node: any;
  open: boolean;
  onClose: () => void;
  onSave: (content: any) => void;
  projectId: string;
}

export function NodeEditor({ node, open, onClose, onSave, projectId }: NodeEditorProps) {
  const [content, setContent] = useState(node.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const result = await updateNodeAction(node.id, content);

    if (result.success) {
      onSave(content);
      toast.success('Screen updated successfully');
      onClose();
    } else {
      toast.error(result.error || 'Failed to update screen');
    }

    setSaving(false);
  };

  const updateField = (field: string, value: any) => {
    setContent({ ...content, [field]: value });
  };

  const renderForm = () => {
    switch (node.type) {
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
              <Label>Background Image</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label>Options (2-4 required)</Label>
              {content.options?.map((option: any, index: number) => (
                <Input
                  key={option.id}
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...content.options];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateField('options', newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                />
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
              <Label>Background Image</Label>
              <ImagePicker
                projectId={projectId}
                value={content.backgroundImage}
                onSelect={(img) => updateField('backgroundImage', img)}
              />
            </div>
            {content.cta && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ctaLabel">CTA Button Label</Label>
                  <Input
                    id="ctaLabel"
                    value={content.cta?.label || ''}
                    onChange={(e) =>
                      updateField('cta', { ...content.cta, label: e.target.value })
                    }
                    maxLength={50}
                    placeholder="Button label..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaUrl">CTA Button URL</Label>
                  <Input
                    id="ctaUrl"
                    value={content.cta?.url || ''}
                    onChange={(e) => updateField('cta', { ...content.cta, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
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
              <Label htmlFor="caption">Caption</Label>
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
        return <p>Unknown node type</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Screen</DialogTitle>
          <DialogDescription>
            Make changes to this screen. Changes will be saved to your draft.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderForm()}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
