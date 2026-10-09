/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PatroonPeriodeKiezer from "@/components/dashboard/patroon/PatroonPeriodeKiezer";

afterEach(cleanup);

describe("PatroonPeriodeKiezer", () => {
  it("kiest met twee tikken op de kalender een reeks, in de goede volgorde", () => {
    const onKies = vi.fn();
    render(
      <PatroonPeriodeKiezer
        keuze="7"
        periode={{ van: "2026-09-29", tot: "2026-10-05" }}
        vandaag="2026-10-05"
        geregistreerd={new Set()}
        onKies={onKies}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kies" }));
    fireEvent.click(screen.getByRole("button", { name: /^\S+ 3 oktober$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^\S+ 1 oktober$/ }));

    expect(onKies).toHaveBeenNthCalledWith(1, "eigen", { van: "2026-10-03", tot: "2026-10-03" });
    expect(onKies).toHaveBeenNthCalledWith(2, "eigen", { van: "2026-10-01", tot: "2026-10-03" });
  });

  it("laat geen dag in de toekomst kiezen", () => {
    render(
      <PatroonPeriodeKiezer
        keuze="7"
        periode={{ van: "2026-09-29", tot: "2026-10-05" }}
        vandaag="2026-10-05"
        geregistreerd={new Set()}
        onKies={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kies" }));
    expect((screen.getByRole("button", { name: /^\S+ 6 oktober$/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
