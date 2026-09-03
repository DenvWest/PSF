import { describe, expect, it } from "vitest";
import {
  bouwVerschuiving,
  verschuivingBronregel,
} from "@/lib/voedingsbasis-verschuiving";
import type { CategorieKaart } from "@/lib/nutrition-voedselgroepen";
import type { DomainMeasurement } from "@/types/dashboard";

function kaart(id: string, label: string): CategorieKaart {
  return {
    id: id as CategorieKaart["id"],
    label,
    jij: "2× per dag",
    aanbevolen: null,
    aanbevolenBron: null,
    status: "near",
    footnote: null,
    exemption: null,
    schaalPositie: 0.5,
  };
}

function moment(dateLabel: string, daysAgo: number, antwoord: string): DomainMeasurement {
  return {
    id: dateLabel,
    dateIso: "2026-09-01",
    dateLabel,
    daysAgo,
    score: 60,
    source: "nutrition_log",
    values: [
      {
        key: "plantbasis",
        label: "Plantbasis",
        answerLabel: antwoord,
        benchmarkLabel: null,
        level: null,
        levelMax: 1,
        scale: "zelfrapportage",
      },
    ],
  };
}

const KAARTEN = [kaart("groente", "Groente")];

describe("bouwVerschuiving", () => {
  it("zet de antwoorden per meetmoment naast elkaar, nieuwste eerst", () => {
    const v = bouwVerschuiving({
      kaarten: KAARTEN,
      moments: [moment("1 sep", 2, "3× per dag"), moment("1 aug", 32, "1× per dag")],
    });
    expect(v.momenten.map((m) => m.dateLabel)).toEqual(["1 sep", "1 aug"]);
    expect(v.rijen[0]?.cellen.map((c) => c.answerLabel)).toEqual(["3× per dag", "1× per dag"]);
    expect(v.rijen[0]?.veranderd).toBe(true);
  });

  it("geeft niets terug bij één meting", () => {
    // Eén meting is geen verschuiving; een kolom die doet alsof er een
    // vergelijking is, liegt.
    const v = bouwVerschuiving({ kaarten: KAARTEN, moments: [moment("1 sep", 2, "3× per dag")] });
    expect(v.momenten).toEqual([]);
    expect(v.rijen).toEqual([]);
  });

  it("markeert een gelijk gebleven antwoord niet als veranderd", () => {
    const v = bouwVerschuiving({
      kaarten: KAARTEN,
      moments: [moment("1 sep", 2, "2× per dag"), moment("1 aug", 32, "2× per dag")],
    });
    expect(v.rijen[0]?.veranderd).toBe(false);
    expect(v.veranderd).toBe(0);
  });

  it("laat categorieën weg waarvan geen moment een antwoord draagt", () => {
    const v = bouwVerschuiving({
      kaarten: [kaart("zuivel", "Zuivel")],
      moments: [moment("1 sep", 2, "3× per dag"), moment("1 aug", 32, "1× per dag")],
    });
    // Zuivel hangt niet aan plantbasis; een rij met alleen streepjes voegt niets toe.
    expect(v.rijen).toEqual([]);
  });

  it("toont hoogstens vier kolommen", () => {
    const v = bouwVerschuiving({
      kaarten: KAARTEN,
      moments: [1, 2, 3, 4, 5, 6].map((n) => moment(`m${n}`, n, `${n}× per dag`)),
    });
    expect(v.momenten).toHaveLength(4);
  });
});

describe("verschuivingBronregel", () => {
  it("noemt hoeveel categorieën veranderden en over welke afstand", () => {
    const v = bouwVerschuiving({
      kaarten: KAARTEN,
      moments: [moment("1 sep", 2, "3× per dag"), moment("1 aug", 32, "1× per dag")],
    });
    expect(verschuivingBronregel(v)).toContain("1 van 1");
    expect(verschuivingBronregel(v)).toContain("32 dagen");
  });

  it("zegt het apart als er niets veranderde", () => {
    const v = bouwVerschuiving({
      kaarten: KAARTEN,
      moments: [moment("1 sep", 2, "2× per dag"), moment("1 aug", 32, "2× per dag")],
    });
    expect(verschuivingBronregel(v)).toContain("gelijk gebleven");
  });

  it("geeft null zonder vergelijking", () => {
    expect(verschuivingBronregel({ momenten: [], rijen: [], veranderd: 0 })).toBeNull();
  });
});
