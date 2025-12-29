'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NodeType, NodeSchema } from '@/types/flow';

export async function updateNodeAction(nodeId: string, content: any) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
      .from('nodes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', nodeId);

    if (error) {
      console.error('Update node error:', error);
      return { error: 'Failed to update node' };
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

    const { error } = await supabase.from('nodes').delete().eq('id', nodeId);

    if (error) {
      console.error('Delete node error:', error);
      return { error: 'Failed to delete node' };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete node action error:', error);
    return { error: 'An unexpected error occurred' };
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
  content: any,
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
      // Append to end
      targetOrderIndex = nodeCount;
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
      return { error: 'Failed to create node' };
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
