import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs"

export const omega3ConcentratieEnergieData: BlogArtikel = {
  slug: "omega-3-concentratie-energie",
  categorie: "energie",
  titel: "Omega-3, concentratie en energie: wat zegt de wetenschap?",
  heroIntro:
    "EPA en DHA spelen een rol in hersenstructuur en ontstekingsregulatie. Word je daar mentaal energieker van? Een eerlijke afweging van wat studies wel en niet aantonen — zonder marketingclaims.",
  leestijd: "8 min",
  gepubliceerdOp: "2026-03-05",
  secties: [
    {
      type: "tekst",
      titel: "Het biologische verhaal",
      tekst:
        "[EPA en DHA uit visolie of algenolie](/beste/omega-3-supplement): DHA is prominent aanwezig in hersenweefsel; EPA wordt vaker gekoppeld aan ontstekingsmodulatie en stemming. Een tekort aan omega-3 vetzuren kan theoretisch cognitieve en stemmingsaspecten beïnvloeden — maar de meeste mensen in hoog-inkomenslanden krijgen wel enkele omega-3 binnen; de vraag is of suppletie extra voordeel geeft boven een matige basisinname.",
    },
    {
      type: "opsomming",
      titel: "Wat onderzoek voorzichtig suggereert",
      items: [
        "Sommige meta-analyses melden lichte verschillen in stemming bij suppletie; effecten zijn bescheiden en inconsistent. Angst- en stemmingstoornissen horen thuis bij zorg.",
        "Cognitieve tests bij gezonde volwassenen tonen geen dramatische boost; mogelijk relevanter bij lage baseline-inname of ouderen.",
        "Cardiovasculaire en ontstekingsmarkers kunnen verbeteren — dat is indirect relevant voor algeheel welbevinden.",
      ],
    },
    {
      type: "tekst",
      titel: "Praktisch: wanneer heeft het zin?",
      tekst:
        "Als je weinig vette vis eet en weinig ALA uit plantaardige bronnen, is suppletie met [beste omega-3 supplementen (visolie of algenolie)](/beste/omega-3-supplement) een logische aanvulling. Kies op basis van EPA+DHA per portie en zuiverheid (zware metalen, oxidatie), niet op basis van ‘mega focus’-claims. Voor energie en concentratie blijven slaap, beweging, bloedsuiker en stressmanagement de hoofdhefbomen — omega-3 is ondersteunend, zelden doorslaggevend op zichzelf.",
    },
  ],
  samenvatting:
    "Omega-3 kan een ondersteunende rol spelen rond ontsteking en DHA in hersenweefsel; harde ‘meer energie’-beloftes zijn uit de literatuur niet te halen. Zinvol bij lage visinname; kies kwaliteit (EPA/DHA, zuiverheid).",
  supplementCTA: {
    naam: "Omega-3",
    uitleg:
      "EPA en DHA vergelijken, prijs per dag en kwaliteit — dezelfde inhoudelijke criteria als elders op PerfectSupplement.",
    href: "/supplementen/omega-3",
  },
  cornerstoneLink: {
    label: "Oplossingen bij energieklachten",
    href: "/gids/energie",
  },
  gerelateerdeSluggen: [
    "omega-3-en-herstel",
    "energie-verhogen-natuurlijk",
    "vitamine-d-tekort-herkennen",
    "testosteron-en-energie-na-40",
  ],
  metaTitle:
    "Omega-3 en energie/concentratie: wat is bewezen? | PerfectSupplement",
  metaDescription:
    "Helpt omega-3 bij concentratie en energie? Eerlijke uitleg over EPA/DHA, studies en wanneer suppletie logisch is voor mannen 40+.",
  keywords: [
    "omega 3 energie",
    "EPA DHA concentratie",
    "omega 3 hersenen",
  ],
  referenties: toRefs([
    "Mozaffarian D, Wu JH. Omega-3 fatty acids and cardiovascular disease: effects optimal intake. Circulation contexts / major reviews.",
    "Swanson D, Block R, Mousa SA. Omega-3 fatty acids EPA DHA biomedical aspects. Adv Nutr. omega-3 overview reviews.",
    "EFSA Scientific Opinion — EPA+DHA cardio claim conditions (authorised EU nutrient claim dossier reference).",
    "Calder PC. Functional roles fatty acids adipose inflammation brain — immunology neuroscience contexts relevant cognitive energy narrative.",
    "Richardson AJ. Omega-3 fatty acids behaviour learning disorders — methodological neurodevelopment reviews.",
    "Innis SM. Essential fatty acids growth development — clinical metabolism overview DHA brain incorporation.",
  ]),
};
