// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccountSettings from "@/components/account/AccountSettings";

const { mockTrackEvent, mockClarityTag, mockPush } = vi.hoisted(() => ({
  mockTrackEvent: vi.fn(),
  mockClarityTag: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock("@/lib/ga4", () => ({ trackEvent: mockTrackEvent }));
vi.mock("@/lib/clarity", () => ({ clarityTag: mockClarityTag }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/use-movement-plan-profile", () => ({
  useMovementPlanProfile: () => ({
    profile: {
      startPattern: null,
      anchor: null,
      preferredSport: null,
      weeklyFrequency: null,
      trainingLocation: null,
      sports: [],
      targetMinutes: 150,
      targetDays: 3,
      targetStrength: 2,
    },
    loading: false,
    prefsBusy: false,
    saveProfilePatch: vi.fn(async () => {}),
    toggleSport: vi.fn(),
    applyKnownPatch: vi.fn(),
  }),
}));

const BASE_PREF = {
  pillarId: "beweging",
  source: "user_selected",
  timeBucket: "ochtend",
  scheduledTime: "07:30",
  planStepDismissedDate: null,
  planStepsHidden: false,
  movementDayChoice: null,
  movementDayChoiceDate: null,
  updatedAt: "2026-08-05T07:00:00.000Z",
  enginePriorityId: "slaap",
};

function mockGlobalFetch(overrides?: { planStepsHidden?: boolean; failToggle?: boolean }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.includes("/api/account/priority-pref")) {
        if (method === "POST") {
          const body = init?.body ? JSON.parse(init.body as string) : {};
          if (body.action === "hide_all_plan_steps" || body.action === "show_all_plan_steps") {
            if (overrides?.failToggle) {
              return new Response(JSON.stringify({ error: "Kon dagstappen niet verbergen." }), {
                status: 500,
              });
            }
            return new Response(
              JSON.stringify({
                ...BASE_PREF,
                planStepsHidden: body.action === "hide_all_plan_steps",
              }),
              { status: 200 },
            );
          }
          return new Response(JSON.stringify({ ...BASE_PREF, pillarId: body.pillarId }), {
            status: 200,
          });
        }
        return new Response(
          JSON.stringify({ ...BASE_PREF, planStepsHidden: overrides?.planStepsHidden ?? false }),
          { status: 200 },
        );
      }

      if (url.includes("/api/account/claim-sessions")) {
        return new Response(JSON.stringify({ count: 0 }), { status: 200 });
      }

      return new Response(JSON.stringify({}), { status: 200 });
    }),
  );
}

describe("AccountSettings — dashboard-instellingen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("laadt focus, vaste tijd en dagstappen-toggle uit de bestaande priority-pref API", async () => {
    mockGlobalFetch();
    render(<AccountSettings email="dennis@example.com" />);

    await waitFor(() => {
      expect(screen.getByText("advies")).toBeTruthy();
    });
    expect(screen.getByRole("switch", { name: "Dagstappen tonen" })).toHaveProperty(
      "ariaChecked",
      "true",
    );
  });

  it("dagstappen uitzetten laat de gekozen focus onaangetast (regressie: mutatie zonder pillarId in de body)", async () => {
    mockGlobalFetch();
    render(<AccountSettings email="dennis@example.com" />);

    await waitFor(() => expect(screen.getByText("advies")).toBeTruthy());

    fireEvent.click(screen.getByRole("switch", { name: "Dagstappen tonen" }));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith(
        "account_setting_changed",
        expect.objectContaining({ setting: "plan_steps_visible", value: "uit" }),
      );
    });
    // Beweging blijft de geselecteerde focus-rij (niet teruggevallen op iets anders).
    expect(screen.getByRole("button", { name: /^Beweging/ })).toBeTruthy();
  });

  it("toont de foutmelding in de pagina zelf als een mutatie faalt, en meet geen succes", async () => {
    mockGlobalFetch({ failToggle: true });
    render(<AccountSettings email="dennis@example.com" />);

    await waitFor(() => expect(screen.getByText("advies")).toBeTruthy());

    fireEvent.click(screen.getByRole("switch", { name: "Dagstappen tonen" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Kon dagstappen niet verbergen.",
      );
    });
    expect(
      mockTrackEvent.mock.calls.filter(([name]) => name === "account_setting_changed"),
    ).toHaveLength(0);
  });
});
