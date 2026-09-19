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

/** Het maaltijdblok waar deze kop in staat. */
function maaltijdBlok(label: string): HTMLElement {
  const kop = screen.getByRole("heading", { name: label });
  const blok = kop.closest("section");
  if (!blok) throw new Error(`Geen blok gevonden voor ${label}`);
  return blok;
}

describe("DagboekScherm — zoeken per maaltijd", () => {
  it("opent het zoekveld binnen de maaltijd die je aanklikt", async () => {
    render(<DagboekScherm />);

    const avondeten = maaltijdBlok("Avondeten");
    fireEvent.click(within(avondeten).getByRole("button", { name: "+ Toevoegen" }));

    // Het veld hoort in het avondeten-blok te staan, niet ergens bovenaan.
    expect(
      within(maaltijdBlok("Avondeten")).getByLabelText(
        "Zoek een product voor avondeten",
      ),
    ).toBeTruthy();
    expect(
      within(maaltijdBlok("Ontbijt")).queryByRole("searchbox"),
    ).toBeNull();
  });

  it("voegt een gezocht product toe en houdt het veld open voor het volgende", async () => {
    render(<DagboekScherm />);

    const ontbijt = maaltijdBlok("Ontbijt");
    fireEvent.click(within(ontbijt).getByRole("button", { name: "+ Toevoegen" }));

    const veld = within(maaltijdBlok("Ontbijt")).getByLabelText(
      "Zoek een product voor ontbijt",
    );
    fireEvent.change(veld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /Havermout/ }));

    await waitFor(() => {
      expect(within(maaltijdBlok("Ontbijt")).getByText("Havermout")).toBeTruthy();
    });

    // Klaar voor het volgende product: het veld staat er nog, zonder zoekterm.
    const naVeld = within(maaltijdBlok("Ontbijt")).getByLabelText(
      "Zoek een product voor ontbijt",
    ) as HTMLInputElement;
    expect(naVeld.value).toBe("");
  });

  it("sluit het zoekveld als je nogmaals op Toevoegen klikt", async () => {
    render(<DagboekScherm />);

    const lunch = maaltijdBlok("Lunch");
    fireEvent.click(within(lunch).getByRole("button", { name: "+ Toevoegen" }));
    expect(
      within(maaltijdBlok("Lunch")).getByLabelText("Zoek een product voor lunch"),
    ).toBeTruthy();

    fireEvent.click(
      within(maaltijdBlok("Lunch")).getByRole("button", { name: "+ Toevoegen" }),
    );
    expect(
      within(maaltijdBlok("Lunch")).queryByLabelText("Zoek een product voor lunch"),
    ).toBeNull();
  });

  it("toont wat je eerder at zodra het veld opengaat, nog voor je typt", async () => {
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

    fireEvent.click(
      within(maaltijdBlok("Ontbijt")).getByRole("button", { name: "+ Toevoegen" }),
    );

    expect(await screen.findByText("Eerder gegeten")).toBeTruthy();
    // Meest recente dag eerst: donderdag (volkorenbrood) vóór woensdag.
    const knoppen = screen.getAllByRole("button", { name: /Havermout|Volkorenbrood/ });
    expect(knoppen[0]!.textContent).toContain("Volkorenbrood");
    expect(knoppen[1]!.textContent).toContain("Havermout");
  });

  it("schrijft het toegevoegde product naar het dagboek-endpoint", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      within(maaltijdBlok("Ontbijt")).getByRole("button", { name: "+ Toevoegen" }),
    );
    fireEvent.change(
      within(maaltijdBlok("Ontbijt")).getByLabelText("Zoek een product voor ontbijt"),
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

describe("DagboekScherm — balk naar detail naar zoek naar portie", () => {
  it("opent het detailscherm van een stof als je op de balk klikt", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));

    expect(
      await screen.findByRole("heading", { name: "Magnesium" }),
    ).toBeTruthy();
    // De weekstrip en de eetmomenten horen niet meer op dit scherm te staan.
    expect(screen.queryByRole("button", { name: "+ Toevoegen" })).toBeNull();
  });

  it("gaat van detail naar zoeken naar portie-invoer en schrijft een supplement-item weg", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });

    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "magnesiumcitraat" } });

    fireEvent.click(
      await screen.findByRole("button", { name: /Magnesiumcitraat/ }),
    );

    // Portie-invoerscherm: bevestigen schrijft het item weg en brengt je
    // terug naar het detailscherm van dezelfde stof.
    const bevestig = await screen.findByRole("button", { name: "Toevoegen" });
    fireEvent.click(bevestig);

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
      expect(body.items[0].bron).toBe("supplement");
      expect(body.items[0].key).toBe("magnesiumcitraat-capsule");
    });

    expect(
      await screen.findByRole("heading", { name: "Magnesium" }),
    ).toBeTruthy();
  });

  it("neemt het eetmoment dat je op het zoekscherm koos mee naar het portiescherm", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });
    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));

    // De dropdown staat bovenaan het zoekscherm, vóór je iets kiest.
    const momentVeld = await screen.findByLabelText("Eetmoment");
    fireEvent.change(momentVeld, { target: { value: "lunch" } });

    fireEvent.change(
      screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
      { target: { value: "magnesiumcitraat" } },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Magnesiumcitraat/ }),
    );

    // Het portiescherm start op hetzelfde moment, niet op de oude default.
    const momentOpPortiescherm = (await screen.findByLabelText(
      "Eetmoment",
    )) as HTMLSelectElement;
    expect(momentOpPortiescherm.value).toBe("lunch");

    fireEvent.click(await screen.findByRole("button", { name: "Toevoegen" }));

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
      expect(body.items[0].moment).toBe("lunch");
    });
  });
});
