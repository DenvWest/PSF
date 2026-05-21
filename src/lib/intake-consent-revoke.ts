import type { SupabaseClient } from "@supabase/supabase-js";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";

const ANON_DOMAIN_SCORES = {
  sleep_score: 0,
  energy_score: 0,
  stress_score: 0,
  nutrition_score: 0,
  movement_score: 0,
  recovery_score: 0,
} as const;

const REVOKE_RPC = "revoke_intake_session_consent";
const DELETE_RPC = "delete_intake_session_data";

const PREFLIGHT_TABLES = [
  "consent_records",
  "nurture_emails",
  "intake_reminders",
] as const;

export type IntakeRevokeResult =
  | { ok: true }
  | { ok: false; step: string; error: unknown };

type RevokeFailure = Extract<IntakeRevokeResult, { ok: false }>;

type PreflightSuccess = { ok: true; recoveryTokensAvailable: boolean };

type RpcAttemptResult =
  | IntakeRevokeResult
  | { ok: false; rpcUnavailable: true };

export function isAnonymizedProfileLabel(
  profileLabel: string | null | undefined,
): boolean {
  const label =
    typeof profileLabel === "string" ? profileLabel.trim() : "";
  return label === ANON_PROFILE_LABEL;
}

export function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as { code?: string; message?: string };
  const code = record.code ?? "";
  const message = record.message ?? "";
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    message.includes("Could not find the table") ||
    message.includes("does not exist")
  );
}

export function isMissingRpcError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as { code?: string; message?: string };
  const code = record.code ?? "";
  const message = record.message ?? "";
  return (
    code === "PGRST202" ||
    message.includes("Could not find the function") ||
    message.includes("function public.revoke_intake_session_consent") ||
    message.includes("function public.delete_intake_session_data")
  );
}

async function loadSessionProfileLabel(
  admin: SupabaseClient,
  sessionId: string,
): Promise<
  | { ok: true; exists: false }
  | { ok: true; exists: true; profileLabel: string | null }
  | RevokeFailure
> {
  const { data, error } = await admin
    .from("intake_sessions")
    .select("profile_label")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    return { ok: false, step: "intake_sessions_preflight", error };
  }

  if (!data) {
    return { ok: true, exists: false };
  }

  return {
    ok: true,
    exists: true,
    profileLabel:
      typeof data.profile_label === "string" ? data.profile_label : null,
  };
}

async function preflightRevokeTables(
  admin: SupabaseClient,
): Promise<PreflightSuccess | RevokeFailure> {
  for (const table of PREFLIGHT_TABLES) {
    const { error } = await admin.from(table).select("id").limit(1);
    if (error) {
      return { ok: false, step: `preflight_${table}`, error };
    }
  }

  const { error: recoveryError } = await admin
    .from("recovery_tokens")
    .select("id")
    .limit(1);

  if (recoveryError && !isMissingRelationError(recoveryError)) {
    return { ok: false, step: "preflight_recovery_tokens", error: recoveryError };
  }

  return {
    ok: true,
    recoveryTokensAvailable: !recoveryError,
  };
}

async function cleanupIntakeSessionLinkedData(
  admin: SupabaseClient,
  sessionId: string,
  options: { recoveryTokensAvailable: boolean },
): Promise<IntakeRevokeResult> {
  const now = new Date().toISOString();

  const { error: withdrawError } = await admin
    .from("consent_records")
    .update({ withdrawn_at: now })
    .eq("session_id", sessionId)
    .is("withdrawn_at", null);

  if (withdrawError) {
    return { ok: false, step: "consent_records", error: withdrawError };
  }

  const { error: nurtureError } = await admin
    .from("nurture_emails")
    .delete()
    .eq("session_id", sessionId);

  if (nurtureError) {
    return { ok: false, step: "nurture_emails", error: nurtureError };
  }

  const { error: remindersError } = await admin
    .from("intake_reminders")
    .delete()
    .eq("session_id", sessionId);

  if (remindersError) {
    return { ok: false, step: "intake_reminders", error: remindersError };
  }

  if (options.recoveryTokensAvailable) {
    const { error: tokensError } = await admin
      .from("recovery_tokens")
      .delete()
      .eq("session_id", sessionId);

    if (tokensError && !isMissingRelationError(tokensError)) {
      return { ok: false, step: "recovery_tokens", error: tokensError };
    }
  }

  return { ok: true };
}

async function revokeViaRpc(
  admin: SupabaseClient,
  sessionId: string,
): Promise<RpcAttemptResult> {
  const { data, error } = await admin.rpc(REVOKE_RPC, {
    p_session_id: sessionId,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return { ok: false, rpcUnavailable: true };
    }
    return { ok: false, step: REVOKE_RPC, error };
  }

  const status = typeof data === "string" ? data : "";
  if (
    status === "revoked" ||
    status === "not_found" ||
    status === "already_anonymized"
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    step: REVOKE_RPC,
    error: new Error(`Onverwacht RPC-resultaat: ${String(data)}`),
  };
}

async function deleteViaRpc(
  admin: SupabaseClient,
  sessionId: string,
): Promise<RpcAttemptResult> {
  const { data, error } = await admin.rpc(DELETE_RPC, {
    p_session_id: sessionId,
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return { ok: false, rpcUnavailable: true };
    }
    return { ok: false, step: DELETE_RPC, error };
  }

  const status = typeof data === "string" ? data : "";
  if (status === "deleted" || status === "not_found") {
    return { ok: true };
  }

  return {
    ok: false,
    step: DELETE_RPC,
    error: new Error(`Onverwacht RPC-resultaat: ${String(data)}`),
  };
}

async function revokeViaClient(
  admin: SupabaseClient,
  sessionId: string,
): Promise<IntakeRevokeResult> {
  const session = await loadSessionProfileLabel(admin, sessionId);
  if (!session.ok) {
    return session;
  }
  if (!session.exists) {
    return { ok: true };
  }
  if (isAnonymizedProfileLabel(session.profileLabel)) {
    return { ok: true };
  }

  const preflight = await preflightRevokeTables(admin);
  if (!preflight.ok) {
    return preflight;
  }

  const { recoveryTokensAvailable } = preflight;

  const cleanup = await cleanupIntakeSessionLinkedData(admin, sessionId, {
    recoveryTokensAvailable,
  });
  if (!cleanup.ok) {
    return cleanup;
  }

  const { error: anonError } = await admin
    .from("intake_sessions")
    .update({
      symptom_profile: [],
      answers: {},
      domain_scores: ANON_DOMAIN_SCORES,
      urgency_level: ANON_PROFILE_LABEL,
      profile_label: ANON_PROFILE_LABEL,
      age_range: null,
      marketing_email: null,
      first_name: null,
    })
    .eq("id", sessionId);

  if (anonError) {
    return { ok: false, step: "intake_sessions", error: anonError };
  }

  return { ok: true };
}

async function deleteViaClient(
  admin: SupabaseClient,
  sessionId: string,
): Promise<IntakeRevokeResult> {
  const session = await loadSessionProfileLabel(admin, sessionId);
  if (!session.ok) {
    return session;
  }
  if (!session.exists) {
    return { ok: true };
  }

  const preflight = await preflightRevokeTables(admin);
  if (!preflight.ok) {
    return preflight;
  }

  const cleanup = await cleanupIntakeSessionLinkedData(admin, sessionId, {
    recoveryTokensAvailable: preflight.recoveryTokensAvailable,
  });
  if (!cleanup.ok) {
    return cleanup;
  }

  const { error: deleteError } = await admin
    .from("intake_sessions")
    .delete()
    .eq("id", sessionId);

  if (deleteError) {
    return { ok: false, step: "intake_sessions_delete", error: deleteError };
  }

  return { ok: true };
}

export async function revokeIntakeConsentForSession(
  admin: SupabaseClient,
  sessionId: string,
): Promise<IntakeRevokeResult> {
  const rpcResult = await revokeViaRpc(admin, sessionId);
  if (rpcResult.ok) {
    return rpcResult;
  }
  if ("rpcUnavailable" in rpcResult) {
    return revokeViaClient(admin, sessionId);
  }
  return rpcResult;
}

export async function deleteIntakeSessionForSession(
  admin: SupabaseClient,
  sessionId: string,
): Promise<IntakeRevokeResult> {
  const rpcResult = await deleteViaRpc(admin, sessionId);
  if (rpcResult.ok) {
    return rpcResult;
  }
  if ("rpcUnavailable" in rpcResult) {
    return deleteViaClient(admin, sessionId);
  }
  return rpcResult;
}
