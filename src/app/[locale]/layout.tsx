import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from "@/components/ui/sonner";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import "../globals.css";

export const metadata: Metadata = {
  title: "joyo - Create Emotional Gift Journeys",
  description: "Create beautiful, emotional gift experiences for proposals, announcements, surprises, and special moments.",
};

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
  if (!locales.includes(locale as any)) {
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
