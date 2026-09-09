/**
 * De productcatalogus van het voedingsdagboek — wat je kunt invoeren.
 *
 * ## Wat dit bestand wel en niet is
 *
 * **Wel:** de lijst van voedingsmiddelen die je kunt zoeken en loggen, met per
 * regel de zoekcategorie, de voedselgroep die hij vult, realistische porties,
 * en een verwijzing naar de plek waar zijn gehaltes staan.
 *
 * **Niet:** een gehaltetabel. Er staat in dit bestand geen enkele milligram.
 * Dat is met opzet — zie {@link CatalogEntry.bron}.
 *
 * ## De drie assen per regel
 *
 * | Veld | Vraag die het beantwoordt | Mag groeien |
 * |---|---|---|
 * | `category` | waar vind ik het | ja, vrij |
 * | `groep` | welke voedselgroep vult het | **nee** — dertien, vast |
 * | `bereiding` | in welke vorm | ja, per voedingsmiddel |
 *
 * De middelste is de reden dat deze catalogus zonder risico kan groeien naar
 * duizenden regels: hoeveel regels er ook bij komen, de analyse blijft op
 * dertien groepen draaien en elke eerdere dag blijft vergelijkbaar.
 *
 * ## Waarom `bron` een verwijzing is en geen getal
 *
 * Een gehalte hoort op één plek te staan. Zou de catalogus eigen waarden
 * dragen, dan bestaat magnesium-in-amandelen op twee plekken en gaan die een
 * keer uit elkaar lopen. `bron` wijst naar de sleutel in `FOOD_SOURCES`;
 * `null` betekent: dit voedingsmiddel is te loggen, maar zijn gehaltes zijn
 * nog niet opgehaald.
 *
 * Die `null` is een werkbare toestand, geen gat. Een regel zonder gehaltes
 * vult nog steeds zijn voedselgroep, telt mee voor breedte en variatie, en
 * draagt zijn portie. Alleen de milligram-uitlezing zegt "nog niet opgehaald"
 * in plaats van een getal — hetzelfde patroon als `unmeasured` in
 * `nutrition-route-status.ts`. Wat we níét doen is een plausibel ogende
 * waarde invullen om het gat te vullen.
 *
 * **De lijst met `bron: null` is daarmee ook de werklijst** voor
 * `scripts/usda-extract.mjs`.
 *
 * ## Waarom een variant niet van de basis mag lenen
 *
 * `spinazie` in `FOOD_SOURCES` is gekookte spinazie. Rauwe spinazie krijgt
 * daarom `bron: null` en niet `bron: "spinazie"` — dezelfde plant, maar 150 g
 * gekookt is ongeveer 400 g rauw, en het gehalte per 100 g verschilt navenant.
 * Een variant erft alleen als de vorm de samenstelling aantoonbaar niet raakt.
 */

import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";
import type { Bereiding, FoodCategoryId } from "@/data/nutrition/food-taxonomy";

/** Eén portie zoals iemand hem noemt, met het gram-equivalent. */
export interface Portie {
  labelNl: string;
  grams: number;
}

export interface CatalogEntry {
  /** Stabiel, kebab-case, uniek over de héle catalogus. */
  key: string;
  labelNl: string;
  /** Waar hij woont bij bladeren. Precies één. */
  category: FoodCategoryId;
  /** Waar hij ook gevonden wordt. Geen duplicaten in de data. */
  ookIn?: readonly FoodCategoryId[];
  /** De analyse-as. Dertien waarden, vast. */
  groep: VoedselgroepId;
  /** De vorm. Ontbreekt bij voedingsmiddelen met maar één gangbare vorm. */
  bereiding?: Bereiding;
  /** Eerst de portie die mensen het vaakst bedoelen. */
  porties: readonly Portie[];
  /** Sleutel in `FOOD_SOURCES`, of null zolang de gehaltes niet opgehaald zijn. */
  bron: string | null;
  /** Extra woorden waarop gezocht wordt — spreektaal, streeknamen, spelfouten. */
  zoek?: readonly string[];
  /** Waarom deze vorm een eigen regel is. Verplicht zodra `bereiding` staat. */
  waarom?: string;
}

/** Compacte constructor — houdt één regel per voedingsmiddel leesbaar. */
function f(
  key: string,
  labelNl: string,
  category: FoodCategoryId,
  groep: VoedselgroepId,
  porties: readonly (readonly [string, number])[],
  bron: string | null = null,
  extra: {
    bereiding?: Bereiding;
    ookIn?: readonly FoodCategoryId[];
    zoek?: readonly string[];
    waarom?: string;
  } = {},
): CatalogEntry {
  return {
    key,
    labelNl,
    category,
    groep,
    porties: porties.map(([p, g]) => ({ labelNl: p, grams: g })),
    bron,
    ...extra,
  };
}

/** Standaardporties per soort — één plek, zodat ze niet gaan zwerven. */
const P = {
  groente: [["opscheplepel", 80], ["portie", 150]] as const,
  bladRauw: [["handvol", 30], ["portie", 75]] as const,
  bladGekookt: [["opscheplepel", 80], ["portie", 150]] as const,
  noten: [["handvol", 25], ["kleine handvol", 15]] as const,
  zaden: [["eetlepel", 12], ["handvol", 25]] as const,
  peul: [["opscheplepel", 135], ["portie", 200]] as const,
  vlees: [["portie", 100], ["grote portie", 150]] as const,
  vis: [["portie", 125], ["kleine portie", 100]] as const,
  brood: [["snee", 35], ["twee sneden", 70]] as const,
  pastaDroog: [["portie droog", 75], ["grote portie droog", 100]] as const,
  rijstGekookt: [["opscheplepel", 75], ["portie", 150]] as const,
  zuivel: [["schaaltje", 150], ["glas", 200]] as const,
  kaasPlak: [["plak", 20], ["twee plakken", 40]] as const,
  olie: [["theelepel", 5], ["eetlepel", 10]] as const,
  drank: [["glas", 200], ["beker", 250]] as const,
} satisfies Record<string, readonly (readonly [string, number])[]>;

/* ═══════════════════════════════════════════════════════════════════════
   GROENTEN
   Bij groente is de vorm bijna altijd relevant: koken loogt uit, en de
   portie verschilt fors tussen rauw en gekookt (bladgroente krimpt tot een
   derde). Waar rauw ongebruikelijk is (pompoen, spruitjes) staat alleen de
   bereide vorm.
   ═══════════════════════════════════════════════════════════════════════ */
const GROENTEN: readonly CatalogEntry[] = [
  f("spinazie-rauw", "Spinazie, rauw", "groenten", "groente", P.bladRauw, null,
    { bereiding: "rauw", waarom: "150 g gekookt is ruim 400 g rauw — dezelfde bak, andere portie" }),
  f("spinazie-gekookt", "Spinazie, gekookt", "groenten", "groente", P.bladGekookt, "spinazie",
    { bereiding: "gekookt", waarom: "ingekookt; koken loogt een deel van de magnesium uit" }),
  f("spinazie-diepvries", "Spinazie, diepvries", "groenten", "groente", P.bladGekookt, null,
    { bereiding: "diepvries", waarom: "geblancheerd vóór invriezen — uitloging zit er al in" }),
  f("boerenkool-gekookt", "Boerenkool, gekookt", "groenten", "groente", P.bladGekookt, "boerenkool", { bereiding: "gekookt" }),
  f("boerenkool-rauw", "Boerenkool, rauw", "groenten", "groente", P.bladRauw, null, { bereiding: "rauw", waarom: "andere portie" }),
  f("snijbiet-gekookt", "Snijbiet, gekookt", "groenten", "groente", P.bladGekookt, "snijbiet", { bereiding: "gekookt" }),
  f("andijvie-rauw", "Andijvie, rauw", "groenten", "groente", P.bladRauw, null, { bereiding: "rauw" }),
  f("andijvie-gekookt", "Andijvie, gekookt", "groenten", "groente", P.bladGekookt, null, { bereiding: "gekookt", waarom: "krimpt sterk" }),
  f("sla-kropsla", "Kropsla", "groenten", "groente", P.bladRauw, null, { zoek: ["sla", "ijsbergsla"] }),
  f("rucola", "Rucola", "groenten", "groente", [["handvol", 25]], null, { zoek: ["raketsla"] }),
  f("veldsla", "Veldsla", "groenten", "groente", [["handvol", 25]], null),
  f("witlof-rauw", "Witlof, rauw", "groenten", "groente", [["stronkje", 75]], null, { bereiding: "rauw" }),
  f("witlof-gekookt", "Witlof, gekookt", "groenten", "groente", [["stronkje", 100]], null, { bereiding: "gekookt" }),

  f("broccoli-gekookt", "Broccoli, gekookt", "groenten", "groente", P.groente, null,
    { bereiding: "gekookt", waarom: "koken in ruim water loogt mineralen uit" }),
  f("broccoli-gestoomd", "Broccoli, gestoomd", "groenten", "groente", P.groente, null,
    { bereiding: "gestoomd", waarom: "stomen loogt beduidend minder uit dan koken" }),
  f("broccoli-rauw", "Broccoli, rauw", "groenten", "groente", [["handvol roosjes", 60]], null, { bereiding: "rauw" }),
  f("broccoli-diepvries", "Broccoli, diepvries", "groenten", "groente", P.groente, null, { bereiding: "diepvries", waarom: "geblancheerd vóór invriezen — een deel van de uitloging zit er al in" }),
  f("bloemkool-gekookt", "Bloemkool, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("bloemkool-rauw", "Bloemkool, rauw", "groenten", "groente", [["handvol roosjes", 60]], null, { bereiding: "rauw" }),
  f("spruitjes-gekookt", "Spruitjes, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("rodekool-gekookt", "Rodekool, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("witte-kool-gekookt", "Witte kool, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("zuurkool", "Zuurkool", "groenten", "groente", [["opscheplepel", 100]], null,
    { bereiding: "gefermenteerd", waarom: "fermentatie verandert de samenstelling en voegt zout toe" }),
  f("paksoi-gekookt", "Paksoi, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),

  f("wortel-rauw", "Wortel, rauw", "groenten", "groente", [["stuk", 80], ["portie", 100]], null, { bereiding: "rauw", zoek: ["worteltjes", "peen"] }),
  f("wortel-gekookt", "Wortel, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("pastinaak-gekookt", "Pastinaak, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("biet-gekookt", "Rode biet, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt", zoek: ["bietjes", "kroot"] }),
  f("knolselderij-gekookt", "Knolselderij, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("radijs", "Radijs", "groenten", "groente", [["handvol", 50]], null),
  f("koolraap-gekookt", "Koolraap, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),

  f("tomaat", "Tomaat", "groenten", "groente", [["stuk", 100], ["handvol cherry", 80]], null, { zoek: ["cherrytomaat", "tomaatjes"] }),
  f("tomaat-blik", "Tomaten, uit blik", "groenten", "groente", [["half blik", 200], ["blik", 400]], null,
    { bereiding: "blik", waarom: "verhit verwerkt; lycopeen komt beter vrij, vocht telt mee" }),
  f("paprika-rauw", "Paprika, rauw", "groenten", "groente", [["halve", 75], ["stuk", 150]], null, { bereiding: "rauw" }),
  f("paprika-gebakken", "Paprika, gebakken", "groenten", "groente", [["portie", 100]], null, { bereiding: "gebakken", waarom: "vochtverlies concentreert het gehalte per 100 g" }),
  f("komkommer", "Komkommer", "groenten", "groente", [["stuk (⅓)", 100], ["plakjes", 50]], null),
  f("courgette-gebakken", "Courgette, gebakken", "groenten", "groente", P.groente, null, { bereiding: "gebakken", waarom: "vochtverlies plus opgenomen bakvet" }),
  f("courgette-gekookt", "Courgette, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("aubergine-gebakken", "Aubergine, gebakken", "groenten", "groente", P.groente, null, { bereiding: "gebakken", zoek: ["eierplant"], waarom: "aubergine zuigt bakvet op als een spons — dat telt in het gerecht" }),
  f("pompoen-gekookt", "Pompoen, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt", waarom: "aubergine zuigt bakvet op als een spons — dat telt in het gerecht" }),
  f("pompoen-geroosterd", "Pompoen, geroosterd", "groenten", "groente", P.groente, null, { bereiding: "geroosterd", waarom: "droge hitte onttrekt vocht zonder uitloging" }),

  f("ui-rauw", "Ui, rauw", "groenten", "groente", [["halve", 60], ["stuk", 120]], null, { bereiding: "rauw" }),
  f("ui-gebakken", "Ui, gebakken", "groenten", "groente", [["portie", 60]], null, { bereiding: "gebakken", waarom: "ui slinkt tot een derde en neemt bakvet op" }),
  f("prei-gekookt", "Prei, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt" }),
  f("knoflook", "Knoflook", "groenten", "groente", [["teen", 4], ["twee tenen", 8]], null),
  f("asperges-gekookt", "Asperges, gekookt", "groenten", "groente", [["portie", 150]], null, { bereiding: "gekookt" }),
  f("mais-blik", "Maïs, uit blik", "groenten", "granen", [["opscheplepel", 80]], null,
    { bereiding: "blik", waarom: "telt als graan, niet als groente — dat is de voedselgroep die hem draagt" }),
  f("mais-kolf", "Maïskolf", "groenten", "granen", [["kolf", 90]], null),
  f("doperwten-diepvries", "Doperwten, diepvries", "groenten", "peulvruchten", P.groente, "erwten-diepvries",
    { bereiding: "diepvries", waarom: "telt als peulvrucht" }),
  f("sperziebonen-gekookt", "Sperziebonen, gekookt", "groenten", "groente", P.groente, null, { bereiding: "gekookt", zoek: ["haricots verts", "prinsessenbonen"] }),
  f("sperziebonen-diepvries", "Sperziebonen, diepvries", "groenten", "groente", P.groente, null, { bereiding: "diepvries", waarom: "geblancheerd vóór invriezen" }),
  f("champignons-gebakken", "Champignons, gebakken", "groenten", "groente", [["portie", 100]], null, { bereiding: "gebakken", zoek: ["paddenstoelen"], waarom: "champignons verliezen ruim de helft van hun vocht bij bakken" }),
  f("champignons-rauw", "Champignons, rauw", "groenten", "groente", [["handvol", 60]], null, { bereiding: "rauw", waarom: "champignons verliezen ruim de helft van hun vocht bij bakken" }),
  f("paddenstoelen-uv", "Paddenstoelen, UV-behandeld", "groenten", "groente", [["portie", 100]], "paddenstoelen-uv",
    { waarom: "alleen UV-behandelde paddenstoelen dragen vitamine D" }),
  f("zeewier-nori", "Nori (zeewier)", "groenten", "groente", [["vel", 3], ["portie", 10]], null, { zoek: ["zeewier", "wakame"] }),
  f("avocado", "Avocado", "groenten", "fruit", [["halve", 100], ["hele", 200]], "avocado",
    { waarom: "botanisch fruit; telt in de fruitgroep" }),
];

/* ═══════════════════════════════════════════════════════════════════════
   FRUIT
   Gedroogd fruit krijgt altijd een eigen regel: drogen concentreert het
   gehalte per 100 g met een factor drie tot vijf, en de portie is een
   fractie van die van vers fruit.
   ═══════════════════════════════════════════════════════════════════════ */
const FRUIT: readonly CatalogEntry[] = [
  f("appel", "Appel", "fruit", "fruit", [["stuk", 130]], null, { zoek: ["elstar", "jonagold"] }),
  f("peer", "Peer", "fruit", "fruit", [["stuk", 150]], null),
  f("banaan", "Banaan", "fruit", "fruit", [["stuk", 120], ["kleine", 90]], "banaan"),
  f("sinaasappel", "Sinaasappel", "fruit", "fruit", [["stuk", 150]], null),
  f("mandarijn", "Mandarijn", "fruit", "fruit", [["stuk", 70], ["twee stuks", 140]], null, { zoek: ["clementine"] }),
  f("grapefruit", "Grapefruit", "fruit", "fruit", [["halve", 125]], null, { zoek: ["pompelmoes"] }),
  f("citroen", "Citroen", "fruit", "fruit", [["partje", 15], ["halve", 45]], null),
  f("limoen", "Limoen", "fruit", "fruit", [["partje", 12]], null),
  f("kiwi", "Kiwi", "fruit", "fruit", [["stuk", 75], ["twee stuks", 150]], null),
  f("mango", "Mango", "fruit", "fruit", [["halve", 100], ["portie", 150]], null),
  f("ananas", "Ananas", "fruit", "fruit", [["schijf", 80], ["portie", 150]], null),
  f("druiven", "Druiven", "fruit", "fruit", [["handvol", 80], ["tros", 150]], null),
  f("aardbeien", "Aardbeien", "fruit", "fruit", [["handvol", 80], ["bakje", 250]], null),
  f("blauwe-bessen", "Blauwe bessen", "fruit", "fruit", [["handvol", 60], ["bakje", 125]], null, { zoek: ["bosbessen"] }),
  f("frambozen", "Frambozen", "fruit", "fruit", [["handvol", 60], ["bakje", 125]], null),
  f("bramen", "Bramen", "fruit", "fruit", [["handvol", 60]], null),
  f("kersen", "Kersen", "fruit", "fruit", [["handvol", 80]], null),
  f("perzik", "Perzik", "fruit", "fruit", [["stuk", 130]], null),
  f("nectarine", "Nectarine", "fruit", "fruit", [["stuk", 130]], null),
  f("pruim", "Pruim", "fruit", "fruit", [["stuk", 60], ["twee stuks", 120]], null),
  f("abrikoos-vers", "Abrikoos, vers", "fruit", "fruit", [["stuk", 40], ["drie stuks", 120]], null, { bereiding: "rauw" }),
  f("meloen", "Meloen", "fruit", "fruit", [["partje", 150]], null, { zoek: ["galia", "cantaloupe", "watermeloen"] }),
  f("granaatappel", "Granaatappel", "fruit", "fruit", [["halve", 90], ["handvol pitjes", 60]], null),
  f("vijg-vers", "Vijg, vers", "fruit", "fruit", [["stuk", 50]], null, { bereiding: "rauw" }),
  f("gedroogde-vijgen", "Vijgen, gedroogd", "fruit", "fruit", [["vier stuks", 40], ["twee stuks", 20]], "gedroogde-vijgen",
    { bereiding: "gedroogd", waarom: "drogen concentreert het gehalte per 100 g ongeveer viervoudig" }),
  f("dadels", "Dadels", "fruit", "fruit", [["twee stuks", 40], ["stuk", 20]], null, { bereiding: "gedroogd", waarom: "gedroogd; kleine portie, hoog gehalte per 100 g" }),
  f("rozijnen", "Rozijnen", "fruit", "fruit", [["handvol", 30], ["eetlepel", 15]], null, { bereiding: "gedroogd", waarom: "gedroogd" }),
  f("abrikoos-gedroogd", "Abrikozen, gedroogd", "fruit", "fruit", [["vier stuks", 32]], null, { bereiding: "gedroogd", waarom: "gedroogd" }),
  f("pruimen-gedroogd", "Pruimen, gedroogd", "fruit", "fruit", [["drie stuks", 30]], null, { bereiding: "gedroogd", waarom: "gedroogd" }),
  f("fruit-diepvries", "Rood fruit, diepvries", "fruit", "fruit", [["handvol", 80]], null, { bereiding: "diepvries", waarom: "vocht komt vrij bij ontdooien; portie wijkt af van vers" }),
  f("appelmoes", "Appelmoes", "fruit", "fruit", [["schaaltje", 100]], null, { zoek: ["appelmoes uit pot"] }),
];

/* ═══════════════════════════════════════════════════════════════════════
   GRANEN, BROOD EN PASTA
   Droog versus gekookt is hier de belangrijkste scheiding: 75 g droge pasta
   wordt ongeveer 190 g gekookt, en het gehalte per 100 g deelt door tweeënhalf.
   Wie beide vormen in één regel stopt, logt structureel een factor mis.
   ═══════════════════════════════════════════════════════════════════════ */
const GRANEN: readonly CatalogEntry[] = [
  f("havermout", "Havermout", "granen", "granen", [["portie droog", 60], ["grote portie droog", 80]], "havermout",
    { ookIn: ["ontbijt"], zoek: ["oats", "haverv lokken"] }),
  f("haverzemelen", "Haverzemelen", "granen", "granen", [["eetlepel", 10]], null, { ookIn: ["ontbijt"] }),
  f("rijst-wit-gekookt", "Witte rijst, gekookt", "granen", "zetmeel", P.rijstGekookt, null,
    { bereiding: "gekookt", waarom: "gekookt gewicht; telt als zetmeel, niet als volkoren graan" }),
  f("zilvervliesrijst", "Zilvervliesrijst, gekookt", "granen", "granen", P.rijstGekookt, "zilvervliesrijst",
    { bereiding: "gekookt", zoek: ["bruine rijst"] }),
  f("basmatirijst-gekookt", "Basmatirijst, gekookt", "granen", "zetmeel", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("wilde-rijst-gekookt", "Wilde rijst, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("quinoa", "Quinoa, gekookt", "granen", "granen", P.rijstGekookt, "quinoa", { bereiding: "gekookt" }),
  f("quinoa-droog", "Quinoa, droog", "granen", "granen", [["portie droog", 60]], null, { bereiding: "rauw", waarom: "droog gewicht; verdrievoudigt bij koken" }),
  f("bulgur-gekookt", "Bulgur, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("couscous-gekookt", "Couscous, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("boekweit-gekookt", "Boekweit, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("gierst-gekookt", "Gierst, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("amarant-gekookt", "Amarant, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("teff", "Teff", "granen", "granen", [["portie droog", 60]], null),
  f("gerst-gekookt", "Gerst, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt", zoek: ["parelgort", "gort"] }),
  f("spelt-gekookt", "Spelt, gekookt", "granen", "granen", P.rijstGekookt, null, { bereiding: "gekookt" }),
  f("polenta", "Polenta", "granen", "granen", [["portie", 150]], null, { zoek: ["maisgriesmeel"] }),
];

const BROOD: readonly CatalogEntry[] = [
  f("volkorenbrood", "Volkorenbrood", "brood", "granen", P.brood, "volkorenbrood", { ookIn: ["ontbijt"] }),
  f("witbrood", "Witbrood", "brood", "granen", P.brood, null, { waarom: "geen volkoren — telt in de granengroep maar draagt fors minder mineralen" }),
  f("meergranenbrood", "Meergranenbrood", "brood", "granen", P.brood, null),
  f("roggebrood", "Roggebrood", "brood", "granen", [["snee", 30], ["twee sneden", 60]], null),
  f("zuurdesembrood", "Zuurdesembrood", "brood", "granen", P.brood, null,
    { bereiding: "gefermenteerd", waarom: "zuurdesem breekt fytaat af — meetbaar meer zink en magnesium beschikbaar" }),
  f("speltbrood", "Speltbrood", "brood", "granen", P.brood, null),
  f("stokbrood", "Stokbrood", "brood", "granen", [["stuk", 60]], null),
  f("pita", "Pitabroodje", "brood", "granen", [["stuk", 60]], null),
  f("naan", "Naanbrood", "brood", "granen", [["stuk", 90]], null),
  f("tortilla-wrap", "Tortilla / wrap", "brood", "granen", [["stuk", 60]], null),
  f("bagel", "Bagel", "brood", "granen", [["stuk", 85]], null),
  f("croissant", "Croissant", "brood", "granen", [["stuk", 55]], null, { ookIn: ["snacks"] }),
  f("crackers-volkoren", "Volkoren crackers", "brood", "granen", [["twee stuks", 20]], null),
  f("knackebrod", "Knäckebröd", "brood", "granen", [["twee stuks", 20]], null, { zoek: ["knackebrod", "crackers"] }),
  f("beschuit", "Beschuit", "brood", "granen", [["twee stuks", 20]], null, { ookIn: ["ontbijt"] }),
  f("rijstwafel", "Rijstwafel", "brood", "granen", [["twee stuks", 16]], null, { ookIn: ["snacks"] }),
  f("maiswafel", "Maïswafel", "brood", "granen", [["twee stuks", 16]], null, { ookIn: ["snacks"] }),
  f("toast", "Toast / geroosterd brood", "brood", "granen", [["snee", 30]], null, { bereiding: "geroosterd", waarom: "waterverlies bij roosteren" }),
];

const PASTA: readonly CatalogEntry[] = [
  f("volkoren-pasta", "Volkoren pasta, droog", "pasta", "granen", P.pastaDroog, "volkoren-pasta",
    { bereiding: "rauw", waarom: "droog gewicht — 75 g droog wordt ongeveer 190 g gekookt" }),
  f("volkoren-pasta-gekookt", "Volkoren pasta, gekookt", "pasta", "granen", [["portie", 190]], null, { bereiding: "gekookt" }),
  f("pasta-wit-droog", "Pasta, droog", "pasta", "granen", P.pastaDroog, null, { bereiding: "rauw", zoek: ["spaghetti", "penne", "macaroni", "fusilli", "tagliatelle"] }),
  f("pasta-wit-gekookt", "Pasta, gekookt", "pasta", "granen", [["portie", 190]], null, { bereiding: "gekookt" }),
  f("linzenpasta-droog", "Linzenpasta, droog", "pasta", "peulvruchten", P.pastaDroog, null,
    { bereiding: "rauw", waarom: "telt als peulvrucht, niet als graan — dat is het hele punt van dit product" }),
  f("kikkererwtenpasta-droog", "Kikkererwtenpasta, droog", "pasta", "peulvruchten", P.pastaDroog, null, { bereiding: "rauw" }),
  f("rijstnoedels-gekookt", "Rijstnoedels, gekookt", "pasta", "zetmeel", [["portie", 180]], null, { bereiding: "gekookt" }),
  f("eiernoedels-gekookt", "Eiernoedels, gekookt", "pasta", "granen", [["portie", 180]], null, { bereiding: "gekookt", zoek: ["mie"] }),
  f("ramen-noedels", "Ramennoedels", "pasta", "granen", [["portie", 180]], null),
  f("sobanoedels-gekookt", "Sobanoedels, gekookt", "pasta", "granen", [["portie", 180]], null, { bereiding: "gekookt", zoek: ["boekweitnoedels"] }),
];

/* ═══════════════════════════════════════════════════════════════════════
   PEULVRUCHTEN, NOTEN EN ZADEN
   Bij peulvruchten scheelt blik van zelf gekookt: een deel van de mineralen
   zit in het vocht dat je weggiet. Bij noten is roosteren juist géén eigen
   regel — mineralen zijn elementen, en het waterverlies valt binnen de band.
   ═══════════════════════════════════════════════════════════════════════ */
const PEULVRUCHTEN: readonly CatalogEntry[] = [
  f("kikkererwten-gekookt", "Kikkererwten, gekookt", "peulvruchten", "peulvruchten", P.peul, "kikkererwten", { bereiding: "gekookt" }),
  f("kikkererwten-blik", "Kikkererwten, uit blik", "peulvruchten", "peulvruchten", P.peul, null,
    { bereiding: "blik", waarom: "uitgelekt; een deel van de mineralen blijft in het vocht achter" }),
  f("linzen-gekookt", "Linzen, gekookt", "peulvruchten", "peulvruchten", P.peul, "linzen", { bereiding: "gekookt" }),
  f("linzen-rood-gekookt", "Rode linzen, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("linzen-groen-gekookt", "Groene linzen, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("linzen-bruin-gekookt", "Bruine linzen, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("linzen-blik", "Linzen, uit blik", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "blik", waarom: "uitgelekt" }),
  f("kidneybonen-gekookt", "Kidneybonen, gekookt", "peulvruchten", "peulvruchten", P.peul, "kidneybonen", { bereiding: "gekookt" }),
  f("kidneybonen-blik", "Kidneybonen, uit blik", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "blik", waarom: "uitgelekt" }),
  f("zwarte-bonen-gekookt", "Zwarte bonen, gekookt", "peulvruchten", "peulvruchten", P.peul, "zwarte-bonen", { bereiding: "gekookt" }),
  f("witte-bonen-gekookt", "Witte bonen, gekookt", "peulvruchten", "peulvruchten", P.peul, "witte-bonen", { bereiding: "gekookt" }),
  f("cannellinibonen-blik", "Cannellinibonen, uit blik", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "blik", waarom: "uitgelekt; een deel van de mineralen blijft in het vocht achter" }),
  f("bruine-bonen-gekookt", "Bruine bonen, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("sojabonen-gekookt", "Sojabonen, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("edamame", "Edamame", "peulvruchten", "peulvruchten", [["handvol", 80], ["portie", 150]], null),
  f("spliterwten-gekookt", "Spliterwten, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("kapucijners", "Kapucijners", "peulvruchten", "peulvruchten", P.peul, null),
  f("tuinbonen-gekookt", "Tuinbonen, gekookt", "peulvruchten", "peulvruchten", P.peul, null, { bereiding: "gekookt" }),
  f("erwten-diepvries", "Doperwten, diepvries", "peulvruchten", "peulvruchten", P.groente, "erwten-diepvries", { bereiding: "diepvries", waarom: "geblancheerd vóór invriezen" }),
];

const NOTEN: readonly CatalogEntry[] = [
  f("amandelen", "Amandelen", "noten", "noten", P.noten, "amandelen", { ookIn: ["snacks"] }),
  f("walnoten", "Walnoten", "noten", "noten", P.noten, "walnoten", { ookIn: ["snacks"], waarom: "ALA-bron; telt niet mee voor EPA/DHA" }),
  f("cashewnoten", "Cashewnoten", "noten", "noten", P.noten, "cashewnoten", { ookIn: ["snacks"] }),
  f("hazelnoten", "Hazelnoten", "noten", "noten", P.noten, null, { ookIn: ["snacks"] }),
  f("pecannoten", "Pecannoten", "noten", "noten", P.noten, null),
  f("pistachenoten", "Pistachenoten", "noten", "noten", P.noten, null, { ookIn: ["snacks"] }),
  f("paranoten", "Paranoten", "noten", "noten", [["twee stuks", 10], ["handvol", 25]], null,
    { waarom: "seleniumgehalte is extreem hoog en varieert sterk — kleine portie is hier de norm" }),
  f("macadamia", "Macadamianoten", "noten", "noten", P.noten, null),
  f("pinda", "Pinda's", "noten", "noten", P.noten, null, { ookIn: ["snacks"], zoek: ["aardnoot", "olienootjes"] }),
  f("pijnboompitten", "Pijnboompitten", "noten", "noten", [["eetlepel", 12], ["handvol", 25]], null),
  f("notenmix", "Notenmix, ongezouten", "noten", "noten", P.noten, null, { ookIn: ["snacks"] }),
];

const ZADEN: readonly CatalogEntry[] = [
  f("chiazaad", "Chiazaad", "zaden", "noten", [["eetlepel", 15]], "chiazaad", { waarom: "ALA-bron; telt niet mee voor EPA/DHA" }),
  f("lijnzaad", "Lijnzaad, gemalen", "zaden", "noten", [["eetlepel", 15]], "lijnzaad",
    { waarom: "heel lijnzaad gaat onverteerd door — alleen gemalen levert iets op" }),
  f("hennepzaad", "Hennepzaad, gepeld", "zaden", "noten", P.zaden, "hennepzaad"),
  f("sesamzaad", "Sesamzaad", "zaden", "noten", [["eetlepel", 10]], null),
  f("pompoenzaden", "Pompoenpitten", "zaden", "noten", P.noten, "pompoenzaden", { ookIn: ["snacks"], zoek: ["pompoenzaad"] }),
  f("zonnebloempitten", "Zonnebloempitten", "zaden", "noten", P.noten, "zonnebloempitten", { ookIn: ["snacks"] }),
  f("maanzaad", "Maanzaad", "zaden", "noten", [["eetlepel", 9]], null),
];

/* ═══════════════════════════════════════════════════════════════════════
   VLEES, ORGAANVLEES, VIS EN ZEEVRUCHTEN
   Bij vis is de vorm zwaarder dan bij welke andere groep ook: wild versus
   gekweekt scheelt bij vitamine D een factor vier, en roken of inblikken
   verandert het vet- en vochtgehalte. Elke visvorm is daarom een eigen regel.
   ═══════════════════════════════════════════════════════════════════════ */
const VLEES: readonly CatalogEntry[] = [
  f("kipfilet", "Kipfilet", "vlees", "vlees", P.vlees, "kipfilet", { zoek: ["kipfilet gebakken", "kippenborst"] }),
  f("kipdij", "Kipdij", "vlees", "vlees", P.vlees, null),
  f("kippenvleugel", "Kippenvleugels", "vlees", "vlees", [["drie stuks", 100]], null),
  f("kalkoenfilet", "Kalkoenfilet", "vlees", "vlees", P.vlees, null),
  f("rundvlees-mager", "Rundvlees, mager", "vlees", "vlees", P.vlees, "rundvlees-mager"),
  f("biefstuk", "Biefstuk", "vlees", "vlees", P.vlees, null),
  f("rundergehakt", "Rundergehakt", "vlees", "vlees", P.vlees, null, { zoek: ["gehakt"] }),
  f("half-om-half-gehakt", "Half-om-half gehakt", "vlees", "vlees", P.vlees, null),
  f("varkenshaas", "Varkenshaas", "vlees", "vlees", P.vlees, "varkenshaas"),
  f("varkenskarbonade", "Karbonade", "vlees", "vlees", [["stuk", 120]], null),
  f("schnitzel", "Schnitzel", "vlees", "vlees", [["stuk", 120]], null),
  f("kalfsvlees", "Kalfsvlees", "vlees", "vlees", P.vlees, "kalfsvlees"),
  f("lamsvlees", "Lamsvlees", "vlees", "vlees", P.vlees, "lamsvlees"),
  f("eend", "Eendenborst", "vlees", "vlees", P.vlees, null),
  f("konijn", "Konijn", "vlees", "vlees", P.vlees, null),
  f("wild", "Wild (hert, ree)", "vlees", "vlees", P.vlees, null),
  f("hamburger", "Hamburger", "vlees", "vlees", [["stuk", 100]], null),
  f("worst", "Worst", "vlees", "vlees", [["stuk", 70]], null, { zoek: ["braadworst", "rookworst"] }),
  f("bacon", "Bacon / spek", "vlees", "vlees", [["twee plakken", 30]], null, { bereiding: "gebakken", waarom: "uitbakken halveert het gewicht; het gehalte per 100 g verdubbelt ongeveer" }),
  f("ham", "Ham", "vlees", "vlees", [["plak", 20], ["twee plakken", 40]], null),
  f("rosbief", "Rosbief", "vlees", "vlees", [["plak", 20], ["twee plakken", 40]], null),
  f("salami", "Salami", "vlees", "vlees", [["drie plakjes", 20]], null),
  f("kipfilet-vleeswaren", "Kipfilet (vleeswaren)", "vlees", "vlees", [["twee plakken", 30]], null),
];

const ORGAANVLEES: readonly CatalogEntry[] = [
  f("runderlever", "Runderlever", "orgaanvlees", "vlees", [["portie", 100]], null,
    { waarom: "lever draagt vitamine A en ijzer in een orde die spiervlees niet haalt — nooit samenvoegen met vlees" }),
  f("kippenlever", "Kippenlever", "orgaanvlees", "vlees", [["portie", 100]], null),
  f("varkenslever", "Varkenslever", "orgaanvlees", "vlees", [["portie", 100]], null),
  f("leverpastei", "Leverpastei", "orgaanvlees", "vlees", [["portie", 30]], "leverpastei", { ookIn: ["sauzen"] }),
  f("hart", "Hart", "orgaanvlees", "vlees", [["portie", 100]], null),
  f("nier", "Nier", "orgaanvlees", "vlees", [["portie", 100]], null),
  f("tong", "Tong", "orgaanvlees", "vlees", [["portie", 100]], null),
  f("pens", "Pens", "orgaanvlees", "vlees", [["portie", 100]], null),
];

const VIS: readonly CatalogEntry[] = [
  f("zalm-gekweekt", "Zalm, gekweekt", "vis", "vis", P.vis, "zalm-gekweekt",
    { waarom: "gekweekt draagt fors minder vitamine D en EPA/DHA dan wild — factor twee tot vier" }),
  f("zalm-wild", "Zalm, wild", "vis", "vis", P.vis, "zalm-wild", { waarom: "vangstgebied telt: Oostzee ongeveer tweemaal Noordzee" }),
  f("zalm-gerookt", "Zalm, gerookt", "vis", "vis", [["portie", 75]], null, { bereiding: "gerookt", waarom: "gezouten en gedroogd — ander vocht- en zoutgehalte" }),
  f("zalm-blik", "Zalm, uit blik", "vis", "vis", [["portie", 100]], null, { bereiding: "blik", waarom: "ingeblikt mét graat en vocht — ander profiel dan verse moot" }),
  f("makreel", "Makreel", "vis", "vis", P.vis, "makreel"),
  f("makreel-gerookt", "Makreel, gerookt", "vis", "vis", [["portie", 100]], null, { bereiding: "gerookt", waarom: "roken zout en droogt; het vetgehalte per 100 g loopt op" }),
  f("haring", "Haring", "vis", "vis", [["stuk", 100]], "haring", { zoek: ["maatjes", "nieuwe haring"] }),
  f("sardines-blik", "Sardines, uit blik", "vis", "vis", [["blikje", 100]], "sardines", { bereiding: "blik", waarom: "ingeblikt mét graat: het calciumgehalte wijkt daardoor sterk af van verse sardine" }),
  f("ansjovis", "Ansjovis", "vis", "vis", [["portie", 50]], "ansjovis"),
  f("sprot", "Sprot", "vis", "vis", [["portie", 100]], "sprot"),
  f("forel", "Forel", "vis", "vis", P.vis, null),
  f("gerookte-forel", "Forel, gerookt", "vis", "vis", [["portie", 100]], "gerookte-forel", { bereiding: "gerookt", waarom: "roken zout en droogt — ander vocht- en zoutgehalte dan vers" }),
  f("tonijn-blik", "Tonijn uit blik, op water", "vis", "vis", [["blikje uitgelekt", 100]], "tonijn-blik",
    { bereiding: "blik", waarom: "op water of op olie scheelt fors in vet — en dus in EPA/DHA per 100 g" }),
  f("tonijn-vers", "Tonijn, vers", "vis", "vis", P.vis, null),
  f("kabeljauw", "Kabeljauw", "vis", "vis", P.vis, "kabeljauw"),
  f("koolvis", "Koolvis", "vis", "vis", P.vis, null),
  f("schelvis", "Schelvis", "vis", "vis", P.vis, null),
  f("schol", "Schol", "vis", "vis", P.vis, null),
  f("zeebaars", "Zeebaars", "vis", "vis", P.vis, null),
  f("dorade", "Dorade", "vis", "vis", P.vis, null),
  f("paling", "Paling", "vis", "vis", [["portie", 100]], null),
  f("pangasius", "Pangasius", "vis", "vis", P.vis, null),
  f("vissticks", "Vissticks", "vis", "vis", [["drie stuks", 90]], null, { bereiding: "gefrituurd", waarom: "paneer en frituurvet vormen het grootste deel van het gewicht" }),
];

const ZEEVRUCHTEN: readonly CatalogEntry[] = [
  f("garnalen", "Garnalen", "zeevruchten", "vis", [["portie", 100]], "garnalen"),
  f("mosselen", "Mosselen", "zeevruchten", "vis", [["portie", 150]], null),
  f("oesters", "Oesters", "zeevruchten", "vis", [["zes stuks", 100], ["drie stuks", 50]], "oesters",
    { waarom: "zinkgehalte is extreem hoog en varieert sterk per soort en seizoen" }),
  f("krab", "Krab", "zeevruchten", "vis", [["portie", 100]], null),
  f("kreeft", "Kreeft", "zeevruchten", "vis", [["portie", 100]], null),
  f("inktvis", "Inktvis", "zeevruchten", "vis", [["portie", 100]], null, { zoek: ["calamari"] }),
  f("octopus", "Octopus", "zeevruchten", "vis", [["portie", 100]], null),
];

/* ═══════════════════════════════════════════════════════════════════════
   EIEREN, ZUIVEL EN KAAS
   ═══════════════════════════════════════════════════════════════════════ */
const EIEREN: readonly CatalogEntry[] = [
  f("ei-gekookt", "Ei, gekookt", "eieren", "eieren", [["stuk", 55], ["twee stuks", 110]], "eieren", { bereiding: "gekookt" }),
  f("ei-gebakken", "Ei, gebakken", "eieren", "eieren", [["stuk", 55], ["twee stuks", 110]], null,
    { bereiding: "gebakken", waarom: "bakvet telt mee in het gerecht, niet in het ei" }),
  f("roerei", "Roerei", "eieren", "eieren", [["twee eieren", 110]], null, { bereiding: "gebakken", waarom: "bakvet en soms melk gaan mee — dat is een gerecht, geen ei" }),
  f("omelet", "Omelet", "eieren", "eieren", [["twee eieren", 110], ["drie eieren", 165]], null, { bereiding: "gebakken", waarom: "bakvet telt mee in het gerecht, niet in het ei" }),
  f("eiwit", "Eiwit (los)", "eieren", "eieren", [["stuk", 33], ["drie stuks", 100]], null, { waarom: "vitamine D en zink zitten vrijwel volledig in de dooier" }),
  f("eidooier", "Eidooier (los)", "eieren", "eieren", [["stuk", 18]], null),
  f("verrijkte-eieren", "Omega-3 verrijkte eieren", "eieren", "eieren", [["twee stuks", 110]], "verrijkte-eieren",
    { waarom: "verrijking loopt via het legvoer — een merkkeuze, geen eigenschap van ei" }),
];

const ZUIVEL: readonly CatalogEntry[] = [
  f("melk-vol", "Volle melk", "zuivel", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
  f("melk-halfvol", "Halfvolle melk", "zuivel", "zuivel", P.drank, null,
    { ookIn: ["dranken"], waarom: "in Nederland verplicht verrijkt met vitamine D sinds 2021 — 1,5 µg per 100 ml" }),
  f("melk-mager", "Magere melk", "zuivel", "zuivel", P.drank, null, { ookIn: ["dranken"], waarom: "idem verrijkt" }),
  f("karnemelk", "Karnemelk", "zuivel", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
  f("yoghurt-vol", "Volle yoghurt", "zuivel", "zuivel", P.zuivel, null),
  f("yoghurt-mager", "Magere yoghurt", "zuivel", "zuivel", P.zuivel, null),
  f("griekse-yoghurt", "Griekse yoghurt", "zuivel", "zuivel", P.zuivel, "griekse-yoghurt", { waarom: "vetgehalte bepaalt het eiwit per 100 g" }),
  f("skyr", "Skyr", "zuivel", "zuivel", P.zuivel, "skyr", { waarom: "geen Griekse yoghurt — het eiwit ligt beduidend hoger" }),
  f("magere-kwark", "Magere kwark", "zuivel", "zuivel", [["schaaltje", 150], ["bak", 250]], "magere-kwark"),
  f("volle-kwark", "Volle kwark", "zuivel", "zuivel", [["schaaltje", 150]], null),
  f("kefir", "Kefir", "zuivel", "zuivel", P.drank, null, { bereiding: "gefermenteerd", waarom: "fermentatie verandert de samenstelling en de verteerbaarheid van lactose" }),
  f("huttenkase", "Hüttenkäse", "zuivel", "zuivel", [["schaaltje", 100]], "huttenkase", { ookIn: ["kaas"], zoek: ["cottage cheese"] }),
  f("creme-fraiche", "Crème fraîche", "zuivel", "zuivel", [["eetlepel", 15]], null, { ookIn: ["sauzen"] }),
  f("room", "Room", "zuivel", "zuivel", [["eetlepel", 15]], null),
  f("slagroom", "Slagroom", "zuivel", "zuivel", [["eetlepel", 15]], null, { ookIn: ["snacks"] }),
  f("boter", "Roomboter", "zuivel", "vetten", [["mespunt", 5], ["eetlepel", 15]], null, { ookIn: ["vetten"], waarom: "telt als vet, niet als zuivel" }),
  f("drinkyoghurt", "Drinkyoghurt", "zuivel", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
];

const KAAS: readonly CatalogEntry[] = [
  f("jonge-kaas", "Jonge kaas", "kaas", "zuivel", P.kaasPlak, null, { zoek: ["48+", "goudse kaas"] }),
  f("belegen-kaas", "Belegen kaas", "kaas", "zuivel", [["plak", 30], ["twee plakken", 60]], "belegen-kaas",
    { waarom: "rijping onttrekt vocht — het eiwit per 100 g loopt op met de leeftijd" }),
  f("oude-kaas", "Oude kaas", "kaas", "zuivel", [["plak", 25]], null),
  f("magere-kaas", "Magere kaas (20+/30+)", "kaas", "zuivel", P.kaasPlak, null),
  f("mozzarella", "Mozzarella", "kaas", "zuivel", [["bol", 125], ["portie", 60]], null),
  f("feta", "Feta", "kaas", "zuivel", [["portie", 40]], null),
  f("geitenkaas", "Geitenkaas", "kaas", "zuivel", [["portie", 30]], null),
  f("schapenkaas", "Schapenkaas", "kaas", "zuivel", [["portie", 30]], null),
  f("parmezaan", "Parmezaanse kaas", "kaas", "zuivel", [["eetlepel geraspt", 10]], null),
  f("blauwe-kaas", "Blauwe kaas", "kaas", "zuivel", [["portie", 30]], null, { zoek: ["gorgonzola", "roquefort"] }),
  f("roomkaas", "Roomkaas", "kaas", "zuivel", [["eetlepel", 20]], null, { ookIn: ["sauzen"] }),
  f("smeerkaas", "Smeerkaas", "kaas", "zuivel", [["eetlepel", 20]], null),
];

/* ═══════════════════════════════════════════════════════════════════════
   PLANTAARDIG, VETTEN EN SAUZEN
   Bij plantaardige zuivelvervangers is verrijking een merkkeuze, geen
   voedingsmiddel-eigenschap. Ze dragen daarom bijna allemaal `bron: null`:
   het etiket is hier de bron, niet een tabelwaarde.
   ═══════════════════════════════════════════════════════════════════════ */
const PLANTAARDIG: readonly CatalogEntry[] = [
  f("sojadrink-verrijkt", "Sojadrink, verrijkt", "plantaardig", "zuivel", P.drank, "sojadrink-verrijkt",
    { ookIn: ["dranken"], waarom: "verrijkingsniveau is een merkkeuze — controleer het etiket" }),
  f("sojadrink-onverrijkt", "Sojadrink, onverrijkt", "plantaardig", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
  f("havermelk", "Havermelk", "plantaardig", "zuivel", P.drank, null, { ookIn: ["dranken"], zoek: ["haverdrink"] }),
  f("amandeldrink", "Amandeldrink", "plantaardig", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
  f("kokosdrink", "Kokosdrink", "plantaardig", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
  f("rijstdrink", "Rijstdrink", "plantaardig", "zuivel", P.drank, null, { ookIn: ["dranken"] }),
  f("plantaardige-drank-verrijkt", "Plantaardige drank, verrijkt", "plantaardig", "zuivel", P.drank, "plantaardige-drank-verrijkt", { ookIn: ["dranken"] }),
  f("sojayoghurt", "Sojayoghurt", "plantaardig", "zuivel", P.zuivel, null),
  f("plantaardige-yoghurt", "Plantaardige yoghurt", "plantaardig", "zuivel", P.zuivel, null),
  f("tofu", "Tofu", "plantaardig", "peulvruchten", [["portie", 100], ["blok", 200]], "tofu",
    { waarom: "stremmen met calciumsulfaat of nigari geeft een ander mineraalprofiel" }),
  f("tempe", "Tempé", "plantaardig", "peulvruchten", [["portie", 100]], "tempe",
    { bereiding: "gefermenteerd", waarom: "fermentatie breekt fytaat af — meer mineraal beschikbaar dan uit sojabonen" }),
  f("seitan", "Seitan", "plantaardig", "granen", [["portie", 100]], "seitan", { waarom: "tarwe-eiwit; telt in de granengroep" }),
  f("vegan-gehakt", "Vegetarisch gehakt", "plantaardig", "peulvruchten", [["portie", 100]], null),
  f("vegan-burger", "Vegetarische burger", "plantaardig", "peulvruchten", [["stuk", 90]], null),
  f("vegan-worst", "Vegetarische worst", "plantaardig", "peulvruchten", [["stuk", 70]], null),
  f("vleesvervanger-stukjes", "Vegetarische stukjes", "plantaardig", "peulvruchten", [["portie", 100]], null),
];

const VETTEN: readonly CatalogEntry[] = [
  f("olijfolie-ev", "Olijfolie, extra vierge", "vetten", "vetten", P.olie, null, { zoek: ["evoo"] }),
  f("olijfolie", "Olijfolie", "vetten", "vetten", P.olie, null),
  f("koolzaadolie", "Koolzaadolie", "vetten", "vetten", P.olie, null, { zoek: ["raapolie", "canola"] }),
  f("zonnebloemolie", "Zonnebloemolie", "vetten", "vetten", P.olie, null),
  f("avocado-olie", "Avocado-olie", "vetten", "vetten", P.olie, null),
  f("lijnzaadolie", "Lijnzaadolie", "vetten", "vetten", P.olie, null, { waarom: "ALA-bron; telt niet mee voor EPA/DHA" }),
  f("sesamolie", "Sesamolie", "vetten", "vetten", [["theelepel", 5]], null),
  f("kokosolie", "Kokosolie", "vetten", "vetten", P.olie, null),
  f("algenolie", "Algenolie", "vetten", "vetten", [["theelepel", 5]], "algenolie",
    { waarom: "de enige plantaardige EPA/DHA-bron — gehalte is een productspecificatie" }),
  f("halvarine", "Halvarine", "vetten", "vetten", [["mespunt", 5], ["voor twee sneden", 10]], "halvarine",
    { waarom: "in Nederland verrijkt met 7,5 µg vitamine D per 100 g — wettelijk kader, geen tabelwaarde" }),
  f("margarine", "Margarine", "vetten", "vetten", [["mespunt", 5], ["voor twee sneden", 10]], null, { waarom: "idem verrijkt" }),
  f("bakboter", "Bak- en braadboter", "vetten", "vetten", [["eetlepel", 15]], null),
];

const SAUZEN: readonly CatalogEntry[] = [
  f("pindakaas", "Pindakaas", "sauzen", "noten", [["eetlepel", 15], ["voor twee sneden", 30]], null, { ookIn: ["ontbijt"], waarom: "telt in de notengroep" }),
  f("amandelpasta", "Amandelpasta", "sauzen", "noten", [["eetlepel", 15]], null, { ookIn: ["ontbijt"] }),
  f("tahin", "Tahin (sesampasta)", "sauzen", "noten", [["eetlepel", 20]], "tahin"),
  f("hummus", "Hummus", "sauzen", "peulvruchten", [["eetlepel", 25], ["portie", 60]], null, { waarom: "telt als peulvrucht" }),
  f("mayonaise", "Mayonaise", "sauzen", "vetten", [["eetlepel", 15]], null),
  f("ketchup", "Ketchup", "sauzen", "suiker", [["eetlepel", 15]], null),
  f("mosterd", "Mosterd", "sauzen", "vetten", [["theelepel", 5]], null),
  f("pesto", "Pesto", "sauzen", "vetten", [["eetlepel", 15]], null),
  f("tomatensaus", "Tomatensaus", "sauzen", "groente", [["portie", 125]], null, { zoek: ["pastasaus"] }),
  f("sojasaus", "Sojasaus", "sauzen", "vetten", [["eetlepel", 15]], null),
  f("teriyakisaus", "Teriyakisaus", "sauzen", "suiker", [["eetlepel", 15]], null),
  f("chilisaus", "Chilisaus", "sauzen", "suiker", [["eetlepel", 15]], null),
  f("sambal", "Sambal", "sauzen", "groente", [["theelepel", 5]], null),
  f("currysaus", "Currysaus", "sauzen", "vetten", [["portie", 100]], null),
  f("dressing", "Slasaus / dressing", "sauzen", "vetten", [["eetlepel", 15]], null),
  f("appelstroop", "Appelstroop", "sauzen", "suiker", [["voor twee sneden", 20]], null, { ookIn: ["ontbijt"] }),
];

/* ═══════════════════════════════════════════════════════════════════════
   ONTBIJT, SNACKS, SOEPEN, MAALTIJDEN EN DRANKEN
   De laatste twee categorieën zijn samengesteld: hun gehaltes horen uit de
   componenten te komen, nooit uit een eigen tabelwaarde. Ze staan er om
   loggen mogelijk te maken, niet om te rekenen.
   ═══════════════════════════════════════════════════════════════════════ */
const ONTBIJT: readonly CatalogEntry[] = [
  f("muesli", "Muesli", "ontbijt", "granen", [["schaaltje", 60]], null),
  f("granola", "Granola", "ontbijt", "granen", [["schaaltje", 50]], null, { waarom: "bevat toegevoegd vet en suiker — anders dan muesli" }),
  f("cornflakes", "Cornflakes", "ontbijt", "granen", [["schaaltje", 30]], null),
  f("ontbijtgranen-volkoren", "Volkoren ontbijtgranen", "ontbijt", "granen", [["schaaltje", 45]], null),
  f("ontbijtgranen-verrijkt", "Ontbijtgranen, verrijkt", "ontbijt", "granen", [["schaaltje", 45]], null,
    { waarom: "verrijking is een merkkeuze — het etiket is de bron" }),
  f("ontbijtkoek", "Ontbijtkoek", "ontbijt", "suiker", [["plak", 25]], null),
  f("jam", "Jam", "ontbijt", "suiker", [["voor twee sneden", 20]], null),
  f("honing", "Honing", "ontbijt", "suiker", [["theelepel", 7]], null),
  f("hagelslag", "Hagelslag", "ontbijt", "suiker", [["voor twee sneden", 15]], null),
];

const SNACKS: readonly CatalogEntry[] = [
  f("popcorn", "Popcorn", "snacks", "granen", [["kom", 25]], null),
  f("chips", "Chips", "snacks", "suiker", [["handvol", 25], ["kleine zak", 40]], null),
  f("tortillachips", "Tortillachips", "snacks", "granen", [["handvol", 30]], null, { zoek: ["nachos"] }),
  f("koek", "Koekje", "snacks", "suiker", [["stuk", 15], ["twee stuks", 30]], null),
  f("pure-chocolade", "Pure chocolade 70 %", "snacks", "suiker", [["twee blokjes", 20], ["reep", 100]], "pure-chocolade",
    { waarom: "levert meetbaar magnesium — de enige snack met een nutriëntroute" }),
  f("melkchocolade", "Melkchocolade", "snacks", "suiker", [["twee blokjes", 20]], null),
  f("snoep", "Snoep", "snacks", "suiker", [["handvol", 30]], null),
  f("ijs", "IJs", "snacks", "suiker", [["bolletje", 60], ["schaaltje", 120]], null),
  f("proteinereep", "Proteïnereep", "snacks", "suiker", [["reep", 60]], null),
  f("mueslireep", "Mueslireep", "snacks", "granen", [["reep", 30]], null),
  f("gebak", "Gebak", "snacks", "suiker", [["punt", 90]], null, { zoek: ["taart", "cake"] }),
  f("stroopwafel", "Stroopwafel", "snacks", "suiker", [["stuk", 35]], null),
];

const SOEPEN: readonly CatalogEntry[] = [
  f("groentesoep", "Groentesoep", "soepen", "groente", [["kom", 250]], null),
  f("tomatensoep", "Tomatensoep", "soepen", "groente", [["kom", 250]], null),
  f("linzensoep", "Linzensoep", "soepen", "peulvruchten", [["kom", 250]], null),
  f("erwtensoep", "Erwtensoep", "soepen", "peulvruchten", [["kom", 300]], null, { zoek: ["snert"] }),
  f("kippensoep", "Kippensoep", "soepen", "vlees", [["kom", 250]], null),
  f("pompoensoep", "Pompoensoep", "soepen", "groente", [["kom", 250]], null),
  f("champignonsoep", "Champignonsoep", "soepen", "groente", [["kom", 250]], null),
  f("bouillon", "Bouillon", "soepen", "dranken", [["kom", 250]], null),
];

const MAALTIJDEN: readonly CatalogEntry[] = [
  f("pizza", "Pizza", "maaltijden", "granen", [["punt", 125], ["hele", 350]], null),
  f("lasagne", "Lasagne", "maaltijden", "granen", [["portie", 350]], null),
  f("nasi", "Nasi goreng", "maaltijden", "zetmeel", [["portie", 350]], null),
  f("bami", "Bami goreng", "maaltijden", "granen", [["portie", 350]], null),
  f("curry-maaltijd", "Curry met rijst", "maaltijden", "zetmeel", [["portie", 400]], null),
  f("stamppot", "Stamppot", "maaltijden", "zetmeel", [["portie", 350]], null, { zoek: ["boerenkoolstamppot", "hutspot"] }),
  f("maaltijdsalade", "Maaltijdsalade", "maaltijden", "groente", [["portie", 300]], null),
  f("pokebowl", "Pokébowl", "maaltijden", "zetmeel", [["portie", 400]], null),
  f("burrito", "Burrito", "maaltijden", "granen", [["stuk", 300]], null),
  f("wrap-gevuld", "Gevulde wrap", "maaltijden", "granen", [["stuk", 200]], null),
  f("quiche", "Quiche", "maaltijden", "granen", [["punt", 150]], null),
  f("friet", "Friet", "maaltijden", "zetmeel", [["kleine portie", 150], ["portie", 250]], null, { bereiding: "gefrituurd", waarom: "frituren onttrekt water en voegt vet toe — beide kanten op een factor" }),
  f("aardappel-gekookt", "Aardappelen, gekookt", "maaltijden", "zetmeel", [["stuk", 75], ["portie", 200]], null,
    { bereiding: "gekookt", ookIn: ["groenten"], waarom: "koken loogt kalium en magnesium uit" }),
  f("aardappel-gebakken", "Aardappelen, gebakken", "maaltijden", "zetmeel", [["portie", 200]], null, { bereiding: "gebakken", ookIn: ["groenten"], waarom: "bakvet gaat mee het gerecht in; de aardappel zelf verliest vocht" }),
  f("aardappelpuree", "Aardappelpuree", "maaltijden", "zetmeel", [["portie", 200]], null, { ookIn: ["groenten"] }),
  f("ovenaardappel", "Ovenaardappel", "maaltijden", "zetmeel", [["portie", 200]], null, { bereiding: "geroosterd", ookIn: ["groenten"], waarom: "droge hitte onttrekt vocht zonder uitloging — anders dan koken" }),
  f("zoete-aardappel-gekookt", "Zoete aardappel, gekookt", "maaltijden", "zetmeel", [["portie", 200]], null, { bereiding: "gekookt", ookIn: ["groenten"] }),
];

const DRANKEN: readonly CatalogEntry[] = [
  f("water", "Water", "dranken", "dranken", [["glas", 200], ["fles", 500]], null),
  f("bruiswater", "Bruiswater", "dranken", "dranken", P.drank, null, { zoek: ["spa rood", "mineraalwater"] }),
  f("koffie", "Koffie", "dranken", "dranken", [["kop", 125], ["mok", 200]], null),
  f("thee", "Thee", "dranken", "dranken", [["kop", 200]], null),
  f("groene-thee", "Groene thee", "dranken", "dranken", [["kop", 200]], null),
  f("sinaasappelsap", "Sinaasappelsap", "dranken", "fruit", P.drank, null, { waarom: "telt in de fruitgroep, maar zonder de vezel van heel fruit" }),
  f("appelsap", "Appelsap", "dranken", "fruit", P.drank, null),
  f("groentesap", "Groentesap", "dranken", "groente", P.drank, null),
  f("frisdrank", "Frisdrank", "dranken", "suiker", [["glas", 200], ["blikje", 330]], null),
  f("frisdrank-light", "Frisdrank, light / zero", "dranken", "dranken", [["glas", 200], ["blikje", 330]], null),
  f("chocolademelk", "Chocolademelk", "dranken", "zuivel", P.drank, null),
  f("sportdrank", "Sportdrank", "dranken", "suiker", [["fles", 500]], null),
  f("bier", "Bier", "dranken", "dranken", [["glas", 250], ["fles", 330]], null),
  f("wijn", "Wijn", "dranken", "dranken", [["glas", 150]], null),
  f("eiwitshake", "Eiwitshake", "dranken", "zuivel", [["shake", 300]], null, { waarom: "eiwitgehalte is een merkkeuze — het etiket is de bron" }),
];

/* ═══════════════════════════════════════════════════════════════════════
   DE CATALOGUS
   ═══════════════════════════════════════════════════════════════════════ */

export const FOOD_CATALOG: readonly CatalogEntry[] = [
  ...GROENTEN, ...FRUIT, ...GRANEN, ...BROOD, ...PASTA,
  ...PEULVRUCHTEN, ...NOTEN, ...ZADEN,
  ...VLEES, ...ORGAANVLEES, ...VIS, ...ZEEVRUCHTEN,
  ...EIEREN, ...ZUIVEL, ...KAAS,
  ...PLANTAARDIG, ...VETTEN, ...SAUZEN,
  ...ONTBIJT, ...SNACKS, ...SOEPEN, ...MAALTIJDEN, ...DRANKEN,
];

const BY_KEY: ReadonlyMap<string, CatalogEntry> = new Map(
  FOOD_CATALOG.map((entry) => [entry.key, entry]),
);

export function catalogEntry(key: string): CatalogEntry | null {
  return BY_KEY.get(key) ?? null;
}

/** Alles wat in een categorie te vinden is — inclusief wat er via `ookIn` bij hoort. */
export function catalogByCategory(category: FoodCategoryId): CatalogEntry[] {
  return FOOD_CATALOG.filter(
    (entry) => entry.category === category || entry.ookIn?.includes(category),
  );
}

/**
 * Zoeken op label, sleutel en synoniemen.
 *
 * Diakrieten worden genormaliseerd: wie "hüttenkäse" zoekt typt "huttenkase",
 * en wie "creme fraiche" typt bedoelt "crème fraîche".
 */
function normaliseer(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function searchCatalog(query: string, limiet = 20): CatalogEntry[] {
  const term = normaliseer(query);
  if (!term) return [];

  const scored = FOOD_CATALOG.map((entry) => {
    const label = normaliseer(entry.labelNl);
    const synoniemen = (entry.zoek ?? []).map(normaliseer);
    // Een treffer vooraan het label weegt zwaarder dan een treffer halverwege:
    // wie "kaas" typt bedoelt eerder "Kaas, jong" dan "Hüttenkäse".
    if (label.startsWith(term)) return { entry, score: 0 };
    if (synoniemen.some((s) => s.startsWith(term))) return { entry, score: 1 };
    if (label.includes(term)) return { entry, score: 2 };
    if (synoniemen.some((s) => s.includes(term))) return { entry, score: 3 };
    if (normaliseer(entry.key).includes(term)) return { entry, score: 4 };
    return null;
  }).filter((hit): hit is { entry: CatalogEntry; score: number } => hit !== null);

  scored.sort((a, b) => a.score - b.score || a.entry.labelNl.localeCompare(b.entry.labelNl, "nl"));
  return scored.slice(0, limiet).map((hit) => hit.entry);
}

/**
 * De werklijst voor `scripts/usda-extract.mjs`: alles wat te loggen is maar
 * nog geen gehaltes heeft. Dit getal hoort te dalen, niet de catalogus te
 * blokkeren — een regel zonder gehaltes is bruikbaar, alleen niet in mg.
 */
export function zonderBron(): CatalogEntry[] {
  return FOOD_CATALOG.filter((entry) => entry.bron === null);
}
