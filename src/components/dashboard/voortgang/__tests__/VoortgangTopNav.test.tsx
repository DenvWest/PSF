// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VoortgangTopNav from "@/components/dashboard/voortgang/VoortgangTopNav";

/**
 * De Voortgang-navigatie onder md was een horizontale chiprij die de helft
 * van de bestemmingen buiten beeld duwde (en "Overzicht" helemaal miste).
 * Sinds 26 augustus is het één inklapbare balk in de sticky header. Sinds 23
 * september kent Voortgang nog maar twee bestemmingen — Je patroon en
 * Hermeting — want Leefstijlprofiel (de domeinhub) is opgeheven toen voeding
 * het enige domein werd.
 */

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const onOpenItem = vi.fn();

function renderNav(props: Partial<React.ComponentProps<typeof VoortgangTopNav>> = {}) {
  return render(<VoortgangTopNav activeItem="hub" onOpenItem={onOpenItem} {...props} />);
}

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: /Wissel/ }));
}

beforeEach(() => {
  onOpenItem.mockClear();
});

describe("VoortgangTopNav", () => {
  it("noemt ingeklapt Je patroon als je daar staat", () => {
    renderNav({ activeItem: "hub" });
    expect(screen.getByRole("button", { name: /Je patroon/ })).toBeTruthy();
  });

  it("houdt het paneel dicht tot je hem opent", () => {
    renderNav();
    expect(screen.queryByRole("menu")).toBeNull();
    openPanel();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("draagt Je patroon en Hermeting, verder niets", () => {
    renderNav();
    openPanel();
    expect(screen.getByRole("menuitem", { name: "Je patroon" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Hermeting" })).toBeTruthy();
    expect(screen.queryAllByRole("menuitem")).toHaveLength(2);
  });

  it("opent Je patroon vanuit het paneel", () => {
    renderNav({ activeItem: "hermeting" });
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: "Je patroon" }));
    expect(onOpenItem).toHaveBeenCalledWith("hub");
  });

  it("opent Hermeting vanuit het paneel — sinds 27 augustus een scherm hier, geen eigen tabblad", () => {
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

  it("draagt geen leefstijlprofiel meer — de domeinhub is opgeheven", () => {
    renderNav();
    openPanel();
    expect(screen.queryByRole("menuitem", { name: /Leefstijlprofiel/ })).toBeNull();
  });

  it("noemt ingeklapt Hermeting als je daar staat", () => {
    renderNav({ activeItem: "hermeting" });
    expect(screen.getByRole("button", { name: /Hermeting/ })).toBeTruthy();
  });

  it("sluit het paneel zodra je een bestemming kiest", () => {
    renderNav();
    openPanel();
    fireEvent.click(screen.getByRole("menuitem", { name: "Hermeting" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("sluit op Escape", () => {
    renderNav();
    openPanel();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
