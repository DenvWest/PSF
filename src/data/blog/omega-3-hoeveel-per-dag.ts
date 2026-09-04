import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const omega3HoeveelPerDagData: BlogArtikel = {
  slug: "omega-3-hoeveel-per-dag",
  categorie: "supplementen",
  titel: "Hoeveel omega-3 per dag? Waarom het getal op de voorkant niet klopt",
  heroIntro:
    "“1000 mg visolie” klinkt als een ruime dosis, maar zegt niets over wat er werkt. De vraag is hoeveel [EPA en DHA](/kennisbank/epa-dha) er in zit — en daar zit tussen producten een factor drie tot vier verschil. Hier reken je in één keer uit wat jouw potje werkelijk levert, en zie je waarom de wettelijke drempel en de onderzoeksdosis twee heel verschillende getallen zijn.",
  leestijd: "9 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Dit artikel gaat over doseringen bij gezonde volwassenen. Wie medicatie gebruikt of onder behandeling staat voor hart- of vaatklachten, overlegt eerst met arts of apotheker.",
  secties: [
    {
      type: "tekst",
      titel: "Het getal op de voorkant is bijna nooit het getal dat telt",
      tekst:
        "Op de voorkant van een pot staat meestal de hoeveelheid visolie per capsule: 1000 mg. Dat is het gewicht van de olie, niet van de werkzame vetzuren daarin. Achterop, in de voedingswaardetabel, staat pas wat je echt binnenkrijgt: zoveel milligram EPA en zoveel milligram DHA.\n\nDaar zit het hele verschil. Een standaard visoliecapsule van 1000 mg bevat vaak 180 mg EPA en 120 mg DHA — samen 300 mg. Een geconcentreerde capsule van hetzelfde gewicht kan 600 tot 900 mg EPA+DHA bevatten. Twee potten die er op het schap identiek uitzien, verschillen dan een factor drie in wat ze leveren.\n\nDe rekensom die je maakt is dus altijd dezelfde: milligram EPA plus milligram DHA, keer het aantal capsules dat je per dag neemt. Alles wat op de voorkant staat, laat je buiten beschouwing.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Vergelijk nooit op milligram visolie, altijd op milligram EPA+DHA per dag. Doe je dat niet, dan vergelijk je capsulegewicht — en dat is precies waar de prijs per werkzame dosis zich verstopt.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Twee getallen die door elkaar lopen: claimdrempel en onderzoeksdosis",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "250 mg: wat de wet vraagt" },
        { titel: "1000–2000 mg: waar het onderzoek zit" },
      ],
      tekst:
        "In Europa mag een etiket alleen claims dragen die zijn toegelaten. Voor omega-3 zijn dat er drie, elk met een eigen voorwaarde: 250 mg EPA+DHA per dag voor de hartclaim, 250 mg DHA per dag voor de hersenclaim, en nog eens 250 mg DHA voor de claim over het gezichtsvermogen. Die drempels staan in het EU-claimregister en zijn hard: haal je ze niet, dan mag de claim er niet op.\n\nDat maakt 250 mg tot een wettelijk minimum, niet tot een advies. In het onderzoek waar de discussie over omega-3 werkelijk over gaat — triglyceriden, ontstekingsmarkers, de omega-3-index — liggen de gebruikte doseringen doorgaans tussen 1000 en 2000 mg EPA+DHA per dag, en in cardiologische trials aanzienlijk hoger. Tussen “mag de claim voeren” en “zit in het gebied waar effecten zijn gemeten” zit dus een factor vier tot acht.\n\nDe Gezondheidsraad hanteert voor de Nederlandse bevolking een richtlijn van ongeveer 200 mg EPA+DHA per dag, in te vullen via één portie vis per week. Dat is een bevolkingsadvies gericht op het voorkomen van een tekort — opnieuw een ander getal, met een ander doel.",
      bewijsKanttekening:
        "Een hogere dosis is niet automatisch beter. Boven ongeveer 2000 mg EPA+DHA per dag uit supplementen neemt het bewijs voor extra winst bij gezonde mensen af, terwijl signalen over boezemfibrilleren juist toenemen — zie het onderzoeksoverzicht verderop.",
    },
    {
      type: "opsomming",
      titel: "Reken het uit in drie stappen",
      inleiding:
        "Pak het potje dat je in huis hebt en loop deze drie stappen langs. Je hebt alleen de voedingswaardetabel op de achterkant nodig.",
      items: [
        "Zoek de regel “per capsule” of “per dagelijkse portie” en noteer EPA en DHA apart. Staat er alleen “omega-3” of “visolie” zonder uitsplitsing, dan is dat op zichzelf al informatie: transparante fabrikanten splitsen wel.",
        "Tel EPA en DHA op en vermenigvuldig met het aantal capsules dat je daadwerkelijk neemt — niet met het aantal dat op de verpakking wordt aangeraden.",
        "Deel de dagprijs door dat getal. Nu heb je de prijs per 1000 mg EPA+DHA, en pas dan vergelijk je twee producten eerlijk. Op de [vergelijking van omega-3 supplementen](/beste/omega-3-supplement) staat die som al voor je gemaakt.",
      ],
    },
    {
      type: "tekst",
      titel: "Waarom de verhouding EPA:DHA ook iets zegt",
      bewijsNiveau: "redelijk",
      tekst:
        "EPA en DHA zijn geen uitwisselbare grootheden. DHA is het structurele vetzuur: het zit in hoge concentratie in hersenweefsel en netvlies, en de twee EU-claims over hersenfunctie en gezichtsvermogen hangen er specifiek aan. EPA wordt vaker in verband gebracht met ontstekingsregulatie en is het vetzuur waar de grote cardiologische trials op inzetten.\n\nPraktisch betekent dat het volgende: een olie met veel EPA en weinig DHA haalt de hartclaim wel, maar de hersen- en gezichtsclaim niet. Dat is geen marketingdetail, het is een reëel verschil tussen twee producten met hetzelfde totaal. Wie op het totaal alleen vergelijkt, mist het. Hoe wij dat meewegen staat bij [claimdekking](/kennisbank/claimdekking) en in de [PS-Score-methodiek](/ps-score).\n\nVoor de meeste mensen zonder specifiek doel is een gemengde olie met beide vetzuren ruim vertegenwoordigd de verdedigbare keuze. Wie een reden heeft om op één van de twee te sturen, hoort die reden van een arts of diëtist te krijgen — niet van een productpagina.",
    },
    {
      type: "tekst",
      titel: "Wat een bovengrens betekent (en wat niet)",
      bewijsNiveau: "redelijk",
      tekst:
        "EFSA heeft beoordeeld dat een aanvullende inname tot 5000 mg EPA+DHA per dag uit supplementen bij volwassenen geen veiligheidszorgen oplevert op de onderzochte uitkomsten. Dat wordt online geregeld gelezen als “dus 5 gram is prima”. Dat is niet wat er staat: het is een veiligheidsbeoordeling, geen aanbeveling, en de beoordeling is ouder dan de trials die later een verhoogd risico op boezemfibrilleren bij hoge doses lieten zien.\n\nDe verstandige lezing is dat er tussen de claimdrempel en die bovengrens een breed gebied ligt waarin je zonder veel risico kunt bewegen, en dat er geen enkele reden is om aan de bovenkant te gaan zitten zonder medische indicatie. Voor iemand die weinig vis eet en zijn inname wil aanvullen, is 500 tot 1000 mg EPA+DHA per dag een gangbaar en goed verdedigbaar vertrekpunt.",
      callouts: [
        {
          variant: "letop",
          tekst:
            "Recepten met zeer hoge doses omega-3 (bijvoorbeeld bij sterk verhoogde triglyceriden) zijn geneesmiddelen met begeleiding en controle. Dat is een andere situatie dan een potje uit de drogist, en geen argument om zelf hoger te doseren.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: van dosering naar keuze",
      tekst:
        "Weet je eenmaal welk getal je zoekt, dan wordt kiezen simpel: je legt de EPA+DHA-waarde naast de prijs per dag en de zuiverheid. Alle stoffen langs dezelfde meetlat staan in de [supplementenafdeling](/supplementen); de omega-3-producten zelf vergelijk je op [beste omega-3 supplement](/beste/omega-3-supplement). Eet je regelmatig vis, lees dan eerst [omega-3 uit voeding](/blog/omega-3-uit-voeding-of-supplement) — dan is de vraag misschien helemaal niet hoeveel je moet slikken.",
    },
  ],
  kernpunten: [
    "Reken altijd met milligram EPA+DHA, nooit met milligram visolie.",
    "250 mg is de EU-claimdrempel; onderzoek werkt meestal met 1000–2000 mg.",
    "De verhouding EPA:DHA bepaalt welke claims een product überhaupt kan voeren.",
    "500–1000 mg EPA+DHA per dag is een verdedigbaar vertrekpunt bij weinig vis.",
    "EFSA's veiligheidsgrens van 5000 mg is geen aanbeveling om hoog te doseren.",
  ],
  samenvatting:
    "De hoeveelheid visolie op de voorkant van een potje zegt niets; het gaat om de milligrammen EPA en DHA achterop. De EU-claimdrempel ligt op 250 mg EPA+DHA per dag, terwijl onderzoek doorgaans met 1000 tot 2000 mg werkt — twee getallen met een heel verschillende betekenis. Voor wie weinig vis eet is 500 tot 1000 mg per dag een verdedigbaar vertrekpunt, en de verhouding tussen EPA en DHA bepaalt welke claims een product kan waarmaken.",
  supplementCTA: {
    naam: "Omega-3 (EPA/DHA)",
    uitleg:
      "Vergelijk op werkzame milligrammen per dag en prijs per 1000 mg EPA+DHA — dezelfde rekensom als hierboven, al gemaakt.",
    href: "/beste/omega-3-supplement",
  },
  cornerstoneLink: {
    label: "Supplementgids: omega-3",
    href: "/supplementen/omega-3",
  },
  vergelijkingExtraLink: {
    label: "Omega-3 supplementen vergelijken",
    href: "/beste/omega-3-supplement",
  },
  supplementenHubLink: {
    label: "Alle supplementen langs dezelfde meetlat",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "omega-3-uit-voeding-of-supplement",
    "algenolie-of-visolie",
    "omega-3-index-meten",
  ],
  metaTitle: "Hoeveel omega-3 per dag? EPA+DHA rekenen, niet visolie",
  metaDescription:
    "Hoeveel omega-3 per dag heb je nodig? Waarom 1000 mg visolie vaak 300 mg EPA+DHA is, wat de EU-claimdrempel van 250 mg betekent en wat onderzoek gebruikt.",
  keywords: [
    "hoeveel omega 3 per dag",
    "omega 3 dosering",
    "epa dha per dag",
    "omega 3 hoeveel mg",
    "visolie dosering",
    "omega 3 aanbevolen dagelijkse hoeveelheid",
  ],
  referenties: toRefs([
    "Commission Regulation (EU) No 432/2012 establishing a list of permitted health claims made on foods. Official Journal of the European Union. 2012.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on the tolerable upper intake level of eicosapentaenoic acid (EPA), docosahexaenoic acid (DHA) and docosapentaenoic acid (DPA). EFSA Journal. 2012;10(7):2815.",
    "Gezondheidsraad. Richtlijnen goede voeding 2015. Publicatienr. 2015/24. Den Haag.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for fats. EFSA Journal. 2010;8(3):1461.",
    "Skulas-Ray AC, Wilson PWF, Harris WS, et al. Omega-3 fatty acids for the management of hypertriglyceridemia: a science advisory from the American Heart Association. Circulation. 2019;140(12):e673-e691.",
    "Harris WS, Von Schacky C. The omega-3 index: a new risk factor for death from coronary heart disease? Prev Med. 2004;39(1):212-220.",
    "Albert BB, Derraik JGB, Cameron-Smith D, et al. Fish oil supplements in New Zealand are highly oxidised and do not meet label content of n-3 PUFA. Sci Rep. 2015;5:7928.",
  ]),
};
