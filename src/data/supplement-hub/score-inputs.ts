import type { SupplementCategory } from "@/types/supplement";
import type { ProductScoreInputs } from "@/types/supplement-score";

/**
 * SCORE-INVOER PER PRODUCT — de feiten die niet in `src/data/supplements/*.ts`
 * staan omdat die bestanden een paginamodel zijn, geen productmodel.
 *
 * Alles hier is na te lezen op de verpakking of in de webshop. Geen oordelen:
 * die zitten in `score-model.ts` en gelden voor alle producten tegelijk.
 * De vorm, dosering, gekoppelde EFSA-claims en `thirdPartyTested` komen uit het
 * product zelf — die worden hier niet herhaald, om twee waarheden te voorkomen.
 *
 * `product-catalog.test.ts` faalt zodra een product hier ontbreekt of een
 * `formKey` gebruikt die niet in de vormregistratie staat.
 *
 * KWALITEITSMARKERS STAAN ALLEMAAL OP FALSE, en dat is een bevinding, geen
 * gemakzucht: geen van deze fabrikanten publiceert een oxidatiewaarde of een
 * verontreinigingsrapport dat wij hebben kunnen inzien. Zet een marker pas op
 * true als je de gepubliceerde waarde zelf hebt gezien — een keurmerk of
 * testuitslag toeschrijven aan een echt merk dat het niet voert, is een
 * feitelijke bewering over dat bedrijf.
 */
export const PRODUCT_SCORE_INPUTS: Record<
  SupplementCategory,
  Record<string, ProductScoreInputs>
> = {
  magnesium: {
    "vitaminstore-super-magnesium": {
      formKey: "complex-zonder-oxide",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: false,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 43,
      prijsGecontroleerdOp: "2026-04-18",
    },
    "viridian-bisglycinaat": {
      formKey: "bisglycinaat",
      label: {
        werkzameStofGekwantificeerd: false,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden:
        "Het elementaire magnesiumgehalte per capsule staat niet in onze productgegevens. Dosering en claimvoorwaarde zijn daardoor niet te beoordelen.",
      prijsPerEtiketdagCent: 29,
      prijsGecontroleerdOp: "2026-04-18",
    },
    "vital-nutrition-citraat": {
      formKey: "citraat",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 20,
      prijsGecontroleerdOp: "2026-04-18",
    },
  },

  "omega-3": {
    "vitals-liquid-epadha": {
      formKey: "triglyceride-vloeibaar",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { oxidatiewaarde: false, verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 60,
      prijsGecontroleerdOp: "2026-04-18",
    },
    "arctic-blue-visolie": {
      formKey: "triglyceride-vloeibaar",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { oxidatiewaarde: false, verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 58,
      prijsGecontroleerdOp: "2026-04-18",
    },
    "mollers-omega-3-citroen": {
      formKey: "triglyceride-vloeibaar",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { oxidatiewaarde: false, verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 47,
      prijsGecontroleerdOp: "2026-04-18",
    },
    "minami-morepa-original": {
      formKey: "triglyceride-softgel",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { oxidatiewaarde: false, verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 65,
      prijsGecontroleerdOp: "2026-04-18",
    },
  },

  "vitamine-d": {
    "vitaminstore-super-d3": {
      formKey: "d3-cholecalciferol",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: ["Quali-D®"],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 14,
      prijsGecontroleerdOp: "2026-04-21",
    },
    "vitalnutrition-vitamin-d3": {
      formKey: "d3-met-vetdrager",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 20,
      prijsGecontroleerdOp: "2026-04-21",
    },
    "solgar-vitamin-d3": {
      formKey: "d3-cholecalciferol",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 16,
      prijsGecontroleerdOp: "2026-04-21",
    },
  },

  creatine: {
    "vitalnutrition-creatine": {
      formKey: "monohydraat-micronized",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 20,
      prijsGecontroleerdOp: "2026-04-21",
    },
    "mattisson-creatine-creapure": {
      formKey: "monohydraat",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: ["Creapure®"],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 46,
      prijsGecontroleerdOp: "2026-04-21",
    },
    "vitaminstore-creatine": {
      formKey: "monohydraat",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 32,
      prijsGecontroleerdOp: "2026-04-21",
    },
  },

  zink: {
    "vitalnutrition-zink": {
      formKey: "zinkmethionine",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 18,
      prijsGecontroleerdOp: "2026-04-21",
    },
    "solgar-zink-picolinaat": {
      formKey: "zinkpicolinaat",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 16,
      prijsGecontroleerdOp: "2026-04-21",
    },
    "bonusan-zinkmethionine": {
      formKey: "l-optizinc",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: ["L-OptiZinc®"],
      kwaliteitsmarkers: {},
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 19,
      prijsGecontroleerdOp: "2026-04-21",
    },
  },

  ashwagandha: {
    "vitaminstore-ashwagandha-ksm66": {
      formKey: "ksm-66",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 23,
      prijsGecontroleerdOp: "2026-04-19",
    },
    "vitalnutrition-ashwagandha-ksm66": {
      formKey: "ksm-66",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 42,
      prijsGecontroleerdOp: "2026-04-19",
    },
    "vitaminstore-solgar-ashwagandha": {
      formKey: "extract-plus-heel-kruid",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: false,
        proprietaryBlend: true,
      },
      certificeringen: [],
      kwaliteitsmarkers: { verontreinigingstest: false },
      dosisOnzekerReden:
        "Het etiket noemt 4,5 mg withanoliden per capsule, maar niet hoeveel gestandaardiseerd extract erin zit. De dagdosering is daardoor niet te vergelijken met onderzoeksdoseringen.",
      prijsPerEtiketdagCent: 47,
      prijsGecontroleerdOp: "2026-04-19",
    },
  },

  eiwitpoeder: {
    "vital-nutrition-whey-proteine": {
      formKey: "whey-blend",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: false,
        proprietaryBlend: true,
      },
      certificeringen: [],
      kwaliteitsmarkers: { verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 120,
      prijsGecontroleerdOp: "2026-05-03",
    },
    "orangefit-protein": {
      formKey: "erwteneiwit",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 136,
      prijsGecontroleerdOp: "2026-05-03",
    },
    "royal-green-whey-protein-isolate": {
      formKey: "whey-isolaat",
      label: {
        werkzameStofGekwantificeerd: true,
        dagdoseringVermeld: true,
        samenstellingUitgesplitst: true,
        proprietaryBlend: false,
      },
      certificeringen: [],
      kwaliteitsmarkers: { verontreinigingstest: false },
      dosisOnzekerReden: null,
      prijsPerEtiketdagCent: 225,
      prijsGecontroleerdOp: "2026-05-03",
    },
  },

  /** Geen vergelijking: boven 0,3 mg geneesmiddel, eronder claimloos. Zie approved-claims.ts. */
  melatonine: {},
};
