type ClarityFn = (...args: unknown[]) => void;

export function clarityTag(key: string, value: string): void {
  if (typeof window === "undefined") return;
  const c = (window as unknown as { clarity?: ClarityFn }).clarity;
  c?.("set", key, value);
}
