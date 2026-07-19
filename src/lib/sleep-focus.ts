export type SleepFocusKey = "inslapen" | "doorslapen" | "regelmaat";

export const SLEEP_FOCUS_COOKIE_NAME = "psf_sleep_focus";

const SLEEP_FOCUS_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 dagen

export const SLEEP_FOCUS_LABELS: Record<SleepFocusKey, string> = {
  inslapen: "Inslapen",
  doorslapen: "Doorslapen",
  regelmaat: "Regelmaat",
};

export function parseSleepFocus(raw?: string | null): SleepFocusKey | null {
  if (raw === "inslapen" || raw === "doorslapen" || raw === "regelmaat") {
    return raw;
  }
  return null;
}

// Client-only functionele cookie: geen PII, alleen de zelfgekozen focus-pijler.
export function writeSleepFocusCookie(focusDimension?: string | null): void {
  if (typeof document === "undefined") return;
  const focus = parseSleepFocus(focusDimension);
  if (!focus) return;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${SLEEP_FOCUS_COOKIE_NAME}=${focus}; path=/; max-age=${SLEEP_FOCUS_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}
