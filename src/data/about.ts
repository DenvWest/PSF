export const ABOUT_METADATA = {
  title:
    "Over PerfectSupplement — Leefstijl, herstel en supplementen | PerfectSupplement",
  description:
    "Voor mannen 40+ met stress, slecht herstel of wisselende energie. Opgericht door fysiotherapeut Dennis van Westbroek — leefstijl eerst, supplementen alleen waar het zinvol is.",
} as const;

export const ABOUT_TAGLINE =
  "De rustige gids tussen leefstijl, herstel en supplementen — voor mannen 40+";

export const ABOUT_SITE_URL = "https://perfectsupplement.nl";

export const ABOUT_FOUNDER = {
  name: "Dennis van Westbroek",
  jobTitle: "Fysiotherapeut & Leefstijlcoach",
  credentials: [
    "Fysiotherapeut (BIG-geregistreerd)",
    "Gecertificeerd leefstijlcoach",
    "Oprichter PerfectSupplement",
  ] as const,
  bio: "Vanuit fysiotherapie en leefstijlcoaching kijk ik naar wat onderbouwd is, wat veilig past in jouw levensfase en waar een pil wél of géén zinvolle aanvulling is. Ik claim geen alwetendheid: bij twijfel verwijs ik naar bronnen of naar je arts — supplementen zijn geen vervanging voor professioneel medisch advies.",
} as const;

/** Vul aan zodra social accounts live zijn */
export const ABOUT_FOUNDER_SAME_AS: string[] = [];

export const ABOUT_HERO = {
  headline: "De rustige gids tussen leefstijl, herstel en supplementen",
  paragraphs: [
    "Je functioneert nog wel — maar niet meer zoals vroeger.",
    "Je slaapt genoeg uren, maar wordt niet uitgerust wakker. Je hoofd blijft 'aan' staan. Je energie schommelt. Je herstelt trager van training, werk of stress. Soms protesteert je buik of voel je je onrustig zonder duidelijke oorzaak.",
    "Veel mannen lopen hier jarenlang mee door zonder echt te begrijpen wat hun lichaam probeert te vertellen. PerfectSupplement is er voor mannen 40+ die eerst grip willen op de basis — en pas daarna willen weten welke supplementen zinvol zijn.",
  ],
} as const;

export const ABOUT_STORY = {
  id: "wie",
  title: "Wie zit hierachter",
  paragraphs: [
    "Dennis van Westbroek weet dat niet alleen vanuit zijn praktijk als fysiotherapeut en leefstijlcoach — maar ook vanuit eigen ervaring.",
    "Jarenlang merkte Dennis hoe stress, slecht herstel en een lichaam dat maar niet echt tot rust kwam zich steeds duidelijker lieten voelen. Niet alleen in vermoeidheid, maar ook in een opgejaagd gevoel, slecht kunnen ontspannen, onrustige slaap en het idee dat zijn lichaam steeds moeilijker terugschakelde na drukke periodes.",
  ],
} as const;

export const ABOUT_INSIGHT = {
  id: "waarom-leefstijl",
  title: "Wat veel mannen over het hoofd zien",
  paragraphs: [
    "Wat veel mensen niet beseffen, is dat chronische stress niet alleen 'tussen je oren' zit. Langdurige stress beïnvloedt de communicatie tussen je brein en je darmen — de hersen-darm-as. Je lichaam blijft als het ware in de 'aan-stand' hangen, herstel vertraagt en klachten zoals vermoeidheid, slechte slaap, opgeblazen gevoel of prikkelbaarheid kunnen elkaar versterken.",
  ],
  vicieuzeCirkel:
    "In de praktijk ziet Dennis vaak dezelfde vicieuze cirkel: stress leidt tot slechter herstel, dat versterkt lichamelijke klachten, en dat verhoogt de stress weer.",
  keyInsightLead:
    "En precies daar gaat het mis met veel gezondheidsadvies online:",
  keyInsight:
    "er wordt gezocht naar één supplement, terwijl de basis ontregeld blijft.",
  links: [
    { href: "/stress-verminderen-man", label: "Stress verminderen na 40" },
    { href: "/slaap-verbeteren-na-40", label: "Slaap verbeteren na 40" },
  ],
} as const;

export const ABOUT_ORIGIN = {
  id: "waarom-perfectsupplement",
  title: "Waarom PerfectSupplement ontstond",
  paragraphs: [
    "PerfectSupplement is ontstaan vanuit die frustratie. Niet omdat supplementen waardeloos zijn — maar omdat ze vaak worden verkocht alsof ze het hele probleem oplossen, terwijl echte gezondheid bijna altijd begint bij slaap, stressregulatie, voeding, beweging en herstel.",
    "Supplementen kunnen daarin ondersteunen — maar alleen als ze passen bij wat jouw lichaam daadwerkelijk nodig heeft.",
  ],
  positioning: {
    title: "Geen snelle oplossingen — wel richting",
    paragraphs: [
      "Dennis van Westbroek wil niet de zoveelste supplementvergelijker zijn die snel een top 10 verkoopt.",
      "Hij wil de rustige gids zijn tussen leefstijl, herstel en supplementen: eerst begrijpen waar jij staat, daarna pas gericht aanvullen waar het zinvol is.",
    ],
  },
} as const;

export const ABOUT_WHAT_WE_DO = {
  id: "wat-we-doen",
  title: "Wat we voor je doen",
  paragraphs: [
    "Eerst inzicht, dan pas aanvullen. Met de gratis Leefstijlcheck breng je in drie minuten je slaap, stress, energie, voeding, beweging en herstel in kaart. Op basis daarvan krijg je gerichte suggesties — eerst leefstijlaanpassingen, daarna pas supplementen die aansluiten.",
    "Daarnaast vergelijken we supplementen op vaste criteria: dosering, biobeschikbaarheid, prijs-kwaliteit en transparantie. Elk product doorloopt hetzelfde stramien — ongeacht het merk.",
    "Dit platform is er niet om je meer te laten kopen. Het is er om je grip te geven: beter begrijpen wat je doet, scherpere keuzes maken en minder afhankelijk te worden van glimmende verpakkingen en halve verhalen.",
  ],
  methodologieLink: {
    href: "/methodologie",
    label: "Lees onze volledige methodologie",
  },
  intakeLink: {
    href: "/intake",
    label: "Doe de gratis Leefstijlcheck",
  },
  whatWeDontDoTitle: "Waar je ons níet voor gebruikt",
  whatWeDontDo: [
    "We stellen geen medische diagnoses — bij aanhoudende klachten: neem contact op met je huisarts of specialist",
    "We verkopen zelf geen supplementen",
    "We accepteren geen betaalde reviews of gesponsorde rankings",
    "We benoemen ook nadelen en zwakke punten van producten",
  ],
} as const;

export const ABOUT_TRUST = {
  id: "vertrouwen",
  title: "Transparantie vinden we belangrijk",
  intro:
    "Daarom zijn we ook open over hoe PerfectSupplement geld verdient.",
  paragraphs: [
    "Koop je via onze vergelijkingspagina's bij een partnerwebshop, dan ontvangen wij een kleine commissie — zonder extra kosten voor jou. Daardoor hoeven we geen eigen producten te verkopen en kunnen we onafhankelijk beoordelen.",
  ],
  affiliateLink: {
    href: "/affiliate-disclosure",
    label: "Affiliate disclosure",
  },
  medicalDisclaimer:
    "Geen medisch advies. Geeft inzicht in leefstijlpatronen. Raadpleeg bij klachten altijd je zorgverlener.",
} as const;

export const ABOUT_CREDENTIALS = {
  id: "achtergrond",
  title: "Achtergrond",
} as const;

export const ABOUT_CTA = {
  title: "Ontdek waar jij staat",
  description:
    "Begin met de gratis Leefstijlcheck en ontdek waar jouw lichaam waarschijnlijk het meest om herstel vraagt — in slaap, stress, energie en belastbaarheid.",
  buttonLabel: "Doe de gratis Leefstijlcheck",
  href: "/intake",
} as const;

export const ABOUT_CONTACT = {
  text: "Vragen of feedback?",
  linkLabel: "Neem contact op",
  href: "/contact",
} as const;
