import { describe, expect, it } from "vitest";
import { ingestConversion } from "@/lib/partnerdesk/conversion-ingest";

/** In-memory stub: pd_commission_rules (select+eq), pd_contracts (select+eq), pd_conversions (upsert+select+maybeSingle). */
function createFakeDb(options: {
  rules?: Record<string, unknown>[];
  contracts?: Record<string, unknown>[];
  existingExternalIds?: Set<string>;
}) {
  const rules = options.rules ?? [];
  const contracts = options.contracts ?? [];
  const existing = options.existingExternalIds ?? new Set<string>();
  const inserted: Record<string, unknown>[] = [];

  const db = {
    from(table: string) {
      if (table === "pd_commission_rules") {
        return {
          select() {
            return { eq: async () => ({ data: rules, error: null }) };
          },
        };
      }
      if (table === "pd_contracts") {
        return {
          select() {
            return { eq: async () => ({ data: contracts, error: null }) };
          },
        };
      }
      if (table === "pd_conversions") {
        return {
          upsert(row: Record<string, unknown>) {
            const key = `${row.partner_id}:${row.external_id}`;
            const isDuplicate = existing.has(key);
            if (!isDuplicate) {
              inserted.push(row);
              existing.add(key);
            }
            return {
              select() {
                return {
                  async maybeSingle() {
                    return isDuplicate
                      ? { data: null, error: null }
                      : { data: { id: `conv-${inserted.length}` }, error: null };
                  },
                };
              },
            };
          },
        };
      }
      throw new Error(`Onverwachte tabel: ${table}`);
    },
  };

  return { db, inserted };
}

describe("ingestConversion", () => {
  it("berekent expectedCents via de resolutiemotor en schrijft de conversie", async () => {
    const { db, inserted } = createFakeDb({
      rules: [
        {
          id: "r1",
          contract_id: "c1",
          kind: "cps_percent",
          rate_percent: 10,
          amount_cents: null,
          scope: "all",
          category_id: null,
          rule_type: "standard",
          valid_from: null,
          valid_to: null,
          created_at: "2026-01-01T00:00:00Z",
          archived_at: null,
        },
      ],
      contracts: [
        { id: "c1", number: "#1", starts_on: "2026-01-01", ends_on: null, archived_at: null },
      ],
    });

    const result = await ingestConversion(db as never, {
      partnerId: "p1",
      contractId: "c1",
      clickToken: "abc123",
      externalId: "order-1",
      type: "sale",
      occurredAt: "2026-09-26T12:00:00Z",
      orderRef: "order-1",
      revenueCents: 10000,
      currency: "EUR",
      ingestMethod: "postback",
      raw: {},
    });

    expect(result.ok).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.expectedCents).toBe(1000);
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ status: "pending", commission_cents: 1000 });
  });

  it("geeft duplicate:true bij een herhaalde (partner_id, external_id) zonder opnieuw te schrijven", async () => {
    const { db, inserted } = createFakeDb({
      existingExternalIds: new Set(["p1:order-1"]),
    });

    const result = await ingestConversion(db as never, {
      partnerId: "p1",
      contractId: null,
      clickToken: null,
      externalId: "order-1",
      type: "sale",
      occurredAt: "2026-09-26T12:00:00Z",
      orderRef: null,
      revenueCents: 5000,
      currency: "EUR",
      ingestMethod: "postback",
      raw: {},
    });

    expect(result.ok).toBe(true);
    expect(result.duplicate).toBe(true);
    expect(result.conversionId).toBeNull();
    expect(inserted).toHaveLength(0);
  });

  it("geeft expectedCents null als er geen toepasselijke commissieregel is", async () => {
    const { db } = createFakeDb({ rules: [], contracts: [] });

    const result = await ingestConversion(db as never, {
      partnerId: "p1",
      contractId: null,
      clickToken: null,
      externalId: "order-2",
      type: "sale",
      occurredAt: "2026-09-26T12:00:00Z",
      orderRef: null,
      revenueCents: 5000,
      currency: "EUR",
      ingestMethod: "manual",
      raw: {},
    });

    expect(result.ok).toBe(true);
    expect(result.expectedCents).toBeNull();
  });

  it("zet status altijd op pending, nooit automatisch approved", async () => {
    const { db, inserted } = createFakeDb({});

    await ingestConversion(db as never, {
      partnerId: "p1",
      contractId: null,
      clickToken: null,
      externalId: "order-3",
      type: "lead",
      occurredAt: "2026-09-26T12:00:00Z",
      orderRef: null,
      revenueCents: 0,
      currency: "EUR",
      ingestMethod: "postback",
      raw: { source: "webhook" },
    });

    expect(inserted[0]).toMatchObject({ status: "pending" });
  });
});
