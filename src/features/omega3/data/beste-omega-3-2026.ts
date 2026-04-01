/** Content voor Beste Omega-3 (2026): evidencetabel, keuzehulp, doelgroepen, interne links. */

export type EvidenceRow = {
  supplement: string;
  effect: string;
  bewijs: string;
  dosering: string;
  veiligheid: string;
};

export const evidenceRows: EvidenceRow[] = [
  {
    supplement: "EPA + DHA (algemeen)",
    effect:
      "EPA en DHA zijn omega-3 vetzuren met een erkende rol in o.a. hart, hersenen en ogen — binnen een gevarieerd voedingspatroon.",
    bewijs:
      "Veel observationeel en interventieonderzoek; sterktes verschillen per eindpunt en populatie.",
    dosering:
      "Veel richtlijnen noemen ~250 mg EPA+DHA/dag uit voeding; hogere innames komen bij supplementen voor — volg etiket en professioneel advies.",
    veiligheid:
      "Bij normaal gebruik meestal goed verdragen; bij bloedverdunners, zwangerschap of operaties: overleg met zorgverlener.",
  },
  {
    supplement: "Visolie (triglyceride / vloeibaar)",
    effect: "Hoge EPA/DHA per ml mogelijk; meest gebruikte bron in supplementen.",
    bewijs: "Brede markt en veel ervaring; kwaliteit verschilt per merk en batch.",
    dosering: "Richt je op mg EPA+DHA per portie, niet alleen op ml visolie.",
    veiligheid: "Kies geteste zuiverheid (zware metalen, oxidatie); bewaar koel na openen indien advies.",
  },
  {
    supplement: "Algenolie",
    effect: "Plantaardige bron; vaak meer DHA-gericht dan EPA.",
    bewijs: "Wordt veel gebruikt als visalternatief; vergelijk EPA/DHA op het etiket.",
    dosering: "Vaak hogere volumes of meerdere porties nodig voor vergelijkbare EPA+DHA met sterke visolie.",
    veiligheid: "Zelfde algemene omega-3-overwegingen; check allergenen op verpakking.",
  },
  {
    supplement: "Gummies",
    effect: "Laagdrempelig; meest lagere EPA/DHA per portie dan geconcentreerde olie.",
    bewijs: "Geschiktheid hangt af van doel: routine en volhoudbaarheid vs maximale dosering.",
    dosering: "Tel altijd de som van EPA+DHA per dag, niet alleen het aantal gummies.",
    veiligheid: "Let op suikers en extra ingrediënten als dat voor jou relevant is.",
  },
  {
    supplement: "Capsules (softgels)",
    effect: "Praktisch onderweg; dosering per capsule varieert sterk.",
    bewijs: "Triglyceride- vs ethyl ester-vorm kan opname beïnvloeden — merk en product bepalen het verschil.",
    dosering: "Sommige hoge doses vragen meerdere capsules; vergelijk prijs per mg EPA+DHA.",
    veiligheid: "Grote capsules kunnen minder prettig zijn om in te nemen.",
  },
];

export type FormComparisonRow = {
  kenmerk: string;
  visolie: string;
  algenolie: string;
  gummies: string;
};

export const formComparisonRows: FormComparisonRow[] = [
  {
    kenmerk: "EPA/DHA per portie",
    visolie: "Vaak het hoogst (vooral vloeibaar)",
    algenolie: "Minder EPA, vaak meer DHA — check etiket",
    gummies: "Meestal lager; gemak gaat boven maximale mg",
  },
  {
    kenmerk: "Gebruiksgemak",
    visolie: "Dosering flexibel; smaak kan wennen",
    algenolie: "Vergelijkbaar met olie; vaak mildere vis-smaak",
    gummies: "Hoogste gemak en smaak voor veel mensen",
  },
  {
    kenmerk: "Plantaardig",
    visolie: "Nee",
    algenolie: "Ja",
    gummies: "Afhankelijk van merk (vis- of plantaardig)",
  },
  {
    kenmerk: "Prijs per mg EPA+DHA",
    visolie: "Vaak gunstig bij geconcentreerde olie",
    algenolie: "Meestal hoger dan visolie",
    gummies: "Vaak hoger per mg actieve vetzuren",
  },
];

export type AudienceCard = {
  title: string;
  text: string;
  hint: string;
  href: string;
  linkLabel: string;
};

export const audienceCards: AudienceCard[] = [
  {
    title: "Hart & algemene basis",
    text:
      "EPA en DHA spelen een rol in normale hartfunctie binnen de officiële claimcontext. Kies een product met transparante mg-waarden en neem bij voorkeur bij een maaltijd met vet.",
    hint: "Vergelijk eerst op EPA+DHA per euro per dag.",
    href: "/wat-is-omega-3",
    linkLabel: "Wat is omega-3?",
  },
  {
    title: "Focus & drukte (routine)",
    text:
      "Consistentie wint: gummies of capsules kunnen makkelijker vol te houden zijn dan olie. Let op dat de mg EPA+DHA nog steeds bij je doel passen.",
    hint: "Lees de keuzegids als je twijfelt over dosering en vorm.",
    href: "/waar-let-je-op-bij-omega-3",
    linkLabel: "Waar let je op bij omega-3?",
  },
  {
    title: "Sport & herstel",
    text:
      "Omega-3 past in een breder herstelbeeld (voeding, slaap, training). Kies een hogere EPA/DHA-concentratie als je geen enorme volumes olie wilt drinken.",
    hint: "Zet producten naast elkaar in de grote vergelijking.",
    href: "/omega-3-vergelijken",
    linkLabel: "Omega-3 vergelijken",
  },
];

export const internalTopicLinks = [
  {
    href: "/slaap-supplement-vergelijken",
    title: "Slaap",
    description: "Als betere nachtrust je hoofddoel is, naast omega-3-keuze.",
  },
  {
    href: "/supplement-kiezen-waar-op-letten",
    title: "Stress & balans",
    description: "Hoe je supplementen beoordeelt op kwaliteit en volhoudbaarheid.",
  },
  {
    href: "/supplementen",
    title: "Voeding & aanbod",
    description: "Overzicht van ingrediënten en doelen op de site.",
  },
] as const;
