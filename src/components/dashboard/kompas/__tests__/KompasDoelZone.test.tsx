// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import KompasDoelEvaluatie from "@/components/dashboard/kompas/KompasDoelEvaluatie";
import KompasDoelRichting from "@/components/dashboard/kompas/KompasDoelRichting";
import KompasWinstKnop from "@/components/dashboard/kompas/KompasWinstKnop";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { verschuifDag } from "@/lib/nutrition-periode";
import { wisDagboekCache } from "@/lib/use-dagboek-dagen";
import { wisDoelEvaluatieCache } from "@/lib/use-doel-evaluatie";

const gaNaarDashboard = vi.hoisted(() => vi.fn());
vi.mock("@/lib/dagboek-deeplink", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dagboek-deeplink")>()),
  gaNaarDashboard,
}));
vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));

function antwoord(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

beforeEach(() => {
  gaNaarDashboard.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KompasWinstKnop", () => {
  const vandaag = todayInAgendaTimezone();

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        String(url).includes("nutrition-daybook")
          ? antwoord({
              days: [
                {
                  date: vandaag,
                  soort: "doordeweeks",
                  porties: {},
                  items: [{ moment: "ontbijt", key: "havermout", grams: 60 }],
                },
              ],
            })
          : new Response("{}", { status: 404 }),
      ),
    );
  });

  it("wijst op een domeinscherm naar het dagboek", () => {
    render(<KompasWinstKnop domainScreenOpen />);
    expect(screen.getByRole("button", { name: /Log je maaltijd van vandaag/ })).toBeTruthy();
  });

  it("stuurt je op het Dagboek zelf niet naar het dagboek, maar naar de volgende open maaltijd", async () => {
    render(<KompasWinstKnop domainScreenOpen={false} />);

    expect(screen.queryByRole("button", { name: /Log je maaltijd van vandaag/ })).toBeNull();
    expect(await screen.findByText(/Vandaag gelogd: ontbijt\. Nog open: lunch en avondeten\./)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Voeg toe bij lunch/ }));
    expect(gaNaarDashboard).toHaveBeenCalledWith("/dashboard?tab=vandaag&zoek=alle&moment=lunch");
  });
});

describe("KompasDoelRichting", () => {
  it("laat je een richting kiezen in de zijbalk en bewaart die met dezelfde opslag als Je doelen", async () => {
    const aanroepen: { url: string; method: string; body: string | null }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        aanroepen.push({ url: String(url), method: init?.method ?? "GET", body: (init?.body as string) ?? null });
        if (init?.method === "POST") return antwoord({ doelen: { voedingsrichting: "energie" } });
        return antwoord({ doelen: { voedingsrichting: null } });
      }),
    );

    function Richting() {
      const [kiezen, setKiezen] = useState(false);
      return <KompasDoelRichting kiezen={kiezen} onKiezenChange={setKiezen} />;
    }
    render(<Richting />);
    expect(screen.getByText("Nog niet gekozen")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Kies" }));
    fireEvent.click(screen.getByRole("button", { name: /Ik zak 's middags in/ }));

    await waitFor(() => expect(screen.getByText(/Ik zak 's middags in, ben vaak moe/)).toBeTruthy());
    const post = aanroepen.find((aanroep) => aanroep.method === "POST");
    expect(post?.url).toBe("/api/account/voedingsdoelen");
    expect(JSON.parse(post?.body ?? "{}")).toEqual({ voedingsrichting: "energie" });
  });
});

describe("KompasDoelEvaluatie", () => {
  const vandaag = todayInAgendaTimezone();
  const dagMs = 24 * 60 * 60 * 1000;
  const geleden = (dagen: number) => new Date(Date.now() - dagen * dagMs).toISOString();

  const volleDagen = Array.from({ length: 5 }, (_, i) => ({
    date: verschuifDag(vandaag, -i),
    soort: "doordeweeks",
    porties: {},
    items: [
      { moment: "ontbijt", key: "havermout", grams: 100 },
      { moment: "lunch", key: "pizza", grams: 100 },
      { moment: "avondeten", key: "pizza", grams: 100 },
    ],
  }));

  beforeEach(() => {
    wisDagboekCache();
    wisDoelEvaluatieCache();
  });

  it("toont de terugblik na 30 dagen en verdwijnt na Houden", async () => {
    const aanroepen: { url: string; method: string; body: string | null }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        aanroepen.push({ url: String(url), method: init?.method ?? "GET", body: (init?.body as string) ?? null });
        if (String(url).includes("nutrition-daybook")) return antwoord({ days: volleDagen });
        if (String(url).includes("doel-evaluatie")) {
          return antwoord({
            gekozenOp: geleden(40),
            startstand: { magnesium: { datum: geleden(20).slice(0, 10), aandeelPct: 20, dagen: 5 } },
            bevestigdOp: init?.method === "POST" ? new Date().toISOString() : null,
          });
        }
        return antwoord({ doelen: { voedingsrichting: "energie" } });
      }),
    );

    render(<KompasDoelEvaluatie ijkpunt={{ toen: 4, nu: 6 }} onVeranderen={() => {}} />);

    expect(await screen.findByText(/Je koos .*Vaak moe.* op /)).toBeTruthy();
    expect(screen.getByText(/Hoe makkelijk gaat het: 4 → 6 van 10\./)).toBeTruthy();
    expect(screen.getByText(/Je magnesium: minstens 20% →/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Houden" }));
    await waitFor(() => expect(screen.queryByTestId("kompas-doel-evaluatie")).toBeNull());
    expect(JSON.parse(aanroepen.find((a) => a.method === "POST")?.body ?? "{}")).toEqual({ actie: "bevestig" });
  });
});
