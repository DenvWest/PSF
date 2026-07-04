import { MARKETING_CONSENT_STATE_COOKIE_NAME } from "@/lib/analytics-consent-constants";

export { MARKETING_CONSENT_STATE_COOKIE_NAME };
export const MARKETING_CONSENT_CHANGED_EVENT = "psf:marketing-consent-changed";

export type MarketingConsentState = "granted" | "denied" | "unset";

export function readMarketingConsentStateClient(): MarketingConsentState {
  if (typeof document === "undefined") {
    return "unset";
  }
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${MARKETING_CONSENT_STATE_COOKIE_NAME}=`));
  if (!match) {
    return "unset";
  }
  const value = decodeURIComponent(match.slice(match.indexOf("=") + 1));
  if (value === "granted") return "granted";
  if (value === "denied") return "denied";
  return "unset";
}

export function dispatchMarketingConsentChanged(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(MARKETING_CONSENT_CHANGED_EVENT));
}
