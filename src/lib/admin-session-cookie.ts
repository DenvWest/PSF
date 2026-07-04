import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_SUBJECT = "admin";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;
const CLOCK_SKEW_SECONDS = 300;

function getSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function computeSig(secret: string, subject: string, issuedAt: number): string {
  return createHmac("sha256", secret).update(`${subject}.${issuedAt}`).digest("hex");
}

export function signAdminCookie(
  subject: string = ADMIN_SESSION_SUBJECT,
  issuedAtSeconds: number = Math.floor(Date.now() / 1000),
): string | null {
  const secret = getSecret();
  if (!secret || subject !== ADMIN_SESSION_SUBJECT || !Number.isInteger(issuedAtSeconds)) {
    return null;
  }

  const sig = computeSig(secret, subject, issuedAtSeconds);
  return `${subject}.${issuedAtSeconds}.${sig}`;
}

export function verifyAdminCookie(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const secret = getSecret();
  if (!secret) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [subject, issuedAtStr, sigHex] = parts;

  if (
    subject !== ADMIN_SESSION_SUBJECT ||
    !/^\d{1,15}$/.test(issuedAtStr) ||
    sigHex.length !== 64
  ) {
    return null;
  }

  const issuedAt = Number(issuedAtStr);
  if (!Number.isInteger(issuedAt)) return null;

  const expected = computeSig(secret, subject, issuedAt);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sigHex, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (issuedAt > nowSec + CLOCK_SKEW_SECONDS) return null;
  if (nowSec - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS) return null;

  return subject;
}
