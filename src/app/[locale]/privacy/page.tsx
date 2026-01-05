import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { BackButton } from '@/components/ui/back-button';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  return (
    <div className="min-h-screen bg-joyo-cream">
      <Header locale={locale} />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground mb-8">{t('lastUpdated')}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('introduction.title')}</h2>
              <p className="mb-4">{t('introduction.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('dataCollection.title')}</h2>
              <p className="mb-4">{t('dataCollection.content')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('dataCollection.types.account')}</li>
                <li>{t('dataCollection.types.content')}</li>
                <li>{t('dataCollection.types.usage')}</li>
                <li>{t('dataCollection.types.technical')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('dataUse.title')}</h2>
              <p className="mb-4">{t('dataUse.content')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('dataUse.purposes.service')}</li>
                <li>{t('dataUse.purposes.improvement')}</li>
                <li>{t('dataUse.purposes.communication')}</li>
                <li>{t('dataUse.purposes.security')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('dataSharing.title')}</h2>
              <p className="mb-4">{t('dataSharing.content')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('dataSharing.parties.providers')}</li>
                <li>{t('dataSharing.parties.legal')}</li>
                <li>{t('dataSharing.parties.business')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('dataSecurity.title')}</h2>
              <p className="mb-4">{t('dataSecurity.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
              <p className="mb-4">{t('cookies.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('thirdParty.title')}</h2>
              <p className="mb-4">{t('thirdParty.content')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('thirdParty.services.supabase')}</li>
                <li>{t('thirdParty.services.google')}</li>
                <li>{t('thirdParty.services.anthropic')}</li>
                <li>{t('thirdParty.services.unsplash')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('userRights.title')}</h2>
              <p className="mb-4">{t('userRights.content')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('userRights.rights.access')}</li>
                <li>{t('userRights.rights.correction')}</li>
                <li>{t('userRights.rights.deletion')}</li>
                <li>{t('userRights.rights.portability')}</li>
                <li>{t('userRights.rights.withdraw')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('dataRetention.title')}</h2>
              <p className="mb-4">{t('dataRetention.content')}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('children.title')}</h2>
              <p className="mb-4">{t('children.content')}</p>
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
            <BackButton className="text-joyo-coral hover:underline">
              ← {t('backToLogin')}
            </BackButton>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
