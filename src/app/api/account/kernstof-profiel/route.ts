import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ORG_ID } from "@/config/org";
import {
  getKernstofProfiel,
  KernstofProfielNietBeschikbaar,
  pasKernstofPatchToe,
  setKernstofProfiel,
} from "@/lib/account-kernstof-profiel";
import { getAccountFromCookie } from "@/lib/account-server";
import { laadVoedingsdoelenWeergave } from "@/lib/account-voedingsdoelen-server";
import { orgScoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Past het kernstofprofiel aan (geslacht voor de norm, 70+, voedingswijze,
 * streefwaarden) en geeft de hele voedingsdoelen-weergave terug, zodat de
 * client meteen de herberekende normen heeft. Lezen gaat via
 * `/api/account/voedingsdoelen`.
 */
export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    getClientIp(request),
    getRateLimitConfig("intake_session"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json({ error: "Database is nog niet geconfigureerd op de server." }, { status: 503 });
  }

  try {
    const huidig = await getKernstofProfiel(admin, account.id);
    const resultaat = pasKernstofPatchToe(huidig, body);
    if ("fout" in resultaat) {
      return NextResponse.json({ error: resultaat.fout }, { status: 400 });
    }
    await setKernstofProfiel(admin, account.id, resultaat.profiel);
    return NextResponse.json(await laadVoedingsdoelenWeergave(account.id), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof KernstofProfielNietBeschikbaar) {
      return NextResponse.json(
        { error: "Dit kan nog niet: de database wordt bijgewerkt." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Kon je keuze niet opslaan." }, { status: 500 });
  }
}
