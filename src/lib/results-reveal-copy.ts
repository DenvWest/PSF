/** Copy voor REVEAL — zie docs/copy/results-reveal.md */
export const REVEAL_COPY = {
  eyebrow: "JOUW MOMENTOPNAME · ANONIEM",
  heroTitle: "Dit is waar je nu staat.",
  contextLine: "Datapunt op basis van je antwoorden — geen diagnose, wel richting.",
  pathIntro: "Dit is je leefstijlverhaal — van herkennen waar je staat naar je eerste stap.",
  pathStepProfile: "Herkenning",
  pathStepPriority: "Prioriteit",
  pathStepAction: "Eerste stap",
  pathStepStart: "Jouw startpunt",
  pathStepDashboard: "Jouw dashboard",
  pathStepSave: "Bewaren",
  whereYouStartTitle: "Waar je begint",
  priorityHint: "laagste score bovenaan",
  ladderFocusHint: "Hier begin je",
  lifestyleTrack: "Spoor A · Leefstijl",
  durationBadge: "± 2 minuten",
  dashboardTeaseTitle: "Dit wacht op je in je dashboard",
  dashboardTeaseLead: "Na inloggen staat dit in je dashboard.",
  dashboardMockLabel: "Jouw dashboard",
  dashboardScoreStartHint: "start",
  vitalityScoreEyebrow: "Je vitaliteitsscore",
  vitalityScoreFraming:
    "Geen medische test: we meten hoe goed je leefstijl je vitaliteit ondersteunt — vijf pijlers, elk even zwaar. Energie en herstel zijn je uitlezing.",
  profileEyebrow: "UIT JE ANTWOORDEN",
  profileStepTitle: "Waar je nu staat",
  startStepTitle: "Waar je begint — en je eerste stap",
  startChipsHint: "Je grootste prioriteiten — begin bij de eerste.",
  priorityBridgePrefix: "Je startpunt:",
  dashboardRowPrioritySubProduct: "Je startpunt — supplementen objectief vergeleken op kwaliteit",
  dashboardRowPrioritySubLifestyle: "Je startpunt, plan en voortgang staan klaar",
  firstStepTitle: "Dit heb je nu — en wat er op je wacht",
  firstStepNowLabel: "Nu · leefstijl",
  firstStepNowMeta: "Direct toepasbaar",
  firstStepLaterLabel: "Pas daarna · aanvulling",
  firstStepUpcomingLabel: "In je dashboard",
  firstStepQualifyLabel: "Je profiel past bij:",
  firstStepNoSupplementLead:
    "Eerst je bord en ritme — in je dashboard zie je later of een gerichte aanvulling logisch is.",
  firstStepSupplementHint: "Supplement pas als je bord op orde is",
  firstStepDashboardBridge: "Open je dashboard — stappenplan en vergelijking staan klaar",
  cta: "Bewaar dit in je dashboard →",
  ctaSubtext: "Gratis inloggen — alles staat klaar wanneer jij er tijd voor hebt.",
  ctaTrustLine: "Adviezen, geen diagnoses",
  feedbackBadge: "Validatie",
  feedbackMeta: "5 seconden",
  feedbackEyebrow: "Jouw oordeel",
  feedbackTitle: "Herken je jezelf in dit overzicht?",
  feedbackSubtext: "Eén vraag — helpt ons de index scherper te maken.",
  reminderTitle: "Over 30 dagen meet je opnieuw — wij herinneren je eraan.",
  reminderBody: "Zo zie je of je leefstijl-stappen effect hebben.",
  reminderCta: "Herinnering instellen",
  reminderLoading: "Bezig...",
  reminderSuccess:
    "Herinnering ingesteld — over 30 dagen ontvang je een mail om opnieuw te meten.",
  reminderEmailPlaceholder: "je@email.nl",
  footerPanelSummary: "Hoe komt dit overzicht tot stand?",
  footerMethodIntro:
    "Leefstijl eerst — van herkenning naar één concrete stap, daarna volg je je voortgang in je dashboard.",
  stepTitleRecognition: "Herkenning — waar je nu staat",
  stepTitleStart: "Je startpunt — en eerste stap",
  stepTitleDashboard: "Je dashboard — wat klaarstaat",
  stepTitleSave: "Klaar om door te gaan?",
  firstStepApproachTitle: "Zo kozen we je eerste stap",
} as const;

export const REVEAL_FIRST_STEP_APPROACH = [
  { label: "Grootste prioriteit", detail: "je laagste score eerst" },
  { label: "Minste moeite", detail: "een stap die vandaag al past" },
  { label: "Meeste bewijs", detail: "wat aantoonbaar werkt" },
] as const;

export type RevealDashboardRow = {
  key: string;
  dotColor: string;
  title: string;
  subtitle: string;
  soon: boolean;
};

export const REVEAL_DASHBOARD_ROWS: RevealDashboardRow[] = [
  {
    key: "voortgang",
    dotColor: "#78716c",
    title: "Voortgang & trend",
    subtitle: "Zie of je stappen blijven hangen",
    soon: true,
  },
  {
    key: "hermeting",
    dotColor: "#78716c",
    title: "Hermeting ~30 dagen",
    subtitle: "Je volgende meetmoment staat klaar",
    soon: true,
  },
  {
    key: "afstemmer",
    dotColor: "#78716c",
    title: "Leefstijl & supplement afgestemd",
    subtitle: "Je plan en aanvulling op elkaar afgestemd",
    soon: true,
  },
];

export const REVEAL_DASHBOARD_WINS = [
  "Je score blijft bewaard — geen opnieuw invullen",
  "Prioriteit en volgende stap staan klaar in Kompas",
  "Hermeting over ~30 dagen ingepland",
] as const;

export const REVEAL_FIRST_STEP_UPCOMING = [
  {
    label: "Prijs-kwaliteit vergelijking",
    detail: "Per supplement — onafhankelijk, geen schap-potje",
  },
  {
    label: "Voortgang & trend",
    detail: "Zie of je stappen blijven hangen",
  },
  {
    label: "Hermeting ~30 dagen",
    detail: "Volgende meetmoment automatisch klaar",
  },
] as const;

export const REVEAL_CARD_SHADOW =
  "0 40px 90px -40px rgba(15,28,16,0.55), 0 0 0 1px rgba(255,255,255,0.04)";

export const REVEAL_RING_COPY = {
  eyebrow: "JOUW MOMENTOPNAME \u00b7 ANONIEM",
  ringCenterLabel: "LEEFSTIJL",
  scoreLabel: "Leefstijlscore",
  scaleLabel: (score: number, band: string) =>
    `Je leefstijlscore ${score} van de 100 op de schaal van vijf banden; nu: ${band}.`,
  nextBandLine: (label: string, min: number) => `Volgende band: ${label} vanaf ${min}`,
  topBandLine: "Hoogste band bereikt \u2014 hier houd je vast",
  ringExplainerSummary: "Hoe lees je deze ring?",
  ringExplainer:
    "Elke ring is \u00e9\u00e9n domein: slaap, beweging, voeding, stress en verbinding. Hoe verder de ring gevuld is, hoe sterker dat domein nu scoort. In het midden je leefstijlscore \u2014 het totaalbeeld van die vijf. Dit is je nulmeting: bij je hermeting over ~30 dagen zie je de verschuiving.",
} as const;

export const REVEAL_ROADMAP_COPY = {
  sectionEyebrow: "JE ROUTE",
  sectionTitle: "Je vijf domeinen, samen bekeken",
  sectionLead:
    "Leefstijl werkt niet los per domein \u2014 slaap raakt je energie, stress je herstel. Onderstaand is de volgorde waarin je uitkomst nu om aandacht vraagt; je startpunt staat bovenaan. Tik een domein open.",
  adaptsNote:
    "Deze route past zich aan op je eigen metingen \u2014 een deel staat al, een deel is in aanmaak.",
  rungBasis: "Uit je antwoorden",
  rungNow: "Daarom nu",
  rungSupplement: "Aanvulling \u2014 pas hierna",
  rungLater: "In je dashboard",
  supplementCta: "Vergelijk objectief",
  claimPrefix: "Goedgekeurde EU-claim:",
  noSupplementNote:
    "Voor dit domein is er geen aanvulling met een goedgekeurde claim \u2014 hier doet je ritme het werk.",
  supplementElsewhereNote: (name: string, domain: string) =>
    `${name} dekt dit domein mee \u2014 je keuze staat bij ${domain}.`,
  focusBadge: "Start",
  rankPrefix: "plek",
  listLabel: "Je domeinen, op volgorde",
  soonBadge: "In ontwikkeling",
} as const;

export type RevealDashboardLane = {
  label: string;
  detail: string;
  /** true = bestaat nog niet; krijgt het label "In ontwikkeling" — nooit een datum-belofte. */
  soon: boolean;
};

/**
 * Per domein: wat het dashboard met dit domein doet. `soon: false` mag alleen
 * voor wat er echt staat (check-ins, agenda, voortgang, hermeting, weekprogramma,
 * voedingslog). Begeleiding door een mens staat overal op `soon` — die dienst
 * bestaat nog niet, zie PREMIUM_STATISTIEKEN_VALUE_PROPS.
 */
/**
 * Per domein: wat het dashboard met dit domein doet. `soon: false` mag alleen
 * voor wat er echt staat (check-ins, agenda, voortgang, hermeting, weekprogramma,
 * voedingslog). Wat er nog niet is, staat er als "In ontwikkeling" \u2014 nooit als
 * een dienst met een mens erachter, want die bestaat niet.
 */
export const REVEAL_ROADMAP_DASHBOARD_LANES: Record<string, RevealDashboardLane[]> = {
  slaap: [
    {
      label: "Slaapcheck om de paar weken",
      detail: "Korte hermeting van je avondritme \u2014 je ziet of de afbouw blijft hangen.",
      soon: false,
    },
    {
      label: "Je slaaplijn naast stress en herstel",
      detail: "Welk domein trekt aan je slaap? Dat lees je af, in plaats van te gokken.",
      soon: false,
    },
    {
      label: "Advies dat zich aanscherpt op je eigen metingen",
      detail: "Hoe meer check-ins, hoe preciezer je route \u2014 gerekend, niet geraden.",
      soon: true,
    },
  ],
  beweging: [
    {
      label: "Weekprogramma met je eigen keuze per laag",
      detail: "Van dagelijks bewegen tot specifiek sporten \u2014 jij kiest per laag wat past.",
      soon: false,
    },
    {
      label: "Gedaan-log per sessie",
      detail: "Je minuten als bewijs naast je score \u2014 geen tweede oordeel.",
      soon: false,
    },
  ],
  voeding: [
    {
      label: "Voedingscheck met je inname per dag",
      detail: "Wat je b\u00ednnenkrijgt, niet wat je zou moeten eten.",
      soon: false,
    },
    {
      label: "Eiwitdoel dat meebeweegt met je beweegdagen",
      detail: "Beweeg je stevig, dan ligt je eiwitbehoefte hoger \u2014 je doel schuift mee.",
      soon: true,
    },
  ],
  stress: [
    {
      label: "Ademsessies vast in je agenda",
      detail: "\u00c9\u00e9n moment vastgezet in plaats van \u201cals het uitkomt\u201d.",
      soon: false,
    },
    {
      label: "Stress naast je slaap- en herstellijn",
      detail: "De drie bewegen samen \u2014 in je dashboard zie je welke leidt.",
      soon: false,
    },
  ],
  verbinding: [
    {
      label: "Contactmomenten in je agenda",
      detail: "\u00c9\u00e9n moment per week vastgezet, met een naam erbij.",
      soon: false,
    },
    {
      label: "Hermeting na ~30 dagen",
      detail: "Verbinding meet je op ritme, niet op dagkoers.",
      soon: false,
    },
  ],
};

export const REVEAL_PROPOSITION_COPY = {
  eyebrow: "WAT JE HIERAAN HEBT",
  title: "Eerst meten, dan pas kiezen",
  body: "Je leefstijl is nu gemeten op vijf domeinen. In je dashboard zetten we die uitkomst naast wat er per domein te kiezen valt \u2014 metingen, producten en straks ook diensten. Niet alles wat er is: alleen wat aantoonbaar bij jouw uitkomst past.",
  points: [
    {
      title: "Leefstijl eerst",
      body: "Een aanvulling komt pas als je ritme staat \u2014 nooit als vervanging van de stap ervoor.",
    },
    {
      title: "Alleen met goedgekeurde claim",
      body: "Wat we voorstellen heeft een EU-goedgekeurde claim op stofniveau. Geen claim, geen suggestie.",
    },
    {
      title: "Wij verkopen zelf niets",
      body: "Kopen doe je bij een webshop; wij ontvangen daar een commissie voor. Die be\u00efnvloedt de scores niet \u2014 die volgen vaste criteria.",
    },
  ],
  disclosureHref: "/affiliate-disclosure",
  disclosureLabel: "Hoe wij geld verdienen",
} as const;

export type RevealTrackKey = "supplement" | "dashboard";

export const REVEAL_TRACK_COPY = {
  eyebrow: "HOE WIL JE VERDER?",
  title: "Twee routes — kies wat bij je past",
  lead: "Allebei blijven open. Je kunt later alsnog de andere kant op.",
  tracks: [
    {
      key: "supplement" as RevealTrackKey,
      badge: "Geen account nodig",
      title: "Alleen het supplementadvies",
      body: "Direct naar de supplementengids, al gezet op de categorie die bij je uitkomst past — PS-Score, EU-claim en prijs per dag naast elkaar.",
      bullets: [
        "De categorie die bij je laagste domein hoort",
        "Alle producten langs dezelfde meetlat",
        "Geen mail, geen account",
      ],
      cta: "Naar het supplementadvies",
    },
    {
      key: "dashboard" as RevealTrackKey,
      badge: "Gratis account",
      title: "Volg het volledig",
      body: "Je leefstijlring blijft bewaard, je route per domein staat klaar en over ~30 dagen meet je opnieuw.",
      bullets: [
        "Je uitkomst blijft bewaard — nooit opnieuw invullen",
        "Route en volgende stap per domein",
        "Hermeting over ~30 dagen ingepland",
      ],
      cta: "Bewaar in je dashboard",
    },
  ],
} as const;
