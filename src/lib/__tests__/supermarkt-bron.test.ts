import { describe, expect, it } from "vitest";
import {
  bronnenVan,
  ODBL_URL,
  SUPERMARKT_BRON_INFO,
  supermarktBronLabel,
  supermarktProductUrl,
} from "@/lib/supermarkt-bron";

describe("supermarkt-bron", () => {
  it("linkt een Open Food Facts-product naar zijn productpagina op barcode", () => {
    expect(supermarktProductUrl({ bron: "off", bronId: "8710400123456" })).toBe(
      "https://nl.openfoodfacts.org/product/8710400123456",
    );
  });

  it("codeert een bronId dat geen veilig pad-deel is", () => {
    expect(supermarktProductUrl({ bron: "off", bronId: "a/b?c" })).toBe(
      "https://nl.openfoodfacts.org/product/a%2Fb%3Fc",
    );
  });

  it("noemt zowel bron als licentie in het label (ODbL §4.3 vraagt beide)", () => {
    expect(supermarktBronLabel("off")).toBe("Open Food Facts (ODbL)");
  });

  it("verwijst voor de licentie naar de ODbL-tekst", () => {
    expect(SUPERMARKT_BRON_INFO.off.licentieUrl).toBe(ODBL_URL);
    expect(ODBL_URL).toBe("https://opendatacommons.org/licenses/odbl/1-0/");
  });

  it("geeft elke voorkomende bron één keer terug", () => {
    expect(bronnenVan([{ bron: "off" }, { bron: "off" }])).toEqual(["off"]);
    expect(bronnenVan([])).toEqual([]);
  });
});
