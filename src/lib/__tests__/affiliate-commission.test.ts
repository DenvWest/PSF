import { describe, it, expect } from "vitest";
import { resolveAfCommission } from "@/lib/affiliate/af-commission";
import type { AfCommissionRule } from "@/types/affiliate";

let seq = 0;
function rule(over: Partial<AfCommissionRule> = {}): AfCommissionRule {
  seq += 1;
  return {
    id: `r${seq}`,
    created_at: `2026-01-01T00:00:0${seq % 10}Z`,
    affiliate_id: "a1",
    applies_to: "sale",
    value_type: "percent",
    rate_percent: 20,
    amount_cents: null,
    rule_type: "standard",
    valid_from: null,
    valid_to: null,
    notes: null,
    archived_at: null,
    ...over,
  };
}

const D = "2026-07-12";

describe("resolveAfCommission", () => {
  it("geeft null zonder regels", () => {
    expect(resolveAfCommission([], "sale", D, 10000)).toBeNull();
  });

  it("kiest de enige standaardregel en rekent het percentage", () => {
    const res = resolveAfCommission([rule({ rate_percent: 20 })], "sale", D, 10000);
    expect(res?.amountCents).toBe(2000);
  });

  it("rekent een vast bedrag", () => {
    const res = resolveAfCommission(
      [rule({ value_type: "fixed", rate_percent: null, amount_cents: 500 })],
      "sale",
      D,
      10000,
    );
    expect(res?.amountCents).toBe(500);
  });

  it("laat een promo winnen van de standaard", () => {
    const std = rule({ id: "std", rule_type: "standard", rate_percent: 20 });
    const promo = rule({ id: "promo", rule_type: "promo", rate_percent: 30, valid_to: "2026-07-31" });
    const res = resolveAfCommission([std, promo], "sale", D, 10000);
    expect(res?.rule.id).toBe("promo");
    expect(res?.amountCents).toBe(3000);
  });

  it("negeert een verlopen promo en valt terug op standaard", () => {
    const std = rule({ id: "std", rule_type: "standard", rate_percent: 20 });
    const promo = rule({ id: "promo", rule_type: "promo", rate_percent: 30, valid_to: "2026-07-11" });
    const res = resolveAfCommission([std, promo], "sale", D, 10000);
    expect(res?.rule.id).toBe("std");
  });

  it("filtert op applies_to (lead vs sale), 'both' dekt beide", () => {
    const saleOnly = rule({ id: "s", applies_to: "sale" });
    const leadOnly = rule({ id: "l", applies_to: "lead", value_type: "fixed", rate_percent: null, amount_cents: 500 });
    expect(resolveAfCommission([saleOnly, leadOnly], "lead", D, 0)?.rule.id).toBe("l");
    expect(resolveAfCommission([saleOnly, leadOnly], "sale", D, 10000)?.rule.id).toBe("s");
    const both = rule({ id: "b", applies_to: "both" });
    expect(resolveAfCommission([both], "lead", D, 0)?.rule.id).toBe("b");
  });

  it("laat bij twee promo's de recentste valid_from winnen", () => {
    const oud = rule({ id: "oud", rule_type: "promo", valid_from: "2026-06-01", valid_to: "2026-08-01" });
    const nieuw = rule({ id: "nieuw", rule_type: "promo", valid_from: "2026-07-01", valid_to: "2026-08-01" });
    expect(resolveAfCommission([oud, nieuw], "sale", D, 10000)?.rule.id).toBe("nieuw");
  });

  it("sluit een gearchiveerde regel uit", () => {
    expect(
      resolveAfCommission([rule({ archived_at: "2026-05-01T00:00:00Z" })], "sale", D, 10000),
    ).toBeNull();
  });

  it("respecteert de geldigheidsgrenzen", () => {
    const toekomst = rule({ valid_from: "2026-08-01" });
    expect(resolveAfCommission([toekomst], "sale", D, 10000)).toBeNull();
  });

  it("rondt het percentage-bedrag af op centen", () => {
    const res = resolveAfCommission([rule({ rate_percent: 12.5 })], "sale", D, 4999);
    expect(res?.amountCents).toBe(625); // 4999 * 0.125 = 624.875 → 625
  });
});
