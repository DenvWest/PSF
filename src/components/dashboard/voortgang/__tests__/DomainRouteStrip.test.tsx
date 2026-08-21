// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DomainRouteStrip from "@/components/dashboard/voortgang/DomainRouteStrip";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

describe("DomainRouteStrip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current node without link", () => {
    render(
      <DomainRouteStrip
        domain="beweging"
        surface="test"
        nodes={[{ key: "voortgang", label: "Voortgang", sublabel: "Hier", current: true }]}
      />,
    );
    expect(screen.getByText("Voortgang")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("tracks click on href node", () => {
    render(
      <DomainRouteStrip
        domain="beweging"
        surface="test"
        nodes={[
          { key: "leefstijlcheck", label: "Leefstijlcheck", sublabel: "3 min", href: "/intake/beweging" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: /Leefstijlcheck/i }));
    expect(trackEvent).toHaveBeenCalledWith("voortgang_route_click", {
      domain: "beweging",
      target: "leefstijlcheck",
      surface: "test",
    });
    expect(clarityTag).toHaveBeenCalledWith("voortgang_route_click", "beweging:leefstijlcheck");
  });

  it("tracks click on button node", () => {
    const onClick = vi.fn();
    render(
      <DomainRouteStrip
        domain="beweging"
        surface="test"
        nodes={[
          { key: "kompas", label: "Kompas", sublabel: "Kiest", onClick },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Kompas/i }));
    expect(onClick).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith("voortgang_route_click", {
      domain: "beweging",
      target: "kompas",
      surface: "test",
    });
  });
});
