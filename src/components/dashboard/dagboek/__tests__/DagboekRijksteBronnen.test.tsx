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

describe("DagboekRijksteBronnen voor een informatieve stof", () => {
  it("toont calcium met %ADH per portie", () => {
    render(<DagboekRijksteBronnen stof="calciumMg" onKies={vi.fn()} onVergelijk={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Rijkste bronnen van calcium" })).toBeTruthy();
    expect(screen.getAllByText(/% ADH$/).length).toBeGreaterThan(0);
  });
});
