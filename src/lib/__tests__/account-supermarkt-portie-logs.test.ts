import { describe, expect, it } from "vitest";
import { insertSupermarktPortieLog } from "@/lib/account-supermarkt-portie-logs";
import type { OrgScopedClient } from "@/lib/db/scoped";

/**
 * Verwijzen, niet kopiëren (docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md
 * §3): een dagboeklog bewaart alleen een verwijzing en een gewicht. Komt er
 * ooit een voedingswaarde in dit insert-pakket, dan zit een share-alike-bron
 * (ODbL) vast aan gezondheidsgegevens van een gebruiker (AVG art. 9).
 */
describe("insertSupermarktPortieLog", () => {
  it("schrijft alleen verwijzing en gewicht weg, nooit een voedingswaarde", async () => {
    let ingevoegd: Record<string, unknown> | null = null;
    const client = {
      from: () => ({
        insert: (waarden: Record<string, unknown>) => {
          ingevoegd = waarden;
          return {
            select: () => ({
              single: async () => ({
                data: {
                  id: "log-1",
                  moment: "ontbijt",
                  prod_id: "off:8710400123456",
                  grams: 150,
                  created_at: "2026-10-03T08:00:00.000Z",
                },
                error: null,
              }),
            }),
          };
        },
      }),
    } as unknown as OrgScopedClient;

    const log = await insertSupermarktPortieLog(client, "acc-1", "2026-10-03", {
      moment: "ontbijt",
      prodId: "off:8710400123456",
      grams: 150,
    });

    expect(Object.keys(ingevoegd!).sort()).toEqual(
      ["account_id", "entry_date", "grams", "moment", "prod_id"].sort(),
    );
    expect(Object.keys(log).sort()).toEqual(["createdAt", "grams", "id", "moment", "prodId"].sort());
  });
});
