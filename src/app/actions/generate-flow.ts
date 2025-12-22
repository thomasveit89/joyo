'use server';

import { createClient } from '@/lib/supabase/server';
import { generateFlowWithRetry } from '@/lib/ai/flow-generator';
import { resolveUnsplashImages } from '@/lib/media/unsplash';

export async function generateFlowAction(userPrompt: string) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in to create a gift.' };
    }

    // 2. Validate input
    if (!userPrompt || userPrompt.trim().length < 10) {
      return { error: 'Please provide a more detailed description of your gift experience.' };
    }

    if (userPrompt.length > 2000) {
      return { error: 'Description is too long. Please keep it under 2000 characters.' };
    }

    // 3. Generate flow with AI
    console.log('Generating flow for user:', user.id);
    const flowSpec = await generateFlowWithRetry(userPrompt);
    console.log('Flow generated successfully:', flowSpec.title);

    // 4. Resolve Unsplash images
    console.log('Resolving Unsplash images...');
    const flowWithImages = await resolveUnsplashImages(flowSpec);
    console.log('Images resolved successfully');

    // 5. Create project in database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: flowWithImages.title,
        description: flowWithImages.description || null,
        theme: flowWithImages.theme,
        published: false,
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Project creation error:', projectError);
      return { error: 'Failed to create project. Please try again.' };
    }

    console.log('Project created:', project.id);

    // 6. Insert nodes
    const nodesWithProjectId = flowWithImages.nodes.map((node) => ({
      project_id: project.id,
      type: node.type,
      order_index: node.orderIndex,
      content: node.content,
    }));

    const { error: nodesError } = await supabase.from('nodes').insert(nodesWithProjectId);

    if (nodesError) {
      console.error('Nodes insertion error:', nodesError);
      // Rollback: delete project
      await supabase.from('projects').delete().eq('id', project.id);
      return { error: 'Failed to create flow nodes. Please try again.' };
    }

    console.log(`${flowWithImages.nodes.length} nodes created successfully`);

    return {
      success: true,
      projectId: project.id,
      project,
    };
  } catch (error) {
    console.error('Generate flow action error:', error);
    if (error instanceof Error) {
      return {
        error: `Failed to generate flow: ${error.message}`,
      };
    }
    return {
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
