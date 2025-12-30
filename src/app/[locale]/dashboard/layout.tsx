import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/nav';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 container mx-auto py-8 px-4 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
