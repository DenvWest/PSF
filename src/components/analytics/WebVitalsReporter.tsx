"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { trackWebVital } from "@/lib/ga4";

/**
 * Stuurt Core Web Vitals (LCP, CLS, INP, FCP, TTFB) door naar GA4 als
 * `web_vital`-events. `trackEvent` (in `lib/ga4.ts`) stuurt zelf alleen iets
 * als `window.gtag` bestaat — dat wordt pas gezet ná analytics-consent — dus
 * hier hoeft niet apart op consent gecontroleerd te worden.
 */
export default function WebVitalsReporter() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    // CLS is een unitless score (~0-0.25); *1000 en afronden geeft GA4 een
    // bruikbaar geheel getal zonder precisie te verliezen op de meetschaal.
    const value =
      metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value);

    trackWebVital({
      metric_name: metric.name,
      metric_value: value,
      metric_id: metric.id,
      metric_rating: metric.rating,
      page_path: pathname,
    });
  });

  return null;
}
