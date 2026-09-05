import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const zonnebrandEnVitamineDData: BlogArtikel = {
  slug: "zonnebrand-en-vitamine-d",
  categorie: "energie",
  titel: "Blokkeert zonnebrand je vitamine D? Wat het lab zegt en wat de praktijk laat zien",
  coverImage: "/images/blog/zonnebrand-en-vitamine-d.jpg",
  coverImageAlt: "Rustig strand met zacht zonlicht en milde bewolking",
  heroIntro:
    "Op social media is het een vast refrein: zonnebrandcrème blokkeert 97% van je vitamine D-aanmaak, dus smeer je jezelf een tekort aan. Het eerste deel van die zin klopt in een laboratorium. Het tweede deel houdt in veldonderzoek geen stand — en het verschil tussen die twee is het hele verhaal. Hier lees je waarom, en wat het betekent voor [vitamine D](/kennisbank/vitamine-d) en [energie na 40](/energie-na-40).",
  leestijd: "9 min",
  gepubliceerdOp: "2026-09-01",
  laatstBijgewerktOp: "2026-09-01",
  leesNuanceOnderHero:
    "Dit artikel bespreekt onderzoek naar zonlicht en vitamine D-status. Het is geen advies om zonbescherming te laten staan en geen diagnose — bij twijfel over je status bespreek je meting met huisarts of POH.",
  secties: [
    {
      type: "tekst",
      titel: "Ken je die post?",
      tekst:
        "Een reel met een strand, een tube zonnebrand en een tekst in blokletters: 'SPF 30 blokkeert 97% van je vitamine D'. Daaronder de conclusie die er niet uit volgt: laat die crème staan, de zon is je vitamine. Het is overtuigend omdat het cijfer echt bestaat. De denkfout zit in de stap van 'percentage UVB tegengehouden in een test' naar 'dus krijg jij een tekort'. Die stap is precies waar het veldonderzoek een andere kant op wijst.",
    },
    {
      type: "tekst",
      titel: "Wat er in het laboratorium gebeurt",
      bewijsNiveau: "sterk",
      tekst:
        "Vitamine D-synthese begint in je huid: UVB-straling (ongeveer 290–315 nm) zet 7-dehydrocholesterol om in previtamine D3. Zonbescherming werkt door precies datzelfde UVB te absorberen of te weerkaatsen — dat is de reden dat het verbranding voorkomt. Er is dus een echt, aantoonbaar mechanisme: filter je UVB weg, dan onderdruk je in dezelfde beweging de aanmaakroute.\n\nDe klassieke laboratoriumbevinding komt uit werk van Matsuoka en collega's, die lieten zien dat correct aangebracht SPF 8 de vitamine D-respons na UV-blootstelling sterk onderdrukte. Bij hogere factoren en een aanbrengdikte van 2 mg/cm² — de standaard waarmee filters worden getest — houdt een SPF 30 rond de 95–98% van het UVB tegen. Op papier is de zaak daarmee gesloten.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Het mechanisme is echt: zonbescherming filtert het UVB dat je huid nodig heeft voor aanmaak. De vraag is niet óf dat effect bestaat, maar of het onder normaal gebruik groot genoeg is om je status te verlagen.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Waarom de praktijk anders uitpakt",
      bewijsNiveau: "redelijk",
      subkoppen: [
        { titel: "Mensen smeren veel dunner dan de test" },
        { titel: "Wie smeert, blijft langer buiten" },
      ],
      tekst:
        "Systematische reviews die specifiek zochten naar het effect van zonbescherming op vitamine D-status vonden weinig bewijs dat normaal gebruik tot een tekort leidt. Een review in het British Journal of Dermatology concludeerde dat gebruik onder alledaagse omstandigheden zelden een klinisch relevante daling van 25-OH-vitamine D geeft. Drie dingen verklaren dat gat tussen lab en leven.\n\nDe aanbrengdikte is de grootste. In de praktijk brengen mensen doorgaans een kwart tot de helft aan van de 2 mg/cm² waarmee de factor is bepaald. De feitelijke bescherming ligt daardoor fors lager dan het getal op de fles — niet fijn voor verbrandingsrisico, maar het laat wel UVB door.\n\nDaarnaast wordt er gemist en niet herhaald: oren, nek, voetruggen, de rand bij de kleding. En smeren verlengt vaak de tijd buiten. Wie beschermd is blijft langer op het terras of aan het strand, en die extra blootstellingsduur compenseert een deel van het gefilterde UVB. In veldstudies onder mensen die intensief zonbescherming gebruiken — waaronder onderzoek bij groepen met een verhoogd huidkankerrisico — bleef de vitamine D-status doorgaans op peil.",
      bewijsKanttekening:
        "De veldstudies zijn overwegend observationeel en meten reëel gedrag, geen ideaal gebruik. Ze zeggen iets over wat er gemiddeld gebeurt, niet over wat er zou gebeuren bij perfect en herhaald smeren van elke huidplek.",
    },
    {
      type: "tekst",
      titel: "In Nederland is de breedtegraad het echte probleem",
      tekst:
        "Voor wie op 52 graden noorderbreedte woont is de discussie over crème sowieso ondergeschikt aan iets fundamentelers: van ongeveer oktober tot maart staat de zon hier zo laag dat er nauwelijks UVB van de juiste golflengte door de atmosfeer komt. Je huid maakt dan bijna niets aan, met of zonder zonbescherming. Dat is de reden dat de winterstatus in Nederland bij veel mensen laag ligt — niet de tube in de badkamerkast.\n\nDaar komt bij wat het meeste verschil maakt en zelden in een reel past: binnenwerk, een donkere huidskleur (meer melanine betekent langere blootstelling voor dezelfde aanmaak), bedekkende kleding en leeftijd. De huidsynthesecapaciteit neemt met het ouder worden af, wat de doelgroep boven de 40 direct raakt. Wil je weten of dat bij jou speelt, lees dan [vitamine D-tekort herkennen](/blog/vitamine-d-tekort-herkennen).",
    },
    {
      type: "opsomming",
      titel: "Wat je hiermee doet",
      inleiding:
        "Geen keuze tussen huid of vitamine D — die afruil is in de praktijk veel kleiner dan de post suggereert.",
      items: [
        "Blijf zonbescherming gebruiken bij langdurige of intense blootstelling; verbranding is een bewezen risicofactor voor huidkanker, een tekort door normaal smeergedrag is dat niet.",
        "Reken in de Nederlandse winter niet op je huid: van oktober tot maart is de zonnestand hier de beperkende factor, niet je crème.",
        "Hoor je bij een risicogroep (binnenwerk, donkere huid, bedekkende kleding, 70-plus), laat 25-OH-vitamine D dan meten in plaats van te gokken — zie [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol).",
        "Kies suppletie op basis van die meting en het advies dat erbij hoort, niet op basis van een tijdlijn. Vergelijk op [beste vitamine D](/beste/vitamine-d).",
        "Wees alert op de omgekeerde onzin: bewust verbranden 'voor je vitamine D' levert geen extra voorraad op — de aanmaak vlakt af, de schade niet.",
      ],
      callouts: [
        {
          variant: "letop",
          tekst:
            "Je huid stopt vanzelf met aanmaken. Na verzadiging breekt overtollige previtamine D3 af in inactieve producten, waardoor je via de zon geen vitamine D-vergiftiging kunt oplopen — maar langer in de zon blijven levert vanaf dat punt ook niets meer op behalve schade.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Waarom deze mythe zo goed werkt",
      tekst:
        "De post klopt op het punt dat verifieerbaar is (het percentage) en springt dan naar een conclusie die dat niet is (jouw status). Dat is het patroon achter de meeste supplementenonzin die je op je tijdlijn ziet: een echt mechanisme, uitvergroot tot een uitkomst waar het onderzoek niet over gaat. Dezelfde beweging zie je bij de claim dat je [K2 nodig hebt bij D3](/blog/vitamine-d-en-k2-samen) en bij het advies om [megadoses](/blog/vitamine-d-hoge-doses-social-media) te nemen. Wie dat patroon eenmaal herkent, heeft er meer aan dan aan een lijst met losse feiten.",
    },
    {
      type: "tekst",
      titel: "Turbo: ordenen in plaats van stapelen",
      tekst:
        "Vermoeidheid heeft zelden één oorzaak, en vitamine D is er hooguit één van. In de [Leefstijlcheck](/intake) vragen we onder meer naar zonlicht (LIF_SUN) en zetten we slaap, stress, voeding en beweging naast elkaar — zodat je ziet waar je winst zit voordat je iets koopt. De brede context staat in [energie na 40](/energie-na-40).",
    },
  ],
  kernpunten: [
    "SPF 30 filtert in het lab 95–98% van het UVB — dat mechanisme is echt.",
    "Onder normaal gebruik vinden reviews zelden een klinisch relevante daling van 25-OH-vitamine D.",
    "Te dun smeren, gemiste plekken en langer buiten blijven verklaren het verschil.",
    "In Nederland is de winterzon de beperkende factor, niet je zonnebrand.",
    "Meet bij risico; ga niet verbranden 'voor je vitamine D'.",
  ],
  samenvatting:
    "Zonbescherming filtert aantoonbaar het UVB dat je huid voor vitamine D-aanmaak gebruikt, maar in veldonderzoek leidt normaal gebruik zelden tot een lagere vitamine D-status — mensen smeren dunner dan de test, missen plekken en blijven langer buiten. In Nederland is de lage winterzon van oktober tot maart een veel grotere factor dan je crème. Blijf beschermen tegen verbranding en laat bij risico je 25-OH-vitamine D meten in plaats van te gokken.",
  supplementCTA: {
    naam: "Vitamine D3",
    uitleg:
      "Relevant in de Nederlandse winter en bij risicoprofielen — kies op gemeten status en advies, en let op µg/IE per capsule en inname met vet.",
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
    "vitamine-d-zon-nederland",
    "vitamine-d-en-k2-samen",
    "vitamine-d-tekort-herkennen",
  ],
  metaTitle: "Zonnebrand en vitamine D: blokkeert SPF je aanmaak?",
  metaDescription:
    "Blokkeert zonnebrandcrème je vitamine D? In het lab filtert SPF 30 tot 98% UVB, in veldonderzoek daalt de status zelden. Wat dat verschil verklaart en wat je ermee doet.",
  keywords: [
    "zonnebrand vitamine d",
    "zonnebrandcreme vitamine d tekort",
    "blokkeert zonnebrand vitamine d",
    "spf vitamine d aanmaak",
    "vitamine d zon nederland",
    "uvb zonnebrand",
  ],
  referenties: toRefs([
    "Matsuoka LY, Ide L, Wortsman J, MacLaughlin JA, Holick MF. Sunscreens suppress cutaneous vitamin D3 synthesis. J Clin Endocrinol Metab. 1987;64(6):1165-1168.",
    "Neale RE, Khan SR, Lucas RM, Waterhouse M, Whiteman DC, Olsen CM. The effect of sunscreen on vitamin D: a review. Br J Dermatol. 2019;181(5):907-915.",
    "Passeron T, Bouillon R, Callender V, et al. Sunscreen photoprotection and vitamin D status. Br J Dermatol. 2019;181(5):916-931.",
    "Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.",
    "Webb AR, Kline L, Holick MF. Influence of season and latitude on the cutaneous synthesis of vitamin D3. J Clin Endocrinol Metab. 1988;67(2):373-378.",
    "Petersen B, Wulf HC. Application of sunscreen: theory and reality. Photodermatol Photoimmunol Photomed. 2014;30(2-3):96-101.",
    "Young AR, Narbutt J, Harrison GI, et al. Optimal sunscreen use during a sun holiday with a very high ultraviolet index. Br J Dermatol. 2019;181(5):1052-1062.",
  ]),
};
