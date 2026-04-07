import type { SymptoomData, OorzakenData, OplossingenData } from "@/types/symptomen";

export const stressHub: SymptoomData = {
  slug: "stress",
  label: "Stress",
  metaTitle: "Stress bij mannen 40+ | Herken de signalen | PerfectSupplement",
  metaDescription:
    "Herken je de signalen van chronische stress? Ontdek de oorzaken en concrete oplossingen voor mannen boven de 40.",
  heroTitle: "Stress na je 40e: het is geen zwakte",
  heroIntro:
    "Je functioneert, maar het kost meer dan het zou moeten. Die constante spanning in je schouders, het korte lontje, het gevoel dat je altijd achter de feiten aanloopt — dat is geen karakter, dat is chronische stress.",
  herkenning:
    "Je herkent het misschien niet eens als stress. Het voelt eerder als moeheid, als ongeduld, als het gevoel dat alles net iets te veel is. Maar de signalen zijn er wel.",
  ctaOorzaken: "Waar komt het vandaan?",
  ctaOplossingen: "Wat kun je eraan doen?",
};

export const stressOorzaken: OorzakenData = {
  slug: "stress",
  metaTitle: "Oorzaken van stress bij mannen 40+ | PerfectSupplement",
  metaDescription:
    "Waarom ervaar je meer stress na je 40e? Van hormonale veranderingen tot werkdruk — ontdek de 4 categorieën oorzaken.",
  h1: "Stress bij mannen 40+: waar komt het vandaan?",
  intro:
    "Je slaapt slechter, hebt meer verantwoordelijkheden en je lichaam reageert anders dan tien jaar geleden. Dat is geen toeval — er zijn concrete oorzaken voor die sluipende spanning. Hieronder zie je waar stress bij mannen 40+ vandaan komt, in vier herkenbare categorieën.",
  h2Titel: "Waar komt die stress vandaan?",
  categorieen: [
    {
      titel: "Leefstijl — de basis die scheef staat",
      kernboodschap:
        "Slechte slaap, eenzijdige voeding en te weinig beweging zijn geen gevolgen van stress — ze zijn vaak de oorzaak.",
      voorbeelden: [
        "Minder dan 6 uur slaap per nacht verstoort je cortisolritme al na drie dagen",
        "Een tekort aan magnesium en B-vitamines remt het zenuwstelsel in zijn herstelfunctie",
      ],
      blogLink: {
        href: "/blog/cortisol-verlagen-natuurlijk",
        titel: "Cortisol verlagen: 5 bewezen methodes zonder medicatie",
      },
    },
    {
      titel: "Mentaal & emotioneel — de stille stressbronnen",
      kernboodschap:
        "Piekeren, controle willen houden en het gevoel dat je identiteit verschuift zijn stressbronnen die mannen zelden benoemen.",
      voorbeelden: [
        "Het gevoel dat je altijd 'aan' moet staan — op werk, thuis, sociaal",
        "Twijfel over richting: 'Is dit het?' zonder dat je er met iemand over praat",
      ],
      blogLink: {
        href: "/blog/ademhaling-tegen-stress",
        titel: "Ademhalingstechnieken die binnen 5 minuten werken",
      },
    },
    {
      titel: "Werk & omgeving — druk die je niet zelf kiest",
      kernboodschap:
        "Hoge verwachtingen, onduidelijke grenzen en het gevoel onmisbaar te moeten zijn zorgen voor chronische druk.",
      voorbeelden: [
        "Leidinggevende rol waarin je andermans problemen absorbeert",
        "Geen ruimte om 'nee' te zeggen zonder consequenties te voelen",
      ],
      blogLink: {
        href: "/blog/stress-werk-grenzen-stellen",
        titel: "Grenzen stellen op werk zonder je carrière te saboteren",
      },
    },
    {
      titel: "Fysiek & hormonaal — wat je lichaam stilletjes verandert",
      kernboodschap:
        "Na je 40e dalen testosteron en groeihormoon geleidelijk, terwijl cortisol sneller piekt en trager zakt — dat maakt je fysiologisch kwetsbaarder voor stress.",
      voorbeelden: [
        "Testosterondaling (1-2% per jaar) vermindert veerkracht en motivatie",
        "Chronisch verhoogd cortisol remt spieropbouw, verstoort slaap en versterkt buikvet",
      ],
      blogLink: {
        href: "/blog/ashwagandha-werking-mannen",
        titel: "Ashwagandha voor mannen: wat zegt het onderzoek?",
      },
    },
  ],
  afsluitingTitel: "Herkenbaar? Dit kun je eraan doen",
  afsluitingTekst:
    "Nu je weet waar het vandaan komt, is de volgende stap: wat kun je er concreet aan doen — van simpele aanpassingen tot diepere veranderingen.",
  ctaOplossingen: {
    label: "Bekijk oplossingen voor stress",
    href: "/symptomen/stress/oplossingen",
  },
};

export const stressOplossingen: OplossingenData = {
  slug: "stress",
  metaTitle: "Stress verminderen als man 40+ | Wat werkt écht | PerfectSupplement",
  metaDescription:
    "Van direct toepasbare tips tot structurele verandering. Ontdek wat werkt tegen stress voor mannen boven de 40.",
  h1: "Stress verminderen: wat werkt écht voor mannen 40+?",
  intro:
    "Stress aanpakken werkt het beste in lagen. Sommige dingen kun je vandaag al doen, andere kosten wat meer tijd. Hieronder vind je drie niveaus — begin waar het voor jou logisch voelt.",
  niveaus: [
    {
      niveau: 1,
      titel: "Niveau 1 — Direct toepasbaar",
      kernboodschap:
        "Kleine ingrepen met merkbaar effect, zonder dat je je leven hoeft om te gooien.",
      oplossingen: [
        {
          titel: "Ademhalingstechniek (4-7-8)",
          uitleg: "Activeert het parasympathisch zenuwstelsel en verlaagt cortisol in minuten.",
        },
        {
          titel: "Beeldschermstop 60 min voor bed",
          uitleg: "Vermindert blauwe lichtblootstelling en verbetert melatonineaanmaak.",
        },
        {
          titel: "20 minuten wandelen na lunch",
          uitleg: "Verlaagt bloedsuikerpiek en geeft mentale reset halverwege de dag.",
        },
      ],
      blogLinks: [
        {
          href: "/blog/ademhaling-tegen-stress",
          titel: "Ademhalingstechnieken die binnen 5 minuten werken",
        },
      ],
      supplement: {
        naam: "Magnesium (glycinaat)",
        uitleg: "Helpt bij spierontspanning en slaapkwaliteit.",
        href: "/supplementen/magnesium",
      },
    },
    {
      niveau: 2,
      titel: "Niveau 2 — Gedrag & leefstijl",
      kernboodschap:
        "Gewoontes die je in 2-4 weken kunt opbouwen en die de basis van je stressbestendigheid versterken.",
      oplossingen: [
        {
          titel: "Vast slaapritme aanhouden",
          uitleg: "Een consistent bioritme is de grootste hefboom voor cortisolregulatie.",
        },
        {
          titel: "Krachttraining 2-3x per week",
          uitleg: "Verhoogt testosteron, verlaagt cortisol en verbetert stemming meetbaar.",
        },
        {
          titel: "Eén ding per week schrappen",
          uitleg: "Bewust ruimte maken is effectiever dan 'beter plannen'.",
        },
        {
          titel: "Eiwitinname verhogen naar 1,6 g/kg",
          uitleg: "Ondersteunt spierherstel en stabiliseert energieniveau door de dag.",
        },
      ],
      blogLinks: [
        {
          href: "/blog/cortisol-verlagen-natuurlijk",
          titel: "Cortisol verlagen: 5 bewezen methodes zonder medicatie",
        },
        {
          href: "/blog/slaaphygiene-mannen-40-plus",
          titel: "Slaaphygiëne: wat wél werkt na je 40e",
        },
      ],
      supplement: {
        naam: "Ashwagandha (KSM-66)",
        uitleg: "Verlaagt cortisol en ondersteunt stressherstel.",
        href: "/supplementen/ashwagandha",
      },
    },
    {
      niveau: 3,
      titel: "Niveau 3 — Dieper werk",
      kernboodschap:
        "Als stress een patroon is geworden, vraagt dat om verandering op een dieper niveau — in hoe je denkt, werkt en grenzen stelt.",
      oplossingen: [
        {
          titel: "Professionele begeleiding (coach/psycholoog)",
          uitleg: "Een buitenstaander ziet patronen die je zelf normaliseert.",
        },
        {
          titel: "Grenzen stellen op werk",
          uitleg:
            "Chronische beschikbaarheid is geen loyaliteit, het is een gewoonte die je kunt afleren.",
        },
        {
          titel: "Hormonale check via huisarts",
          uitleg: "Laat testosteron, schildklier en cortisol meten als basis voor verdere stappen.",
        },
      ],
      blogLinks: [
        {
          href: "/blog/testosteron-en-energie-na-40",
          titel: "Testosteron en energie na 40: wanneer is actie nodig?",
        },
        {
          href: "/blog/stress-werk-grenzen-stellen",
          titel: "Grenzen stellen op werk zonder je carrière te saboteren",
        },
      ],
      supplement: {
        naam: "Omega-3 (EPA/DHA)",
        uitleg: "Ondersteunt hersenwerking en dempt ontstekingsreacties bij chronische stress.",
        href: "/supplementen/omega-3",
      },
    },
  ],
  cta: {
    titel: "Weet je niet waar je moet beginnen?",
    tekst:
      "Iedereen begint ergens anders. Binnenkort lanceren we een korte vragenlijst die op basis van jouw situatie een persoonlijk startpunt voorstelt — welk niveau, welke stappen, en welke supplementen het beste passen.",
    knopLabel: "Doe de gratis stresscheck",
    knopDisabled: true,
    secundaireLink: {
      label: "Lees meer over supplementen bij stress",
      href: "/supplementen/ashwagandha",
    },
  },
};
