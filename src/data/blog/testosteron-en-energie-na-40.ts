import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs"

export const testosteronEnEnergieNa40Data: BlogArtikel = {
  slug: "testosteron-en-energie-na-40",
  categorie: "energie",
  titel: "Testosteron en energie na 40: wanneer is actie nodig?",
  heroIntro:
    "Testosteron daalt gemiddeld met 1-2% per jaar vanaf je dertigste — maar ‘laag’ is pas echt betekenisvol in combinatie met klachten en een zorgvuldige diagnose. Zo onderscheid je normale leeftijdsverandering van iets dat medische aandacht verdient.",
  leestijd: "9 min",
  gepubliceerdOp: "2026-03-08",
  laatstBijgewerktOp: "2026-05-23",
  secties: [
    {
      type: "tekst",
      titel: "Hoe testosteron en energie samenhangen",
      tekst:
        "[Testosteron](/kennisbank/testosteron) beïnvloedt spiermassa, botdichtheid, libido, stemming en het gevoel van vitaliteit. Het is geen enkele schakelaar voor vermoeidheid: slaap, schildklier, ijzer, [zink](/beste/zink) en [beste vitamine D-supplementen](/beste/vitamine-d) na meten, stress en depressie kunnen dezelfde symptomen geven. Daarom is ‘even testosteron slikken’ zonder diagnose geen oplossing — en kan het risico’s geven.",
    },
    {
      type: "opsomming",
      titel: "Wanneer een artsbezoek logisch is",
      items: [
        "Aanhoudende vermoeidheid plus duidelijke daling van libido of erectiele functie.",
        "Verlies van spiermassa en kracht ondanks training.",
        "Depressieve klachten zonder duidelijke psychosociale oorzaak — in onderling overleg in kaart te brengen.",
        "Ooit gebruik van anabolen of opioïden — dit vraagt om gerichte endocrinologische evaluatie.",
      ],
    },
    {
      type: "tekst",
      titel: "Wat een diagnose inhoudt",
      tekst:
        "Serumtestosteron wordt bij voorkeur ’s ochtends vroeg gemeten, minstens tweemaal op verschillende dagen, omdat het ritme groot is. Daarnaast kijkt de arts naar SHBG en eventueel vrije testosteron, luteïniserend hormoon en prolactine om primaire vs secundaire oorzaken te onderscheiden. Leefstijl blijft altijd de basis: slaap, krachttraining, gezond gewicht en stressmanagement.",
    },
  ],
  samenvatting:
    "Energie na 40 heeft zelden één hormonale oorzaak. Bij klachten die passen bij laag testosteron hoort een zorgvuldige meting en uitsluiting van andere factoren — geen zelftherapie op basis van een internettest.",
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 40",
    href: "/energie-na-40",
  },
  gerelateerdeSluggen: [
    "cortisol-en-testosteron",
    "zink-en-testosteron",
    "vitamine-d-tekort-herkennen",
    "energie-verhogen-natuurlijk",
    "omega-3-concentratie-energie",
  ],
  metaTitle:
    "Testosteron en energie na 40: symptomen en diagnose | PerfectSupplement",
  metaDescription:
    "Wanneer is laag testosteron relevant voor vermoeidheid? Symptomen, meten ’s ochtends en waarom context belangrijker is dan één getal.",
  keywords: [
    "testosteron mannen 40",
    "laag testosteron symptomen",
    "vermoeidheid testosteron",
  ],
  referenties: toRefs([
    "Harman SM et al. Longitudinal effects aging serum total free sex hormones men Baltimore Longitudinal Aging Study J Clin Endocrinol Metab.",
    "Kaufman JM, Vermeulen A. Decline gonadal function elderly men pathophysiology therapy Endocrine Reviews androgen physiology aging.",
    "Bhasin S et al. Testosterone therapy men hypogonadism JAMA guideline-style clinical testosterone treatment frame.",
    "Travison TG et al. Age trends population-level sex hormones men J Clin Endocrinol Metab secular trends testosterone context.",
    "Corona G et al. Testosterone supplementation body composition lower urinary tract symptoms Clin Endocrinol reviews safety efficacy.",
    "Isidori AM et al. Effects testosterone sexual function meta-analysis Lancet Diabetes Endocrinol.",
  ]),
};
