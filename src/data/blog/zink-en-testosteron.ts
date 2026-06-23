import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const zinkEnTestosteronData: BlogArtikel = {
  slug: "zink-en-testosteron",
  categorie: "supplementen",
  titel: "Zink en testosteron: wat de EU wél mag zeggen (en wat niet)",
  heroIntro:
    "Zink staat op etiketten vaak in één adem met testosteron — maar de toegestane claim gaat over instandhouding van een normaal testosterongehalte in het bloed bij voldoende inname, niet over een boost. Dit artikel verbindt [testosteron na 40](/testosteron-na-40) met onze [zink-vergelijking](/beste/zink) en het cluster [cortisol en testosteron](/blog/cortisol-en-testosteron).",
  leestijd: "9 min",
  gepubliceerdOp: "2026-05-14",
  laatstBijgewerktOp: "2026-05-14",
  secties: [
    {
      type: "tekst",
      titel: "Claim vs verwachting",
      tekst:
        "Veel marketing suggereert hogere testosteronspiegels door zink. De EU-formulering is voorzichtiger: bij adequate inname draagt zink bij tot instandhouding van een normaal testosterongehalte in het bloed. Dat is geen belofte dat je je anders voelt of dat labwaarden stijgen als je al voldoende zink binnenkrijgt via voeding.",
    },
    {
      type: "tekst",
      titel: "Wanneer zink inhoudelijk ter sprake komt",
      tekst:
        "Bij beperkte inname van zinkrijke voeding (weinig vlees, schaaldieren, noten) kan suppletie logischer zijn — altijd met oog op totale inname en interactie met koper bij hoge doses. Lees [testosteron in de kennisbank](/kennisbank/testosteron) voor context over leeftijd en metingen.",
    },
    {
      type: "opsomming",
      titel: "Praktische volgorde",
      items: [
        "Slaap, krachttraining en stress eerst — zie [stress-pillar](/stress-verminderen-na-40).",
        "Laat hormoonwaarden meten bij aanhoudende klachten; geen zelf-diagnose.",
        "Vergelijk zink op vorm (picolinaat, methionine) en elementaire mg op [/beste/zink](/beste/zink).",
        "Gebruik de [Leefstijlcheck](/intake) om prioriteiten te ordenen.",
      ],
    },
  ],
  samenvatting:
    "Zink hoort bij normale fysiologie — niet bij hormoon-hype. Meet waar nodig, vergelijk transparant en houd leefstijl als basis.",
  supplementCTA: {
    naam: "Zink",
    uitleg: "Let op elementaire mg, vorm en dagelijkse totale inname.",
    href: "/beste/zink",
  },
  cornerstoneLink: {
    label: "Pillar: testosteron na 40",
    href: "/testosteron-na-40",
  },
  gerelateerdeSluggen: [
    "cortisol-en-testosteron",
    "testosteron-en-energie-na-40",
    "vitamine-d-en-energie",
  ],
  metaTitle: "Zink en testosteron: claims en vergelijken | PerfectSupplement",
  metaDescription:
    "Zink en testosteron uitgelegd: EU-claim, wanneer suppletie ter sprake komt en hoe je producten vergelijkt.",
  keywords: ["zink testosteron", "zink supplement mannen", "testosteron na 40"],
  referenties: toRefs([
    "Prasad AS et al. Zinc status and serum testosterone levels in healthy adults. Nutrition. 1996;12(5):344-348.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on zinc health claims.",
    "Institute of Medicine. Dietary Reference Intakes for zinc.",
    "Feldman HA et al. Age trends serum testosterone. J Clin Endocrinol Metab. 2002.",
    "Haase H, Rink L. The immune system and the impact of zinc during aging. Immun Ageing.",
    "National Institutes of Health Office of Dietary Supplements. Zinc Fact Sheet for Health Professionals.",
  ]),
};
