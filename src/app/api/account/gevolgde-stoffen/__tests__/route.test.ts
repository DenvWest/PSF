import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockGetAccountFromCookie, mockGet, mockSet } = vi.hoisted(() => ({
  mockGetAccountFromCookie: vi.fn(),
  mockGet: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("@/lib/account-server", () => ({ getAccountFromCookie: mockGetAccountFromCookie }));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: () => ({}) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/db/scoped", () => ({ orgScoped: () => ({ raw: {} }) }));
vi.mock("@/lib/account-gevolgde-stoffen", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/account-gevolgde-stoffen")>()),
  getGevolgdeStoffen: mockGet,
  setGevolgdeStoffen: mockSet,
}));

import { GET, POST } from "@/app/api/account/gevolgde-stoffen/route";
import { GevolgdeStoffenNietBeschikbaar } from "@/lib/account-gevolgde-stoffen";

const ACCOUNT = { id: "11111111-1111-4111-8111-111111111111" };

function post(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/account/gevolgde-stoffen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAccountFromCookie.mockResolvedValue(ACCOUNT);
  mockSet.mockResolvedValue(undefined);
});

describe("GET /api/account/gevolgde-stoffen", () => {
  it("weigert zonder login", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("geeft de gevolgde stoffen terug", async () => {
    mockGet.mockResolvedValue(["fiberG", "calciumMg"]);
    const response = await GET();
    expect(await response.json()).toEqual({ stoffen: ["fiberG", "calciumMg"] });
  });
});

describe("POST /api/account/gevolgde-stoffen", () => {
  it("bewaart de lijst zonder dubbelen", async () => {
    const response = await POST(post({ stoffen: ["fiberG", "calciumMg", "fiberG"] }));
    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith(expect.anything(), ACCOUNT.id, ["fiberG", "calciumMg"]);
  });

  it("weigert een kernstof of een onbekend veld", async () => {
    expect((await POST(post({ stoffen: ["magnesiumMg"] }))).status).toBe(400);
    expect((await POST(post({ stoffen: ["bestaatNiet"] }))).status).toBe(400);
    expect((await POST(post({ stoffen: "fiberG" }))).status).toBe(400);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("meldt 503 zolang de tabel nog niet bestaat", async () => {
    mockSet.mockRejectedValue(new GevolgdeStoffenNietBeschikbaar());
    expect((await POST(post({ stoffen: ["fiberG"] }))).status).toBe(503);
  });
});
