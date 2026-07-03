import { describe, expect, it, vi } from "vitest";
import { emailHasNurtureDay30Scheduled } from "@/lib/intake-reminder-cron";

function makeNurtureDay30Chain(result: { data: unknown[] | null; error: unknown }) {
  const limit = vi.fn(async () => result);
  const inStatus = vi.fn(() => ({ limit }));
  const eqDay = vi.fn(() => ({ in: inStatus }));
  const eqSource = vi.fn(() => ({ eq: eqDay }));
  const eqEmail = vi.fn(() => ({ eq: eqSource }));
  const select = vi.fn(() => ({ eq: eqEmail }));
  return { select, eqEmail, eqSource, eqDay, inStatus, limit };
}

describe("emailHasNurtureDay30Scheduled", () => {
  it("returns true when nurture day 30 is pending or sent", async () => {
    const chain = makeNurtureDay30Chain({ data: [{ id: "n-1" }], error: null });
    const supabase = {
      from: vi.fn(() => ({ select: chain.select })),
    };

    await expect(
      emailHasNurtureDay30Scheduled(
        supabase as unknown as Parameters<typeof emailHasNurtureDay30Scheduled>[0],
        "user@example.com",
      ),
    ).resolves.toBe(true);

    expect(supabase.from).toHaveBeenCalledWith("nurture_emails");
    expect(chain.eqEmail).toHaveBeenCalledWith("email", "user@example.com");
    expect(chain.eqSource).toHaveBeenCalledWith("source", "intake");
    expect(chain.eqDay).toHaveBeenCalledWith("sequence_day", 30);
    expect(chain.inStatus).toHaveBeenCalledWith("status", ["pending", "sent"]);
  });

  it("returns false when no nurture day 30 exists", async () => {
    const chain = makeNurtureDay30Chain({ data: [], error: null });
    const supabase = {
      from: vi.fn(() => ({ select: chain.select })),
    };

    await expect(
      emailHasNurtureDay30Scheduled(
        supabase as unknown as Parameters<typeof emailHasNurtureDay30Scheduled>[0],
        "user@example.com",
      ),
    ).resolves.toBe(false);
  });

  it("returns false on query error", async () => {
    const chain = makeNurtureDay30Chain({
      data: null,
      error: { message: "db error" },
    });
    const supabase = {
      from: vi.fn(() => ({ select: chain.select })),
    };

    await expect(
      emailHasNurtureDay30Scheduled(
        supabase as unknown as Parameters<typeof emailHasNurtureDay30Scheduled>[0],
        "user@example.com",
      ),
    ).resolves.toBe(false);
  });
});
