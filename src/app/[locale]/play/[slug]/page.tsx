import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Player } from '@/components/player/player';
import type { Project } from '@/types/flow';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();

  // Fetch published project by slug
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('share_slug', slug)
    .eq('published', true)
    .single();

  if (!project) {
    return {
      title: 'Gift Journey',
    };
  }

  // Fetch first node with an image for OG image
  const { data: nodes } = await supabase
    .from('nodes')
    .select('*')
    .eq('project_id', project.id)
    .order('order_index', { ascending: true });

  // Try to find first image from hero, media, or reveal nodes
  let ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/img/og-image-${locale}.png`; // Locale-specific fallback

  if (nodes && nodes.length > 0) {
    for (const node of nodes) {
      const content = node.content;
      if (content) {
        // Check for background images in hero or reveal nodes
        if ((node.type === 'hero' || node.type === 'reveal') && content.backgroundImage?.url) {
          ogImage = content.backgroundImage.url;
          break;
        }
        // Check for images in media nodes
        if (node.type === 'media' && content.image?.url) {
          ogImage = content.image.url;
          break;
        }
      }
    }
  }

  const title = project.title || (locale === 'de' ? 'Eine besondere Geschenkreise' : 'A Special Gift Journey');
  const description =
    project.description ||
    (locale === 'de'
      ? 'Jemand hat eine emotionale Geschenkreise für dich erstellt.'
      : 'Someone created an emotional gift journey for you.');

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/play/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Joyo',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'de' ? 'de_CH' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

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
