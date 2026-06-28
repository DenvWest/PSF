"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_GRANTED_EVENT,
  CLARITY_PROJECT_ID,
  GA_MEASUREMENT_ID,
  readAnalyticsConsentStateClient,
} from "@/lib/analytics-consent-client";
import { callClarity } from "@/lib/clarity";

const CLARITY_BLOCKED_PREFIXES = [
  "/intake",
  "/rapport",
  "/dashboard",
  "/account",
];

function isClaritySensitivePath(pathname: string): boolean {
  return CLARITY_BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function AnalyticsLoader() {
  const [granted, setGranted] = useState(false);
  const pathname = usePathname();
  const clarityBlocked = isClaritySensitivePath(pathname);

  useEffect(() => {
    if (readAnalyticsConsentStateClient() === "granted") {
      setGranted(true);
    }
    const onGranted = () => setGranted(true);
    window.addEventListener(ANALYTICS_GRANTED_EVENT, onGranted);
    return () => window.removeEventListener(ANALYTICS_GRANTED_EVENT, onGranted);
  }, []);

  useEffect(() => {
    if (!granted) {
      return;
    }
    callClarity(clarityBlocked ? "stop" : "start");
  }, [granted, clarityBlocked]);

  if (!granted) {
    return null;
  }

  return (
    <>
      {!clarityBlocked ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
        </Script>
      ) : null}

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      <Script id="ga-init" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
      </Script>
    </>
  );
}
