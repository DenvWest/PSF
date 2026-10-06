/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DagboekProductDetail from "@/components/dashboard/dagboek/DagboekProductDetail";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ producten: [] }), { status: 200 }))));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const item = { moment: "ontbijt", key: "havermout", grams: 50 } as DagboekItem;

describe("DagboekProductDetail", () => {
  it("verwijdert pas na bevestiging, en × laat het product staan", () => {
    const onVerwijder = vi.fn();
    render(<DagboekProductDetail item={item} onTerug={vi.fn()} onVerwijder={onVerwijder} />);

    fireEvent.click(screen.getByRole("button", { name: "Verwijder uit dagboek" }));
    fireEvent.click(screen.getByRole("button", { name: "Nee, laten staan" }));
    expect(onVerwijder).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Verwijder uit dagboek" }));
    fireEvent.click(screen.getByRole("button", { name: "Ja, verwijder uit dagboek" }));
    expect(onVerwijder).toHaveBeenCalledWith(item);
  });
});
