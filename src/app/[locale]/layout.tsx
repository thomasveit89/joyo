import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Toaster } from "@/components/ui/sonner";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app.metadata' });

  const title = t('title');
  const description = t('description');
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${locale === 'de' ? '' : locale}`;
  const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/img/og-image-${locale}.png`;

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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
      <Toaster />
    </NextIntlClientProvider>
  );
}
