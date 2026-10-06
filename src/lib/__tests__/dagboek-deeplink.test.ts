import { describe, expect, it } from "vitest";
import {
  buildDagboekFavorietenHref,
  buildDagboekVoegHref,
  leesDagboekFavorieten,
  leesDagboekVoeg,
} from "@/lib/dagboek-deeplink";

describe("dagboek-deeplink", () => {
  it("bouwt en leest een toevoeging terug", () => {
    const href = buildDagboekVoegHref({ bron: "voeding", key: "kipdij", moment: "lunch" });
    expect(href).toBe("/dashboard?tab=vandaag&voeg=voeding%3Akipdij&moment=lunch");
    expect(leesDagboekVoeg(href.split("?")[1] ?? "")).toEqual({ bron: "voeding", key: "kipdij", moment: "lunch" });
  });

  it("weigert een onbekend product of bron, en valt terug op ontbijt bij een onbekend moment", () => {
    expect(leesDagboekVoeg("?voeg=voeding:bestaat-niet")).toBeNull();
    expect(leesDagboekVoeg("?voeg=iets:kipdij")).toBeNull();
    expect(leesDagboekVoeg("?voeg=supplement:magnesiumcitraat-capsule&moment=nacht")).toEqual({
      bron: "supplement",
      key: "magnesiumcitraat-capsule",
      moment: "ontbijt",
    });
  });

  it("opent het dagboek op Mijn supplementen", () => {
    const href = buildDagboekFavorietenHref("supplementen");
    expect(leesDagboekFavorieten(href.split("?")[1] ?? "")).toBe("supplementen");
    expect(leesDagboekFavorieten("?favorieten=alles")).toBeNull();
  });
});
