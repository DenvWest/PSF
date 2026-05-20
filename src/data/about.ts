export const ABOUT_METADATA = {
  title:
    "Over PerfectSupplement — Leefstijl, herstel en supplementen | PerfectSupplement",
  description:
    "Onafhankelijk leefstijlplatform voor mannen 40+: educatie, vergelijking en transparantie rond supplementen. Opgericht door fysiotherapeut Dennis van Westbroek — leefstijl eerst, supplementen alleen waar het zinvol is.",
} as const;

export const ABOUT_TAGLINE =
  "De rustige gids tussen leefstijl, herstel en supplementen — voor mannen 40+";

export const ABOUT_SITE_URL = "https://perfectsupplement.nl";

export const ABOUT_FOUNDER = {
  name: "Dennis van Westbroek",
  jobTitle: "Fysiotherapeut & Leefstijlcoach",
  bigNumber: "59930614504",
  credentials: [
    "Fysiotherapeut, ingeschreven in het BIG-register (nr. 59930614504)",
    "Leefstijlcoach — Civabv-erkenning KNGF-keurmerk registratie leefstijlcoaching",
    "Oprichter PerfectSupplement",
  ] as const,
  roleNote:
    "In mijn praktijk ben ik fysiotherapeut binnen het BIG-kader. PerfectSupplement is een afzonderlijk informatieplatform — geen behandelrelatie en geen BIG-zorgverlening via deze site.",
  bioParagraphs: [
    "Al jarenlang werk ik in de fysiotherapie met mannen 40+ die merken dat herstel, slaap en stress meer aandacht vragen dan vroeger — vaak na jaren van hoge werkdruk, sport of een volle agenda.",
    "Op PerfectSupplement spreek ik als oprichter en redacteur, niet als jouw behandelend fysiotherapeut. Ik kijk naar wat in de literatuur en richtlijnen past bij mannen 40+, en waar een supplement wél of géén zinvolle aanvulling is.",
    "Ik claim geen alwetendheid: bij twijfel verwijs ik naar bronnen of naar je arts — supplementen zijn geen vervanging voor professioneel medisch advies.",
  ],
} as const;

/** Vul aan zodra social accounts live zijn */
export const ABOUT_FOUNDER_SAME_AS: string[] = [];

export const ABOUT_HERO = {
  headline: "Eerst grip op de basis. Dan pas supplementen.",
  paragraphs: [
    "De rustige gids tussen leefstijl, herstel en supplementen — voor mannen 40+.",
    "Veel mannen herkennen dit: genoeg uren slaap, maar toch niet uitgerust wakker worden; een hoofd dat 'aan' blijft staan; wisselende energie; minder ruimte om te herstellen na training, werk of drukke periodes. Soms een onrustig gevoel of een buik die niet meewerkt — zonder dat je precies weet waar het vandaan komt.",
    "Veel mannen lopen hier jarenlang mee door zonder overzicht in hun dagelijkse leefstijl. PerfectSupplement is er voor mannen 40+ die eerst grip willen op de basis — en pas daarna willen weten welke supplementen zinvol zijn.",
  ],
} as const;

export const ABOUT_STORY = {
  id: "wie",
  title: "Wie zit hierachter",
  paragraphs: [
    "Dennis van Westbroek weet dat niet alleen vanuit zijn praktijk als fysiotherapeut en leefstijlcoach — maar ook vanuit eigen ervaring.",
    "Jarenlang herkende Dennis in zijn eigen leven het patroon van drukke periodes, minder rust en het gevoel dat herstel en ontspanning steeds meer moeite kostten.",
  ],
} as const;

export const ABOUT_INSIGHT = {
  id: "waarom-leefstijl",
  title: "Wat veel mannen over het hoofd zien",
  paragraphs: [
    "Leefstijlfactoren hangen in het dagelijks leven vaak met elkaar samen — waaronder leefstijl, (ver)binding, autonomie en competentie die niet verzadigd zijn. Veel mannen merken dat als één van die onderdelen langere tijd scheef staat, de rest ook lastiger wordt om te overzien.",
  ],
  vicieuzeCirkel:
    "In de praktijk hoort Dennis vaak hetzelfde verhaal: meer stress, minder rust, minder overzicht — en daardoor weer meer spanning.",
  keyInsightLead:
    "En precies daar gaat het mis met veel gezondheidsadvies online:",
  keyInsight:
    "er wordt gezocht naar één supplement, terwijl de basis in je leefstijl nog niet op orde is.",
} as const;

export const ABOUT_ORIGIN = {
  id: "waarom-perfectsupplement",
  title: "Waarom PerfectSupplement ontstond",
  paragraphs: [
    "PerfectSupplement is ontstaan vanuit die frustratie. Niet omdat supplementen waardeloos zijn — maar omdat ze vaak worden verkocht alsof ze het hele probleem oplossen, terwijl een stabiele leefstijl bijna altijd eerst komt: slaap, stress, voeding, beweging en herstel.",
    "Supplementen kunnen daarin een rol spelen — maar alleen als je weet of een product past bij jouw situatie en levensfase.",
  ],
  positioning: {
    title: "Geen snelle oplossingen — wel richting",
    paragraphs: [
      "PerfectSupplement is de rustige gids tussen leefstijl, herstel en supplementen: eerst overzicht in je leefstijl, daarna pas gericht aanvullen waar het zinvol is.",
    ],
  },
} as const;

export const ABOUT_WHAT_WE_DO = {
  id: "wat-we-doen",
  title: "Wat wij voor je doen",
  leadPhrase: "Eerst inzicht, dan pas aanvullen.",
  brandPrinciple: "Eerst de basis, dan de pil — in die volgorde, altijd.",
  intakeDisclaimer:
    "De Leefstijlcheck is een korte vragenlijst die helpt bij het ordenen van aandachtspunten — geen medische test en geen vervanging voor zorg.",
  privacyNoteBefore: "Je antwoorden worden versleuteld opgeslagen. Lees ons ",
  privacyNoteAfter: " voor hoe wij met gegevens omgaan.",
  privacyLink: {
    href: "/privacy",
    label: "privacybeleid",
  },
  evidenceParagraph:
    "Onze vergelijkingen volgen vaste criteria en waar mogelijk EFSA-toegelaten claims. Per product vind je bronnen en toelichting onderaan de vergelijkingspagina — de volledige uitleg staat op onze methodologiepagina.",
  paragraphs: [
    "Met onze vragenlijst vul je in een paar minuten je antwoorden in over slaap, stress, energie, voeding, beweging en herstel. Je krijgt een overzicht van aandachtspunten en algemene leefstijltips — geen medisch advies en geen persoonlijk behandelplan.",
    "Daarnaast vergelijken wij supplementen op vaste criteria: dosering, biobeschikbaarheid, prijs-kwaliteit en transparantie. Elk product doorloopt hetzelfde stramien — ongeacht het merk.",
    "Dit platform is er niet om je meer te laten kopen. Het is er om je grip te geven: beter begrijpen wat je doet, scherpere keuzes maken en minder afhankelijk te worden van glimmende verpakkingen en halve verhalen.",
  ],
  methodologieLink: {
    href: "/methodologie",
    label: "Lees onze volledige methodologie",
  },
  intakeLink: {
    href: "/intake",
    label: "Doe de Leefstijlcheck",
  },
  whatWeDontDoTitle: "Onze uitgangspunten",
  whatWeDontDo: [
    "Wij vergelijken transparant op dezelfde criteria — ongeacht merk of commissie",
    "Wij stellen geen medische diagnoses, geven geen behandeling en zijn geen vervanging voor je huisarts of specialist — bij aanhoudende klachten: neem contact op met je zorgverlener",
    "Wij verkopen zelf geen supplementen",
    "Wij accepteren geen betaalde reviews of gesponsorde rankings — affiliate-relaties beïnvloeden de scores niet, die volgen vaste criteria",
  ],
} as const;

export const ABOUT_TRUST = {
  id: "vertrouwen",
  title: "Transparantie vinden wij belangrijk",
  intro:
    "Daarom zijn wij ook open over hoe PerfectSupplement geld verdient.",
  paragraphs: [
    "Koop je via onze vergelijkingspagina's bij een partnerwebshop, dan ontvangen wij een kleine commissie — zonder extra kosten voor jou. Daardoor hoeven wij geen eigen producten te verkopen en kunnen wij onafhankelijk beoordelen. Onze affiliate-relaties beïnvloeden de scores niet: die volgen vaste criteria, zie onze methodologie.",
  ],
  affiliateLink: {
    href: "/affiliate-disclosure",
    label: "Affiliate disclosure",
  },
  medicalDisclaimer:
    "Informatief bedoeld. Geen medisch advies, geen diagnose, geen behandeling. Bij klachten of twijfel: raadpleeg je zorgverlener.",
} as const;

export const ABOUT_CREDENTIALS = {
  id: "achtergrond",
  title: "Achtergrond",
} as const;

export const ABOUT_CTA = {
  title: "Krijg overzicht in je leefstijl",
  description:
    "Begin met de Leefstijlcheck: een korte vragenlijst over slaap, stress, energie, voeding, beweging en herstel. Je krijgt een overzicht van aandachtspunten — geen medische test en geen vervanging voor zorg.",
  buttonLabel: "Doe de Leefstijlcheck",
  href: "/intake",
} as const;

export const ABOUT_CONTACT = {
  text: "Vragen of feedback?",
  linkLabel: "Neem contact op",
  href: "/contact",
} as const;
