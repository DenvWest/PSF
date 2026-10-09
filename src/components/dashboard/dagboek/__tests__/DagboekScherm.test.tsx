/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { SupermarktProduct } from "@/types/supermarkt-product";
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

/**
 * Testfixture voor Laag A: de supermarktcatalogus staat server-side
 * (`sm_products`), dus de zoek-naar-portie-flow krijgt zijn product uit een
 * gemockte `/api/account/supermarkt-producten`-respons.
 */
const testProduct: SupermarktProduct = {
  prodId: "off:8710000000001",
  bron: "off",
  bronId: "8710000000001",
  naam: "AH Testproduct",
  merk: "AH",
  categorie: "test",
  snapshotDatum: "2026-10-01",
  energyKcal: 250,
  fatG: 10,
  saturatedFatG: 3,
  carbohydrateG: 30,
  sugarsG: 5,
  fiberG: 2,
  proteinG: 8,
  saltG: 1,
  sodiumMg: null,
  calciumMg: null,
  ironMg: null,
  vitaminCMg: null,
  vitaminDµg: null,
  potassiumMg: null,
  magnesiumMg: null,
  zincMg: null,
  vitaminB12µg: null,
};

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
      if (String(input).includes("/api/account/supermarkt-portie-logs")) {
        return jsonResponse({ items: [] });
      }
      if (String(input).includes("/api/account/supermarkt-producten")) {
        const q = new URL(String(input), "http://localhost").searchParams.get("q") ?? "";
        return jsonResponse({
          producten: testProduct.naam.toLowerCase().includes(q.toLowerCase()) ? [testProduct] : [],
        });
      }
      if (String(input).includes("/api/account/macro-doelen")) {
        return jsonResponse({
          calorieenKcal: null,
          koolhydratenPct: null,
          vetPct: null,
          eiwitPct: null,
        });
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
  it("opent het volledige zoekscherm voor de maaltijd die je aanklikt", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Avondeten — product toevoegen" }),
    );

    // De hele balk is de knop, en die opent hetzelfde zoekscherm als een
    // nutriëntdetail — met titel, momentkeuze en tabbladen, niet een los
    // inline veld dat alleen voeding kon vinden.
    expect(
      await screen.findByRole("heading", { name: "Voeg toe aan avondeten" }),
    ).toBeTruthy();
    const momentGroep = screen.getByRole("group", { name: "Eetmoment" });
    expect(
      within(momentGroep).getByRole("button", { name: "Avondeten" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
    expect(screen.getByRole("tab", { name: "Mijn supplementen" })).toBeTruthy();
  });

  it("voegt een gezocht product toe en laat je in de zoeklijst voor het volgende", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Toevoegen" }));

    // Terug in de zoeklijst, klaar voor het volgende product — niet terug
    // naar het overzicht, want een maaltijd is zelden één product.
    await waitFor(() => {
      expect(
        screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
      ).toBeTruthy();
    });

    // Pas via de terugknop is het toegevoegde product in de maaltijdtabel te zien.
    fireEvent.click(screen.getByRole("button", { name: "Terug" }));
    await waitFor(() => {
      expect(within(maaltijdBlok("Ontbijt")).getByText("Havermout")).toBeTruthy();
    });
  });

  it("brengt je met terug uit een portie bij dezelfde zoekterm en lijst", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Terug" }));

    const terug = (await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    )) as HTMLInputElement;
    expect(terug.value).toBe("havermout");
    expect(await screen.findByRole("button", { name: /^Havermout/ })).toBeTruthy();
  });

  it("loopt de terugknop van de browser stap voor stap terug: portie, zoeken, overzicht", async () => {
    render(<DagboekScherm />);
    const zoekLabel = "Zoek een voedingsmiddel of supplement";

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    fireEvent.change(await screen.findByLabelText(zoekLabel), {
      target: { value: "havermout" },
    });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    await waitFor(() => expect(screen.queryByLabelText(zoekLabel)).toBeNull());

    window.history.back();
    await screen.findByLabelText(zoekLabel);
    expect((screen.getByLabelText(zoekLabel) as HTMLInputElement).value).toBe("havermout");

    window.history.back();
    await waitFor(() => expect(screen.queryByLabelText(zoekLabel)).toBeNull());
  });

  it("gaat vanuit een portie terug naar de rijkste bronnen, met knop en met browser", async () => {
    render(<DagboekScherm />);
    const bronnenKop = /^Rijkste bronnen van/;
    const eersteBron = () => screen.getAllByRole("button", { name: /^Voeg .* toe$/ })[0];

    fireEvent.click(await screen.findByRole("button", { name: "Alle stoffen (5)" }));
    fireEvent.click(await screen.findByRole("button", { name: "Omega-3" }));
    fireEvent.click(await screen.findByRole("button", { name: "Rijkste bronnen →" }));
    await screen.findByText(bronnenKop);

    fireEvent.click(eersteBron());
    await waitFor(() => expect(screen.queryByText(bronnenKop)).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Terug" }));
    await screen.findByText(bronnenKop);
    await new Promise((klaar) => setTimeout(klaar, 20));

    fireEvent.click(eersteBron());
    await waitFor(() => expect(screen.queryByText(bronnenKop)).toBeNull());
    window.history.back();
    await screen.findByText(bronnenKop);
  });

  it("zet de browsergeschiedenis recht als je met de app-knop terug gaat", async () => {
    render(<DagboekScherm />);
    const zoekLabel = "Zoek een voedingsmiddel of supplement";

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    await waitFor(() => expect(screen.queryByLabelText(zoekLabel)).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Terug" }));
    await screen.findByLabelText(zoekLabel);

    window.history.back();
    await waitFor(() =>
      expect(
        screen.queryByLabelText("Zoek een voedingsmiddel of supplement"),
      ).toBeNull(),
    );
  });

  it("kan het eetmoment nog wijzigen vlak vóór je een product kiest", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Lunch — product toevoegen" }),
    );
    const momentGroep = await screen.findByRole("group", { name: "Eetmoment" });
    fireEvent.click(within(momentGroep).getByRole("button", { name: "Tussendoor" }));

    fireEvent.change(
      screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
      { target: { value: "havermout" } },
    );
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Toevoegen" }));

    await waitFor(() => {
      expect(
        screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Terug" }));
    await waitFor(() => {
      expect(within(maaltijdBlok("Tussendoor")).getByText("Havermout")).toBeTruthy();
    });
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

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );

    expect(await screen.findByText("Eerder gebruikt")).toBeTruthy();
    // Meest recente dag eerst: donderdag (volkorenbrood) vóór woensdag. Anker
    // op het begin van de naam: de ster-knop ernaast heet "Bewaar X als
    // favoriet" en zou anders ook meetellen.
    const knoppen = screen.getAllByRole("button", { name: /^(Havermout|Volkorenbrood)/ });
    expect(knoppen[0]!.textContent).toContain("Volkorenbrood");
    expect(knoppen[1]!.textContent).toContain("Havermout");
  });

  it("schrijft het toegevoegde product naar het dagboek-endpoint", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    fireEvent.change(
      await screen.findByLabelText("Zoek een voedingsmiddel of supplement"),
      { target: { value: "havermout" } },
    );
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
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
      expect(body.date).toBe("2026-09-18");
      expect(body.items[0].moment).toBe("ontbijt");
      expect(body.items[0].key).toBe("havermout");
    });
  });
});

describe("DagboekScherm — balk naar detail naar zoek naar portie", () => {
  it("opent het detailscherm van een stof als je op de balk klikt", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Alle stoffen/ }));
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));

    expect(
      await screen.findByRole("heading", { name: "Magnesium" }),
    ).toBeTruthy();
    // De weekstrip en de eetmomenten horen niet meer op dit scherm te staan.
    expect(
      screen.queryByRole("button", { name: "Ontbijt — product toevoegen" }),
    ).toBeNull();
  });

  it("gaat van detail naar zoeken naar portie-invoer en schrijft een supplement-item weg", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Alle stoffen/ }));
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });

    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "magnesiumcitraat" } });

    fireEvent.click(
      await screen.findByRole("button", { name: /^Magnesiumcitraat/ }),
    );

    // De portielaag komt over de zoeklijst heen; bevestigen schrijft het item
    // weg en laat je in de lijst achter voor het volgende product.
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

    // Terug in de zoeklijst, klaar voor het volgende product — niet terug naar
    // het detailscherm, want een maaltijd is zelden één product.
    expect(
      await screen.findByLabelText("Zoek een voedingsmiddel of supplement"),
    ).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("neemt het eetmoment dat je op het zoekscherm koos mee naar wat je opslaat", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Alle stoffen/ }));
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });
    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));

    // Het moment kies je op het zoekscherm, één keer voor alles wat je in deze
    // sessie toevoegt. Chips in plaats van een select.
    const momentGroep = await screen.findByRole("group", { name: "Eetmoment" });
    fireEvent.click(within(momentGroep).getByRole("button", { name: "Lunch" }));

    fireEvent.change(
      screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
      { target: { value: "magnesiumcitraat" } },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /^Magnesiumcitraat/ }),
    );

    // De portielaag herhaalt de keuze niet, maar bevestigt hem wel in woorden.
    const laag = await screen.findByRole("dialog");
    expect(within(laag).getByText(/naar lunch/)).toBeTruthy();

    fireEvent.click(within(laag).getByRole("button", { name: "Toevoegen" }));

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

describe("DagboekScherm — favorieten", () => {
  it("bewaart een zoekresultaat als favoriet via de ster-knop, zonder het te kiezen", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Alle stoffen/ }));
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });
    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));

    fireEvent.change(
      await screen.findByLabelText("Zoek een voedingsmiddel of supplement"),
      { target: { value: "magnesiumcitraat" } },
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Bewaar Magnesiumcitraat.*als favoriet/,
      }),
    );

    await waitFor(() => {
      const posts = vi.mocked(fetch).mock.calls.filter(
        ([input, init]) =>
          String(input).includes("/api/account/dagboek-favorieten") &&
          Boolean(
            init &&
              typeof init === "object" &&
              "method" in init &&
              init.method === "POST",
          ),
      );
      expect(posts.length).toBeGreaterThan(0);
      const body = JSON.parse(String((posts[0]![1] as RequestInit).body));
      expect(body).toEqual({ bron: "supplement", key: "magnesiumcitraat-capsule" });
    });

    // Klikken op de ster brengt je niet naar het portiescherm — je bent nog op het zoekscherm.
    expect(
      screen.queryByRole("heading", { name: "Voeg toe bij magnesium" }),
    ).toBeTruthy();
  });

  it("toont het tabblad Mijn supplementen als je erop klikt", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("button", { name: /Alle stoffen/ }));
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });
    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));

    fireEvent.click(await screen.findByRole("tab", { name: "Mijn supplementen" }));

    expect(
      screen.getByText("Nog geen supplementen bewaard of gebruikt."),
    ).toBeTruthy();
  });
});

describe("DagboekScherm — opslaan dat misgaat", () => {
  /**
   * De optimistische regel verscheen meteen, maar bleef ook staan als de POST
   * mislukte. Je zag dan een product dat niet was opgeslagen, en bij een
   * herlaadslag was het weg zonder dat iets dat had aangekondigd.
   */
  it("draait de regel terug en meldt het wanneer opslaan mislukt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("/api/account/nutrition-daybook")) {
          if (init?.method === "POST") {
            return Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response);
          }
          return jsonResponse({ days: [] });
        }
        return jsonResponse({});
      }),
    );

    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Toevoegen" }));

    // Terug naar het overzicht: de foutmelding staat daar, niet op het zoekscherm.
    await waitFor(() => {
      expect(
        screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Terug" }));

    // De melding komt, en de regel die niet is opgeslagen staat er niet meer.
    expect((await screen.findByRole("status")).textContent).toContain(
      "Kon je dag niet opslaan.",
    );
    await waitFor(() => {
      expect(within(maaltijdBlok("Ontbijt")).queryByText("Havermout")).toBeNull();
    });
  });

  /**
   * De `schrijfTeller`-bescherming in `bewaar()` voorkomt dat een laat
   * antwoord op een oud verzoek een nieuwer resultaat terugdraait. Sinds het
   * volledige zoekscherm ook de "Toevoegen"-knop `disabled={busy}` maakt, kan
   * een gebruiker geen tweede schrijfactie meer starten vóór de eerste klaar
   * is — de race die deze test eerder forceerde via twee snelle kliks bestaat
   * dus niet meer op UI-niveau. Dat is een verbetering: deze test legt vast
   * dat de knop inderdaad geblokkeerd blijft zolang er een schrijving loopt.
   */
  it("blokkeert een tweede toevoeging zolang de eerste nog opgeslagen wordt", async () => {
    const wachtenden: Array<(waarde: Response) => void> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("/api/account/nutrition-daybook")) {
          if (init?.method === "POST") {
            return new Promise<Response>((resolve) => {
              wachtenden.push(resolve);
            });
          }
          return jsonResponse({ days: [] });
        }
        return jsonResponse({});
      }),
    );

    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );

    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Toevoegen" }));

    await waitFor(() => expect(wachtenden).toHaveLength(1));

    // Nog geen tweede kans: de zoekknoppen zijn er weer, maar het toevoegen
    // zelf ligt stil tot de eerste POST is beantwoord.
    fireEvent.change(
      await screen.findByLabelText("Zoek een voedingsmiddel of supplement"),
      { target: { value: "walnoten" } },
    );
    fireEvent.click(await screen.findByRole("button", { name: /^Walnoten/ }));
    expect(
      (screen.getByRole("button", { name: "Toevoegen" }) as HTMLButtonElement).disabled,
    ).toBe(true);

    wachtenden[0]({ ok: true, json: () => Promise.resolve({}) } as Response);

    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: "Toevoegen" }) as HTMLButtonElement).disabled,
      ).toBe(false);
    });
  });
});

describe("DagboekScherm — tabbladen (Laag B)", () => {
  it("toont Vandaag als standaardtabblad, met de eetmomenten", () => {
    render(<DagboekScherm />);

    expect(screen.getByRole("tab", { name: "Vandaag", selected: true })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    ).toBeTruthy();
  });

  it("heeft geen los Calorieën-tabblad — de ring staat op Macro's", () => {
    render(<DagboekScherm />);

    expect(screen.queryByRole("tab", { name: "Calorieën" })).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Macro's" }));

    // Zonder registratie vraagt de ring wat je at; de drie macro's staan in
    // de legenda en de tabel per maaltijd eronder.
    expect(screen.getByRole("region", { name: "Calorieën en macro's vandaag" })).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getAllByText(/Koolhydraten/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Vet/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Eiwit/).length).toBeGreaterThan(0);
  });

  it("toont op Macro's het weekoverzicht met het ingestelde doel", async () => {
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
            calorieenKcal: 2200,
            koolhydratenPct: null,
            vetPct: null,
            eiwitPct: null,
          });
        }
        return jsonResponse({});
      }),
    );

    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("tab", { name: "Macro's" }));

    // Het doel komt uit de macro-doelen-fetch, niet uit een berekening.
    expect(await screen.findByText(/2200 kcal/)).toBeTruthy();
  });

  it("toont geen berekend of vooringevuld doel zolang er niets is ingesteld", async () => {
    render(<DagboekScherm />);

    fireEvent.click(screen.getByRole("tab", { name: "Macro's" }));

    // Zonder ingesteld doel geen weektabel vol streepjes en nooit een
    // berekend getal (geen NaN, geen vuistregel als 50/30/20), wel de weg
    // naar Je doelen.
    expect(await screen.findByText(/verschijnt zodra je zelf een doel instelt/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Stel een doel in/ })).toBeTruthy();
    expect(screen.queryByText(/NaN/)).toBeNull();
  });
});

describe("DagboekScherm — vergelijken vanuit het zoekscherm", () => {
  it("staat niet meer in de tabrij maar in het zoekscherm, en terug brengt je daar weer", async () => {
    render(<DagboekScherm />);

    expect(screen.queryByRole("button", { name: "Vergelijk producten" })).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Lunch — product toevoegen" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Vergelijk producten" }));
    fireEvent.click(await screen.findByRole("button", { name: "Terug naar zoeken" }));

    expect(
      await screen.findByRole("heading", { name: "Voeg toe aan lunch" }),
    ).toBeTruthy();
  });
});

describe("DagboekScherm — supermarkt-portie (Laag A)", () => {
  it("logt een supermarktproduct los van het tekortsysteem", async () => {
    render(<DagboekScherm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Ontbijt — product toevoegen" }),
    );
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "testproduct" } });
    fireEvent.click(await screen.findByRole("button", { name: /^AH Testproduct/ }));

    // Het supermarkt-portiescherm toont calorieën/macro's, geen NutrientId-rij.
    expect(
      await screen.findByRole("heading", { name: "Voedsel toevoegen" }),
    ).toBeTruthy();

    // Bronvermelding bij de getoonde waarden, met een link naar het product
    // bij de bron en naar de licentietekst (ODbL §4.3).
    expect(
      screen.getByRole("link", { name: "Open Food Facts" }).getAttribute("href"),
    ).toBe("https://nl.openfoodfacts.org/product/8710000000001");
    expect(
      screen.getByRole("link", { name: /Open Database License/ }).getAttribute("href"),
    ).toBe("https://opendatacommons.org/licenses/odbl/1-0/");
    expect(screen.getByText("Calorieën")).toBeTruthy();
    expect(screen.getByText(/250 kcal/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Toevoegen" }));

    await waitFor(() => {
      const posts = vi.mocked(fetch).mock.calls.filter(
        ([input, init]) =>
          String(input).includes("/api/account/supermarkt-portie-logs") &&
          Boolean(
            init &&
              typeof init === "object" &&
              "method" in init &&
              init.method === "POST",
          ),
      );
      expect(posts.length).toBeGreaterThan(0);
      const body = JSON.parse(String((posts[0]![1] as RequestInit).body));
      expect(body.prodId).toBe("off:8710000000001");
      expect(body.moment).toBe("ontbijt");
    });

    // Geen enkele POST naar het tekortsysteem — dit is een parallelle, eigen
    // opslag, geen DagboekItem.
    const daybookPosts = vi.mocked(fetch).mock.calls.filter(
      ([input, init]) =>
        String(input).includes("/api/account/nutrition-daybook") &&
        Boolean(init && typeof init === "object" && "method" in init && init.method === "POST"),
    );
    expect(daybookPosts).toHaveLength(0);
  });
});

describe("DagboekScherm — portiescherm voor voeding", () => {
  /** Opent het portiescherm voor havermout, vanuit een stofdetail. */
  async function openPortiescherm() {
    render(<DagboekScherm />);
    fireEvent.click(screen.getByRole("button", { name: /Alle stoffen/ }));
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    fireEvent.click(screen.getByRole("button", { name: /Logboek van magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });
    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    return screen.findByRole("heading", { name: "Voedsel toevoegen" });
  }

  /** Voeding heeft dezelfde rijen als een NEVO-product, geen laag over de lijst. */
  it("toont de rijen Maaltijd, Aantal porties en Portiegrootte op een eigen scherm", async () => {
    await openPortiescherm();

    expect(screen.getByRole("button", { name: /Maaltijd/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Aantal porties/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Portiegrootte/ })).toBeTruthy();
    expect(screen.queryByLabelText("Zoek een voedingsmiddel of supplement")).toBeNull();
  });

  it("zet de portiegrootte met één tik op een gangbare portie", async () => {
    await openPortiescherm();

    fireEvent.click(screen.getByRole("button", { name: /Portiegrootte/ }));
    const gram = screen.getByRole("spinbutton") as HTMLInputElement;
    const start = gram.value;

    const porties = screen
      .getAllByRole("button")
      .filter((knop) => /gram$/.test(knop.getAttribute("aria-label") ?? ""));
    expect(porties.length).toBeGreaterThan(0);

    const andere = porties.find(
      (knop) => !(knop.getAttribute("aria-label") ?? "").includes(` ${start} gram`),
    );
    if (andere) {
      fireEvent.click(andere);
      expect(gram.value).not.toBe(start);
    }
  });

  it("gaat terug naar de zoeklijst zonder iets op te slaan", async () => {
    await openPortiescherm();

    fireEvent.click(screen.getByRole("button", { name: "Terug" }));

    await screen.findByLabelText("Zoek een voedingsmiddel of supplement");
    const posts = vi.mocked(fetch).mock.calls.filter(
      ([input, init]) =>
        String(input).includes("/api/account/nutrition-daybook") &&
        Boolean(init && typeof init === "object" && "method" in init && init.method === "POST"),
    );
    expect(posts).toHaveLength(0);
  });
});

describe("DagboekScherm — dag wisselen", () => {
  it("toont een andere dag zodra je die in de balk aantikt", async () => {
    render(<DagboekScherm />);
    const knoppen = await screen.findAllByRole("button", { name: /^(ma|di|wo|do|vr|za|zo) \d+/ });
    const nietGekozen = knoppen.find((knop) => knop.getAttribute("aria-pressed") === "false")!;
    fireEvent.click(nietGekozen);
    expect(nietGekozen.getAttribute("aria-pressed")).toBe("true");
  });
});


describe("DagboekScherm — openen vanuit een ander scherm", () => {
  it("opent het portiescherm van het gevraagde product op de gevraagde maaltijd, en wist de vraag", async () => {
    window.history.replaceState(null, "", "/dashboard?tab=vandaag&voeg=voeding%3Ahavermout&moment=lunch");
    render(<DagboekScherm />);
    expect(await screen.findByRole("button", { name: "Toevoegen" })).toBeTruthy();
    expect(screen.getByText("Havermout")).toBeTruthy();
    expect(screen.getByText("Lunch")).toBeTruthy();
    expect(window.location.search).toBe("?tab=vandaag");
  });

  it("opent het zoekscherm op Mijn supplementen", async () => {
    window.history.replaceState(null, "", "/dashboard?tab=vandaag&favorieten=supplementen");
    render(<DagboekScherm />);
    const tab = await screen.findByRole("tab", { name: "Mijn supplementen" });
    expect(tab.getAttribute("aria-selected")).toBe("true");
    window.history.replaceState(null, "", "/");
  });
});
