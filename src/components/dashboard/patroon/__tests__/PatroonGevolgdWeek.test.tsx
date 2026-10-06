/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonGevolgdWeek from "@/components/dashboard/patroon/PatroonGevolgdWeek";
import { LEEG_KERNSTOF_PROFIEL } from "@/lib/account-kernstof-profiel";
import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";

vi.mock("@/lib/use-kernstof-normen", () => ({
  useKernstofProfiel: () => ({ ...LEEG_KERNSTOF_PROFIEL, streefwaarden: { ironMg: 20 } }),
}));

afterEach(cleanup);

describe("PatroonGevolgdWeek", () => {
  it("toont een eigen streefwaarde naast de norm", () => {
    const reeks = {
      veld: "ironMg",
      label: "IJzer",
      unit: "mg",
      norm: 11,
      punten: [{ gemiddeld: 10, aandeel: 10 / 11, dagen: 3 }],
    } as unknown as GevolgdeWeekReeks;
    render(<PatroonGevolgdWeek reeksen={[reeks]} />);
    expect(screen.getByText("eigen streefwaarde 20 mg/dag · 50%")).toBeTruthy();
    expect(screen.getByText("91%")).toBeTruthy();
  });
});
