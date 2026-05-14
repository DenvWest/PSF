const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_EMAIL_LENGTH = 254;

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
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
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

const THEMA_TOKEN_PREFIX = "thema:";

export function encodeThemaUnsubscribeToken(
  email: string,
  thema: string,
): string {
  const e = email.trim().toLowerCase();
  const t = thema.trim().toLowerCase();
  return Buffer.from(`${THEMA_TOKEN_PREFIX}${e}:${t}`, "utf8").toString(
    "base64url",
  );
}

export function decodeThemaUnsubscribeToken(
  token: string,
): { email: string; thema: string } | null {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const decoded = Buffer.from(trimmed, "base64url").toString("utf8");
    if (!decoded.startsWith(THEMA_TOKEN_PREFIX)) {
      return null;
    }
    const payload = decoded.slice(THEMA_TOKEN_PREFIX.length);
    const idx = payload.indexOf(":");
    if (idx <= 0) {
      return null;
    }
    const email = payload.slice(0, idx).trim().toLowerCase();
    const thema = payload.slice(idx + 1).trim().toLowerCase();
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email) || !thema) {
      return null;
    }
    return { email, thema };
  } catch {
    return null;
  }
}

export function buildThemaUnsubscribeUrl(
  email: string,
  thema: string,
  siteBase: string,
): string {
  const base = siteBase.replace(/\/$/, "");
  const token = encodeThemaUnsubscribeToken(email, thema);
  return `${base}/api/thema/unsubscribe?token=${encodeURIComponent(token)}`;
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
