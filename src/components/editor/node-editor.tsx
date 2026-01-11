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
import { PdfPicker } from './pdf-picker';
import { useTranslations } from 'next-intl';

interface NodeEditorProps {
  node: any;
  open: boolean;
  onClose: () => void;
  onSave: (content: any) => void;
  projectId: string;
}

export function NodeEditor({ node, open, onClose, onSave, projectId }: NodeEditorProps) {
  const t = useTranslations('editor.nodeEditor');
  const tCommon = useTranslations('common');
  const [content, setContent] = useState(node.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const result = await updateNodeAction(node.id, content);

    if (result.success) {
      onSave(content);
      toast.success(t('success'));
      onClose();
    } else {
      toast.error(result.error || t('error'));
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
              <Label htmlFor="headline">{t('labels.headlineRequired')}</Label>
              <Input
                id="headline"
                value={content.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                maxLength={200}
                placeholder={t('placeholders.headline')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">{t('labels.body')}</Label>
              <Textarea
                id="body"
                value={content.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={t('placeholders.body')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.backgroundImage')}</Label>
              <ImagePicker
                projectId={projectId}
                value={content.backgroundImage}
                onSelect={(img) => updateField('backgroundImage', img)}
              />
            </div>
          </div>
        );

      case 'choice':
        // Ensure we always have 4 option slots
        const choiceOptions = content.options || [];
        const optionSlots = [0, 1, 2, 3].map(index =>
          choiceOptions[index] || { id: `option-${index + 1}`, label: '' }
        );

        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">{t('labels.questionRequired')}</Label>
              <Input
                id="question"
                value={content.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder={t('placeholders.question')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.optionsRequired')}</Label>
              {optionSlots.map((option: any, index: number) => (
                <Input
                  key={`option-${index}`}
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...optionSlots];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateField('options', newOptions);
                  }}
                  placeholder={`${t('placeholders.option')} ${index + 1}`}
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
              <Label htmlFor="question">{t('labels.questionRequired')}</Label>
              <Input
                id="question"
                value={content.question || ''}
                onChange={(e) => updateField('question', e.target.value)}
                maxLength={200}
                placeholder={t('placeholders.question')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeholder">{t('labels.placeholder')}</Label>
              <Input
                id="placeholder"
                value={content.placeholder || ''}
                onChange={(e) => updateField('placeholder', e.target.value)}
                maxLength={100}
                placeholder={t('placeholders.textInput')}
              />
            </div>
          </div>
        );

      case 'reveal':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">{t('labels.headlineRequired')}</Label>
              <Input
                id="headline"
                value={content.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                maxLength={200}
                placeholder={t('placeholders.headline')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">{t('labels.body')}</Label>
              <Textarea
                id="body"
                value={content.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={t('placeholders.body')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.backgroundImage')}</Label>
              <ImagePicker
                projectId={projectId}
                value={content.backgroundImage}
                onSelect={(img) => updateField('backgroundImage', img)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.voucherPdf')}</Label>
              <PdfPicker
                projectId={projectId}
                value={content.voucher}
                onSelect={(pdf) => updateField('voucher', pdf)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">{t('labels.buttonText')}</Label>
              <Input
                id="buttonText"
                value={content.cta?.label || ''}
                onChange={(e) =>
                  updateField('cta', { ...content.cta, label: e.target.value })
                }
                maxLength={50}
                placeholder={t('placeholders.buttonText')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonUrl">{t('labels.buttonUrl')}</Label>
              <Input
                id="buttonUrl"
                value={content.cta?.url || ''}
                onChange={(e) => updateField('cta', { ...content.cta, url: e.target.value })}
                placeholder={t('placeholders.buttonUrl')}
              />
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('labels.imageRequired')}</Label>
              <ImagePicker
                projectId={projectId}
                value={content.image}
                onSelect={(img) => updateField('image', img)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">{t('labels.caption')}</Label>
              <Textarea
                id="caption"
                value={content.caption || ''}
                onChange={(e) => updateField('caption', e.target.value)}
                maxLength={200}
                rows={2}
                placeholder={t('placeholders.caption')}
              />
            </div>
          </div>
        );

      default:
        return <p>{t('unknownType')}</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderForm()}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttons.saving')}
              </>
            ) : (
              t('buttons.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
