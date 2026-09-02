import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const multivitamineZinvolNa40Data: BlogArtikel = {
  slug: "multivitamine-zinvol-na-40",
  categorie: "supplementen",
  titel: "Waarom wij geen multivitamine aanbevelen",
  heroIntro:
    "Zoek \"beste multivitamine\" en je krijgt tien tot veertig producten die allemaal winnen. Niemand in die lijstjes stelt de vraag die er echt toe doet: heb je een multivitamine nodig, of heb je iets specifieks nodig? Dit is geen vergelijking — het is het argument waarom we er geen maken.",
  leestijd: "6 min",
  gepubliceerdOp: "2026-09-02",
  secties: [
    {
      type: "tekst",
      titel: "Het probleem is niet één ingrediënt — het is de aanpak",
      tekst:
        "Een multivitamine is een [kennisbank-term](/kennisbank/multivitamine) met een simpel idee erachter: stop tien tot dertig micronutriënten in één capsule, rond de aanbevolen dagelijkse hoeveelheid, en je zit \"voor de zekerheid\" goed. Dat klinkt logisch — totdat je je afvraagt waaróm je die zekerheid nodig hebt. De meeste mensen die een multivitamine kopen, hebben geen gemeten tekort. Ze hebben een vaag gevoel dat meer dekking geen kwaad kan. Dat gevoel is het product, niet de voeding.",
    },
    {
      type: "tekst",
      titel: "Wat het onderzoek laat zien",
      bewijsNiveau: "sterk",
      tekst:
        "Dit is geen kwestie van \"gebrek aan bewijs\" — er is juist veel onderzoek, en het wijst consistent dezelfde kant op. De USPSTF-review uit 2013 (Fortmann et al., gepubliceerd naast een redactioneel standpunt met de titel \"Enough Is Enough: Stop Wasting Money on Vitamin and Mineral Supplements\") vond geen duidelijk voordeel van multivitamines op hart- en vaatziekten of kanker bij volwassenen zonder vastgesteld tekort. Het herziene USPSTF-standpunt uit 2022 kwam tot dezelfde conclusie — onvoldoende bewijs voor een algemene aanbeveling, met een expliciete waarschuwing tégen bèta-caroteen en vitamine E als supplement. De Gezondheidsraad en het Voedingscentrum sluiten daarbij aan: gerichte suppletie voor risicogroepen (vitamine D in de winter, B12 bij een plantaardig voedingspatroon), geen algemeen multivitamine-advies voor iedereen.",
    },
    {
      type: "tekst",
      titel: "Waarom \"gericht\" wint van \"allemaal een beetje\"",
      tekst:
        "Onze aanpak op deze site is precies het tegenovergestelde uitgangspunt: je vult een [Leefstijlcheck](/intake) in, en op basis van je profiel — niet op basis van wat iedereen slikt — komt daar een gerichte aanbeveling uit. Een tekort aan magnesium los je op met magnesium, niet met een tablet die ook nog eens elf andere stoffen bevat die je al voldoende binnenkrijgt via voeding. Dat is geen marketingstandpunt; het is de basis van hoe we [supplementen beoordelen](/methodologie): per stof, per dosering, per bewijs — niet per pakket.",
    },
    {
      type: "opsomming",
      titel: "Wanneer een multivitamine wél iets kan toevoegen",
      inleiding:
        "Dit stuk is geen \"supplementen zijn onzin\" — het is een pleidooi voor gericht boven willekeurig. Er zijn situaties waarin een breed pakket praktisch is:",
      items: [
        "Bij een sterk beperkt of onregelmatig voedingspatroon waarbij meerdere tekorten tegelijk aannemelijk zijn — al is losse suppletie op basis van een bloedtest dan vaak nog steeds preciezer.",
        "Als overbrugging in overleg met een arts of diëtist, tijdelijk en met een concreet doel — niet als permanente gewoonte zonder evaluatie.",
        "Nooit als vervanging voor een gemeten tekort dat specifieke, hogere doseringen vraagt dan een multivitamine biedt.",
      ],
    },
    {
      type: "tekst",
      titel: "De vraag die je jezelf kunt stellen",
      tekst:
        "In plaats van \"welke multivitamine is het beste\", is de bruikbaardere vraag: welk domein in je leefstijl — slaap, energie, herstel, stress — vraagt om iets, en is dat met voeding op te lossen of met een gerichte stof? Onze [Leefstijlcheck](/intake) beantwoordt die vraag in een paar minuten. Wil je liever zelf een specifieke stof vergelijken op kwaliteit en dosering, kijk dan in de [supplementgids](/supplementen) — met per product de onderbouwing, niet een verzonnen winnaar.",
    },
  ],
  samenvatting:
    "Grootschalig onderzoek vindt geen duidelijk voordeel van multivitamines bij mensen zonder vastgesteld tekort. Gerichte suppletie op basis van je eigen profiel verslaat een breed pakket \"voor de zekerheid\" — dat is waarom we geen multivitamine-vergelijking maken.",
  cornerstoneLink: {
    label: "Supplementen vergelijken op onderbouwing",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "eiwit-na-40",
    "vitamine-d-en-energie",
    "creatine-en-herstel",
  ],
  metaTitle: "Waarom wij geen multivitamine aanbevelen — is het zinvol na 40?",
  metaDescription:
    "Multivitamine zin of onzin? Onderzoek laat geen duidelijk voordeel zien bij niet-deficiënte volwassenen. Waarom gerichte suppletie op je eigen profiel beter werkt.",
  keywords: [
    "heb je een multivitamine nodig",
    "is een multivitamine zinvol",
    "multivitamine zin of onzin",
    "multivitamine of losse vitamines",
    "multivitamine mannen 40",
  ],
  referenties: toRefs([
    "Guallar E et al. Enough is enough: stop wasting money on vitamin and mineral supplements. Ann Intern Med. 2013;159(12):850-851.",
    "Fortmann SP et al. Vitamin and mineral supplements in the primary prevention of cardiovascular disease and cancer: a systematic evidence review for the U.S. Preventive Services Task Force. Ann Intern Med. 2013;159(12):824-834.",
    "US Preventive Services Task Force. Vitamin, mineral, and multivitamin supplementation to prevent cardiovascular disease and cancer: US Preventive Services Task Force recommendation statement. JAMA. 2022;327(23):2326-2333.",
    "Gezondheidsraad. Achtergronddocument vitamine D en overige voedingsnormen — gerichte suppletie-advisering risicogroepen.",
    "Voedingscentrum. Voedingssupplementen: wanneer zinvol en voor wie — adviesbasis Nederlandse consument.",
    "EFSA NDA Panel. Scientific opinions on health claims related to vitamins and minerals — claim-per-stof in plaats van productniveau.",
  ]),
};
