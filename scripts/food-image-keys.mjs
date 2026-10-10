#!/usr/bin/env node
/**
 * Schrijft src/data/nutrition/food-image-keys.ts uit public/images/voedingsmiddelen/.
 * Draai opnieuw na `food-image-download.py`; een test bewaakt dat de lijst klopt.
 */
import { readdirSync, writeFileSync } from "node:fs";

const keys = readdirSync("public/images/voedingsmiddelen")
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => f.slice(0, -4))
  .sort();

const body = `// Gegenereerd door scripts/food-image-keys.mjs — niet met de hand wijzigen.
export const FOOD_IMAGE_KEYS: ReadonlySet<string> = new Set([
${keys.map((k) => `  "${k}",`).join("\n")}
]);
`;
writeFileSync("src/data/nutrition/food-image-keys.ts", body);
console.log(`${keys.length} foto's`);
