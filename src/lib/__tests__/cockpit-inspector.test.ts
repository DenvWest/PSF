import { describe, expect, it } from "vitest";
import { buildInspectorCards, buildLadderInspectorCards } from "@/lib/cockpit-inspector";

describe("buildInspectorCards", () => {
  it("toont de 'waarom' als primaire kaart zolang de stap niet gedaan is", () => {
    const cards = buildInspectorCards({
      activeHabit: { title: "Eén krachtsessie", detail: "kracht", done: false },
    });
    expect(cards[0].kind).toBe("why");
    expect(cards[0].title).toBe("Eén krachtsessie");
    expect(cards[0].accent).toBe("sage");
  });

  it("vervangt de 'waarom' door een bevestigende tip na afvinken", () => {
    const cards = buildInspectorCards({
      activeHabit: { title: "Eén krachtsessie", detail: "kracht", done: true },
    });
    expect(cards[0].kind).toBe("tip");
  });

  it("valt terug op een neutrale kaart zonder actieve stap", () => {
    const cards = buildInspectorCards({});
    expect(cards[0].kind).toBe("why");
    expect(cards[0].accent).toBe("neutral");
  });

  it("markeert het meetmoment als 'klaar' bij daysUntil <= 0, anders met de teller", () => {
    const ready = buildInspectorCards({ remeasure: { daysUntil: 0 } });
    expect(ready.find((card) => card.kind === "meet")?.title).toContain("staat klaar");

    const later = buildInspectorCards({ remeasure: { daysUntil: 12 } });
    expect(later.find((card) => card.kind === "meet")?.title).toContain("12 dagen");
  });

  it("voegt een Future You-kaart toe wanneer er een anker-why is", () => {
    const cards = buildInspectorCards({ anchorWhy: "Want jij wilt sterk blijven." });
    const doel = cards.find((card) => card.kind === "doel");
    expect(doel?.body).toContain("sterk blijven");
  });

  it("houdt de prioriteitsvolgorde why → meet → doel aan", () => {
    const cards = buildInspectorCards({
      activeHabit: { title: "Eén krachtsessie", detail: null, done: false },
      remeasure: { daysUntil: 5 },
      anchorWhy: "Want jij wilt sterk blijven.",
    });
    expect(cards.map((card) => card.kind)).toEqual(["why", "meet", "doel"]);
  });
});

const BASE_LADDER = {
  layerId: 1,
  layerName: "Dagelijks bewegen",
  chosen: [] as { title: string; moment?: string | null }[],
  hasCheck: false,
  checkNoun: "beweegcheck",
};

describe("buildLadderInspectorCards — de kolom is check-context", () => {
  it("draagt de laag, het bewijs, het ijkpunt en de keuze, in die volgorde", () => {
    const cards = buildLadderInspectorCards({
      ...BASE_LADDER,
      layerId: 2,
      layerName: "Kracht + basisconditie",
      stateLabel: "Grootste winst",
      chosen: [{ title: "Twee krachtsessies per week.", moment: "morgen · 09:00" }],
      isFocus: true,
      hasCheck: true,
      evidence: [
        {
          key: "kracht",
          label: "Kracht",
          answerLabel: "2x per week",
          status: "meets",
        },
      ],
      canSetGoal: true,
      goalTitle: "Twee trappen op zonder buiten adem te zijn",
    });

    expect(cards.map((card) => card.kind)).toEqual(["laag", "evidence", "ijkpunt", "keuze"]);
    expect(cards[0]?.kicker).toBe("Prioriteit 2 · Grootste winst");
    expect(cards[0]?.accent).toBe("terra");
    expect(cards[0]?.body).toBe("");
    expect(cards[1]?.evidence?.[0]?.answerLabel).toBe("2x per week");
    expect(cards[2]?.title).toBe("Twee trappen op zonder buiten adem te zijn");
    expect(cards[2]?.hasGoal).toBe(true);
    expect(cards[3]?.body).toContain("morgen · 09:00");
  });

  it("herhaalt de laag-summary niet — die staat al onder de midden-ladder", () => {
    const cards = buildLadderInspectorCards({
      ...BASE_LADDER,
      hasCheck: true,
      whyWait: "Eerst je voedingscheck en je hertest, dan pas aanvullen.",
    });
    expect(cards[0]?.body).toBe("");
    expect(cards.find((card) => card.kind === "evidence")?.body).toContain("Eerst je voedingscheck");
  });

  it("zegt eerlijk dat je nog niets koos, zonder aan te dringen", () => {
    const cards = buildLadderInspectorCards({
      ...BASE_LADDER,
      layerId: 4,
      layerName: "Je sport",
      hasCheck: true,
    });
    const keuze = cards.find((card) => card.kind === "keuze");
    expect(keuze?.title).toBe("Hier koos je nog niets");
    expect(keuze?.body).toContain("verplicht je tot niets");
  });

  it("vult zonder check geen aannames in, en wijst naar de check", () => {
    const cards = buildLadderInspectorCards({
      ...BASE_LADDER,
      checkHref: "/intake/beweging?from=dashboard&kompas=beweging",
    });
    const evidence = cards.find((card) => card.kind === "evidence");
    expect(evidence?.title).toBe("Nog geen beweegcheck");
    expect(evidence?.body).toContain("niet in met aannames");
    expect(evidence?.href).toContain("/intake/beweging");
    expect(evidence?.evidence).toBeUndefined();
  });

  it("toont een lege gemeten laag zonder die als tekort te framen", () => {
    const cards = buildLadderInspectorCards({
      ...BASE_LADDER,
      layerId: 6,
      layerName: "Aanvullen",
      hasCheck: true,
      evidence: [],
    });
    const evidence = cards.find((card) => card.kind === "evidence");
    expect(evidence?.title).toBe("Niet gemeten op deze laag");
    expect(evidence?.body).toContain("geen tekort");
  });

  it("laat het ijkpunt weg tot we weten of er een doel is", () => {
    const cards = buildLadderInspectorCards({
      ...BASE_LADDER,
      hasCheck: true,
      canSetGoal: false,
    });
    expect(cards.map((card) => card.kind)).toEqual(["laag", "evidence", "keuze"]);
  });
});
