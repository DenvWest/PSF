import { createHash, randomBytes } from "node:crypto";
import { signIntakeSessionId } from "@/lib/intake-session-cookie";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_TTL_HOURS = 72;
export const ANON_PROFILE_LABEL = "—";

function hashRecoveryToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function getRecoveryTokenTtlMs(): number {
  const raw = process.env.RECOVERY_TOKEN_TTL_HOURS?.trim();
  const hours = raw ? Number.parseInt(raw, 10) : DEFAULT_TTL_HOURS;
  if (!Number.isFinite(hours) || hours <= 0) {
    return DEFAULT_TTL_HOURS * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

export function buildRecoveryUrl(
  rawToken: string,
  options?: { mode?: "view" | "remeasure" },
): string {
  const site = getPublicSiteUrl();
  const qs = new URLSearchParams({ token: rawToken });
  if (options?.mode === "remeasure") {
    qs.set("mode", "remeasure");
  }
  return `${site}/api/intake/recover?${qs.toString()}`;
}

export function buildIntakeFallbackUrl(): string {
  return `${getPublicSiteUrl()}/intake`;
}

export async function createRecoveryToken(
  sessionId: string,
): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashRecoveryToken(rawToken);
  const expiresAt = new Date(Date.now() + getRecoveryTokenTtlMs()).toISOString();

  const { error } = await admin.from("recovery_tokens").insert({
    session_id: sessionId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("[recovery-token] create failed:", error);
    return null;
  }

  return rawToken;
}

export async function buildIntakeRecoveryUrlForSession(
  sessionId: string | null | undefined,
  options?: { mode?: "view" | "remeasure" },
): Promise<string> {
  if (!sessionId) {
    return buildIntakeFallbackUrl();
  }
  const rawToken = await createRecoveryToken(sessionId);
  if (!rawToken) {
    return buildIntakeFallbackUrl();
  }
  return buildRecoveryUrl(rawToken, options);
}

export type RecoveryTokenVerifyResult =
  | { ok: true; sessionId: string; signedCookie: string }
  | {
      ok: false;
      reason: "invalid" | "expired" | "used" | "session_invalid" | "no_admin";
    };

export async function isSessionRecoverable(sessionId: string): Promise<boolean> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return false;
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("profile_label")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  const label =
    typeof data.profile_label === "string" ? data.profile_label.trim() : "";
  return label.length > 0 && label !== ANON_PROFILE_LABEL;
}

export async function verifyAndConsumeRecoveryToken(
  rawToken: string,
): Promise<RecoveryTokenVerifyResult> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, reason: "no_admin" };
  }

  const trimmed = rawToken.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }

  const tokenHash = hashRecoveryToken(trimmed);
  const now = new Date().toISOString();

  const { data: row, error: fetchError } = await admin
    .from("recovery_tokens")
    .select("id, session_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, reason: "invalid" };
  }

  if (row.used_at) {
    return { ok: false, reason: "used" };
  }

  if (typeof row.expires_at === "string" && row.expires_at <= now) {
    return { ok: false, reason: "expired" };
  }

  const sessionId =
    typeof row.session_id === "string" ? row.session_id.trim() : "";
  if (!sessionId) {
    return { ok: false, reason: "invalid" };
  }

  const recoverable = await isSessionRecoverable(sessionId);
  if (!recoverable) {
    return { ok: false, reason: "session_invalid" };
  }

  const { data: consumed, error: consumeError } = await admin
    .from("recovery_tokens")
    .update({ used_at: now })
    .eq("id", row.id)
    .is("used_at", null)
    .select("session_id")
    .maybeSingle();

  if (consumeError || !consumed) {
    return { ok: false, reason: "used" };
  }

  const signedCookie = signIntakeSessionId(sessionId);
  if (!signedCookie) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, sessionId, signedCookie };
}

export async function verifyUsedRecoveryToken(
  rawToken: string,
): Promise<RecoveryTokenVerifyResult> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, reason: "no_admin" };
  }

  const trimmed = rawToken.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid" };
  }

  const tokenHash = hashRecoveryToken(trimmed);
  const now = new Date().toISOString();

  const { data: row, error: fetchError } = await admin
    .from("recovery_tokens")
    .select("session_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (fetchError || !row || !row.used_at) {
    return { ok: false, reason: "invalid" };
  }

  if (typeof row.expires_at === "string" && row.expires_at <= now) {
    return { ok: false, reason: "expired" };
  }

  const sessionId =
    typeof row.session_id === "string" ? row.session_id.trim() : "";
  if (!sessionId) {
    return { ok: false, reason: "invalid" };
  }

  const recoverable = await isSessionRecoverable(sessionId);
  if (!recoverable) {
    return { ok: false, reason: "session_invalid" };
  }

  const signedCookie = signIntakeSessionId(sessionId);
  if (!signedCookie) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, sessionId, signedCookie };
}

export async function resolveRecoveryToken(
  rawToken: string,
): Promise<RecoveryTokenVerifyResult> {
  const consumed = await verifyAndConsumeRecoveryToken(rawToken);
  if (consumed.ok) {
    return consumed;
  }
  if (consumed.reason === "used") {
    return verifyUsedRecoveryToken(rawToken);
  }
  return consumed;
}

export async function invalidateRecoveryTokensForSession(
  sessionId: string,
): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return;
  }

  const { error } = await admin
    .from("recovery_tokens")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error("[recovery-token] invalidate failed:", error);
  }
}
