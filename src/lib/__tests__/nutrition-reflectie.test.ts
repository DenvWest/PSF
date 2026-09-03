import { describe, expect, it } from "vitest";
import { addAgendaDays } from "@/lib/agenda-week-preview";
import {
  reflectieNaklank,
  reflectieReeksRegel,
  reflectieVraag,
  resolveReflectieMoment,
  REFLECTIE_OPTIES,
  type ReflectieAntwoord,
} from "@/lib/nutrition-reflectie";
import type { AgendaBlockRecord } from "@/types/agenda";

const TODAY = "2026-09-03";

function block(overrides: Partial<AgendaBlockRecord> = {}): AgendaBlockRecord {
  return {
    id: "b1",
    date: addAgendaDays(TODAY, -1),
    categoryId: "voeding",
    title: "Zet één portie groente bij je avondeten.",
    startTime: "18:00",
    endTime: "18:30",
    source: "routine",
    status: "open",
    externalProvider: null,
    externalRef: null,
    ...overrides,
  };
}

describe("resolveReflectieMoment", () => {
  it("vindt een voedingsblok van gisteren", () => {
    const moment = resolveReflectieMoment([block()], new Set(), TODAY);
    expect(moment?.blockId).toBe("b1");
    expect(moment?.afgevinkt).toBe(false);
  });

  it("slaat blokken van vandaag over — de dag is nog bezig", () => {
    const moment = resolveReflectieMoment([block({ date: TODAY })], new Set(), TODAY);
    expect(moment).toBeNull();
  });

  it("slaat blokken uit de toekomst over", () => {
    const vooruit = block({ date: addAgendaDays(TODAY, 2) });
    expect(resolveReflectieMoment([vooruit], new Set(), TODAY)).toBeNull();
  });

  it("vergeet een blok dat te lang geleden is", () => {
    const oud = block({ date: addAgendaDays(TODAY, -8) });
    expect(resolveReflectieMoment([oud], new Set(), TODAY)).toBeNull();
  });

  it("houdt een blok binnen het venster vast", () => {
    const rand = block({ date: addAgendaDays(TODAY, -7) });
    expect(resolveReflectieMoment([rand], new Set(), TODAY)?.blockId).toBe("b1");
  });

  it("negeert andere domeinen", () => {
    const beweging = block({ categoryId: "beweging" });
    expect(resolveReflectieMoment([beweging], new Set(), TODAY)).toBeNull();
  });

  it("negeert verwijderde blokken", () => {
    const weg = block({ deletedAt: "2026-09-02T10:00:00Z" });
    expect(resolveReflectieMoment([weg], new Set(), TODAY)).toBeNull();
  });

  it("vraagt nooit twee keer naar hetzelfde blok", () => {
    const moment = resolveReflectieMoment([block()], new Set(["b1"]), TODAY);
    expect(moment).toBeNull();
  });

  it("toont er één tegelijk, en wel de oudste", () => {
    const blokken = [
      block({ id: "recent", date: addAgendaDays(TODAY, -1) }),
      block({ id: "ouder", date: addAgendaDays(TODAY, -5) }),
    ];
    expect(resolveReflectieMoment(blokken, new Set(), TODAY)?.blockId).toBe("ouder");
  });

  it("herkent een afgevinkt blok", () => {
    const moment = resolveReflectieMoment([block({ status: "done" })], new Set(), TODAY);
    expect(moment?.afgevinkt).toBe(true);
  });
});

describe("copy", () => {
  it("stelt een andere vraag bij een afgevinkt blok", () => {
    const open = resolveReflectieMoment([block()], new Set(), TODAY);
    const gedaan = resolveReflectieMoment([block({ status: "done" })], new Set(), TODAY);
    expect(open && gedaan).toBeTruthy();
    if (!open || !gedaan) return;
    expect(reflectieVraag(open)).not.toBe(reflectieVraag(gedaan));
  });

  it("biedt drie opties, met een onverzacht nee", () => {
    expect(REFLECTIE_OPTIES).toHaveLength(3);
    expect(REFLECTIE_OPTIES.map((optie) => optie.id)).toEqual(["gelukt", "deels", "niet"]);
  });

  it("geeft op elk antwoord een naklank zonder oordeel", () => {
    for (const optie of REFLECTIE_OPTIES) {
      const regel = reflectieNaklank(optie.id);
      expect(regel.length).toBeGreaterThan(0);
      // Geen aanmoediging, geen troost, geen schuld.
      expect(regel).not.toMatch(/goed bezig|jammer|helaas|volhouden|streak/i);
    }
  });
});

describe("reflectieReeksRegel", () => {
  it("zegt niets zonder antwoorden", () => {
    expect(reflectieReeksRegel([])).toBeNull();
  });

  it("noemt één terugblik apart", () => {
    expect(reflectieReeksRegel(["gelukt"])).toMatch(/één keer/i);
  });

  it("vat een overwegend geslaagde reeks samen", () => {
    const reeks: ReflectieAntwoord[] = ["gelukt", "gelukt", "niet"];
    expect(reflectieReeksRegel(reeks)).toMatch(/meestal lukte het/i);
  });

  it("stelt bij overwegend niet-gelukt andere acties voor", () => {
    const reeks: ReflectieAntwoord[] = ["niet", "niet", "gelukt"];
    expect(reflectieReeksRegel(reeks)).toMatch(/andere acties/i);
  });

  it("noemt nooit een verhouding of percentage", () => {
    const varianten: ReflectieAntwoord[][] = [
      ["gelukt", "niet"],
      ["gelukt", "gelukt", "deels"],
      ["niet", "deels", "deels", "gelukt"],
    ];
    for (const reeks of varianten) {
      const regel = reflectieReeksRegel(reeks) ?? "";
      expect(regel).not.toMatch(/%|\d+\s*van de\s*\d+/i);
    }
  });
});
