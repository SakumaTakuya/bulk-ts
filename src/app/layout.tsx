import { NextIntlClientProvider } from 'next-intl';
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from '@/components/Navigation';
import AuthProvider from "@/components/providers/AuthProvider";
import './globals.css';
import type { Metadata } from "next";
import { getLocale } from 'next-intl/server';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: 'Workout Tracker',
    description: 'Track your workouts',
    appleWebApp: {
        capable: true,
        title: "Workout Tracker",
        startupImage: "/bland-image.png",
        statusBarStyle: "black-translucent"
    }
};

export default async function LocaleLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();

    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark m-safe`}>
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