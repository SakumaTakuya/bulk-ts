import type { Metadata, Viewport } from "next"; // Import Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider"; // Import AuthProvider
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Tracker PWA", // Updated title
  description: "Track your workouts easily", // Updated description
  manifest: "/manifest.json", // Link to manifest
  // themeColor removed from here
};

// Add viewport export
export const viewport: Viewport = {
  themeColor: "#2d3748", // Moved theme color here
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
