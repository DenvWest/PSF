import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { csvCel, csvKop, csvRegel, DUMP_KOLOMMEN, dumpRegels } from "@/lib/sm-products-dump";

type Rij = Record<string, unknown>;

function nepClient(alleRijen: Rij[]): { client: SupabaseClient; aanvragen: { na: string | null; limiet: number }[] } {
  const aanvragen: { na: string | null; limiet: number }[] = [];
  const client = {
    from: () => {
      let na: string | null = null;
      let limiet = 0;
      const keten = {
        select: () => keten,
        order: () => keten,
        limit: (n: number) => {
          limiet = n;
          return keten;
        },
        gt: (_kolom: string, waarde: string) => {
          na = waarde;
          return keten;
        },
        then: (klaar: (r: { data: Rij[]; error: null }) => unknown) => {
          aanvragen.push({ na, limiet });
          const data = alleRijen.filter((r) => na === null || String(r.prod_id) > na).slice(0, limiet);
          return Promise.resolve({ data, error: null }).then(klaar);
        },
      };
      return keten;
    },
  } as unknown as SupabaseClient;
  return { client, aanvragen };
}

async function verzamel(generator: AsyncGenerator<string>): Promise<string[]> {
  const regels: string[] = [];
  for await (const regel of generator) regels.push(regel);
  return regels;
}

describe("csvCel", () => {
  it("laat null leeg en een getal ongewijzigd (nooit een verzonnen 0)", () => {
    expect(csvCel(null)).toBe("");
    expect(csvCel(undefined)).toBe("");
    expect(csvCel(0)).toBe("0");
    expect(csvCel(47.5)).toBe("47.5");
  });

  it("zet tekst met komma, aanhalingsteken of regeleinde tussen aanhalingstekens", () => {
    expect(csvCel("Ben & Jerry's")).toBe("Ben & Jerry's");
    expect(csvCel("melk, halfvol")).toBe('"melk, halfvol"');
    expect(csvCel('de "beste" kaas')).toBe('"de ""beste"" kaas"');
  });

  it("voorkomt dat een spreadsheet tekst als formule uitvoert", () => {
    expect(csvCel("=SOM(A1)")).toBe("'=SOM(A1)");
    expect(csvCel("@bron")).toBe("'@bron");
  });
});

describe("csvKop en csvRegel", () => {
  it("heeft per regel evenveel cellen als de kop", () => {
    const kop = csvKop().trim().split(",");
    const regel = csvRegel({ prod_id: "off:1", naam: "Melk", energy_kcal: 47 }).trim().split(",");
    expect(kop).toEqual([...DUMP_KOLOMMEN]);
    expect(regel).toHaveLength(kop.length);
  });

  it("neemt geen tijdstempels of onbekende velden mee", () => {
    const regel = csvRegel({ prod_id: "off:1", updated_at: "2026-10-04", geheim: "x" });
    expect(regel).not.toContain("2026-10-04");
    expect(regel).not.toContain("x");
  });
});

describe("dumpRegels", () => {
  const rijen = Array.from({ length: 5 }, (_, i) => ({ prod_id: `off:${i}`, naam: `Product ${i}` }));

  it("levert de kop en alle rijen, over meerdere pagina's heen, zonder dubbelen", async () => {
    const { client, aanvragen } = nepClient(rijen);
    const regels = await verzamel(dumpRegels(client, 2));
    expect(regels).toHaveLength(1 + rijen.length);
    expect(regels[0]).toBe(csvKop());
    expect(regels.slice(1).map((r) => r.split(",")[0])).toEqual(rijen.map((r) => r.prod_id));
    expect(aanvragen.map((a) => a.na)).toEqual([null, "off:1", "off:3"]);
  });

  it("stopt na één aanvraag als de tabel kleiner is dan een pagina", async () => {
    const { client, aanvragen } = nepClient(rijen);
    await verzamel(dumpRegels(client, 100));
    expect(aanvragen).toHaveLength(1);
  });

  it("geeft alleen de kop bij een lege tabel", async () => {
    const { client } = nepClient([]);
    expect(await verzamel(dumpRegels(client))).toEqual([csvKop()]);
  });
});
