import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BronnenPage, { metadata } from "@/app/bronnen/page";
import { OFF_WIJZIGINGEN } from "@/lib/supermarkt-bron";

describe("/bronnen", () => {
  const html = renderToStaticMarkup(<BronnenPage />);

  it("heeft één h1, een canonical en een eigen beschrijving", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(metadata.alternates?.canonical).toBe("https://perfectsupplement.nl/bronnen");
    expect(metadata.description).toContain("Open Food Facts");
  });

  it("noemt beide bronnen met licentie en de NEVO-bronvermelding letterlijk", () => {
    expect(html).toContain("opendatacommons.org/licenses/odbl/1-0");
    expect(html).toContain("NEVO-online versie 2025/9.0, RIVM, Bilthoven");
  });

  it("biedt de dump aan en legt de wijzigingen ten opzichte van de bron uit", () => {
    expect(html).toContain('href="/api/bronnen/open-food-facts"');
    expect(html).toContain("Wat wij hebben aangepast");
    expect(html).toContain("LICENTIE.txt");
  });

  it("noemt elke wijziging uit de gedeelde lijst", () => {
    for (const wijziging of OFF_WIJZIGINGEN) expect(html).toContain(wijziging.replace(/'/g, "&#x27;"));
  });
});
