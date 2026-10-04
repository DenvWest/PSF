import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

const mockOphalen = vi.fn();
const mockAllowed = vi.fn();
const mockAccount = vi.fn();

vi.mock("@/lib/account-server", () => ({ getAccountFromCookie: () => mockAccount() }));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: (...args: unknown[]) => mockAllowed(...args),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: vi.fn(() => ({})) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/db/scoped", () => ({ unscoped: vi.fn(() => ({ eenAdminClient: true })) }));
vi.mock("@/lib/nevo-foods", () => ({
  nevoProdId: (code: string) => `nevo:${code}`,
  haalNevoFoodsOp: (...args: unknown[]) => mockOphalen(...args),
  nevoFoodNaarSupermarktProduct: (food: { prodId: string }) => ({ prodId: food.prodId, bron: "nevo" }),
}));

function verzoek(code: string) {
  return new NextRequest(`http://localhost/api/account/nevo-voedingsmiddel?code=${encodeURIComponent(code)}`);
}

describe("GET /api/account/nevo-voedingsmiddel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllowed.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mockAccount.mockResolvedValue({ id: "acc-1" });
    mockOphalen.mockResolvedValue(new Map([["nevo:2297", { prodId: "nevo:2297" }]]));
  });

  it("geeft het product terug", async () => {
    const response = await GET(verzoek("2297"));
    expect(response.status).toBe(200);
    expect((await response.json()).product.prodId).toBe("nevo:2297");
  });

  it("vereist een ingelogd account", async () => {
    mockAccount.mockResolvedValue(null);
    expect((await GET(verzoek("2297"))).status).toBe(401);
    expect(mockOphalen).not.toHaveBeenCalled();
  });

  it("weigert een code die geen getal is", async () => {
    expect((await GET(verzoek("1 or 1=1"))).status).toBe(400);
    expect(mockOphalen).not.toHaveBeenCalled();
  });

  it("geeft 404 voor een onbekende code", async () => {
    mockOphalen.mockResolvedValue(new Map());
    expect((await GET(verzoek("99999"))).status).toBe(404);
  });

  it("geeft 429 met Retry-After als het budget op is", async () => {
    mockAllowed.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });
    const response = await GET(verzoek("2297"));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
  });

  it("geeft 500 zonder interne details bij een databasefout", async () => {
    mockOphalen.mockRejectedValue(new Error('relation "nevo_foods" does not exist'));
    const response = await GET(verzoek("2297"));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("nevo_foods");
  });
});
