"use client";

import Link from "next/link";
import CookieConsentToggle from "@/components/analytics/cookie-consent/CookieConsentToggle";
import {
  COOKIE_CATEGORY_LABELS,
  categoryToggleState,
  type CookieCategory,
} from "@/data/cookie-inventory";

type CookieConsentCategoriesProps = {
  statisticsEnabled: boolean;
  marketingEnabled: boolean;
  onStatisticsChange: (enabled: boolean) => void;
  onMarketingChange: (enabled: boolean) => void;
};

const CATEGORY_ORDER: CookieCategory[] = [
  "necessary",
  "preferences",
  "statistics",
  "marketing",
];

export default function CookieConsentCategories({
  statisticsEnabled,
  marketingEnabled,
  onStatisticsChange,
  onMarketingChange,
}: CookieConsentCategoriesProps) {
  const preferences = { statistics: statisticsEnabled, marketing: marketingEnabled };

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold text-stone-900 sm:text-lg">
          Deze website maakt gebruik van cookies
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Wij gebruiken cookies om de website goed te laten werken en anoniem gebruik te
          meten. Lees meer in onze{" "}
          <Link
            href="/privacy"
            className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
          >
            privacyverklaring
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORY_ORDER.map((category) => {
          const toggle = categoryToggleState(category, preferences);

          return (
            <article
              key={category}
              className="flex min-h-[88px] flex-col items-center justify-center gap-2.5 rounded-lg border border-stone-200 bg-white px-2 py-3 text-center"
            >
              <h3 className="text-xs font-semibold leading-tight text-stone-900 sm:text-sm">
                {COOKIE_CATEGORY_LABELS[category]}
              </h3>
              <CookieConsentToggle
                checked={toggle.checked}
                disabled={toggle.locked}
                variant={toggle.editable ? "editable" : "locked"}
                onChange={
                  category === "statistics"
                    ? onStatisticsChange
                    : category === "marketing"
                      ? onMarketingChange
                      : undefined
                }
                label={`${COOKIE_CATEGORY_LABELS[category]} cookies`}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
