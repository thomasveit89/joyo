import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground mb-8">{t('lastUpdated')}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('acceptance.title')}</h2>
              <p className="mb-4">{t('acceptance.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('description.title')}</h2>
              <p className="mb-4">{t('description.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('accounts.title')}</h2>
              <p className="mb-4">{t('accounts.content')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('accounts.responsibilities.accurate')}</li>
                <li>{t('accounts.responsibilities.security')}</li>
                <li>{t('accounts.responsibilities.unauthorized')}</li>
                <li>{t('accounts.responsibilities.notify')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('content.title')}</h2>
              <p className="mb-4">{t('content.ownership')}</p>
              <p className="mb-4">{t('content.responsibility')}</p>
              <p className="mb-4">{t('content.prohibited.title')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('content.prohibited.illegal')}</li>
                <li>{t('content.prohibited.harmful')}</li>
                <li>{t('content.prohibited.infringing')}</li>
                <li>{t('content.prohibited.spam')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('intellectual.title')}</h2>
              <p className="mb-4">{t('intellectual.ownership')}</p>
              <p className="mb-4">{t('intellectual.license')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('termination.title')}</h2>
              <p className="mb-4">{t('termination.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('disclaimer.title')}</h2>
              <p className="mb-4">{t('disclaimer.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('limitation.title')}</h2>
              <p className="mb-4">{t('limitation.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
              <p className="mb-4">{t('changes.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
              <p className="mb-4">{t('contact.content')}</p>
              <p className="font-medium">hi@designsnack.ch</p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t">
            <Link
              href={`/${locale}/auth/login`}
              className="text-primary hover:underline"
            >
              ← {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
