export const REFERRAL_SOURCE_COOKIE = "psf_referral_source";
export const REFERRAL_CAMPAIGN_COOKIE = "psf_referral_campaign";
export const REFERRAL_CONTENT_COOKIE = "psf_referral_content";
/** Eigen affiliate-programma: tracking-ref uit `?ref=` (los van utm_source). */
export const AFFILIATE_REF_COOKIE = "psf_aff_ref";
export const REFERRAL_MAX_AGE_SEC = 60 * 60 * 24 * 90;

export function normalizeReferralParam(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, 200);
  return trimmed.length > 0 ? trimmed : null;
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return null;
  }
}

export function setReferralCookiesFromSearchParams(params: URLSearchParams): void {
  if (typeof document === "undefined") {
    return;
  }
  const source = normalizeReferralParam(params.get("utm_source"));
  const campaign = normalizeReferralParam(params.get("utm_campaign"));
  const content = normalizeReferralParam(params.get("utm_content"));
  const affRef = normalizeReferralParam(params.get("ref"));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const base = `path=/; max-age=${REFERRAL_MAX_AGE_SEC}; SameSite=Lax${secure}`;

  if (source) {
    document.cookie = `${REFERRAL_SOURCE_COOKIE}=${encodeURIComponent(source)}; ${base}`;
  }
  if (campaign) {
    document.cookie = `${REFERRAL_CAMPAIGN_COOKIE}=${encodeURIComponent(campaign)}; ${base}`;
  }
  if (content) {
    document.cookie = `${REFERRAL_CONTENT_COOKIE}=${encodeURIComponent(content)}; ${base}`;
  }
  if (affRef) {
    document.cookie = `${AFFILIATE_REF_COOKIE}=${encodeURIComponent(affRef)}; ${base}`;
  }
}

export function getReferralSourceFromCookies(): string | null {
  return normalizeReferralParam(readCookieValue(REFERRAL_SOURCE_COOKIE));
}

export function isYoutubeReferral(params?: URLSearchParams): boolean {
  const fromParams = normalizeReferralParam(params?.get("utm_source") ?? null);
  if (fromParams?.toLowerCase() === "youtube") {
    return true;
  }
  const fromCookie = getReferralSourceFromCookies();
  return fromCookie?.toLowerCase() === "youtube";
}
