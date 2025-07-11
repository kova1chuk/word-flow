import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import Header from "@/components/Header";

import { AuthSyncProvider } from "@/providers/AuthSyncProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { PWAProvider } from "@/providers/PWAProvider";
import { StoreProvider } from "@/providers/StoreProvider";


import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Word Flow",
  description: "Vocabulary learning app",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <AuthSyncProvider />
          <PWAProvider>
            <NotificationProvider>
              <Header />
              <main className="pt-16">{children}</main>
            </NotificationProvider>
          </PWAProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
