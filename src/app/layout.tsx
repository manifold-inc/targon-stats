import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/header/Header";
import { WithGlobalProvider } from "@/app/_components/providers";
import "@/styles/globals.css";
import clsx from "clsx";
import type { Metadata } from "next";
import { Inter, Saira } from "next/font/google";
import { Toaster } from "sonner";

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
        suppressHydrationWarning
        className={`relative bg-mf-night-500 text-mf-milk-500 transition-colors h-full flex flex-col`}
      >
        <WithGlobalProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="mx-auto max-w-[1400px] p-10 w-full flex flex-col flex-1 animate-fade-in">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </WithGlobalProvider>

        <Toaster />
      </body>
    </html>
  );
}
