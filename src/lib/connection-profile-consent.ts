import type { SupabaseClient } from "@supabase/supabase-js";
import { CONNECTION_PROFILE_CONSENT_TEXT } from "@/lib/consent-texts";

/**
 * Toestemming voor het Connection Profile. Account-scoped, niet sessie-scoped:
 * zie de migratie 20260815150000_consent_records_account_id.sql.
 *
 * Deze module staat BEWUST buiten src/lib/connection-profile/ — daar bewaakt
 * firewall.test.ts dat er uitsluitend cprofile_-tabellen worden aangeraakt, en
 * consent_records is dat niet. De grens uit §7 blijft zo meetbaar in plaats van
 * dat de test wordt opgerekt om deze tabel toe te laten.
 */

export const CONNECTION_PROFILE_CONSENT_VERSION = "1.0";

const CONSENT_TYPE = "connection_profile_storage" as const;

export function connectionProfileConsentRow(options: {
  accountId: string;
  organizationId: string;
  ipHash: string;
  uaHash: string;
}): {
  account_id: string;
  session_id: null;
  organization_id: string;
  consent_type: typeof CONSENT_TYPE;
  consent_version: string;
  granted: true;
  consent_text: string;
  ip_hash: string;
  ua_hash: string;
} {
  return {
    account_id: options.accountId,
    session_id: null,
    organization_id: options.organizationId,
    consent_type: CONSENT_TYPE,
    consent_version: CONNECTION_PROFILE_CONSENT_VERSION,
    granted: true,
    consent_text: CONNECTION_PROFILE_CONSENT_TEXT.connection_profile_storage,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}

export async function hasActiveConnectionProfileConsent(
  admin: SupabaseClient,
  accountId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("consent_records")
    .select("id")
    .eq("account_id", accountId)
    .eq("consent_type", CONSENT_TYPE)
    .eq("granted", true)
    .is("withdrawn_at", null)
    .limit(1);

  if (error || !data) {
    return false;
  }

  return data.length > 0;
}

/**
 * Intrekken laat de rij staan — de AVG-administratie moet kunnen laten zien dát
 * er toestemming was en wanneer die verviel. Alleen withdrawn_at wordt gezet.
 */
export async function withdrawConnectionProfileConsent(
  admin: SupabaseClient,
  accountId: string,
): Promise<boolean> {
  const { error } = await admin
    .from("consent_records")
    .update({ withdrawn_at: new Date().toISOString() })
    .eq("account_id", accountId)
    .eq("consent_type", CONSENT_TYPE)
    .is("withdrawn_at", null);

  return !error;
}
