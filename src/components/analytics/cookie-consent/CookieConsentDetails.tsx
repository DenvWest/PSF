"use client";

import CookieConsentCategoryList from "@/components/analytics/cookie-consent/CookieConsentCategoryList";

export default function CookieConsentDetails() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-stone-900 sm:text-lg">Cookie-details</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Klik op een categorie of aanbieder om de onderliggende cookies te bekijken.
        </p>
      </div>
      <CookieConsentCategoryList showToggles={false} />
      <p className="mt-4 text-xs text-stone-500">
        Cookieverklaring laatst bijgewerkt op 04-07-2026 door PerfectSupplement.
      </p>
    </div>
  );
}
