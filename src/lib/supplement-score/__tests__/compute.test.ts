import { describe, expect, it } from "vitest";
import { SCORE_WEIGHTS, TIER_POINTS } from "@/data/supplement-hub/score-model";
import { computeTrustScore } from "@/lib/supplement-score/compute";
import type { TrustScoreInput } from "@/types/supplement-score";

const VOLLEDIG_ETIKET = {
  werkzameStofGekwantificeerd: true,
  dagdoseringVermeld: true,
  samenstellingUitgesplitst: true,
  proprietaryBlend: false,
};

function magnesiumInput(overrides: Partial<TrustScoreInput> = {}): TrustScoreInput {
  return {
    category: "magnesium",
    werkzameStof: "magnesium",
    doseringPerDagdosis: {
      hoeveelheid: 200,
      eenheid: "mg",
      elementair: true,
    },
    efsaClaimIds: ["magnesium.nerve-function", "magnesium.muscle-function"],
    thirdPartyTested: false,
    formKey: "bisglycinaat",
    label: VOLLEDIG_ETIKET,
    certificeringen: [],
    kwaliteitsmarkers: {},
    dosisOnzekerReden: null,
    ...overrides,
  };
}

describe("computeTrustScore", () => {
  it("rekent de vijf onderdelen tegen hun gewicht", () => {
    const result = computeTrustScore(magnesiumInput());

    // magnesium kent één claimdrempel (56,25 mg), dus 200 mg ontsluit alles.
    const verwacht =
      100 * SCORE_WEIGHTS.claimdekking +
      100 * SCORE_WEIGHTS.dosering +
      TIER_POINTS.hoog * SCORE_WEIGHTS.vorm +
      100 * SCORE_WEIGHTS.transparantie +
      0 * SCORE_WEIGHTS.toetsing;

    expect(result.total).toBeCloseTo(verwacht, 1);
    expect(result.determinedCount).toBe(5);
    expect(result.claimStance).toBe("voldoet");
  });

  it("straft een dosering onder de onderzoeksdosis evenredig", () => {
    const result = computeTrustScore(
      magnesiumInput({
        doseringPerDagdosis: { hoeveelheid: 100, eenheid: "mg", elementair: true },
      }),
    );

    const dosering = result.components.find((c) => c.id === "dosering");
    expect(dosering?.points).toBe(50);
  });

  it("trekt af boven de bovengrens in plaats van te belonen", () => {
    const result = computeTrustScore(
      magnesiumInput({
        doseringPerDagdosis: { hoeveelheid: 500, eenheid: "mg", elementair: true },
      }),
    );

    const dosering = result.components.find((c) => c.id === "dosering");
    expect(dosering?.points).toBe(60);
  });

  it("laat het doseringsonderdeel uitvallen wanneer de dosis onzeker is, en hernormaliseert", () => {
    const result = computeTrustScore(
      magnesiumInput({ dosisOnzekerReden: "Gehalte staat niet op het etiket." }),
    );

    const dosering = result.components.find((c) => c.id === "dosering");
    expect(dosering?.points).toBeNull();
    expect(dosering?.weight).toBe(0);
    expect(result.determinedCount).toBe(3);
    expect(result.claimStance).toBe("onbepaald");

    // Zonder dosis vallen ook de claims weg: vorm 100, transparantie 100, toetsing 0.
    const rest =
      SCORE_WEIGHTS.vorm + SCORE_WEIGHTS.transparantie + SCORE_WEIGHTS.toetsing;
    const verwacht =
      (TIER_POINTS.hoog * SCORE_WEIGHTS.vorm + 100 * SCORE_WEIGHTS.transparantie) / rest;
    expect(result.total).toBeCloseTo(verwacht, 1);
  });

  it("kort transparantie per ontbrekend etiketfeit", () => {
    const result = computeTrustScore(
      magnesiumInput({
        label: { ...VOLLEDIG_ETIKET, samenstellingUitgesplitst: false },
      }),
    );

    const transparantie = result.components.find((c) => c.id === "transparantie");
    expect(transparantie?.points).toBe(75);
    expect(transparantie?.reden).toContain("niet per vorm uitgesplitst");
  });

  it("telt labtest en keurmerk samen op tot maximaal 100", () => {
    const result = computeTrustScore(
      magnesiumInput({ thirdPartyTested: true, certificeringen: ["Creapure®"] }),
    );

    const toetsing = result.components.find((c) => c.id === "toetsing");
    expect(toetsing?.points).toBe(100);
  });

  it("noemt een botanical zonder erkende claim niet 'voldoet niet'", () => {
    const result = computeTrustScore({
      category: "ashwagandha",
      werkzameStof: "ashwagandha",
      doseringPerDagdosis: { hoeveelheid: 600, eenheid: "mg", elementair: false },
      efsaClaimIds: [],
      thirdPartyTested: false,
      formKey: "ksm-66",
      label: VOLLEDIG_ETIKET,
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
    });

    expect(result.claimStance).toBe("geen_erkende_claim");
    expect(result.determinedCount).toBe(4);
  });

  it("herkent dat maar een deel van de gekoppelde claims gehaald wordt", () => {
    const result = computeTrustScore({
      category: "omega-3",
      werkzameStof: "omega3",
      doseringPerDagdosis: {
        hoeveelheid: 850,
        eenheid: "mg",
        elementair: false,
        epaMg: 590,
        dhaMg: 130,
      },
      efsaClaimIds: ["omega3.heart", "omega3.brain-dha"],
      thirdPartyTested: false,
      formKey: "triglyceride-softgel",
      label: VOLLEDIG_ETIKET,
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
    });

    // 720 mg EPA+DHA haalt de hartclaim; 130 mg DHA haalt de 250 mg-drempel niet.
    expect(result.claimStance).toBe("voldoet_deels");
  });

  it("scheidt een olie met weinig DHA op claimdekking, niet op de hartclaim", () => {
    // Minami-profiel: 590 mg EPA + 130 mg DHA. Samen ruim boven de 250 mg voor
    // de hartclaim, maar de twee DHA-claims vragen elk 250 mg DHA apart.
    const result = computeTrustScore({
      category: "omega-3",
      werkzameStof: "omega3",
      doseringPerDagdosis: {
        hoeveelheid: 850,
        eenheid: "mg",
        elementair: false,
        epaMg: 590,
        dhaMg: 130,
      },
      efsaClaimIds: ["omega3.heart"],
      thirdPartyTested: false,
      formKey: "triglyceride-softgel",
      label: VOLLEDIG_ETIKET,
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
    });

    const claimdekking = result.components.find((c) => c.id === "claimdekking");
    expect(claimdekking?.points).toBeCloseTo(33.3, 1);
    expect(claimdekking?.reden).toContain("1 van de 3");

    // De claim die het product wél voert, haalt hij wel.
    expect(result.claimStance).toBe("voldoet");
  });

  it("laat claimdekking uitvallen bij een stof zonder erkende claims", () => {
    const result = computeTrustScore({
      category: "ashwagandha",
      werkzameStof: "ashwagandha",
      doseringPerDagdosis: { hoeveelheid: 600, eenheid: "mg", elementair: false },
      efsaClaimIds: [],
      thirdPartyTested: false,
      formKey: "ksm-66",
      label: VOLLEDIG_ETIKET,
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
    });

    const claimdekking = result.components.find((c) => c.id === "claimdekking");
    expect(claimdekking?.points).toBeNull();
    expect(claimdekking?.weight).toBe(0);
    expect(result.determinedCount).toBe(4);
  });

  it("vergroot de toetsingsnoemer alleen waar een marker van toepassing is", () => {
    const basis = {
      doseringPerDagdosis: {
        hoeveelheid: 1200,
        eenheid: "mg" as const,
        elementair: false,
        epaMg: 740,
        dhaMg: 460,
      },
      thirdPartyTested: true,
      label: VOLLEDIG_ETIKET,
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
    };

    const visolie = computeTrustScore({
      ...basis,
      category: "omega-3",
      werkzameStof: "omega3",
      efsaClaimIds: ["omega3.heart"],
      formKey: "triglyceride-vloeibaar",
    });
    const creatine = computeTrustScore({
      ...basis,
      category: "creatine",
      werkzameStof: "creatine",
      doseringPerDagdosis: { hoeveelheid: 5, eenheid: "g", elementair: true },
      efsaClaimIds: ["creatine.performance"],
      formKey: "monohydraat",
    });

    const visolieToetsing = visolie.components.find((c) => c.id === "toetsing");
    const creatineToetsing = creatine.components.find((c) => c.id === "toetsing");

    // Zelfde labrapport, maar visolie kent twee extra markers die nog ontbreken.
    expect(creatineToetsing?.points).toBe(70);
    expect(visolieToetsing?.points).toBeLessThan(70);
    expect(visolieToetsing?.reden).toContain("oxidatiewaarde");
  });

  it("is deterministisch — dezelfde invoer geeft dezelfde score", () => {
    expect(computeTrustScore(magnesiumInput()).total).toBe(
      computeTrustScore(magnesiumInput()).total,
    );
  });
});
