import type { MacroDoelen } from "@/lib/account-macro-doelen";

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

export async function fetchMacroDoelen(): Promise<MacroDoelen> {
  const response = await fetch("/api/account/macro-doelen", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon je macro-doel niet laden."));
  }
  return (await response.json()) as MacroDoelen;
}

/**
 * Stuurt alleen de velden die meegegeven worden — zelfde patroon als
 * `postVoedingsdoelen`: een weggelaten veld blijft staan, een expliciete
 * `null` wist het.
 */
export async function postMacroDoelen(patch: Partial<MacroDoelen>): Promise<MacroDoelen> {
  const response = await fetch("/api/account/macro-doelen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon je macro-doel niet opslaan."));
  }
  return (await response.json()) as MacroDoelen;
}
