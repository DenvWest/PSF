import type { ThemaPageData } from "@/types/thema";
import { INTAKE_CTA, INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";

export const herstelThema: ThemaPageData = {
  slug: "herstel",
  title: "Herstel",
  heroTitle: "Herstel is waar groei begint",
  heroSubtitle:
    "Je traint, je werkt, je doet alles goed — maar je lichaam herstelt niet meer zoals vroeger. Spierpijn die dagen aanhoudt, stijfheid bij het opstaan, of een vermoeidheid die niet weggaat met een nachtje slaap. Na 40 verandert je herstelvermogen. Dat is fysiologisch — maar je kunt er veel aan doen.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Na een training heb ik twee dagen spierpijn.",
      "Ik ben altijd stijf als ik 's ochtends opsta.",
      "Ik sport veel, maar word niet sterker.",
      "In het weekend slaap ik uit, maar het helpt niet echt.",
      "Ik kan niet meer 'aan' en 'uit' schakelen — het draait altijd door.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waarom herstel verandert na 40",
    intro:
      "Na je 40e verandert hoe snel je lichaam weefsel herstelt en spieren opbouwt. Dat zit in hormonen, slaap, eiwitrespons en ontstekingsbalans — geen gebrek aan discipline, wel andere fysiologie.",
    items: [
      {
        title: "Spiereiwitaanmaak (MPS) wordt trager",
        description:
          "Muscle protein synthesis daalt — je hebt meer eiwit nodig per maaltijd (minimaal 30 g per keer) om dezelfde respons te triggeren als vroeger.",
        icon: "🧬",
        source: "Moore et al., J Gerontol A Biol Sci Med Sci, 2015",
      },
      {
        title: "Cortisol en herstel",
        description:
          "Cortisolniveaus reageren trager op herstel — chronische stress houdt cortisol hoog, wat spieropbouw en weefselreparatie remt.",
        icon: "📈",
        source: "Chrousos GP, Nat Rev Endocrinol, 2009",
      },
      {
        title: "Slaapkwaliteit en N3",
        description:
          "Slaapkwaliteit daalt met leeftijd — en diepe slaap (N3) is de fase waarin groeihormoon vrijkomt en het meeste fysieke herstel plaatsvindt.",
        icon: "🌙",
        source: "Ohayon et al., Sleep, 2004 (meta-analyse)",
      },
      {
        title: "Lichte chronische ontsteking (inflammaging)",
        description:
          "Dit neemt toe en remt spier- en weefselherstel; het draagt bij aan stijfheid en pijn die langer blijven hangen.",
        icon: "🔥",
        source: "Franceschi et al., Nat Rev Immunol, 2018",
      },
    ],
  },

  scienceBlock: {
    sectionLabel: "WAT ONDERZOEK LAAT ZIEN",
    title: "De wetenschap achter trager herstel na je 40e",
    intro: "Geen meningen, maar meetbare feiten uit peer-reviewed onderzoek.",
    facts: [
      {
        claim:
          "Spierproteïnesynthese reageert minder sterk op kleine eiwitdoseringen naarmate je ouder wordt (anabole resistentie).",
        source: "Burd et al., Exerc Sport Sci Rev, 2013",
      },
      {
        claim:
          "Diepe slaap neemt met de leeftijd af, terwijl juist in deze fase de sterkste fysieke herstelprocessen plaatsvinden.",
        source: "Ohayon et al., Sleep, 2004 (meta-analyse)",
      },
      {
        claim:
          "Chronisch verhoogd cortisol hangt samen met afbraakprocessen in spierweefsel en langzamer herstel na belasting.",
        source: "Chrousos GP, Nat Rev Endocrinol, 2009",
      },
      {
        claim:
          "Creatinesuppletie ondersteunt krachttoename en vetvrije massa bij volwassenen die weerstandstraining doen.",
        source: "Kreider et al., J Int Soc Sports Nutr, 2017 (position stand)",
      },
      {
        claim:
          "Lagere magnesiumstatus komt vaker voor bij suboptimale spierfunctie en vermoeidheidsklachten.",
        source: "Cuciureanu & Vink, Magnes Res, 2011",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "Quick wins: wat je zelf kunt doen",
    items: [
      {
        title: "Minimaal 30 g eiwit per hoofdmaaltijd",
        description:
          "Eieren, kwark, kip, vis, peulvruchten — dit is de drempel voor optimale spiereiwitaanmaak na 40.",
        icon: "🥚",
      },
      {
        title: "Minstens 1 rustdag per 3 trainingsdagen",
        description:
          "Meer trainen is niet altijd beter; geef je lichaam geplande ruimte om te herstellen.",
        icon: "📅",
      },
      {
        title: "Slaap prioriteren: 7–8 uur, vast ritme",
        description:
          "Geen schermen na 21:00 — herstel gebeurt vooral tijdens diepe slaap.",
        icon: "⏰",
      },
      {
        title: "10–15 minuten wandelen na het avondeten",
        description:
          "Een rustige wandeling na het eten wordt in veel protocollen gekoppeld aan rustiger bloedsuiker na de maaltijd en een zachtere overgang naar bedtijd — het sterkste effect krijg je samen met vast slaapritme.",
        icon: "🚶",
      },
      {
        title: "Stretch of foam roll na training",
        description:
          "Niet alleen voor flexibiliteit, maar voor doorbloeding en afvoer van afvalstoffen.",
        icon: "🧘",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Welke supplementen helpen bij herstel",
    intro:
      "Supplementen zijn geen vervanging voor rust, slaap en voeding. Deze vier hebben in onderzoek en praktijk de meeste ondersteuning voor herstel na 40 — klik door naar de gids voor vormen en dosering; bij magnesium, omega-3, creatine en zink ook naar onze productvergelijking.",
    items: [
      {
        name: "Magnesium (glycinaat)",
        reason:
          "Magnesium draagt bij tot de normale werking van spieren en het zenuwstelsel, tot vermindering van vermoeidheid en een normale psychologische functie (EFSA‑context) — logisch nadat trainingsdagen intensief waren, maar nooit een vervanging voor slaap of eiwit uit voeding.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste/magnesium",
        icon: "⚡",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "EPA en DHA dragen onder claimvoorwaarden bij aan hart‑ en hersenfunctie (plus DHA en gezicht). Formuleer herstelverwachting via die kaders — géén EU‑etiketclaim hier op ontsteking of garantie‑celherstel.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste/omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Creatine",
        reason:
          "Creatine ondersteunt fosfaatbuffering voor korte, zware inspanning; de erkende EU‑zin gaat over opeenvolgende zeer korte bursts bij voldoende dagdosis — denk eerst aan slapen en eiwit uit voeding.",
        guideLink: "/supplementen/creatine",
        comparisonLink: "/beste/creatine",
        icon: "💪",
      },
      {
        name: "Zink",
        reason:
          "Zink draagt bij tot normale eiwitsynthese en aan een werkend immuunsysteem en speelt een rol bij veel enzymen — zonder geneesclaims of garanties op bijzondere wondherstelmarketing.",
        guideLink: "/supplementen/zink",
        comparisonLink: "/beste/zink",
        icon: "🔩",
      },
      {
        name: "Eiwitpoeder",
        reason:
          "Eiwitten dragen bij aan de groei en instandhouding van spiermassa. Na je 40e heb je meer eiwit nodig voor hetzelfde herstel — een eiwitpoeder vult dat gat efficiënt aan.",
        guideLink: "/supplementen/eiwitpoeder",
        comparisonLink: "/beste/eiwitpoeder",
        icon: "💪",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS HERSTELGIDS",
    title: "De complete gids voor beter herstel na 40",
    subtitle:
      "Alles over rust, voeding, supplementen en mentaal herstel — in één overzichtelijke PDF. Direct toepasbaar.",
    bulletPoints: [
      "Waarom rustdagen net zo belangrijk zijn als trainingsdagen",
      "Een 7-dagen herstelprotocol dat je deze week kunt starten",
      "Doseerschema's voor magnesium, omega-3, creatine en zink bij herstel",
      "De drie grootste herstelfouten die mannen 40+ maken",
    ],
    ctaText: "Download ter inspiratie",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Herstelgids is onderweg.",
  },

  pillarPage: {
    href: "/herstel-verbeteren-na-40",
    title: "De complete gids: herstel verbeteren na 40",
    description:
      "Van MPS en slaaparchitectuur tot een praktisch weekplan met voeding, training en supplementen. Alles op deze pagina, maar dan volledig uitgewerkt.",
  },

  expertQuote: {
    quote:
      "Mannen boven de 40 die blijven presteren zonder bewust te herstellen, breken hun lichaam sneller af dan ze het opbouwen. Herstel is geen luxe — het is de voorwaarde.",
    author: "Sportfysioloog",
    credential: "Specialisatie inspanningsfysiologie 40+",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten hoe jouw herstel ervoor staat?",
    subtitle:
      `De Leefstijlcheck analyseert je slaap, stress, energie, voeding, beweging en herstel in 15 vragen. ${INTAKE_DELIVERABLE.premiumSubtitleSuffix}`,
    features: [
      "15 vragen, 3 minuten",
      "Scores op 6 leefstijldomeinen",
      INTAKE_DELIVERABLE.premiumFeatureBullet,
      INTAKE_CTA.supplementFeature,
    ],
    ctaText: "Start de Leefstijlcheck",
    ctaLink: "/intake",
    note: "Gratis · Geen account nodig · Anoniem verwerkt",
  },

  relatedArticles: [
    {
      title: "Ademhaling tegen stress: technieken die werken",
      slug: "ademhaling-tegen-stress",
      category: "stress",
    },
    {
      title: "Slaap verbeteren na 40: wat werkt écht?",
      slug: "slaap-verbeteren-40-plus",
      category: "slaap",
    },
    {
      title: "Magnesium en slaapkwaliteit: wat zegt het onderzoek?",
      slug: "magnesium-en-slaapkwaliteit",
      category: "slaap",
    },
  ],

  leesOok: {
    sectionLabel: "MEER NAVIGATIE",
    title: "Lees ook",
    items: [
      {
        context:
          "Herstel begint bij slaap. Zonder diepe slaap herstellen je spieren niet — groeihormoon komt vrij tijdens N3-slaap.",
        href: "/gids/slaap",
        label: "Thema: slaap (nachtrust en herstel)",
      },
      {
        context:
          "Chronische stress houdt cortisol hoog. Cortisol remt spieropbouw en vertraagt weefselreparatie.",
        href: "/gids/stress",
        label: "Thema: stress (cortisol en herstel)",
      },
      {
        context:
          "Slecht herstel vreet aan je energie. Het zijn twee kanten van dezelfde munt — als je niet herstelt, heb je geen brandstof.",
        href: "/gids/energie",
        label: "Thema: energie (herstel en belasting)",
      },
      {
        context:
          "Herstel na inspanning laat soms langer op zich wachten. De Leefstijlcheck laat zien welk domein het eerst aandacht vraagt — zonder medische claims.",
        href: "/intake",
        label: "Herstel onder de loep? Doe de Leefstijlcheck →",
      },
      {
        context:
          "Meer trainen leidt na 40 snel tot overreaching. Herken de signalen voordat overtraining optreedt.",
        href: "/profiel/overtrainer",
        label: "Meer trainen ≠ beter worden. Herken overtraining →",
      },
      {
        context:
          "Magnesium heeft EU‑claims rond onder meer psychologische functie en vermoeidheid; combineer capsules nooit los van voldoende slaap en geleidelijk opgebouwde trainingsbelasting.",
        href: "/beste/magnesium",
        label: "Magnesium ondersteunt je spierherstel →",
      },
    ],
  },

  seo: {
    title:
      "Herstel verbeteren als man 40+ — Slaap, eiwit, cortisol, magnesium, omega-3 | PerfectSupplement",
    description:
      "Waarom herstel na 40 anders is: MPS, cortisol, diepe slaap, inflammaging. Quick wins, supplementen (magnesium, omega-3, creatine, zink) en gerelateerde thema’s — plus gratis herstelgids.",
    canonical: "/gids/herstel",
  },
};
