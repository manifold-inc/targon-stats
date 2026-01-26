import type { Metadata } from "next";

import "@/styles/globals.css";

import { Inter, Saira } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import clsx from "clsx";
import { Toaster } from "sonner";

import Header from "@/app/_components/header/Header";
import { WithGlobalProvider } from "@/app/_components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const saira = Saira({
  subsets: ["latin"],
  variable: "--font-saira",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stats.targon.com"),
  title: "Targon Stats",
  description: "Targon stats and data",
  icons: {
    icon: "/targon-logo.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Targon Stats",
    description: "Targon stats and data",
    images: [
      {
        url: "/targon-stats-preview.png",
        width: 1200,
        height: 630,
        alt: "Targon Stats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Targon Stats",
    description: "Targon stats and data",
    images: ["/targon-stats-preview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={clsx("dark h-full", inter.variable, saira.variable)}
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/targon-logo.svg" />
      </head>
      <body
        className={`relative bg-mf-night-500 text-mf-milk-500 transition-colors`}
      >
        <WithGlobalProvider>
          <Header />
          <main>{children}</main>
        </WithGlobalProvider>

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
