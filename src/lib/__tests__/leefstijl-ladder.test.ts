import { describe, expect, it } from "vitest";
import {
  getLeefstijlLadder,
  ladderActionFavoriteId,
  parseLadderFavoriteLayer,
  resolveLadderLayerName,
  resolveLayerOptions,
} from "@/lib/leefstijl-ladder";

describe("getLeefstijlLadder", () => {
  it("levert zes lagen voor elk van de vijf leefstijldomeinen", () => {
    for (const domain of ["slaap", "beweging", "voeding", "stress", "verbinding"] as const) {
      const ladder = getLeefstijlLadder(domain);
      expect(ladder, domain).not.toBeNull();
      expect(ladder!.layers.length, domain).toBe(6);
    }
  });

  it("geeft geen ladder voor de readout-domeinen", () => {
    expect(getLeefstijlLadder("energie")).toBeNull();
    expect(getLeefstijlLadder("herstel")).toBeNull();
  });

  it("draagt de vangnetregel alleen op verbinding — nooit hergebruikt", () => {
    expect(getLeefstijlLadder("verbinding")?.safetyNetLine).toBeTruthy();
    expect(getLeefstijlLadder("stress")?.safetyNetLine).toBeUndefined();
    expect(getLeefstijlLadder("slaap")?.safetyNetLine).toBeUndefined();
  });
});

describe("ladderActionFavoriteId", () => {
  it("scheidt dezelfde actie op twee domeinen — account_favorites is uniek op item_id", () => {
    const slaap = ladderActionFavoriteId("slaap", 1, "Ga elke dag naar buiten.");
    const beweging = ladderActionFavoriteId("beweging", 1, "Ga elke dag naar buiten.");
    expect(slaap).not.toBe(beweging);
  });

  it("scheidt dezelfde actie op twee lagen", () => {
    expect(ladderActionFavoriteId("stress", 1, "Adem vier minuten.")).not.toBe(
      ladderActionFavoriteId("stress", 2, "Adem vier minuten."),
    );
  });

  it("blijft binnen de 128 tekens die de API accepteert", () => {
    const langsteActie = "A".repeat(400);
    expect(ladderActionFavoriteId("verbinding", 6, langsteActie).length).toBeLessThanOrEqual(128);
  });

  it("laat elke echte actie van elk domein een eigen sleutel houden", () => {
    for (const domain of ["slaap", "beweging", "voeding", "stress", "verbinding"] as const) {
      const ids = new Set<string>();
      for (const layer of getLeefstijlLadder(domain)!.layers) {
        for (const action of layer.actions) {
          ids.add(ladderActionFavoriteId(domain, layer.id, action));
        }
      }
      const totaal = getLeefstijlLadder(domain)!.layers.reduce(
        (sum, layer) => sum + layer.actions.length,
        0,
      );
      expect(ids.size, domain).toBe(totaal);
    }
  });
});

describe("parseLadderFavoriteLayer", () => {
  it("leest de laag terug uit een sleutel die de ladder schreef", () => {
    expect(parseLadderFavoriteLayer(ladderActionFavoriteId("slaap", 4, "Doe iets."))).toBe(4);
  });

  it("blijft de legacy-vorm van 19 augustus lezen — die rijen staan al in accounts", () => {
    expect(parseLadderFavoriteLayer("actie-2-Train twee keer per week")).toBe(2);
  });

  it("geeft null voor wat niet van de ladder komt", () => {
    expect(parseLadderFavoriteLayer("magnesium")).toBeNull();
    expect(parseLadderFavoriteLayer("schap-basis-wandelen")).toBeNull();
  });
});

describe("resolveLadderLayerName", () => {
  it("noemt de laag bij zijn eigen naam", () => {
    const eerste = getLeefstijlLadder("slaap")!.layers[0];
    expect(resolveLadderLayerName("slaap", eerste.id)).toBe(eerste.name);
  });

  it("verzint geen naam voor een laag die niet bestaat", () => {
    expect(resolveLadderLayerName("slaap", 9)).toBeNull();
    expect(resolveLadderLayerName("energie", 1)).toBeNull();
  });
});

describe("resolveLayerOptions", () => {
  it("levert nu de statische acties van de laag — de vragenlijst vult dit slot later", () => {
    const layer = getLeefstijlLadder("beweging")!.layers[0];
    expect(resolveLayerOptions(layer)).toEqual(layer.actions);
    expect(resolveLayerOptions(layer).length).toBeGreaterThan(0);
  });

  it("blijft leeg op lagen zonder acties, in plaats van een tweede bron te verzinnen", () => {
    const layer = getLeefstijlLadder("beweging")!.layers.find((row) => row.id === 6);
    expect(layer).toBeDefined();
    expect(resolveLayerOptions(layer!)).toEqual([]);
  });
});
