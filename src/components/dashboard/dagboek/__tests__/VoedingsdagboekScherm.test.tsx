/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import VoedingsdagboekScherm from "@/components/dashboard/dagboek/VoedingsdagboekScherm";

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
        return jsonResponse({ days: [] });
      }
      return jsonResponse({});
    }),
  );
});

async function zoekEnVoegToe(zoekterm: string, knopnaam: string) {
  fireEvent.click(
    await screen.findByRole("button", { name: "Voedingsmiddel zoeken" }),
  );
  fireEvent.change(await screen.findByPlaceholderText("Zoek een voedingsmiddel…"), {
    target: { value: zoekterm },
  });
  fireEvent.click(await screen.findByRole("button", { name: knopnaam }));
}

describe("VoedingsdagboekScherm", () => {
  it("opent op het ontbijt met zoeken als eerste actie", async () => {
    render(<VoedingsdagboekScherm />);

    expect(await screen.findByText("Heb je ontbijt al gegeten?")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Voedingsmiddel zoeken" }),
    ).toBeTruthy();
  });

  it("wisselt van eetmoment via het menu bovenin", async () => {
    render(<VoedingsdagboekScherm />);

    fireEvent.click(await screen.findByRole("button", { name: /Ontbijt/ }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Avondeten" }));

    expect(await screen.findByText("Heb je avondeten al gegeten?")).toBeTruthy();
  });

  it("telt een gezocht voedingsmiddel bij de juiste groep en in het dagtotaal", async () => {
    render(<VoedingsdagboekScherm />);
    await zoekEnVoegToe("havermout", "Havermout toevoegen bij ontbijt");

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Eén volkoren granen meer bij ontbijt",
        }),
      ).toBeTruthy();
    });
    expect(screen.getByText(/voedselgroepen op vandaag/)).toBeTruthy();
  });

  it("schrijft de dag naar het endpoint en meldt daarna 'Opgeslagen'", async () => {
    render(<VoedingsdagboekScherm />);
    await zoekEnVoegToe("havermout", "Havermout toevoegen bij ontbijt");

    fireEvent.click(await screen.findByRole("button", { name: /Dag opslaan/ }));

    await waitFor(() => {
      const posts = vi.mocked(fetch).mock.calls.filter(
        ([input, init]) =>
          String(input).includes("/api/account/nutrition-daybook") &&
          Boolean(
            init &&
              typeof init === "object" &&
              "method" in init &&
              init.method === "POST",
          ),
      );
      expect(posts.length).toBe(1);
      const body = JSON.parse(String((posts[0]![1] as RequestInit).body));
      expect(body.date).toBe("2026-09-05");
      expect(body.meals.ontbijt.granen).toBe(1);
    });

    expect(await screen.findByText("Opgeslagen")).toBeTruthy();
  });

  it("houdt het concept per dag vast, zodat wisselen van dag niets weggooit", async () => {
    render(<VoedingsdagboekScherm />);
    await zoekEnVoegToe("havermout", "Havermout toevoegen bij ontbijt");

    await screen.findByRole("button", {
      name: "Eén volkoren granen meer bij ontbijt",
    });

    // Naar gisteren en weer terug: het ontbijt van vandaag hoort er nog te staan.
    const dagKeuze = screen.getByLabelText("Welke dag");
    fireEvent.change(dagKeuze, { target: { value: "2026-09-04" } });
    expect(await screen.findByText("Heb je ontbijt al gegeten?")).toBeTruthy();

    fireEvent.change(dagKeuze, { target: { value: "2026-09-05" } });
    expect(
      await screen.findByRole("button", {
        name: "Eén volkoren granen meer bij ontbijt",
      }),
    ).toBeTruthy();
  });

  it("laat water los van de eetmomenten registreren", async () => {
    render(<VoedingsdagboekScherm />);

    fireEvent.click(await screen.findByRole("button", { name: /Ontbijt/ }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Water" }));

    fireEvent.click(
      await screen.findByRole("button", { name: "Eén glas water meer" }),
    );

    expect(await screen.findByText(/liter water/)).toBeTruthy();
  });
});
