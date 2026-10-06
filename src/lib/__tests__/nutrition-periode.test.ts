import { describe, expect, it } from "vitest";
import {
  datumsTussen,
  periodeLabel,
  periodeTussen,
  periodeVoorKeuze,
  verschuifDag,
} from "@/lib/nutrition-periode";

describe("nutrition-periode", () => {
  it("rekent snelkeuzes terug vanaf vandaag, inclusief vandaag", () => {
    expect(periodeVoorKeuze("vandaag", "2026-10-05")).toEqual({ van: "2026-10-05", tot: "2026-10-05" });
    expect(periodeVoorKeuze("7", "2026-10-05")).toEqual({ van: "2026-09-29", tot: "2026-10-05" });
    expect(datumsTussen(periodeVoorKeuze("30", "2026-10-05"))).toHaveLength(30);
  });

  it("slaat geen dag over bij de wintertijd-wissel", () => {
    expect(datumsTussen({ van: "2026-10-24", tot: "2026-10-26" })).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(verschuifDag("2026-03-29", 1)).toBe("2026-03-30");
  });

  it("zet twee getikte dagen op volgorde", () => {
    expect(periodeTussen("2026-10-05", "2026-10-01")).toEqual({ van: "2026-10-01", tot: "2026-10-05" });
  });

  it("geeft één dag met weekdag en een reeks met twee datums", () => {
    expect(periodeLabel({ van: "2026-10-05", tot: "2026-10-05" })).toMatch(/5 okt/);
    expect(periodeLabel({ van: "2026-09-29", tot: "2026-10-05" })).toBe("29 sep – 5 okt");
  });
});
