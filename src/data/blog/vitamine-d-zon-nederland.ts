import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const vitamineDZonNederlandData: BlogArtikel = {
  slug: "vitamine-d-zon-nederland",
  categorie: "energie",
  titel: "Hoeveel zon heb je écht nodig in Nederland voor vitamine D?",
  coverImage: "/images/blog/vitamine-d-zon-nederland.jpg",
  coverImageAlt: "Nederlandse polder in warm zonlicht bij lage zon",
  heroIntro:
    "'Vijftien minuten per dag' is het antwoord dat je overal leest. Dat getal komt ergens vandaan, maar het klopt alleen bij een bepaalde huid, een bepaald seizoen, een bepaald tijdstip en een bepaalde hoeveelheid blote huid. Op 52 graden noorderbreedte verandert dat plaatje per maand ingrijpend. Hier lees je wat de zonnestand met [vitamine D](/kennisbank/vitamine-d) doet — en wanneer je huid simpelweg buiten spel staat.",
  leestijd: "8 min",
  gepubliceerdOp: "2026-09-01",
  laatstBijgewerktOp: "2026-09-01",
  leesNuanceOnderHero:
    "Alle tijdsindicaties hieronder zijn schattingen op basis van modelonderzoek, geen persoonlijk voorschrift. Huidtype, leeftijd, medicatie en huidkankerrisico veranderen het plaatje — bespreek dat met je huisarts.",
  secties: [
    {
      type: "tekst",
      titel: "De enige factor die alles bepaalt: de hoek van de zon",
      bewijsNiveau: "sterk",
      tekst:
        "UVB-straling van de golflengte die vitamine D-synthese aanzet (ongeveer 290–315 nm) wordt sterk geabsorbeerd door de ozonlaag. Hoe lager de zon aan de hemel staat, hoe langer de weg door de atmosfeer, en hoe minder van dat UVB de grond bereikt. Er is een praktische vuistregel die dit vangt: staat de zon lager dan ongeveer 45 graden boven de horizon, dan is de aanmaak verwaarloosbaar. Anders gezegd — is je schaduw langer dan jezelf, dan gebeurt er weinig.\n\nHet klassieke onderzoek van Webb en collega's liet dit zien voor Boston (42°N) en Edmonton (52°N): in de wintermaanden produceerde huid in die laatste stad vrijwel geen vitamine D3, hoe lang je ook buiten stond. Nederland ligt op vergelijkbare breedte als Edmonton.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Van ongeveer oktober tot maart staat de zon in Nederland te laag voor noemenswaardige vitamine D-aanmaak. Langer buiten blijven lost dat niet op — de juiste golflengte komt er in die periode simpelweg nauwelijks doorheen.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Het Nederlandse jaar in vier periodes",
      inleiding:
        "Grove indeling op basis van zonnestand — bedoeld om te begrijpen wat er speelt, niet om af te tellen.",
      items: [
        "April tot september, rond het midden van de dag: dit is het venster waarin je huid effectief kan aanmaken. Korte, regelmatige blootstelling van gezicht, armen en handen volstaat voor de meeste mensen met een lichte huid.",
        "Maart en oktober: overgangsmaanden. Er gebeurt iets rond het middaguur, maar veel minder dan in de zomer en sterk afhankelijk van bewolking.",
        "November tot februari: het aanmaakvenster is praktisch dicht. Je teert in deze maanden op de voorraad die je in de zomer hebt opgebouwd — hoe dat jaarritme verloopt staat in [vitamine D door het jaar heen](/blog/vitamine-d-seizoenen-jaarritme).",
        "Vroege ochtend en late middag, het hele jaar door: de zon staat dan te laag, ook in juni. De UV-index kan wel prikken maar levert weinig van de juiste golflengte.",
      ],
    },
    {
      type: "tekst",
      titel: "Waarom '15 minuten' bij jou iets anders betekent",
      bewijsNiveau: "redelijk",
      subkoppen: [
        { titel: "Huidskleur" },
        { titel: "Leeftijd" },
        { titel: "Blote huid en glas" },
      ],
      tekst:
        "Melanine is een natuurlijke UV-filter. Een donkere huid heeft aanzienlijk langere blootstelling nodig voor dezelfde aanmaak als een lichte huid — schattingen lopen uiteen van drie tot zes keer zo lang. Dat is de reden dat mensen met een donkere huid in Noordwest-Europa een duidelijk hoger risico op een lage status hebben.\n\nLeeftijd telt ook mee, en dat raakt de doelgroep hier direct. De concentratie 7-dehydrocholesterol in de huid — de grondstof voor de hele reactie — neemt met het ouder worden af. Rond de zeventig ligt de aanmaakcapaciteit fors lager dan op je twintigste; boven de veertig is de afname al ingezet.\n\nDan de oppervlakte: gezicht en handen alleen is een klein deel van je huid. Armen en benen erbij maakt een groot verschil in dezelfde tijd. En achter glas gebeurt er niets — ramen laten UVA door maar filteren UVB vrijwel volledig weg. Wie de hele dag bij een raam zit, zit voor vitamine D binnen.",
      bewijsKanttekening:
        "De tijdsschattingen in dit soort onderzoek komen uit modellen en gecontroleerde blootstelling, niet uit metingen bij individuen in het dagelijks leven. Gebruik ze als ordegrootte, niet als recept.",
    },
    {
      type: "tekst",
      titel: "Wat voeding bijdraagt (en waarom dat weinig is)",
      tekst:
        "Vitamine D zit van nature in weinig producten: vette vis is de belangrijkste bron, daarnaast eigeel en in kleine hoeveelheden vlees. In Nederland wordt margarine, halvarine en bak-en-braadproduct verplicht verrijkt, wat een basisbijdrage levert. Voor de meeste mensen komt de inname via voeding samen niet in de buurt van wat de huid in de zomer op een goede dag maakt.\n\nDat is geen argument om vis te laten staan — vette vis levert ook [EPA en DHA](/kennisbank/epa-dha) — maar wel de reden dat het Nederlandse suppletieadvies bestaat voor specifieke groepen. Meer over hoe voeding en supplementen zich verhouden staat in [voeding na 40](/voeding-na-40).",
    },
    {
      type: "opsomming",
      titel: "Praktisch, zonder je dag eromheen te bouwen",
      items: [
        "Pak in het zomerhalfjaar regelmatig kort daglicht rond het midden van de dag — een wandeling in de lunchpauze doet meer voor je vitamine D dan een avondrondje.",
        "Kort en regelmatig verslaat lang en zeldzaam: je huid verzadigt, en na dat punt levert extra tijd alleen schade op.",
        "Verbranden is nooit onderdeel van het plan; zie [zonnebrand en vitamine D](/blog/zonnebrand-en-vitamine-d) voor waarom bescherming en aanmaak elkaar minder bijten dan gedacht.",
        "Reken in het winterhalfjaar op voeding of suppletie, niet op je huid.",
        "Val je in een risicogroep, laat dan meten in plaats van rekenen — zie [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol).",
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: zonlicht is één van de knoppen",
      tekst:
        "Daglicht doet meer dan vitamine D: het zet ook je [circadiaan ritme](/kennisbank/circadiaan-ritme) gelijk, wat direct doorwerkt in slaap en energie. In de [Leefstijlcheck](/intake) vragen we naar zonlicht (LIF_SUN) naast slaap, stress en beweging, zodat je ziet welke knop bij jou het meeste oplevert. De bredere gids: [energie na 40](/energie-na-40).",
    },
  ],
  kernpunten: [
    "Onder een zonnestand van ~45° is de aanmaak verwaarloosbaar — schaduw langer dan jezelf.",
    "In Nederland is het venster ruwweg april tot september, rond het middaguur.",
    "Donkere huid en hogere leeftijd verlengen de benodigde blootstelling fors.",
    "Achter glas maak je niets aan: UVB komt er niet doorheen.",
    "Voeding levert weinig; in de winter is dat de reden dat suppletie-adviezen bestaan.",
  ],
  samenvatting:
    "De hoek van de zon bepaalt alles: staat die lager dan ongeveer 45 graden, dan bereikt er te weinig UVB de grond voor aanmaak. In Nederland betekent dat een venster van ruwweg april tot september rond het midden van de dag. Huidskleur, leeftijd en hoeveel huid je bloot hebt verschuiven het benodigde aantal minuten sterk, en achter glas gebeurt er niets.",
  supplementCTA: {
    naam: "Vitamine D3",
    uitleg:
      "Voor het Nederlandse winterhalfjaar de gangbare aanvulling — vergelijk µg/IE per capsule en neem in met een vetrijke maaltijd.",
    href: "/beste/vitamine-d",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 40",
    href: "/energie-na-40",
  },
  vergelijkingExtraLink: {
    label: "Vitamine D supplementen vergelijken",
    href: "/beste/vitamine-d",
  },
  supplementenHubLink: {
    label: "Alle supplementen langs dezelfde meetlat",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "vitamine-d-seizoenen-jaarritme",
    "zonnebrand-en-vitamine-d",
    "vitamine-d-meten-wanneer-zinvol",
  ],
  metaTitle: "Hoeveel zon heb je nodig voor vitamine D in Nederland?",
  metaDescription:
    "Vitamine D en zon in Nederland: waarom het aanmaakvenster van april tot september loopt, wat huidskleur en leeftijd veranderen en waarom achter glas niets gebeurt.",
  keywords: [
    "vitamine d zon",
    "hoe lang in de zon voor vitamine d",
    "vitamine d zon nederland",
    "vitamine d winter",
    "uvb zonnestand vitamine d",
    "vitamine d aanmaak huid",
  ],
  referenties: toRefs([
    "Webb AR, Kline L, Holick MF. Influence of season and latitude on the cutaneous synthesis of vitamin D3: exposure to winter sunlight in Boston and Edmonton will not promote vitamin D3 synthesis in human skin. J Clin Endocrinol Metab. 1988;67(2):373-378.",
    "Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.",
    "MacLaughlin J, Holick MF. Aging decreases the capacity of human skin to produce vitamin D3. J Clin Invest. 1985;76(4):1536-1538.",
    "Clemens TL, Adams JS, Henderson SL, Holick MF. Increased skin pigment reduces the capacity of skin to synthesise vitamin D3. Lancet. 1982;1(8263):74-76.",
    "Spiro A, Buttriss JL. Vitamin D: an overview of vitamin D status and intake in Europe. Nutr Bull. 2014;39(4):322-350.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for vitamin D. EFSA Journal. 2016;14(10):4547.",
    "Ross AC, Manson JE, Abrams SA, et al. The 2011 report on dietary reference intakes for calcium and vitamin D from the Institute of Medicine. J Clin Endocrinol Metab. 2011;96(1):53-58.",
  ]),
};
