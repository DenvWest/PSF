// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DomainLadderFocusProvider,
  useLadderLayerSelection,
} from "@/lib/domain-ladder-focus-context";

function Probe({ recommended }: { recommended: number | null }) {
  const { activeLayerId, selectLayer } = useLadderLayerSelection("slaap", recommended);
  return (
    <div>
      <span data-testid="active">{activeLayerId}</span>
      <button type="button" onClick={() => selectLayer(4)}>
        Kies 4
      </button>
    </div>
  );
}

describe("useLadderLayerSelection", () => {
  it("opent op de aanbevolen laag en laat een latere keuze staan", () => {
    render(
      <DomainLadderFocusProvider>
        <Probe recommended={2} />
      </DomainLadderFocusProvider>,
    );
    expect(screen.getByTestId("active").textContent).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Kies 4" }));
    expect(screen.getByTestId("active").textContent).toBe("4");
  });

  it("valt zonder aanbeveling terug op prioriteit 1", () => {
    render(
      <DomainLadderFocusProvider>
        <Probe recommended={null} />
      </DomainLadderFocusProvider>,
    );
    expect(screen.getByTestId("active").textContent).toBe("1");
  });
});
