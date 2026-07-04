"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import CookieConsentAboutPanel from "@/components/analytics/cookie-consent/CookieConsentAboutPanel";
import CookieConsentCategories from "@/components/analytics/cookie-consent/CookieConsentCategories";
import CookieConsentDetails from "@/components/analytics/cookie-consent/CookieConsentDetails";
import {
  ANALYTICS_GRANTED_EVENT,
  COOKIE_PREFERENCES_EVENT,
  dispatchAnalyticsConsentChanged,
  GA_MEASUREMENT_ID,
  type CookiePreferencesDetail,
  readAnalyticsConsentMetaClient,
  readAnalyticsConsentStateClient,
} from "@/lib/analytics-consent-client";
import { useAnalyticsConsentState } from "@/lib/analytics-consent-hooks";
import type { AnalyticsConsentMeta } from "@/lib/analytics-consent";
import { callClarity } from "@/lib/clarity";
import {
  dispatchMarketingConsentChanged,
  readMarketingConsentStateClient,
} from "@/lib/marketing-consent-client";

const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_clck", "_clsk"];

type ConsentTab = "consent" | "details" | "about";

type CookieConsentPayload = {
  statistics: boolean;
  marketing: boolean;
  source: "banner" | "settings" | "footer";
};

const primaryButtonClass =
  "min-h-[44px] w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60";
const saveButtonClass =
  "min-h-[44px] w-full rounded-lg bg-ps-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover disabled:cursor-not-allowed disabled:opacity-60";

function purgeAnalyticsCookies(): void {
  if (typeof document === "undefined") {
    return;
  }
  const host = window.location.hostname;
  const domains = new Set<string>(["", host, `.${host}`]);
  const parts = host.split(".");
  if (parts.length > 2) {
    const registrable = parts.slice(-2).join(".");
    domains.add(registrable);
    domains.add(`.${registrable}`);
  }
  const names = document.cookie
    .split("; ")
    .map((entry) => entry.split("=")[0])
    .filter((name) =>
      ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix)),
    );
  for (const name of names) {
    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainPart}`;
    }
  }
}

function disableGoogleAnalytics(): void {
  if (typeof window === "undefined") {
    return;
  }
  (window as unknown as Record<string, unknown>)[
    `ga-disable-${GA_MEASUREMENT_ID}`
  ] = true;
  const gtag = (window as unknown as {
    gtag?: (...args: unknown[]) => void;
  }).gtag;
  gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function statisticsEnabledFromState(): boolean {
  return readAnalyticsConsentStateClient() === "granted";
}

function marketingEnabledFromState(): boolean {
  return readMarketingConsentStateClient() === "granted";
}

function subscribeClientMounted(): () => void {
  return () => {};
}

function getClientMountedSnapshot(): boolean {
  return true;
}

function getServerMountedSnapshot(): boolean {
  return false;
}

const TAB_LABELS: Record<ConsentTab, string> = {
  consent: "Toestemming",
  details: "Details",
  about: "Over",
};

export default function CookieConsentBanner() {
  const consentState = useAnalyticsConsentState();
  const [preferenceRequest, setPreferenceRequest] = useState<CookiePreferencesDetail | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<ConsentTab>("consent");
  const [statisticsEnabled, setStatisticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [consentMeta, setConsentMeta] = useState<AnalyticsConsentMeta | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeClientMounted,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );

  const titleRef = useRef<HTMLHeadingElement>(null);
  const isFirstVisit = consentState === "unset";
  const open = isFirstVisit || preferenceRequest !== null;
  const savedStatisticsEnabled = statisticsEnabledFromState();
  const savedMarketingEnabled = marketingEnabledFromState();
  const hasUnsavedChanges =
    statisticsEnabled !== savedStatisticsEnabled ||
    marketingEnabled !== savedMarketingEnabled;

  const openBanner = useCallback((options?: { openSettings?: boolean }) => {
    setStatisticsEnabled(statisticsEnabledFromState());
    setMarketingEnabled(marketingEnabledFromState());
    setConsentMeta(readAnalyticsConsentMetaClient());
    setActiveTab(options?.openSettings ? "consent" : "consent");
    setPreferenceRequest(options ?? {});
  }, []);

  useEffect(() => {
    const onPreferences = (event: Event) => {
      const detail = (event as CustomEvent<CookiePreferencesDetail>).detail;
      openBanner({ openSettings: detail?.openSettings === true });
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, onPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, onPreferences);
  }, [openBanner]);

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    }
  }, [open, activeTab]);

  async function persistConsent(payload: CookieConsentPayload): Promise<boolean> {
    const wasStatisticsGranted = readAnalyticsConsentStateClient() === "granted";
    setBusy(true);
    try {
      const res = await fetch("/api/consent/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setBusy(false);
        return false;
      }
      const data = (await res.json()) as {
        consentRecordId?: string | null;
        grantedAt?: string | null;
      };
      if (data.consentRecordId && data.grantedAt) {
        setConsentMeta({
          id: data.consentRecordId,
          grantedAt: data.grantedAt,
        });
      }
      dispatchAnalyticsConsentChanged();
      dispatchMarketingConsentChanged();
      if (payload.statistics) {
        window.dispatchEvent(new Event(ANALYTICS_GRANTED_EVENT));
      }
      if (!payload.statistics && wasStatisticsGranted) {
        disableGoogleAnalytics();
        callClarity("stop");
        purgeAnalyticsCookies();
        window.location.reload();
        return true;
      }
      setBusy(false);
      setPreferenceRequest(null);
      return true;
    } catch {
      setBusy(false);
      return false;
    }
  }

  function closeWithoutSaving(): void {
    setPreferenceRequest(null);
    setStatisticsEnabled(savedStatisticsEnabled);
    setMarketingEnabled(savedMarketingEnabled);
  }

  async function handleClose(): Promise<void> {
    if (isFirstVisit) {
      await persistConsent({ statistics: false, marketing: false, source: "banner" });
      return;
    }
    closeWithoutSaving();
  }

  if (!mounted || !open) {
    return null;
  }

  const scrollableContent = activeTab !== "consent";
  const consentSource: CookieConsentPayload["source"] = preferenceRequest
    ? "footer"
    : "banner";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-transparent p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_20px_60px_rgba(28,25,23,0.16)]"
      >
        <header className="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Image
              src="/icon.png"
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 rounded-lg sm:h-8 sm:w-8"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-stone-900 sm:text-base">
              Perfect<span className="text-stone-700">Supplement</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleClose()}
            disabled={busy}
            aria-label="Sluiten"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </header>

        <nav
          aria-label="Cookie-instellingen"
          className="flex gap-6 border-b border-stone-200 px-5 sm:px-6"
        >
          {(Object.keys(TAB_LABELS) as ConsentTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-ps-green text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        <div
          className={`px-5 py-4 sm:px-6 sm:py-5 ${
            scrollableContent
              ? "max-h-[min(65vh,560px)] overflow-y-auto"
              : "overflow-visible"
          }`}
        >
          <h2
            ref={titleRef}
            id="cookie-modal-title"
            tabIndex={-1}
            className="sr-only"
          >
            Cookievoorkeuren
          </h2>

          {activeTab === "consent" ? (
            <CookieConsentCategories
              statisticsEnabled={statisticsEnabled}
              marketingEnabled={marketingEnabled}
              onStatisticsChange={setStatisticsEnabled}
              onMarketingChange={setMarketingEnabled}
            />
          ) : null}
          {activeTab === "details" ? <CookieConsentDetails /> : null}
          {activeTab === "about" ? (
            <CookieConsentAboutPanel consentMeta={consentMeta} />
          ) : null}
        </div>

        <footer className="border-t border-stone-200 bg-white px-5 py-3 sm:px-6">
          {activeTab === "consent" && hasUnsavedChanges ? (
            <button
              type="button"
              disabled={busy}
              aria-busy={busy}
              onClick={() =>
                void persistConsent({
                  statistics: statisticsEnabled,
                  marketing: marketingEnabled,
                  source: preferenceRequest ? "footer" : "settings",
                })
              }
              className={`${saveButtonClass} mb-2.5`}
            >
              Voorkeuren opslaan
            </button>
          ) : null}
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              disabled={busy}
              aria-busy={busy}
              onClick={() =>
                void persistConsent({
                  statistics: false,
                  marketing: false,
                  source: consentSource,
                })
              }
              className={secondaryButtonClass}
            >
              Weigeren
            </button>
            <button
              type="button"
              disabled={busy}
              aria-busy={busy}
              onClick={() =>
                void persistConsent({
                  statistics: true,
                  marketing: true,
                  source: consentSource,
                })
              }
              className={primaryButtonClass}
            >
              Alles toestaan
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
