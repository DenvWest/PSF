/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NutritionDagboekPaneel from "@/components/dashboard/voortgang/NutritionDagboekPaneel";

vi.mock("@/lib/agenda-week-preview", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/agenda-week-preview")>();
  return {
    ...actual,
    todayInAgendaTimezone: () => "2026-09-05",
  };
});

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({
  emitAccountClientEvent: vi.fn(),
}));

const WEEKDAGEN = [
  {
    date: "2026-09-02",
    soort: "doordeweeks",
    porties: { groente: 1, fruit: 1, eieren: 1 },
    momenten: { ontbijt: { eieren: 1 } },
    waterMl: null,
  },
  {
    date: "2026-09-01",
    soort: "doordeweeks",
    porties: { zuivel: 2, granen: 1, noten: 1 },
    momenten: { lunch: { zuivel: 2 } },
    waterMl: null,
  },
];

function jsonResponse(body: unknown): Promise<Response> {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/account/nutrition-daybook")) {
        return jsonResponse({ days: WEEKDAGEN });
      }
      return jsonResponse({});
    }),
  );
});

describe("NutritionDagboekPaneel", () => {
  it("maakt een lege weekendplek zelf de knop, zonder 'Vul een weekenddag in'", async () => {
    render(<NutritionDagboekPaneel surface="test" />);

    const plekken = await screen.findAllByRole("button", {
      name: "weekenddag invullen",
    });
    expect(plekken).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /Vul een weekenddag in/i })).toBeNull();
  });

  it("opent onder de weekendplek een weekenddag, niet de eerstvolgende weekdag", async () => {
    render(<NutritionDagboekPaneel surface="test" />);

    const plekken = await screen.findAllByRole("button", {
      name: "weekenddag invullen",
    });
    fireEvent.click(plekken[0]!);

    const keuze = await screen.findByLabelText("Welke dag?");
    expect((keuze as HTMLSelectElement).value).toBe("2026-09-05");
    expect(screen.getByText(/Dit telt als weekenddag/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bewaar deze dag" })).toBeTruthy();
    expect(screen.queryByText("Vul een weekenddag in")).toBeNull();
  });

  it("schrijft de ingevulde dag naar het dagboek-endpoint", async () => {
    render(<NutritionDagboekPaneel surface="test" />);

    fireEvent.click(
      (await screen.findAllByRole("button", { name: "weekenddag invullen" }))[0]!,
    );

    fireEvent.click(await screen.findByRole("button", { name: "+ Eieren" }));
    fireEvent.click(screen.getByRole("button", { name: "Bewaar deze dag" }));

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls.filter(([input, init]) => {
        return (
          String(input).includes("/api/account/nutrition-daybook") &&
          Boolean(init && typeof init === "object" && "method" in init && init.method === "POST")
        );
      });
      expect(calls.length).toBeGreaterThan(0);
      const init = calls[0]![1] as RequestInit;
      const body = JSON.parse(String(init.body));
      expect(body.date).toBe("2026-09-05");
      expect(body.meals.ontbijt.eieren).toBe(1);
    });
  });
});
