export const ANALYTICS_CONSENT_STATE_COOKIE_NAME = "psf_analytics_state";
export const ANALYTICS_GRANTED_EVENT = "psf:analytics-granted";
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
