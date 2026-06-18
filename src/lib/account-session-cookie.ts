import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ACCOUNT_SESSION_COOKIE_NAME = "psf_account";
export const ACCOUNT_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
const CLOCK_SKEW_SECONDS = 300;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSecret(): string | null {
  const s = process.env.ACCOUNT_COOKIE_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

function computeSig(secret: string, accountId: string, issuedAt: number): string {
  return createHmac("sha256", secret).update(`${accountId}.${issuedAt}`).digest("hex");
}

export function signAccountCookie(
  accountId: string,
  issuedAtSeconds: number = Math.floor(Date.now() / 1000),
): string | null {
  const secret = getSecret();
  if (!secret || !UUID_RE.test(accountId) || !Number.isInteger(issuedAtSeconds)) {
    return null;
  }
  const sig = computeSig(secret, accountId, issuedAtSeconds);
  return `${accountId}.${issuedAtSeconds}.${sig}`;
}

export function verifyAccountCookie(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const secret = getSecret();
  if (!secret) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [accountId, issuedAtStr, sigHex] = parts;

  if (!UUID_RE.test(accountId) || !/^\d{1,15}$/.test(issuedAtStr) || sigHex.length !== 64) {
    return null;
  }
  const issuedAt = Number(issuedAtStr);
  if (!Number.isInteger(issuedAt)) return null;

  const expected = computeSig(secret, accountId, issuedAt);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sigHex, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (issuedAt > nowSec + CLOCK_SKEW_SECONDS) return null;
  if (nowSec - issuedAt > ACCOUNT_COOKIE_MAX_AGE_SECONDS) return null;

  return accountId;
}

export async function getAccountIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return verifyAccountCookie(cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value);
}
