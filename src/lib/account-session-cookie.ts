import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ACCOUNT_SESSION_COOKIE_NAME = "psf_account";
export const ACCOUNT_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSecret(): string | null {
  const s = process.env.ACCOUNT_COOKIE_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

export function signAccountCookie(accountId: string): string | null {
  const secret = getSecret();
  if (!secret || !UUID_RE.test(accountId)) {
    return null;
  }

  const sig = createHmac("sha256", secret).update(accountId).digest("hex");
  return `${accountId}.${sig}`;
}

export function verifyAccountCookie(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) {
    return null;
  }

  const accountId = raw.slice(0, dot);
  const sigHex = raw.slice(dot + 1);

  if (!UUID_RE.test(accountId) || sigHex.length !== 64) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(accountId).digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sigHex, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }

  return accountId;
}

export async function getAccountIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return verifyAccountCookie(cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value);
}
