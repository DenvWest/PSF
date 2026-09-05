import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const wheyEnDarmklachtenData: BlogArtikel = {
  slug: "whey-en-darmklachten",
  categorie: "supplementen",
  titel: "Opgeblazen na je shake? Waarom whey vaak niet de schuldige is",
  coverImage: "/images/blog/whey-en-darmklachten.jpg",
  coverImageAlt: "Eiwitrijke voeding op een rustige ondergrond",
  heroIntro:
    "Een uur na je shake zit je vol lucht, of je moet plotseling naar de wc. De standaardconclusie is dan snel getrokken: lactose, dus isolaat kopen. Vaak klopt die conclusie niet — in een gewone portie concentraat zit minder lactose dan in een glas melk. Hier lees je welke drie oorzaken door elkaar worden gehaald, hoe je ze zelf uit elkaar houdt en wanneer klachten reden zijn om naar de huisarts te gaan.",
  leestijd: "8 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Wij stellen geen diagnoses. Aanhoudende darmklachten, huidreacties of benauwdheid horen bij je huisarts, niet bij een artikel over supplementen.",
  secties: [
    {
      type: "tekst",
      titel: "Ken je dit?",
      tekst:
        "De shake gaat er prima in, maar een uur later zit je met een opgeblazen buik achter je bureau. Je zoekt het op, leest \"lactose\" en koopt een duurdere bus isolaat. Bij de helft van de mensen verdwijnen de klachten daarmee — en bij de andere helft niet, want de oorzaak zat ergens anders.",
    },
    {
      type: "tekst",
      titel: "Drie oorzaken die door elkaar lopen",
      bewijsNiveau: "sterk",
      tekst:
        "Wat mensen \"whey verdragen\" noemen, is in werkelijkheid een van drie verschillende dingen. Ze vragen om een verschillende oplossing, en alleen de eerste twee hebben iets met melk te maken.",
      subkoppen: [
        {
          titel: "1. Lactose-intolerantie",
          tekst:
            "Je dunne darm maakt te weinig lactase, waardoor melksuiker onverteerd in de dikke darm komt en daar door bacteriën wordt vergist: gas, kramp, soms diarree. Het is een kwestie van hoeveelheid, niet van alles of niets — veel mensen met lactosemalabsorptie verdragen tot ongeveer 12 gram lactose in één keer, en verspreid over de dag nog wat meer.",
        },
        {
          titel: "2. Koemelkeiwitallergie",
          tekst:
            "Hier reageert je afweersysteem op het melkeiwit zelf. Dat geeft andere verschijnselen: jeuk, huiduitslag, zwelling, benauwdheid of braken, meestal binnen minuten tot een uur. Dit is geen kwestie van een kleinere portie proberen — dit hoort bij de huisarts, en overstappen op isolaat lost het niet op.",
        },
        {
          titel: "3. Alles wat er verder in de bus zit",
          tekst:
            "Dit is de vergeten categorie: zoetstoffen, suikeralcoholen zoals sorbitol en maltitol, verdikkingsmiddelen als xanthaan- of guargom, en toegevoegde vezels als inuline. Die zijn er niet om je eiwit te leveren maar om structuur en smaak te geven, en ze zijn een bekende bron van gasvorming bij gevoelige darmen.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Reken uit hoeveel lactose er echt in zit",
      bewijsNiveau: "redelijk",
      tekst:
        "Een portie van 30 gram wei-concentraat bevat in de orde van 1 tot 3 gram lactose. Een glas melk van 200 milliliter zit rond de 9 tot 10 gram. Drink je je shake met melk in plaats van water, dan komt het overgrote deel van de lactose dus niet uit het poeder maar uit de melk. Wie klachten krijgt van één schep op water, terwijl een cappuccino geen probleem is, moet de oorzaak vrijwel zeker ergens anders zoeken dan bij lactose.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Krijg je klachten van een shake op water, maar niet van een glas melk? Dan is lactose niet de verklaring — kijk naar de zoetstoffen en de portiegrootte.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Zo zoek je het in vier stappen uit",
      inleiding:
        "Verander één ding tegelijk en houd het een week vol. Alles tegelijk veranderen levert geen antwoord op.",
      items: [
        "Halveer de portie: neem twee weken lang een halve schep, twee keer per dag. Verdwijnen de klachten, dan was het de hoeveelheid en niet het product.",
        "Zet de melk opzij: maak de shake op water. Blijven de klachten weg, dan zat de lactose in de melk.",
        "Wissel van smaak of merk: kies een neutrale, ongezoete variant zonder suikeralcoholen en zonder toegevoegde vezels. Dit is de stap die het vaakst wordt overgeslagen en het vaakst helpt.",
        "Pas dan isolaat proberen: alleen als de eerste drie stappen niets opleverden en je vermoedt dat het toch de melksuiker is. Wat je dan koopt, staat in [concentraat, isolaat of hydrolysaat](/blog/whey-concentraat-isolaat-hydrolysaat).",
      ],
    },
    {
      type: "opsomming",
      titel: "Kleine dingen die vaak genoeg zijn",
      inleiding:
        "Geen van deze punten haalt de voorpagina, maar samen lossen ze een groot deel van de klachten op.",
      items: [
        "Drink langzamer: een shake in tien seconden wegdrinken zet je maag onder druk en levert vaker een opgeblazen gevoel op.",
        "Neem het bij een maaltijd: eiwit dat met ander eten binnenkomt, verlaat je maag geleidelijker.",
        "Meng met meer water: een dikke, geconcentreerde shake valt zwaarder dan dezelfde schep in 400 milliliter.",
        "Overweeg lactase bij een bekende intolerantie: een lactasetablet bij zuivelmomenten is een gangbare oplossing, te bespreken met apotheek of huisarts.",
        "Kies zo nodig een plantaardige blend: als zuivel structureel niet valt, is [plantaardig eiwit](/blog/whey-of-plantaardig-eiwit) geen tweede keus maar het passende product.",
      ],
    },
    {
      type: "opsomming",
      titel: "Wanneer je naar de huisarts gaat",
      inleiding:
        "Bij deze verschijnselen stop je met zelf uitproberen. Ze horen bij een arts, ongeacht of er een shake in het spel is.",
      items: [
        "Zwelling van lippen, tong of keel, benauwdheid, galbulten of braken kort na inname.",
        "Aanhoudende diarree, bloed of slijm bij de ontlasting, of nachtelijke klachten.",
        "Onbedoeld gewichtsverlies, koorts of aanhoudende buikpijn zonder duidelijke aanleiding.",
        "Darmklachten die weken aanhouden nadat je het poeder allang hebt weggelaten.",
      ],
    },
    {
      type: "tekst",
      titel: "Wat je niet hoeft te kopen",
      tekst:
        "Rond dit onderwerp staat veel te koop dat het probleem niet oplost: spijsverteringsenzymblends die aan poeders worden toegevoegd \"voor betere opname\", detoxkuren en darmreinigingen. Voor gezonde volwassenen is eiwit uit een poeder gewoon eiwit; verteringsproblemen komen zelden doordat je lichaam het eiwit niet aankan. Krijg je van een specifiek product klachten en van een ander niet, dan ligt het antwoord bijna altijd in de ingrediëntenlijst — niet in een extra supplement. Welke regels op een etiket iets zeggen, staat in [het etiket van eiwitpoeder lezen](/blog/whey-etiket-lezen).",
    },
    {
      type: "tekst",
      titel: "Turbo: kies op ingrediëntenlijst, niet op smaakbelofte",
      tekst:
        "Wie gevoelige darmen heeft, kiest een korte ingrediëntenlijst: eiwitbron, aroma, eventueel één zoetstof. In de [supplementengids](/supplementen) staan alle stoffen op dezelfde meetlat en zie je bij [alle eiwitpoeders](/supplementen?categorie=eiwitpoeder) hoe producten zich verhouden op eiwitgehalte, claimvoorwaarde en prijs per dag. Twijfel je of je poeder nodig hebt: [voor wie whey iets toevoegt](/blog/whey-wanneer-wel-en-niet).",
    },
  ],
  kernpunten: [
    "Lactose-intolerantie, koemelkeiwitallergie en toevoegingen zijn drie verschillende oorzaken.",
    "Een portie concentraat bevat 1 tot 3 gram lactose — minder dan een glas melk.",
    "Zoetstoffen, suikeralcoholen en toegevoegde vezels zijn de meest onderschatte oorzaak.",
    "Verander één ding tegelijk: portie, melk, smaakvariant, en pas dan isolaat.",
    "Zwelling, benauwdheid, bloedverlies of gewichtsverlies: naar de huisarts, niet naar een ander merk.",
  ],
  samenvatting:
    "Klachten na een eiwitshake worden bijna automatisch aan lactose toegeschreven, terwijl een portie wei-concentraat maar 1 tot 3 gram lactose bevat — minder dan een glas melk. Vaker zit de oorzaak in de portiegrootte, in de melk waarmee je mengt, of in zoetstoffen, suikeralcoholen en toegevoegde vezels. Test één verandering per keer en houd die een week vol; isolaat is pas stap vier. Bij zwelling, benauwdheid, huidreacties, bloedverlies of onbedoeld gewichtsverlies stop je met uitproberen en ga je naar de huisarts.",
  supplementCTA: {
    naam: "Eiwitpoeder",
    uitleg:
      "Bij gevoelige darmen weegt de ingrediëntenlijst zwaarder dan het eiwitpercentage: hoe korter, hoe voorspelbaarder.",
    href: "/supplementen/eiwitpoeder",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: voeding na 40",
    href: "/voeding-na-40",
  },
  vergelijkingExtraLink: {
    label: "Alle eiwitpoeders in de supplementengids",
    href: "/supplementen?categorie=eiwitpoeder",
  },
  gerelateerdeSluggen: [
    "whey-concentraat-isolaat-hydrolysaat",
    "whey-of-plantaardig-eiwit",
    "whey-wanneer-wel-en-niet",
  ],
  metaTitle: "Whey en darmklachten: lactose, allergie of toevoegingen?",
  metaDescription:
    "Opgeblazen gevoel na een eiwitshake? Het verschil tussen lactose-intolerantie, koemelkeiwitallergie en toevoegingen — plus een stappenplan om het uit te zoeken.",
  keywords: [
    "whey buikpijn",
    "opgeblazen gevoel eiwitshake",
    "whey lactose intolerantie",
    "eiwitpoeder darmklachten",
    "whey winderigheid",
    "lactosevrij eiwitpoeder",
  ],
  referenties: toRefs([
    "Misselwitz B, Butter M, Verbeke K, Fox MR. Update on lactose malabsorption and intolerance: pathogenesis, diagnosis and clinical management. Gut. 2019;68(11):2080-2091.",
    "Suarez FL, Savaiano DA, Levitt MD. A comparison of symptoms after the consumption of milk or lactose-hydrolyzed milk by people with self-reported severe lactose intolerance. N Engl J Med. 1995;333(1):1-4.",
    "Shaukat A, Levitt MD, Taylor BC, et al. Systematic review: effective management strategies for lactose intolerance. Ann Intern Med. 2010;152(12):797-803.",
    "Fiocchi A, Brozek J, Schunemann H, et al. World Allergy Organization (WAO) diagnosis and rationale for action against cow's milk allergy (DRACMA) guidelines. Pediatr Allergy Immunol. 2010;21(Suppl 21):1-125.",
    "Gibson PR, Shepherd SJ. Evidence-based dietary management of functional gastrointestinal symptoms: the FODMAP approach. J Gastroenterol Hepatol. 2010;25(2):252-258.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on the substantiation of health claims related to the sugar replacers and reduction of post-prandial glycaemic responses. EFSA Journal. 2011;9(4):2076.",
    "Deng Y, Misselwitz B, Dai N, Fox M. Lactose intolerance in adults: biological mechanism and dietary management. Nutrients. 2015;7(9):8020-8035.",
  ]),
};
