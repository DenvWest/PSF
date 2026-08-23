import { describe, expect, it } from "vitest";
import { resolveLadderAffordances } from "@/lib/ladder-affordances";

describe("resolveLadderAffordances", () => {
  it("geeft plandomeinen keuze, herinnering én moment voor een gewone actie", () => {
    expect(
      resolveLadderAffordances({
        domain: "beweging",
        layerId: 2,
        action: "Twee krachtsessies per week, vijf oefeningen, hele lichaam.",
      }),
    ).toEqual(["keuze", "herinnering", "moment"]);
  });

  it("laat een cadans-actie de moment-knop niet krijgen — geen tijdstip om te plannen", () => {
    expect(
      resolveLadderAffordances({
        domain: "beweging",
        layerId: 1,
        action: "Onderbreek elk werkuur twee minuten — staan is genoeg.",
      }),
    ).toEqual(["keuze", "herinnering"]);
    expect(
      resolveLadderAffordances({
        domain: "stress",
        layerId: 3,
        action: "Sta na elk uur achter elkaar werken even op en loop 2 minuten.",
      }),
    ).toEqual(["keuze", "herinnering"]);
  });

  it("geeft readout-domeinen zonder agenda-categorie keuze én herinnering", () => {
    expect(
      resolveLadderAffordances({ domain: "energie", layerId: 1, action: "Iets doen." }),
    ).toEqual(["keuze", "herinnering"]);
  });
});
