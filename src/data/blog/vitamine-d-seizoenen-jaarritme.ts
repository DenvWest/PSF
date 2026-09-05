import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const vitamineDSeizoenenJaarritmeData: BlogArtikel = {
  slug: "vitamine-d-seizoenen-jaarritme",
  categorie: "energie",
  titel: "Vitamine D door het jaar heen: waarom je dieptepunt niet in december ligt",
  coverImage: "/images/blog/vitamine-d-seizoenen-jaarritme.jpg",
  coverImageAlt: "Mensen in gesprek in een lichte, seizoensgebonden setting",
  heroIntro:
    "De meeste mensen denken dat hun vitamine D-status meebeweegt met het weer: zon is hoog, dus status is hoog. In werkelijkheid loopt je waarde maanden achter op de zon. Je piek valt in de nazomer, je dal in het vroege voorjaar — en dat verschil verklaart waarom februari en maart de maanden zijn waarin een tekort zich meldt. Hier lees je hoe dat jaarritme werkt, wat het onderzoek erover laat zien en wat het betekent voor [vitamine D](/kennisbank/vitamine-d) en [energie na 40](/energie-na-40).",
  leestijd: "10 min",
  gepubliceerdOp: "2026-09-01",
  laatstBijgewerktOp: "2026-09-01",
  leesNuanceOnderHero:
    "Dit artikel beschrijft patronen uit bevolkingsonderzoek. Het zegt niets over jouw persoonlijke waarde — die is alleen met een bloedmeting te kennen, te bespreken met huisarts of POH.",
  secties: [
    {
      type: "tekst",
      titel: "Je lichaam heeft een voorraadkast",
      bewijsNiveau: "sterk",
      tekst:
        "De sleutel tot het hele seizoenspatroon is één eigenschap: 25-hydroxyvitamine D, de opslagvorm die in je lever wordt gemaakt, heeft een halfwaardetijd van ongeveer twee tot drie weken. Vitamine D3 zelf verdwijnt binnen een dag uit je bloed, maar de opslagvorm blijft weken hangen. Daarnaast slaat vetweefsel vitamine D op en geeft dat langzaam weer af.\n\nDat betekent dat je status geen momentopname is van de zon van vandaag, maar een optelsom van de afgelopen maanden. Een zonnige week in maart tilt je waarde nauwelijks op. Een zonnige zomer bouwt een buffer op waar je tot in de winter op teert.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Je vitamine D-status volgt de zon met een vertraging van ongeveer één tot twee maanden. Daarom is de laagste waarde van het jaar niet in december — de donkerste maand — maar in februari of maart.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Wat het bevolkingsonderzoek laat zien",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "Een sinusvormig patroon" },
        { titel: "Hoe groot het verschil is" },
      ],
      tekst:
        "In Europese cohorten is het seizoenspatroon van 25-OH-D een van de best gedocumenteerde bevindingen in het hele vitamine D-veld. Meet je een grote groep mensen het jaar rond, dan tekent zich een vloeiende golf af: stijgend vanaf april, piekend in augustus of september, dalend door de herfst, met een dal rond februari en maart.\n\nDe amplitude is aanzienlijk. In Noord-Europese studies liggen gemiddelde zomerwaarden vaak in de orde van 20 tot 30 nmol/l hoger dan winterwaarden bij dezelfde mensen. Dat is geen randverschijnsel — het is genoeg om iemand die in september ruim voldoende scoort in maart onder de gangbare drempel te laten uitkomen.\n\nHet gevolg voor de praktijk is groot: de maand van je bloedafname bepaalt mede je uitslag. Een meting in augustus en een meting in maart bij dezelfde persoon kunnen tot twee verschillende conclusies leiden, zonder dat er iets aan die persoon veranderd is.",
      bewijsKanttekening:
        "De genoemde ordegroottes zijn gemiddelden uit bevolkingsonderzoek en variëren sterk per cohort, breedtegraad, huidtype en suppletiegebruik. Ze beschrijven een patroon, geen voorspelling voor een individu.",
    },
    {
      type: "opsomming",
      titel: "Het Nederlandse jaar, in vier fases",
      inleiding:
        "Zonnestand en voorraadopbouw zijn twee verschillende dingen. Hier lopen ze naast elkaar.",
      items: [
        "April–juni: opbouwfase. De zon komt boven de kritische hoek uit, de aanmaak start en je status begint te stijgen — maar loopt nog achter op wat de zon aanbiedt.",
        "Juli–september: piekfase. Hier ligt je hoogste waarde van het jaar, doorgaans in de nazomer. Wat je nu opbouwt, is de buffer voor de rest van het jaar.",
        "Oktober–december: teerfase. De aanmaak valt weg omdat de zon te laag staat, maar je voorraad is nog gevuld. Veel mensen voelen en meten hier nog weinig.",
        "Januari–maart: dalfase. De buffer is op, de aanmaak staat nog stil. Dit is statistisch het dieptepunt en de periode waarin klachten en lage uitslagen zich concentreren.",
      ],
      callouts: [
        {
          variant: "tip",
          tekst:
            "Wil je weten hoe laag je kunt komen, meet dan in februari of maart. Wil je weten of je zomer genoeg oplevert, meet dan in september. Een enkele meting in mei zegt over geen van beide iets.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Waarom de winter bij de een hard aankomt en bij de ander niet",
      bewijsNiveau: "redelijk",
      subkoppen: [
        { titel: "Hoe hoog je piek was" },
        { titel: "Lichaamssamenstelling" },
        { titel: "Huid, leeftijd en gedrag" },
      ],
      tekst:
        "Twee mensen die in dezelfde straat wonen kunnen in maart tientallen nmol/l uit elkaar liggen. Het begint bij de hoogte van de zomerpiek: wie een buitenbaan heeft of twee weken zuidelijk op vakantie ging, start het winterhalfjaar met een veel voller reservoir dan wie de zomer binnen doorbracht.\n\nLichaamssamenstelling telt daarnaast mee. Vitamine D is vetoplosbaar en verdeelt zich over het vetweefsel; bij een hoger vetpercentage verdunt dezelfde hoeveelheid over een groter volume, wat de gemeten serumwaarde drukt. In onderzoek is een hogere BMI dan ook consistent geassocieerd met lagere 25-OH-D-waarden.\n\nEn dan de factoren die de aanmaakcapaciteit zelf bepalen: melanine verlengt de benodigde blootstelling fors, de huidsynthese neemt met de leeftijd af, en wie overdag binnen werkt mist juist de uren rond het middaguur waarin er iets te halen valt. Die drie staan uitgebreider in [hoeveel zon je nodig hebt](/blog/vitamine-d-zon-nederland).",
      bewijsKanttekening:
        "Het verband tussen vetweefsel en serumwaarden is grotendeels observationeel en het mechanisme (verdunning versus opslag) is niet volledig uitgeklaard.",
    },
    {
      type: "tekst",
      titel: "Betekent 'winterdip' dat je vermoeidheid van vitamine D komt?",
      bewijsNiveau: "beperkt",
      tekst:
        "Hier is voorzichtigheid op zijn plaats, want de verleiding is groot. In de winter is de vitamine D-status laag én voelen veel mensen zich matter, somberder en trager. Twee dingen die samen bewegen — maar de winter verandert veel meer dan alleen je vitamine D: minder daglicht op je netvlies, een verschoven [circadiaan ritme](/kennisbank/circadiaan-ritme), minder beweging buiten, ander eetpatroon en minder sociale activiteit. Hoe dat precies met slaap samenhangt staat in [vitamine D en slaap](/blog/vitamine-d-en-slaap).\n\nTrials die vitamine D-suppletie testten op stemming en vermoeidheid bij mensen zonder aangetoond tekort laten doorgaans weinig effect zien. Dat maakt vitamine D niet irrelevant — bij een echt tekort is aanvullen zinvol — maar het maakt de gedachte 'ik ben moe in maart, dus vitamine D is mijn oorzaak' een aanname in plaats van een conclusie. Dezelfde denkstap bespreek ik in [hoge doses vitamine D](/blog/vitamine-d-hoge-doses-social-media).",
      bewijsKanttekening:
        "Onderzoek naar vitamine D en stemming is heterogeen en wordt bemoeilijkt doordat lage status ook een gevolg van minder buiten komen kan zijn. Lees het als 'niet aangetoond', niet als 'weerlegd'.",
    },
    {
      type: "opsomming",
      titel: "Wat je met dit jaarritme doet",
      items: [
        "Bouw in het zomerhalfjaar bewust op: regelmatig kort daglicht rond het midden van de dag vult de buffer waar je in januari op teert.",
        "Kies je meetmoment met opzet en noteer erbij in welke maand het was — zie [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol).",
        "Vergelijk nooit een septemberwaarde met een maartwaarde en trek daar een conclusie over achteruitgang uit.",
        "Overweeg je suppletie vanwege de winter, dan is het winterhalfjaar de logische periode — niet augustus.",
        "Verbrand niet 'om vooruit te sparen': na verzadiging maakt je huid niets extra's meer aan, de schade loopt wel door. Zie [zonnebrand en vitamine D](/blog/zonnebrand-en-vitamine-d).",
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: wat er nog meer met de seizoenen meebeweegt",
      tekst:
        "Daglicht stuurt niet alleen vitamine D-aanmaak maar ook je slaap-waakritme, en in de winter verschuiven allebei. In de [Leefstijlcheck](/intake) vragen we naar zonlicht (LIF_SUN) naast slaap, stress en beweging — zodat je ziet welke van die seizoensfactoren bij jou het zwaarst weegt. De bredere gids: [energie na 40](/energie-na-40).",
    },
  ],
  kernpunten: [
    "25-OH-D heeft een halfwaardetijd van 2–3 weken; je status loopt maanden achter op de zon.",
    "Piek in de nazomer, dal in februari en maart — niet in december.",
    "In Noord-Europese cohorten schelen zomer en winter vaak 20–30 nmol/l.",
    "De maand van je bloedafname bepaalt mede je uitslag.",
    "Winterdip en lage status bewegen samen, maar dat is nog geen oorzaak.",
  ],
  samenvatting:
    "Omdat 25-OH-vitamine D een halfwaardetijd van twee tot drie weken heeft, loopt je status maanden achter op de zonnestand: de piek valt in de nazomer en het dal in februari of maart. In Noord-Europese cohorten schelen zomer- en winterwaarden vaak 20 tot 30 nmol/l, waardoor de maand van je bloedafname mede je uitslag bepaalt. Hoe hard de winter aankomt hangt af van je zomerpiek, lichaamssamenstelling, huidtype en leeftijd.",
  supplementCTA: {
    naam: "Vitamine D3",
    uitleg:
      "Als je vanwege het winterhalfjaar aanvult: vergelijk µg/IE per capsule en prijs per dag, en neem in bij een maaltijd met vet.",
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
  gerelateerdeSluggen: [
    "vitamine-d-zon-nederland",
    "vitamine-d-meten-wanneer-zinvol",
    "zonnebrand-en-vitamine-d",
  ],
  metaTitle: "Vitamine D en seizoenen: waarom je dal in maart ligt",
  metaDescription:
    "Vitamine D door het jaar: waarom je status maanden achterloopt op de zon, piekt in de nazomer en daalt tot februari–maart. Wat bevolkingsonderzoek laat zien.",
  keywords: [
    "vitamine d seizoenen",
    "vitamine d winter",
    "vitamine d zomer waarde",
    "vitamine d wanneer laagste",
    "vitamine d jaarritme",
    "vitamine d maart tekort",
  ],
  referenties: toRefs([
    "Jones G. Pharmacokinetics of vitamin D toxicity. Am J Clin Nutr. 2008;88(2):582S-586S.",
    "Klingberg E, Olerod G, Konar J, Petzold M, Hammarsten O. Seasonal variations in serum 25-hydroxyvitamin D levels in a Swedish cohort. Endocrine. 2015;49(3):800-808.",
    "Kasahara AK, Singh RJ, Noymer A. Vitamin D (25OHD) serum seasonality in the United States. PLoS One. 2013;8(6):e65785.",
    "Webb AR, Kline L, Holick MF. Influence of season and latitude on the cutaneous synthesis of vitamin D3. J Clin Endocrinol Metab. 1988;67(2):373-378.",
    "Wortsman J, Matsuoka LY, Chen TC, Lu Z, Holick MF. Decreased bioavailability of vitamin D in obesity. Am J Clin Nutr. 2000;72(3):690-693.",
    "Spiro A, Buttriss JL. Vitamin D: an overview of vitamin D status and intake in Europe. Nutr Bull. 2014;39(4):322-350.",
    "Heaney RP, Armas LA, Shary JR, Bell NH, Binkley N, Hollis BW. 25-Hydroxylation of vitamin D3: relation to circulating vitamin D3 under various input conditions. Am J Clin Nutr. 2008;87(6):1738-1742.",
  ]),
};
