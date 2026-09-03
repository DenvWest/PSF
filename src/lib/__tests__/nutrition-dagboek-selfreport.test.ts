import { describe, expect, it } from "vitest";
import {
  gewogenGemiddelde,
  kalibratieRegel,
  kalibratieRijen,
  kanZelfrapportDragen,
  selfReportUitDagboek,
} from "@/lib/nutrition-dagboek-selfreport";
import { dagSoortVoor, type DagboekDag } from "@/lib/nutrition-dagboek";

const MA = "2026-08-31";
const DI = "2026-09-01";
const ZA = "2026-09-05";
const ZO = "2026-09-06";

function dag(date: string, porties: DagboekDag["porties"]): DagboekDag {
  return { date, soort: dagSoortVoor(date), porties };
}

/** Vier dagen die de nieuwe groepen gebruiken. */
function volledig(porties: DagboekDag["porties"]): DagboekDag[] {
  return [dag(MA, porties), dag(DI, porties), dag(ZA, porties), dag(ZO, porties)];
}

describe("kanZelfrapportDragen", () => {
  it("weigert een half dagboek", () => {
    expect(kanZelfrapportDragen([dag(MA, { vis: 1 })])).toBe(false);
  });

  it("weigert dagen uit het zeven-groepen-tijdperk", () => {
    // "vlees-vis" als één bak: daar is omega-3 niet uit te halen zonder gokken.
    const oud = [
      dag(MA, { "vlees-vis": 2 }),
      dag(DI, { "vlees-vis": 2 }),
      dag(ZA, { "vlees-vis": 2 }),
      dag(ZO, { "vlees-vis": 2 }),
    ];
    expect(kanZelfrapportDragen(oud)).toBe(false);
  });

  it("aanvaardt vier dagen met de nieuwe groepen", () => {
    expect(kanZelfrapportDragen(volledig({ vis: 1, groente: 3 }))).toBe(true);
  });
});

describe("gewogenGemiddelde", () => {
  it("weegt doordeweeks zwaarder dan weekend", () => {
    // 5/7 × 0 + 2/7 × 7 = 2. Ongewogen zou het 3,5 zijn geweest.
    const dagen = [
      dag(MA, { suiker: 0 }),
      dag(DI, { suiker: 0 }),
      dag(ZA, { suiker: 7 }),
      dag(ZO, { suiker: 7 }),
    ];
    expect(gewogenGemiddelde(dagen, "suiker")).toBeCloseTo(2, 5);
  });

  it("valt terug op een gewoon gemiddelde zonder weekenddagen", () => {
    const dagen = [dag(MA, { groente: 2 }), dag(DI, { groente: 4 })];
    expect(gewogenGemiddelde(dagen, "groente")).toBe(3);
  });

  it("geeft null voor een groep die nergens staat", () => {
    expect(gewogenGemiddelde(volledig({ groente: 2 }), "vis")).toBeNull();
  });
});

describe("selfReportUitDagboek", () => {
  it("geeft null zonder bruikbaar dagboek", () => {
    expect(selfReportUitDagboek([dag(MA, { vis: 1 })])).toBeNull();
  });

  it("telt vis apart om naar omega-3 te vertalen", () => {
    // Dit is de hele reden dat vis een eigen groep kreeg.
    const report = selfReportUitDagboek(volledig({ vis: 1, vlees: 2 }));
    expect(report?.oilyFishPerWeek).toBe(7);
  });

  it("telt eiwitbronnen op tot eiwitmomenten", () => {
    const report = selfReportUitDagboek(
      volledig({ vis: 1, vlees: 1, eieren: 1, zuivel: 1, peulvruchten: 1 }),
    );
    expect(report?.proteinMealsPerDay).toBe(5);
  });

  it("telt groente en fruit samen als plantporties", () => {
    const report = selfReportUitDagboek(volledig({ groente: 3, fruit: 2, vis: 1 }));
    expect(report?.vegFruitPerDay).toBe(5);
  });

  it("laat vitamine D volledig aan de check", () => {
    // Daglicht is geen voedselgroep; het dagboek kan er niets over zeggen.
    const report = selfReportUitDagboek(volledig({ groente: 3, vis: 1 }));
    expect(report?.sunExposurePerWeek).toBeUndefined();
  });

  it("laat een veld weg waarvoor geen groep is ingevuld", () => {
    const report = selfReportUitDagboek(volledig({ vis: 1 }));
    expect(report?.dairyServingsPerDay).toBeUndefined();
    expect(report?.oilyFishPerWeek).toBe(7);
  });

  it("rondt af op één decimaal", () => {
    const dagen = [
      dag(MA, { groente: 1, vis: 1 }),
      dag(DI, { groente: 2, vis: 1 }),
      dag(ZA, { groente: 4, vis: 1 }),
      dag(ZO, { groente: 4, vis: 1 }),
    ];
    const report = selfReportUitDagboek(dagen);
    const waarde = report?.vegFruitPerDay ?? 0;
    expect(Number.isFinite(waarde)).toBe(true);
    expect(waarde).toBe(Math.round(waarde * 10) / 10);
  });

  it("noemt nooit een milligram of dagtotaal", () => {
    // De grens uit nutrition-contribution.ts blijft staan: porties, geen mg.
    const report = selfReportUitDagboek(volledig({ vis: 1, groente: 3 }));
    for (const sleutel of Object.keys(report ?? {})) {
      expect(sleutel).not.toMatch(/mg|gram|kcal|total/i);
    }
  });
});

describe("kalibratieRijen", () => {
  it("zwijgt zonder dagboek", () => {
    expect(kalibratieRijen({ oilyFishPerWeek: 2 }, null)).toEqual([]);
  });

  it("negeert verschillen onder één portie", () => {
    const rijen = kalibratieRijen(
      { oilyFishPerWeek: 2 },
      { oilyFishPerWeek: 2.4 },
    );
    expect(rijen).toEqual([]);
  });

  it("vindt een echt verschil en noemt de richting", () => {
    const rijen = kalibratieRijen({ oilyFishPerWeek: 1 }, { oilyFishPerWeek: 4 });
    expect(rijen).toHaveLength(1);
    expect(rijen[0].verschil).toBe(3);
    expect(rijen[0].field).toBe("oilyFishPerWeek");
  });

  it("sorteert op grootte van het verschil", () => {
    const rijen = kalibratieRijen(
      { oilyFishPerWeek: 1, vegFruitPerDay: 2 },
      { oilyFishPerWeek: 2.5, vegFruitPerDay: 6 },
    );
    expect(Math.abs(rijen[0].verschil)).toBeGreaterThanOrEqual(
      Math.abs(rijen[1].verschil),
    );
  });

  it("slaat velden over die maar één bron hebben", () => {
    const rijen = kalibratieRijen({ oilyFishPerWeek: 2 }, { vegFruitPerDay: 5 });
    expect(rijen).toEqual([]);
  });
});

describe("kalibratieRegel", () => {
  it("zwijgt zonder verschillen", () => {
    expect(kalibratieRegel([])).toBeNull();
  });

  it("legt uit dat beide schattingen zijn, zonder iemand ongelijk te geven", () => {
    const rijen = kalibratieRijen({ oilyFishPerWeek: 1 }, { oilyFishPerWeek: 4 });
    const regel = kalibratieRegel(rijen) ?? "";
    expect(regel).toMatch(/schattingen/i);
    // Geen foutmelding, geen verwijt.
    expect(regel).not.toMatch(/fout|onjuist|klopt niet|verkeerd/i);
  });
});
