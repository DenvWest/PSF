import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelPendingGuideSequences,
  scheduleGuideNurtureSequence,
} from "@/lib/guide-nurture";
import { hasActiveMainNurture, scheduleNurtureSequence } from "@/lib/nurture";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const { mockResendSend, mockGetGuideNurtureEmailContent, mockGetNurtureEmailContent } =
  vi.hoisted(() => ({
    mockResendSend: vi.fn(),
    mockGetGuideNurtureEmailContent: vi.fn(),
    mockGetNurtureEmailContent: vi.fn(),
  }));

vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn().mockImplementation(function (this: any) {
    this.emails = { send: mockResendSend };
  }),
}));
vi.mock("@/lib/supabase-admin");
vi.mock("@/lib/events", () => ({ emitEvent: vi.fn() }));
vi.mock("@/lib/public-site-url", () => ({ getPublicSiteUrl: () => "https://example.com" }));
vi.mock("@/lib/nurture-unsubscribe", () => ({
  buildGuideUnsubscribeUrl: () => "https://example.com/unsub-guide",
  buildNurtureUnsubscribeUrl: () => "https://example.com/unsub",
}));
vi.mock("@/lib/recovery-token", () => ({
  buildIntakeRecoveryUrlForSession: vi.fn().mockResolvedValue("https://example.com/recover"),
}));
vi.mock("@/lib/nurture-attribution-token", () => ({
  buildNurtureAttributionToken: () => "token",
}));
vi.mock("@/lib/email-templates/guide-nurture", () => ({
  getGuideNurtureEmailContent: mockGetGuideNurtureEmailContent,
}));
vi.mock("@/lib/email-templates/nurture", () => ({
  getNurtureEmailContent: mockGetNurtureEmailContent,
}));

function makeSelectChain(result: { data: unknown[] | null; error: unknown }) {
  const limit = vi.fn(async () => result);
  const inFn = vi.fn(() => ({ limit }));
  const eqSecond = vi.fn(() => ({ in: inFn }));
  const eqFirst = vi.fn(() => ({ eq: eqSecond }));
  const select = vi.fn(() => ({ eq: eqFirst }));
  return { select, eqFirst, eqSecond, inFn, limit };
}

function makeDeleteChain(result: { data: unknown[] | null; error: unknown }) {
  const select = vi.fn(async () => result);
  const eqStatus = vi.fn(() => ({ select }));
  const like = vi.fn(() => ({ eq: eqStatus }));
  const eqEmail = vi.fn(() => ({ like }));
  const deleteFn = vi.fn(() => ({ eq: eqEmail }));
  return { deleteFn, eqEmail, like, eqStatus, select };
}

type NurtureInsertRow = { status: string; sequence_day: number };

function makeInsertStub() {
  const insert = vi.fn<
    (rows: NurtureInsertRow[]) => Promise<{ data: null; error: null }>
  >(async () => ({ data: null, error: null }));
  const from = vi.fn(() => ({ insert }));
  return { from, insert };
}

function getInsertedRows(
  insert: ReturnType<typeof makeInsertStub>["insert"],
): NurtureInsertRow[] {
  const call = insert.mock.calls[0];
  expect(call).toBeDefined();
  return call![0];
}

describe("hasActiveMainNurture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when pending or sent intake nurture exists", async () => {
    const chain = makeSelectChain({ data: [{ id: "row-1" }], error: null });
    vi.mocked(createSupabaseAdmin).mockReturnValue({
      from: vi.fn(() => ({ select: chain.select })),
    } as unknown as ReturnType<typeof createSupabaseAdmin>);

    await expect(hasActiveMainNurture("lead@example.com")).resolves.toBe(true);
    expect(chain.eqSecond).toHaveBeenCalledWith("source", "intake");
    expect(chain.inFn).toHaveBeenCalledWith("status", ["pending", "sent"]);
  });

  it("returns false when no intake nurture exists", async () => {
    const chain = makeSelectChain({ data: [], error: null });
    vi.mocked(createSupabaseAdmin).mockReturnValue({
      from: vi.fn(() => ({ select: chain.select })),
    } as unknown as ReturnType<typeof createSupabaseAdmin>);

    await expect(hasActiveMainNurture("lead@example.com")).resolves.toBe(false);
  });
});

describe("cancelPendingGuideSequences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes pending guide rows for the email", async () => {
    const chain = makeDeleteChain({
      data: [{ id: "g1" }, { id: "g2" }],
      error: null,
    });
    vi.mocked(createSupabaseAdmin).mockReturnValue({
      from: vi.fn(() => ({ delete: chain.deleteFn })),
    } as unknown as ReturnType<typeof createSupabaseAdmin>);

    await expect(cancelPendingGuideSequences("lead@example.com")).resolves.toBe(2);
    expect(chain.like).toHaveBeenCalledWith("source", "guide_%");
    expect(chain.eqStatus).toHaveBeenCalledWith("status", "pending");
  });
});

describe("scheduleGuideNurtureSequence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendSend.mockResolvedValue({ data: { id: "resend-guide-0" }, error: null });
    mockGetGuideNurtureEmailContent.mockReturnValue({
      subject: "Je gids",
      html: "<p>PDF</p>",
    });
  });

  it("cold lead: inserts day-0 plus pending follow-up rows", async () => {
    const stub = makeInsertStub();
    vi.mocked(createSupabaseAdmin).mockReturnValue(
      stub as unknown as ReturnType<typeof createSupabaseAdmin>,
    );

    const count = await scheduleGuideNurtureSequence({
      email: "cold@example.com",
      thema: "slaap",
    });

    expect(count).toBe(6);
    const rows = getInsertedRows(stub.insert);
    expect(rows).toHaveLength(6);
    expect(rows.filter((r) => r.status === "pending")).toHaveLength(5);
    expect(rows.some((r) => r.sequence_day === 0 && r.status === "sent")).toBe(true);
    expect(mockResendSend).toHaveBeenCalledOnce();
  });

  it("main nurture overlap: oneOffOnly sends PDF without pending rows", async () => {
    const stub = makeInsertStub();
    vi.mocked(createSupabaseAdmin).mockReturnValue(
      stub as unknown as ReturnType<typeof createSupabaseAdmin>,
    );

    const count = await scheduleGuideNurtureSequence({
      email: "intake@example.com",
      thema: "stress",
      oneOffOnly: true,
    });

    expect(count).toBe(1);
    const rows = getInsertedRows(stub.insert);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.sequence_day).toBe(0);
    expect(rows[0]?.status).toBe("sent");
    expect(mockResendSend).toHaveBeenCalledOnce();
  });
});

describe("scheduleNurtureSequence guide dedup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendSend.mockResolvedValue({ data: { id: "resend-intake-0" }, error: null });
    mockGetNurtureEmailContent.mockReturnValue({
      subject: "Dag 0",
      html: "<p>intake</p>",
      resolvedCta: { kind: "lifestyle", url: "/intake", text: "CTA", candidateRank: null },
    });
  });

  it("cancels pending guide sequences before scheduling intake nurture", async () => {
    const deleteChain = makeDeleteChain({ data: [{ id: "pending-guide" }], error: null });
    const insert = vi.fn(async () => ({ data: null, error: null }));
    const from = vi.fn((table: string) => {
      if (table === "nurture_emails") {
        return {
          delete: deleteChain.deleteFn,
          insert,
        };
      }
      return { insert };
    });

    vi.mocked(createSupabaseAdmin).mockReturnValue({
      from,
    } as unknown as ReturnType<typeof createSupabaseAdmin>);

    await scheduleNurtureSequence({
      sessionId: "session-uuid",
      email: "guide-lead@example.com",
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
      firstName: null,
    });

    expect(deleteChain.like).toHaveBeenCalledWith("source", "guide_%");
    expect(insert).toHaveBeenCalled();
  });
});
