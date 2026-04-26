import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PerfectSupplement",
    template: "%s | PerfectSupplement",
  },
  description:
    "Evidence-based supplementinformatie en vergelijkingen, met focus op omega-3 en magnesium.",
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
    <html lang="nl" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <head>
        <meta
          name="0107f4118169ab8"
          content="9822d5dcfc9e7853d2ef69971e75efc8"
        />
      </head>
      <body className="bg-[var(--ps-bg)] text-stone-900 antialiased">
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "whkrgimj6f");`}
        </Script>

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

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
