'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { publishProjectAction, unpublishProjectAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import { Check, Copy, ExternalLink, Loader2, Lock } from 'lucide-react';
import { Project } from '@/types/flow';
import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm';
import { useTranslations } from 'next-intl';

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onPublished: (shareSlug: string) => void;
}

export function PublishDialog({ open, onClose, project, onPublished }: PublishDialogProps) {
  const t = useTranslations('editor.publish.dialog');
  const tToast = useTranslations('editor.publish.toast');
  const tCommon = useTranslations('common');
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);

  const shareUrl = project.shareSlug
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/play/${project.shareSlug}`
    : null;

  const handlePublish = async () => {
    setPublishing(true);

    const result = await publishProjectAction(project.id);

    if (result.success && result.shareSlug) {
      onPublished(result.shareSlug);
      toast.success(tToast('published'));
    } else {
      toast.error(result.error || tToast('publishError'));
    }

    setPublishing(false);
  };

  const handleUnpublishClick = () => {
    setShowUnpublishDialog(true);
  };

  const handleUnpublishConfirm = async () => {
    setPublishing(true);

    const result = await unpublishProjectAction(project.id);

    if (result.success) {
      toast.success(tToast('unpublished'));
      onClose();
      window.location.reload(); // Refresh to update state
    } else {
      toast.error(result.error || tToast('unpublishError'));
    }

    setPublishing(false);
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(tToast('linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewLive = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (project.published && shareUrl) {
    // Already published - show share options
    return (
      <>
        <AlertDialogConfirm
          open={showUnpublishDialog}
          onOpenChange={setShowUnpublishDialog}
          onConfirm={handleUnpublishConfirm}
          title={t('unpublishTitle')}
          description={t('unpublishDescription')}
          confirmText={t('unpublishButton')}
          cancelText={tCommon('cancel')}
          variant="destructive"
        />
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('shareTitle')}</DialogTitle>
            <DialogDescription>
              {t('shareDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={handleCopy} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleViewLive} variant="outline" className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('viewButton')}
              </Button>
              <Button onClick={handleCopy} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                {t('copyButton')}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleUnpublishClick}
                variant="destructive"
                className="w-full"
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('unpublishing')}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {t('unpublishButton')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  // Not published yet - show publish confirmation
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('publishTitle')}</DialogTitle>
          <DialogDescription>
            {t('publishDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">{t('whatHappens')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('features.shareLink')}</li>
              <li>{t('features.recipientAccess')}</li>
              <li>{t('features.editLater')}</li>
              <li>{t('features.unpublishAnytime')}</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              {t('publishTip')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={publishing}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('publishingButton')}
              </>
            ) : (
              t('publishButton')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
