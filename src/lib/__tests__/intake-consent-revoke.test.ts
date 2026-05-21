import { describe, it, expect, vi } from "vitest";
import {
  deleteIntakeSessionForSession,
  isAnonymizedProfileLabel,
  isMissingRelationError,
  isMissingRpcError,
  revokeIntakeConsentForSession,
} from "@/lib/intake-consent-revoke";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { intakeSessionRowToPayload } from "@/lib/intake-session-payload";

describe("isAnonymizedProfileLabel", () => {
  it("returns true for em dash label", () => {
    expect(isAnonymizedProfileLabel(ANON_PROFILE_LABEL)).toBe(true);
    expect(isAnonymizedProfileLabel(` ${ANON_PROFILE_LABEL} `)).toBe(true);
  });

  it("returns false for active profiles", () => {
    expect(isAnonymizedProfileLabel("Stressdrager")).toBe(false);
    expect(isAnonymizedProfileLabel(null)).toBe(false);
  });
});

describe("isMissingRelationError", () => {
  it("detects missing table errors", () => {
    expect(
      isMissingRelationError({
        code: "PGRST205",
        message: "Could not find the table 'public.recovery_tokens'",
      }),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isMissingRelationError({ code: "23505" })).toBe(false);
  });
});

describe("isMissingRpcError", () => {
  it("detects missing RPC function errors", () => {
    expect(
      isMissingRpcError({
        code: "PGRST202",
        message: "Could not find the function public.revoke_intake_session_consent",
      }),
    ).toBe(true);
  });
});

describe("intakeSessionRowToPayload", () => {
  it("returns null for anonymized sessions", () => {
    const payload = intakeSessionRowToPayload({
      id: "00000000-0000-4000-8000-000000000001",
      symptom_profile: [],
      answers: {},
      domain_scores: {
        sleep_score: 0,
        energy_score: 0,
        stress_score: 0,
        nutrition_score: 0,
        movement_score: 0,
        recovery_score: 0,
      },
      urgency_level: ANON_PROFILE_LABEL,
      profile_label: ANON_PROFILE_LABEL,
      created_at: "2026-05-21T10:00:00.000Z",
      age_range: null,
    });

    expect(payload).toBeNull();
  });
});

type QueryResult = { data: unknown; error: unknown; count?: number | null };

function createMockAdmin(handlers: {
  rpc?: Record<string, QueryResult>;
  tables?: Record<string, Record<string, QueryResult>>;
}) {
  const from = vi.fn((table: string) => {
    const tableHandlers = handlers.tables?.[table] ?? {};
    const builder = {
      select: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      eq: vi.fn((column: string, value: string) => {
        const key = `${column}:${value}`;
        const result = tableHandlers[key] ?? tableHandlers.default ?? { data: null, error: null };
        return {
          ...builder,
          is: vi.fn(() => Promise.resolve(result)),
          maybeSingle: vi.fn(async () => result),
          then(onFulfilled: (value: QueryResult) => unknown) {
            return Promise.resolve(result).then(onFulfilled);
          },
        };
      }),
      is: vi.fn(() => Promise.resolve({ data: null, error: null })),
      limit: vi.fn(async () => ({ data: null, error: null })),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    return builder;
  });

  const rpc = vi.fn(async (fn: string) => {
    return handlers.rpc?.[fn] ?? {
      data: null,
      error: { code: "PGRST202", message: `Could not find the function public.${fn}` },
    };
  });

  return { from, rpc } as unknown as import("@supabase/supabase-js").SupabaseClient;
}

describe("revokeIntakeConsentForSession", () => {
  it("uses RPC when available", async () => {
    const admin = createMockAdmin({
      rpc: {
        revoke_intake_session_consent: { data: "revoked", error: null },
      },
    });

    const result = await revokeIntakeConsentForSession(
      admin,
      "00000000-0000-4000-8000-000000000001",
    );

    expect(result).toEqual({ ok: true });
    expect(admin.rpc).toHaveBeenCalledWith("revoke_intake_session_consent", {
      p_session_id: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("treats RPC not_found as success", async () => {
    const admin = createMockAdmin({
      rpc: {
        revoke_intake_session_consent: { data: "not_found", error: null },
      },
    });

    const result = await revokeIntakeConsentForSession(
      admin,
      "00000000-0000-4000-8000-000000000001",
    );

    expect(result).toEqual({ ok: true });
  });

  it("falls back to client path when RPC is missing", async () => {
    const sessionId = "00000000-0000-4000-8000-000000000002";
    const admin = createMockAdmin({
      rpc: {},
      tables: {
        intake_sessions: {
          [`id:${sessionId}`]: {
            data: { profile_label: "Stressdrager" },
            error: null,
          },
          default: { data: null, error: null },
        },
        consent_records: { default: { data: null, error: null } },
        nurture_emails: { default: { data: null, error: null } },
        intake_reminders: { default: { data: null, error: null } },
        recovery_tokens: {
          default: {
            data: null,
            error: {
              code: "PGRST205",
              message: "Could not find the table 'public.recovery_tokens'",
            },
          },
        },
      },
    });

    const result = await revokeIntakeConsentForSession(admin, sessionId);
    expect(result.ok).toBe(true);
  });
});

describe("deleteIntakeSessionForSession", () => {
  it("uses RPC when available", async () => {
    const admin = createMockAdmin({
      rpc: {
        delete_intake_session_data: { data: "deleted", error: null },
      },
    });

    const result = await deleteIntakeSessionForSession(
      admin,
      "00000000-0000-4000-8000-000000000003",
    );

    expect(result).toEqual({ ok: true });
  });

  it("treats RPC not_found as success", async () => {
    const admin = createMockAdmin({
      rpc: {
        delete_intake_session_data: { data: "not_found", error: null },
      },
    });

    const result = await deleteIntakeSessionForSession(
      admin,
      "00000000-0000-4000-8000-000000000004",
    );

    expect(result).toEqual({ ok: true });
  });
});
