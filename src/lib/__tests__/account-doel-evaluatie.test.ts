import { describe, expect, it, vi } from "vitest";
import {
  bevestigDoel,
  getDoelEvaluatie,
  isGeldigeStartstand,
  isGeldigeStartstandStof,
  legStartstandVast,
} from "@/lib/account-voedingsdoelen";
import type { OrgScopedClient } from "@/lib/db/scoped";

function fakeClient(rij: Record<string, unknown> | null) {
  const upsert = vi.fn(async () => ({ error: null }));
  const client = {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: rij, error: null }) }) }),
      upsert,
    }),
  } as unknown as OrgScopedClient;
  return { client, upsert };
}

describe("doel-evaluatie opslag", () => {
  it("leest alleen geldige stoffen en standen uit de jsonb", async () => {
    const { client } = fakeClient({
      voedingsrichting_gekozen_op: "2026-10-09T10:00:00Z",
      doel_bevestigd_op: null,
      doel_startstand: {
        magnesium: { datum: "2026-10-09", aandeelPct: 48, dagen: 5 },
        kwaadaardig: { datum: "2026-10-09", aandeelPct: 1, dagen: 1 },
        zinc: { datum: "morgen", aandeelPct: 1, dagen: 1 },
        omega3: { datum: "2026-10-09", aandeelPct: 1, dagen: 99 },
      },
    });
    const evaluatie = await getDoelEvaluatie(client, "acc");
    expect(Object.keys(evaluatie.startstand)).toEqual(["magnesium"]);
    expect(evaluatie.gekozenOp).toBe("2026-10-09T10:00:00Z");
  });

  it("geeft een lege evaluatie zonder rij", async () => {
    const { client } = fakeClient(null);
    expect(await getDoelEvaluatie(client, "acc")).toEqual({ gekozenOp: null, startstand: {}, bevestigdOp: null });
  });

  it("overschrijft een bestaande startstand nooit", async () => {
    const { client, upsert } = fakeClient({
      voedingsrichting_gekozen_op: null,
      doel_bevestigd_op: null,
      doel_startstand: { magnesium: { datum: "2026-10-01", aandeelPct: 48, dagen: 5 } },
    });
    const uit = await legStartstandVast(client, "acc", "magnesium", { aandeelPct: 90, dagen: 7 }, "2026-11-01");
    expect(upsert).not.toHaveBeenCalled();
    expect(uit.startstand.magnesium).toEqual({ datum: "2026-10-01", aandeelPct: 48, dagen: 5 });
  });

  it("voegt een nieuwe stof toe naast de bestaande", async () => {
    const { client, upsert } = fakeClient({
      voedingsrichting_gekozen_op: null,
      doel_bevestigd_op: null,
      doel_startstand: { magnesium: { datum: "2026-10-01", aandeelPct: 48, dagen: 5 } },
    });
    await legStartstandVast(client, "acc", "protein", { aandeelPct: 70, dagen: 6 }, "2026-11-01");
    expect(upsert).toHaveBeenCalledTimes(1);
    const geschreven = (upsert.mock.calls[0] as unknown as [{ doel_startstand: Record<string, unknown> }])[0];
    expect(Object.keys(geschreven.doel_startstand).sort()).toEqual(["magnesium", "protein"]);
  });

  it("legt bij Houden de bevestigingsdatum vast", async () => {
    const { client, upsert } = fakeClient(null);
    const uit = await bevestigDoel(client, "acc");
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(uit.bevestigdOp).not.toBeNull();
  });

  it("valideert stof en stand", () => {
    expect(isGeldigeStartstandStof("magnesium")).toBe(true);
    expect(isGeldigeStartstandStof("iets-anders")).toBe(false);
    expect(isGeldigeStartstand({ aandeelPct: 48, dagen: 5 })).toBe(true);
    expect(isGeldigeStartstand({ aandeelPct: -1, dagen: 5 })).toBe(false);
    expect(isGeldigeStartstand({ aandeelPct: 48, dagen: 9 })).toBe(false);
    expect(isGeldigeStartstand({ aandeelPct: 4.8, dagen: 5 })).toBe(false);
  });
});
