// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CockpitInspector from "@/components/dashboard/cockpit/CockpitInspector";

describe("CockpitInspector — titel en optie-lead", () => {
  it("draagt de aangeklikte prioriteit als kop in plaats van 'Context bij vandaag'", () => {
    render(
      <CockpitInspector
        title="Prioriteit 2"
        cards={[]}
        lead={<p>Opties op deze laag</p>}
      />,
    );
    expect(screen.queryByText("Prioriteit 2")).not.toBeNull();
    expect(screen.queryByText("Context bij vandaag")).toBeNull();
    expect(screen.queryByText("Opties op deze laag")).not.toBeNull();
  });

  it("valt terug op 'Context bij vandaag' zonder titel", () => {
    render(
      <CockpitInspector
        cards={[
          {
            kind: "why",
            accent: "neutral",
            kicker: "Waarom deze stap",
            title: "Je stap van vandaag",
            body: "Kies je dagkeuze.",
          },
        ]}
      />,
    );
    expect(screen.queryByText("Context bij vandaag")).not.toBeNull();
  });
});
