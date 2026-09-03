// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VoortgangTopNav from "@/components/dashboard/voortgang/VoortgangTopNav";
import { buildKompasRailDomains } from "@/lib/context-rail";

/**
 * De Voortgang-navigatie onder md was een horizontale chiprij die de helft
 * van de bestemmingen buiten beeld duwde (en "Overzicht" helemaal miste).
 * Sinds 26 augustus is het één inklapbare balk in de sticky header, met
 * dezelfde bestemmingen als de rail.
 */

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const domains = buildKompasRailDomains({
  slaap: 25,
  beweging: 63,
  voeding: 40,
  stress: 0,
  verbinding: 33,
});

const onOpenItem = vi.fn();
const onOpenDomein = vi.fn();

function renderNav(props: Partial<React.ComponentProps<typeof VoortgangTopNav>> = {}) {
  return render(
    <VoortgangTopNav
      activeItem="hub"
      leefstijlprofielDomein={null}
      domains={domains}
      onOpenItem={onOpenItem}
      onOpenDomein={onOpenDomein}
      {...props}
    />,
  );
}

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: /Wissel/ }));
}

beforeEach(() => {
  onOpenItem.mockClear();
  onOpenDomein.mockClear();
});

describe("VoortgangTopNav", () => {
  it("noemt ingeklapt waar je bent, inclusief het domein", () => {
    renderNav({ activeItem: "leefstijlprofiel", leefstijlprofielDomein: "slaap" });
    expect(screen.getByRole("button", { name: /Leefstijlprofiel · Slaap/ })).toBeTruthy();
  });

  it("houdt het paneel dicht tot je hem opent", () => {
    renderNav();
    expect(screen.queryByRole("menu")).toBeNull();
    openPanel();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("draagt Overzicht — de chiprij die hier stond miste die bestemming", () => {
    renderNav({ activeItem: "leefstijlprofiel", leefstijlprofielDomein: "voeding" });
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: "Overzicht" }));
    expect(onOpenItem).toHaveBeenCalledWith("hub");
  });

  it("zet alle vijf domeinen in het paneel, ook zonder horizontaal scrollen", () => {
    renderNav();
    openPanel();
    // De naam is het domeinlabel gevolgd door zijn score ("Voeding40"). Een
    // losse prefix-match op "Voeding" zou sinds het drieluik ook
    // "Voedingsbasis" raken, dus staat het cijfer in het patroon.
    for (const [label, score] of [
      ["Slaap", 25],
      ["Beweging", 63],
      ["Voeding", 40],
      ["Stress", 0],
      ["Verbinding", 33],
    ] as const) {
      expect(
        screen.getByRole("menuitem", { name: new RegExp(`^${label}${score}$`) }),
      ).toBeTruthy();
    }
  });

  it("draagt de drie voeding-knoppen onder Voeding", () => {
    renderNav();
    openPanel();
    expect(screen.getByRole("menuitem", { name: "Meten & timing" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Voedingsbasis" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Aanvullen & vergelijken" })).toBeTruthy();
  });

  it("opent een voeding-laag vanuit het paneel", () => {
    const onOpenVoedingLaag = vi.fn();
    renderNav({ onOpenVoedingLaag });
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: "Meten & timing" }));
    expect(onOpenVoedingLaag).toHaveBeenCalledWith("meten-timing");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("noemt ingeklapt de open voeding-laag", () => {
    renderNav({
      activeItem: "leefstijlprofiel",
      leefstijlprofielDomein: "voeding",
      voedingLaag: "aanvullen",
    });
    expect(screen.getByRole("button", { name: /Voeding · Aanvullen & vergelijken/ })).toBeTruthy();
  });

  it("sluit het paneel zodra je een bestemming kiest", () => {
    renderNav();
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: /^Beweging/ }));
    expect(onOpenDomein).toHaveBeenCalledWith("beweging");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("draagt Hermeting — sinds 27 augustus een scherm hier, geen eigen tabblad", () => {
    renderNav();
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: "Hermeting" }));
    expect(onOpenItem).toHaveBeenCalledWith("hermeting");
  });

  it("draagt het schap niet meer — dat is de Keuze-tab geworden", () => {
    renderNav();
    openPanel();
    expect(screen.queryByRole("menuitem", { name: /Schap|Keuze/ })).toBeNull();
  });

  it("noemt ingeklapt Hermeting als je daar staat", () => {
    renderNav({ activeItem: "hermeting" });
    expect(screen.getByRole("button", { name: /Hermeting/ })).toBeTruthy();
  });

  it("sluit op Escape", () => {
    renderNav();
    openPanel();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
