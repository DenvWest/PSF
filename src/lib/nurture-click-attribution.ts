// Client-only module: geen "use server", geen node:crypto.
// Capture-eenmalig-op-load patroon: token wordt uit de URL gelezen en gecached,
// daarna wordt `nt` uit de URL gestript via history.replaceState zodat het
// token niet naar affiliate-partners lekt.

let capturedToken: string | null = null;
let didCapture = false;

/**
 * Idempotente capture: eerste call leest `nt` uit window.location.search,
 * cachet het en verwijdert `nt` uit de URL (overige queryparams blijven).
 * Volgende calls zijn no-op.
 */
export function captureNurtureToken(): void {
  if (didCapture) return;
  didCapture = true;

  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const nt = params.get("nt");

  if (nt) {
    capturedToken = nt;

    params.delete("nt");
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname +
      (newSearch ? `?${newSearch}` : "") +
      window.location.hash;
    history.replaceState(null, "", newUrl);
  }
}

/**
 * Geeft het gecachte nurture-token terug (of null als er geen was).
 * Altijd aanroepen ná captureNurtureToken().
 */
export function getNurtureToken(): string | null {
  return capturedToken;
}

/**
 * Reset voor tests — niet aanroepen in productie-code.
 */
export function _resetNurtureCapture(): void {
  capturedToken = null;
  didCapture = false;
}
