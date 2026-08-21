import { describe, expect, it } from "vitest";
import {
  resolveStressFocusLayer,
  resolveStressLayerStates,
  stressLayerWhyWait,
  type StressCheckReport,
} from "@/lib/stress-ladder";

const STRONG: StressCheckReport = {
  STR_FREQ: 4,
  STR_BLOCK: 4,
  STR_AUTO: 4,
  STR_AWARE: 4,
  STR_RCV: 4,
  STR_REFL: 4,
  STR_CHARGE: 4,
};

describe("resolveStressFocusLayer — cascade, bovenste treffer wint", () => {
  it("P1 — dagelijkse spanning wint altijd, ongeacht de blokkade", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_FREQ: 1, STR_BLOCK: 4 })).toBe(1);
  });

  it("P1 — spanning + een blokkade over tijd of schuldgevoel", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_FREQ: 2, STR_BLOCK: 2 })).toBe(1);
    expect(resolveStressFocusLayer({ ...STRONG, STR_FREQ: 2, STR_BLOCK: 3 })).toBe(1);
  });

  it("geen P1 als de blokkade geen tijd/schuldgevoel is, ook al is spanning zwak", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_FREQ: 2, STR_BLOCK: 4 })).not.toBe(1);
  });

  it("P2 — geen invloed op de opbouw", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_AUTO: 2 })).toBe(2);
  });

  it("P2 — pas achteraf doorhebben dat je gespannen was", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_AWARE: 2 })).toBe(2);
  });

  it("P2 — expliciet niet weten wat helpt", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_BLOCK: 1 })).toBe(2);
  });

  it("P3 — herstel stapelt op", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_RCV: 2 })).toBe(3);
  });

  it("P3 — keuzes worden uitgesteld onder druk", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_REFL: 2 })).toBe(3);
  });

  it("P4 — dag staat, voorraad blijft leeg", () => {
    expect(resolveStressFocusLayer({ ...STRONG, STR_CHARGE: 2 })).toBe(4);
  });

  it("P5 wordt nooit winst — valt terug op P6 als alles staat", () => {
    expect(resolveStressFocusLayer(STRONG)).toBe(6);
  });

  it("ontbrekende velden triggeren geen enkele prioriteit", () => {
    expect(resolveStressFocusLayer({})).toBe(6);
  });
});

describe("resolveStressLayerStates — winst, ok, watch, wacht", () => {
  it("zet precies één laag op winst", () => {
    const states = resolveStressLayerStates({ ...STRONG, STR_AUTO: 2 });
    expect(states[2]).toBe("winst");
    const winstCount = Object.values(states).filter((s) => s === "winst").length;
    expect(winstCount).toBe(1);
  });

  it("houdt een open laag bóven de winst-laag zichtbaar als watch, niet wacht", () => {
    // Spanning is zwak (2 = aandacht) maar zonder de juiste blokkade triggert
    // dat geen P1 — de winst valt door naar P3 (herstel), en laag 1 telt dan
    // nog mee in plaats van te wachten.
    const states = resolveStressLayerStates({
      STR_FREQ: 2,
      STR_BLOCK: 4,
      STR_AUTO: 4,
      STR_AWARE: 4,
      STR_RCV: 2,
      STR_REFL: 4,
      STR_CHARGE: 4,
    });
    expect(states[3]).toBe("winst");
    expect(states[1]).toBe("watch");
  });

  it("zet een zwakke laag ónder de winst-laag op wacht", () => {
    const states = resolveStressLayerStates({
      STR_FREQ: 4,
      STR_BLOCK: 4,
      STR_AUTO: 2,
      STR_AWARE: 4,
      STR_RCV: 2,
      STR_REFL: 4,
      STR_CHARGE: 4,
    });
    expect(states[2]).toBe("winst");
    expect(states[3]).toBe("wacht");
  });

  it("laag 5 (voeding-koppeling) is een deur: watch pas vanaf focus P4, anders wacht", () => {
    expect(resolveStressLayerStates({ ...STRONG, STR_AUTO: 2 })[5]).toBe("wacht");
    expect(resolveStressLayerStates({ ...STRONG, STR_CHARGE: 2 })[5]).toBe("watch");
  });

  it("laag 6 (meten & bijsturen) is een deur: watch pas vanaf focus P3, anders wacht", () => {
    expect(resolveStressLayerStates({ ...STRONG, STR_AUTO: 2 })[6]).toBe("wacht");
    expect(resolveStressLayerStates({ ...STRONG, STR_RCV: 2 })[6]).toBe("watch");
  });

  it("zet een sterke laag op ok", () => {
    const states = resolveStressLayerStates({ ...STRONG, STR_AUTO: 2 });
    expect(states[1]).toBe("ok");
    expect(states[4]).toBe("ok");
  });
});

describe("stressLayerWhyWait", () => {
  it("geeft geen regel voor de winst-laag zelf of de lagen erboven", () => {
    expect(stressLayerWhyWait(1, 2)).toBeNull();
    expect(stressLayerWhyWait(2, 2)).toBeNull();
  });

  it("geeft een regel voor elke laag onder de winst-laag", () => {
    expect(stressLayerWhyWait(3, 2)).toBe(
      "Herstelmomenten hangen aan een dag die nu geen vast eindpunt kent.",
    );
    expect(stressLayerWhyWait(6, 2)).toBe("Eerst iets veranderen, dan pas meten wat het deed.");
  });

  it("geeft null zonder winst-laag", () => {
    expect(stressLayerWhyWait(3, null)).toBeNull();
  });
});
