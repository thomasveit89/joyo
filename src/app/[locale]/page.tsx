import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to dashboard if logged in, otherwise to login
  if (user) {
    redirect(`/${locale}/dashboard`);
  } else {
    redirect(`/${locale}/auth/login`);
  }
}
