import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  mockGetAccountFromCookie,
  mockGetVoedingsdoelen,
  mockSetVoedingsdoelen,
  mockLaadWeergave,
} = vi.hoisted(() => ({
  mockGetAccountFromCookie: vi.fn(),
  mockGetVoedingsdoelen: vi.fn(),
  mockSetVoedingsdoelen: vi.fn(),
  mockLaadWeergave: vi.fn(),
}));

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: mockGetAccountFromCookie,
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi
    .fn()
    .mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: () => ({}) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/db/scoped", () => ({ orgScoped: () => ({ raw: {} }) }));
vi.mock("@/lib/account-voedingsdoelen-server", () => ({
  laadVoedingsdoelenWeergave: mockLaadWeergave,
}));
vi.mock("@/lib/account-voedingsdoelen", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/account-voedingsdoelen")>()),
  getVoedingsdoelen: mockGetVoedingsdoelen,
  setVoedingsdoelen: mockSetVoedingsdoelen,
}));

import { GET, POST } from "@/app/api/account/voedingsdoelen/route";

const ACCOUNT = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "dennis@example.com",
  status: "active",
  organization_id: "00000000-0000-0000-0000-000000000001",
};

const BESTAAND = { gewichtKg: 82, trainingsbelasting: 3, eiwitDoelG: 140 };

const WEERGAVE = {
  doelen: BESTAAND,
  richtlijn: { gramsLow: 115, gramsHigh: 130 },
  gewichtBron: "eigen" as const,
  checkHeeftGewicht: true,
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/account/voedingsdoelen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAccountFromCookie.mockResolvedValue(ACCOUNT);
  mockGetVoedingsdoelen.mockResolvedValue(BESTAAND);
  mockSetVoedingsdoelen.mockResolvedValue(undefined);
  mockLaadWeergave.mockResolvedValue(WEERGAVE);
});

describe("GET", () => {
  it("weigert wie niet is ingelogd", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("geeft de weergave terug, niet de ruwe rij", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(WEERGAVE);
    // Het gewicht uit de check hoort nooit in de payload te staan — alleen
    // de afgeleide richtlijn. Zie de moduledoc van account-voedingsdoelen-server.
    expect(payload).not.toHaveProperty("checkGewichtKg");
  });
});

describe("POST", () => {
  it("weigert wie niet is ingelogd", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);
    expect((await POST(makeRequest({ gewichtKg: 80 }))).status).toBe(401);
  });

  it("laat weggelaten velden staan", async () => {
    // Een scherm dat alleen het gewicht opslaat, mag het eiwitdoel niet
    // stilletjes wissen — dat is het verschil tussen "niet meegestuurd" en
    // "expliciet null".
    await POST(makeRequest({ gewichtKg: 90 }));

    expect(mockSetVoedingsdoelen).toHaveBeenCalledWith(expect.anything(), ACCOUNT.id, {
      gewichtKg: 90,
      trainingsbelasting: 3,
      eiwitDoelG: 140,
    });
  });

  it("wist een veld op een expliciete null", async () => {
    await POST(makeRequest({ eiwitDoelG: null }));

    expect(mockSetVoedingsdoelen).toHaveBeenCalledWith(expect.anything(), ACCOUNT.id, {
      gewichtKg: 82,
      trainingsbelasting: 3,
      eiwitDoelG: null,
    });
  });

  it("weigert een gewicht buiten de grenzen van de formule", async () => {
    const response = await POST(makeRequest({ gewichtKg: 12 }));

    expect(response.status).toBe(400);
    expect(mockSetVoedingsdoelen).not.toHaveBeenCalled();
  });

  it("weigert een eiwitdoel buiten de grenzen", async () => {
    expect((await POST(makeRequest({ eiwitDoelG: 900 }))).status).toBe(400);
    expect(mockSetVoedingsdoelen).not.toHaveBeenCalled();
  });

  it("weigert een ongeldige trainingsbelasting", async () => {
    expect((await POST(makeRequest({ trainingsbelasting: 9 }))).status).toBe(400);
    expect(mockSetVoedingsdoelen).not.toHaveBeenCalled();
  });

  it("geeft na opslaan de herberekende weergave terug", async () => {
    // Niet het opgestuurde object: de richtlijn hangt ook van de check af,
    // dus alleen de server weet wat er daarna geldt.
    const response = await POST(makeRequest({ gewichtKg: 90 }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(WEERGAVE);
    expect(mockLaadWeergave).toHaveBeenCalledWith(ACCOUNT.id);
  });
});
