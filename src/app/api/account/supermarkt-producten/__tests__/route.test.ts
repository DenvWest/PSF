import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

const mockZoek = vi.fn();
const mockAllowed = vi.fn();
const mockAccount = vi.fn();

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: () => mockAccount(),
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: (...args: unknown[]) => mockAllowed(...args),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: vi.fn(() => ({})) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/db/scoped", () => ({ unscoped: vi.fn(() => ({ eenAdminClient: true })) }));
vi.mock("@/lib/supermarkt-products", () => ({
  zoekSupermarktProducten: (...args: unknown[]) => mockZoek(...args),
}));

function verzoek(q: string) {
  return new NextRequest(`http://localhost/api/account/supermarkt-producten?q=${encodeURIComponent(q)}`);
}

describe("GET /api/account/supermarkt-producten", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllowed.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mockAccount.mockResolvedValue({ id: "acc-1" });
    mockZoek.mockResolvedValue([{ prodId: "off:1", naam: "Havermelk" }]);
  });

  it("geeft de gevonden producten terug", async () => {
    const response = await GET(verzoek("haver"));
    expect(response.status).toBe(200);
    expect((await response.json()).producten).toHaveLength(1);
    expect(mockZoek).toHaveBeenCalledWith({ eenAdminClient: true }, "haver");
  });

  it("vereist een ingelogd account", async () => {
    mockAccount.mockResolvedValue(null);
    expect((await GET(verzoek("haver"))).status).toBe(401);
    expect(mockZoek).not.toHaveBeenCalled();
  });

  it("weigert een te lange zoekopdracht", async () => {
    expect((await GET(verzoek("x".repeat(101)))).status).toBe(400);
    expect(mockZoek).not.toHaveBeenCalled();
  });

  it("geeft 429 met Retry-After als het budget op is", async () => {
    mockAllowed.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });
    const response = await GET(verzoek("haver"));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
  });

  it("geeft 500 zonder interne details bij een databasefout", async () => {
    mockZoek.mockRejectedValue(new Error('relation "sm_products" does not exist'));
    const response = await GET(verzoek("haver"));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("sm_products");
  });
});
