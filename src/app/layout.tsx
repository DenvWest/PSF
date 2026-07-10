import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import AnalyticsLoader from "@/components/analytics/AnalyticsLoader";
import CookieConsentBanner from "@/components/analytics/CookieConsentBanner";
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
    "Onafhankelijk leefstijladvies voor mannen 40+. Gratis Leefstijlcheck, onderbouwde gidsen en transparante supplementvergelijking — leefstijl eerst.",
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
    <html
      lang="nl"
      data-scroll-behavior="smooth"
      className={`${dmSerifDisplay.variable} ${dmSans.variable}`}
    >
      <head>
        <meta
          name="0107f4118169ab8"
          content="9822d5dcfc9e7853d2ef69971e75efc8"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});`,
          }}
        />
      </head>
      <body className="bg-[var(--ps-bg)] text-stone-900 antialiased">
        <AnalyticsLoader />
        <AppShell>{children}</AppShell>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
