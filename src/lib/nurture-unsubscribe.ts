const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Token voor nurture uitschrijven: base64url van `email:session_id` (session_id mag leeg zijn).
 */
export function encodeNurtureUnsubscribeToken(
  email: string,
  sessionId: string | null | undefined,
): string {
  const e = email.trim().toLowerCase();
  const sid = (sessionId ?? "").trim();
  return Buffer.from(`${e}:${sid}`, "utf8").toString("base64url");
}

export function decodeNurtureUnsubscribeToken(
  token: string,
): { email: string; sessionId: string } | null {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const decoded = Buffer.from(trimmed, "base64url").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx <= 0) {
      return null;
    }
    const email = decoded.slice(0, idx).trim().toLowerCase();
    const sessionId = decoded.slice(idx + 1);
    if (!email || !EMAIL_REGEX.test(email)) {
      return null;
    }
    return { email, sessionId };
  } catch {
    return null;
  }
}

export function buildNurtureUnsubscribeUrl(
  email: string,
  sessionId: string | null | undefined,
  siteBase: string,
): string {
  const base = siteBase.replace(/\/$/, "");
  const token = encodeNurtureUnsubscribeToken(email, sessionId);
  return `${base}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function anonymizeEmailForAdmin(email: string): string {
  const e = email.trim().toLowerCase();
  const at = e.indexOf("@");
  if (at <= 0) {
    return "***";
  }
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (!domain) {
    return "***";
  }
  if (local.length <= 1) {
    return `*@${domain}`;
  }
  return `${local[0]}***@${domain}`;
}
