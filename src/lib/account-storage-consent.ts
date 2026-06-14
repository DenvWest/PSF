import { ACCOUNT_STORAGE_CONSENT_TEXT } from "@/lib/consent-texts";

export const ACCOUNT_STORAGE_CONSENT_VERSION = "1.0";

export function accountStorageConsentRow(options: {
  sessionId: string;
  organizationId: string;
  ipHash: string;
  uaHash: string;
}): {
  session_id: string;
  organization_id: string;
  consent_type: "account_storage";
  consent_version: string;
  granted: true;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    session_id: options.sessionId,
    organization_id: options.organizationId,
    consent_type: "account_storage",
    consent_version: ACCOUNT_STORAGE_CONSENT_VERSION,
    granted: true,
    consent_text: ACCOUNT_STORAGE_CONSENT_TEXT.account_storage,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}
