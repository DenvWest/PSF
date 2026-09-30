import { describe, expect, it } from "vitest";
import { computePartnerSignals } from "@/lib/partnerdesk/partner-signals";
import {
  buildReviewOutcome,
  ledgerMismatches,
  reportingCoverage,
  stalePendingConversions,
  summarizeRevenue,
} from "@/lib/partnerdesk/revenue";
import type { PdContract, PdConversion, PdLedgerEntry, PdPartner } from "@/types/partnerdesk";

const TODAY = "2026-09-30";

function contract(over: Partial<PdContract> = {}): PdContract {
  return {
    id: "c1",
    number: "#1",
    starts_on: "2026-01-01",
    ends_on: null,
    archived_at: null,
    auto_renews: false,
    cancel_by: null,
    ...over,
  } as PdContract;
}

function conversion(over: Partial<PdConversion> = {}): PdConversion {
  return {
    id: "v1",
    partner_id: "p1",
    type: "sale",
    occurred_at: "2026-09-01T12:00:00Z",
    revenue_cents: 10000,
    commission_cents: 800,
    status: "pending",
    ingest_method: "manual",
    imported_at: "2026-09-01T12:00:00Z",
    ...over,
  } as PdConversion;
}

function entry(over: Partial<PdLedgerEntry> = {}): PdLedgerEntry {
  return {
    id: "l1",
    partner_id: "p1",
    conversion_id: "v1",
    kind: "accrual",
    amount_cents: 800,
    expected_cents: 800,
    state: "approved",
    period: "2026-09",
    posted_at: "2026-09-02T00:00:00Z",
    ...over,
  } as PdLedgerEntry;
}

describe("reportingCoverage", () => {
  it("toont de methode van het actieve contract", () => {
    const c = reportingCoverage({
      networkKind: "direct",
      contracts: [contract({ reporting_method: "postback", reporting_cadence: "realtime" })],
      today: TODAY,
    });
    expect(c.kind).toBe("postback");
    expect(c.automatic).toBe(true);
    expect(c.cadence).toBe("realtime");
  });

  it("markeert een netwerkpartner zonder methode als netwerk, niet als €0", () => {
    const c = reportingCoverage({ networkKind: "network", contracts: [contract()], today: TODAY });
    expect(c.kind).toBe("network");
    expect(c.automatic).toBe(false);
  });

  it("markeert een directe partner zonder methode als niet vastgelegd", () => {
    expect(reportingCoverage({ networkKind: "direct", contracts: [], today: TODAY }).kind).toBe("unset");
  });

  it("negeert gearchiveerde contracten", () => {
    const c = reportingCoverage({
      networkKind: "direct",
      contracts: [contract({ reporting_method: "import", archived_at: "2026-02-01T00:00:00Z" })],
      today: TODAY,
    });
    expect(c.kind).toBe("unset");
  });
});

describe("buildReviewOutcome", () => {
  it("keurt goed met het verwachte bedrag als standaard", () => {
    const o = buildReviewOutcome(conversion(), "approve", null);
    expect(o.conversionStatus).toBe("approved");
    expect(o.ledger).toMatchObject({ amount_cents: 800, expected_cents: 800, state: "approved", period: "2026-09" });
  });

  it("boekt een afwijkend ontvangen bedrag", () => {
    expect(buildReviewOutcome(conversion(), "approve", 600).ledger.amount_cents).toBe(600);
  });

  it("boekt bij afkeuren 0 tegen het verwachte bedrag", () => {
    const o = buildReviewOutcome(conversion(), "reject", null);
    expect(o.conversionStatus).toBe("rejected");
    expect(o.ledger).toMatchObject({ amount_cents: 0, expected_cents: 800, state: "rejected" });
  });

  it("boekt 0 als er geen regel en geen ontvangen bedrag is", () => {
    const o = buildReviewOutcome(conversion({ commission_cents: null }), "approve", null);
    expect(o.ledger.amount_cents).toBe(0);
    expect(o.ledger.expected_cents).toBeNull();
  });
});

describe("ledgerMismatches / summarizeRevenue", () => {
  it("vlagt alleen regels met een verwacht bedrag dat afwijkt", () => {
    const entries = [
      entry(),
      entry({ id: "l2", amount_cents: 600 }),
      entry({ id: "l3", amount_cents: 0, expected_cents: 800, state: "rejected" }),
      entry({ id: "l4", amount_cents: 300, expected_cents: null }),
    ];
    expect(ledgerMismatches(entries).map((e) => e.id)).toEqual(["l2", "l3"]);
  });

  it("telt per status en houdt de laatste inname bij", () => {
    const s = summarizeRevenue(
      [
        conversion(),
        conversion({ id: "v2", status: "approved", imported_at: "2026-09-10T00:00:00Z" }),
        conversion({ id: "v3", status: "rejected" }),
      ],
      [entry({ amount_cents: 600 })],
    );
    expect(s.pending.count).toBe(1);
    expect(s.approved.revenueCents).toBe(10000);
    expect(s.rejected.count).toBe(1);
    expect(s.lastIngestAt).toBe("2026-09-10T00:00:00Z");
    expect(s.approvedCents).toBe(600);
    expect(s.mismatchCents).toBe(200);
  });

  it("geeft geen laatste inname zonder conversies", () => {
    expect(summarizeRevenue([], []).lastIngestAt).toBeNull();
  });
});

describe("stalePendingConversions", () => {
  it("vindt pending conversies ouder dan 14 dagen", () => {
    const stale = stalePendingConversions(
      [
        conversion({ id: "old", imported_at: "2026-09-01T00:00:00Z" }),
        conversion({ id: "new", imported_at: "2026-09-25T00:00:00Z" }),
        conversion({ id: "done", status: "approved", imported_at: "2026-08-01T00:00:00Z" }),
      ],
      TODAY,
    );
    expect(stale.map((c) => c.id)).toEqual(["old"]);
  });
});

describe("omzetsignalen", () => {
  const partner = { id: "p1", created_at: "2026-01-01T00:00:00Z", status: "ended", archived_at: null } as PdPartner;

  it("geeft een rood signaal bij afwijking, ook voor een beëindigde partner", () => {
    const out = computePartnerSignals(
      {
        partner,
        contracts: [],
        rules: [],
        contacts: [],
        revenue: { mismatchCount: 2, mismatchCents: 500, stalePendingCount: 3 },
      },
      TODAY,
    );
    expect(out.map((s) => s.type)).toEqual(["commission_mismatch"]);
    expect(out[0].severity).toBe("red");
  });

  it("geeft een ambersignaal voor blijvend onbeoordeelde conversies bij een actieve partner", () => {
    const out = computePartnerSignals(
      {
        partner: { ...partner, status: "active" },
        contracts: [],
        rules: [],
        contacts: [],
        revenue: { mismatchCount: 0, mismatchCents: 0, stalePendingCount: 3 },
      },
      TODAY,
    );
    expect(out.find((s) => s.type === "conversions_unreviewed")?.severity).toBe("amber");
  });

  it("geeft niets zonder omzetdata", () => {
    const out = computePartnerSignals({ partner, contracts: [], rules: [], contacts: [] }, TODAY);
    expect(out).toEqual([]);
  });
});
