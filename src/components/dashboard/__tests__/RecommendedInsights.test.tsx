// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";

describe("RecommendedInsights", () => {
  it("toont achtergrondartikelen voor een pijler met content", () => {
    render(<RecommendedInsights pillarId="slaap" />);
    expect(screen.getByText("Achtergrond bij slaap")).toBeTruthy();
    expect(screen.getByText(/Alles over slaap/)).toBeTruthy();
  });
});
