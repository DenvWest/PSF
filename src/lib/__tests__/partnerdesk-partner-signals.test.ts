import { describe, it, expect } from "vitest";
import {
  computePartnerSignals,
  taskOverdueSignal,
  type PartnerSignalBundle,
} from "@/lib/partnerdesk/partner-signals";
import type {
  PdCommissionRule,
  PdContact,
  PdContract,
  PdPartner,
} from "@/types/partnerdesk";

const TODAY = "2026-07-12";

function partner(over: Partial<PdPartner> = {}): PdPartner {
  return {
    id: "p1",
    created_at: "2026-01-01T00:00:00Z",
    status: "active",
    archived_at: null,
    ...over,
  } as PdPartner;
}

function contract(over: Partial<PdContract> = {}): PdContract {
  return {
    id: "c1",
    number: "#2026-01",
    starts_on: "2026-01-01",
    ends_on: "2026-12-31",
    cancel_by: null,
    auto_renews: false,
    archived_at: null,
    ...over,
  } as PdContract;
}

function rule(over: Partial<PdCommissionRule> = {}): PdCommissionRule {
  return {
    id: "r1",
    contract_id: "c1",
    kind: "cps_percent",
    rate_percent: 8,
    amount_cents: null,
    scope: "all",
    category_id: null,
    rule_type: "standard",
    valid_from: null,
    valid_to: null,
    created_at: "2026-01-01T00:00:00Z",
    archived_at: null,
    ...over,
  } as PdCommissionRule;
}

function contact(over: Partial<PdContact> = {}): PdContact {
  return { id: "k1", last_contact_at: null, archived_at: null, ...over } as PdContact;
}

function bundle(over: Partial<PartnerSignalBundle> = {}): PartnerSignalBundle {
  return { partner: partner(), contracts: [], rules: [], contacts: [contact()], ...over };
}

function types(signals: { type: string }[]): string[] {
  return signals.map((s) => s.type).sort();
}

describe("computePartnerSignals — contracten", () => {
  it("meldt een contract dat over 20 dagen verloopt als rood", () => {
    const res = computePartnerSignals(
      bundle({ contracts: [contract({ ends_on: "2026-08-01" })], rules: [rule()] }),
      TODAY,
    );
    const exp = res.find((s) => s.type === "contract_expiring");
    expect(exp?.severity).toBe("red");
  });

  it("meldt amber bij 50 dagen en niets bij 80 dagen", () => {
    const amber = computePartnerSignals(
      bundle({ contracts: [contract({ ends_on: "2026-08-31" })], rules: [rule()] }),
      TODAY,
    );
    expect(amber.find((s) => s.type === "contract_expiring")?.severity).toBe("amber");

    const none = computePartnerSignals(
      bundle({ contracts: [contract({ ends_on: "2026-09-30" })], rules: [rule()] }),
      TODAY,
    );
    expect(none.find((s) => s.type === "contract_expiring")).toBeUndefined();
  });

  it("meldt geen verloop bij auto_renews", () => {
    const res = computePartnerSignals(
      bundle({ contracts: [contract({ ends_on: "2026-08-01", auto_renews: true })], rules: [rule()] }),
      TODAY,
    );
    expect(res.find((s) => s.type === "contract_expiring")).toBeUndefined();
  });

  it("meldt de opzegdeadline rood (<14d) en amber (<30d)", () => {
    const red = computePartnerSignals(
      bundle({ contracts: [contract({ cancel_by: "2026-07-20" })], rules: [rule()] }),
      TODAY,
    );
    expect(red.find((s) => s.type === "cancel_deadline")?.severity).toBe("red");

    const amber = computePartnerSignals(
      bundle({ contracts: [contract({ cancel_by: "2026-08-05" })], rules: [rule()] }),
      TODAY,
    );
    expect(amber.find((s) => s.type === "cancel_deadline")?.severity).toBe("amber");
  });
});

describe("computePartnerSignals — partnerniveau", () => {
  it("meldt geen contactpersoon", () => {
    const res = computePartnerSignals(bundle({ contacts: [] }), TODAY);
    expect(types(res)).toContain("partner_no_contact");
  });

  it("meldt stil contact na 90 dagen", () => {
    const res = computePartnerSignals(
      bundle({ contacts: [contact({ last_contact_at: "2026-01-01T00:00:00Z" })] }),
      TODAY,
    );
    expect(types(res)).toContain("stale_contact");
  });

  it("meldt ontbrekende commissie bij een actief contract zonder regel", () => {
    const res = computePartnerSignals(
      bundle({ contracts: [contract()], rules: [] }),
      TODAY,
    );
    expect(types(res)).toContain("missing_commission");
  });

  it("meldt geen ontbrekende commissie mét geldige regel", () => {
    const res = computePartnerSignals(
      bundle({ contracts: [contract()], rules: [rule()] }),
      TODAY,
    );
    expect(types(res)).not.toContain("missing_commission");
  });

  it("geeft geen partnerniveau-signalen voor een niet-actieve partner", () => {
    const res = computePartnerSignals(
      bundle({ partner: partner({ status: "onboarding" }), contacts: [], contracts: [contract()], rules: [] }),
      TODAY,
    );
    expect(types(res)).not.toContain("partner_no_contact");
    expect(types(res)).not.toContain("missing_commission");
    // contractsignaal (opzeg/verloop) kan wél, contract is contract
  });
});

describe("taskOverdueSignal", () => {
  it("meldt een te late taak", () => {
    const s = taskOverdueSignal({ id: "t1", partner_id: "p1", due_on: "2026-07-01", title: "Bellen" }, TODAY);
    expect(s?.type).toBe("task_overdue");
    expect(s?.severity).toBe("red");
  });
  it("meldt niets voor een taak vandaag of in de toekomst", () => {
    expect(taskOverdueSignal({ id: "t2", partner_id: null, due_on: TODAY, title: "x" }, TODAY)).toBeNull();
    expect(taskOverdueSignal({ id: "t3", partner_id: null, due_on: null, title: "x" }, TODAY)).toBeNull();
  });
});
