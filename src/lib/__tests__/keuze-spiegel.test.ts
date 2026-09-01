import { describe, expect, it } from "vitest";
import {
  buildKeuzeSpiegel,
  resolveDomainEvidence,
  resolveSupplementLadderPlek,
} from "@/lib/keuze-spiegel";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { StoredSupplementVerdict } from "@/types/verdict";

function row(
  ingredientKey: string,
  verdict: StoredSupplementVerdict["verdict"],
): StoredSupplementVerdict {
  return {
    id: `id-${ingredientKey}`,
    ingredientKey,
    verdict,
    reasonKey: verdict === "kopen" ? "trigger_matched" : "no_trigger_matched",
    rulesVersion: "1.6.0",
    nextReviewAt: null,
    createdAt: "2026-08-16T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

describe("resolveSupplementLadderPlek", () => {
  // De rangorde komt uit de ladderdata, niet uit een cijfer in de UI. Deze test
  // borgt dat: verhuist de aanvul-laag, dan verhuist de kaart mee.
  it.each(["voeding", "slaap", "beweging"] as const)(
    "wijst op %s naar de laatste laag van de ladder",
    (domain) => {
      const ladder = getLeefstijlLadder(domain);
      const plek = resolveSupplementLadderPlek(domain);
      const laatste = ladder!.layers[ladder!.layers.length - 1];

      expect(plek).not.toBeNull();
      expect(plek!.layerId).toBe(laatste.id);
      expect(plek!.layerName).toBe(laatste.name);
      expect(plek!.totalLayers).toBe(ladder!.layers.length);
      expect(plek!.layersAbove).toBe(ladder!.layers.length - 1);
    },
  );

  it("levert niets op een domein zonder ladder", () => {
    expect(resolveSupplementLadderPlek("energie")).toBeNull();
    expect(resolveSupplementLadderPlek("herstel")).toBeNull();
  });
});

describe("resolveDomainEvidence", () => {
  it("levert sterren voor een interventiedomein", () => {
    const evidence = resolveDomainEvidence("voeding");
    expect(evidence).not.toBeNull();
    expect(evidence!.stars).toBeGreaterThanOrEqual(3);
    expect(evidence!.stars).toBeLessThanOrEqual(5);
    expect(evidence!.label.length).toBeGreaterThan(0);
  });

  it("levert niets voor een readout-domein", () => {
    expect(resolveDomainEvidence("energie")).toBeNull();
  });
});

describe("buildKeuzeSpiegel", () => {
  const verdicts = [
    row("magnesium", "kopen"),
    row("omega3", "kopen"),
    row("zink", "niet_nodig"),
  ];

  it("scheidt de leefstijllagen van de aanvul-laag", () => {
    const spiegel = buildKeuzeSpiegel({
      domain: "voeding",
      verdicts,
      nutritionLogCompleted: true,
    })!;

    expect(spiegel.aanbod.layerId).toBe(6);
    expect(spiegel.leefstijl.layers.map((laag) => laag.id)).toEqual([1, 2, 3]);
    // 5 lagen boven de aanvul-laag, waarvan 3 uitgeschreven.
    expect(spiegel.leefstijl.restLayers).toBe(2);
    expect(
      spiegel.leefstijl.layers.every((laag) => laag.id !== spiegel.aanbod.layerId),
    ).toBe(true);
  });

  it("telt aanraders apart van het totaal — het schap zegt ook nee", () => {
    const spiegel = buildKeuzeSpiegel({
      domain: "voeding",
      verdicts,
      nutritionLogCompleted: true,
    })!;

    expect(spiegel.aanbod.aanraders).toBe(2);
    expect(spiegel.aanbod.beoordeeld).toBe(3);
  });

  it("houdt de aanbodkant dicht zonder voedingscheck", () => {
    const spiegel = buildKeuzeSpiegel({
      domain: "voeding",
      verdicts,
      nutritionLogCompleted: false,
    })!;

    expect(spiegel.aanbod.open).toBe(false);
  });

  it("levert niets op een domein zonder ladder", () => {
    expect(
      buildKeuzeSpiegel({ domain: "energie", verdicts, nutritionLogCompleted: true }),
    ).toBeNull();
  });
});
