import type { NextRequest } from "next/server";

export const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyResponse = {
  action?: string;
  "error-codes"?: string[];
  hostname?: string;
  success?: boolean;
};

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstForwardedIp = forwardedFor.split(",")[0]?.trim();
    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function getExpectedTurnstileHostname(): string | null {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawSiteUrl) {
    return null;
  }

  try {
    return new URL(rawSiteUrl).hostname;
  } catch {
    return null;
  }
}

export async function verifyTurnstileToken(options: {
  expectedAction: string;
  remoteIp: string;
  token: string;
  logContext?: string;
}): Promise<
  | { ok: true }
  | {
      ok: false;
      reason: "action" | "config" | "hostname" | "invalid" | "unavailable";
    }
> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const ctx = options.logContext ?? "turnstile";

  if (!secret) {
    return { ok: false, reason: "config" };
  }

  const body = new URLSearchParams({
    secret,
    response: options.token,
  });

  if (options.remoteIp !== "unknown") {
    body.set("remoteip", options.remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    const result =
      (await response.json().catch(() => null)) as TurnstileVerifyResponse | null;

    if (!response.ok || !result?.success) {
      console.warn(`[${ctx}][security]`, {
        event: "turnstile_failed",
        errorCodes: result?.["error-codes"] ?? [],
        remoteIp: options.remoteIp,
      });
      return { ok: false, reason: "invalid" };
    }

    if (result.action !== options.expectedAction) {
      console.warn(`[${ctx}][security]`, {
        event: "turnstile_action_mismatch",
        action: result.action,
        remoteIp: options.remoteIp,
      });
      return { ok: false, reason: "action" };
    }

    const expectedHostname = getExpectedTurnstileHostname();
    if (
      expectedHostname &&
      result.hostname &&
      result.hostname !== expectedHostname
    ) {
      console.warn(`[${ctx}][security]`, {
        event: "turnstile_hostname_mismatch",
        expectedHostname,
        hostname: result.hostname,
        remoteIp: options.remoteIp,
      });
      return { ok: false, reason: "hostname" };
    }

    return { ok: true };
  } catch (error) {
    console.error(`[${ctx}] turnstile verify error:`, error);
    return { ok: false, reason: "unavailable" };
  }
}
