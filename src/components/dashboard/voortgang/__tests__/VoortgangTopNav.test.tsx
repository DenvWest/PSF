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
      schapDomein={null}
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
    for (const label of ["Slaap", "Beweging", "Voeding", "Stress", "Verbinding"]) {
      expect(screen.getByRole("menuitem", { name: new RegExp(`^${label}`) })).toBeTruthy();
    }
  });

  it("sluit het paneel zodra je een bestemming kiest", () => {
    renderNav();
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: /^Beweging/ }));
    expect(onOpenDomein).toHaveBeenCalledWith("beweging");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("laat het schap-item weg als geen domein in beeld een schap heeft", () => {
    renderNav({ schapDomein: null });
    openPanel();
    expect(screen.queryByRole("menuitem", { name: /Schap/ })).toBeNull();
  });

  it("wijst het schap-item naar het domein dat in beeld is", () => {
    renderNav({ schapDomein: "slaap" });
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: /Schap/ }));
    expect(onOpenItem).toHaveBeenCalledWith("schap");
  });

  it("sluit op Escape", () => {
    renderNav();
    openPanel();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
