'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { NodeEditor } from './node-editor';
import { AddScreenDialog } from './add-screen-dialog';
import { deleteNodeAction, reorderNodesAction } from '@/app/actions/nodes';
import { toast } from 'sonner';
import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm';
import { useTranslations } from 'next-intl';

interface NodeListProps {
  nodes: any[];
  projectId: string;
  onNodesChange: (nodes: any[]) => void;
  currentSlideIndex?: number;
  onSlideClick?: (index: number) => void;
}

export function NodeList({ nodes, projectId, onNodesChange, currentSlideIndex, onSlideClick }: NodeListProps) {
  const t = useTranslations('editor.nodeList');
  const tTypes = useTranslations('editor.nodeTypes');
  const tCommon = useTranslations('common');
  const [editingNode, setEditingNode] = useState<any | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | undefined>(undefined);
  const pendingReorderRef = useRef<any[] | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDeleteClick = (nodeId: string) => {
    setNodeToDelete(nodeId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!nodeToDelete) return;

    setDeletingNodeId(nodeToDelete);
    const result = await deleteNodeAction(nodeToDelete, projectId);

    if (result.success) {
      onNodesChange(nodes.filter((n) => n.id !== nodeToDelete));
      toast.success(t('deleteSuccess'));
    } else {
      toast.error(result.error || t('deleteError'));
    }
    setDeletingNodeId(null);
    setNodeToDelete(null);
  };

  const handleEdit = (node: any) => {
    setEditingNode(node);
  };

  const handleSaveEdit = (updatedContent: any) => {
    onNodesChange(
      nodes.map((n) => (n.id === editingNode.id ? { ...n, content: updatedContent } : n))
    );
    setEditingNode(null);
  };

  const handleAddClick = (index?: number) => {
    setInsertAtIndex(index);
    setShowAddDialog(true);
  };

  const handleNodeAdded = (newNode: any) => {
    const insertIndex = insertAtIndex ?? nodes.length;
    const newNodes = [...nodes];
    newNodes.splice(insertIndex, 0, { ...newNode, orderIndex: insertIndex });

    // Recalculate order indices
    const reindexedNodes = newNodes.map((node, idx) => ({
      ...node,
      orderIndex: idx,
    }));

    onNodesChange(reindexedNodes);
  };

  const handleReorder = (newNodes: any[]) => {
    // Update UI immediately for smooth interaction
    onNodesChange(newNodes);

    // Store the pending reorder with the original nodes for potential revert
    pendingReorderRef.current = newNodes;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a timeout to save after dragging stops
    saveTimeoutRef.current = setTimeout(async () => {
      if (pendingReorderRef.current) {
        const nodeIds = pendingReorderRef.current.map((n) => n.id);

        console.log('Client: Reordering nodes', {
          count: nodeIds.length,
          nodeIds,
          projectId,
        });

        try {
          const result = await reorderNodesAction(projectId, nodeIds);

          if (result.success) {
            // Success - no need to show toast for this routine action
            console.log('Client: Nodes reordered successfully');
          } else {
            // Show error and log details
            console.error('Client: Reorder failed:', result.error);
            toast.error(result.error || t('reorderError'));

            // If nodes are stale, refresh the page
            if ((result as any).needsRefresh) {
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Client: Reorder exception:', error);
          toast.error(t('reorderError'));
        }

        pendingReorderRef.current = null;
      }
    }, 500); // Wait 500ms after last drag movement
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'hero':
        return '🎭';
      case 'choice':
        return '🔀';
      case 'text-input':
        return '✍️';
      case 'reveal':
        return '🎉';
      case 'media':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getNodeLabel = (type: string) => {
    switch (type) {
      case 'hero':
        return tTypes('hero');
      case 'choice':
        return tTypes('choice');
      case 'text-input':
        return tTypes('textInput');
      case 'reveal':
        return tTypes('reveal');
      case 'media':
        return tTypes('media');
      default:
        return tTypes('end');
    }
  };

  const getNodePreview = (node: any) => {
    const content = node.content;
    if (content.headline) return content.headline;
    if (content.question) return content.question;
    if (content.caption) return content.caption;
    if (content.image?.alt) return content.image.alt;
    return 'Untitled';
  };

  if (nodes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('addFirstScreen')}</p>
        </div>
        <Button onClick={() => handleAddClick()} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t('addFirstScreen')}
        </Button>
        <AddScreenDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          projectId={projectId}
          insertAtIndex={insertAtIndex}
          onAdded={handleNodeAdded}
        />
      </div>
    );
  }

  return (
    <>
      <AlertDialogConfirm
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        confirmText={tCommon('delete')}
        cancelText={tCommon('cancel')}
        variant="destructive"
      />

      <div className="space-y-2">
        {/* Add Screen button at the top */}
        <Button onClick={() => handleAddClick()} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t('addScreen')}
        </Button>

        <Reorder.Group
          axis="y"
          values={nodes}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {nodes.map((node, index) => {
            const isActive = currentSlideIndex === index;
            return (
              <Reorder.Item key={node.id} value={node}>
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gray-100 border border-gray-300'
                      : 'hover:bg-gray-100/50 hover:border-gray-200'
                  }`}
                  onClick={() => onSlideClick?.(index)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="text-muted-foreground touch-none cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getNodeIcon(node.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {getNodeLabel(node.type)}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{getNodePreview(node)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(node)}
                        disabled={isDragging}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(node.id)}
                        disabled={deletingNodeId === node.id || isDragging}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {editingNode && (
        <NodeEditor
          node={editingNode}
          open={!!editingNode}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveEdit}
          projectId={projectId}
        />
      )}

      <AddScreenDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        projectId={projectId}
        insertAtIndex={insertAtIndex}
        onAdded={handleNodeAdded}
      />
    </>
  );
}
