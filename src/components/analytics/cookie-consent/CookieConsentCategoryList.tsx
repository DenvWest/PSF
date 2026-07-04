"use client";

import { useState } from "react";
import CookieConsentToggle from "@/components/analytics/cookie-consent/CookieConsentToggle";
import {
  COOKIE_CATEGORY_DESCRIPTIONS,
  COOKIE_CATEGORY_LABELS,
  cookieCountByCategory,
  categoryToggleState,
  providersByCategory,
  type CookieCategory,
} from "@/data/cookie-inventory";

const CATEGORY_ORDER: CookieCategory[] = [
  "necessary",
  "preferences",
  "statistics",
  "marketing",
];

type CookieConsentCategoryListProps = {
  statisticsEnabled?: boolean;
  onStatisticsChange?: (enabled: boolean) => void;
  showToggles?: boolean;
};

function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-200 px-1.5 text-[11px] font-semibold text-stone-700">
      {count}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${
        open ? "rotate-180" : ""
      }`}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type ProviderAccordionProps = {
  provider: string;
  infoUrl?: string;
  cookies: Array<{
    name: string;
    purpose: string;
    expiry: string;
  }>;
};

function ProviderAccordion({ provider, infoUrl, cookies }: ProviderAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-stone-50"
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        <span className="flex-1 text-sm font-medium text-stone-900">{provider}</span>
        <CountBadge count={cookies.length} />
      </button>

      {open ? (
        <div className="space-y-2 border-t border-stone-100 px-3 py-3">
          {cookies.map((cookie) => (
            <article
              key={cookie.name}
              className="rounded-md border border-stone-100 bg-stone-50/80 p-3"
            >
              <h4 className="font-mono text-xs font-semibold text-stone-800">{cookie.name}</h4>
              <dl className="mt-2 grid gap-1 text-xs text-stone-600">
                <div>
                  <dt className="inline font-medium text-stone-700">Doel: </dt>
                  <dd className="inline">{cookie.purpose}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-stone-700">Bewaartermijn: </dt>
                  <dd className="inline">{cookie.expiry}</dd>
                </div>
              </dl>
            </article>
          ))}
          {infoUrl ? (
            <a
              href={infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 underline decoration-sky-700/30 underline-offset-2 hover:decoration-sky-700"
            >
              Meer informatie over deze aanbieder
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function CookieConsentCategoryList({
  statisticsEnabled = false,
  onStatisticsChange,
  showToggles = false,
}: CookieConsentCategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Partial<Record<CookieCategory, boolean>>
  >({});

  function toggleCategory(category: CookieCategory): void {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  return (
    <div className="divide-y divide-stone-200">
      {CATEGORY_ORDER.map((category) => {
        const count = cookieCountByCategory(category);
        const providers = providersByCategory(category);
        const isExpanded = expandedCategories[category] === true;
        const toggle = categoryToggleState(category, {
          statistics: statisticsEnabled,
          marketing: false,
        });

        return (
          <section key={category} className="py-4 first:pt-0 last:pb-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
                aria-label={`${COOKIE_CATEGORY_LABELS[category]} uitklappen`}
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
              >
                <ChevronIcon open={isExpanded} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-stone-900">
                      {COOKIE_CATEGORY_LABELS[category]}
                    </h3>
                    <CountBadge count={count} />
                  </div>
                  {showToggles ? (
                    <CookieConsentToggle
                      checked={toggle.checked}
                      disabled={toggle.locked}
                      variant={toggle.editable ? "editable" : "locked"}
                      onChange={
                        category === "statistics" ? onStatisticsChange : undefined
                      }
                      label={`${COOKIE_CATEGORY_LABELS[category]} cookies`}
                    />
                  ) : null}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {COOKIE_CATEGORY_DESCRIPTIONS[category]}
                </p>

                {isExpanded ? (
                  <div className="mt-3 space-y-2">
                    {providers.map((group) => (
                      <ProviderAccordion
                        key={`${category}-${group.provider}`}
                        provider={group.provider}
                        infoUrl={group.infoUrl}
                        cookies={group.cookies}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
