/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DoelenLijst from "@/components/dashboard/doelen/DoelenLijst";
import { gevolgdeNormenVoor, voedingsnormenVoor } from "@/data/nutrition/voedingsnormen";
import { LEEG_KERNSTOF_PROFIEL } from "@/lib/account-kernstof-profiel";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

const VOEDING = {
  doelen: { gewichtKg: 84, trainingsbelasting: 2, eiwitDoelG: null },
  richtlijn: { gramsLow: 100, gramsHigh: 120 },
  gewichtBron: "eigen",
  checkHeeftGewicht: true,
  checkLeeftijdsband: "45–49",
  kernstofNormen: voedingsnormenVoor(null),
  gevolgdeNormen: gevolgdeNormenVoor({ gender: null }),
  vraagtMenstruatie: false,
  kernstofProfiel: LEEG_KERNSTOF_PROFIEL,
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
      if (url.includes("/api/account/kernstof-profiel")) {
        const patch = JSON.parse(String(init?.body)) as {
          zeventigPlus?: boolean;
          leeftijd?: number | null;
          menstruatie?: "ja" | "onregelmatig" | "nee" | null;
          streefwaarden?: Record<string, number>;
        };
        return antwoord({
          ...VOEDING,
          kernstofNormen: voedingsnormenVoor(null, { zeventigPlus: patch.zeventigPlus === true, leeftijd: patch.leeftijd ?? null }),
          vraagtMenstruatie: true,
          kernstofProfiel: {
            ...LEEG_KERNSTOF_PROFIEL,
            zeventigPlus: patch.zeventigPlus === true,
            leeftijd: patch.leeftijd ?? null,
            menstruatie: patch.menstruatie ?? null,
            streefwaarden: patch.streefwaarden ?? {},
          },
        });
      }
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

  it("toont per kernstof de norm met de onderzochte zone, en leeftijd 72 verhoogt de vitamine D-norm", async () => {
    render(<DoelenLijst />);

    expect(await screen.findByRole("button", { name: /Vitamine D.*norm 15 µg/ })).toBeTruthy();
    expect(screen.getByText(/onderzocht 500–1\.500 mg · max 5\.000 mg uit supplementen/)).toBeTruthy();
    expect(screen.getByText(/^max 25 mg$/)).toBeTruthy();
    expect(screen.queryByText(/geen onderzochte zone/)).toBeNull();
    expect(screen.getByRole("button", { name: /Norm voor\s*Uit je check/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Leeftijd/ }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "72" } });
    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));

    await waitFor(() => expect(screen.getByRole("button", { name: /Vitamine D.*norm 20 µg/ })).toBeTruthy());
    const post = vi
      .mocked(fetch)
      .mock.calls.find(([url]) => String(url).includes("/api/account/kernstof-profiel"));
    expect(JSON.parse(String((post![1] as RequestInit).body))).toEqual({ leeftijd: 72 });
  });

  it("weigert een zink-streefwaarde boven de EFSA-bovengrens", async () => {
    render(<DoelenLijst />);

    fireEvent.click(await screen.findByRole("button", { name: /^Zink/ }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "40" } });

    expect(screen.getByText(/veilige bovengrens op 25 mg/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Opslaan" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("vraagt alleen naar menstruatie als de server dat aangeeft (vrouw of anders)", async () => {
    render(<DoelenLijst />);
    await screen.findByRole("button", { name: /Vitamine D/ });
    expect(screen.queryByRole("button", { name: /Menstruatie/ })).toBeNull();
  });

  it("bewaart de menstruatiekeuze bij vrouw of anders", async () => {
    vi.mocked(fetch).mockImplementationOnce(() => antwoord({ ...VOEDING, vraagtMenstruatie: true }));
    render(<DoelenLijst />);

    fireEvent.click(await screen.findByRole("button", { name: /Menstruatie\s*Niet ingevuld/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Nee, niet meer/ }));
    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));

    await waitFor(() => expect(screen.getByRole("button", { name: /Menstruatie\s*Nee/ })).toBeTruthy());
    const post = vi
      .mocked(fetch)
      .mock.calls.find(([url]) => String(url).includes("/api/account/kernstof-profiel"));
    expect(JSON.parse(String((post![1] as RequestInit).body))).toEqual({ menstruatie: "nee" });
  });
});
