import { describe, expect, it } from "vitest";
import {
  findLadderMomentBlock,
  formatMomentDay,
  formatMomentLabel,
  isLadderMomentDomain,
  ladderMomentRange,
  resolveQuickLadderMoment,
} from "@/lib/ladder-moments";
import type { AgendaBlockRecord } from "@/types/agenda";

const TODAY = "2026-08-20";

function block(overrides: Partial<AgendaBlockRecord>): AgendaBlockRecord {
  return {
    id: "b1",
    date: TODAY,
    categoryId: "beweging",
    title: "Laat minstens één dag tussen twee krachtsessies.",
    startTime: "07:00",
    endTime: "07:30",
    source: "routine",
    status: "open",
    externalProvider: null,
    externalRef: null,
    deletedAt: null,
    ...overrides,
  };
}

describe("isLadderMomentDomain", () => {
  it("laat de vijf domeinen met agenda-categorie door", () => {
    expect(isLadderMomentDomain("beweging")).toBe(true);
    expect(isLadderMomentDomain("verbinding")).toBe(true);
  });

  it("weigert readout-domeinen zonder ladder", () => {
    expect(isLadderMomentDomain("energie")).toBe(false);
    expect(isLadderMomentDomain("herstel")).toBe(false);
  });
});

describe("findLadderMomentBlock", () => {
  it("vindt het blok op categorie en titel", () => {
    const found = findLadderMomentBlock([block({})], "beweging", block({}).title, TODAY);
    expect(found?.id).toBe("b1");
  });

  it("negeert een ander domein met dezelfde titel", () => {
    const found = findLadderMomentBlock(
      [block({ categoryId: "slaap" })],
      "beweging",
      block({}).title,
      TODAY,
    );
    expect(found).toBeNull();
  });

  it("negeert afgevinkte en verlopen blokken", () => {
    const rows = [
      block({ id: "done", status: "done" }),
      block({ id: "past", date: "2026-08-19" }),
    ];
    expect(findLadderMomentBlock(rows, "beweging", block({}).title, TODAY)).toBeNull();
  });

  it("kiest het eerstvolgende moment als er meerdere staan", () => {
    const rows = [
      block({ id: "later", date: "2026-08-24" }),
      block({ id: "vroeger", date: "2026-08-21", startTime: "06:30" }),
    ];
    expect(findLadderMomentBlock(rows, "beweging", block({}).title, TODAY)?.id).toBe("vroeger");
  });

  it("matcht op getrimde titel, zoals de API hem opslaat", () => {
    const found = findLadderMomentBlock([block({})], "beweging", `  ${block({}).title}  `, TODAY);
    expect(found?.id).toBe("b1");
  });
});

describe("formatMomentDay", () => {
  it("noemt vandaag en morgen bij naam", () => {
    expect(formatMomentDay(TODAY, TODAY)).toBe("vandaag");
    expect(formatMomentDay("2026-08-21", TODAY)).toBe("morgen");
  });

  it("gebruikt weekdag en datum verderop", () => {
    expect(formatMomentDay("2026-08-25", TODAY)).toBe("di 25 aug");
  });

  it("zet dag en tijd in één regel", () => {
    expect(formatMomentLabel(TODAY, "07:00", TODAY)).toBe("vandaag · 07:00");
  });
});

describe("ladderMomentRange", () => {
  it("laadt vier weken vooruit vanaf vandaag", () => {
    expect(ladderMomentRange(TODAY)).toEqual({
      startDate: TODAY,
      endDate: "2026-09-17",
    });
  });
});

describe("resolveQuickLadderMoment", () => {
  // Augustus in Nederland is UTC+2, dus 05:00Z is 07:00 op de klok.
  function at(utc: string) {
    return resolveQuickLadderMoment(new Date(`${TODAY}T${utc}:00.000Z`), TODAY);
  }

  it("kiest het eerstvolgende dagdeel dat nog past", () => {
    expect(at("05:00")).toMatchObject({ date: TODAY, startTime: "09:00" });
    expect(at("08:00")).toMatchObject({ date: TODAY, startTime: "14:00" });
    expect(at("16:00")).toMatchObject({ date: TODAY, startTime: "19:00" });
  });

  it("slaat een dagdeel over dat te dichtbij is", () => {
    // 08:45 lokaal: 09:00 komt binnen het halfuur, dus dat is geen belofte.
    expect(at("06:45")).toMatchObject({ date: TODAY, startTime: "14:00" });
  });

  it("wijkt uit naar morgenochtend als de dag op is", () => {
    expect(at("17:00")).toEqual({
      date: "2026-08-21",
      startTime: "09:00",
      durationMinutes: 30,
    });
  });
});
