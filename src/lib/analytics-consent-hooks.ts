"use client";

import { useSyncExternalStore } from "react";
import {
  readAnalyticsConsentStateClient,
  subscribeAnalyticsConsent,
  type AnalyticsConsentState,
} from "@/lib/analytics-consent-client";

function getServerAnalyticsConsentSnapshot(): AnalyticsConsentState {
  return "unset";
}

export function useAnalyticsConsentState(): AnalyticsConsentState {
  return useSyncExternalStore(
    subscribeAnalyticsConsent,
    readAnalyticsConsentStateClient,
    getServerAnalyticsConsentSnapshot,
  );
}

export function useAnalyticsGranted(): boolean {
  return useAnalyticsConsentState() === "granted";
}
