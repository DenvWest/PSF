import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const isWheySchadelijkData: BlogArtikel = {
  slug: "is-whey-schadelijk",
  categorie: "supplementen",
  titel: "Is whey schadelijk? Wat het onderzoek zegt over nieren, lever, botten en huid",
  heroIntro:
    "\"Dat gaat ten koste van je nieren\" is het meest herhaalde argument tegen eiwitpoeder — en tegelijk het slechtst onderbouwde. Er bestaan wél reële aandachtspunten rond whey, alleen zijn dat niet de punten die op verjaardagen langskomen. Hier zetten we vijf veelgehoorde zorgen naast het beschikbare bewijs, en daarna de drie dingen die wel je aandacht verdienen.",
  leestijd: "9 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Dit artikel gaat over gezonde volwassenen. Heb je nierziekte, leverziekte of een dieet op medisch voorschrift, dan bepaalt je behandelaar wat voor jou past — daar gaat geen enkel algemeen artikel overheen.",
  secties: [
    {
      type: "tekst",
      titel: "Ken je dit?",
      tekst:
        "Je zet een shake op tafel en krijgt te horen dat je daar later spijt van krijgt. Meestal komt dat verhaal niet uit onderzoek maar uit een vertaalfout: bij mensen met nierziekte is eiwitbeperking onderdeel van de behandeling, en dat is ergens onderweg veranderd in \"eiwit belast je nieren\". Dat is niet hetzelfde, en het verschil is precies waar dit artikel over gaat.",
    },
    {
      type: "tekst",
      titel: "Zorg 1: je nieren",
      bewijsNiveau: "sterk",
      tekst:
        "Dit is de best onderzochte vraag van allemaal. In een systematische review met meta-analyse van gecontroleerde studies bij gezonde volwassenen verschilde de nierfunctie niet tussen groepen met een hogere en een normale of lagere eiwitinname. Ook langer lopende studies bij sporters met inname ver boven de aanbeveling vonden geen verslechtering van nier- of leverwaarden. Bij bestaande nierschade ligt het anders: daar is de hoeveelheid eiwit onderdeel van de behandeling en bepaalt je arts of diëtist de bandbreedte.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Gezonde nieren nemen geen schade van een hogere eiwitinname. Beschadigde nieren vragen om een op maat gemaakt eiwitadvies — dat is de nuance die in het volksverhaal wegvalt.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Zorg 2: je lever",
      bewijsNiveau: "redelijk",
      tekst:
        "Voor een gezonde lever geldt hetzelfde patroon: er is geen bewijs dat een hogere eiwitinname uit voeding of poeder de leverfunctie aantast. Wat wel bestaat, zijn zeldzame casussen van leverschade door kruiden- en sportsupplementen met andere actieve ingrediënten dan eiwit — denk aan afslank- of \"testobooster\"-formules. Dat is een argument om te weten wat er in je bus zit, niet om eiwit te mijden.",
    },
    {
      type: "tekst",
      titel: "Zorg 3: je botten",
      bewijsNiveau: "redelijk",
      tekst:
        "Deze zorg stamt uit een oudere theorie: eiwit zou het lichaam verzuren, waarna calcium uit het bot zou worden gehaald om dat te compenseren. Latere onderzoeken en positiedocumenten hebben dat beeld omgekeerd. Bij voldoende calcium- en vitamine D-inname is een hogere eiwitinname neutraal tot gunstig voor de botdichtheid, en juist bij ouderen hangt te weinig eiwit samen met een hoger risico op fracturen. De relevantie na je veertigste is daarmee het tegenovergestelde van wat het verhaal suggereert.",
    },
    {
      type: "tekst",
      titel: "Zorg 4: je huid",
      bewijsNiveau: "beperkt",
      tekst:
        "Hier zit een kern van waarheid in. In observationeel onderzoek hangt zuivelconsumptie samen met acne, en er zijn kleine casusreeksen beschreven waarin acne bij sporters verbeterde na het stoppen met wei-eiwit. Dat is zwak bewijs: klein, zonder controlegroep en gevoelig voor toeval. Krijg je onverklaarde puistjes op rug of kaaklijn nadat je met whey bent begonnen, dan is acht weken stoppen een redelijke eigen test — en blijft het, dan lag het er niet aan.",
      bewijsKanttekening:
        "Associaties uit observationeel onderzoek en casusreeksen tonen geen oorzaak aan. Behandel dit als hypothese die je bij jezelf kunt toetsen, niet als vaststaand feit.",
    },
    {
      type: "tekst",
      titel: "Zorg 5: je hormonen",
      bewijsNiveau: "redelijk",
      tekst:
        "Wei-eiwit bevat geen hormonen die in jouw hormoonhuishouding ingrijpen, en er bestaat geen erkende claim die eiwit aan testosteron koppelt. De verwante angst rond soja-eiwit — dat de plantaardige oestrogeenachtige stoffen je testosteron zouden verlagen — is in een meta-analyse van klinische studies niet bevestigd. Wie zijn hormoonbalans wil ondersteunen, komt verder met slaap, gewicht, krachttraining en stress dan met een keuze tussen twee poeders; zie [testosteron en energie na 40](/blog/testosteron-en-energie-na-40).",
    },
    {
      type: "opsomming",
      titel: "Wat wél je aandacht verdient",
      inleiding:
        "Drie punten die zelden genoemd worden en die je wél kunt beïnvloeden.",
      items: [
        "Wat er verder in de bus zit: verontreinigingen en niet-vermelde stoffen zijn een reëler risico dan het eiwit zelf. Kies producten met onafhankelijke batchcontrole — zie [het etiket lezen](/blog/whey-etiket-lezen).",
        "Verdringing van gewoon eten: twee shakes per dag betekent twee maaltijden zonder vezels, groente en micronutriënten. Poeder is een aanvulling, geen basis.",
        "Calorieën die je vergeet: een shake met melk en pindakaas is een tussendoortje van 400 kilocalorieën. In een afvalperiode is dat het verschil tussen wel en niet werken.",
      ],
    },
    {
      type: "opsomming",
      titel: "Voor wie de vraag anders ligt",
      inleiding:
        "Bij deze groepen is \"is het schadelijk\" geen theoretische vraag maar een behandelvraag.",
      items: [
        "Chronische nierschade of één nier: eiwitinname hoort bij het behandelplan van je arts of diëtist.",
        "Leverziekte: hetzelfde geldt hier, inclusief het advies om supplementen met onbekende samenstelling te mijden.",
        "Koemelkeiwitallergie: elke vorm van whey valt af, ook isolaat — zie [whey en darmklachten](/blog/whey-en-darmklachten).",
        "Medicatie waarbij zuivel de opname beïnvloedt: bespreek het innamemoment met je apotheek.",
      ],
    },
    {
      type: "tekst",
      titel: "Is er een bovengrens?",
      tekst:
        "Voor eiwit is geen officiële aanvaardbare bovengrens vastgesteld zoals die voor vitaminen en mineralen bestaat. Uit de beschikbare literatuur wordt voor gezonde volwassenen een inname tot ongeveer twee gram per kilo lichaamsgewicht per dag als veilig beschouwd. Dat ligt ruim boven de 1,6 gram per kilo waar de winst voor spiermassa afvlakt — met andere woorden: het gebied waar het nuttig is, ligt ver onder het gebied waar iemand zich zorgen over maakt. Hoeveel je daadwerkelijk nodig hebt staat in [hoeveel whey per dag](/blog/whey-hoeveel-en-wanneer).",
    },
    {
      type: "tekst",
      titel: "Turbo: kies op samenstelling, niet op angst",
      tekst:
        "De vraag die overblijft is niet of eiwit veilig is, maar of dít product transparant is over wat erin zit. Dat is precies wat we per product vastleggen: in de [supplementengids](/supplementen) staat elke stof op dezelfde meetlat, en bij [alle eiwitpoeders](/supplementen?categorie=eiwitpoeder) zie je eiwitgehalte, claimvoorwaarde en prijs per dag naast elkaar.",
    },
  ],
  kernpunten: [
    "Bij gezonde volwassenen verandert een hogere eiwitinname de nierfunctie niet.",
    "De \"eiwit haalt calcium uit je botten\"-theorie is achterhaald; te weinig eiwit is het grotere risico.",
    "Het verband tussen whey en acne rust op zwak bewijs — acht weken stoppen is een redelijke eigen test.",
    "Whey beïnvloedt je hormoonhuishouding niet; die claim mag ook niet op het etiket staan.",
    "Reëler dan het eiwit zelf: verontreiniging, verdringing van gewoon eten en vergeten calorieën.",
  ],
  samenvatting:
    "Voor gezonde volwassenen laat gecontroleerd onderzoek geen verslechtering van de nierfunctie zien bij een hogere eiwitinname, en hetzelfde geldt voor de lever. De oude theorie dat eiwit calcium uit de botten haalt is achterhaald: bij voldoende calcium en vitamine D is meer eiwit neutraal tot gunstig voor bot. Het verband met acne berust op observationeel onderzoek en kleine casusreeksen — zwak bewijs, wel zelf te toetsen. Whey grijpt niet in op je hormonen. Wat wél aandacht verdient: de samenstelling van het product, de verdringing van gewoon eten en de calorieën die je vergeet mee te tellen. Bij nierziekte, leverziekte of een koemelkeiwitallergie bepaalt je behandelaar wat past.",
  supplementCTA: {
    naam: "Eiwitpoeder",
    uitleg:
      "Het veiligheidsvraagstuk zit in de samenstelling, niet in het eiwit: kijk naar ingrediëntenlijst en onafhankelijke controle.",
    href: "/supplementen/eiwitpoeder",
  },
  cornerstoneLink: {
    label: "Terug naar: supplement kiezen",
    href: "/supplement-kiezen-waar-op-letten",
  },
  vergelijkingExtraLink: {
    label: "Alle eiwitpoeders in de supplementengids",
    href: "/supplementen?categorie=eiwitpoeder",
  },
  gerelateerdeSluggen: [
    "whey-hoeveel-en-wanneer",
    "whey-etiket-lezen",
    "whey-wanneer-wel-en-niet",
  ],
  metaTitle: "Is whey schadelijk? Nieren, lever, botten en huid",
  metaDescription:
    "Is whey slecht voor je nieren, lever, botten of huid? Vijf veelgehoorde zorgen naast het onderzoek, plus de drie punten die wel je aandacht verdienen.",
  keywords: [
    "is whey schadelijk",
    "whey nieren",
    "whey bijwerkingen",
    "eiwitpoeder gezond of niet",
    "whey acne",
    "te veel eiwit gevaarlijk",
  ],
  referenties: toRefs([
    "Devries MC, Sithamparapillai A, Brimble KS, Banfield L, Morton RW, Phillips SM. Changes in kidney function do not differ between healthy adults consuming higher- compared with lower- or normal-protein diets: a systematic review and meta-analysis. J Nutr. 2018;148(11):1760-1775.",
    "Antonio J, Ellerbroek A, Silver T, Vargas L, Peacock C. The effects of a high protein diet on indices of health and body composition: a crossover trial in resistance-trained men. J Int Soc Sports Nutr. 2016;13:3.",
    "Rizzoli R, Biver E, Bonjour JP, et al. Benefits and safety of dietary protein for bone health: an expert consensus paper endorsed by ESCEO and IOF. Osteoporos Int. 2018;29(9):1933-1948.",
    "Adebamowo CA, Spiegelman D, Berkey CS, et al. Milk consumption and acne in adolescent girls. Dermatol Online J. 2006;12(4):1.",
    "Silverberg NB. Whey protein precipitating moderate to severe acne flares in 5 teenaged athletes. Cutis. 2012;90(2):70-72.",
    "Hamilton-Reeves JM, Vazquez G, Duval SJ, Phipps WR, Kurzer MS, Messina MJ. Clinical studies show no effects of soy protein or isoflavones on reproductive hormones in men: results of a meta-analysis. Fertil Steril. 2010;94(3):997-1007.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for protein. EFSA Journal. 2012;10(2):2557.",
    "Bilsborough S, Mann N. A review of issues of dietary protein intake in humans. Int J Sport Nutr Exerc Metab. 2006;16(2):129-152.",
  ]),
};
