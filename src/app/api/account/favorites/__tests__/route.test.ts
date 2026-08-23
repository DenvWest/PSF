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

  it("POST geeft reminder_start_time en alert_enabled door aan upsert", async () => {
    const request = new NextRequest("http://localhost/api/account/favorites", {
      method: "POST",
      body: JSON.stringify({
        item_id: "card-1",
        title: "Kracht",
        kind: "activiteit",
        reminder_start_time: "09:00",
        alert_enabled: true,
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      {},
      "acc-1",
      expect.objectContaining({ reminderStartTime: "09:00", alertEnabled: true }),
    );
  });

  it("POST neemt eindtijd+interval alleen samen over, na de starttijd", async () => {
    const request = new NextRequest("http://localhost/api/account/favorites", {
      method: "POST",
      body: JSON.stringify({
        item_id: "card-1",
        title: "Kracht",
        kind: "activiteit",
        reminder_start_time: "09:00",
        reminder_end_time: "17:00",
        reminder_interval_minutes: 60,
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      {},
      "acc-1",
      expect.objectContaining({
        reminderStartTime: "09:00",
        reminderEndTime: "17:00",
        reminderIntervalMinutes: 60,
      }),
    );
  });

  it("POST laat een ongeldige reminder_start_time stilzwijgend vallen", async () => {
    const request = new NextRequest("http://localhost/api/account/favorites", {
      method: "POST",
      body: JSON.stringify({
        item_id: "card-1",
        title: "Kracht",
        kind: "activiteit",
        reminder_start_time: "25:99",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const [, , upsertedItem] = mockUpsert.mock.calls[0] as [unknown, unknown, Record<string, unknown>];
    expect(upsertedItem).not.toHaveProperty("reminderStartTime");
  });

  it("POST laat een eindtijd zonder interval weg, starttijd blijft staan", async () => {
    const request = new NextRequest("http://localhost/api/account/favorites", {
      method: "POST",
      body: JSON.stringify({
        item_id: "card-1",
        title: "Kracht",
        kind: "activiteit",
        reminder_start_time: "09:00",
        reminder_end_time: "17:00",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const [, , upsertedItem] = mockUpsert.mock.calls[0] as [unknown, unknown, Record<string, unknown>];
    expect(upsertedItem).toEqual(expect.objectContaining({ reminderStartTime: "09:00" }));
    expect(upsertedItem).not.toHaveProperty("reminderEndTime");
    expect(upsertedItem).not.toHaveProperty("reminderIntervalMinutes");
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
