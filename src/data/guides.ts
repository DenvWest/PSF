export type FilterCategory =
  | "slaap-herstel"
  | "energie-vitaliteit"
  | "mentaal"
  | "hormonaal";

export type GuideVerdieping = {
  label: string;
  sub: string;
  href: string;
};

export type Guide = {
  key: string;
  title: string;
  accent: string;
  tag: string;
  focusCategories: FilterCategory[];
  promise: string;
  /** PDF-download nog niet live — toon coming-soon i.p.v. download-CTA */
  comingSoon?: boolean;
  /** Webgids-URL wanneer comingSoon (bijv. pillar-pagina) */
  contentHref?: string;
  heroTitle: string;
  heroSub: string;
  benefits: string[];
  recognition: string[];
  longform: string[];
  pullquote: string;
  verdieping: GuideVerdieping[];
};

export type GuideTrustItem = {
  title: string;
  body: string;
};

export const FILTER_CATEGORIES: {
  key: FilterCategory | "alle";
  label: string;
}[] = [
  { key: "alle", label: "Alle gidsen" },
  { key: "slaap-herstel", label: "Slaap & herstel" },
  { key: "energie-vitaliteit", label: "Energie & vitaliteit" },
  { key: "mentaal", label: "Mentale balans" },
  { key: "hormonaal", label: "Hormonale balans" },
];

export const GUIDE_TRUST_ITEMS: GuideTrustItem[] = [
  {
    title: "Onderbouwd met onderzoek",
    body: "Gebaseerd op peer-reviewed literatuur en gangbare richtlijnen.",
  },
  {
    title: "Transparante bronvermelding",
    body: "Geschreven op basis van peer-reviewed onderzoek, met bronnen erbij.",
  },
  {
    title: "Transparante methodologie",
    body: "Bronnen en aannames staan in de gids vermeld.",
  },
  {
    title: "Geen quick fixes",
    body: "Alleen adviezen die houdbaar zijn in een druk leven.",
  },
];

export const GUIDES: Guide[] = [
  {
    key: "slaap",
    title: "Slaap",
    accent: "oklch(0.70 0.05 205)",
    tag: "Herstel & ritme",
    focusCategories: ["slaap-herstel"],
    promise: "Rustiger naar bed, dieper slapen, scherper wakker worden.",
    heroTitle: "Rustiger naar bed. Dieper slapen. Scherper wakker.",
    heroSub:
      "Een compacte gids met houdbare gewoontes die je nachtrust ondersteunen — geen wondermiddelen, wel inzichten die je vanavond al kunt toepassen.",
    benefits: [
      "Een avondritueel dat je lijf helpt schakelen naar rust",
      "Hoe daglicht en een vast dag-nachtritme je nachtrust ondersteunen",
      "Hoe licht, cafeïne en schermtijd je nachtrust beïnvloeden",
      "Ademhalings- en ontspanningsroutines voor het slapengaan",
      "Een ochtendroutine die je bioritme ondersteunt",
      "Je slaapkamer rustiger maken: temperatuur, licht en geluid",
      "Voeding en timing afstemmen op rustiger nachten",
    ],
    recognition: [
      "Je krijgt 's avonds je hoofd moeilijk uit na een drukke dag",
      "Je wordt wakker zonder echt uitgerust te zijn",
      "Je ligt genoeg uren, maar de kwaliteit mist",
      "Je bent klaar met losse tips en wilt één rustig ritme",
    ],
    longform: [
      "Slaap is geen luxe en geen zwakte. Het is het fundament waarop je dagen rusten — je energie, je focus, je humeur. Toch behandelen veel mannen boven de veertig slaap als het sluitstuk van de dag, in plaats van als het startpunt.",
      "Deze gids gaat niet over harder je best doen. Hij gaat over kleine, houdbare keuzes die je lijf helpen schakelen naar rust: licht, ritme, voeding, ademhaling. Geen quick fixes — wel dingen die je vanavond al kunt toepassen.",
      "We hebben de ruis weggelaten. Wat overblijft is compact, onderbouwd en praktisch. Lees het in twintig minuten en pas het toe in je eigen tempo.",
    ],
    pullquote: "Niet meer moeite. Beter ritme.",
    verdieping: [
      {
        label: "Pillar: Slaap & herstel",
        sub: "De volledige kennisbank over nachtrust en herstel.",
        href: "/slaap-verbeteren-na-40",
      },
      {
        label: "Jouw profiel",
        sub: "Bewaar je gidsen en volg je voortgang.",
        href: "/intake",
      },
      {
        label: "Gratis Leefstijlcheck",
        sub: "Meet je startpunt in 3 minuten.",
        href: "/intake",
      },
    ],
  },
  {
    key: "stress",
    title: "Stress",
    accent: "oklch(0.69 0.055 172)",
    tag: "Mentale balans",
    focusCategories: ["mentaal"],
    promise: "Meer kalmte en grip op drukke dagen.",
    heroTitle: "Meer kalmte. Meer grip. Minder ruis.",
    heroSub:
      "Een compacte gids met praktische routines die je helpen om drukke dagen rustiger te dragen — zonder dat je je leven hoeft om te gooien.",
    benefits: [
      "Korte routines die je zenuwstelsel helpen kalmeren",
      "Hoe je ademhaling inzet als knop voor rust",
      "Welke gewoontes bijdragen aan een stabieler humeur",
      "Grenzen stellen zonder dat het strijd wordt",
      "Beweging en buitenlucht als tegengif voor spanning",
      "Een dagindeling die ruimte laat in plaats van vult",
    ],
    recognition: [
      "Je staat vaak 'aan', ook als er niets hoeft",
      "Je merkt spanning eerder in je lijf dan in je hoofd",
      "Je hebt een kort lontje aan het eind van de dag",
      "Je wilt rust zonder je ambitie op te geven",
    ],
    longform: [
      "Stress is niet de vijand — het is een signaal. Het wordt pas een probleem als het nooit meer zakt. Voor veel mannen boven de veertig staat de wijzer structureel te hoog, zonder dat ze het doorhebben.",
      "Deze gids helpt je de knoppen te vinden waarmee je zelf het volume terugdraait: ademhaling, ritme, beweging en grenzen. Klein, concreet en vol te houden.",
    ],
    pullquote: "Rust is een vaardigheid, geen toeval.",
    verdieping: [
      {
        label: "Pillar: Mentale balans",
        sub: "Alles over stress, focus en herstel.",
        href: "/stress-verminderen-na-40",
      },
      {
        label: "Jouw profiel",
        sub: "Bewaar je gidsen en volg je voortgang.",
        href: "/intake",
      },
      {
        label: "Gratis Leefstijlcheck",
        sub: "Meet je startpunt in 3 minuten.",
        href: "/intake",
      },
    ],
  },
  {
    key: "energie",
    title: "Energie",
    accent: "oklch(0.73 0.085 128)",
    tag: "Vitaliteit",
    focusCategories: ["energie-vitaliteit"],
    promise: "Stabiele energie van ochtend tot avond.",
    heroTitle: "Stabiele energie. Van ochtend tot avond.",
    heroSub:
      "Een compacte gids over de gewoontes die je energieniveau ondersteunen — zonder de pieken en dalen van quick fixes.",
    benefits: [
      "Hoe voeding en timing je energie door de dag ondersteunen",
      "Waarom je middagdip vaak ergens anders begint",
      "De rol van beweging bij een stabieler energieniveau",
      "Hydratatie en cafeïne slimmer inzetten",
      "Een ochtend die je dag op de rails zet",
      "Kleine pauzes die meer opleveren dan ze kosten",
    ],
    recognition: [
      "Je hebt een dip die elke middag op dezelfde tijd komt",
      "Je draait op koffie in plaats van op ritme",
      "Je voelt je 's avonds leeg, ook zonder zware dag",
      "Je wilt energie die meegaat, geen kortstondige boost",
    ],
    longform: [
      "Energie is geen kwestie van harder pushen. Het is het resultaat van hoe je eet, beweegt, rust en je dag indeelt. Voor veel mannen boven de veertig zit de winst niet in meer doen, maar in slimmer ritme.",
      "Deze gids laat zien welke gewoontes bijdragen aan een stabieler energieniveau — onderbouwd, praktisch, en vol te houden in een druk leven.",
    ],
    pullquote: "Geen boost. Een basis.",
    verdieping: [
      {
        label: "Pillar: Energie & vitaliteit",
        sub: "De volledige kennisbank over energie.",
        href: "/energie-na-40",
      },
      {
        label: "Jouw profiel",
        sub: "Bewaar je gidsen en volg je voortgang.",
        href: "/intake",
      },
      {
        label: "Gratis Leefstijlcheck",
        sub: "Meet je startpunt in 3 minuten.",
        href: "/intake",
      },
    ],
  },
  {
    key: "herstel",
    title: "Herstel",
    accent: "oklch(0.70 0.065 150)",
    tag: "Veerkracht",
    focusCategories: ["slaap-herstel", "energie-vitaliteit"],
    promise: "Sneller op krachten na inspanning en drukke weken.",
    heroTitle: "Beter herstellen. Na inspanning én na drukte.",
    heroSub:
      "Een compacte gids over de gewoontes die je herstel ondersteunen — zodat je veerkracht meegaat met wat je van jezelf vraagt.",
    benefits: [
      "Waarom herstel net zo belangrijk is als inspanning",
      "Hoe slaap en voeding je herstel ondersteunen",
      "Actief versus passief herstel — en wanneer wat",
      "Signalen dat je over je grens gaat",
      "Routines voor na een zware training of week",
      "Rust inplannen zonder schuldgevoel",
    ],
    recognition: [
      "Je bent na het sporten langer moe dan vroeger",
      "Drukke weken hakken er meer in dan je wilt",
      "Je herstelt traag en weet niet goed waarom",
      "Je wilt veerkracht opbouwen, niet alleen presteren",
    ],
    longform: [
      "Herstel is waar de winst zit. Niet tijdens de inspanning, maar erna — als je lijf zich aanpast en sterker wordt. Voor veel mannen boven de veertig wordt juist dat deel overgeslagen.",
      "Deze gids helpt je herstel net zo serieus te nemen als inspanning, met houdbare routines die je veerkracht ondersteunen.",
    ],
    pullquote: "Sterker word je in de rust.",
    verdieping: [
      {
        label: "Pillar: Slaap & herstel",
        sub: "De volledige kennisbank over herstel.",
        href: "/herstel-verbeteren-na-40",
      },
      {
        label: "Jouw profiel",
        sub: "Bewaar je gidsen en volg je voortgang.",
        href: "/intake",
      },
      {
        label: "Gratis Leefstijlcheck",
        sub: "Meet je startpunt in 3 minuten.",
        href: "/intake",
      },
    ],
  },
  {
    key: "testosteron",
    title: "Testosteron",
    accent: "oklch(0.71 0.095 82)",
    tag: "Hormonale balans",
    focusCategories: ["hormonaal", "energie-vitaliteit"],
    comingSoon: true,
    contentHref: "/testosteron-na-40",
    promise:
      "Leefstijlfactoren die je vitaliteit en veerkracht ondersteunen.",
    heroTitle: "De leefstijl achter je vitaliteit.",
    heroSub:
      "Een nuchter instapstuk over de leefstijlfactoren die je vitaliteit ondersteunen — en die je vooral terugvindt in slaap, herstel en beweging. Geen grote beloftes.",
    benefits: [
      "Welke leefstijlfactoren je hormonale balans ondersteunen",
      "De rol van slaap, krachttraining en voeding",
      "Waarom lichaamssamenstelling ertoe doet",
      "Stress en herstel in relatie tot vitaliteit",
      "Wat je beter kunt laten dan najagen",
      "Realistische verwachtingen, zonder hype",
    ],
    recognition: [
      "Je merkt dat je veerkracht anders is dan op je dertigste",
      "Je wilt feiten, geen marketing of wondermiddelen",
      "Je bent bereid aan je leefstijl te werken",
      "Je zoekt een nuchter startpunt, geen quick fix",
    ],
    longform: [
      "Rond je veertigste verandert er van alles — geleidelijk, niet dramatisch. Veel daarvan heb je zelf in de hand via je leefstijl: slaap, beweging, voeding en stress.",
      "Deze gids belooft niets. Hij laat zien welke leefstijlfactoren er volgens onderzoek toe doen — en wijst je door naar de domeinen die je écht kunt meten en verbeteren: je slaap, je herstel en je beweging.",
    ],
    pullquote: "Nuchter. Onderbouwd. Vol te houden.",
    verdieping: [
      {
        label: "Blog: Cortisol & testosteron",
        sub: "De leefstijl-invalshoek, nuchter uitgelegd.",
        href: "/blog/cortisol-en-testosteron",
      },
      {
        label: "Thema: Slaap, kracht & herstel",
        sub: "De leefstijlfactoren die er echt toe doen.",
        href: "/gidsen?filter=slaap-herstel",
      },
      {
        label: "Gratis Leefstijlcheck",
        sub: "Meet je startpunt in 3 minuten.",
        href: "/intake",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.key === slug);
}

export function isValidFilter(
  value: string | undefined,
): value is FilterCategory | "alle" {
  if (!value || value === "alle") {
    return value === "alle" || value === undefined;
  }
  return FILTER_CATEGORIES.some(
    (category) => category.key !== "alle" && category.key === value,
  );
}

export function filterGuides(
  filter: FilterCategory | "alle",
): Guide[] {
  if (filter === "alle") {
    return GUIDES;
  }
  return GUIDES.filter((guide) => guide.focusCategories.includes(filter));
}
