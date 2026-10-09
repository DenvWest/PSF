import { describe, expect, it } from "vitest";
import {
  buildDagboekFavorietenHref,
  buildDagboekVoegHref,
  buildDagboekZoekHref,
  leesDagboekFavorieten,
  leesDagboekVoeg,
  leesDagboekZoek,
} from "@/lib/dagboek-deeplink";

describe("dagboek-deeplink", () => {
  it("bouwt en leest een toevoeging terug", () => {
    const href = buildDagboekVoegHref({ bron: "voeding", key: "kipdij", moment: "lunch" });
    expect(href).toBe("/dashboard?tab=vandaag&voeg=voeding%3Akipdij&moment=lunch");
    expect(leesDagboekVoeg(href.split("?")[1] ?? "")).toEqual({ bron: "voeding", key: "kipdij", moment: "lunch" });
  });

  it("onthoudt dat je uit Mijn keuzes kwam, zodat het portiescherm je daar terugbrengt", () => {
    const href = buildDagboekVoegHref({ bron: "voeding", key: "kipdij", moment: "lunch", van: "keuze" });
    expect(href).toBe("/dashboard?tab=vandaag&voeg=voeding%3Akipdij&moment=lunch&van=keuze");
    expect(leesDagboekVoeg(href.split("?")[1] ?? "")).toEqual({
      bron: "voeding",
      key: "kipdij",
      moment: "lunch",
      van: "keuze",
    });
    expect(leesDagboekVoeg("?voeg=voeding:kipdij&van=elders")?.van).toBeUndefined();
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

  it("bouwt en leest het zoekscherm van de ＋ terug", () => {
    const href = buildDagboekZoekHref("supplementen", "avondeten");
    expect(href).toBe("/dashboard?tab=vandaag&zoek=supplementen&moment=avondeten");
    expect(leesDagboekZoek(href.split("?")[1] ?? "")).toEqual({ start: "supplementen", moment: "avondeten" });
  });

  it("negeert een onbekende zoekstart en valt terug op ontbijt bij een onbekend moment", () => {
    expect(leesDagboekZoek("zoek=producten&moment=lunch")).toBeNull();
    expect(leesDagboekZoek("zoek=alle&moment=brunch")).toEqual({ start: "alle", moment: "ontbijt" });
  });
});
