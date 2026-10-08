import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { inflateRawSync } from "node:zlib";
import {
  bouwDumpZip,
  csvCel,
  csvKop,
  csvRegel,
  DUMP_KOLOMMEN,
  dumpRijen,
  leesmijTekst,
  licentieTekst,
  maakVerseCache,
} from "@/lib/sm-products-dump";
import { DBCL_URL, ODBL_URL, OFF_WIJZIGINGEN } from "@/lib/supermarkt-bron";

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

async function verzamel(generator: AsyncGenerator<Rij>): Promise<Rij[]> {
  const rijen: Rij[] = [];
  for await (const rij of generator) rijen.push(rij);
  return rijen;
}

function leesZip(zip: Buffer): Map<string, string> {
  const bestanden = new Map<string, string>();
  let positie = 0;
  while (zip.readUInt32LE(positie) === 0x04034b50) {
    const methode = zip.readUInt16LE(positie + 8);
    const gecomprimeerd = zip.readUInt32LE(positie + 18);
    const naamLengte = zip.readUInt16LE(positie + 26);
    const naam = zip.subarray(positie + 30, positie + 30 + naamLengte).toString("utf8");
    const begin = positie + 30 + naamLengte;
    const data = zip.subarray(begin, begin + gecomprimeerd);
    bestanden.set(naam, (methode === 8 ? inflateRawSync(data) : data).toString("utf8"));
    positie = begin + gecomprimeerd;
  }
  return bestanden;
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

describe("dumpRijen", () => {
  const rijen = Array.from({ length: 5 }, (_, i) => ({ prod_id: `off:${i}`, naam: `Product ${i}` }));

  it("levert alle rijen, over meerdere pagina's heen, zonder dubbelen", async () => {
    const { client, aanvragen } = nepClient(rijen);
    expect(await verzamel(dumpRijen(client, 2))).toEqual(rijen);
    expect(aanvragen.map((a) => a.na)).toEqual([null, "off:1", "off:3", "off:4"]);
  });

  it("stopt pas bij een lege pagina, niet bij een korte", async () => {
    const { client, aanvragen } = nepClient(rijen);
    await verzamel(dumpRijen(client, 100));
    expect(aanvragen.map((a) => a.na)).toEqual([null, "off:4"]);
  });

  it("levert niets bij een lege tabel", async () => {
    const { client } = nepClient([]);
    expect(await verzamel(dumpRijen(client))).toEqual([]);
  });
});

describe("licentieTekst en leesmijTekst", () => {
  const statistiek = { aantal: 7, perSnapshot: new Map([["2026-10-04", 2], ["2026-10-08", 5]]) };

  it("zet de licentie-URI's en de bronvermelding in het bestand zelf", () => {
    const licentie = licentieTekst();
    expect(licentie).toContain(ODBL_URL);
    expect(licentie).toContain(DBCL_URL);
    expect(licentie).toContain("© Open Food Facts contributors");
  });

  it("noemt datum, aantallen per snapshot, alle wijzigingen en alle kolommen", () => {
    const leesmij = leesmijTekst(statistiek, new Date("2026-10-09T10:00:00Z"));
    expect(leesmij).toContain("Samengesteld op: 2026-10-09");
    expect(leesmij).toContain("Aantal producten: 7");
    expect(leesmij.indexOf("2026-10-08: 5 rijen")).toBeLessThan(leesmij.indexOf("2026-10-04: 2 rijen"));
    for (const wijziging of OFF_WIJZIGINGEN) expect(leesmij).toContain(wijziging);
    for (const kolom of DUMP_KOLOMMEN) expect(leesmij).toContain(kolom);
    expect(leesmij).toContain("geen NEVO-gegevens");
  });
});

describe("bouwDumpZip", () => {
  const rijen = [
    { prod_id: "off:1", bron: "off", naam: "Melk, halfvol", snapshot_datum: "2026-10-08", energy_kcal: 47 },
    { prod_id: "off:2", bron: "off", naam: "=Kwark", snapshot_datum: "2026-10-04", energy_kcal: null },
  ];

  it("bevat de CSV, de licentie en de leesmij, en de CSV komt overeen met de rijen", async () => {
    const zip = await bouwDumpZip(nepClient(rijen).client, new Date("2026-10-09T10:00:00Z"));
    const bestanden = leesZip(zip);
    expect([...bestanden.keys()]).toEqual([
      "perfectsupplement-open-food-facts.csv",
      "LICENTIE.txt",
      "LEESMIJ.txt",
    ]);
    expect(bestanden.get("perfectsupplement-open-food-facts.csv")).toBe(csvKop() + rijen.map(csvRegel).join(""));
    expect(bestanden.get("LEESMIJ.txt")).toContain("Aantal producten: 2");
    expect(bestanden.get("LEESMIJ.txt")).toContain("2026-10-04: 1 rijen");
    expect(bestanden.get("LICENTIE.txt")).toContain(ODBL_URL);
  });

  it("geeft een zip met alleen kop bij een lege tabel", async () => {
    const bestanden = leesZip(await bouwDumpZip(nepClient([]).client, new Date()));
    expect(bestanden.get("perfectsupplement-open-food-facts.csv")).toBe(csvKop());
    expect(bestanden.get("LEESMIJ.txt")).toContain("Aantal producten: 0");
  });
});

describe("maakVerseCache", () => {
  it("bouwt één keer binnen de geldigheid en daarna opnieuw", async () => {
    let nu = 0;
    let gebouwd = 0;
    const haal = maakVerseCache(async () => ++gebouwd, 1000, () => nu);
    expect(await haal()).toBe(1);
    nu = 999;
    expect(await haal()).toBe(1);
    nu = 1000;
    expect(await haal()).toBe(2);
    expect(gebouwd).toBe(2);
  });

  it("laat gelijktijdige aanvragen één bouwpoging delen", async () => {
    let gebouwd = 0;
    const haal = maakVerseCache(async () => {
      gebouwd += 1;
      await new Promise((klaar) => setTimeout(klaar, 5));
      return gebouwd;
    }, 1000);
    expect(await Promise.all([haal(), haal(), haal()])).toEqual([1, 1, 1]);
    expect(gebouwd).toBe(1);
  });

  it("geeft de fout door zolang er niets bewaard is, en probeert daarna opnieuw", async () => {
    let poging = 0;
    const haal = maakVerseCache(async () => {
      poging += 1;
      if (poging === 1) throw new Error("db weg");
      return poging;
    }, 1000);
    await expect(haal()).rejects.toThrow("db weg");
    expect(await haal()).toBe(2);
  });

  it("houdt het oude resultaat als verversen mislukt", async () => {
    let nu = 0;
    let poging = 0;
    const haal = maakVerseCache(async () => {
      poging += 1;
      if (poging === 2) throw new Error("db weg");
      return poging;
    }, 1000, () => nu);
    expect(await haal()).toBe(1);
    nu = 2000;
    expect(await haal()).toBe(1);
    expect(await haal()).toBe(3);
  });
});
