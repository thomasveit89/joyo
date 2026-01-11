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
import { PdfPicker } from './pdf-picker';
import { useTranslations } from 'next-intl';

interface AddScreenDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  insertAtIndex?: number;
  onAdded: (node: { id: string; type: NodeType; content: unknown }) => void;
}

export function AddScreenDialog({ open, onClose, projectId, insertAtIndex, onAdded }: AddScreenDialogProps) {
  const t = useTranslations('editor.addScreen');
  const tTypes = useTranslations('editor.addScreen.types');
  const tTypeDesc = useTranslations('editor.addScreen.typeDescriptions');
  const tFields = useTranslations('editor.addScreen.fields');
  const tValidation = useTranslations('editor.addScreen.validation');
  const tButtons = useTranslations('editor.addScreen.buttons');

  const [step, setStep] = useState<'select-type' | 'fill-form'>('select-type');
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const NODE_TYPES: Array<{ type: NodeType; icon: React.ComponentType<{ className?: string }> }> = [
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

  const updateField = (field: string, value: unknown) => {
    setContent({ ...content, [field]: value });
  };

  const validateContent = (): string | null => {
    const c = content as any;
    switch (selectedType) {
      case 'hero':
        if (!c.headline?.trim()) return tValidation('headlineRequired');
        break;
      case 'choice':
        if (!c.question?.trim()) return tValidation('questionRequired');
        const validOptions = (c.options as Array<{ label: string }>)?.filter((o: any) => o.label.trim());
        if (!validOptions || validOptions.length < 2) return tValidation('minOptions');
        break;
      case 'text-input':
        if (!c.question?.trim()) return tValidation('questionRequired');
        break;
      case 'reveal':
        if (!c.headline?.trim()) return tValidation('headlineRequired');
        break;
      case 'media':
        if (!c.image?.url) return tValidation('imageRequired');
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
    // Cast to any for easier property access
    const c = content as any;

    switch (selectedType) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">{tFields('headline')}</Label>
              <Input
                id="headline"
                value={c.headline || ''}
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
                value={c.body || ''}
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
                value={c.backgroundImage}
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
                value={c.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder={tFields('questionPlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <Label>{tFields('options')}</Label>
              {(content.options as Array<{ id: string; label: string }>)?.map((option, index: number) => (
                <Input
                  key={option.id}
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...(content as any).options];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateField('options', newOptions);
                  }}
                  placeholder={tFields('optionPlaceholder', { number: index + 1 })}
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
              <Label htmlFor="question">{tFields('question')}</Label>
              <Input
                id="question"
                value={c.question || ''}
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
                value={c.placeholder || ''}
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
                value={c.headline || ''}
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
                value={c.body || ''}
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
                value={c.backgroundImage}
                onSelect={(img) => updateField('backgroundImage', img)}
              />
            </div>
            <div className="space-y-2">
              <Label>{tFields('voucherPdf')}</Label>
              <PdfPicker
                projectId={projectId}
                value={c.voucher}
                onSelect={(pdf) => updateField('voucher', pdf)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">{tFields('buttonText')}</Label>
              <Input
                id="buttonText"
                value={c.cta?.label || ''}
                onChange={(e) => updateField('cta', { ...(content as any).cta, label: e.target.value })}
                maxLength={50}
                placeholder={tFields('buttonTextPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonUrl">{tFields('buttonUrl')}</Label>
              <Input
                id="buttonUrl"
                type="url"
                value={c.cta?.url || ''}
                onChange={(e) => updateField('cta', { ...(content as any).cta, url: e.target.value })}
                placeholder={tFields('buttonUrlPlaceholder')}
              />
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
                value={c.image}
                onSelect={(img) => updateField('image', img)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">{tFields('caption')}</Label>
              <Textarea
                id="caption"
                value={c.caption || ''}
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
