/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import VoedingOverzicht from "@/components/dashboard/voeding/VoedingOverzicht";

vi.mock("@/lib/agenda-week-preview", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/agenda-week-preview")>();
  return {
    ...actual,
    todayInAgendaTimezone: () => "2026-09-18",
  };
});

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

function jsonResponse(body: unknown): Promise<Response> {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

function stubFetch(calorieenKcal: number | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes("/api/account/nutrition-daybook")) {
        return jsonResponse({ days: [] });
      }
      if (String(input).includes("/api/account/supermarkt-portie-logs")) {
        return jsonResponse({ items: [] });
      }
      if (String(input).includes("/api/account/macro-doelen")) {
        return jsonResponse({
          calorieenKcal,
          koolhydratenPct: null,
          vetPct: null,
          eiwitPct: null,
        });
      }
      return jsonResponse({});
    }),
  );
}

beforeEach(() => {
  stubFetch(null);
});

/**
 * De tabbladen die tot 5 oktober 2026 in het dagboek stonden. Zelfde
 * berekening, eigen plek: het dagboek vult in, deze pagina leest af.
 */
describe("VoedingOverzicht", () => {
  it("opent op Voedingsstoffen per dag, met de dag-tabel", () => {
    render(<VoedingOverzicht />);

    expect(screen.getByRole("tab", { name: "Voedingsstoffen", selected: true })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Dag", checked: true })).toBeTruthy();
    expect(screen.getByText("Alles wat je at")).toBeTruthy();
  });

  it("heeft geen los Calorieën-tabblad — de ring staat op Macro's", () => {
    render(<VoedingOverzicht />);

    expect(screen.queryByRole("tab", { name: "Calorieën" })).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Macro's" }));

    expect(screen.getByText("Cal.")).toBeTruthy();
    expect(screen.getAllByText(/Koolhydraten/).length).toBeGreaterThan(0);
  });

  it("toont per week het zelf ingestelde doel", async () => {
    stubFetch(2200);
    render(<VoedingOverzicht />);

    fireEvent.click(screen.getByRole("radio", { name: "Week" }));

    // Het doel komt uit de macro-doelen-fetch, niet uit een berekening.
    expect(await screen.findByText(/2200 kcal/)).toBeTruthy();
  });

  it("toont geen berekend of vooringevuld doel zolang er niets is ingesteld", async () => {
    render(<VoedingOverzicht />);

    fireEvent.click(screen.getByRole("tab", { name: "Macro's" }));
    fireEvent.click(screen.getByRole("radio", { name: "Week" }));

    const cellen = await screen.findAllByText("—");
    expect(cellen.length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/NaN/)).toBeNull();
  });

  it("bladert niet voorbij vandaag", () => {
    render(<VoedingOverzicht />);

    const volgende = screen.getByRole("button", { name: "Volgende dag" }) as HTMLButtonElement;
    expect(volgende.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Vorige dag" }));
    expect(volgende.disabled).toBe(false);
  });
});
