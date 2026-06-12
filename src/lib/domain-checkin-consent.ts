import { DOMAIN_CHECKIN_CONSENT_TEXT } from "@/lib/consent-texts";

export const DOMAIN_CHECKIN_CONSENT_VERSION = "1.0";

export function domainCheckinConsentRow(options: {
  sessionId: string;
  organizationId: string;
  ipHash: string;
  uaHash: string;
}): {
  session_id: string;
  organization_id: string;
  consent_type: "domain_checkin_logging";
  consent_version: string;
  granted: true;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    session_id: options.sessionId,
    organization_id: options.organizationId,
    consent_type: "domain_checkin_logging",
    consent_version: DOMAIN_CHECKIN_CONSENT_VERSION,
    granted: true,
    consent_text: DOMAIN_CHECKIN_CONSENT_TEXT.domain_checkin_logging,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}
