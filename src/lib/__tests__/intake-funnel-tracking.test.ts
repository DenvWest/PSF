import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEmitIntakeClientEvent, mockTrackEvent, mockClarityTag } = vi.hoisted(
  () => ({
    mockEmitIntakeClientEvent: vi.fn(),
    mockTrackEvent: vi.fn(),
    mockClarityTag: vi.fn(),
  }),
);

vi.mock("@/lib/intake-events-client", () => ({
  emitIntakeClientEvent: mockEmitIntakeClientEvent,
}));
vi.mock("@/lib/ga4", () => ({
  GA4_EVENTS: { QUIZ_GESTART: "quiz_gestart" },
  trackEvent: mockTrackEvent,
}));
vi.mock("@/lib/clarity", () => ({
  clarityTag: mockClarityTag,
}));

import {
  trackIntakePhaseCompleted,
  trackIntakeStartFromIntro,
  trackIntakeStarted,
} from "@/lib/intake-funnel-tracking";

describe("intake-funnel-tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trackIntakeStarted emitt intake.started en quiz_gestart", () => {
    trackIntakeStarted();

    expect(mockEmitIntakeClientEvent).toHaveBeenCalledWith("intake.started", {
      source: "intake",
    });
    expect(mockTrackEvent).toHaveBeenCalledWith("quiz_gestart", {
      source: "intake",
    });
  });

  it("trackIntakePhaseCompleted emitt durable, GA4 en Clarity", () => {
    trackIntakePhaseCompleted("questions");

    expect(mockEmitIntakeClientEvent).toHaveBeenCalledWith(
      "intake.phase_completed",
      { phase: "questions" },
    );
    expect(mockTrackEvent).toHaveBeenCalledWith("intake_phase_completed", {
      phase: "questions",
    });
    expect(mockClarityTag).toHaveBeenCalledWith("intake_phase", "questions");
  });

  it("trackIntakeStartFromIntro combineert start en intro-fase", () => {
    trackIntakeStartFromIntro();

    expect(mockEmitIntakeClientEvent).toHaveBeenCalledTimes(2);
    expect(mockEmitIntakeClientEvent).toHaveBeenNthCalledWith(1, "intake.started", {
      source: "intake",
    });
    expect(mockEmitIntakeClientEvent).toHaveBeenNthCalledWith(
      2,
      "intake.phase_completed",
      { phase: "intro" },
    );
  });
});
