import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  const tStatus = await getTranslations({ locale, namespace: 'dashboard.status' });
  const tMetadata = await getTranslations({ locale, namespace: 'dashboard.metadata' });
  const dateLocale = locale === 'de' ? de : enUS;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  // Get node counts for each project
  const projectsWithCounts = projects
    ? await Promise.all(
      projects.map(async (project) => {
        const { count } = await supabase
          .from('nodes')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        return { ...project, nodeCount: count || 0 };
      })
    )
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <Link href={`/${locale}/dashboard/new`}>
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            {t('createNew')}
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projectsWithCounts && projectsWithCounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithCounts.map((project) => (
            <Link key={project.id} href={`/${locale}/dashboard/projects/${project.id}`}>
              <Card className="hover:bg-gray-100/50 hover:border-gray-200 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{project.title}</CardTitle>
                    {project.published ? (
                      <Badge variant="success" className="shrink-0">
                        {tStatus('published')}
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="shrink-0">
                        {tStatus('draft')}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || tMetadata('noDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{project.nodeCount}</span> {tMetadata('screens')}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{project.theme.replace('-', ' ')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tMetadata('created')} {formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: dateLocale })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-2">{t('emptyState.title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t('emptyState.description')}
            </p>
            <Link href={`/${locale}/dashboard/new`}>
              <Button size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                {t('createFirst')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
