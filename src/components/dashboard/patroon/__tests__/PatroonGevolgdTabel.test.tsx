/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonGevolgdTabel from "@/components/dashboard/patroon/PatroonGevolgdTabel";
import type { GevolgdeReeks } from "@/lib/nutrition-gevolgde-vensters";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/components/dashboard/doelen/GevolgdeStoffenKiezer", () => ({
  default: () => <div>kiezer</div>,
}));

import { trackEvent } from "@/lib/ga4";

const CALCIUM: GevolgdeReeks = {
  veld: "calciumMg",
  label: "Calcium",
  unit: "mg",
  ri: 800,
  vensters: [
    { dagen_terug: 1, gemiddeld: 400, aandeel: 0.5, dagen: 1 },
    { dagen_terug: 7, gemiddeld: 400, aandeel: 0.5, dagen: 1 },
    { dagen_terug: 14, gemiddeld: 600, aandeel: 0.75, dagen: 2 },
    { dagen_terug: 30, gemiddeld: null, aandeel: null, dagen: 0 },
  ],
};

afterEach(cleanup);

describe("PatroonGevolgdTabel", () => {
  it("toont het deel van de RI per venster, zonder vinkje", () => {
    render(<PatroonGevolgdTabel reeksen={[CALCIUM]} zelfde={new Set([7])} />);
    expect(screen.getByText("RI 800 mg")).toBeTruthy();
    expect(screen.getAllByText("50%")).toHaveLength(2);
    expect(screen.getByText("75%")).toBeTruthy();
    expect(screen.queryByText(/✓/)).toBeNull();
  });

  it("opent de kiezer achter de + en meet dat", () => {
    render(<PatroonGevolgdTabel reeksen={[]} zelfde={new Set()} />);
    fireEvent.click(screen.getByRole("button", { name: /Volg ook/ }));
    expect(screen.getByText("kiezer")).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith("nutrition_patroon_gevolgd_toevoegen_open", { gevolgd: 0 });
  });
});
