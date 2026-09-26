import { describe, it, expect } from "vitest";
import {
  resolveCommissions,
  type ResolutionContract,
  type ResolutionRule,
} from "@/lib/partnerdesk/commission-resolution";
import { computeExpectedCommissionCents } from "@/lib/partnerdesk/commission-amount";

const TODAY = "2026-09-26";

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

describe("computeExpectedCommissionCents", () => {
  it("rekent een percentageregel uit tegen het orderbedrag", () => {
    const { groups } = resolveCommissions(
      [rule({ kind: "cps_percent", rate_percent: 10 })],
      [contract()],
      TODAY,
    );
    expect(computeExpectedCommissionCents(groups, "sale", 10000)).toBe(1000);
  });

  it("rondt af op hele centen", () => {
    const { groups } = resolveCommissions(
      [rule({ kind: "cps_percent", rate_percent: 8.5 })],
      [contract()],
      TODAY,
    );
    // 8,5% van 1999 cent = 169,915 -> 170
    expect(computeExpectedCommissionCents(groups, "sale", 1999)).toBe(170);
  });

  it("gebruikt een vast bedrag ongeacht het orderbedrag", () => {
    const { groups } = resolveCommissions(
      [rule({ kind: "cps_fixed", rate_percent: null, amount_cents: 500 })],
      [contract()],
      TODAY,
    );
    expect(computeExpectedCommissionCents(groups, "sale", 999999)).toBe(500);
  });

  it("resolveert cpl voor een lead, los van cps-regels", () => {
    const { groups } = resolveCommissions(
      [
        rule({ kind: "cps_percent", rate_percent: 10 }),
        rule({ kind: "cpl", rate_percent: null, amount_cents: 250 }),
      ],
      [contract()],
      TODAY,
    );
    expect(computeExpectedCommissionCents(groups, "lead", 0)).toBe(250);
  });

  it("geeft null wanneer er geen toepasselijke regel is", () => {
    const { groups } = resolveCommissions(
      [rule({ kind: "cpc", rate_percent: null, amount_cents: 5 })],
      [contract()],
      TODAY,
    );
    expect(computeExpectedCommissionCents(groups, "sale", 10000)).toBeNull();
  });

  it("kiest cps_percent boven cps_fixed wanneer die wint in resolutie (promo overschrijft standaard)", () => {
    const std = rule({ kind: "cps_fixed", rate_percent: null, amount_cents: 300, rule_type: "standard" });
    const promo = rule({ kind: "cps_percent", rate_percent: 15, rule_type: "promo" });
    const { groups } = resolveCommissions([std, promo], [contract()], TODAY);

    // promo (cps_percent) en std (cps_fixed) zijn twee verschillende kinds,
    // dus ze winnen allebei hun eigen groep — computeExpectedCommissionCents
    // zoekt het eerste toepasselijke kind uit kindsForType, dat is cps_percent.
    expect(computeExpectedCommissionCents(groups, "sale", 10000)).toBe(1500);
  });
});
