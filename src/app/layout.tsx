import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PerfectSupplement",
    template: "%s | PerfectSupplement",
  },
  description:
    "Evidence-based supplementinformatie en vergelijkingen, met focus op Omega-3 en Vitamine D.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <meta
          name="0107f4118169ab8"
          content="9822d5dcfc9e7853d2ef69971e75efc8"
        />
      </head>
      <body className="bg-white text-slate-900 antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EVHN1F8ZQW"
          strategy="afterInteractive"
        />

        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-EVHN1F8ZQW');
          `}
        </Script>

        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}