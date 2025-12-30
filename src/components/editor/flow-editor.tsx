'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Settings, Share2, MoreVertical, Trash2 } from 'lucide-react';
import { NodeList } from './node-list';
import { LivePreview } from './live-preview';
import { ThemeSelector } from './theme-selector';
import { PublishDialog } from './publish-dialog';
import { deleteProjectAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import type { Project, Node } from '@/types/flow';
import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm';

interface FlowEditorProps {
  project: Project;
  nodes: Node[];
}

export function FlowEditor({ project: initialProject, nodes: initialNodes }: FlowEditorProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('editor');
  const tStatus = useTranslations('editor.status');
  const tFlow = useTranslations('editor.flowEditor');
  const tToolbar = useTranslations('editor.toolbar');
  const tDelete = useTranslations('editor.deleteConfirm');

  const [project, setProject] = useState(initialProject);
  const [nodes, setNodes] = useState(initialNodes);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/${locale}/preview/${project.id}`, '_blank');
  };

  const handleThemeChange = (newTheme: string) => {
    setProject({ ...project, theme: newTheme as 'playful-pastel' | 'elegant-dark' | 'warm-mediterranean' | 'minimal-zen' });
  };

  const handlePublished = (shareSlug: string) => {
    setProject({ ...project, published: true, shareSlug });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const result = await deleteProjectAction(project.id);

    if (result.success) {
      toast.success(tFlow('deleteSuccess'));
      router.push(`/${locale}/dashboard`);
    } else {
      toast.error(result.error || tFlow('deleteError'));
      setDeleting(false);
    }
  };

  return (
    <>
      <AlertDialogConfirm
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={tDelete('title')}
        description={tDelete('description')}
        confirmText={tDelete('confirm')}
        cancelText={tDelete('cancel')}
        variant="destructive"
      />

      <div className="flex flex-col h-full">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            {project.published ? (
              <Badge variant="success">{tStatus('published')}</Badge>
            ) : (
              <Badge variant="warning">{tStatus('draft')}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="capitalize">
              {project.theme.replace('-', ' ')}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{nodes.length} {tFlow('screens')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowThemeSelector(true)}>
            <Settings className="mr-2 h-4 w-4" />
            {tToolbar('theme')}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            {tToolbar('fullPreview')}
          </Button>
          <Button size="sm" onClick={() => setShowPublishDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            {project.published ? tToolbar('share') : tToolbar('publish')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={deleting}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {tToolbar('deleteGift')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Split Screen: Node List + Live Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 pt-6 overflow-hidden">
        {/* Left: Node List (1/3) */}
        <div className="flex flex-col overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{tFlow('screensList', { count: nodes.length })}</h2>
            <p className="text-sm text-muted-foreground">{tFlow('clickToPreview')}</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <NodeList
              nodes={nodes}
              projectId={project.id}
              onNodesChange={setNodes}
              currentSlideIndex={currentSlideIndex}
              onSlideClick={setCurrentSlideIndex}
            />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col overflow-hidden border-l pl-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{tFlow('livePreview')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('header.screenCount', { current: currentSlideIndex + 1, total: nodes.length })}
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <LivePreview
              project={project}
              nodes={nodes}
              currentSlideIndex={currentSlideIndex}
              onSlideChange={setCurrentSlideIndex}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ThemeSelector
        open={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
        currentTheme={project.theme}
        projectId={project.id}
        onThemeChange={handleThemeChange}
      />

      <PublishDialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        project={project}
        onPublished={handlePublished}
      />
      </div>
    </>
  );
}
