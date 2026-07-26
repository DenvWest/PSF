import { describe, expect, it } from "vitest";
import { formatFocusLabel } from "@/lib/focus-label";

describe("formatFocusLabel", () => {
  it("formats pillar label with Focus prefix", () => {
    expect(formatFocusLabel("Beweging")).toBe("Focus: Beweging");
    expect(formatFocusLabel("Slaap")).toBe("Focus: Slaap");
  });
});
