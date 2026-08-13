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

  it("laadt de dagstappen-toggle uit de bestaande priority-pref API", async () => {
    mockGlobalFetch();
    render(<AccountSettings email="dennis@example.com" />);

    await waitFor(() => {
      expect(screen.getByRole("switch", { name: "Dagstappen tonen" })).toHaveProperty(
        "ariaChecked",
        "true",
      );
    });
  });

  it("dagstappen uitzetten stuurt geen pillarId mee (regressie: mutatie mag focus niet aanraken)", async () => {
    mockGlobalFetch();
    render(<AccountSettings email="dennis@example.com" />);

    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Dagstappen tonen" })).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("switch", { name: "Dagstappen tonen" }));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith(
        "account_setting_changed",
        expect.objectContaining({ setting: "plan_steps_visible", value: "uit" }),
      );
    });

    // Deze pagina bevat geen focuskiezer meer (die zit al in Voortgang/Kompas) —
    // de toggle-mutatie mag dus ook geen pillarId in de request body sturen.
    const toggleCall = (fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls.find(
      ([, init]) => {
        const options = init as RequestInit | undefined;
        if (!options?.body) return false;
        const body = JSON.parse(options.body as string);
        return body.action === "hide_all_plan_steps";
      },
    );
    expect(toggleCall).toBeTruthy();
    const [, toggleInit] = toggleCall as [unknown, RequestInit];
    const toggleBody = JSON.parse(toggleInit.body as string);
    expect(toggleBody.pillarId).toBeUndefined();
  });

  it("toont de foutmelding in de pagina zelf als een mutatie faalt, en meet geen succes", async () => {
    mockGlobalFetch({ failToggle: true });
    render(<AccountSettings email="dennis@example.com" />);

    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Dagstappen tonen" })).toBeTruthy(),
    );

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
