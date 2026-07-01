import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rollbackIntakeSession } from "@/lib/intake-session-rollback";

function makeAdmin() {
  const consentEq = vi.fn(async (): Promise<{ error: unknown }> => ({ error: null }));
  const consentDelete = vi.fn(() => ({ eq: consentEq }));
  const sessionEq = vi.fn(async (): Promise<{ error: unknown }> => ({ error: null }));
  const sessionDelete = vi.fn(() => ({ eq: sessionEq }));
  const from = vi.fn((table: string) => {
    if (table === "consent_records") return { delete: consentDelete };
    if (table === "intake_sessions") return { delete: sessionDelete };
    throw new Error(`onverwachte tabel ${table}`);
  });
  return {
    admin: { from } as unknown as SupabaseClient,
    from, consentDelete, consentEq, sessionDelete, sessionEq,
  };
}

describe("rollbackIntakeSession", () => {
  it("verwijdert consent_records (op session_id) én intake_sessions (op id)", async () => {
    const m = makeAdmin();
    await rollbackIntakeSession(m.admin, "sess-1");
    expect(m.consentDelete).toHaveBeenCalledOnce();
    expect(m.consentEq).toHaveBeenCalledWith("session_id", "sess-1");
    expect(m.sessionDelete).toHaveBeenCalledOnce();
    expect(m.sessionEq).toHaveBeenCalledWith("id", "sess-1");
  });

  it("verwijdert de sessie ook als de consent-delete een error teruggeeft", async () => {
    const m = makeAdmin();
    m.consentEq.mockResolvedValueOnce({ error: { message: "boom" } });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await rollbackIntakeSession(m.admin, "sess-2");
    expect(m.sessionEq).toHaveBeenCalledWith("id", "sess-2");
    spy.mockRestore();
  });
});
