import {
  ANALYTICS_CONSENT_META_COOKIE_NAME,
  ANALYTICS_CONSENT_STATE_COOKIE_NAME,
} from "@/lib/analytics-consent-constants";
import type { AnalyticsConsentMeta } from "@/lib/analytics-consent";

export { ANALYTICS_CONSENT_STATE_COOKIE_NAME };
export const ANALYTICS_GRANTED_EVENT = "psf:analytics-granted";
export const ANALYTICS_CONSENT_CHANGED_EVENT = "psf:analytics-consent-changed";
export const COOKIE_PREFERENCES_EVENT = "psf:cookie-preferences";
export const GA_MEASUREMENT_ID = "G-EVHN1F8ZQW";
export const CLARITY_PROJECT_ID = "whkrgimj6f";

export type AnalyticsConsentState = "granted" | "denied" | "unset";

export type CookiePreferencesDetail = {
  openSettings?: boolean;
};

export function dispatchCookiePreferences(detail?: CookiePreferencesDetail): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<CookiePreferencesDetail>(COOKIE_PREFERENCES_EVENT, {
      detail: detail ?? {},
    }),
  );
}

export function readAnalyticsConsentStateClient(): AnalyticsConsentState {
  if (typeof document === "undefined") {
    return "unset";
  }
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ANALYTICS_CONSENT_STATE_COOKIE_NAME}=`));
  if (!match) {
    return "unset";
  }
  const value = decodeURIComponent(match.slice(match.indexOf("=") + 1));
  if (value === "granted") return "granted";
  if (value === "denied") return "denied";
  return "unset";
}

export function readAnalyticsConsentMetaClient(): AnalyticsConsentMeta | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ANALYTICS_CONSENT_META_COOKIE_NAME}=`));
  if (!match) {
    return null;
  }
  try {
    const raw = decodeURIComponent(match.slice(match.indexOf("=") + 1));
    const parsed = JSON.parse(raw) as AnalyticsConsentMeta;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.grantedAt === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function dispatchAnalyticsConsentChanged(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGED_EVENT));
}

export function subscribeAnalyticsConsent(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handler);
  window.addEventListener(ANALYTICS_GRANTED_EVENT, handler);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handler);
    window.removeEventListener(ANALYTICS_GRANTED_EVENT, handler);
  };
}
