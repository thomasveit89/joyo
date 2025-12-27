'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Settings, Share2, MoreVertical, Trash2 } from 'lucide-react';
import { NodeList } from './node-list';
import { ThemeSelector } from './theme-selector';
import { PublishDialog } from './publish-dialog';
import { deleteProjectAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import type { Project } from '@/types/flow';

interface FlowEditorProps {
  project: Project;
  nodes: any[];
}

export function FlowEditor({ project: initialProject, nodes: initialNodes }: FlowEditorProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [nodes, setNodes] = useState(initialNodes);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/preview/${project.id}`, '_blank');
  };

  const handleThemeChange = (newTheme: string) => {
    setProject({ ...project, theme: newTheme as any });
  };

  const handlePublished = (shareSlug: string) => {
    setProject({ ...project, published: true, shareSlug });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    const result = await deleteProjectAction(project.id);

    if (result.success) {
      toast.success('Project deleted successfully');
      router.push('/dashboard');
    } else {
      toast.error(result.error || 'Failed to delete project');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            {project.published ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="warning">Draft</Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="capitalize">
              {project.theme.replace('-', ' ')}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{nodes.length} screens</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowThemeSelector(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Theme
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={() => setShowPublishDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            {project.published ? 'Share' : 'Publish'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={deleting}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Gift
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Node List */}
      <Card>
        <CardHeader>
          <CardTitle>Flow Screens ({nodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <NodeList nodes={nodes} projectId={project.id} onNodesChange={setNodes} />
        </CardContent>
      </Card>

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
  );
}
