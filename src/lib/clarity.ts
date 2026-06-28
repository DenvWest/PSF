type ClarityFn = (...args: unknown[]) => void;

export function callClarity(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const c = (window as unknown as { clarity?: ClarityFn }).clarity;
  c?.(...args);
}

export function clarityTag(key: string, value: string): void {
  callClarity("set", key, value);
}
