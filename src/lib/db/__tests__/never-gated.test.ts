import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ENTITLEMENTS_IMPORT =
  /(?:@\/lib\/db\/entitlements|lib\/db\/entitlements)/;

const NEVER_GATED_PATHS = [
  "src/app/api/account/remeasure",
  "src/app/api/account/daily-log/route.ts",
  "src/lib/nurture-cron.ts",
  "src/lib/intake-reminder-cron.ts",
  "src/lib/intake-retention.ts",
  "src/app/api/cron/retention/route.ts",
  "src/app/api/cron/nurture/route.ts",
  "src/app/api/send-reminders/route.ts",
  "src/app/api/affiliate",
] as const;

function collectSourceFiles(rootRelativePath: string): string[] {
  const absolutePath = join(process.cwd(), rootRelativePath);
  const stats = statSync(absolutePath);

  if (stats.isFile()) {
    return [rootRelativePath];
  }

  const files: string[] = [];
  for (const entry of readdirSync(absolutePath)) {
    const childPath = join(rootRelativePath, entry);
    const childStats = statSync(join(process.cwd(), childPath));
    if (childStats.isDirectory()) {
      files.push(...collectSourceFiles(childPath));
      continue;
    }
    if (childPath.endsWith(".ts") || childPath.endsWith(".tsx")) {
      files.push(childPath);
    }
  }
  return files;
}

describe("NEVER_GATED entitlements import guard", () => {
  it("gratis lus routes en crons importeren geen entitlements-module", () => {
    const violations: string[] = [];

    for (const path of NEVER_GATED_PATHS) {
      for (const file of collectSourceFiles(path)) {
        const source = readFileSync(join(process.cwd(), file), "utf8");
        if (ENTITLEMENTS_IMPORT.test(source)) {
          violations.push(file);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
