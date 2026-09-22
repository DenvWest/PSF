import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * De opslagweg van het dagboek, op routeniveau.
 *
 * De kern van deze suite is de merge-regressie: de dagboek-UI stuurt alleen
 * `{ date, items }`, en die POST mocht het water en de eetmomenten van die dag
 * niet meer wissen. Dat gedrag hangt aan twee lagen tegelijk — de route moet
 * een ontbrekend veld als `undefined` doorgeven, en `upsertDaybookDay` moet
 * `undefined` als "laat staan" lezen. Een test op alleen de lib zou de eerste
 * helft missen.
 */

const { mockUpsert, mockMaybeSingle, mockGetAccount } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockGetAccount: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi
    .fn()
    .mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: () => ({}) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/account-server", () => ({ getAccountFromCookie: mockGetAccount }));
vi.mock("@/lib/agenda-week-preview", () => ({
  todayInAgendaTimezone: () => "2026-09-10",
}));
vi.mock("@/lib/db/scoped", () => ({
  orgScoped: () => ({
    raw: {},
    from: () => ({
      upsert: mockUpsert,
      select: () => ({
        eq: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
      }),
    }),
  }),
}));

import { POST } from "@/app/api/account/nutrition-daybook/route";

function post(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/account/nutrition-daybook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** De rij zoals hij uiteindelijk naar de database gaat. */
function geschrevenRij(): Record<string, unknown> {
  return mockUpsert.mock.calls[0][0] as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAccount.mockResolvedValue({ id: "acc-1" });
  mockUpsert.mockResolvedValue({ error: null });
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
});

describe("POST /api/account/nutrition-daybook", () => {
  it("wist het water niet bij een POST die alleen items noemt", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        portions: { zuivel: 1 },
        meals: { ontbijt: { zuivel: 1 } },
        water_ml: 1500,
        items: [],
      },
      error: null,
    });

    const response = await POST(
      post({
        date: "2026-09-01",
        items: [{ moment: "lunch", bron: "voeding", key: "havermout", grams: 60 }],
      }),
    );

    expect(response.status).toBe(200);
    expect(geschrevenRij().water_ml).toBe(1500);
    expect(geschrevenRij().meals).toEqual({ ontbijt: { zuivel: 1 } });
  });

  /**
   * Je laatste product van de dag verwijderen stuurt `items: []`. Dat als
   * "lege registratie" weigeren gaf een 400 op een handeling die de gebruiker
   * bewust deed — en de regel kwam bij een herlaadslag gewoon terug.
   */
  it("accepteert een expliciet lege itemlijst als wisopdracht", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        portions: { granen: 1 },
        meals: {},
        water_ml: null,
        items: [{ moment: "ontbijt", bron: "voeding", key: "havermout", grams: 60 }],
      },
      error: null,
    });

    const response = await POST(post({ date: "2026-09-01", items: [] }));

    expect(response.status).toBe(200);
    expect(geschrevenRij().items).toEqual([]);
  });

  it("weigert een verzoek dat geen enkele invoervorm noemt", async () => {
    const response = await POST(post({ date: "2026-09-01" }));

    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("weigert een dag in de toekomst", async () => {
    const response = await POST(post({ date: "2027-01-01", items: [] }));

    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("weigert zonder account", async () => {
    mockGetAccount.mockResolvedValue(null);

    const response = await POST(post({ date: "2026-09-01", items: [] }));

    expect(response.status).toBe(401);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("meldt een mislukte schrijving als 500", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "nee" } });

    const response = await POST(
      post({
        date: "2026-09-01",
        items: [{ moment: "lunch", bron: "voeding", key: "havermout", grams: 60 }],
      }),
    );

    expect(response.status).toBe(500);
  });
});
