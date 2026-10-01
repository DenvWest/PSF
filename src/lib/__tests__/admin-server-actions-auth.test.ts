import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");
const srcRoot = path.join(repoRoot, "src");

function listTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry);
    const stat = statSync(absPath);
    if (stat.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      files.push(...listTsFiles(absPath));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      files.push(absPath);
    }
  }
  return files;
}

function findUseServerFiles(): string[] {
  return listTsFiles(srcRoot).filter((absPath) => {
    const firstLine = readFileSync(absPath, "utf8").split("\n", 1)[0]?.trim();
    return firstLine === '"use server";';
  });
}

function exportedActionNames(source: string): string[] {
  const matches = source.matchAll(/^export async function (\w+)\(/gm);
  return [...matches].map((m) => m[1]);
}

describe("admin-server-actions-auth", () => {
  const useServerFiles = findUseServerFiles();

  it("vindt minstens de bekende admin-actionbestanden", () => {
    // Regressiewacht: als dit aantal daalt, is er iets geraakt in de
    // "use server"-detectie zelf (bijv. het matchpatroon).
    expect(useServerFiles.length).toBeGreaterThanOrEqual(16);
  });

  it.each(useServerFiles.map((file) => [path.relative(repoRoot, file), file] as const))(
    "%s: importeert requireAdmin en roept het aan in elke exported action",
    (_relPath, absPath) => {
      const source = readFileSync(absPath, "utf8");
      const actions = exportedActionNames(source);
      if (actions.length === 0) return;

      expect(source).toContain('import { requireAdmin } from "@/lib/admin-auth"');

      const bodies = source.split(/^export async function \w+\(/m).slice(1);
      expect(bodies.length).toBe(actions.length);
      bodies.forEach((body, i) => {
        expect(body, `${actions[i]} mist await requireAdmin()`).toContain("await requireAdmin();");
      });
    },
  );
});
