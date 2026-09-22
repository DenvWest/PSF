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

/**
 * Een dagboek-client met één bestaande dag erin.
 *
 * `upsertDaybookDay` leest de dag eerst en voegt samen, dus de dubbel moet
 * allebei kunnen: `select(...).eq(...).eq(...).maybeSingle()` en `upsert(...)`.
 * `bestaand: null` staat voor een dag die nog niet bestaat.
 */
function daybookClient(bestaand: Record<string, unknown> | null) {
  const rows: Record<string, unknown>[] = [];
  const upsert = vi.fn((row: Record<string, unknown>) => {
    rows.push(row);
    return Promise.resolve({ error: null });
  });
  const select = vi.fn(() => ({
    eq: () => ({
      eq: () => ({ maybeSingle: () => Promise.resolve({ data: bestaand, error: null }) }),
    }),
  }));
  const supabase = {
    raw: {},
    from: vi.fn(() => ({ select, upsert })),
  } as unknown as OrgScopedClient;
  return { supabase, rows, upsert, select };
}

describe("upsertDaybookDay", () => {
  it("leidt de dagsoort af uit de datum en schrijft op (account, dag)", async () => {
    const { supabase, rows, upsert } = daybookClient(null);

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
    const { supabase, rows } = daybookClient(null);

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      porties: { groente: 3 },
    });

    // De lock: het dagboek verrijkt de readout en voedt nooit een score.
    // Geen score- en geen caloriekolom, en geen grammen op dagniveau — water
    // is de enige eenheid die een dag als geheel draagt, en die draagt geen
    // norm. De grammen in `items` zijn een eigenschap van één product, niet
    // van de dag: ze zeggen hoeveel van díé bron je noemde, en daar hangt de
    // milligram-ondergrens aan. Een dagtotaal in grammen blijft verboden.
    expect(Object.keys(rows[0]).sort()).toEqual([
      "account_id",
      "day_kind",
      "entry_date",
      "items",
      "meals",
      "portions",
      "water_ml",
    ]);
  });

  it("leidt porties af uit de items, en die winnen van de momenten", async () => {
    const { supabase, rows } = daybookClient(null);

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      porties: { groente: 9 },
      momenten: { ontbijt: { zuivel: 1 } },
      items: [{ moment: "ontbijt", bron: "voeding", key: "havermout", grams: 60 }],
    });

    // De fijnste laag beschrijft de dag het best: de meegegeven `porties` en
    // de momenten worden genegeerd zodra er items zijn.
    const porties = rows[0].portions as Record<string, number>;
    expect(porties.groente).toBeUndefined();
    expect(porties.zuivel).toBeUndefined();
    expect(Object.values(porties).reduce((a, b) => a + b, 0)).toBe(1);
  });

  it("leidt porties af uit de momenten", async () => {
    // De momenten zijn de invoervorm; `portions` blijft de bron voor analyse.
    // Allebei laten aanleveren zou ze uit elkaar kunnen laten lopen.
    const { supabase, rows } = daybookClient(null);

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
    const { supabase, rows } = daybookClient(null);

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      porties: { groente: 3 },
    });

    expect(rows[0].portions).toEqual({ groente: 3 });
    expect(rows[0].meals).toEqual({});
  });

  it("bewaart water als eenheid", async () => {
    const { supabase, rows } = daybookClient(null);

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      momenten: { lunch: { groente: 1 } },
      waterMl: 1500,
    });

    expect(rows[0].water_ml).toBe(1500);
  });

  /**
   * De regressie waarvoor de merge is gebouwd.
   *
   * De dagboek-UI stuurt alleen `{ date, items }`. Schreef die POST de hele rij
   * weg, dan was het water van die ochtend stil verdwenen zodra je 's avonds
   * een product toevoegde. Geen foutmelding, en de UI leest het veld niet meer
   * — dus onzichtbaar.
   */
  it("laat water en momenten staan bij een POST die alleen items noemt", async () => {
    const { supabase, rows } = daybookClient({
      portions: { zuivel: 1 },
      meals: { ontbijt: { zuivel: 1 } },
      water_ml: 1500,
      items: [],
    });

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      items: [{ moment: "lunch", bron: "voeding", key: "havermout", grams: 60 }],
    });

    expect(rows[0].water_ml).toBe(1500);
    expect(rows[0].meals).toEqual({ ontbijt: { zuivel: 1 } });
  });

  it("laat items staan bij een POST die alleen water noemt", async () => {
    const { supabase, rows } = daybookClient({
      portions: { granen: 1 },
      meals: {},
      water_ml: null,
      items: [{ moment: "ontbijt", bron: "voeding", key: "havermout", grams: 60 }],
    });

    await upsertDaybookDay(supabase, "acc", { date: "2026-09-01", waterMl: 750 });

    expect(rows[0].water_ml).toBe(750);
    expect(rows[0].items).toHaveLength(1);
    // De porties blijven uit de bewaarde items komen, niet uit niets.
    expect(rows[0].portions).toEqual({ granen: 1 });
  });

  /**
   * De andere kant van hetzelfde onderscheid: expliciet leeg is een opdracht,
   * geen stilte. Zo blijft je laatste product verwijderen mogelijk.
   */
  it("wist wél wat expliciet leeg wordt meegestuurd", async () => {
    const { supabase, rows } = daybookClient({
      portions: { granen: 1 },
      meals: { ontbijt: { granen: 1 } },
      water_ml: 1500,
      items: [{ moment: "ontbijt", bron: "voeding", key: "havermout", grams: 60 }],
    });

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      items: [],
      waterMl: null,
    });

    expect(rows[0].items).toEqual([]);
    expect(rows[0].water_ml).toBeNull();
    // `meals` is niet genoemd en blijft dus staan.
    expect(rows[0].meals).toEqual({ ontbijt: { granen: 1 } });
  });

  it("gedraagt zich als vanouds bij een dag die nog niet bestaat", async () => {
    const { supabase, rows } = daybookClient(null);

    await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      items: [{ moment: "ontbijt", bron: "voeding", key: "havermout", grams: 60 }],
    });

    expect(rows[0].water_ml).toBeNull();
    expect(rows[0].meals).toEqual({});
  });

  /**
   * Een mislukte lezing mag een registratie niet blokkeren: dan valt de
   * schrijving terug op het oude gedrag in plaats van te weigeren.
   */
  it("schrijft door wanneer de bestaande dag niet te lezen is", async () => {
    const rows: Record<string, unknown>[] = [];
    const upsert = vi.fn((row: Record<string, unknown>) => {
      rows.push(row);
      return Promise.resolve({ error: null });
    });
    const select = vi.fn(() => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: { message: "kolom weg" } }),
        }),
      }),
    }));
    const supabase = {
      raw: {},
      from: vi.fn(() => ({ select, upsert })),
    } as unknown as OrgScopedClient;

    const ok = await upsertDaybookDay(supabase, "acc", {
      date: "2026-09-01",
      items: [{ moment: "ontbijt", bron: "voeding", key: "havermout", grams: 60 }],
    });

    expect(ok).toBe(true);
    expect(rows).toHaveLength(1);
  });

  it("meldt falen zonder te werpen", async () => {
    const select = vi.fn(() => ({
      eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
    }));
    const upsert = vi.fn(() => Promise.resolve({ error: { message: "nee" } }));
    const supabase = {
      raw: {},
      from: vi.fn(() => ({ select, upsert })),
    } as unknown as OrgScopedClient;
    await expect(
      upsertDaybookDay(supabase, "acc", { date: "2026-09-01", porties: { groente: 1 } }),
    ).resolves.toBe(false);
  });
});
