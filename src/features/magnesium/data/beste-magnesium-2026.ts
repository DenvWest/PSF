/** Content voor de affiliate-pagina Beste Magnesium (2026): evidencetabel, keuzehulp, doelgroepen. */

export type EvidenceRow = {
  supplement: string;
  effect: string;
  bewijs: string;
  dosering: string;
  veiligheid: string;
};

/** Samenvatting op basis van gangbare kennis; geen ziekteclaims. */
export const evidenceRows: EvidenceRow[] = [
  {
    supplement: "Magnesium (algemeen)",
    effect:
      "Ondersteunt o.a. normale spierfunctie, energiestofwisseling en zenuwstelsel — afhankelijk van inname en context.",
    bewijs:
      "Magnesium is een erkende essentiële voedingsstof; supplementen zijn bedoeld ter aanvulling van de voeding.",
    dosering: "In de EU geldt vaak een bovengrens rond 375 mg/dag uit supplementen (check actuele etiketten).",
    veiligheid:
      "Bij gebruik zoals op het etiket over het algemeen goed verdragen; bij nierproblemen of medicatie eerst overleg.",
  },
  {
    supplement: "Bisglycinaat (chelaat)",
    effect: "Wordt in de praktijk vaak gekozen vanwege verdragenheid en vaste routine.",
    bewijs:
      "Veel anekdotische en praktijkervaring; vergelijk studies per merk en populatie — geen universele medische claim.",
    dosering: "Meestal 100–400 mg elementair/dag verdeeld over porties, afhankelijk van product en tolerantie.",
    veiligheid: "Vaak mild; start met etiketadvies en let op maag/darm bij hoge totaalinname.",
  },
  {
    supplement: "Citraat",
    effect: "Goed oplosbaar; flexibel doseren (vooral poeder); bekend in supplementmarkt.",
    bewijs: "Breed gebruik in supplementen; effect op opname verschilt tussen personen.",
    dosering: "Veel producten rond 200–400 mg elementair/dag; citraat kan laxerend werken bij hogere doses.",
    veiligheid: "Let op darmgevoeligheid; drink voldoende water bij poeders.",
  },
  {
    supplement: "Oxide",
    effect: "Hoge vermelde mg op etiket; biologische beschikbaarheid vaak lager dan bij chelaten/citraat.",
    bewijs: "Farmacokinetiek verschilt per vorm — oxide staat bekend als minder goed opneembaar.",
    dosering: "Niet blind vergelijken op mg tablet: tel elementair magnesium en effect van de vorm mee.",
    veiligheid: "Bij maagklachten of hoge doses voorzichtigheid; splitsen kan helpen.",
  },
  {
    supplement: "Malaat / tauraat",
    effect: "Malaat: vaak overdag/sportcontext; tauraat: combinatie met taurine, soms avond/ontspanning.",
    bewijs: "Contextuele keuzes; vergelijk op elementair mg en hoe je het in je routine plaatst.",
    dosering: "Typisch vergelijkbaar met andere vormen qua elementaire ranges; volg het productetiket.",
    veiligheid: "Zelfde algemene regels als andere magnesiumzouten; check interacties bij medicatie.",
  },
];

export type FormComparisonRow = {
  kenmerk: string;
  bisglycinaat: string;
  citraat: string;
  oxide: string;
};

export const formComparisonRows: FormComparisonRow[] = [
  {
    kenmerk: "Opname (praktijk)",
    bisglycinaat: "Meestal als gunstig ervaren; chelaat",
    citraat: "Goed oplosbaar; bekend",
    oxide: "Over het algemeen lager dan chelaten/citraat",
  },
  {
    kenmerk: "Maag / darm",
    bisglycinaat: "Vaak mild",
    citraat: "Kan laxerend zijn bij hogere doses",
    oxide: "Kan zwaarder aanvoelen bij sommigen",
  },
  {
    kenmerk: "Prijs per mg element",
    bisglycinaat: "Meestal hoger",
    citraat: "Vaak gunstig",
    oxide: "Vaak het goedkoopst op verpakking",
  },
  {
    kenmerk: "Wanneer overwegen",
    bisglycinaat: "Alledaagse routine, mildheid",
    citraat: "Flexibel doseren, prijs/kwaliteit",
    oxide: "Strak budget; weet de beperkingen",
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
    title: "Slaap",
    text:
      "Veel mensen plannen magnesium rond het slapen gaan. Bisglycinaat of tauraat passen vaak in een avondroutine; doseer conform etiket en bouw gewoonte op.",
    hint: "Combineer met vaste slaaptijden en schermminder voor het beste effect.",
    href: "/slaap-supplement-vergelijken",
    linkLabel: "Slaap supplementen vergelijken",
  },
  {
    title: "Stress",
    text:
      "Magnesium hoort bij ondersteuning van het zenuwstelsel in de voedingscontext. Het is geen vervanging voor rust, therapie of medische zorg bij aanhoudende klachten.",
    hint: "Kies een vorm die je volhoudt en vermijd te hoge doses in één keer bij gevoelige darm.",
    href: "/supplement-kiezen-waar-op-letten",
    linkLabel: "Supplement kiezen: waar op letten",
  },
  {
    title: "Sport",
    text:
      "Bij inspanning draait het om totaalinname, hydratatie en herstel. Malaat of citraat worden wel gekozen overdag; vergelijk op elementair magnesium per portie.",
    hint: "Let op timing t.o.v. training en eventuele maaggevoeligheid.",
    href: "/magnesium-vergelijken",
    linkLabel: "Magnesium vormen vergelijken",
  },
];

export const internalTopicLinks = [
  {
    href: "/slaap-supplement-vergelijken",
    title: "Slaap",
    description: "Vergelijking en tips rond supplementen voor een betere nachtrust.",
  },
  {
    href: "/supplement-kiezen-waar-op-letten",
    title: "Stress & balans",
    description: "Hoe je supplementen beoordeelt op kwaliteit, dosering en routine.",
  },
  {
    href: "/supplementen",
    title: "Voeding & aanbod",
    description: "Hub met doelen en ingrediënten — van omega-3 tot magnesium.",
  },
] as const;
