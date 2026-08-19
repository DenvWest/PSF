import { emitEvent } from "@/lib/events";
import { resolveNextReviewDate } from "@/lib/supplement-verdict";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  StoredSupplementVerdict,
  SupplementVerdict,
  VerdictEvidence,
  VerdictValue,
} from "@/types/verdict";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

const VERDICT_SELECT =
  "id, ingredient_key, verdict, reason_key, rules_version, next_review_at, created_at, superseded_at, based_on";

type VerdictRow = {
  id: string;
  ingredient_key: string;
  verdict: string;
  reason_key: string;
  rules_version: string;
  next_review_at: string | null;
  created_at: string;
  superseded_at: string | null;
  based_on: unknown;
};

/** Defensief: `based_on` is jsonb met default `{}`, en oudere rijen kunnen een ander vorm hebben. */
function parseBasedOn(value: unknown): VerdictEvidence | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("scores" in value) ||
    !("signals" in value) ||
    !("triggeredBy" in value)
  ) {
    return null;
  }
  return value as VerdictEvidence;
}

function isVerdictValue(value: string): value is VerdictValue {
  return (
    value === "kopen" ||
    value === "niet_nodig" ||
    value === "eerst_leefstijl" ||
    value === "nooit"
  );
}

function mapRow(row: VerdictRow): StoredSupplementVerdict | null {
  if (!isVerdictValue(row.verdict)) {
    return null;
  }
  return {
    id: row.id,
    ingredientKey: row.ingredient_key,
    verdict: row.verdict,
    reasonKey: row.reason_key,
    rulesVersion: row.rules_version,
    nextReviewAt: row.next_review_at,
    createdAt: row.created_at,
    supersededAt: row.superseded_at,
    basedOn: parseBasedOn(row.based_on),
  };
}

export type RecordVerdictsOptions = {
  sessionId?: string | null;
  now?: Date;
  /**
   * De al gelezen geldige oordelen. De dashboard-render leest die toch al —
   * meegeven scheelt een round-trip op elke paginaweergave.
   */
  previous?: StoredSupplementVerdict[];
};

/**
 * Welke afgeleide oordelen echt afwijken van wat er staat. Puur, zodat een
 * aanroeper kan bepalen of er überhaupt geschreven moet worden zonder de DB
 * aan te raken.
 */
export function selectChangedVerdicts(
  previous: StoredSupplementVerdict[],
  verdicts: SupplementVerdict[],
): SupplementVerdict[] {
  const previousByKey = new Map(previous.map((row) => [row.ingredientKey, row]));
  return verdicts.filter((verdict) => {
    const current = previousByKey.get(verdict.ingredientKey);
    return !(
      current &&
      current.verdict === verdict.verdict &&
      current.reasonKey === verdict.reasonKey &&
      current.rulesVersion === verdict.rulesVersion
    );
  });
}

export type RecordVerdictsResult = {
  /** Ingrediënten waarvan het oordeel daadwerkelijk omsloeg. */
  changed: string[];
  /** De geldige oordelen ná deze ronde — scheelt de aanroeper een tweede query. */
  current: StoredSupplementVerdict[];
};

/**
 * Legt oordelen vast. Ongewijzigde oordelen schrijven niets — alleen een echte
 * omslag (kopen → niet_nodig, of een andere reden) levert een nieuwe rij op.
 * Dat houdt de historie leesbaar als "wat is er veranderd en waarom".
 */
export async function recordSupplementVerdicts(
  admin: SupabaseAdmin,
  accountId: string,
  verdicts: SupplementVerdict[],
  options: RecordVerdictsOptions = {},
): Promise<RecordVerdictsResult> {
  const previous =
    options.previous ?? (await getCurrentSupplementVerdicts(admin, accountId));
  const previousByKey = new Map(previous.map((row) => [row.ingredientKey, row]));
  const changed: string[] = [];

  for (const verdict of selectChangedVerdicts(previous, verdicts)) {
    const { data, error } = await admin.rpc("record_supplement_verdict", {
      p_account_id: accountId,
      p_ingredient_key: verdict.ingredientKey,
      p_verdict: verdict.verdict,
      p_reason_key: verdict.reasonKey,
      p_rules_version: verdict.rulesVersion,
      p_based_on: verdict.evidence,
      p_based_on_session_id: options.sessionId ?? null,
      p_next_review_at: resolveNextReviewDate(verdict, options.now),
    });

    if (error) {
      console.error("[recordSupplementVerdicts] rpc failed:", {
        ingredientKey: verdict.ingredientKey,
        message: error.message,
      });
      continue;
    }

    const result = Array.isArray(data) ? data[0] : null;
    if (!result || result.changed !== true) {
      continue;
    }

    changed.push(verdict.ingredientKey);

    await emitEvent({
      eventType: "verdict.changed",
      sessionId: options.sessionId ?? null,
      payload: {
        ingredient_key: verdict.ingredientKey,
        verdict: verdict.verdict,
        reason_key: verdict.reasonKey,
        previous_verdict: previousByKey.get(verdict.ingredientKey)?.verdict ?? null,
        rules_version: verdict.rulesVersion,
      },
    });
  }

  return {
    changed,
    current:
      changed.length === 0
        ? previous
        : await getCurrentSupplementVerdicts(admin, accountId),
  };
}

export async function getCurrentSupplementVerdicts(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<StoredSupplementVerdict[]> {
  const { data } = await admin
    .from("supplement_verdicts")
    .select(VERDICT_SELECT)
    .eq("account_id", accountId)
    .is("superseded_at", null)
    .order("ingredient_key", { ascending: true });

  return ((data ?? []) as VerdictRow[])
    .map(mapRow)
    .filter((row): row is StoredSupplementVerdict => row !== null);
}

/** Volledige historie voor één ingrediënt, nieuwste eerst — de "waarom is dit veranderd"-view. */
export async function getSupplementVerdictHistory(
  admin: SupabaseAdmin,
  accountId: string,
  ingredientKey: string,
): Promise<StoredSupplementVerdict[]> {
  const { data } = await admin
    .from("supplement_verdicts")
    .select(VERDICT_SELECT)
    .eq("account_id", accountId)
    .eq("ingredient_key", ingredientKey)
    .order("created_at", { ascending: false });

  return ((data ?? []) as VerdictRow[])
    .map(mapRow)
    .filter((row): row is StoredSupplementVerdict => row !== null);
}

/** Oordelen die toe zijn aan hertoetsing — voedt stap 2 (hercheck/herbestelling). */
export async function getSupplementVerdictsDueForReview(
  admin: SupabaseAdmin,
  accountId: string,
  onOrBefore: string,
): Promise<StoredSupplementVerdict[]> {
  const { data } = await admin
    .from("supplement_verdicts")
    .select(VERDICT_SELECT)
    .eq("account_id", accountId)
    .is("superseded_at", null)
    .not("next_review_at", "is", null)
    .lte("next_review_at", onOrBefore)
    .order("next_review_at", { ascending: true });

  return ((data ?? []) as VerdictRow[])
    .map(mapRow)
    .filter((row): row is StoredSupplementVerdict => row !== null);
}
