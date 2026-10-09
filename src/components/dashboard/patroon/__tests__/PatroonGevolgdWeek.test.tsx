/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonGevolgdWeek from "@/components/dashboard/patroon/PatroonGevolgdWeek";
import { LEEG_KERNSTOF_PROFIEL } from "@/lib/account-kernstof-profiel";
import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";
import { STANDAARD_GEVOLGDE_NORMEN } from "@/lib/nutrition-normen";

vi.mock("@/lib/use-kernstof-normen", () => ({
  useKernstofProfiel: () => ({ ...LEEG_KERNSTOF_PROFIEL, streefwaarden: { ironMg: 20 } }),
  useGevolgdeNormen: () => STANDAARD_GEVOLGDE_NORMEN,
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

  it("noemt norm, doelgroep en bron, en opent de stof bij een tik", () => {
    const reeks = {
      veld: "calciumMg",
      label: "Calcium",
      unit: "mg",
      norm: 1000,
      punten: [{ gemiddeld: 500, aandeel: 0.5, dagen: 3 }],
    } as unknown as GevolgdeWeekReeks;
    const onOpen = vi.fn();
    render(<PatroonGevolgdWeek reeksen={[reeks]} onOpen={onOpen} />);
    expect(screen.getByText(/Gezondheidsraad 2018|NNR 2023|EFSA/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Calcium/ }));
    expect(onOpen).toHaveBeenCalledWith("calciumMg");
  });
});
