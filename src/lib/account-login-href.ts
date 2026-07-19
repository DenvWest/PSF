import { hasVoortgangReturnParam } from "@/lib/voortgang-return-link";

export type AccountLoginFrom = "intake" | "voortgang" | "sleep_analysis";

export function parseAccountLoginFrom(
  from?: string,
): AccountLoginFrom | "default" {
  if (from === "intake") {
    return "intake";
  }
  if (from === "voortgang") {
    return "voortgang";
  }
  if (from === "sleep_analysis") {
    return "sleep_analysis";
  }
  return "default";
}

export function buildAccountLoginHref(options: {
  hasIntakeSession?: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}): string {
  if (options.hasIntakeSession) {
    return "/account/login?from=intake";
  }
  if (options.searchParams && hasVoortgangReturnParam(options.searchParams)) {
    return "/account/login?from=voortgang";
  }
  return "/account/login";
}

export type SleepAnalysisFocusKey = "inslapen" | "doorslapen" | "regelmaat";

export function parseSleepAnalysisFocus(
  raw?: string | null,
): SleepAnalysisFocusKey | null {
  if (raw === "inslapen" || raw === "doorslapen" || raw === "regelmaat") {
    return raw;
  }
  return null;
}

export function buildSleepAnalysisLoginHref(
  focusDimension?: string | null,
): string {
  const focus = parseSleepAnalysisFocus(focusDimension);
  return focus
    ? `/account/login?from=sleep_analysis&focus=${focus}`
    : "/account/login?from=sleep_analysis";
}
