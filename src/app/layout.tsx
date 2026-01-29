import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultMetadata } from "@/lib/metadata";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { RouteGuard } from "@/components/RouteGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastContext";
import "./globals.css"; // Force rebuild and style sync

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextAuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <RouteGuard>
                {children}
              </RouteGuard>
            </ErrorBoundary>
          </ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
