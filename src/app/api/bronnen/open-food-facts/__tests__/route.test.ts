import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

const mockZip = vi.fn();
const mockAllowed = vi.fn();
const mockAdmin = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: (...args: unknown[]) => mockAllowed(...args),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: vi.fn(() => ({})) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/db/scoped", () => ({ unscoped: () => mockAdmin() }));
vi.mock("@/lib/sm-products-dump", () => ({ maakDumpZipBron: () => () => mockZip() }));

function verzoek() {
  return new NextRequest("http://localhost/api/bronnen/open-food-facts");
}

describe("GET /api/bronnen/open-food-facts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockAllowed.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mockAdmin.mockReturnValue({ eenAdminClient: true });
    mockZip.mockResolvedValue(Buffer.from("PK-inhoud"));
  });

  it("geeft de zip als download met licentie-header", async () => {
    const response = await GET(verzoek());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toContain("perfectsupplement-open-food-facts.zip");
    expect(response.headers.get("Content-Length")).toBe(String(Buffer.byteLength("PK-inhoud")));
    expect(response.headers.get("Link")).toContain('rel="license"');
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe("PK-inhoud");
  });

  it("geeft 429 met Retry-After als het budget op is, zonder de zip te bouwen", async () => {
    mockAllowed.mockResolvedValue({ allowed: false, retryAfterSeconds: 120 });
    const response = await GET(verzoek());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    expect(mockZip).not.toHaveBeenCalled();
  });

  it("geeft 503 als de database niet is geconfigureerd", async () => {
    mockAdmin.mockReturnValue(null);
    expect((await GET(verzoek())).status).toBe(503);
    expect(mockZip).not.toHaveBeenCalled();
  });

  it("geeft 503 met Retry-After en logt als het bouwen mislukt", async () => {
    mockZip.mockRejectedValue(new Error("db weg"));
    const response = await GET(verzoek());
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("300");
    expect(console.error).toHaveBeenCalled();
  });
});
