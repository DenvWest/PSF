import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { newestPublicJpg, publicJpgForSlug } from "@/lib/public-jpg";

function publicPad(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

describe("newestPublicJpg", () => {
  it("kiest -v2 boven het basisbestand", () => {
    const src = newestPublicJpg("/images/blog/cortisol-en-slaap.jpg");
    expect(src).toBe("/images/blog/cortisol-en-slaap-v2.jpg");
    expect(existsSync(publicPad(src))).toBe(true);
  });

  it("houdt een pad zonder nieuwere versie", () => {
    const src = newestPublicJpg("/images/blog/categorie-slaap.jpg");
    expect(src).toBe("/images/blog/categorie-slaap.jpg");
  });

  it("vindt een kennisbank-cover via slug", () => {
    expect(publicJpgForSlug("/images/kennisbank", "epa-dha")).toBe(
      "/images/kennisbank/epa-dha-v2.jpg",
    );
  });
});
