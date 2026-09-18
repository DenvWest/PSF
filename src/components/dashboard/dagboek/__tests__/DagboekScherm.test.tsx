/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import DagboekScherm from "@/components/dashboard/dagboek/DagboekScherm";

vi.mock("@/lib/agenda-week-preview", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/agenda-week-preview")>();
  return {
    ...actual,
    todayInAgendaTimezone: () => "2026-09-18",
  };
});

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
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
      if (String(input).includes("/api/account/nutrition-daybook")) {
        return jsonResponse({ days: [] });
      }
      return jsonResponse({});
    }),
  );
});

/** Het maaltijdblok waar deze kop in staat — alleen zichtbaar buiten het zoekscherm. */
function maaltijdBlok(label: string): HTMLElement {
  const kop = screen.getByRole("heading", { name: label });
  const blok = kop.closest("section");
  if (!blok) throw new Error(`Geen blok gevonden voor ${label}`);
  return blok;
}

async function openZoeken(momentLabel: string) {
  fireEvent.click(
    within(maaltijdBlok(momentLabel)).getByRole("button", { name: "+ Toevoegen" }),
  );
}

describe("DagboekScherm — zoeken als eigen scherm", () => {
  it("vervangt de dagweergave door het zoekscherm van de aangeklikte maaltijd", async () => {
    render(<DagboekScherm />);
    await openZoeken("Avondeten");

    expect(
      await screen.findByLabelText("Zoek een product voor avondeten"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Avondeten/ }),
    ).toBeTruthy();
    // De maaltijdenlijst is weg zolang je zoekt — geen tabel meer op de
    // achtergrond, dit is een eigen scherm.
    expect(screen.queryByRole("heading", { name: "Ontbijt" })).toBeNull();
  });

  it("voegt een gezocht product toe, toont het als toegevoegd en houdt het veld open", async () => {
    render(<DagboekScherm />);
    await openZoeken("Ontbijt");

    const veld = await screen.findByLabelText("Zoek een product voor ontbijt");
    fireEvent.change(veld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /Havermout/ }));

    await waitFor(() => {
      expect(
        within(screen.getByLabelText("Toegevoegd bij ontbijt")).getByText(
          "Havermout",
        ),
      ).toBeTruthy();
    });

    // Klaar voor het volgende product: het veld staat er nog, leeg.
    expect(
      (screen.getByLabelText("Zoek een product voor ontbijt") as HTMLInputElement)
        .value,
    ).toBe("");
  });

  it("gaat met de terug-knop terug naar je dag", async () => {
    render(<DagboekScherm />);
    await openZoeken("Lunch");
    expect(await screen.findByLabelText("Zoek een product voor lunch")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Terug naar je dag" }));

    expect(screen.getByRole("heading", { name: "Lunch" })).toBeTruthy();
    expect(screen.queryByLabelText("Zoek een product voor lunch")).toBeNull();
  });

  it("wisselt van maaltijd via het dropdownmenu, zonder het zoekscherm te verlaten", async () => {
    render(<DagboekScherm />);
    await openZoeken("Ontbijt");
    await screen.findByLabelText("Zoek een product voor ontbijt");

    fireEvent.click(screen.getByRole("button", { name: /Ontbijt/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Avondeten" }));

    expect(
      await screen.findByLabelText("Zoek een product voor avondeten"),
    ).toBeTruthy();
  });

  it("toont wat je eerder at zodra het scherm opengaat, nog voor je typt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes("/api/account/nutrition-daybook")) {
          return jsonResponse({
            days: [
              {
                date: "2026-09-16",
                soort: "doordeweeks",
                porties: {},
                items: [{ moment: "ontbijt", key: "havermout", grams: 60 }],
              },
              {
                date: "2026-09-17",
                soort: "doordeweeks",
                porties: {},
                items: [{ moment: "lunch", key: "volkorenbrood", grams: 70 }],
              },
            ],
          });
        }
        return jsonResponse({});
      }),
    );

    render(<DagboekScherm />);
    await openZoeken("Ontbijt");

    expect(await screen.findByText("Eerder gegeten")).toBeTruthy();
    // Meest recente dag eerst: donderdag (volkorenbrood) vóór woensdag.
    const knoppen = screen.getAllByRole("button", { name: /Havermout|Volkorenbrood/ });
    expect(knoppen[0]!.textContent).toContain("Volkorenbrood");
    expect(knoppen[1]!.textContent).toContain("Havermout");
  });

  it("schrijft het toegevoegde product naar het dagboek-endpoint", async () => {
    render(<DagboekScherm />);
    await openZoeken("Ontbijt");

    fireEvent.change(
      await screen.findByLabelText("Zoek een product voor ontbijt"),
      { target: { value: "havermout" } },
    );
    fireEvent.click(await screen.findByRole("button", { name: /Havermout/ }));

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
      expect(posts.length).toBeGreaterThan(0);
      const body = JSON.parse(String((posts[0]![1] as RequestInit).body));
      expect(body.date).toBe("2026-09-18");
      expect(body.items[0].moment).toBe("ontbijt");
      expect(body.items[0].key).toBe("havermout");
    });
  });
});
