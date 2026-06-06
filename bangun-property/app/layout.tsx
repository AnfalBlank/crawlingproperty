import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://estate-insight.example.com"),
  title: {
    default: "Estate Insight — Property Price Intelligence",
    template: "%s | Estate Insight",
  },
  description:
    "Real-time property rental price analytics for Malaysia. Crawl live SPEEDHOME listings, compare areas, and export professional reports.",
  keywords: ["property", "rental", "Malaysia", "SPEEDHOME", "price intelligence", "analytics", "real estate"],
  applicationName: "Estate Insight",
  authors: [{ name: "Estate Insight" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.png"],
  },
  openGraph: {
    type: "website",
    siteName: "Estate Insight",
    title: "Estate Insight — Property Price Intelligence",
    description: "Real-time rental price analytics for Malaysia.",
    images: [{ url: "/logo.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary",
    title: "Estate Insight",
    description: "Property price intelligence for Malaysia.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0d0d0e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
