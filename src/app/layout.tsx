import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2d3748",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
