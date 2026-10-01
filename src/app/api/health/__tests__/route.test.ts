import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockUnscoped, mockLimit } = vi.hoisted(() => ({
  mockUnscoped: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@/lib/db/scoped", () => ({ unscoped: mockUnscoped }));

describe("GET /api/health", () => {
  beforeEach(() => {
    mockLimit.mockReset();
    mockUnscoped.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("geeft 200 + status ok bij een geslaagde DB-ping", async () => {
    mockLimit.mockResolvedValue({ error: null });
    mockUnscoped.mockReturnValue({
      from: () => ({ select: () => ({ limit: mockLimit }) }),
    });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "ok" });
  });

  it("geeft 503 als de database niet geconfigureerd is", async () => {
    mockUnscoped.mockReturnValue(null);

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.database).toBe("not_configured");
  });

  it("geeft 503 als de DB-query een error teruggeeft", async () => {
    mockLimit.mockResolvedValue({ error: { message: "connection refused" } });
    mockUnscoped.mockReturnValue({
      from: () => ({ select: () => ({ limit: mockLimit }) }),
    });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.database).toBe("unreachable");
  });

  it("lekt geen interne foutdetails in de response", async () => {
    mockLimit.mockResolvedValue({
      error: { message: "relation public.organizations does not exist" },
    });
    mockUnscoped.mockReturnValue({
      from: () => ({ select: () => ({ limit: mockLimit }) }),
    });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = (await response.json()) as Record<string, unknown>;

    expect(JSON.stringify(body)).not.toContain("relation");
    expect(JSON.stringify(body)).not.toContain("organizations");
  });
});
