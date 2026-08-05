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

describe("AgendaToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("toont de datum ook als je op vandaag staat (showGoToday=false) — geen 'Vandaag'-knop nodig", () => {
    render(<AgendaToolbar {...baseProps()} />);
    expect(screen.getByText("5 aug")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Naar vandaag" })).toBeNull();
  });

  it("aria-live blijft gemount ongeacht showGoToday — regressie voor M1", () => {
    const { rerender } = render(<AgendaToolbar {...baseProps()} showGoToday={false} />);
    const liveRegionAway = document.querySelector('[aria-live="polite"]');
    expect(liveRegionAway).not.toBeNull();

    rerender(<AgendaToolbar {...baseProps()} showGoToday periodLabel="12 aug" />);
    const liveRegionToday = document.querySelector('[aria-live="polite"]');
    expect(liveRegionToday).not.toBeNull();
    expect(screen.getByText("12 aug")).toBeTruthy();
  });

  it("Vandaag-knop verschijnt náást de datum, niet in plaats ervan, en roept onGoToday aan", () => {
    const onGoToday = vi.fn();
    render(<AgendaToolbar {...baseProps()} showGoToday onGoToday={onGoToday} />);

    expect(screen.getByText("5 aug")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Naar vandaag" }));
    expect(onGoToday).toHaveBeenCalledOnce();
  });

  it("tikken op de datum opent de kalender en meet agenda_period_picker_open", () => {
    const onOpenCalendar = vi.fn();
    render(<AgendaToolbar {...baseProps()} onOpenCalendar={onOpenCalendar} />);

    fireEvent.click(screen.getByRole("button", { name: "Kies een dag" }));

    expect(onOpenCalendar).toHaveBeenCalledOnce();
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "agenda_period_picker_open",
      expect.objectContaining({ surface: "agenda_toolbar" }),
    );
    expect(mockClarityTag).toHaveBeenCalledWith("dashboard_agenda", "period_picker_open");
  });

  it("zonder actions geen overflow-knop, met actions wel — zelfde rij, geen hoogtesprong", () => {
    const { rerender } = render(<AgendaToolbar {...baseProps()} actions={undefined} />);
    expect(screen.queryByRole("button", { name: "Meer acties" })).toBeNull();

    rerender(
      <AgendaToolbar
        {...baseProps()}
        actions={{ planHref: "/intake/plan/movement", showFocus: true, focusLabel: "Focus: Beweging" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Meer acties" })).toBeTruthy();
  });

  it("Vandaag staat buiten de periode-pil — chevrons verschuiven nooit als je over de vandaag-grens navigeert (regressie bug 2+3)", () => {
    const { rerender } = render(<AgendaToolbar {...baseProps()} showGoToday={false} />);

    const periodGroup = screen.getByRole("group", { name: "Periode" });
    expect(periodGroup.children).toHaveLength(3);
    expect(within(periodGroup).getByRole("button", { name: "Vorige periode" })).toBeTruthy();
    expect(within(periodGroup).queryByText("Vandaag")).toBeNull();

    rerender(<AgendaToolbar {...baseProps()} showGoToday periodLabel="12 aug" />);

    const periodGroupAfter = screen.getByRole("group", { name: "Periode" });
    expect(periodGroupAfter).toBe(periodGroup);
    expect(periodGroupAfter.children).toHaveLength(3);
    expect(
      within(periodGroupAfter).getByRole("button", { name: "Vorige periode" }),
    ).toBeTruthy();
  });

  it("Vandaag-knop blijft in de DOM staan (invisible) i.p.v. te unmounten wanneer je op vandaag bent", () => {
    const { container } = render(<AgendaToolbar {...baseProps()} showGoToday={false} />);
    const hiddenToday = container.querySelector('button[aria-label="Naar vandaag"]');
    expect(hiddenToday).not.toBeNull();
    expect(hiddenToday?.getAttribute("aria-hidden")).toBe("true");
    expect(hiddenToday?.className).toContain("invisible");
    expect(hiddenToday?.textContent).toContain("Vandaag");
  });

  it("overflow-menu: Focus-item sluit het menu en roept onToggleFocus aan", () => {
    const onToggleFocus = vi.fn();
    render(
      <AgendaToolbar
        {...baseProps()}
        actions={{ showFocus: true, focusLabel: "Focus: Beweging", onToggleFocus }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Meer acties" }));
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitem", { name: "Focus: Beweging" }));
    expect(onToggleFocus).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
