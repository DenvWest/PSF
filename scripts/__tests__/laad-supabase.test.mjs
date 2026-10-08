import { describe, expect, it } from "vitest";
import { isTijdelijkeFout, leesVanaf, upsertInBatches } from "../laad-supabase.mjs";

function nepSupabase(antwoorden) {
  const aanroepen = [];
  return {
    aanroepen,
    from: () => ({
      upsert: async (deel) => {
        aanroepen.push(deel.map((r) => r.id));
        const antwoord = antwoorden.shift() ?? { error: null };
        if (antwoord instanceof Error) throw antwoord;
        return antwoord;
      },
    }),
  };
}

const rijen = Array.from({ length: 5 }, (_, id) => ({ id }));
const stil = { wacht: async () => {}, log: () => {} };

describe("isTijdelijkeFout", () => {
  it("herkent netwerkfouten, 429 en 5xx", () => {
    expect(isTijdelijkeFout({ message: "TypeError: fetch failed" })).toBe(true);
    expect(isTijdelijkeFout({ status: 429, message: "Too Many Requests" })).toBe(true);
    expect(isTijdelijkeFout({ status: 503, message: "upstream" })).toBe(true);
  });

  it("probeert een constraint of 4xx niet opnieuw", () => {
    expect(isTijdelijkeFout({ status: 400, message: 'violates check constraint "sm_products_fat_g_check"' })).toBe(false);
  });
});

describe("upsertInBatches", () => {
  it("probeert een batch opnieuw na een tijdelijke fout", async () => {
    const supabase = nepSupabase([new Error("fetch failed"), { error: { message: "x" }, status: 502 }]);
    const n = await upsertInBatches({ supabase, tabel: "t", rijen, onConflict: "id", batch: 2, ...stil });
    expect(n).toBe(5);
    expect(supabase.aanroepen).toEqual([[0, 1], [0, 1], [0, 1], [2, 3], [4]]);
  });

  it("stopt bij een blijvende fout en noemt de --vanaf om te hervatten", async () => {
    const supabase = nepSupabase([{ error: null }, { error: { message: "violates check constraint" }, status: 400 }]);
    await expect(upsertInBatches({ supabase, tabel: "t", rijen, onConflict: "id", batch: 2, ...stil })).rejects.toThrow("--vanaf=2");
  });

  it("geeft op na het maximum aantal pogingen", async () => {
    const supabase = nepSupabase(Array.from({ length: 3 }, () => new Error("fetch failed")));
    await expect(upsertInBatches({ supabase, tabel: "t", rijen, onConflict: "id", batch: 2, pogingen: 3, ...stil })).rejects.toThrow("poging 3");
  });

  it("hervat vanaf de opgegeven rij", async () => {
    const supabase = nepSupabase([]);
    const n = await upsertInBatches({ supabase, tabel: "t", rijen, onConflict: "id", batch: 2, vanaf: 2, ...stil });
    expect(n).toBe(3);
    expect(supabase.aanroepen).toEqual([[2, 3], [4]]);
  });
});

describe("leesVanaf", () => {
  it("leest --vanaf en weigert onzin", () => {
    expect(leesVanaf(["node", "x"])).toBe(0);
    expect(leesVanaf(["node", "x", "--vanaf=30000"])).toBe(30000);
    expect(() => leesVanaf(["node", "x", "--vanaf=abc"])).toThrow();
  });
});
