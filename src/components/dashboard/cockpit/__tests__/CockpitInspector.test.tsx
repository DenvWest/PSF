// @vitest-environment jsdom
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CockpitInspector from "@/components/dashboard/cockpit/CockpitInspector";
import { buildLadderInspectorCards } from "@/lib/cockpit-inspector";
import { DomainLadderFocusProvider, useDomainLadderFocus } from "@/lib/domain-ladder-focus-context";

const CARDS = buildLadderInspectorCards({
  layerId: 1,
  layerName: "Dagelijks bewegen",
  hasCheck: false,
  checkNoun: "beweegcheck",
  checkHref: "/intake/beweging?from=dashboard&kompas=beweging",
  chosen: [],
  canSetGoal: true,
});

function Harness({ showLayerChips }: { showLayerChips: boolean }) {
  const { setFocus } = useDomainLadderFocus();
  useEffect(() => {
    setFocus({ domain: "beweging", layerId: 1 });
  }, [setFocus]);
  return <CockpitInspector cards={CARDS} showLayerChips={showLayerChips} />;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
  );
});

describe("CockpitInspector — check-context", () => {
  it("toont P-chips alleen als showLayerChips aan staat", async () => {
    const { rerender } = render(
      <DomainLadderFocusProvider>
        <Harness showLayerChips={false} />
      </DomainLadderFocusProvider>,
    );
    expect(screen.queryByRole("group", { name: "Andere prioriteit lezen" })).toBeNull();

    rerender(
      <DomainLadderFocusProvider>
        <Harness showLayerChips />
      </DomainLadderFocusProvider>,
    );
    expect(await screen.findByRole("group", { name: "Andere prioriteit lezen" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Prioriteit 1: Dagelijks bewegen" })).not.toBeNull();
  });

  it("wisselt de laag via een chip, zonder een tweede ladder te worden", async () => {
    render(
      <DomainLadderFocusProvider>
        <Harness showLayerChips />
      </DomainLadderFocusProvider>,
    );
    const p2 = await screen.findByRole("button", { name: "Prioriteit 2: Kracht + basisconditie" });
    fireEvent.click(p2);
    expect(p2.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Prioriteit 1: Dagelijks bewegen" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("toont de check-deur zonder aannames als er geen check is", () => {
    render(
      <DomainLadderFocusProvider>
        <Harness showLayerChips={false} />
      </DomainLadderFocusProvider>,
    );
    expect(screen.queryByText("Nog geen beweegcheck")).not.toBeNull();
    expect(
      screen.getByRole("link", { name: /Doe de beweegcheck/ }).getAttribute("href"),
    ).toBe("/intake/beweging?from=dashboard&kompas=beweging");
  });
});
