'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { themes } from '@/config/themes';
import { updateProjectThemeAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
import { Theme } from '@/types/flow';
import { useTranslations } from 'next-intl';

interface ThemeSelectorProps {
  open: boolean;
  onClose: () => void;
  currentTheme: string;
  projectId: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({
  open,
  onClose,
  currentTheme,
  projectId,
  onThemeChange,
}: ThemeSelectorProps) {
  const t = useTranslations('editor.theme.dialog');
  const tNames = useTranslations('editor.theme.names');
  const tDescriptions = useTranslations('editor.theme.descriptions');
  const tCommon = useTranslations('common');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (selectedTheme === currentTheme) {
      onClose();
      return;
    }

    setSaving(true);

    const result = await updateProjectThemeAction(projectId, selectedTheme);

    if (result.success) {
      onThemeChange(selectedTheme);
      toast.success(t('success'));
      onClose();
    } else {
      toast.error(result.error || t('error'));
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {Object.entries(themes).map(([key, theme]) => (
            <Card
              key={key}
              className={`p-4 cursor-pointer transition-all ${selectedTheme === key ? 'border border-primary' : ''
                }`}
              onClick={() => setSelectedTheme(key)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{tNames(key as any)}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tDescriptions(key as any)}</p>
                </div>
              </div>

              {/* Color palette preview */}
              <div className="grid grid-cols-4 gap-1 mt-3">
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary"
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: theme.colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="h-8 rounded border"
                  style={{ backgroundColor: theme.colors.background }}
                  title="Background"
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent"
                />
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('updating')}
              </>
            ) : (
              t('applyButton')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
