import type { Metadata, Viewport } from "next";
import { redirect } from '@/i18n/navigation';
import { locales, Locale } from '@/i18n/locale';
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2d3748",
};

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Track your workouts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
