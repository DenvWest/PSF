// Weergave-helpers (NL). Puur presentatie; geen business-logica.

export function formatNlDay(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNlDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Grove relatieve tijd voor tijdlijn-events: "zojuist", "3 u", "2 dgn". */
export function relativeTimeNl(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const seconds = Math.round((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "zojuist";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} u`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} dgn`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mnd`;
  return `${Math.round(months / 12)} jr`;
}
