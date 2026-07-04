import {
  CONSENT_VERSION,
  PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT,
} from "@/lib/consent-texts";

export function premiumLaunchEmailConsentRow(options: {
  sessionId: string | null;
  organizationId: string;
  ipHash: string;
  uaHash: string;
  grantedAt?: string;
}): {
  session_id: string | null;
  organization_id: string;
  consent_type: "premium_launch_email";
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
    consent_type: "premium_launch_email",
    consent_version: CONSENT_VERSION,
    granted: true,
    consent_text: PREMIUM_LAUNCH_EMAIL_CONSENT_TEXT.premium_launch_email,
    granted_at: options.grantedAt ?? new Date().toISOString(),
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}
