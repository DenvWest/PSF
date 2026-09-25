import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAccount = vi.fn();
const mockAdmin = vi.fn();

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: () => mockGetAccount(),
}));

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => mockAdmin(),
}));

import { resolveActiveIntakeSessionId } from "@/lib/intake-session-resolve";

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
