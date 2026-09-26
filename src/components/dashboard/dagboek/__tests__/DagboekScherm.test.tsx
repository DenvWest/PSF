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

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));

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

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
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

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
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

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
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

    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
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
    fireEvent.change(zoekveld, { target: { value: "walnoten" } });
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

describe("DagboekScherm — portielaag over de zoeklijst", () => {
  /** Opent de portielaag voor het eerste "eerder gebruikt"-product. */
  async function openPortielaag() {
    render(<DagboekScherm />);
    fireEvent.click(screen.getByRole("button", { name: /Magnesium/ }));
    await screen.findByRole("heading", { name: "Magnesium" });
    fireEvent.click(screen.getByRole("button", { name: "+ Voeg toe" }));
    const zoekveld = await screen.findByLabelText(
      "Zoek een voedingsmiddel of supplement",
    );
    fireEvent.change(zoekveld, { target: { value: "havermout" } });
    fireEvent.click(await screen.findByRole("button", { name: /^Havermout/ }));
    return screen.findByRole("dialog");
  }

  /**
   * De winst van de laag: de lijst blijft eronder staan, dus het volgende
   * product is één tik verder in plaats van de hele route terug.
   */
  it("laat de zoeklijst staan terwijl de laag open is", async () => {
    await openPortielaag();

    expect(
      screen.getByLabelText("Zoek een voedingsmiddel of supplement"),
    ).toBeTruthy();
  });

  it("zet de hoeveelheid met één tik op een gangbare portie", async () => {
    const laag = await openPortielaag();

    const gram = within(laag).getByLabelText("Gram") as HTMLInputElement;
    const start = gram.value;

    // Elke portie uit de catalogus is een knop; de tweede wijkt af van de eerste.
    const porties = within(laag)
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

  it("sluit de laag met Escape zonder iets op te slaan", async () => {
    await openPortielaag();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    const posts = vi.mocked(fetch).mock.calls.filter(
      ([input, init]) =>
        String(input).includes("/api/account/nutrition-daybook") &&
        Boolean(init && typeof init === "object" && "method" in init && init.method === "POST"),
    );
    expect(posts).toHaveLength(0);
  });
});
