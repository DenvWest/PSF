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

vi.mock("@/config/org", () => ({
  DEFAULT_ORG_ID: "00000000-0000-0000-0000-000000000001",
}));

vi.mock("@/lib/db/scoped", () => ({
  orgScoped: vi.fn(() => ({ raw: {} })),
}));

vi.mock("@/lib/account-dagboek-favorieten", () => ({
  isDagboekFavorietBron: (value: string) => value === "voeding" || value === "supplement",
  listDagboekFavorieten: (...args: unknown[]) => mockList(...args),
  upsertDagboekFavoriet: (...args: unknown[]) => mockUpsert(...args),
  deleteDagboekFavoriet: (...args: unknown[]) => mockDelete(...args),
}));

describe("/api/account/dagboek-favorieten", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([{ bron: "supplement", key: "magnesiumcitraat-capsule" }]);
    mockUpsert.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
  });

  it("GET geeft de favorieten van het account terug", async () => {
    const response = await GET();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(mockList).toHaveBeenCalledWith({ raw: {} }, "acc-1");
  });

  it("POST slaat een geldige favoriet op", async () => {
    const request = new NextRequest("http://localhost/api/account/dagboek-favorieten", {
      method: "POST",
      body: JSON.stringify({ bron: "voeding", key: "havermout" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      { raw: {} },
      "acc-1",
      { bron: "voeding", key: "havermout" },
    );
  });

  it("POST weigert een onbekende bron", async () => {
    const request = new NextRequest("http://localhost/api/account/dagboek-favorieten", {
      method: "POST",
      body: JSON.stringify({ bron: "activiteit", key: "havermout" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("POST weigert een lege key", async () => {
    const request = new NextRequest("http://localhost/api/account/dagboek-favorieten", {
      method: "POST",
      body: JSON.stringify({ bron: "voeding", key: "" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("DELETE verwijdert een favoriet op bron+key", async () => {
    const request = new NextRequest(
      "http://localhost/api/account/dagboek-favorieten?bron=supplement&key=magnesiumcitraat-capsule",
      { method: "DELETE" },
    );
    const response = await DELETE(request);
    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith(
      { raw: {} },
      "acc-1",
      "supplement",
      "magnesiumcitraat-capsule",
    );
  });

  it("DELETE weigert een ontbrekende key", async () => {
    const request = new NextRequest(
      "http://localhost/api/account/dagboek-favorieten?bron=voeding",
      { method: "DELETE" },
    );
    const response = await DELETE(request);
    expect(response.status).toBe(400);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
