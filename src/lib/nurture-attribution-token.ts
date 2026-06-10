import { createHash, createHmac } from "node:crypto";

const VERSION = "v1";
const TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 dagen

export type NurtureAttributionPayload = {
  sessionId: string;
  sequenceDay: number;
  profileLabel: string;
  variant: string | null;
};

function getSecret(): string {
  return (
    process.env.NURTURE_ATTRIBUTION_SECRET?.trim() ??
    process.env.COOKIE_SECRET?.trim() ??
    ""
  );
}

function signData(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function constantTimeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  let diff = 0;
  for (let i = 0; i < ha.length; i++) {
    diff |= ha[i]! ^ hb[i]!;
  }
  return diff === 0;
}

export function buildNurtureAttributionToken(
  payload: NurtureAttributionPayload,
): string {
  const secret = getSecret();
  if (!secret) return "";

  const exp = Date.now() + TTL_MS;
  const body = Buffer.from(
    JSON.stringify({
      sid: payload.sessionId,
      day: payload.sequenceDay,
      lbl: payload.profileLabel,
      var: payload.variant ?? null,
      exp,
    }),
  ).toString("base64url");

  const sig = signData(`${VERSION}.${body}`, secret);
  return `${VERSION}.${body}.${sig}`;
}

export function resolveNurtureAttributionToken(
  token: string,
): NurtureAttributionPayload | null {
  if (!token || typeof token !== "string") return null;

  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [ver, body, sig] = parts as [string, string, string];
  if (ver !== VERSION) return null;

  const expectedSig = signData(`${VERSION}.${body}`, secret);
  if (!constantTimeEqual(sig, expectedSig)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const rec = parsed as Record<string, unknown>;

  const exp = typeof rec.exp === "number" ? rec.exp : 0;
  if (Date.now() > exp) return null;

  const sid = typeof rec.sid === "string" ? rec.sid.trim() : "";
  const day = typeof rec.day === "number" ? Math.floor(rec.day) : -1;
  const lbl = typeof rec.lbl === "string" ? rec.lbl.trim() : "";
  // var is optional — afwezig in tokens die vóór deze versie zijn aangemaakt (backward compat)
  const variant =
    typeof rec.var === "string" && rec.var.trim() ? rec.var.trim() : null;

  if (!sid || day < 0 || !lbl) return null;

  return { sessionId: sid, sequenceDay: day, profileLabel: lbl, variant };
}
