import { describe, it, expect } from "vitest";
import { nurtureContent } from "@/data/nurture-content";

// BEWUST NIET opgenomen (false-positives op legitieme taal):
//   normaal/normale  → EFSA "draagt bij tot de normale werking ..."
//   verhoogt/verhoogd → EFSA creatine "verhoogt de fysieke prestatie"
//   gezond            → "binnen een gezonde leefstijl"
//   klachten          → disclaimer "bij klachten: raadpleeg je zorgverlener"
const FORBIDDEN = [
  "diagnose",
  "stoornis",
  "aandoening",
  "ziekte",
  "symptoom",
  "tekort",
  "verstoor",
  "afwijk",
  "geneest",
  "genezen",
  "geneesmiddel",
  "behandel",
  "ongezond",
];

interface CollectedString {
  path: string;
  text: string;
}

function collectStrings(
  value: unknown,
  path: string,
  out: CollectedString[],
): void {
  if (typeof value === "string") {
    out.push({ path, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStrings(item, `${path}[${index}]`, out);
    });
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, val] of Object.entries(value)) {
      if (key === "url") continue;
      collectStrings(val, path ? `${path}.${key}` : key, out);
    }
  }
}

describe("nurtureContent — compliance", () => {
  const collected: CollectedString[] = [];
  collectStrings(nurtureContent, "nurtureContent", collected);

  it("verzamelt strings uit nurtureContent", () => {
    expect(collected.length).toBeGreaterThan(0);
  });

  it("bevat geen verboden woorden", () => {
    for (const { path, text } of collected) {
      const lower = text.toLowerCase();
      for (const word of FORBIDDEN) {
        expect(
          lower.includes(word),
          `${path}: "${text}" bevat "${word}"`,
        ).toBe(false);
      }
    }
  });
});
