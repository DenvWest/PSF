// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NextStepBlock from "@/components/content/NextStepBlock";
import { nextStepForMetadata } from "@/lib/content-graph/next-step";

const emit = vi.hoisted(() => vi.fn());
const ga4 = vi.hoisted(() => vi.fn());

vi.mock("@/lib/intake-events-client", () => ({
  emitIntakeClientEvent: emit,
}));
vi.mock("@/lib/ga4", () => ({ trackEvent: ga4, GA4_EVENTS: {} }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

afterEach(() => {
  emit.mockClear();
  ga4.mockClear();
});

describe("NextStepBlock", () => {
  const step = nextStepForMetadata({ theme: "sleep", nutrients: ["magnesium"] });

  it("toont precies één primaire knop", () => {
    render(<NextStepBlock step={step} node="magnesium-en-slaap" nodeType="blog" />);
    const links = screen.getAllByRole("link");
    // Eén knop + één secundaire tekstlink — nooit twee knoppen naast elkaar.
    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute("href")).toBe("/intake");
    expect(links[1]?.getAttribute("href")).toBe("/intake/leefstijl");
  });

  it("meldt zijn vertoning één keer", () => {
    const { rerender } = render(
      <NextStepBlock step={step} node="magnesium-en-slaap" nodeType="blog" />,
    );
    rerender(<NextStepBlock step={step} node="magnesium-en-slaap" nodeType="blog" />);
    const shown = emit.mock.calls.filter((c) => c[0] === "content.next_step_shown");
    expect(shown).toHaveLength(1);
    expect(shown[0]?.[1]).toMatchObject({
      node: "magnesium-en-slaap",
      node_type: "blog",
      step_kind: "check",
      target: "voeding",
    });
  });

  it("meldt de klik met de positie erbij", () => {
    render(<NextStepBlock step={step} node="magnesium-en-slaap" nodeType="blog" />);
    fireEvent.click(screen.getAllByRole("link")[0]!);
    const klik = emit.mock.calls.find((c) => c[0] === "content.next_step_clicked");
    expect(klik?.[1]).toMatchObject({ target: "voeding", positie: "primary" });

    fireEvent.click(screen.getAllByRole("link")[1]!);
    const tweede = emit.mock.calls.filter(
      (c) => c[0] === "content.next_step_clicked",
    )[1];
    expect(tweede?.[1]).toMatchObject({ target: "leefstijl", positie: "secondary" });
  });

  it("laat de secundaire regel weg als die er niet is", () => {
    const alleen = nextStepForMetadata({ checkOverride: "leefstijl" });
    render(<NextStepBlock step={alleen} node="energie-na-40" nodeType="pillar" />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("noemt bij een proxy-stof de bronnen, niet een tekort", () => {
    render(<NextStepBlock step={step} node="magnesium-en-slaap" nodeType="blog" />);
    expect(screen.getByText(/bronnen waar dit in zit/i)).toBeTruthy();
  });
});
