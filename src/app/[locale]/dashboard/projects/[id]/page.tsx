import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { FlowEditor } from '@/components/editor/flow-editor';

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch nodes
  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true });

  if (nodesError) {
    console.error('Failed to fetch nodes:', nodesError);
    notFound();
  }

  // Convert snake_case to camelCase for Project interface
  const projectData = {
    id: project.id,
    userId: project.user_id,
    title: project.title,
    description: project.description,
    theme: project.theme,
    published: project.published,
    shareSlug: project.share_slug,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };

  return <FlowEditor project={projectData} nodes={nodes || []} />;
}
