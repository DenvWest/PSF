import type { SupabaseClient } from "@supabase/supabase-js";
import { NUTRITION_AI_CHAT_CONSENT_TEXT } from "@/lib/consent-texts";

/**
 * Toestemming voor het chatvenster met LLM (V5). Account-scoped, zelfde vorm als
 * `connection-profile-consent.ts`. Zonder toestemming blijven de schuifjes en de
 * zoekfunctie van het dagboek gewoon werken.
 */

export const NUTRITION_AI_CHAT_CONSENT_VERSION = "0.1-concept";

const CONSENT_TYPE = "nutrition_ai_chat" as const;

export function nutritionAiChatConsentRow(options: {
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
    consent_version: NUTRITION_AI_CHAT_CONSENT_VERSION,
    granted: true,
    consent_text: NUTRITION_AI_CHAT_CONSENT_TEXT.nutrition_ai_chat,
    ip_hash: options.ipHash,
    ua_hash: options.uaHash,
  };
}

export async function hasActiveNutritionAiChatConsent(
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

/** Intrekken laat de rij staan; alleen `withdrawn_at` wordt gezet. */
export async function withdrawNutritionAiChatConsent(
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
