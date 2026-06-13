import {
  CONSENT_VERSION,
  MEASUREMENT_REMINDER_CONSENT_TEXT,
} from "@/lib/consent-texts";

export function measurementReminderConsentRow(options: {
  sessionId: string;
  organizationId: string;
  ipHash: string;
  uaHash: string;
  grantedAt?: string;
}): {
  session_id: string;
  organization_id: string;
  consent_type: "measurement_reminder";
  consent_version: string;
  granted: true;
  consent_text: string;
  granted_at: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    session_id: options.sessionId,
    organization_id: options.organizationId,
    consent_type: "measurement_reminder",
    consent_version: CONSENT_VERSION,
    granted: true,
    consent_text: MEASUREMENT_REMINDER_CONSENT_TEXT.measurement_reminder,
    granted_at: options.grantedAt ?? new Date().toISOString(),
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}
