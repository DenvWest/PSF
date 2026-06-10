// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeltaRow } from "@/components/report/DeltaRow";

describe("DeltaRow", () => {
  it("positieve delta toont pijl omhoog en 'verbeterd'", () => {
    render(<DeltaRow label="Slaap" delta={8} />);
    expect(screen.getByText("▲")).toBeTruthy();
    expect(screen.getByText("+8 punt")).toBeTruthy();
    expect(screen.getByText("verbeterd")).toBeTruthy();
  });

  it("negatieve delta toont pijl omlaag en 'aandacht'", () => {
    render(<DeltaRow label="Stress" delta={-3} />);
    expect(screen.getByText("▼")).toBeTruthy();
    expect(screen.getByText("-3 punt")).toBeTruthy();
    expect(screen.getByText("aandacht")).toBeTruthy();
  });

  it("nul-delta toont neutraal en 'gelijk'", () => {
    render(<DeltaRow label="Voeding" delta={0} />);
    expect(screen.getByText("▬")).toBeTruthy();
    expect(screen.getByText("±0 punt")).toBeTruthy();
    expect(screen.getByText("gelijk")).toBeTruthy();
  });

  it("bevat geen supplement-attributie", () => {
    const { container } = render(<DeltaRow label="Energie" delta={10} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/werkte|dankzij|door magnesium|door ashwagandha/i);
  });
});
