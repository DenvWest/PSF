import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockReminders, mockNurture } = vi.hoisted(() => ({
  mockReminders: vi.fn(),
  mockNurture: vi.fn(),
}));
vi.mock("@/lib/intake-reminder-cron", () => ({
  runPendingIntakeReminders: mockReminders,
}));
vi.mock("@/lib/nurture-cron", () => ({
  runPendingNurtureEmails: mockNurture,
}));

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/send-reminders", {
    method: "POST",
    headers,
  });
}

describe("POST /api/send-reminders — cron auth", () => {
  const OLD_ENV = { ...process.env };
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "s3cret";
    process.env.RESEND_API_KEY = "re_test";
    delete process.env.CRON_ALLOWED_IPS;
    mockReminders.mockResolvedValue({ sent: 0 });
    mockNurture.mockResolvedValue({ sent: 0 });
  });
  afterEach(() => {
    process.env = { ...OLD_ENV };
    vi.resetModules();
  });

  it("zonder token → 401", async () => {
    const { POST } = await import("@/app/api/send-reminders/route");
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(mockReminders).not.toHaveBeenCalled();
  });

  it("verkeerd token → 401", async () => {
    const { POST } = await import("@/app/api/send-reminders/route");
    const res = await POST(makeRequest({ authorization: "Bearer wrong" }));
    expect(res.status).toBe(401);
  });

  it("geldig Bearer token → 200 + crons draaien", async () => {
    const { POST } = await import("@/app/api/send-reminders/route");
    const res = await POST(makeRequest({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(mockReminders).toHaveBeenCalledOnce();
    expect(mockNurture).toHaveBeenCalledOnce();
  });

  it("CRON_SECRET ontbreekt → 503", async () => {
    delete process.env.CRON_SECRET;
    const { POST } = await import("@/app/api/send-reminders/route");
    const res = await POST(makeRequest({ authorization: "Bearer whatever" }));
    expect(res.status).toBe(503);
  });
});
