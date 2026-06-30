"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import CookieConsentSettings from "@/components/analytics/CookieConsentSettings";
import {
  ANALYTICS_GRANTED_EVENT,
  COOKIE_PREFERENCES_EVENT,
  dispatchAnalyticsConsentChanged,
  GA_MEASUREMENT_ID,
  type CookiePreferencesDetail,
  readAnalyticsConsentStateClient,
} from "@/lib/analytics-consent-client";
import { useAnalyticsConsentState } from "@/lib/analytics-consent-hooks";
import { callClarity } from "@/lib/clarity";

const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_clck", "_clsk"];

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
  // Officiële GA opt-out: GA schrijft hierna geen hits/cookies meer, ook niet tijdens unload.
  (window as unknown as Record<string, unknown>)[
    `ga-disable-${GA_MEASUREMENT_ID}`
  ] = true;
  const gtag = (window as unknown as {
    gtag?: (...args: unknown[]) => void;
  }).gtag;
  gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
  });
}

type BannerView = "intro" | "settings";

const primaryButtonClass =
  "min-h-[44px] w-full rounded-lg bg-ps-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover disabled:cursor-not-allowed disabled:opacity-60";
const tertiaryButtonClass =
  "min-h-[44px] w-full rounded-lg px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60";

function analyticsEnabledFromState(): boolean {
  return readAnalyticsConsentStateClient() === "granted";
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

export default function CookieConsentBanner() {
  const consentState = useAnalyticsConsentState();
  const [preferenceRequest, setPreferenceRequest] = useState<CookiePreferencesDetail | null>(
    null,
  );
  const [view, setView] = useState<BannerView>("intro");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeClientMounted,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );

  const titleRef = useRef<HTMLHeadingElement>(null);
  const open = consentState === "unset" || preferenceRequest !== null;

  const openBanner = useCallback((options?: { openSettings?: boolean }) => {
    setAnalyticsEnabled(analyticsEnabledFromState());
    setView(options?.openSettings ? "settings" : "intro");
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
  }, [open, view]);

  async function persistConsent(
    granted: boolean,
    source: "banner" | "settings" | "footer",
  ): Promise<boolean> {
    const wasGranted = readAnalyticsConsentStateClient() === "granted";
    setBusy(true);
    try {
      const res = await fetch("/api/consent/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granted, source }),
      });
      if (!res.ok) {
        setBusy(false);
        return false;
      }
      dispatchAnalyticsConsentChanged();
      if (granted) {
        window.dispatchEvent(new Event(ANALYTICS_GRANTED_EVENT));
        setBusy(false);
        setPreferenceRequest(null);
        setView("intro");
        return true;
      }
      if (wasGranted) {
        disableGoogleAnalytics();
        callClarity("stop");
        purgeAnalyticsCookies();
        window.location.reload();
        return true;
      }
      setBusy(false);
      setPreferenceRequest(null);
      setView("intro");
      return true;
    } catch {
      setBusy(false);
      return false;
    }
  }

  if (!mounted || !open) {
    return null;
  }

  const titleId = view === "intro" ? "cookie-banner-title" : "cookie-settings-title";

  return (
    <aside
      role="region"
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div
        className={`mx-auto w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.14)] sm:p-6 ${
          view === "settings"
            ? "max-w-md sm:max-w-xl max-h-[min(85vh,720px)] overflow-y-auto"
            : "max-w-md sm:max-w-lg"
        }`}
      >
        {view === "intro" ? (
          <>
            <h2
              ref={titleRef}
              id="cookie-banner-title"
              tabIndex={-1}
              className="text-lg font-semibold text-stone-900 outline-none"
            >
              Cookies &amp; Privacy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Wij gebruiken cookies om de gebruikerservaring te verbeteren. Lees hierover meer in
              onze{" "}
              <Link
                href="/privacy"
                className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
              >
                privacyverklaring
              </Link>
              .
            </p>
            <div className="mt-5 grid gap-2.5 sm:gap-3">
              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => void persistConsent(true, "banner")}
                  className={primaryButtonClass}
                >
                  Alles accepteren
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => void persistConsent(false, "banner")}
                  className={primaryButtonClass}
                >
                  Alles afwijzen
                </button>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setAnalyticsEnabled(analyticsEnabledFromState());
                  setView("settings");
                }}
                className={tertiaryButtonClass}
              >
                Instellingen
              </button>
            </div>
          </>
        ) : (
          <CookieConsentSettings
            analyticsEnabled={analyticsEnabled}
            onAnalyticsChange={setAnalyticsEnabled}
            onBack={() => setView("intro")}
            onSave={() => void persistConsent(analyticsEnabled, "settings")}
            busy={busy}
          />
        )}
      </div>
    </aside>
  );
}
