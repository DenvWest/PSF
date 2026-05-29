import { describe, expect, it } from "vitest";
import { sanitizeMarkdownText } from "@/lib/render-safe-markdown";

describe("sanitizeMarkdownText", () => {
  it("strips raw HTML tags", () => {
    expect(sanitizeMarkdownText('Hallo <script>alert("x")</script>')).toBe(
      'Hallo alert("x")',
    );
  });

  it("trims whitespace", () => {
    expect(sanitizeMarkdownText("  tekst  ")).toBe("tekst");
  });
});
