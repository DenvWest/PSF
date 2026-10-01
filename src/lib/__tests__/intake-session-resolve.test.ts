import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAccount = vi.fn();
const mockAdmin = vi.fn();

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: () => mockGetAccount(),
}));

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => mockAdmin(),
}));

import { resolveActiveIntakeSessionId, resolveCheckSubject } from "@/lib/intake-session-resolve";

describe("resolveActiveIntakeSessionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cookie session when no account is logged in", async () => {
    mockGetAccount.mockResolvedValue(null);
    await expect(resolveActiveIntakeSessionId("cookie-session")).resolves.toBe("cookie-session");
  });

  it("prefers latest account session over cookie when logged in", async () => {
    const mockIn = vi.fn();
    mockGetAccount.mockResolvedValue({ id: "account-1" });
    mockAdmin.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            in: (column: string, values: string[]) => {
              mockIn(column, values);
              return {
                order: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({ data: { id: "account-session-latest" } }),
                  }),
                }),
              };
            },
          }),
        }),
      }),
    });

    await expect(resolveActiveIntakeSessionId("stale-cookie-session")).resolves.toBe(
      "account-session-latest",
    );
    expect(mockIn).toHaveBeenCalledWith("session_kind", ["initial", "remeasure"]);
  });
});

describe("resolveCheckSubject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("valt terug op de cookie-sessie zonder ingelogd account", async () => {
    mockGetAccount.mockResolvedValue(null);
    await expect(resolveCheckSubject("cookie-session")).resolves.toEqual({
      accountId: null,
      sessionIds: ["cookie-session"],
    });
  });

  it("geeft een lege lijst zonder account en zonder cookie", async () => {
    mockGetAccount.mockResolvedValue(null);
    await expect(resolveCheckSubject(null)).resolves.toEqual({
      accountId: null,
      sessionIds: [],
    });
  });

  it("geeft alle sessies van het account, ongeacht session_kind, bij een ingelogde gebruiker", async () => {
    mockGetAccount.mockResolvedValue({ id: "account-1" });
    mockAdmin.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({
              data: [{ id: "session-nutrition" }, { id: "session-initial" }],
            }),
          }),
        }),
      }),
    });

    await expect(resolveCheckSubject("stale-cookie-session")).resolves.toEqual({
      accountId: "account-1",
      sessionIds: ["session-nutrition", "session-initial"],
    });
  });

  it("valt terug op de cookie als het account geen eigen sessies heeft", async () => {
    mockGetAccount.mockResolvedValue({ id: "account-1" });
    mockAdmin.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [] }),
          }),
        }),
      }),
    });

    await expect(resolveCheckSubject("cookie-session")).resolves.toEqual({
      accountId: "account-1",
      sessionIds: ["cookie-session"],
    });
  });
});
