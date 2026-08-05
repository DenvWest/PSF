// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AccountFocusPicker from "@/components/account/AccountFocusPicker";

afterEach(() => {
  cleanup();
});

describe("AccountFocusPicker", () => {
  it("markeert het advies-domein en toont 'Volg advies' als je iets anders koos", () => {
    const onAcceptEngine = vi.fn();
    render(
      <AccountFocusPicker
        pillarId="beweging"
        enginePillarId="slaap"
        busy={false}
        onSelect={vi.fn()}
        onAcceptEngine={onAcceptEngine}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("advies")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Volg advies/ }));
    expect(onAcceptEngine).toHaveBeenCalledOnce();
  });

  it("toont 'Terug naar advies' zodra er een eigen keuze staat, ook als die (nog) het advies volgt", () => {
    const onReset = vi.fn();
    render(
      <AccountFocusPicker
        pillarId="slaap"
        enginePillarId="slaap"
        busy={false}
        onSelect={vi.fn()}
        onAcceptEngine={vi.fn()}
        onReset={onReset}
      />,
    );

    expect(screen.queryByRole("button", { name: /Volg advies/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Terug naar advies" }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("zonder eigen keuze (pillarId null) geen 'Terug naar advies' — er is niets om te wissen", () => {
    render(
      <AccountFocusPicker
        pillarId={null}
        enginePillarId="slaap"
        busy={false}
        onSelect={vi.fn()}
        onAcceptEngine={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Terug naar advies" })).toBeNull();
  });

  it("zonder advies (geen scores) geen badge en geen 'Volg advies'-knop, wel gewoon kiezen", () => {
    const onSelect = vi.fn();
    render(
      <AccountFocusPicker
        pillarId={null}
        enginePillarId={null}
        busy={false}
        onSelect={onSelect}
        onAcceptEngine={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.queryByText("advies")).toBeNull();
    expect(screen.queryByRole("button", { name: /Volg advies/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Stress" }));
    expect(onSelect).toHaveBeenCalledWith("stress");
  });

  it("busy blokkeert de knoppen", () => {
    render(
      <AccountFocusPicker
        pillarId="beweging"
        enginePillarId="slaap"
        busy
        onSelect={vi.fn()}
        onAcceptEngine={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const stressButton = screen.getByRole("button", { name: "Stress" }) as HTMLButtonElement;
    expect(stressButton.disabled).toBe(true);
  });
});
