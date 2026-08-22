import { describe, expect, it } from "vitest";
import { resolveLadderAffordances } from "@/lib/ladder-affordances";

describe("resolveLadderAffordances", () => {
  it("geeft plandomeinen keuze én moment voor een gewone actie", () => {
    expect(
      resolveLadderAffordances({
        domain: "beweging",
        layerId: 2,
        action: "Twee krachtsessies per week, vijf oefeningen, hele lichaam.",
      }),
    ).toEqual(["keuze", "moment"]);
  });

  it("laat een cadans-actie de moment-knop niet krijgen — geen tijdstip om te plannen", () => {
    expect(
      resolveLadderAffordances({
        domain: "beweging",
        layerId: 1,
        action: "Onderbreek elk werkuur twee minuten — staan is genoeg.",
      }),
    ).toEqual(["keuze"]);
    expect(
      resolveLadderAffordances({
        domain: "stress",
        layerId: 3,
        action: "Sta na elk uur achter elkaar werken even op en loop 2 minuten.",
      }),
    ).toEqual(["keuze"]);
  });

  it("geeft readout-domeinen zonder agenda-categorie alleen keuze", () => {
    expect(
      resolveLadderAffordances({ domain: "energie", layerId: 1, action: "Iets doen." }),
    ).toEqual(["keuze"]);
  });
});
