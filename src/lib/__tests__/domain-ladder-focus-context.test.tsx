// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DomainLadderFocusProvider,
  useDomainLadderFocus,
  useLadderContextOpenRequest,
} from "@/lib/domain-ladder-focus-context";

function FocusProbe() {
  const { focus, setFocus, openNonce, requestOpen } = useDomainLadderFocus();
  return (
    <div>
      <span data-testid="nonce">{openNonce}</span>
      <span data-testid="layer">{focus?.layerId ?? "none"}</span>
      <button type="button" onClick={() => setFocus({ domain: "beweging", layerId: 2 })}>
        zet focus
      </button>
      <button type="button" onClick={() => requestOpen()}>
        vraag open
      </button>
    </div>
  );
}

function OpenRequestProbe({ onRequest }: { onRequest: () => void }) {
  const { setFocus, requestOpen } = useDomainLadderFocus();
  useLadderContextOpenRequest(onRequest);
  return (
    <div>
      <button type="button" onClick={() => setFocus({ domain: "beweging", layerId: 1 })}>
        zet focus
      </button>
      <button type="button" onClick={() => requestOpen()}>
        vraag open
      </button>
    </div>
  );
}

describe("DomainLadderFocus — tik opent, mount niet", () => {
  it("zet focus zonder de sheet-open-teller te verhogen", () => {
    render(
      <DomainLadderFocusProvider>
        <FocusProbe />
      </DomainLadderFocusProvider>,
    );
    expect(screen.getByTestId("nonce").textContent).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "zet focus" }));
    expect(screen.getByTestId("layer").textContent).toBe("2");
    expect(screen.getByTestId("nonce").textContent).toBe("0");
  });

  it("verhoogt de teller alleen bij requestOpen", () => {
    render(
      <DomainLadderFocusProvider>
        <FocusProbe />
      </DomainLadderFocusProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "vraag open" }));
    expect(screen.getByTestId("nonce").textContent).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "vraag open" }));
    expect(screen.getByTestId("nonce").textContent).toBe("2");
  });

  it("roept onRequest niet bij mount of bij setFocus", () => {
    const onRequest = vi.fn();
    render(
      <DomainLadderFocusProvider>
        <OpenRequestProbe onRequest={onRequest} />
      </DomainLadderFocusProvider>,
    );
    expect(onRequest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "zet focus" }));
    expect(onRequest).not.toHaveBeenCalled();
  });

  it("roept onRequest bij elke tik, ook op dezelfde laag opnieuw", () => {
    const onRequest = vi.fn();
    render(
      <DomainLadderFocusProvider>
        <OpenRequestProbe onRequest={onRequest} />
      </DomainLadderFocusProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "vraag open" }));
    fireEvent.click(screen.getByRole("button", { name: "vraag open" }));
    expect(onRequest).toHaveBeenCalledTimes(2);
  });
});
