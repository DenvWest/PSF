/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";

const NEVO = { bron: "nevo", bronId: "1590", snapshotDatum: "2025/9.0" } as const;
const OFF = { bron: "off", bronId: "8710400123456", snapshotDatum: "2026-10-01" } as const;

afterEach(cleanup);

describe("SupermarktBronRegel met NEVO", () => {
  it("noemt bij weergegeven waarden bron, versie en plaats", () => {
    render(<SupermarktBronRegel producten={[NEVO]} />);
    expect(screen.getByText("NEVO-online versie 2025/9.0, RIVM, Bilthoven")).toBeTruthy();
  });

  it("gebruikt bij berekende uitvoer de 'Gebaseerd op'-tekst", () => {
    render(<SupermarktBronRegel producten={[NEVO]} berekend />);
    expect(screen.getByText("Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven")).toBeTruthy();
  });

  it("voegt 'en andere gegevens' toe als ook Open Food Facts meetelt", () => {
    render(<SupermarktBronRegel producten={[NEVO, OFF]} berekend />);
    expect(screen.getByText(/en andere gegevens/)).toBeTruthy();
    expect(screen.getByText(/Open Food Facts/)).toBeTruthy();
  });

  it("laat Open Food Facts zijn eigen ODbL-vermelding houden", () => {
    render(<SupermarktBronRegel producten={[OFF]} berekend />);
    expect(screen.getByText(/Open Database License/)).toBeTruthy();
  });
});
