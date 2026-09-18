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

/** Opent een lege plek, zodat het invoerformulier met het ontbijt open staat. */
async function openInvoer() {
  render(<NutritionDagboekPaneel surface="test" />);
  const plekken = await screen.findAllByRole("button", {
    name: "doordeweekse dag invullen",
  });
  fireEvent.click(plekken[0]!);
}

describe("voedingsmiddel zoeken in het dagboek", () => {
  it("toont per eetmoment een zoekknop", async () => {
    await openInvoer();
    expect(
      await screen.findByRole("button", { name: "Voedingsmiddel zoeken" }),
    ).toBeTruthy();
  });

  it("vindt een voedingsmiddel op naam en telt hem bij de juiste groep", async () => {
    await openInvoer();

    fireEvent.click(
      await screen.findByRole("button", { name: "Voedingsmiddel zoeken" }),
    );

    const veld = await screen.findByPlaceholderText("Zoek een voedingsmiddel…");
    fireEvent.change(veld, { target: { value: "kwark" } });

    const toevoegen = await screen.findByRole("button", {
      name: "Magere kwark toevoegen bij ontbijt",
    });
    fireEvent.click(toevoegen);

    // Kwark valt in de zuivelgroep: die rij hoort nu in het ontbijt te staan,
    // met een teller op 1.
    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Eén zuivel & alternatieven meer bij ontbijt",
        }),
      ).toBeTruthy();
    });
  });

  it("schrijft wat via zoeken is toegevoegd naar het dagboek-endpoint", async () => {
    await openInvoer();

    fireEvent.click(
      await screen.findByRole("button", { name: "Voedingsmiddel zoeken" }),
    );
    const veld = await screen.findByPlaceholderText("Zoek een voedingsmiddel…");
    fireEvent.change(veld, { target: { value: "haring" } });
    fireEvent.click(
      await screen.findByRole("button", { name: "Haring toevoegen bij ontbijt" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Bewaar deze dag" }));

    await waitFor(() => {
      const posts = vi.mocked(fetch).mock.calls.filter(([input, init]) => {
        return (
          String(input).includes("/api/account/nutrition-daybook") &&
          Boolean(
            init &&
              typeof init === "object" &&
              "method" in init &&
              init.method === "POST",
          )
        );
      });
      expect(posts.length).toBeGreaterThan(0);
      const body = JSON.parse(String((posts[0]![1] as RequestInit).body));
      expect(body.meals.ontbijt.vis).toBe(1);
    });
  });

  it("laat de handmatige groepkeuze staan als er niets gevonden wordt", async () => {
    await openInvoer();

    fireEvent.click(
      await screen.findByRole("button", { name: "Voedingsmiddel zoeken" }),
    );
    const veld = await screen.findByPlaceholderText("Zoek een voedingsmiddel…");
    fireEvent.change(veld, { target: { value: "zxcvbnm" } });

    expect(await screen.findByText(/Niets gevonden/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "+ Eieren" })).toBeTruthy();
  });
});
