import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Pricing } from '@/components/landing/pricing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing.pricing' });

  return {
    title: `${t('title')} - Joyo`,
    description: t('subtitle'),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-joyo-cream">
      <Header locale={locale} />
      <Pricing locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
