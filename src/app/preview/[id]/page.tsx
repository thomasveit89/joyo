import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Player } from '@/components/player/player';
import type { Project } from '@/types/flow';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch project (must be owned by user)
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) notFound();

  // Fetch nodes
  const { data: nodes } = await supabase
    .from('nodes')
    .select('*')
    .eq('project_id', id)
    .order('order_index', { ascending: true });

  if (!nodes || nodes.length === 0) notFound();

  // Convert snake_case to camelCase for Project interface
  const projectData: Project = {
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

  return (
    <>
      <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-medium">
        Preview Mode
      </div>
      <Player project={projectData} nodes={nodes} />
    </>
  );
}
