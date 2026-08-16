import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { EMPTY_CONNECTION_PROFILE } from "@/lib/connection-profile/types";

/**
 * De consent-poort is het enige deel van deze route dat stil kapot kan gaan
 * zonder dat iemand het merkt: opslaan zou dan werken zonder vastgelegde
 * toestemming. Zie BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §7 maatregel 4.
 */

const {
  mockGetAccountFromCookie,
  mockHasConsent,
  mockWithdrawConsent,
  mockLoadProfile,
  mockSaveProfile,
  mockDeleteProfile,
  mockConsentInsert,
  mockEmitEvent,
} = vi.hoisted(() => ({
  mockGetAccountFromCookie: vi.fn(),
  mockHasConsent: vi.fn(),
  mockWithdrawConsent: vi.fn(),
  mockLoadProfile: vi.fn(),
  mockSaveProfile: vi.fn(),
  mockDeleteProfile: vi.fn(),
  mockConsentInsert: vi.fn(),
  mockEmitEvent: vi.fn(),
}));

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: mockGetAccountFromCookie,
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi
    .fn()
    .mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: () => ({}) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/consent-hashing", () => ({ sha256Hex: () => "hash" }));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({ insert: mockConsentInsert }),
  }),
}));
vi.mock("@/lib/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/events")>()),
  emitEvent: mockEmitEvent,
}));
vi.mock("@/lib/connection-profile-consent", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/connection-profile-consent")>()),
  hasActiveConnectionProfileConsent: mockHasConsent,
  withdrawConnectionProfileConsent: mockWithdrawConsent,
}));
vi.mock("@/lib/connection-profile/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/connection-profile/store")>()),
  loadConnectionProfile: mockLoadProfile,
  saveConnectionProfile: mockSaveProfile,
  deleteConnectionProfile: mockDeleteProfile,
}));

const ACCOUNT = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "dennis@example.com",
  status: "active",
  organization_id: "00000000-0000-0000-0000-000000000001",
};

const PROFILE = {
  ...EMPTY_CONNECTION_PROFILE,
  interests: ["buiten_natuur" as const],
};

function postRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/account/connection-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deleteRequest(): NextRequest {
  return new NextRequest("http://localhost/api/account/connection-profile", {
    method: "DELETE",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAccountFromCookie.mockResolvedValue(ACCOUNT);
  mockHasConsent.mockResolvedValue(false);
  mockWithdrawConsent.mockResolvedValue(true);
  mockLoadProfile.mockResolvedValue(PROFILE);
  mockSaveProfile.mockResolvedValue(PROFILE);
  mockDeleteProfile.mockResolvedValue(true);
  mockConsentInsert.mockResolvedValue({ error: null });
  mockEmitEvent.mockResolvedValue(undefined);
});

describe("POST /api/account/connection-profile", () => {
  it("weigert opslaan zonder toestemming", async () => {
    const { POST } = await import("@/app/api/account/connection-profile/route");
    const response = await POST(postRequest({ profile: PROFILE }));

    expect(response.status).toBe(400);
    expect(mockSaveProfile).not.toHaveBeenCalled();
    expect(mockConsentInsert).not.toHaveBeenCalled();
  });

  it("legt de toestemming vast vóór het profiel wordt opgeslagen", async () => {
    const { POST } = await import("@/app/api/account/connection-profile/route");
    const response = await POST(postRequest({ profile: PROFILE, consent: true }));

    expect(response.status).toBe(200);
    expect(mockConsentInsert).toHaveBeenCalledTimes(1);
    expect(mockConsentInsert.mock.calls[0][0]).toMatchObject({
      account_id: ACCOUNT.id,
      session_id: null,
      consent_type: "connection_profile_storage",
      granted: true,
    });
    expect(mockSaveProfile).toHaveBeenCalledTimes(1);
  });

  it("legt geen tweede toestemmingsrij aan bij een bewerking", async () => {
    mockHasConsent.mockResolvedValue(true);

    const { POST } = await import("@/app/api/account/connection-profile/route");
    const response = await POST(postRequest({ profile: PROFILE }));

    expect(response.status).toBe(200);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockSaveProfile).toHaveBeenCalledTimes(1);
  });

  /**
   * De meting die telt is cprofile.completed / cprofile.step_completed{step:1}.
   * Die mag geen gekozen tags of notitietekst meedragen — §4 sluit vrije tekst
   * in events expliciet uit.
   */
  it("meet de afronding met aantallen, nooit met de gekozen tags", async () => {
    const { POST } = await import("@/app/api/account/connection-profile/route");
    await POST(postRequest({ profile: PROFILE, consent: true }));

    expect(mockEmitEvent).toHaveBeenCalledTimes(1);
    const [emitted] = mockEmitEvent.mock.calls[0];
    expect(emitted.eventType).toBe("cprofile.completed");
    expect(emitted.payload).toMatchObject({ n_interest: 1, is_update: false });

    const serialized = JSON.stringify(emitted.payload);
    expect(serialized).not.toContain("buiten_natuur");
  });

  it("weigert een verzoek zonder account", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);

    const { POST } = await import("@/app/api/account/connection-profile/route");
    const response = await POST(postRequest({ profile: PROFILE, consent: true }));

    expect(response.status).toBe(401);
    expect(mockSaveProfile).not.toHaveBeenCalled();
  });
});

describe("GET /api/account/connection-profile", () => {
  it("geeft geen profiel terug zonder actieve toestemming", async () => {
    const { GET } = await import("@/app/api/account/connection-profile/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      profile: null,
      consentGranted: false,
      content: [],
    });
    expect(mockLoadProfile).not.toHaveBeenCalled();
  });

  it("geeft het profiel terug met actieve toestemming", async () => {
    mockHasConsent.mockResolvedValue(true);

    const { GET } = await import("@/app/api/account/connection-profile/route");
    const response = await GET();
    const body = await response.json();

    expect(body.consentGranted).toBe(true);
    expect(body.profile).toMatchObject({ interests: ["buiten_natuur"] });
  });
});

describe("DELETE /api/account/connection-profile", () => {
  it("wist het profiel en trekt de toestemming in", async () => {
    const { DELETE } = await import("@/app/api/account/connection-profile/route");
    const response = await DELETE(deleteRequest());

    expect(response.status).toBe(200);
    expect(mockDeleteProfile).toHaveBeenCalledWith(ACCOUNT.id);
    expect(mockWithdrawConsent).toHaveBeenCalledTimes(1);
  });

  it("trekt de toestemming niet in als het wissen faalt", async () => {
    mockDeleteProfile.mockResolvedValue(false);

    const { DELETE } = await import("@/app/api/account/connection-profile/route");
    const response = await DELETE(deleteRequest());

    expect(response.status).toBe(500);
    expect(mockWithdrawConsent).not.toHaveBeenCalled();
  });
});
