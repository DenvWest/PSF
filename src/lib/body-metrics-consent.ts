import { BODY_METRICS_CONSENT_TEXT } from "@/lib/consent-texts";

export const BODY_METRICS_CONSENT_VERSION = "1.0";

export function bodyMetricsConsentRow(options: {
  sessionId: string;
  organizationId: string;
  ipHash: string;
  uaHash: string;
}): {
  session_id: string;
  organization_id: string;
  consent_type: "body_metrics";
  consent_version: string;
  granted: true;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    session_id: options.sessionId,
    organization_id: options.organizationId,
    consent_type: "body_metrics",
    consent_version: BODY_METRICS_CONSENT_VERSION,
    granted: true,
    consent_text: BODY_METRICS_CONSENT_TEXT.body_metrics,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}
