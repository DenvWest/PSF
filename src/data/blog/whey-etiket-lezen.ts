import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const wheyEtiketLezenData: BlogArtikel = {
  slug: "whey-etiket-lezen",
  categorie: "supplementen",
  titel: "Het etiket van eiwitpoeder lezen: vier getallen en één valkuil",
  heroIntro:
    "De voorkant van de bus verkoopt, de achterkant informeert. Wie leert waar hij moet kijken, ziet binnen dertig seconden of een poeder goed of duur is — en of het eiwitgehalte op de voorkant eerlijk tot stand komt. Hier lees je welke vier getallen ertoe doen, hoe je de prijs per 100 gram eiwit uitrekent, en waarom een lange lijst losse aminozuren een waarschuwing is.",
  leestijd: "9 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  secties: [
    {
      type: "tekst",
      titel: "Ken je dit?",
      tekst:
        "Voorkant: 24 gram eiwit per shake. Achterkant: schepgrootte 34 gram. Dat betekent dat ruim een kwart van wat je schept geen eiwit is — en dat is niet verboden of verdacht, maar het verandert wel je rekensom. Twee bussen met dezelfde belofte op de voorkant kunnen twintig procent uit elkaar liggen zodra je per gram eiwit rekent.",
    },
    {
      type: "tekst",
      titel: "Getal 1: eiwit per 100 gram poeder",
      bewijsNiveau: "sterk",
      tekst:
        "Dit is het enige getal waarmee je twee producten eerlijk vergelijkt, want het staat los van de schepgrootte die de fabrikant zelf kiest. Een concentraat zit doorgaans tussen de 70 en 80 gram eiwit per 100 gram, een isolaat tussen 88 en 92. Zakt een product onder de 70, dan betaal je voor een aanzienlijk deel mee aan suiker, vet, aroma en verdikkingsmiddel. Voor plantaardige blends liggen de percentages gemiddeld iets lager; dat is inherent aan de grondstof.",
    },
    {
      type: "tekst",
      titel: "Getal 2: gram eiwit per portie, niet de schepgrootte",
      tekst:
        "Voedingswaardetabellen mogen per 100 gram én per portie worden gegeven, en de portie bepaalt de fabrikant. Een grotere schep laat de belofte op de voorkant groeien zonder dat het product beter is. Reken daarom terug: gram eiwit per portie gedeeld door de schepgrootte geeft je opnieuw het percentage van getal 1. Wijken die twee van elkaar af, dan klopt er iets niet in de tabel.",
      callouts: [
        {
          variant: "tip",
          tekst:
            "Weeg één keer een schep op een keukenweegschaal. Meegeleverde scoops zitten er in de praktijk regelmatig een paar gram naast.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Getal 3: prijs per 100 gram eiwit",
      tekst:
        "Prijs per kilo poeder zegt niets, prijs per 100 gram eiwit alles. Vermenigvuldig het gewicht van de bus met het eiwitpercentage, dan weet je hoeveel eiwit erin zit; deel de prijs vervolgens door dat aantal. Een bus van 1 kilo met 75 procent eiwit levert 750 gram eiwit — voor 22 euro betaal je 2,93 euro per 100 gram eiwit. Zet dat getal naast magere kwark, eieren en kipfilet en je weet meteen of het poeder je gemak waard is.",
      bewijsKanttekening:
        "De genoemde bedragen zijn rekenvoorbeelden om de methode te tonen, geen actuele marktprijzen.",
    },
    {
      type: "tekst",
      titel: "Getal 4: de ingrediëntenlijst — en de valkuil",
      bewijsNiveau: "redelijk",
      tekst:
        "Ingrediënten staan wettelijk op volgorde van afnemend gewicht. Wat je wilt zien is een eiwitbron bovenaan en daarna weinig. Wat je niet wilt zien: een rij losse aminozuren zoals glycine, taurine of alanine hoog in de lijst.",
      subkoppen: [
        {
          titel: "Waarom losse aminozuren een signaal zijn",
          tekst:
            "Het eiwitgehalte van een poeder wordt standaard bepaald door het stikstofgehalte te meten en dat om te rekenen. Losse aminozuren bevatten ook stikstof en tellen in die meting dus mee als eiwit, terwijl ze veel goedkoper zijn en niet hetzelfde bijdragen aan een compleet eiwitprofiel. Dat mechanisme staat in de branche bekend als aminozuurspiking. Het is niet per definitie fraude — het wordt alleen zelden gedaan om jou te helpen.",
        },
        {
          titel: "Mengsels zonder verhouding",
          tekst:
            "Staat er alleen \"eiwitmelange (concentraat, isolaat)\" zonder percentages, dan weet je niet wat je koopt. In de praktijk zit de goedkoopste component dan vooraan. Een product dat de verhouding wél noemt, geeft je iets om op te vergelijken.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Wat er wél en niet op mag staan",
      inleiding:
        "De claimregels in de EU zijn strikt, en juist daarom verraadt de voorkant veel over de fabrikant.",
      items: [
        "Toegestaan bij voldoende eiwit: bijdragen aan de groei en instandhouding van spiermassa, en aan de instandhouding van normale botten. Meer daarover bij [EFSA-claims](/kennisbank/efsa-claims).",
        "Voorwaardelijk: \"bron van eiwit\" en \"hoog gehalte aan eiwitten\" mogen alleen als eiwit een vastgesteld deel van de energiewaarde levert — niet zomaar omdat er eiwit in zit.",
        "Niet toegestaan: beloftes over testosteron, vetverbranding, energie of herstel als etiketclaim. Zie je die toch, dan weet je hoe serieus de rest van de communicatie is.",
        "Verplicht: allergenen vet gedrukt in de ingrediëntenlijst — bij wei dus melk. Dat geldt ook voor isolaat.",
      ],
    },
    {
      type: "tekst",
      titel: "Onafhankelijke controle: wanneer dat echt telt",
      bewijsNiveau: "redelijk",
      tekst:
        "Keurmerken als Informed Sport en NSF Certified for Sport betekenen dat batches door een extern laboratorium zijn getest op verontreinigingen en op stoffen van de dopinglijst. Voor een gecontroleerde sporter is dat geen luxe maar een noodzaak: in onderzoek naar sportsupplementen wordt met enige regelmaat kruisbesmetting gevonden. Voor de doorsnee 45-jarige die twee keer per week traint, is het vooral een indicatie dat een fabrikant bereid is zijn product extern te laten controleren. Losse metingen vinden bovendien meetbare zware metalen in eiwitpoeders, gemiddeld vaker in plantaardige dan in wei-producten. Achtergrond staat bij [derde-partij-testen](/kennisbank/derde-partij-testen) en [etikettransparantie](/kennisbank/etikettransparantie).",
      bewijsKanttekening:
        "Onderzoek naar verontreiniging betreft steekproeven uit specifieke markten en jaren. Het zegt iets over de sector, niet over een individueel product dat je vandaag in handen hebt.",
    },
    {
      type: "opsomming",
      titel: "Woorden waar je niets voor hoeft te betalen",
      inleiding:
        "Allemaal legaal, geen ervan zegt iets over de kwaliteit van het eiwit in de bus.",
      items: [
        "Grasgevoerd, native, koudgefilterd, cross-flow: productiebeschrijvingen zonder gekoppelde gezondheidsclaim.",
        "Toegevoegde BCAA's of extra leucine: wei bevat die aminozuren van nature al ruim; toevoegen verhoogt vooral de prijs.",
        "Spijsverteringsenzymen \"voor betere opname\": bij gezonde volwassenen is eiwitvertering geen knelpunt.",
        "Instant of micro-geïnstantiseerd: dat gaat over oplosbaarheid in je shaker, niet over opname in je lichaam.",
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: dezelfde meetlat voor elk product",
      tekst:
        "Wij leggen precies deze getallen naast elkaar: eiwit per portie, of de EU-claimvoorwaarde gehaald wordt, en de prijs per claim-conforme dag. Dat staat voor elke stof in de [supplementengids](/supplementen) en voor deze categorie bij [alle eiwitpoeders](/supplementen?categorie=eiwitpoeder). Twijfel je nog over de vorm, lees dan [concentraat, isolaat of hydrolysaat](/blog/whey-concentraat-isolaat-hydrolysaat).",
    },
  ],
  kernpunten: [
    "Vergelijk op eiwit per 100 gram poeder — dat staat los van de schepgrootte.",
    "Gram eiwit per portie gedeeld door schepgrootte hoort hetzelfde percentage op te leveren.",
    "Prijs per 100 gram eiwit is het enige eerlijke prijsgetal.",
    "Losse aminozuren hoog in de ingrediëntenlijst kunnen het eiwitgehalte kunstmatig opblazen.",
    "Claims over testosteron, vetverbranding of energie mogen niet op een eiwitetiket staan.",
  ],
  samenvatting:
    "Een eiwitetiket lees je met vier getallen: eiwit per 100 gram poeder, gram eiwit per portie afgezet tegen de schepgrootte, de prijs per 100 gram eiwit, en de ingrediëntenlijst. Die laatste bevat de valkuil: losse aminozuren zoals glycine of taurine tellen mee in de standaardmeting van het eiwitgehalte en kunnen het percentage opblazen zonder dat je er iets aan hebt. In de EU mogen op eiwit alleen claims over spiermassa en botten staan; beloftes over testosteron, energie of vetverbranding horen er niet. Onafhankelijke batchcontrole telt het zwaarst voor gecontroleerde sporters en is verder een teken van transparantie.",
  supplementCTA: {
    naam: "Eiwitpoeder",
    uitleg:
      "Bekijk per product het eiwitpercentage, de portie en de prijs per claim-conforme dag in plaats van de belofte op de voorkant.",
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
    "whey-concentraat-isolaat-hydrolysaat",
    "whey-wanneer-wel-en-niet",
    "whey-en-darmklachten",
  ],
  metaTitle: "Eiwitpoeder-etiket lezen: 4 getallen die ertoe doen",
  metaDescription:
    "Zo lees je het etiket van whey: eiwit per 100 gram, gram per portie, prijs per 100 gram eiwit en de ingrediëntenlijst — inclusief de valkuil van aminozuurspiking.",
  keywords: [
    "eiwitpoeder etiket",
    "eiwitpercentage whey",
    "aminozuurspiking",
    "prijs per 100 gram eiwit",
    "beste whey waar op letten",
    "informed sport keurmerk",
  ],
  referenties: toRefs([
    "Regulation (EC) No 1924/2006 of the European Parliament and of the Council on nutrition and health claims made on foods. Official Journal of the European Union. 2006.",
    "Commission Regulation (EU) No 432/2012 establishing a list of permitted health claims made on foods. Official Journal of the European Union. 2012.",
    "Regulation (EU) No 1169/2011 on the provision of food information to consumers. Official Journal of the European Union. 2011.",
    "Mariotti F, Tome D, Mirand PP. Converting nitrogen into protein: beyond 6.25 and Jones' factors. Crit Rev Food Sci Nutr. 2008;48(2):177-184.",
    "Maughan RJ, Burke LM, Dvorak J, et al. IOC consensus statement: dietary supplements and the high-performance athlete. Br J Sports Med. 2018;52(7):439-455.",
    "Martinez-Sanz JM, Sospedra I, Ortiz CM, Baladia E, Gil-Izquierdo A, Ortiz-Moncada R. Intended or unintended doping? A review of the presence of doping substances in dietary supplements used in sports. Nutrients. 2017;9(10):1093.",
    "Bandara SB, Towle KM, Monnot AD. A human health risk assessment of heavy metal ingestion among consumers of protein powder supplements. Toxicol Rep. 2020;7:1255-1262.",
  ]),
};
