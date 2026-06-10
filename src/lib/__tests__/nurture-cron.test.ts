import { beforeEach, describe, expect, it, vi } from "vitest";
import { runPendingNurtureEmails } from "@/lib/nurture-cron";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

// ---------------------------------------------------------------------------
// Module mocks (hoisted — vi.hoisted zorgt dat deze vars beschikbaar zijn
// voor de gehoisde vi.mock factories)
// ---------------------------------------------------------------------------

const { mockResendSend, mockEmitEvent } = vi.hoisted(() => ({
  mockResendSend: vi.fn(),
  mockEmitEvent: vi.fn(),
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
  ANON_PROFILE_LABEL: "__anon__",
  buildIntakeRecoveryUrlForSession: vi.fn().mockResolvedValue("https://example.com/recover"),
  buildIntakeFallbackUrl: () => "https://example.com/intake",
}));
vi.mock("@/lib/nurture-unsubscribe", () => ({
  buildNurtureUnsubscribeUrl: () => "https://example.com/unsub",
  buildGuideUnsubscribeUrl: () => "https://example.com/unsub-guide",
}));
vi.mock("@/lib/email-templates/nurture", () => ({
  getNurtureEmailContent: () => ({ subject: "Dag 7 test", html: "<p>test</p>" }),
}));
vi.mock("@/lib/content/nurture-interventions", () => ({
  getPlanInterventionBucketsForSession: vi.fn().mockResolvedValue(null),
  loadNurturePlanGate: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/content/plan-content", () => ({
  themeHasCompletePlanContent: vi.fn().mockResolvedValue(false),
}));
vi.mock("@/data/gids", () => ({ isGuideThema: vi.fn().mockReturnValue(false) }));

// ---------------------------------------------------------------------------
// Supabase builder mock — queue-based terminal calls
// ---------------------------------------------------------------------------

type QueueEntry = { data: unknown; error: unknown };

let responseQueue: QueueEntry[] = [];

function dequeue(): Promise<QueueEntry> {
  return Promise.resolve(responseQueue.shift() ?? { data: null, error: null });
}

type Builder = Record<string, unknown>;
let supaBuilder: Builder;

function makeBuilder(): Builder {
  const b: Builder = {};
  const chain = () => b;
  b.update = vi.fn(chain);
  b.select = vi.fn(chain);
  b.eq = vi.fn(chain);
  b.lt = vi.fn(chain);
  b.lte = vi.fn(chain);
  b.is = vi.fn(chain);
  b.order = vi.fn(chain);
  b.limit = vi.fn(dequeue);
  b.maybeSingle = vi.fn(dequeue);
  // Maakt de builder thenable zodat `await builder` werkt voor chains zonder expliciete terminal
  b.then = vi.fn(
    (resolve: (v: QueueEntry) => void, reject: (e: unknown) => void) =>
      dequeue().then(resolve, reject),
  );
  return b;
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const INTAKE_MAIL = {
  id: "mail-uuid-1",
  email: "test@example.com",
  sequence_day: 7,
  profile_label: "Onrustige Slaper",
  primary_domain: "sleep",
  domain_scores: {
    sleep_score: 40,
    energy_score: 35,
    stress_score: 50,
    nutrition_score: 45,
    movement_score: 60,
    recovery_score: 30,
  },
  session_id: "session-uuid-1",
  urgency_level: "moderate",
  first_name: "Dennis",
  source: "intake",
  thema: null,
};

const OK: QueueEntry = { data: null, error: null };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("nurture-cron: atomaire claim-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    responseQueue = [];
    supaBuilder = makeBuilder();
    vi.mocked(createSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue(supaBuilder),
    } as unknown as ReturnType<typeof createSupabaseAdmin>);
    mockResendSend.mockResolvedValue({ data: { id: "resend-1" }, error: null });
  });

  it("happy path: claim wint → send → status sent, result {sent:1, errors:0}", async () => {
    responseQueue = [
      OK,                                              // stuck-recovery
      { data: [INTAKE_MAIL], error: null },            // select pending
      { data: { id: INTAKE_MAIL.id }, error: null },   // claim wint
      { data: { profile_label: "Onrustige Slaper" }, error: null }, // session check
      OK,                                              // update status='sent'
    ];

    const result = await runPendingNurtureEmails();

    expect(result).toEqual({ sent: 1, errors: 0 });
    expect(mockResendSend).toHaveBeenCalledOnce();
  });

  it("claim miss (andere run won): Resend niet aangeroepen, result {sent:0, errors:0}", async () => {
    responseQueue = [
      OK,                                           // stuck-recovery
      { data: [INTAKE_MAIL], error: null },         // select pending
      { data: null, error: null },                  // claim: null → andere run won
    ];

    const result = await runPendingNurtureEmails();

    expect(result).toEqual({ sent: 0, errors: 0 });
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it("claimErr: geen send, errors += 1", async () => {
    responseQueue = [
      OK,                                                   // stuck-recovery
      { data: [INTAKE_MAIL], error: null },                 // select pending
      { data: null, error: { message: "DB verbindingsfout" } }, // claim faalt
    ];

    const result = await runPendingNurtureEmails();

    expect(result).toEqual({ sent: 0, errors: 1 });
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it("stuck-sending recovery: update aangeroepen met {status:'pending', claimed_at:null} vóór select", async () => {
    responseQueue = [
      OK,                              // stuck-recovery
      { data: [], error: null },       // select: geen pending rijen
    ];

    await runPendingNurtureEmails();

    const updateFn = vi.mocked(supaBuilder.update as ReturnType<typeof vi.fn>);
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending", claimed_at: null }),
    );

    const ltFn = vi.mocked(supaBuilder.lt as ReturnType<typeof vi.fn>);
    expect(ltFn).toHaveBeenCalledWith(
      "claimed_at",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    );
  });
});
