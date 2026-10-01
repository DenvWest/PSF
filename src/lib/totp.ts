import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * TOTP (RFC 6238) op HOTP (RFC 4226), HMAC-SHA1 — het compatibiliteitsformaat
 * dat elke authenticator-app (Google/Microsoft/1Password Authenticator,
 * Authy) ondersteunt. Geen externe dependency: hetzelfde handgeschreven-
 * HMAC-patroon als admin-session-cookie.ts/cron-auth.ts.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateBase32Secret(byteLength = 20): string {
  const bytes = randomBytes(byteLength);
  let bits = "";
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = (binCode % 10 ** DIGITS).toString().padStart(DIGITS, "0");
  return code;
}

function timingSafeCodeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

/**
 * Verifieert een 6-cijferige TOTP-code tegen het base32-secret. Tolereert
 * ±1 tijdstap (30s) voor kloksynchronisatie-drift tussen server en telefoon.
 */
export function verifyTotpCode(
  secretBase32: string,
  code: string,
  now: number = Date.now(),
): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  if (!secretBase32 || secretBase32.trim().length === 0) return false;

  const secret = base32Decode(secretBase32);
  if (secret.length === 0) return false;

  const counter = Math.floor(now / 1000 / STEP_SECONDS);

  for (const drift of [0, -1, 1]) {
    const candidateCounter = counter + drift;
    if (candidateCounter < 0) continue;
    const candidate = hotp(secret, candidateCounter);
    if (timingSafeCodeEqual(candidate, code)) {
      return true;
    }
  }
  return false;
}
