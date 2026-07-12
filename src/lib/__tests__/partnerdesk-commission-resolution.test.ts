import { describe, it, expect } from "vitest";
import {
  resolveCommissions,
  type ResolutionContract,
  type ResolutionRule,
} from "@/lib/partnerdesk/commission-resolution";

const TODAY = "2026-07-12";

function contract(over: Partial<ResolutionContract> = {}): ResolutionContract {
  return {
    id: "c1",
    number: "#2026-01",
    starts_on: "2026-01-01",
    ends_on: "2026-12-31",
    archived_at: null,
    ...over,
  };
}

let seq = 0;
function rule(over: Partial<ResolutionRule> = {}): ResolutionRule {
  seq += 1;
  return {
    id: `r${seq}`,
    contract_id: "c1",
    kind: "cps_percent",
    rate_percent: 8,
    amount_cents: null,
    scope: "all",
    category_id: null,
    rule_type: "standard",
    valid_from: null,
    valid_to: null,
    created_at: `2026-01-01T00:00:0${seq % 10}Z`,
    archived_at: null,
    ...over,
  };
}

describe("resolveCommissions", () => {
  it("geeft geen resultaat zonder regels", () => {
    const res = resolveCommissions([], [contract()], TODAY);
    expect(res.hasAny).toBe(false);
    expect(res.groups).toHaveLength(0);
  });

  it("kiest de enige standaardregel op een actief contract", () => {
    const res = resolveCommissions([rule({ id: "std" })], [contract()], TODAY);
    expect(res.hasAny).toBe(true);
    expect(res.groups[0].winner.id).toBe("std");
    expect(res.groups[0].reasoning[0].won).toBe(true);
  });

  it("laat een tijdelijke actie winnen van de standaard", () => {
    const std = rule({ id: "std", rule_type: "standard", rate_percent: 8 });
    const promo = rule({
      id: "promo",
      rule_type: "promo",
      rate_percent: 12,
      valid_from: "2026-07-01",
      valid_to: "2026-07-31",
    });
    const res = resolveCommissions([std, promo], [contract()], TODAY);
    expect(res.groups[0].winner.id).toBe("promo");
    expect(res.groups[0].validUntil).toBe("2026-07-31");
    expect(res.groups[0].reasoning.find((r) => r.rule.id === "std")?.reason).toContain(
      "Overschreven",
    );
  });

  it("laat bij twee acties de recentste valid_from winnen", () => {
    const oud = rule({ id: "oud", rule_type: "promo", valid_from: "2026-06-01", valid_to: "2026-08-01" });
    const nieuw = rule({ id: "nieuw", rule_type: "promo", valid_from: "2026-07-01", valid_to: "2026-08-01" });
    const res = resolveCommissions([oud, nieuw], [contract()], TODAY);
    expect(res.groups[0].winner.id).toBe("nieuw");
  });

  it("negeert een verlopen actie en valt terug op de standaard", () => {
    const std = rule({ id: "std", rule_type: "standard" });
    const verlopen = rule({
      id: "verlopen",
      rule_type: "promo",
      valid_from: "2026-06-01",
      valid_to: "2026-07-11", // gisteren
    });
    const res = resolveCommissions([std, verlopen], [contract()], TODAY);
    expect(res.groups[0].winner.id).toBe("std");
  });

  it("telt regels van een concept-contract niet mee", () => {
    const res = resolveCommissions(
      [rule()],
      [contract({ starts_on: "2026-09-01" })],
      TODAY,
    );
    expect(res.hasAny).toBe(false);
  });

  it("telt regels van een verlopen contract niet mee", () => {
    const res = resolveCommissions(
      [rule()],
      [contract({ ends_on: "2026-06-30" })],
      TODAY,
    );
    expect(res.hasAny).toBe(false);
  });

  it("telt regels van een gearchiveerd contract niet mee", () => {
    const res = resolveCommissions(
      [rule()],
      [contract({ archived_at: "2026-05-01T00:00:00Z" })],
      TODAY,
    );
    expect(res.hasAny).toBe(false);
  });

  it("sluit een gearchiveerde regel uit", () => {
    const res = resolveCommissions(
      [rule({ archived_at: "2026-05-01T00:00:00Z" })],
      [contract()],
      TODAY,
    );
    expect(res.hasAny).toBe(false);
  });

  it("laat een bonus nooit winnen maar toont hem apart", () => {
    const std = rule({ id: "std", rule_type: "standard" });
    const bonus = rule({ id: "bonus", rule_type: "bonus" });
    const res = resolveCommissions([std, bonus], [contract()], TODAY);
    expect(res.groups[0].winner.id).toBe("std");
    expect(res.bonuses.map((b) => b.id)).toEqual(["bonus"]);
  });

  it("laat een categorieregel winnen van een alles-regel", () => {
    const alles = rule({ id: "alles", scope: "all" });
    const cat = rule({ id: "cat", scope: "category", category_id: "slaap" });
    const res = resolveCommissions([alles, cat], [contract()], TODAY);
    expect(res.groups[0].winner.id).toBe("cat");
  });

  it("rangschikt uitzondering > actie > standaard", () => {
    const std = rule({ id: "std", rule_type: "standard" });
    const promo = rule({ id: "promo", rule_type: "promo", valid_to: "2026-12-01" });
    const exc = rule({ id: "exc", rule_type: "exception" });
    const res = resolveCommissions([std, promo, exc], [contract()], TODAY);
    expect(res.groups[0].winner.id).toBe("exc");
    expect(res.groups[0].reasoning.map((r) => r.rule.id)).toEqual(["exc", "promo", "std"]);
  });

  it("geeft één groep per commissie-soort", () => {
    const cps = rule({ id: "cps", kind: "cps_percent", rate_percent: 8 });
    const cpl = rule({ id: "cpl", kind: "cpl", rate_percent: null, amount_cents: 250 });
    const res = resolveCommissions([cps, cpl], [contract()], TODAY);
    expect(res.groups).toHaveLength(2);
    const kinds = res.groups.map((g) => g.kind).sort();
    expect(kinds).toEqual(["cpl", "cps_percent"]);
  });

  it("valt voor 'geldig t/m' terug op de contract-einddatum als de regel geen valid_to heeft", () => {
    const res = resolveCommissions([rule({ valid_to: null })], [contract({ ends_on: "2026-12-31" })], TODAY);
    expect(res.groups[0].validUntil).toBe("2026-12-31");
    expect(res.groups[0].contractNumber).toBe("#2026-01");
  });
});
