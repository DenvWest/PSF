import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleNurtureSequence } from "@/lib/nurture";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { ResolvedNurtureCta } from "@/lib/resolve-nurture-cta";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockResendSend, mockEmitEvent, mockGetNurtureEmailContent } = vi.hoisted(() => ({
  mockResendSend: vi.fn(),
  mockEmitEvent: vi.fn(),
  mockGetNurtureEmailContent: vi.fn(),
}));

vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn().mockImplementation(function (this: any) {
    this.emails = { send: mockResendSend };
  }),
}));
vi.mock("@/lib/supabase-admin");
vi.mock("@/lib/events", () => ({ emitEvent: mockEmitEvent }));
vi.mock("@/lib/public-site-url", () => ({ getPublicSiteUrl: () => "https://example.com" }));
vi.mock("@/lib/recovery-token", () => ({
  buildIntakeRecoveryUrlForSession: vi.fn().mockResolvedValue("https://example.com/recover"),
}));
vi.mock("@/lib/nurture-unsubscribe", () => ({
  buildNurtureUnsubscribeUrl: () => "https://example.com/unsub",
}));
vi.mock("@/lib/email-templates/nurture", () => ({
  getNurtureEmailContent: mockGetNurtureEmailContent,
}));
vi.mock("@/lib/guide-nurture", () => ({
  cancelPendingGuideSequences: vi.fn().mockResolvedValue(0),
}));

// ---------------------------------------------------------------------------
// Supabase stub — insert succeeds
// ---------------------------------------------------------------------------

function makeSupabaseStub() {
  const b: Record<string, unknown> = {};
  const chain = () => b;
  b.from = vi.fn(chain);
  b.insert = vi.fn(() => Promise.resolve({ data: null, error: null }));
  return b;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResolvedCta(
  kind: ResolvedNurtureCta["kind"],
  url: string,
  candidateRank: number | null = null,
): ResolvedNurtureCta {
  return { kind, url, text: "test CTA", candidateRank };
}

const BASE_INPUT = {
  sessionId: "session-dag0-uuid",
  email: "test@example.com",
  profileLabel: "Onrustige Slaper",
  primaryDomain: "sleep",
  domainScores: {
    sleep_score: 40,
    energy_score: 35,
    stress_score: 50,
    nutrition_score: 45,
    movement_score: 60,
    recovery_score: 30,
  },
  urgencyLevel: "moderate",
  firstName: "Dennis",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("scheduleNurtureSequence: dag-0 nurture.email_sent payload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const stub = makeSupabaseStub();
    vi.mocked(createSupabaseAdmin).mockReturnValue(
      stub as unknown as ReturnType<typeof createSupabaseAdmin>,
    );

    mockResendSend.mockResolvedValue({ data: { id: "resend-dag0" }, error: null });

    mockGetNurtureEmailContent.mockReturnValue({
      subject: "Dag 0 test",
      html: "<p>test dag0</p>",
      resolvedCta: makeResolvedCta("lifestyle", "/intake"),
    });
  });

  it("dag-0 lifestyle-mail: emitEvent krijgt cta_kind:'lifestyle', cta_slug:null, candidate_rank:null, variant:null", async () => {
    await scheduleNurtureSequence(BASE_INPUT);

    const emitCall = mockEmitEvent.mock.calls.find(
      (c: unknown[]) =>
        (c[0] as { eventType?: string }).eventType === "nurture.email_sent",
    );
    expect(emitCall).toBeDefined();
    const payload = (emitCall![0] as { payload: Record<string, unknown> }).payload;

    expect(payload.cta_kind).toBe("lifestyle");
    expect(payload.cta_slug).toBeNull();
    expect(payload.candidate_rank).toBeNull();
    expect(payload.variant).toBeNull();
    expect(payload.sequence_day).toBe(0);
    expect(payload.status).toBe("sent");
  });

  it("dag-0 supplement-mail (hypothetisch): cta_slug en candidate_rank worden doorgegeven", async () => {
    mockGetNurtureEmailContent.mockReturnValue({
      subject: "Dag 0 supplement test",
      html: "<p>magnesium</p>",
      resolvedCta: makeResolvedCta("supplement", "/beste/magnesium", 0),
    });

    await scheduleNurtureSequence(BASE_INPUT);

    const emitCall = mockEmitEvent.mock.calls.find(
      (c: unknown[]) =>
        (c[0] as { eventType?: string }).eventType === "nurture.email_sent",
    );
    const payload = (emitCall![0] as { payload: Record<string, unknown> }).payload;
    expect(payload.cta_kind).toBe("supplement");
    expect(payload.cta_slug).toBe("magnesium");
    expect(payload.candidate_rank).toBe(0);
  });

  it("payload bevat geen PII-velden (email, naam, vrije tekst)", async () => {
    await scheduleNurtureSequence(BASE_INPUT);

    const emitCall = mockEmitEvent.mock.calls.find(
      (c: unknown[]) =>
        (c[0] as { eventType?: string }).eventType === "nurture.email_sent",
    );
    expect(emitCall).toBeDefined();
    const payload = (emitCall![0] as { payload: Record<string, unknown> }).payload;

    const ALLOWED_KEYS = new Set([
      "sequence_day",
      "profile_label",
      "primary_domain",
      "status",
      "cta_kind",
      "cta_slug",
      "candidate_rank",
      "variant",
    ]);
    for (const key of Object.keys(payload)) {
      expect(ALLOWED_KEYS.has(key), `Verboden payload-sleutel: ${key}`).toBe(true);
    }
  });

  it("geen nurture.email_sent event als Resend faalt", async () => {
    mockResendSend.mockResolvedValue({ data: null, error: { message: "Resend down" } });

    await scheduleNurtureSequence(BASE_INPUT);

    const sentEvent = mockEmitEvent.mock.calls.find(
      (c: unknown[]) =>
        (c[0] as { eventType?: string }).eventType === "nurture.email_sent",
    );
    expect(sentEvent).toBeUndefined();
  });
});
