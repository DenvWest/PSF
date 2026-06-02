import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const omega3EnHerstelData: BlogArtikel = {
  slug: "omega-3-en-herstel",
  categorie: "supplementen",
  titel: "Omega-3 en herstel na 40: EPA/DHA in het herstelplaatje",
  heroIntro:
    "Omega-3 wordt vaak geassocieerd met hart en hersenen — maar in herstelcontext gaat het vooral om of je genoeg [EPA en DHA](/kennisbank/epa-dha) binnenkrijgt en hoe dat past naast slaap, training en [oxidatieve stress](/kennisbank/oxidatieve-stress)-regulatie. Verbind dit met [herstel verbeteren na 40](/herstel-verbeteren-na-40) en vergelijk producten op [/beste/omega-3-supplement](/beste/omega-3-supplement).",
  leestijd: "10 min",
  gepubliceerdOp: "2026-05-14",
  laatstBijgewerktOp: "2026-05-14",
  secties: [
    {
      type: "tekst",
      titel: "Herstel begint met gedrag",
      tekst:
        "Rustdagen, eiwit en slaap bepalen voor een groot deel hoe snel je weer trainbaar bent. Omega-3 is voor veel mannen 40+ vooral relevant als je weinig vette vis eet — niet als vervanging van een deload week.",
    },
    {
      type: "tekst",
      titel: "Waar je op let bij producten",
      tekst:
        "Vergelijk op milligram EPA+DHA per dag, niet op “1000 mg visolie” op de voorkant. Vorm (triglyceride vs ethylester) en zuiverheid tellen mee voor opname en tolerantie.",
    },
    {
      type: "tekst",
      titel: "Profiel en pillar",
      tekst:
        "Herken je veel trainen met weinig buffer? Het profiel [Overtrainer](/profiel/overtrainer) en het artikel [creatine en herstel](/blog/creatine-en-herstel) vullen dit thema aan — elk met eigen focus.",
    },
    {
      type: "opsomming",
      titel: "Stappenplan",
      items: [
        "Eet 2× per week vette vis of kies een supplement met transparante EPA/DHA-waarden.",
        "Neem vetrijke maaltijd mee voor opname.",
        "Check [/intake](/intake) als je meerdere domeinen tegelijk wilt prioriteren.",
      ],
    },
  ],
  samenvatting:
    "Omega-3 ondersteunt officiële gezondheidsclaims rond hart en (bij DHA) hersen/gezicht — in herstel is het vooral een voedingsgat-dingetje naast slaap en training.",
  supplementCTA: {
    naam: "Omega-3 (EPA/DHA)",
    uitleg: "Vergelijk op werkzame mg per dag en prijs per dag.",
    href: "/beste/omega-3-supplement",
  },
  cornerstoneLink: {
    label: "Pillar: herstel verbeteren na 40",
    href: "/herstel-verbeteren-na-40",
  },
  gerelateerdeSluggen: [
    "creatine-en-herstel",
    "omega-3-concentratie-energie",
    "wat-is-omega-3",
  ],
  metaTitle: "Omega-3 en herstel na 40 | PerfectSupplement",
  metaDescription:
    "Omega-3 en herstel: EPA/DHA, vergelijken en koppeling met pillar herstel en profiel overtrainer.",
  keywords: ["omega 3 herstel", "EPA DHA herstel", "omega 3 na 40"],
  referenties: toRefs([
    "Calder PC. Omega-3 fatty acids and inflammatory processes. Nutrients.",
    "Mozaffarian D, Wu JH. Omega-3 fatty acids and cardiovascular disease. J Am Coll Cardiol.",
    "EFSA authorised claims EPA+DHA cardiovascular health.",
    "Meeusen R et al. Overtraining syndrome prevention and treatment. Eur J Sport Sci.",
    "Smith-Ryan AE et al. Nutritional considerations and strategies to facilitate injury recovery. Strength Cond J contexts.",
    "National Institutes of Health Office of Dietary Supplements. Omega-3 Fatty Acids Fact Sheet.",
  ]),
};
