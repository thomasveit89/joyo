import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    title: locale === 'en' ? 'For Business - Joyo' : 'Für Unternehmen - Joyo',
    description:
      locale === 'en'
        ? 'Joyo for Business - White-label gift experiences for your customers'
        : 'Joyo für Unternehmen - White-Label Geschenkerlebnisse für Ihre Kunden',
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-joyo-cream">
      <Header locale={locale} />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-joyo-charcoal mb-6">
            {locale === 'en' ? 'Joyo for Business' : 'Joyo für Unternehmen'}
          </h1>
          <p className="text-xl text-joyo-charcoal/80 mb-8">
            {locale === 'en'
              ? 'Create branded gift experiences for your customers, employees, and partners.'
              : 'Erschaffe gebrandete Geschenkerlebnisse für Ihre Kunden, Mitarbeiter und Partner.'}
          </p>
          <p className="text-lg text-joyo-charcoal/60 mb-12">
            {locale === 'en'
              ? 'Coming soon. Get notified when we launch business features including white-label solutions, bulk creation, and custom branding.'
              : 'Bald verfügbar. Werden Sie benachrichtigt, wenn wir Geschäftsfunktionen einschließlich White-Label-Lösungen, Massen-Erstellung und individuellem Branding starten.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-joyo-coral hover:bg-joyo-coral-dark text-white"
            >
              <Link href={`/${locale}/auth/signup`}>
                {locale === 'en' ? 'Start Free Today' : 'Heute kostenlos starten'}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
