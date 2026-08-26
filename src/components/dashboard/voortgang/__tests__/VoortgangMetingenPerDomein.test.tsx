// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import VoortgangMetingenPerDomein from "@/components/dashboard/voortgang/VoortgangMetingenPerDomein";
import type {
  DashboardData,
  DomainMeasurement,
  DomainMeasurementValue,
} from "@/types/dashboard";

function value(
  key: string,
  label: string,
  answerLabel: string,
  level: number | null,
  benchmarkLabel: string | null = null,
  scale: DomainMeasurementValue["scale"] = "zelfrapportage",
): DomainMeasurementValue {
  return { key, label, answerLabel, benchmarkLabel, level, levelMax: 3, scale };
}

function measurement(overrides: Partial<DomainMeasurement>): DomainMeasurement {
  const base: DomainMeasurement = {
    id: "slaap-1",
    dateIso: "2026-08-01",
    dateLabel: "1 aug 2026",
    daysAgo: 10,
    score: 60,
    source: "checkin",
    values: [],
    ...overrides,
  };
  return { ...base, id: overrides.id ?? `slaap-${base.dateIso}-${base.source}` };
}

function buildData(
  domainMeasurements: DashboardData["domainMeasurements"],
): DashboardData {
  return { domainMeasurements } as DashboardData;
}

/** Oudste eerst — zo levert `account-dashboard` de reeks aan. */
const SLAAP_REEKS: DomainMeasurement[] = [
  measurement({
    dateIso: "2026-07-10",
    dateLabel: "10 jul 2026",
    daysAgo: 32,
    score: 52,
    source: "intake",
    values: [],
  }),
  measurement({
    dateIso: "2026-08-01",
    dateLabel: "1 aug 2026",
    daysAgo: 10,
    score: 58,
    values: [
      value("inslapen", "Inslaaptijd", "20-30 minuten", 1, "Onder 20 min is gangbaar", "richtlijn"),
      value("wakker", "Nachtelijk wakker", "1x per nacht", 2),
    ],
  }),
  measurement({
    dateIso: "2026-08-20",
    dateLabel: "20 aug 2026",
    daysAgo: 5,
    score: 63,
    values: [
      value("inslapen", "Inslaaptijd", "10-20 minuten", 3, null, "richtlijn"),
      value("wakker", "Nachtelijk wakker", "Zelden", 3),
    ],
  }),
];

/**
 * Voeding meet antwoorden, geen standen: elke waarde komt zonder `level`
 * binnen, ook als twee momenten dezelfde vraag dragen.
 */
const VOEDING_REEKS: DomainMeasurement[] = [
  measurement({
    id: "voeding-1",
    dateIso: "2026-07-15",
    dateLabel: "15 jul 2026",
    daysAgo: 26,
    score: 55,
    source: "nutrition_log",
    values: [value("oilyFish", "Vette vis", "Nooit", null)],
  }),
  measurement({
    id: "voeding-2",
    dateIso: "2026-08-20",
    dateLabel: "20 aug 2026",
    daysAgo: 5,
    score: 61,
    source: "nutrition_log",
    values: [value("oilyFish", "Vette vis", "2× per week", null)],
  }),
];

function renderPanel(props: Partial<Parameters<typeof VoortgangMetingenPerDomein>[0]> = {}) {
  const onSelectDomain = vi.fn();
  const result = render(
    <VoortgangMetingenPerDomein
      data={buildData({ slaap: SLAAP_REEKS })}
      selectedDomain="slaap"
      onSelectDomain={onSelectDomain}
      {...props}
    />,
  );
  return { ...result, onSelectDomain };
}

describe("VoortgangMetingenPerDomein — tabel", () => {
  it("shows every moment as a column, for volledigheid", () => {
    renderPanel();
    expect(screen.getAllByRole("columnheader").map((node) => node.textContent)).toEqual([
      "20 aug",
      "1 aug",
      "10 jul",
    ]);
    expect(screen.queryByRole("button", { name: /Toon alle/ })).toBeNull();
  });

  it("puts the measured values vertical and the moments horizontal", () => {
    renderPanel();
    const rowHeaders = screen.getAllByRole("rowheader").map((node) => node.textContent);
    expect(rowHeaders).toEqual(["Domeinscore", "Inslaaptijd", "Nachtelijk wakker"]);

    // Nieuw links, ouder naar rechts.
    const columnHeaders = screen.getAllByRole("columnheader").map((node) => node.textContent);
    expect(columnHeaders).toEqual(["20 aug", "1 aug", "10 jul"]);
  });

  it("carries the domain score as its own row", () => {
    renderPanel();
    const scoreRow = screen.getAllByRole("row")[0];
    expect(within(scoreRow).getByText("52")).toBeTruthy();
    expect(within(scoreRow).getByText("58")).toBeTruthy();
    expect(within(scoreRow).getByText("63")).toBeTruthy();
  });

  it("leaves a gap where a moment did not measure that value", () => {
    renderPanel();
    // De leefstijlcheck-kolom draagt geen losse waarden: twee rijen, twee gaten.
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("reads out the newest moment by default and follows a date click", () => {
    renderPanel();
    expect(screen.getByText("20 aug 2026")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "1 aug" }));
    expect(screen.getByText("1 aug 2026")).toBeTruthy();
    expect(screen.getByText(/10 dagen geleden/)).toBeTruthy();
  });

  it("keeps two checks on one day apart", () => {
    const zelfdeDag: DomainMeasurement[] = [
      measurement({
        id: "slaap-1754000000000",
        dateIso: "2026-08-09",
        dateLabel: "9 aug 2026",
        score: 55,
        values: [value("inslapen", "Inslaaptijd", "30-45 minuten", 1)],
      }),
      measurement({
        id: "slaap-1754030000000",
        dateIso: "2026-08-09",
        dateLabel: "9 aug 2026",
        score: 59,
        values: [value("inslapen", "Inslaaptijd", "15-30 minuten", 2)],
      }),
    ];
    renderPanel({ data: buildData({ slaap: zelfdeDag }) });

    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByText("30-45 minuten")).toBeTruthy();
    expect(screen.getByText("15-30 minuten")).toBeTruthy();
  });
});

describe("VoortgangMetingenPerDomein — grafiek", () => {
  it("plots one measured value at a time", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));

    expect(screen.getByRole("img", { name: /Domeinscore over 3 meetmomenten/ })).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Inslaaptijd" }));
    expect(screen.getByRole("img", { name: /Inslaaptijd over 3 meetmomenten/ })).toBeTruthy();
  });

  it("names the scale instead of leaving the axis unexplained", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));
    expect(screen.getByText("Schaal 0-100, hoger is beter.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Inslaaptijd" }));
    expect(screen.getByText(/onder de richtlijn → bijna → haalt 'm/)).toBeTruthy();
  });

  it("never calls a self-report scale a guideline", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));
    fireEvent.click(screen.getByRole("button", { name: "Nachtelijk wakker" }));
    // Nachtelijk wakker draagt geen bron, dus geen norm-taal.
    expect(screen.getByText(/je eigen antwoord, van zwakst naar sterkst/)).toBeTruthy();
  });

  it("refuses to draw a line through a single measured point", () => {
    const eenPunt: DomainMeasurement[] = [
      measurement({ dateIso: "2026-07-10", dateLabel: "10 jul 2026", score: 52, values: [] }),
      measurement({
        dateIso: "2026-08-20",
        dateLabel: "20 aug 2026",
        score: 63,
        values: [value("los", "Los punt", "Ja", 2)],
      }),
    ];
    renderPanel({ data: buildData({ slaap: eenPunt }) });
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));
    expect(screen.getByRole("button", { name: "Los punt" }).hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("reads out the value at the clicked moment", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));
    fireEvent.click(screen.getByRole("button", { name: "Inslaaptijd" }));
    expect(screen.getByText(/10-20 minuten/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "1 aug" }));
    expect(screen.getByText(/20-30 minuten/)).toBeTruthy();
    expect(screen.getByText(/Onder 20 min is gangbaar/)).toBeTruthy();
  });

  it("says plainly that an unmeasured moment carries no value", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));
    fireEvent.click(screen.getByRole("button", { name: "Inslaaptijd" }));
    fireEvent.click(screen.getByRole("button", { name: "10 jul" }));
    expect(screen.getByText(/niet gemeten/)).toBeTruthy();
  });

  it("jumps from a table row straight into its graph", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Inslaaptijd" }));
    expect(screen.getByRole("img", { name: /Inslaaptijd over 3 meetmomenten/ })).toBeTruthy();
  });
});

describe("VoortgangMetingenPerDomein — as en herkomst", () => {
  it("draws the score axis at 0, 25, 50, 75 and 100", () => {
    const { container } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));

    const ticks = [...container.querySelectorAll("text")].map((node) => node.textContent);
    expect(ticks).toEqual(["0", "25", "50", "75", "100"]);
  });

  it("names the ordinal axis in words, not in bare numbers", () => {
    const { container } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "grafiek" }));
    fireEvent.click(screen.getByRole("button", { name: "Inslaaptijd" }));

    const ticks = [...container.querySelectorAll("text")].map((node) => node.textContent);
    expect(ticks).toEqual(["onder", "bijna", "haalt"]);
  });

  it("says the direction of time, because it runs against the habit", () => {
    renderPanel();
    expect(screen.getByText(/Links je laatste meting, naar rechts terug in de tijd/)).toBeTruthy();
  });

  it("says that voeding is an answer log, not a position on a scale", () => {
    renderPanel({ selectedDomain: "voeding", data: buildData({ voeding: VOEDING_REEKS }) });
    expect(screen.getByText(/Voeding staat hier als antwoordlog/)).toBeTruthy();
    expect(screen.queryByText(/richtlijn/i)).toBeNull();
  });

  it("refuses to plot a voeding answer, however many moments carry it", () => {
    renderPanel({ selectedDomain: "voeding", data: buildData({ voeding: VOEDING_REEKS }) });
    const rij = screen.getByRole("button", { name: "Vette vis" });
    expect(rij.hasAttribute("disabled")).toBe(true);
  });
});

describe("VoortgangMetingenPerDomein — rest", () => {
  it("switches domain from the chips", () => {
    const { onSelectDomain } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /Stress/ }));
    expect(onSelectDomain).toHaveBeenCalledWith("stress");
  });

  it("stays honest when a domain has no measurements yet", () => {
    renderPanel({ selectedDomain: "beweging" });
    expect(screen.getByText(/Nog geen meetmomenten voor beweging\./)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
