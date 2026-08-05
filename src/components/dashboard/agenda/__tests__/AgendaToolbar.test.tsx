// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import AgendaToolbar from "@/components/dashboard/agenda/AgendaToolbar";

const { mockTrackEvent, mockClarityTag } = vi.hoisted(() => ({
  mockTrackEvent: vi.fn(),
  mockClarityTag: vi.fn(),
}));

vi.mock("@/lib/ga4", () => ({ trackEvent: mockTrackEvent }));
vi.mock("@/lib/clarity", () => ({ clarityTag: mockClarityTag }));

function baseProps() {
  return {
    view: "dag" as const,
    onViewChange: vi.fn(),
    periodLabel: "5 aug",
    onPeriodPrev: vi.fn(),
    onPeriodNext: vi.fn(),
    showGoToday: false,
    onGoToday: vi.fn(),
    onOpenCalendar: vi.fn(),
    stickyTop: 0,
  };
}

function dagMobileRow(container: HTMLElement) {
  const row = container.querySelector('[data-toolbar-layout="dag-mobile"]');
  if (!row) {
    throw new Error("dag-mobile toolbar row not found");
  }
  return row as HTMLElement;
}

function dagDesktopRow(container: HTMLElement) {
  const row = container.querySelector('[data-toolbar-layout="dag-desktop"]');
  if (!row) {
    throw new Error("dag-desktop toolbar row not found");
  }
  return row as HTMLElement;
}

describe("AgendaToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("toont de datum ook als je op vandaag staat (showGoToday=false) — geen 'Vandaag'-knop nodig", () => {
    const { container } = render(<AgendaToolbar {...baseProps()} />);
    expect(within(dagMobileRow(container)).getByText("5 aug")).toBeTruthy();
    expect(
      within(dagMobileRow(container)).queryByRole("button", { name: "Naar vandaag" }),
    ).toBeNull();
  });

  it("aria-live blijft gemount ongeacht showGoToday — regressie voor M1", () => {
    const { container, rerender } = render(<AgendaToolbar {...baseProps()} showGoToday={false} />);
    const liveRegionAway = dagMobileRow(container).querySelector('[aria-live="polite"]');
    expect(liveRegionAway).not.toBeNull();

    rerender(<AgendaToolbar {...baseProps()} showGoToday periodLabel="12 aug" />);
    const liveRegionToday = dagMobileRow(container).querySelector('[aria-live="polite"]');
    expect(liveRegionToday).not.toBeNull();
    expect(within(dagMobileRow(container)).getByText("12 aug")).toBeTruthy();
  });

  it("Vandaag-knop verschijnt náást de datum, niet in plaats ervan, en roept onGoToday aan", () => {
    const onGoToday = vi.fn();
    const { container } = render(
      <AgendaToolbar {...baseProps()} showGoToday onGoToday={onGoToday} />,
    );

    expect(within(dagMobileRow(container)).getByText("5 aug")).toBeTruthy();
    fireEvent.click(
      within(dagMobileRow(container)).getByRole("button", { name: "Naar vandaag" }),
    );
    expect(onGoToday).toHaveBeenCalledOnce();
  });

  it("tikken op de datum opent de kalender en meet agenda_period_picker_open", () => {
    const onOpenCalendar = vi.fn();
    const { container } = render(
      <AgendaToolbar {...baseProps()} onOpenCalendar={onOpenCalendar} />,
    );

    fireEvent.click(
      within(dagMobileRow(container)).getByRole("button", { name: "Kies een dag" }),
    );

    expect(onOpenCalendar).toHaveBeenCalledOnce();
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "agenda_period_picker_open",
      expect.objectContaining({ surface: "agenda_toolbar" }),
    );
    expect(mockClarityTag).toHaveBeenCalledWith("dashboard_agenda", "period_picker_open");
  });

  it("zonder actions geen overflow-knop, met actions wel — zelfde rij, geen hoogtesprong", () => {
    const { container, rerender } = render(
      <AgendaToolbar {...baseProps()} actions={undefined} />,
    );
    expect(
      within(dagMobileRow(container)).queryByRole("button", { name: "Meer acties" }),
    ).toBeNull();

    rerender(
      <AgendaToolbar
        {...baseProps()}
        actions={{ planHref: "/intake/plan/movement", showFocus: true, focusLabel: "Focus: Beweging" }}
      />,
    );
    expect(
      within(dagMobileRow(container)).getByRole("button", { name: "Meer acties" }),
    ).toBeTruthy();
  });

  it("Vandaag staat buiten de periode-pil — chevrons verschuiven nooit als je over de vandaag-grens navigeert (regressie bug 2+3)", () => {
    const { container, rerender } = render(
      <AgendaToolbar {...baseProps()} showGoToday={false} />,
    );

    const periodGroup = within(dagMobileRow(container)).getByRole("group", { name: "Periode" });
    expect(periodGroup.children).toHaveLength(3);
    expect(within(periodGroup).getByRole("button", { name: "Vorige periode" })).toBeTruthy();
    expect(within(periodGroup).queryByText("Vandaag")).toBeNull();

    rerender(<AgendaToolbar {...baseProps()} showGoToday periodLabel="12 aug" />);

    const periodGroupAfter = within(dagMobileRow(container)).getByRole("group", {
      name: "Periode",
    });
    expect(periodGroupAfter).toBe(periodGroup);
    expect(periodGroupAfter.children).toHaveLength(3);
    expect(
      within(periodGroupAfter).getByRole("button", { name: "Vorige periode" }),
    ).toBeTruthy();
  });

  it("Vandaag-knop blijft in de DOM staan (invisible) i.p.v. te unmounten wanneer je op vandaag bent", () => {
    const { container } = render(<AgendaToolbar {...baseProps()} showGoToday={false} />);
    const hiddenToday = dagMobileRow(container).querySelector('button[aria-label="Naar vandaag"]');
    expect(hiddenToday).not.toBeNull();
    expect(hiddenToday?.getAttribute("aria-hidden")).toBe("true");
    expect(hiddenToday?.className).toContain("invisible");
    expect(hiddenToday?.textContent).toContain("Vandaag");
  });

  it("overflow-menu: Focus-item sluit het menu en roept onToggleFocus aan", () => {
    const onToggleFocus = vi.fn();
    const { container } = render(
      <AgendaToolbar
        {...baseProps()}
        actions={{ showFocus: true, focusLabel: "Focus: Beweging", onToggleFocus }}
      />,
    );

    fireEvent.click(
      within(dagMobileRow(container)).getByRole("button", { name: "Meer acties" }),
    );
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitem", { name: "Focus: Beweging" }));
    expect(onToggleFocus).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("dag-view desktop: view-switcher staat vóór periode-navigatie in de linkse cluster", () => {
    const { container } = render(<AgendaToolbar {...baseProps()} />);
    const desktop = dagDesktopRow(container);
    const leftCluster = desktop.firstElementChild;
    expect(leftCluster).not.toBeNull();

    const viewNav = within(leftCluster as HTMLElement).getByRole("navigation", {
      name: "Weergave",
    });
    const periodGroup = within(leftCluster as HTMLElement).getByRole("group", {
      name: "Periode",
    });

    expect(
      viewNav.compareDocumentPosition(periodGroup) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("dag-view desktop: overflow-menu staat buiten de linkse cluster", () => {
    const { container } = render(
      <AgendaToolbar
        {...baseProps()}
        actions={{ showFocus: true, focusLabel: "Focus: Beweging" }}
      />,
    );
    const desktop = dagDesktopRow(container);
    const leftCluster = desktop.firstElementChild;
    const overflow = within(desktop).getByRole("button", { name: "Meer acties" });

    expect(leftCluster?.contains(overflow)).toBe(false);
  });

  it("week-view: klassieke volgorde — periode vóór view-switcher", () => {
    const { container } = render(<AgendaToolbar {...baseProps()} view="week" />);
    const row = container.querySelector("header > div");
    expect(row).not.toBeNull();

    const periodGroup = within(row as HTMLElement).getByRole("group", { name: "Periode" });
    const viewNav = within(row as HTMLElement).getByRole("navigation", { name: "Weergave" });

    expect(
      periodGroup.compareDocumentPosition(viewNav) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
