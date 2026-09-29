import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";

export const ABOUT_METADATA = {
  title: "Over PerfectSupplement — Voeding eerst, supplement als aanvulling",
  description:
    "Onafhankelijk platform voor mannen en vrouwen vanaf 30. Opgericht door leefstijlcoach Dennis van Westbroek, vanuit sport en dagelijkse leefstijl: eerst je voeding, supplementen alleen waar voeding niet volstaat.",
} as const;

export const ABOUT_TAGLINE =
  "Onafhankelijk over voeding en supplementen — eerst je bord, dan pas de pil";

export const ABOUT_SITE_URL = "https://perfectsupplement.nl";

export const ABOUT_FOUNDER = {
  name: "Dennis van Westbroek",
  jobTitle: "Leefstijlcoach",
  founderSchemaDescription:
    "Leefstijlcoach en oprichter van PerfectSupplement",
  credentialsLine: "Leefstijlcoach · Oprichter PerfectSupplement",
  bioParagraphs: [
    "PerfectSupplement is opgericht vanuit één vraag: wat kun je met voeding oplossen, en waar is een supplement een eerlijke aanvulling? Het platform vertaalt literatuur en richtlijnen naar heldere vergelijkingen — zonder verkooppraat.",
    "Op dit platform spreek ik als oprichter en redacteur, niet als jouw zorgverlener. Er is geen behandelrelatie via deze site en PerfectSupplement levert geen medische zorg. Voor klachten of behandeling: raadpleeg een arts of zorgverlener in je regio.",
    "Ik claim geen alwetendheid: bij twijfel verwijs ik naar bronnen of naar je arts. Supplementen zijn nooit een vervanging voor professioneel medisch advies.",
  ],
} as const;

/** Vul aan zodra social accounts live zijn */
export const ABOUT_FOUNDER_SAME_AS: string[] = [];

export const ABOUT_HERO = {
  headline: "Eerst je voeding. Dan pas een supplement.",
  paragraphs: [
    "Onafhankelijk over voeding en supplementen — voor mannen en vrouwen vanaf 30.",
    "Veel mensen herkennen dit: genoeg uren slaap, maar toch niet uitgerust wakker worden; een middagdip die elke dag terugkomt; herstel dat na training of een drukke week langer duurt. En dan volgt de reflex: welk supplement lost dit op?",
    "Vanaf ongeveer dertig wordt de basis belangrijker dan toen alles nog vanzelf ging. Wat je eet bepaalt veel van hoe je slaapt, herstelt en je energie verdeelt. PerfectSupplement is er voor mannen en vrouwen die eerst willen weten wat er op hun bord ontbreekt, vóór ze een pil kopen.",
  ],
} as const;

export const ABOUT_STORY = {
  id: "wie",
  title: "Waarom ik dit doe",
  paragraphs: [
    "Ik ben Dennis. Sporten en een gezonde dagelijkse leefstijl horen al jaren bij mijn leven — en daarmee ook de vraag wat je lichaam nodig heeft om te blijven presteren en herstellen.",
    "Wie sport, komt vanzelf in de wereld van supplementen terecht. Ik zag hoe makkelijk je daar verdwaalt: elke week een nieuw product dat 'het verschil maakt', terwijl mijn eigen resultaat vooral kwam van gewone dingen — genoeg eten, genoeg eiwit, slaap, ritme.",
    "Als leefstijlcoach hoor ik hetzelfde verhaal terug: mensen die al drie potjes in de kast hebben staan, maar nooit hebben gekeken naar wat ze op een gewone dag eten. Daar begint PerfectSupplement.",
  ],
} as const;

export const ABOUT_INSIGHT = {
  id: "waarom-voeding-eerst",
  title: "Waarom voeding eerst, en supplement als aanvulling",
  paragraphs: [
    "Een supplement is een aanvulling. Het woord zegt het al: het vult aan wat er al ligt. Ligt er een stevige basis van voeding, slaap en beweging, dan kan een supplement daar iets aan toevoegen. Ligt die basis er niet, dan vult een pil vooral een gat dat je eerst met eten had kunnen dichten.",
  ],
  vicieuzeCirkel:
    "Voeding levert bovendien meer dan losse stoffen: eiwit, vezels, vetzuren, vitamines en mineralen komen samen in gewoon eten, en je lichaam is daar op gebouwd.",
  keyInsightLead:
    "Toch draait veel online advies om het omgekeerde:",
  keyInsight:
    "één supplement als oplossing, aangeprezen door influencers en webshops die vooral verdienen aan de verkoop — en veel minder aan de vraag of jij dat product wel nodig hebt.",
  nuanceTitle: "Wat voeding kan oplossen — en wat misschien niet",
  nuanceIntro:
    "Eerlijk is ook: voeding lost niet alles op. Dit is de nuance.",
  solvesTitle: "Meestal eerst met voeding aan te pakken",
  solves: [
    "Te weinig eiwit, vezels of groenten op een gewone dag",
    "Een onregelmatig eetritme dat energie en herstel raakt",
    "Weinig vette vis, noten of peulvruchten in je week",
    "Een bord dat door drukte steeds eenzijdiger wordt",
  ],
  limitsTitle: "Waar voeding alleen soms niet volstaat",
  limits: [
    "Vitamine D, vooral in de Nederlandse winter en voor bepaalde groepen, zoals de Gezondheidsraad aangeeft",
    "Vitamine B12 als je geen dierlijke producten eet",
    "Omega-3 als vis niet op je bord komt",
    "Situaties met een aangetoond tekort, een dieet of medicatie: bespreek dat met je huisarts",
  ],
  nuanceOutro:
    "Dit is algemene informatie, geen persoonlijk advies. Twijfel je, laat dan eerst je huisarts of een diëtist meekijken.",
} as const;

export const ABOUT_ORIGIN = {
  id: "waarom-perfectsupplement",
  title: "Waarom PerfectSupplement ontstond",
  paragraphs: [
    "PerfectSupplement is ontstaan vanuit frustratie over hoe supplementen worden verkocht. Niet omdat supplementen waardeloos zijn — maar omdat influencers en aanbieders van voedingssupplementen met een eigen merk of commissie te veel ruimte krijgen, terwijl de vraag wat je eigen voeding al dekt bijna nooit wordt gesteld.",
    "Een supplement kan een rol spelen, maar alleen als je weet of het bij jouw situatie past, met vaste criteria en bronnen — niet omdat iemand eraan verdient.",
  ],
  positioning: {
    title: "Geen snelle oplossingen — wel richting",
    paragraphs: [
      "PerfectSupplement is de onafhankelijke gids tussen voeding en supplementen: eerst inzicht in wat je eet, daarna pas gericht aanvullen waar dat zinvol is.",
    ],
  },
} as const;

export const ABOUT_WHAT_WE_DO = {
  id: "wat-we-doen",
  title: "Wat wij voor je doen",
  leadPhrase: "Eerst inzicht in je voeding, dan pas aanvullen.",
  intakeDisclaimer:
    "De check 'Wat mis je?' is een korte vragenlijst die helpt bij het ordenen van aandachtspunten in je voeding — geen medische test en geen vervanging voor zorg.",
  privacyNoteBefore: "Je antwoorden worden versleuteld opgeslagen. Lees ons ",
  privacyNoteAfter: " voor hoe wij met gegevens omgaan.",
  privacyLink: {
    href: "/privacy",
    label: "privacybeleid",
  },
  evidenceParagraph:
    "Onze vergelijkingen volgen vaste criteria en waar mogelijk EFSA-toegelaten claims. Per product vind je bronnen en toelichting onderaan de vergelijkingspagina — de volledige uitleg staat op onze methodologiepagina.",
  paragraphs: [
    "Met de check 'Wat mis je?' zie je in een paar minuten welke voedingsstoffen je bord waarschijnlijk tekortkomt, en wat je daar met eten aan kunt doen. Soms is het antwoord een supplement, vaak is het twee keer per week vette vis. Geen medisch advies en geen persoonlijk behandelplan.",
    "Daarnaast vergelijken wij supplementen op vaste criteria: dosering, biobeschikbaarheid, prijs-kwaliteit en transparantie. Elk product doorloopt hetzelfde stramien — ongeacht het merk.",
    "Dit platform is er niet om je meer te laten kopen. Het is er om je grip te geven: beter begrijpen wat je eet, scherpere keuzes maken en minder afhankelijk te worden van glimmende verpakkingen en halve verhalen.",
  ],
  methodologieLink: {
    href: "/methodologie",
    label: "Lees hoe PerfectSupplement werkt",
  },
  intakeLink: {
    href: "/intake",
    label: "Doe de check 'Wat mis je?'",
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
  medicalDisclaimer: DISCLAIMER_TEXTS.default,
} as const;

export const ABOUT_CREDENTIALS = {
  id: "achtergrond",
  title: "Achtergrond",
} as const;

export const ABOUT_CTA = {
  title: "Weet wat je bord mist",
  description:
    "Begin met 'Wat mis je?': een korte vragenlijst over je voeding en daglicht. Je ziet wat je al dekt, wat tekortschiet en of een supplement daar logisch op aansluit — geen medische test en geen vervanging voor zorg.",
  buttonLabel: "Doe de check 'Wat mis je?'",
  href: "/intake",
} as const;

export const ABOUT_CONTACT = {
  text: "Vragen of feedback?",
  linkLabel: "Neem contact op",
  href: "/contact",
} as const;
