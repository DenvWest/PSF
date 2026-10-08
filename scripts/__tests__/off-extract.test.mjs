import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("off-extract.py", () => {
  it("slaagt voor de Python-unittests (eenheden, geen geschatte micro's)", () => {
    const uit = execFileSync("python3", ["-I", "scripts/__tests__/off_extract_test.py"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    expect(uit).toBe("");
  });
});
