import { describe, expect, it } from "vitest";
import { buildInspectorCards } from "@/lib/cockpit-inspector";

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
