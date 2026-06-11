import { NUTRITION_LOG_CONSENT_TEXT } from "@/lib/consent-texts";

export const NUTRITION_LOG_CONSENT_VERSION = "1.0";

export function nutritionLogConsentRow(options: {
  sessionId: string;
  organizationId: string;
  ipHash: string;
  uaHash: string;
}): {
  session_id: string;
  organization_id: string;
  consent_type: "nutrition_intake_logging";
  consent_version: string;
  granted: true;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    session_id: options.sessionId,
    organization_id: options.organizationId,
    consent_type: "nutrition_intake_logging",
    consent_version: NUTRITION_LOG_CONSENT_VERSION,
    granted: true,
    consent_text: NUTRITION_LOG_CONSENT_TEXT.nutrition_intake_logging,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}
