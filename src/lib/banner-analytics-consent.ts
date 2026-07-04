import {
  BANNER_AFFILIATE_MARKETING_CONSENT_TEXT,
  CONSENT_VERSION,
  INTAKE_CONSENT_TEXT,
  type ConsentType,
} from "@/lib/consent-texts";
import { DEFAULT_ORG_ID } from "@/config/org";

export type BannerCookieConsentSource = "banner" | "footer" | "settings";

function sourceNote(source: BannerCookieConsentSource): string {
  if (source === "banner") return "cookiebanner";
  if (source === "footer") return "footer cookievoorkeuren";
  return "cookie-instellingen";
}

type ConsentRow = {
  organization_id: string;
  consent_type: ConsentType;
  consent_version: string;
  granted: boolean;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
};

export function bannerStatisticsConsentRow(options: {
  granted: boolean;
  source: BannerCookieConsentSource;
  ipHash: string;
  uaHash: string;
  organizationId?: string;
}): ConsentRow {
  return {
    organization_id: options.organizationId ?? DEFAULT_ORG_ID,
    consent_type: "anonymous_analytics",
    consent_version: CONSENT_VERSION,
    granted: options.granted,
    consent_text: `${INTAKE_CONSENT_TEXT.anonymous_analytics} (via ${sourceNote(options.source)})`,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}

export function bannerMarketingConsentRow(options: {
  granted: boolean;
  source: BannerCookieConsentSource;
  ipHash: string;
  uaHash: string;
  organizationId?: string;
}): ConsentRow {
  return {
    organization_id: options.organizationId ?? DEFAULT_ORG_ID,
    consent_type: "affiliate_marketing",
    consent_version: CONSENT_VERSION,
    granted: options.granted,
    consent_text: `${BANNER_AFFILIATE_MARKETING_CONSENT_TEXT} (via ${sourceNote(options.source)})`,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}

/** @deprecated Use bannerStatisticsConsentRow */
export function bannerAnalyticsConsentRow(options: {
  granted: boolean;
  source: BannerCookieConsentSource;
  ipHash: string;
  uaHash: string;
  organizationId?: string;
}): ConsentRow {
  return bannerStatisticsConsentRow(options);
}
