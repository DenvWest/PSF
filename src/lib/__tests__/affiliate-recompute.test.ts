import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recomputeAffiliateAccruals } from "@/lib/affiliate/af-ledger";

// Minimale fake-Supabase die precies de query-vormen van recompute + accrue dekt.
type Row = Record<string, unknown>;
function fakeDb(state: Record<string, Row[]>): SupabaseClient {
  const from = (table: string) => {
    const arr = state[table] ?? (state[table] = []);
    let rows = [...arr];
    const q = {
      select: () => q,
      eq: (c: string, v: unknown) => ((rows = rows.filter((r) => r[c] === v)), q),
      neq: (c: string, v: unknown) => ((rows = rows.filter((r) => r[c] !== v)), q),
      is: (c: string, v: unknown) => ((rows = rows.filter((r) => r[c] === v)), q),
      limit: (n: number) => ((rows = rows.slice(0, n)), q),
      maybeSingle: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
      insert: (row: Row | Row[]) => {
        for (const r of Array.isArray(row) ? row : [row]) arr.push({ id: `id-${arr.length}`, ...r });
        return Promise.resolve({ error: null });
      },
      then: (res: (v: { data: Row[]; error: null }) => void) => res({ data: rows, error: null }),
    };
    return q;
  };
  return { from } as unknown as SupabaseClient;
}

const saleConversion = {
  id: "conv-sale",
  affiliate_id: "aff-1",
  type: "sale",
  revenue_cents: 2000,
  occurred_at: "2026-07-14T12:00:00Z",
  status: "approved",
};

const leadOnlyRule = {
  id: "rule-lead",
  affiliate_id: "aff-1",
  applies_to: "lead",
  value_type: "percent",
  rate_percent: 20,
  amount_cents: null,
  rule_type: "standard",
  valid_from: null,
  valid_to: null,
  archived_at: null,
  created_at: "2026-07-14T00:00:00Z",
};

describe("recomputeAffiliateAccruals — reproductie van het gemelde scenario", () => {
  it("boekt GEEN commissie voor een verkoop als de enige regel lead-only is (de bug)", async () => {
    const state = {
      af_conversions: [{ ...saleConversion }],
      af_commission_rules: [{ ...leadOnlyRule }],
      af_ledger_entries: [] as Row[],
    };
    const created = await recomputeAffiliateAccruals(fakeDb(state), "aff-1");
    expect(created).toBe(0);
    expect(state.af_ledger_entries).toHaveLength(0);
  });

  it("boekt de verkoopcommissie alsnog zodra er een verkoop-regel is (de fix)", async () => {
    const state = {
      af_conversions: [{ ...saleConversion }],
      af_commission_rules: [
        { ...leadOnlyRule },
        {
          ...leadOnlyRule,
          id: "rule-sale",
          applies_to: "sale",
          rate_percent: 20,
        },
      ],
      af_ledger_entries: [] as Row[],
    };
    const created = await recomputeAffiliateAccruals(fakeDb(state), "aff-1");
    expect(created).toBe(1);
    expect(state.af_ledger_entries).toHaveLength(1);
    expect(state.af_ledger_entries[0].amount_cents).toBe(400); // 20% van €20
    expect(state.af_ledger_entries[0].kind).toBe("accrual");
  });

  it("boekt niet dubbel bij een tweede herberekening (idempotent)", async () => {
    const state = {
      af_conversions: [{ ...saleConversion }],
      af_commission_rules: [{ ...leadOnlyRule, id: "rule-sale", applies_to: "sale" }],
      af_ledger_entries: [] as Row[],
    };
    await recomputeAffiliateAccruals(fakeDb(state), "aff-1");
    const secondRun = await recomputeAffiliateAccruals(fakeDb(state), "aff-1");
    expect(secondRun).toBe(0);
    expect(state.af_ledger_entries).toHaveLength(1);
  });
});
