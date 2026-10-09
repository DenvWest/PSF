/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekRijksteBronnen from "@/components/dashboard/dagboek/DagboekRijksteBronnen";

afterEach(cleanup);

describe("DagboekRijksteBronnen", () => {
  it("voegt een bron toe bij een tik", () => {
    const onKies = vi.fn();
    render(<DagboekRijksteBronnen stof="magnesium" onKies={onKies} onVergelijk={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("button", { name: /^Voeg .* toe$/ })[0]);
    expect(onKies).toHaveBeenCalledOnce();
  });

  it("stuurt de top 3 naar de vergelijking", () => {
    const onVergelijk = vi.fn();
    render(<DagboekRijksteBronnen stof="magnesium" onKies={vi.fn()} onVergelijk={onVergelijk} />);
    fireEvent.click(screen.getByRole("button", { name: "Vergelijk top 3" }));
    expect(onVergelijk.mock.calls[0][0]).toHaveLength(3);
  });

  it("wisselt naar per 100 kcal", () => {
    render(<DagboekRijksteBronnen stof="magnesium" onKies={vi.fn()} onVergelijk={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: "Per 100 kcal" }));
    expect(screen.getAllByText("per 100 kcal").length).toBeGreaterThan(0);
  });
});

describe("DagboekRijksteBronnen verder kijken", () => {
  const rijen = () => screen.getAllByRole("button", { name: /^Voeg .* toe$/ }).length;

  it("toont eerst 10 en breidt uit met Toon meer", () => {
    render(<DagboekRijksteBronnen stof="magnesium" onKies={vi.fn()} onVergelijk={vi.fn()} />);
    expect(rijen()).toBe(10);
    fireEvent.click(screen.getByRole("button", { name: /Toon \d+ meer/ }));
    expect(rijen()).toBeGreaterThan(10);
  });

  it("zoekt binnen alle bronnen, ook buiten de top 10", () => {
    render(<DagboekRijksteBronnen stof="magnesium" onKies={vi.fn()} onVergelijk={vi.fn()} />);
    fireEvent.change(screen.getByRole("searchbox", { name: /Zoek een voedingsmiddel met magnesium/ }), {
      target: { value: "pompoen" },
    });
    expect(rijen()).toBeGreaterThan(0);
    expect(rijen()).toBeLessThan(10);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzzzqq" } });
    expect(screen.getByText(/Niets gevonden/)).toBeTruthy();
  });

  it("filtert op voedselgroep en wist het filter bij nogmaals tikken", () => {
    render(<DagboekRijksteBronnen stof="magnesium" onKies={vi.fn()} onVergelijk={vi.fn()} />);
    const chip = screen.getByRole("button", { name: "Noten & zaden" });
    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    expect(rijen()).toBeGreaterThan(0);
    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("DagboekRijksteBronnen voor een informatieve stof", () => {
  it("toont calcium met %ADH per portie", () => {
    render(<DagboekRijksteBronnen stof="calciumMg" onKies={vi.fn()} onVergelijk={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Rijkste bronnen van calcium" })).toBeTruthy();
    expect(screen.getAllByText(/% ADH$/).length).toBeGreaterThan(0);
  });
});
