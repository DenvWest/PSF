/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DoelenLijst from "@/components/dashboard/doelen/DoelenLijst";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

const VOEDING = {
  doelen: { gewichtKg: 84, trainingsbelasting: 2, eiwitDoelG: null },
  richtlijn: { gramsLow: 100, gramsHigh: 120 },
  gewichtBron: "eigen",
  checkHeeftGewicht: true,
  kernstofNormen: {},
};

const MACRO_LEEG = { calorieenKcal: null, koolhydratenPct: null, vetPct: null, eiwitPct: null };

function antwoord(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/account/voedingsdoelen")) {
        if (init?.method === "POST") {
          const patch = JSON.parse(String(init.body)) as Record<string, unknown>;
          return antwoord({ ...VOEDING, doelen: { ...VOEDING.doelen, ...patch } });
        }
        return antwoord(VOEDING);
      }
      if (url.includes("/api/account/macro-doelen")) return antwoord(MACRO_LEEG);
      return antwoord({ stoffen: [] });
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/**
 * Je doelen als lijst (5 okt 2026): waarde rechts, tikken opent één veld.
 * De regels van de oude formulieren blijven: de eiwitrichtlijn staat naast
 * het eigen doel, en macro's zijn nooit vooringevuld.
 */
describe("DoelenLijst", () => {
  it("toont elke waarde rechts naast zijn label", async () => {
    render(<DoelenLijst />);

    expect(await screen.findByRole("button", { name: /Gewicht\s*84 kg/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Hoe zwaar je traint\s*Licht/ })).toBeTruthy();
    expect(screen.getByText("100–120 g")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Eigen eiwitdoel\s*Volgt de richtlijn/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Calorieën\s*Niet ingesteld/ })).toBeTruthy();
  });

  it("bewaart een eigen eiwitdoel via het paneel, met alleen dat veld", async () => {
    render(<DoelenLijst />);

    fireEvent.click(await screen.findByRole("button", { name: /Eigen eiwitdoel/ }));
    // − en + beginnen bij de onderkant van de richtlijn.
    fireEvent.click(screen.getByRole("button", { name: "5 g meer" }));
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("105");
    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Eigen eiwitdoel\s*105 g/ })).toBeTruthy(),
    );
    const post = vi
      .mocked(fetch)
      .mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === "POST");
    expect(JSON.parse(String((post![1] as RequestInit).body))).toEqual({ eiwitDoelG: 105 });
  });

  it("vult een macro nooit voor: − en + werken pas als je zelf iets typt", async () => {
    render(<DoelenLijst />);

    fireEvent.click(await screen.findByRole("button", { name: /Koolhydraten\s*Niet ingesteld/ }));

    expect((screen.getByRole("button", { name: "5 % meer" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Opslaan" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("weigert een gewicht buiten de grenzen van de formule", async () => {
    render(<DoelenLijst />);

    fireEvent.click(await screen.findByRole("button", { name: /Gewicht/ }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "300" } });

    expect(screen.getByText("Vul een gewicht tussen 40 en 250 kg in.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Opslaan" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("zet de training terug naar je check via de keuzelijst", async () => {
    render(<DoelenLijst />);

    fireEvent.click(await screen.findByRole("button", { name: /Hoe zwaar je traint/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Uit je check/ }));
    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Hoe zwaar je traint\s*Uit je check/ })).toBeTruthy(),
    );
  });
});
