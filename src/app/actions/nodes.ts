'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NodeType, NodeSchema } from '@/types/flow';

export async function updateNodeAction(nodeId: string, content: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Get the old node content to check for replaced images
    const { data: oldNode, error: fetchError } = await supabase
      .from('nodes')
      .select('content, project_id')
      .eq('id', nodeId)
      .single();

    if (fetchError) {
      console.error('Update node: Failed to fetch node', fetchError);
      return { error: 'Failed to fetch node' };
    }

    // Collect old assetIds that were replaced (uploaded images only)
    const replacedAssetIds = new Set<string>();
    if (oldNode?.content) {
      const oldContent = oldNode.content;
      // Check if backgroundImage was replaced
      if (oldContent.backgroundImage?.assetId && oldContent.backgroundImage?.source === 'upload') {
        if (content.backgroundImage?.assetId !== oldContent.backgroundImage.assetId) {
          replacedAssetIds.add(oldContent.backgroundImage.assetId);
        }
      }
      // Check if image was replaced
      if (oldContent.image?.assetId && oldContent.image?.source === 'upload') {
        if (content.image?.assetId !== oldContent.image.assetId) {
          replacedAssetIds.add(oldContent.image.assetId);
        }
      }
    }

    // Update the node
    const { error } = await supabase
      .from('nodes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', nodeId);

    if (error) {
      console.error('Update node error:', error);
      return { error: 'Failed to update node' };
    }

    // Clean up replaced assets
    for (const assetId of replacedAssetIds) {
      await cleanupOrphanedAsset(supabase, assetId, oldNode.project_id, user.id);
    }

    return { success: true };
  } catch (error) {
    console.error('Update node action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteNodeAction(nodeId: string, projectId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // First, get the node to check for uploaded images
    const { data: nodeToDelete, error: fetchError } = await supabase
      .from('nodes')
      .select('content')
      .eq('id', nodeId)
      .single();

    if (fetchError) {
      console.error('Delete node: Failed to fetch node', fetchError);
      return { error: 'Failed to fetch node' };
    }

    // Collect all assetIds from this node's content (uploaded images only)
    const assetIds = new Set<string>();
    if (nodeToDelete?.content) {
      const content = nodeToDelete.content;
      // Check common image fields
      if (content.backgroundImage?.assetId && content.backgroundImage?.source === 'upload') {
        assetIds.add(content.backgroundImage.assetId);
      }
      if (content.image?.assetId && content.image?.source === 'upload') {
        assetIds.add(content.image.assetId);
      }
    }

    // Delete the node
    const { error } = await supabase.from('nodes').delete().eq('id', nodeId);

    if (error) {
      console.error('Delete node error:', error);
      return { error: 'Failed to delete node' };
    }

    // Clean up orphaned assets (uploaded images only)
    for (const assetId of assetIds) {
      await cleanupOrphanedAsset(supabase, assetId, projectId, user.id);
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete node action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

// Helper function to check if an asset is still referenced and delete if orphaned
async function cleanupOrphanedAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assetId: string,
  projectId: string,
  userId: string
) {
  try {
    // Get all nodes in this project
    const { data: allNodes, error: fetchError } = await supabase
      .from('nodes')
      .select('content')
      .eq('project_id', projectId);

    if (fetchError) {
      console.error('Cleanup: Failed to fetch nodes', fetchError);
      return;
    }

    // Check if any node still references this assetId
    const isStillReferenced = allNodes?.some((node: { content?: Record<string, unknown> }) => {
      const content = node.content;
      return (
        content?.backgroundImage?.assetId === assetId ||
        content?.image?.assetId === assetId
      );
    });

    if (isStillReferenced) {
      console.log(`Asset ${assetId} is still referenced, keeping it`);
      return;
    }

    // Asset is orphaned, safe to delete
    console.log(`Asset ${assetId} is orphaned, deleting...`);

    // Get asset metadata to find storage path
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('storage_path, storage_bucket')
      .eq('id', assetId)
      .eq('user_id', userId)
      .single();

    if (assetError || !asset) {
      console.error('Cleanup: Failed to fetch asset', assetError);
      return;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(asset.storage_bucket)
      .remove([asset.storage_path]);

    if (storageError) {
      console.error('Cleanup: Failed to delete from storage', storageError);
      // Continue to delete from database even if storage fails
    }

    // Delete from assets table
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Cleanup: Failed to delete asset record', deleteError);
    } else {
      console.log(`Asset ${assetId} deleted successfully`);
    }
  } catch (error) {
    console.error('Cleanup asset error:', error);
    // Don't throw - cleanup is best-effort
  }
}

export async function updateProjectThemeAction(projectId: string, theme: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
      .from('projects')
      .update({ theme, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update theme error:', error);
      return { error: 'Failed to update theme' };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Update theme action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function publishProjectAction(projectId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { data: project, error } = await supabase
      .from('projects')
      .update({ published: true, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !project) {
      console.error('Publish error:', error);
      return { error: 'Failed to publish project' };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath('/dashboard');

    return { success: true, shareSlug: project.share_slug };
  } catch (error) {
    console.error('Publish project action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function unpublishProjectAction(projectId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
      .from('projects')
      .update({ published: false, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Unpublish error:', error);
      return { error: 'Failed to unpublish project' };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Unpublish project action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Get all assets for this project before deleting
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, storage_path, storage_bucket')
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (assetsError) {
      console.error('Delete project: Failed to fetch assets', assetsError);
      // Continue with project deletion even if we can't fetch assets
    }

    // Delete project (cascade will delete nodes and sessions)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete project error:', error);
      return { error: 'Failed to delete project' };
    }

    // Clean up all assets from storage
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from(asset.storage_bucket)
          .remove([asset.storage_path]);

        if (storageError) {
          console.error(`Failed to delete asset ${asset.id} from storage:`, storageError);
          // Continue with other assets
        }

        // Delete from assets table
        const { error: deleteError } = await supabase
          .from('assets')
          .delete()
          .eq('id', asset.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error(`Failed to delete asset ${asset.id} from database:`, deleteError);
        }
      }
      console.log(`Deleted ${assets.length} assets for project ${projectId}`);
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete project action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function addNodeAction(
  projectId: string,
  nodeType: NodeType,
  content: Record<string, unknown>,
  insertAtIndex?: number
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Add node: Project not found or unauthorized', projectError);
      return { error: 'Unauthorized' };
    }

    // Validate node content with Zod schema
    try {
      // Create a temporary node object for validation
      const tempNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        orderIndex: 0,
        content,
      };
      NodeSchema.parse(tempNode);
    } catch (validationError) {
      console.error('Add node: Validation error', validationError);
      return { error: 'Invalid node content' };
    }

    // Fetch current nodes to determine order
    const { data: existingNodes, error: fetchError } = await supabase
      .from('nodes')
      .select('id, order_index')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('Add node: Failed to fetch existing nodes', fetchError);
      return { error: 'Failed to fetch nodes' };
    }

    const nodeCount = existingNodes?.length || 0;

    // Determine target order_index
    let targetOrderIndex: number;

    if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= nodeCount) {
      // Insert at specific position
      targetOrderIndex = insertAtIndex;

      // If inserting (not appending), need to shift existing nodes
      if (insertAtIndex < nodeCount) {
        console.log(`Inserting node at index ${insertAtIndex}, shifting ${nodeCount - insertAtIndex} nodes`);

        // Step 1: Move nodes at/after insert position to negative indices
        for (let i = insertAtIndex; i < nodeCount; i++) {
          const nodeToShift = existingNodes[i];
          const { error } = await supabase
            .from('nodes')
            .update({ order_index: -(i + 1), updated_at: new Date().toISOString() })
            .eq('id', nodeToShift.id)
            .eq('project_id', projectId);

          if (error) {
            console.error(`Shift prep ${i} error:`, error);
            return { error: 'Failed to prepare node insertion' };
          }
        }

        // Step 2: Move them to their final positions (shifted by +1)
        for (let i = insertAtIndex; i < nodeCount; i++) {
          const nodeToShift = existingNodes[i];
          const { error } = await supabase
            .from('nodes')
            .update({ order_index: i + 1, updated_at: new Date().toISOString() })
            .eq('id', nodeToShift.id)
            .eq('project_id', projectId);

          if (error) {
            console.error(`Shift node ${i} error:`, error);
            return { error: 'Failed to shift nodes' };
          }
        }
      }
    } else {
      // Append to end - use max order_index + 1 to avoid conflicts
      const maxOrderIndex = existingNodes && existingNodes.length > 0
        ? Math.max(...existingNodes.map(n => n.order_index))
        : -1;
      targetOrderIndex = maxOrderIndex + 1;
    }

    // Insert new node
    const { data: newNode, error: insertError } = await supabase
      .from('nodes')
      .insert({
        project_id: projectId,
        type: nodeType,
        order_index: targetOrderIndex,
        content,
      })
      .select()
      .single();

    if (insertError || !newNode) {
      console.error('Add node: Insert error', insertError);
      console.error('Add node: Insert details', { projectId, nodeType, targetOrderIndex, content });
      return { error: `Failed to create node: ${insertError?.message || 'Unknown error'}` };
    }

    console.log(`Node added successfully at index ${targetOrderIndex}`);
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/editor/${projectId}`);

    return {
      success: true,
      node: {
        id: newNode.id,
        type: newNode.type as NodeType,
        orderIndex: newNode.order_index,
        content: newNode.content,
      }
    };
  } catch (error) {
    console.error('Add node action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function reorderNodesAction(
  projectId: string,
  nodeIds: string[]
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Reorder: No user');
      return { error: 'Unauthorized' };
    }

    // Verify project ownership first
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Reorder: Project not found or unauthorized', projectError);
      return { error: 'Unauthorized' };
    }

    // Fetch current nodes from database to verify they all exist
    const { data: existingNodes, error: fetchError } = await supabase
      .from('nodes')
      .select('id')
      .eq('project_id', projectId);

    if (fetchError) {
      console.error('Reorder: Failed to fetch nodes', fetchError);
      return { error: 'Failed to verify nodes' };
    }

    const existingNodeIds = new Set(existingNodes?.map(n => n.id) || []);
    const invalidNodeIds = nodeIds.filter(id => !existingNodeIds.has(id));

    if (invalidNodeIds.length > 0) {
      console.error('Reorder: Invalid node IDs detected:', invalidNodeIds);
      return {
        error: 'Some nodes no longer exist. Please refresh the page.',
        needsRefresh: true
      };
    }

    console.log(`Reordering ${nodeIds.length} nodes for project ${projectId}`);

    // Step 1: Set all nodes to negative order_index to avoid unique constraint conflicts
    // This temporarily "moves them out of the way"
    for (let i = 0; i < nodeIds.length; i++) {
      const { error } = await supabase
        .from('nodes')
        .update({ order_index: -(i + 1), updated_at: new Date().toISOString() })
        .eq('id', nodeIds[i])
        .eq('project_id', projectId);

      if (error) {
        console.error(`Reorder prep ${i} error:`, error);
        return { error: 'Failed to prepare reorder' };
      }
    }

    // Step 2: Now set them to their final positive order_index
    for (let i = 0; i < nodeIds.length; i++) {
      const { error, data } = await supabase
        .from('nodes')
        .update({ order_index: i, updated_at: new Date().toISOString() })
        .eq('id', nodeIds[i])
        .eq('project_id', projectId)
        .select();

      if (error) {
        console.error(`Reorder node ${i} error:`, error, 'nodeId:', nodeIds[i]);
        return { error: `Failed to reorder node ${i + 1}` };
      }

      if (!data || data.length === 0) {
        console.error(`Reorder node ${i}: No rows updated`, 'nodeId:', nodeIds[i]);
        return { error: `Node ${i + 1} not found` };
      }
    }

    console.log('Reorder completed successfully');
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Reorder nodes action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
