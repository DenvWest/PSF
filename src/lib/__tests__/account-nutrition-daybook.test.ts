import { describe, expect, it, vi } from "vitest";
import type { OrgScopedClient } from "@/lib/db/scoped";
import {
  isValidEntryDate,
  sanitizeMeals,
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

describe("sanitizeMeals", () => {
  it("houdt geldige momenten met inhoud", () => {
    expect(sanitizeMeals({ ontbijt: { zuivel: 1 }, avondeten: { groente: 2 } })).toEqual({
      ontbijt: { zuivel: 1 },
      avondeten: { groente: 2 },
    });
  });

  it("laat onbekende momenten vallen", () => {
    expect(sanitizeMeals({ brunch: { zuivel: 1 }, lunch: { groente: 1 } })).toEqual({
      lunch: { groente: 1 },
    });
  });

  it("verwijdert momenten die na opschonen leeg zijn", () => {
    // Een lege bak is hetzelfde als geen bak: anders zijn "overgeslagen" en
    // "vergeten in te vullen" niet uit elkaar te houden.
    expect(sanitizeMeals({ ontbijt: {}, lunch: { pizza: 3 } })).toEqual({});
  });

  it("past dezelfde portie-validatie toe binnen een moment", () => {
    expect(sanitizeMeals({ lunch: { groente: 2.7, fruit: -1 } })).toEqual({
      lunch: { groente: 2 },
    });
  });

  it("geeft een lege structuur bij onzin", () => {
    expect(sanitizeMeals(null)).toEqual({});
    expect(sanitizeMeals([1, 2])).toEqual({});
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
    // Geen score-, calorie- of gramkolom — water is de enige eenheid, en die
    // draagt geen norm.
    expect(Object.keys(rows[0]).sort()).toEqual([
      "account_id",
      "day_kind",
      "entry_date",
      "meals",
      "portions",
      "water_ml",
    ]);
  });

  it("leidt porties af uit de momenten", async () => {
    // De momenten zijn de invoervorm; `portions` blijft de bron voor analyse.
    // Allebei laten aanleveren zou ze uit elkaar kunnen laten lopen.
    const rows: Record<string, unknown>[] = [];
    const upsert = vi.fn((row: Record<string, unknown>) => {
      rows.push(row);
      return Promise.resolve({ error: null });
    });
    const supabase = { raw: {}, from: vi.fn(() => ({ upsert })) } as unknown as OrgScopedClient;

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      momenten: { ontbijt: { zuivel: 1 }, lunch: { zuivel: 1, groente: 2 } },
    });

    expect(rows[0].portions).toEqual({ zuivel: 2, groente: 2 });
    expect(rows[0].meals).toEqual({
      ontbijt: { zuivel: 1 },
      lunch: { zuivel: 1, groente: 2 },
    });
  });

  it("accepteert nog steeds een platte portie-map", async () => {
    // Backward-compat: een client die de oude vorm stuurt blijft werken.
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

    expect(rows[0].portions).toEqual({ groente: 3 });
    expect(rows[0].meals).toEqual({});
  });

  it("bewaart water als eenheid", async () => {
    const rows: Record<string, unknown>[] = [];
    const upsert = vi.fn((row: Record<string, unknown>) => {
      rows.push(row);
      return Promise.resolve({ error: null });
    });
    const supabase = { raw: {}, from: vi.fn(() => ({ upsert })) } as unknown as OrgScopedClient;

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      momenten: { lunch: { groente: 1 } },
      waterMl: 1500,
    });

    expect(rows[0].water_ml).toBe(1500);
  });

  it("meldt falen zonder te werpen", async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: { message: "nee" } }));
    const supabase = { raw: {}, from: vi.fn(() => ({ upsert })) } as unknown as OrgScopedClient;
    await expect(
      upsertDaybookDay(supabase, "acc", { date: "2026-09-01", porties: { groente: 1 } }),
    ).resolves.toBe(false);
  });
});
