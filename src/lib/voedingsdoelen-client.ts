import type { KernstofProfiel } from "@/lib/account-kernstof-profiel";
import type {
  Voedingsdoelen,
  VoedingsdoelenWeergave,
} from "@/lib/account-voedingsdoelen";

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error?.trim()) {
      return payload.error.trim();
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export async function fetchVoedingsdoelen(): Promise<VoedingsdoelenWeergave> {
  const response = await fetch("/api/account/voedingsdoelen", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon je doelen niet laden."));
  }
  return (await response.json()) as VoedingsdoelenWeergave;
}

/**
 * Stuurt alleen de velden die meegegeven worden.
 *
 * Een weggelaten veld blijft staan, een expliciete `null` wist het — zie
 * `leesVeld` in de route. Daarom is dit een `Partial` en geen volledig
 * object: een scherm dat alleen het gewicht bijwerkt, hoort het eiwitdoel
 * niet mee te versturen.
 */
export async function postVoedingsdoelen(
  patch: Partial<Voedingsdoelen>,
): Promise<VoedingsdoelenWeergave> {
  const response = await fetch("/api/account/voedingsdoelen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon je doelen niet opslaan."));
  }
  return (await response.json()) as VoedingsdoelenWeergave;
}

/**
 * Past het kernstofprofiel aan (`/api/account/kernstof-profiel`). Zelfde
 * afspraak: weggelaten blijft staan, `null` wist. Geeft de hele weergave terug,
 * met de herberekende normen.
 */
export async function postKernstofProfiel(patch: {
  geslacht?: KernstofProfiel["geslacht"];
  zeventigPlus?: boolean;
  voedingswijze?: KernstofProfiel["voedingswijze"];
  menstruatie?: KernstofProfiel["menstruatie"];
  streefwaarden?: Partial<Record<keyof KernstofProfiel["streefwaarden"], number | null>>;
}): Promise<VoedingsdoelenWeergave> {
  const response = await fetch("/api/account/kernstof-profiel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon je keuze niet opslaan."));
  }
  return (await response.json()) as VoedingsdoelenWeergave;
}
