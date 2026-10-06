import { describe, expect, it } from "vitest";
import { voedingsnormenVoor } from "@/data/nutrition/voedingsnormen";
import {
  LEEG_KERNSTOF_PROFIEL,
  leesKernstofProfiel,
  pasKernstofPatchToe,
} from "@/lib/account-kernstof-profiel";

describe("pasKernstofPatchToe", () => {
  it("laat weggelaten velden staan en wist met null", () => {
    const start = { ...LEEG_KERNSTOF_PROFIEL, geslacht: "vrouw" as const, streefwaarden: { zinc: 9, magnesium: 400 } };
    const uit = pasKernstofPatchToe(start, { zeventigPlus: true, streefwaarden: { magnesium: null } });
    expect(uit).toEqual({
      profiel: {
        geslacht: "vrouw",
        leeftijd: null,
        zeventigPlus: true,
        activiteit: null,
        voedingswijze: null,
        menstruatie: null,
        streefwaarden: { zinc: 9 },
      },
    });
  });

  it("weigert een streefwaarde boven de EFSA-bovengrens en onbekende waarden", () => {
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { streefwaarden: { zinc: 40 } })).toMatchObject({
      fout: expect.stringContaining("25 mg"),
    });
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { streefwaarden: { protein: 100 } })).toEqual({
      fout: "Onbekende stof.",
    });
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { geslacht: "anders" })).toEqual({ fout: "Onbekend geslacht." });
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { menstruatie: "soms" })).toEqual({ fout: "Onbekende keuze." });
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { voedingswijze: "pescotarisch" })).toEqual({
      fout: "Onbekende voedingswijze.",
    });
  });
});

describe("leesKernstofProfiel", () => {
  it("laat ongeldige waarden uit de database wegvallen", () => {
    expect(
      leesKernstofProfiel({
        geslacht: "x",
        zeventig_plus: true,
        voedingswijze: "veganistisch",
        streefwaarden: { zinc: 99, vitamin_d: 20, onbekend: 1 },
      }),
    ).toEqual({
      geslacht: null,
      leeftijd: null,
      zeventigPlus: true,
      activiteit: null,
      voedingswijze: "veganistisch",
      menstruatie: null,
      streefwaarden: { vitamin_d: 20 },
    });
    expect(leesKernstofProfiel(null)).toEqual(LEEG_KERNSTOF_PROFIEL);
  });
});

describe("leeftijd en activiteit", () => {
  it("bewaart een geldige leeftijd en activiteit en weigert onzin", () => {
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { leeftijd: 47, activiteit: 3 })).toMatchObject({
      profiel: { leeftijd: 47, activiteit: 3 },
    });
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { leeftijd: 12 })).toEqual({
      fout: "Vul een leeftijd tussen 18 en 110 jaar in.",
    });
    expect(pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { activiteit: 7 })).toEqual({ fout: "Onbekend activiteitsniveau." });
    expect(leesKernstofProfiel({ leeftijd: 47.5, activiteit: "2" })).toMatchObject({ leeftijd: null, activiteit: null });
  });
});

describe("menstruatie", () => {
  it("bewaart een keuze en wist hem met null", () => {
    const met = pasKernstofPatchToe(LEEG_KERNSTOF_PROFIEL, { menstruatie: "nee" });
    expect(met).toMatchObject({ profiel: { menstruatie: "nee" } });
    if (!("profiel" in met)) throw new Error("verwacht profiel");
    expect(pasKernstofPatchToe(met.profiel, { menstruatie: null })).toMatchObject({ profiel: { menstruatie: null } });
    expect(leesKernstofProfiel({ menstruatie: "onregelmatig" }).menstruatie).toBe("onregelmatig");
  });
});

describe("voedingsnormenVoor met 70+", () => {
  it("verdubbelt alleen de vitamine D-norm", () => {
    const jong = voedingsnormenVoor("man");
    const oud = voedingsnormenVoor("man", { zeventigPlus: true });
    expect(oud.vitamin_d).toMatchObject({ waarde: 20, geldtVoor: "volwassenen vanaf 70", bron: "Gezondheidsraad 2012" });
    expect(oud.magnesium).toEqual(jong.magnesium);
    expect(jong.vitamin_d.waarde).toBe(15);
  });
});
