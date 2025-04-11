import type { NextConfig } from "next";
import withPWAInit from "next-pwa"; // Import next-pwa

const isDev = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
  dest: "public", // Destination directory for service worker files
  disable: isDev, // Disable PWA in development
  // register: true, // Register service worker immediately
  // skipWaiting: true, // Force new service worker activation
  // runtimeCaching: [...] // Add runtime caching strategies later if needed
});

// Remove explicit NextConfig type annotation to avoid potential conflicts
const nextConfig = {
  /* config options here */
  reactStrictMode: true, // Keep or adjust as needed
};

export default withPWA(nextConfig); // Wrap the config
