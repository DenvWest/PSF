// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StressScreen from "@/components/dashboard/StressScreen";
import { STRESS_LIFESTYLE_FIRST_REASON } from "@/data/domain-product-stance";
import type { DashboardModel } from "@/types/dashboard";

// KompasDomainGauge → VitalityGauge leest prefers-reduced-motion; jsdom kent
// matchMedia niet standaard.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
});

function model(): DashboardModel {
  return {
    scores: { stress: 47 },
    answers: {},
    domainScores: { stress_score: 47 },
  } as unknown as DashboardModel;
}

describe("StressScreen — geen oordeel op de dagelijkse surface", () => {
  it("toont nooit de geen-schap-uitleg hier — die hoort op Voortgang", () => {
    render(<StressScreen model={model()} />);
    expect(screen.queryByText("Supplementen — ons oordeel")).toBeNull();
    expect(screen.queryByText(STRESS_LIFESTYLE_FIRST_REASON)).toBeNull();
  });

  it("draagt één label-only deur naar Voortgang, geen productnaam", () => {
    render(<StressScreen model={model()} />);
    const deur = screen.getByText("Bekijk je oordeel op Voortgang");
    const href = deur.closest("a")?.getAttribute("href") ?? "";
    expect(href).toContain("tab=voortgang");
    expect(href).toContain("domein=stress");
  });
});
