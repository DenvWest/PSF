/** "6 min" → 6; onbekende notatie levert Infinity zodat het nooit als kort telt. */
export function leestijdInMinuten(leestijd: string): number {
  const match = leestijd.match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}
