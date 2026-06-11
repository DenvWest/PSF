// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { clarityTag } from "@/lib/clarity";

describe("clarityTag", () => {
  afterEach(() => {
    delete (window as unknown as { clarity?: unknown }).clarity;
  });

  it("is a no-op when window.clarity is absent", () => {
    expect(() => clarityTag("nutrition_flow", "started")).not.toThrow();
  });

  it("calls window.clarity with set, key, value", () => {
    const mock = vi.fn();
    (window as unknown as { clarity: ReturnType<typeof vi.fn> }).clarity = mock;
    clarityTag("nutrition_flow", "completed");
    expect(mock).toHaveBeenCalledWith("set", "nutrition_flow", "completed");
  });
});
