import type { SupabaseClient } from "@supabase/supabase-js";
import type { NutritionCheckSessionInsert } from "@/types/intake-session-insert";

/**
 * De check op `/intake` maakt zelf een sessie aan als er nog geen is.
 *
 * Tot september 2026 kon alleen de brede check een rij in `intake_sessions`
 * aanmaken, en gaf `nutrition-log` zonder sessie een 401 — precies voor de
 * bezoeker die alleen de check deed, de enige check die nog wordt aangeboden.
 * Zie BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.3.
 *
 * Staat achter een vlag, zodat deploy en rollback los staan van de migratie:
 * uit = het gedrag van vóór deze wijziging (401), zonder dat er iets anders
 * verandert.
 */
export function isCheckSessionCreateEnabled(): boolean {
  return process.env.CHECK_SESSION_CREATE_ENABLED?.trim() === "true";
}

export function normalizeReferralSource(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const normalized = decoded.replace(/\s+/g, " ").trim().slice(0, 200);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

/**
 * Voegt een sessie zonder meting van de brede check in.
 *
 * Maakt bewust géén baseline-snapshot aan (die tabel eist een profiellabel en
 * leeftijdsband) en verstuurt géén `intake.completed`: dat event betekent "brede
 * check afgerond", en nurture leest er een profiel uit dat hier niet bestaat.
 */
export async function createNutritionCheckSession(
  admin: SupabaseClient,
  options: {
    organizationId: string;
    accountId: string | null;
    referralSource: string | null;
  },
): Promise<{ ok: true; sessionId: string } | { ok: false }> {
  const insert: NutritionCheckSessionInsert = {
    organization_id: options.organizationId,
    session_kind: "nutrition",
    account_id: options.accountId,
    referral_source: options.referralSource,
  };

  const { data, error } = await admin
    .from("intake_sessions")
    .insert(insert)
    .select("id")
    .single();

  const sessionId = typeof data?.id === "string" ? data.id : "";
  if (error || !sessionId) {
    console.error("[intake-session-create] insert error:", error);
    return { ok: false };
  }

  return { ok: true, sessionId };
}
