import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../../..");
const srcRoot = path.join(repoRoot, "src");

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry);
    const stat = statSync(absPath);
    if (stat.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      files.push(...listSourceFiles(absPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) {
      files.push(absPath);
    }
  }
  return files;
}

describe("jsonld-no-raw-stringify", () => {
  it("gebruikt jsonLdScript() ipv JSON.stringify() in elke application/ld+json-script", () => {
    const offenders: string[] = [];
    for (const absPath of listSourceFiles(srcRoot)) {
      const source = readFileSync(absPath, "utf8");
      if (/dangerouslySetInnerHTML=\{\{\s*__html:\s*JSON\.stringify\(/.test(source)) {
        offenders.push(path.relative(repoRoot, absPath));
      }
    }
    expect(offenders).toEqual([]);
  });
});
