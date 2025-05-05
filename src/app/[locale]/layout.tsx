import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AuthProvider from "@/components/providers/AuthProvider";
import '../globals.css';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
                <NextIntlClientProvider>
                    <Navigation />
                    <main className="container mx-auto p-4 mb-20 lg:mb-0">
                        <AuthProvider>{children}</AuthProvider>
                    </main>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}