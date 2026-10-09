// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import KompasDoelRichting from "@/components/dashboard/kompas/KompasDoelRichting";
import KompasWinstKnop from "@/components/dashboard/kompas/KompasWinstKnop";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";

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

    render(<KompasDoelRichting />);
    expect(screen.getByText("Nog niet gekozen")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Kies" }));
    fireEvent.click(screen.getByRole("button", { name: /Ik zak 's middags in/ }));

    await waitFor(() => expect(screen.getByText(/Ik zak 's middags in, ben vaak moe/)).toBeTruthy());
    const post = aanroepen.find((aanroep) => aanroep.method === "POST");
    expect(post?.url).toBe("/api/account/voedingsdoelen");
    expect(JSON.parse(post?.body ?? "{}")).toEqual({ voedingsrichting: "energie" });
  });
});
