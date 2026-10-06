import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Coast Travel",
  description: "Tourist reservation and finance manager for transfers, activities and tours.",
  applicationName: "Atlas Coast Travel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Atlas Coast",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c3d2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        {children}
        <RegisterServiceWorker />
        <Toaster />
      </body>
    </html>
  );
}
