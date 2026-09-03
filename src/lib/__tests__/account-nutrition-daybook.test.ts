import { describe, expect, it, vi } from "vitest";
import type { OrgScopedClient } from "@/lib/db/scoped";
import {
  isValidEntryDate,
  sanitizePortions,
  upsertDaybookDay,
} from "@/lib/account-nutrition-daybook";

describe("sanitizePortions", () => {
  it("houdt bekende voedselgroepen", () => {
    expect(sanitizePortions({ groente: 3, fruit: 2 })).toEqual({ groente: 3, fruit: 2 });
  });

  it("laat onbekende sleutels vallen zonder de rest weg te gooien", () => {
    // Een onbekende sleutel is een client die voorloopt, geen reden om
    // iemands dag af te wijzen.
    expect(sanitizePortions({ groente: 2, pizza: 5 })).toEqual({ groente: 2 });
  });

  it("weigert negatieve, oneindige en niet-numerieke waarden", () => {
    expect(sanitizePortions({ groente: -1, fruit: Infinity, granen: "veel" })).toEqual({});
  });

  it("kapt halve porties af", () => {
    // Het dagboek kent hele porties; 1,5 zou precisie claimen die de
    // invoervorm niet biedt.
    expect(sanitizePortions({ groente: 2.7 })).toEqual({ groente: 2 });
  });

  it("kapt onrealistische aantallen af", () => {
    expect(sanitizePortions({ groente: 999 })).toEqual({ groente: 20 });
  });

  it("geeft een lege map bij onzin-invoer", () => {
    expect(sanitizePortions(null)).toEqual({});
    expect(sanitizePortions("groente")).toEqual({});
    expect(sanitizePortions([1, 2, 3])).toEqual({});
  });
});

describe("isValidEntryDate", () => {
  const today = "2026-09-03";

  it("aanvaardt een dag die al geweest is", () => {
    expect(isValidEntryDate("2026-09-02", today)).toBe(true);
  });

  it("aanvaardt vandaag", () => {
    expect(isValidEntryDate(today, today)).toBe(true);
  });

  it("weigert de toekomst", () => {
    expect(isValidEntryDate("2026-09-04", today)).toBe(false);
  });

  it("weigert wat geen ISO-datum is", () => {
    expect(isValidEntryDate("gisteren", today)).toBe(false);
    expect(isValidEntryDate("03-09-2026", today)).toBe(false);
  });
});

describe("upsertDaybookDay", () => {
  it("leidt de dagsoort af uit de datum en schrijft op (account, dag)", async () => {
    const rows: Record<string, unknown>[] = [];
    const upsert = vi.fn((row: Record<string, unknown>) => {
      rows.push(row);
      return Promise.resolve({ error: null });
    });
    const supabase = { raw: {}, from: vi.fn(() => ({ upsert })) } as unknown as OrgScopedClient;

    // 5 september 2026 is een zaterdag.
    const ok = await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-05",
      porties: { groente: 2 },
    });

    expect(ok).toBe(true);
    expect(rows[0].day_kind).toBe("weekend");
    expect(upsert).toHaveBeenCalledWith(expect.anything(), {
      onConflict: "account_id,entry_date",
    });
  });

  it("schrijft geen score-, calorie- of gramveld mee", async () => {
    const rows: Record<string, unknown>[] = [];
    const upsert = vi.fn((row: Record<string, unknown>) => {
      rows.push(row);
      return Promise.resolve({ error: null });
    });
    const supabase = { raw: {}, from: vi.fn(() => ({ upsert })) } as unknown as OrgScopedClient;

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      porties: { groente: 3 },
    });

    // De lock: het dagboek verrijkt de readout en voedt nooit een score.
    expect(Object.keys(rows[0]).sort()).toEqual([
      "account_id",
      "day_kind",
      "entry_date",
      "portions",
    ]);
  });

  it("meldt falen zonder te werpen", async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: { message: "nee" } }));
    const supabase = { raw: {}, from: vi.fn(() => ({ upsert })) } as unknown as OrgScopedClient;
    await expect(
      upsertDaybookDay(supabase, "acc", { date: "2026-09-01", porties: { groente: 1 } }),
    ).resolves.toBe(false);
  });
});
