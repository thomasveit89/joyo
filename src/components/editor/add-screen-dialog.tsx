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
import { useTranslations } from 'next-intl';

interface AddScreenDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  insertAtIndex?: number;
  onAdded: (node: { id: string; type: NodeType; content: unknown }) => void;
}

const NODE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'hero': MessageSquare,
  'choice': ListChecks,
  'text-input': TextCursorInput,
  'reveal': Sparkles,
  'media': ImageIcon,
};

export function AddScreenDialog({ open, onClose, projectId, insertAtIndex, onAdded }: AddScreenDialogProps) {
  const t = useTranslations('editor.addScreen');
  const tTypes = useTranslations('editor.addScreen.types');
  const tTypeDesc = useTranslations('editor.addScreen.typeDescriptions');
  const tFields = useTranslations('editor.addScreen.fields');
  const tValidation = useTranslations('editor.addScreen.validation');
  const tButtons = useTranslations('editor.addScreen.buttons');

  const [step, setStep] = useState<'select-type' | 'fill-form'>('select-type');
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [content, setContent] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const NODE_TYPES: Array<{ type: NodeType; icon: any }> = [
    { type: 'hero' as NodeType, icon: MessageSquare },
    { type: 'choice' as NodeType, icon: ListChecks },
    { type: 'text-input' as NodeType, icon: TextCursorInput },
    { type: 'reveal' as NodeType, icon: Sparkles },
    { type: 'media' as NodeType, icon: ImageIcon },
  ];

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
        if (!content.headline?.trim()) return tValidation('headlineRequired');
        break;
      case 'choice':
        if (!content.question?.trim()) return tValidation('questionRequired');
        const validOptions = content.options?.filter((o: any) => o.label.trim());
        if (!validOptions || validOptions.length < 2) return tValidation('minOptions');
        break;
      case 'text-input':
        if (!content.question?.trim()) return tValidation('questionRequired');
        break;
      case 'reveal':
        if (!content.headline?.trim()) return tValidation('headlineRequired');
        break;
      case 'media':
        if (!content.image?.url) return tValidation('imageRequired');
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
      const successMsg = insertAtIndex !== undefined
        ? t('success', { position: insertAtIndex + 1 })
        : t('successEnd');
      toast.success(successMsg);
      handleClose();
    } else {
      toast.error(result.error || t('error'));
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
              <Label htmlFor="headline">{tFields('headline')}</Label>
              <Input
                id="headline"
                value={content.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                maxLength={200}
                placeholder={tFields('headlinePlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">{tFields('body')}</Label>
              <Textarea
                id="body"
                value={content.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={tFields('bodyPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{tFields('backgroundImage')}</Label>
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
              <Label htmlFor="question">{tFields('question')}</Label>
              <Input
                id="question"
                value={content.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder={tFields('questionPlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{tFields('options')}</Label>
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
                    {tFields('addOption')}
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
                    placeholder={tFields('optionPlaceholder', { number: index + 1 })}
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
                      {tFields('remove')}
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
              <Label htmlFor="question">{tFields('question')}</Label>
              <Input
                id="question"
                value={content.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder={tFields('questionPlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeholder">{tFields('placeholder')}</Label>
              <Input
                id="placeholder"
                value={content.placeholder || ''}
                onChange={(e) => updateField('placeholder', e.target.value)}
                maxLength={100}
                placeholder={tFields('placeholderPlaceholder')}
              />
            </div>
          </div>
        );

      case 'reveal':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">{tFields('headline')}</Label>
              <Input
                id="headline"
                value={content.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                maxLength={200}
                placeholder={tFields('headlinePlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">{tFields('body')}</Label>
              <Textarea
                id="body"
                value={content.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={tFields('bodyPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{tFields('backgroundImage')}</Label>
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
                {tFields('addCta')}
              </Label>
              {content.cta && (
                <div className="ml-6 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ctaLabel">{tFields('ctaLabel')}</Label>
                    <Input
                      id="ctaLabel"
                      value={content.cta.label || ''}
                      onChange={(e) => updateField('cta', { ...content.cta, label: e.target.value })}
                      maxLength={50}
                      placeholder={tFields('ctaLabelPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">{tFields('ctaUrl')}</Label>
                    <Input
                      id="ctaUrl"
                      type="url"
                      value={content.cta.url || ''}
                      onChange={(e) => updateField('cta', { ...content.cta, url: e.target.value })}
                      placeholder={tFields('ctaUrlPlaceholder')}
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
              <Label>{tFields('image')}</Label>
              <ImagePicker
                projectId={projectId}
                value={content.image}
                onSelect={(img) => updateField('image', img)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">{tFields('caption')}</Label>
              <Textarea
                id="caption"
                value={content.caption || ''}
                onChange={(e) => updateField('caption', e.target.value)}
                maxLength={200}
                rows={2}
                placeholder={tFields('captionPlaceholder')}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    if (step === 'select-type') {
      return t('title');
    }
    const typeLabel = tTypes(selectedType as string);
    return t('titleWithType', { type: typeLabel });
  };

  const getDialogDescription = () => {
    if (step === 'select-type') {
      return t('description');
    }
    if (insertAtIndex !== undefined) {
      return t('descriptionWithPosition', { position: insertAtIndex + 1 });
    }
    return t('descriptionWithoutPosition');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'select-type' && (
            <div className="grid gap-3">
              {NODE_TYPES.map((nodeType) => {
                const Icon = nodeType.icon;
                const typeKey = nodeType.type === 'text-input' ? 'textInput' : nodeType.type;
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
                      <h3 className="font-semibold mb-1">{tTypes(typeKey)}</h3>
                      <p className="text-sm text-muted-foreground">{tTypeDesc(typeKey)}</p>
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
              {tButtons('back')}
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            {tButtons('cancel')}
          </Button>
          {step === 'fill-form' && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tButtons('adding')}
                </>
              ) : (
                tButtons('add')
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
