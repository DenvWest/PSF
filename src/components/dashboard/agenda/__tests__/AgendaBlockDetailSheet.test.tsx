// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgendaBlockDetailSheet from "@/components/dashboard/agenda/AgendaBlockDetailSheet";
import { buildModel } from "@/lib/dashboard-model";
import type { TimelineBlock } from "@/types/agenda";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

const { mockTrackEvent, mockTrackAgendaBlockUpdated, mockClarityTag } = vi.hoisted(() => ({
  mockTrackEvent: vi.fn(),
  mockTrackAgendaBlockUpdated: vi.fn(),
  mockClarityTag: vi.fn(),
}));

vi.mock("@/lib/ga4", () => ({
  trackEvent: mockTrackEvent,
  trackAgendaBlockUpdated: mockTrackAgendaBlockUpdated,
}));
vi.mock("@/lib/clarity", () => ({
  clarityTag: mockClarityTag,
}));

const FIXTURE_SCORES: CheckScores = {
  slaap: 44,
  energie: 57,
  stress: 50,
  voeding: 52,
  beweging: 73,
  herstel: 54,
  verbinding: 66,
};

function buildFixtureModel() {
  const trend: CheckTrend = Object.fromEntries(
    Object.keys(FIXTURE_SCORES).map((key) => [key, [FIXTURE_SCORES[key as keyof CheckScores]]]),
  ) as CheckTrend;
  return buildModel(
    { scores: FIXTURE_SCORES, vitality: 52, date: "10 jul 2026", trend },
    null,
    [],
    false,
    { MOV_CARD: 1, SLP_ONSET: 2 },
    null,
    null,
  );
}

const ROUTINE_BLOCK: TimelineBlock = {
  id: "block-1",
  kind: "routine",
  categoryId: "water",
  title: "Water drinken",
  startTime: "08:00",
  endTime: "08:15",
  done: false,
  source: "routine",
  isEditable: true,
};

describe("AgendaBlockDetailSheet — foutpad bij mislukte mutaties (B2/B4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("toggle die faalt: sheet blijft open, toont fout, geen tracking", async () => {
    const onToggleDone = vi.fn().mockRejectedValue(new Error("Kon moment niet afvinken."));
    const onClose = vi.fn();

    render(
      <AgendaBlockDetailSheet
        block={ROUTINE_BLOCK}
        model={buildFixtureModel()}
        date="2026-08-05"
        onClose={onClose}
        onToggleDone={onToggleDone}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Markeer als gedaan" }));

    expect(await screen.findByText("Kon moment niet afvinken.")).toBeTruthy();
    expect(onToggleDone).toHaveBeenCalledWith("block-1", true);
    expect(onClose).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockClarityTag).not.toHaveBeenCalledWith("agenda_block", "done");
  });

  it("toggle die slaagt: sluit en trackt pas na de resolve", async () => {
    const onToggleDone = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <AgendaBlockDetailSheet
        block={ROUTINE_BLOCK}
        model={buildFixtureModel()}
        date="2026-08-05"
        onClose={onClose}
        onToggleDone={onToggleDone}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Markeer als gedaan" }));

    await vi.waitFor(() => expect(onToggleDone).toHaveBeenCalled());
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "agenda_block_toggled",
      expect.objectContaining({ done: true }),
    );
    expect(mockClarityTag).toHaveBeenCalledWith("agenda_block", "done");
  });

  it("verplaatsen die faalt: sheet blijft open, toont de servermelding, geen tracking", async () => {
    const onRetime = vi.fn().mockRejectedValue(new Error("Kon blok niet bijwerken."));
    const onClose = vi.fn();

    render(
      <AgendaBlockDetailSheet
        block={ROUTINE_BLOCK}
        model={buildFixtureModel()}
        date="2026-08-05"
        onClose={onClose}
        onRetime={onRetime}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Verplaatsen/ }));
    fireEvent.click(screen.getByRole("button", { name: "Verplaats moment" }));

    expect(await screen.findByText("Kon blok niet bijwerken.")).toBeTruthy();
    expect(onRetime).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    expect(mockTrackAgendaBlockUpdated).not.toHaveBeenCalled();
    expect(mockClarityTag).not.toHaveBeenCalledWith("agenda_block", "updated");
  });

  it("verplaatsen naar exact 24:00 wordt lokaal geweigerd — geen server-call (B1)", () => {
    const onRetime = vi.fn().mockResolvedValue(undefined);
    const lateBlock: TimelineBlock = { ...ROUTINE_BLOCK, startTime: "23:00", endTime: "24:00" };

    render(
      <AgendaBlockDetailSheet
        block={lateBlock}
        model={buildFixtureModel()}
        date="2026-08-05"
        onClose={vi.fn()}
        onRetime={onRetime}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Verplaatsen/ }));
    fireEvent.click(screen.getByRole("button", { name: "Verplaats moment" }));

    expect(screen.getByText("Dit moment loopt over middernacht heen.")).toBeTruthy();
    expect(onRetime).not.toHaveBeenCalled();
  });
});
