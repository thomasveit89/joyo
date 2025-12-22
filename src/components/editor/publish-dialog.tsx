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

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onPublished: (shareSlug: string) => void;
}

export function PublishDialog({ open, onClose, project, onPublished }: PublishDialogProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = project.shareSlug
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/play/${project.shareSlug}`
    : null;

  const handlePublish = async () => {
    setPublishing(true);

    const result = await publishProjectAction(project.id);

    if (result.success && result.shareSlug) {
      onPublished(result.shareSlug);
      toast.success('Gift published successfully!');
    } else {
      toast.error(result.error || 'Failed to publish gift');
    }

    setPublishing(false);
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this gift? The link will stop working.')) {
      return;
    }

    setPublishing(true);

    const result = await unpublishProjectAction(project.id);

    if (result.success) {
      toast.success('Gift unpublished successfully');
      onClose();
      window.location.reload(); // Refresh to update state
    } else {
      toast.error(result.error || 'Failed to unpublish gift');
    }

    setPublishing(false);
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
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
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Gift</DialogTitle>
            <DialogDescription>
              Your gift is live! Share this link with your recipient.
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
                View Live
              </Button>
              <Button onClick={handleCopy} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleUnpublish}
                variant="destructive"
                className="w-full"
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unpublishing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Unpublish Gift
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not published yet - show publish confirmation
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Your Gift?</DialogTitle>
          <DialogDescription>
            Once published, you'll get a unique link to share with your recipient.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">What happens when you publish:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>A unique shareable link is created</li>
              <li>Your recipient can view the experience</li>
              <li>You can still edit and update the content</li>
              <li>You can unpublish at any time</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Preview your gift before publishing to make sure everything looks perfect!
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={publishing}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Gift'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
