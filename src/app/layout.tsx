import type { Metadata } from "next";

import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import clsx from "clsx";
import { Toaster } from "sonner";

import Header from "./_components/header";
import { WithGlobalProvider } from "./_components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Targon-Stats",
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
      className={clsx("h-full dark", inter.variable)}
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/Delta.png" />
      </head>
      <body
        className={`relative bg-mf-night-500 text-gray-100 transition-colors`}
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
