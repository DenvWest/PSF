"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ANALYTICS_GRANTED_EVENT,
  COOKIE_PREFERENCES_EVENT,
  readAnalyticsConsentStateClient,
} from "@/lib/analytics-consent-client";

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (readAnalyticsConsentStateClient() === "unset") {
      setOpen(true);
    }
    const reopen = () => setOpen(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, reopen);
  }, []);

  async function choose(granted: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/consent/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granted, source: "banner" }),
      });
      if (!res.ok) {
        setBusy(false);
        return;
      }
      if (granted) {
        window.dispatchEvent(new Event(ANALYTICS_GRANTED_EVENT));
      }
      setOpen(false);
    } catch {
      setBusy(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookievoorkeuren"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-5 shadow-xl sm:p-6">
        <h2 className="text-base font-semibold text-stone-900">
          Cookies &amp; privacy
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          We gebruiken functionele cookies om de site te laten werken. Met jouw
          toestemming plaatsen we analytische cookies (Google Analytics en
          Microsoft Clarity) om de site te verbeteren. Lees meer in ons{" "}
          <Link
            href="/cookies"
            className="font-medium text-stone-900 underline underline-offset-2"
          >
            cookiebeleid
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => void choose(true)}
            className="order-1 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
          >
            Alles accepteren
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void choose(false)}
            className="order-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 sm:order-1"
          >
            Alleen noodzakelijk
          </button>
        </div>
      </div>
    </aside>
  );
}
