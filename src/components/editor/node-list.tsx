'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { NodeEditor } from './node-editor';
import { deleteNodeAction, reorderNodesAction } from '@/app/actions/nodes';
import { toast } from 'sonner';

interface NodeListProps {
  nodes: any[];
  projectId: string;
  onNodesChange: (nodes: any[]) => void;
}

export function NodeList({ nodes, projectId, onNodesChange }: NodeListProps) {
  const [editingNode, setEditingNode] = useState<any | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pendingReorderRef = useRef<any[] | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDelete = async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this screen?')) return;

    setDeletingNodeId(nodeId);
    const result = await deleteNodeAction(nodeId, projectId);

    if (result.success) {
      onNodesChange(nodes.filter((n) => n.id !== nodeId));
      toast.success('Screen deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete screen');
    }
    setDeletingNodeId(null);
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
            toast.error(result.error || 'Failed to reorder screens');

            // If nodes are stale, refresh the page
            if ((result as any).needsRefresh) {
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Client: Reorder exception:', error);
          toast.error('Failed to reorder screens');
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
      case 'end':
        return '👋';
      default:
        return '📄';
    }
  };

  const getNodeLabel = (type: string) => {
    switch (type) {
      case 'hero':
        return 'Story Screen';
      case 'choice':
        return 'Choice Question';
      case 'text-input':
        return 'Text Input';
      case 'reveal':
        return 'Big Reveal';
      case 'media':
        return 'Media Screen';
      case 'end':
        return 'End Screen';
      default:
        return 'Unknown';
    }
  };

  const getNodePreview = (node: any) => {
    const content = node.content;
    if (content.headline) return content.headline;
    if (content.question) return content.question;
    return 'Untitled';
  };

  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No screens found.</p>
      </div>
    );
  }

  return (
    <>
      <Reorder.Group
        axis="y"
        values={nodes}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {nodes.map((node, index) => (
          <Reorder.Item key={node.id} value={node}>
            <Card className="p-4 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-4">
                <div className="text-muted-foreground touch-none">
                  <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
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

                <div className="flex items-center gap-2">
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
                    onClick={() => handleDelete(node.id)}
                    disabled={deletingNodeId === node.id || isDragging}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {editingNode && (
        <NodeEditor
          node={editingNode}
          open={!!editingNode}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
