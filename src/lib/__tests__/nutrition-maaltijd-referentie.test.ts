import { describe, expect, it } from "vitest";
import { LEEG_KERNSTOF_PROFIEL } from "@/lib/account-kernstof-profiel";
import {
  aandeelVan,
  adhRegelKernstof,
  doelRegel,
  normRegel,
  referentieVoorKernstof,
  referentieVoorVeld,
  sterksteBijdragen,
} from "@/lib/nutrition-maaltijd-referentie";
import { STANDAARD_GEVOLGDE_NORMEN, STANDAARD_NORMEN } from "@/lib/nutrition-normen";

describe("nutrition-maaltijd-referentie", () => {
  it("noemt de norm met bron, en zonder norm niets", () => {
    const ijzer = referentieVoorVeld("ironMg", STANDAARD_GEVOLGDE_NORMEN, LEEG_KERNSTOF_PROFIEL);
    expect(normRegel(ijzer)).toBe(`norm ${STANDAARD_GEVOLGDE_NORMEN.ironMg.waarde} mg/dag · ${STANDAARD_GEVOLGDE_NORMEN.ironMg.bron}`);
    expect(aandeelVan(ijzer, 4)).toBe(4 / STANDAARD_GEVOLGDE_NORMEN.ironMg.waarde);
    const natrium = referentieVoorVeld("sodiumMg", STANDAARD_GEVOLGDE_NORMEN, LEEG_KERNSTOF_PROFIEL);
    expect(normRegel(natrium)).toBeNull();
    expect(aandeelVan(natrium, 400)).toBeNull();
  });

  it("zet een eigen doel als tweede regel met eigen percentage", () => {
    const profiel = { streefwaarden: { magnesium: 400, ironMg: 10 } };
    const magnesium = referentieVoorKernstof("magnesium", STANDAARD_NORMEN, profiel);
    expect(doelRegel(magnesium, 100, "mg")).toBe("jouw doel 400 mg/dag · 25%");
    expect(aandeelVan(magnesium, 100)).toBe(100 / STANDAARD_NORMEN.magnesium.waarde);
    expect(doelRegel(referentieVoorVeld("ironMg", STANDAARD_GEVOLGDE_NORMEN, profiel), 5, "mg")).toBe(
      "jouw doel 10 mg/dag · 50%",
    );
    expect(doelRegel(referentieVoorKernstof("zinc", STANDAARD_NORMEN, profiel), 5, "mg")).toBeNull();
  });

  it("markeert omega-3 als weektotaal en geeft de etiket-ADH apart", () => {
    const omega3 = referentieVoorKernstof("omega3", STANDAARD_NORMEN, LEEG_KERNSTOF_PROFIEL);
    expect(omega3.weektotaal).toBe(true);
    expect(normRegel(omega3)).toContain("(telt per week)");
    expect(adhRegelKernstof("magnesium", 75)).toBe("etiket: 20% ADH");
    expect(adhRegelKernstof("protein", 20)).toBeNull();
  });

  it("toont de sterkste bijdragen, hoogste eerst, zonder nullen", () => {
    expect(
      sterksteBijdragen([
        { label: "A", aandeel: 0.1 },
        { label: "B", aandeel: 0 },
        { label: "C", aandeel: 0.5 },
        { label: "D", aandeel: 0.3 },
        { label: "E", aandeel: 0.2 },
      ]).map((b) => b.label),
    ).toEqual(["C", "D", "E"]);
  });
});
