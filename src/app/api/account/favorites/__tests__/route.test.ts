import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET, POST } from "../route";

const mockAccount = {
  id: "acc-1",
  email: "test@example.com",
  organization_id: "org-1",
};

const mockList = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: vi.fn(async () => mockAccount),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
}));

vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: vi.fn(() => ({})),
}));

vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: vi.fn(() => ({})),
}));

vi.mock("@/lib/account-favorites", () => ({
  isAccountFavoriteKind: (value: string) =>
    value === "activiteit" || value === "supplement" || value === "dienst",
  isAccountFavoriteSource: (value: string) => value === "aanbevolen" || value === "mijn_keuze",
  isAccountFavoriteDomain: (value: string) => value === "beweging",
  listAccountFavorites: (...args: unknown[]) => mockList(...args),
  upsertAccountFavorite: (...args: unknown[]) => mockUpsert(...args),
  deleteAccountFavorite: (...args: unknown[]) => mockDelete(...args),
}));

describe("/api/account/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([
      { id: "card-1", title: "Kracht", kind: "activiteit", domain: "beweging" },
    ]);
    mockUpsert.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
  });

  it("GET returns favorites for logged-in account", async () => {
    const response = await GET();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(mockList).toHaveBeenCalledWith({}, "acc-1");
  });

  it("POST upserts a favorite", async () => {
    const request = new NextRequest("http://localhost/api/account/favorites", {
      method: "POST",
      body: JSON.stringify({
        item_id: "card-1",
        title: "Kracht",
        kind: "activiteit",
        domain: "beweging",
        source: "mijn_keuze",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("DELETE removes a favorite by item_id", async () => {
    const request = new NextRequest(
      "http://localhost/api/account/favorites?item_id=card-1",
      { method: "DELETE" },
    );
    const response = await DELETE(request);
    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({}, "acc-1", "card-1");
  });
});
