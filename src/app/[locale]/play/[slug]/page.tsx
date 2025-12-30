import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Player } from '@/components/player/player';
import type { Project } from '@/types/flow';

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch published project by slug
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('share_slug', slug)
    .eq('published', true)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch nodes
  const { data: nodes } = await supabase
    .from('nodes')
    .select('*')
    .eq('project_id', project.id)
    .order('order_index', { ascending: true });

  if (!nodes || nodes.length === 0) {
    notFound();
  }

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

  return <Player project={projectData} nodes={nodes} />;
}
