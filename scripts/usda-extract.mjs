#!/usr/bin/env node
/**
 * USDA FoodData Central → verificatierapport voor food-sources.ts
 *
 * ## Wat dit script doet
 *
 * Voor elke fetchbare identiteit in de catalogus haalt het de beste FDC-match
 * op en legt het de gevonden gehaltes naast wat er in `food-sources.ts` staat.
 * Het schrijft een rapport; het **patcht niets**. Dat is dezelfde regel die
 * SPEC_VOEDINGSBRONNEN_VERIFICATIE.md al hanteert, en hij staat er om één
 * reden: de matchbeoordeling is het werk, niet het ophalen.
 *
 * "Bread, whole-wheat, commercially prepared" is niet hetzelfde als Nederlands
 * volkorenbrood — andere uitmaalgraad, ander recept, ander zoutgehalte. Een
 * script dat die match automatisch overneemt, produceert een getal dat er
 * precies zo uitziet als een goed getal.
 *
 * ## De lijst komt uit de catalogus, niet uit dit bestand
 *
 * De vorige zoeklijst stond hardgecodeerd op 54 rijen — een momentopname uit
 * een tijd dat de catalogus 61 gevulde regels had. Inmiddels is hij losgeraakt:
 * queries die naar niets meer wijzen, en tientallen gevulde bronnen zonder
 * audit-query. Daarom leest het script nu `food-catalog.ts` en bouwt de
 * werklijst dááruit:
 *
 *   - elke regel zónder `geenBron` levert een fetchbare identiteit
 *     (`bron` bij een gevulde regel — dan is het een audit; anders de
 *     catalogus-key — dan is het nieuw werk uit `zonderBron()`);
 *   - regels met `geenBron` doen niet mee: die krijgen nooit een USDA-getal
 *     (verwaarloosbaar, verrijkt/etiket, of samengesteld);
 *   - identiteiten uit `NIET_UIT_USDA` worden overgeslagen: nationaal geregeld.
 *
 * Voor de zoekterm zelf blijft een curated `QUERIES`-map nodig: een Engelse
 * query met de val erbij. Een identiteit zónder query komt als
 * `query-ontbreekt` in het rapport — een eerlijk gat, geen blinde zoekopdracht
 * op een Nederlands label (dat zou juist de foute-match-val zijn). Zo dekt de
 * run de hele catalogus en zegt hij precies welke queries nog geschreven moeten.
 *
 * ## Waarom Foundation Foods voorgaat
 *
 * Alleen dat datatype draagt per nutriënt de waargenomen `min`, `max`,
 * `median` en `dataPoints` — de spreiding van de werkelijke monsters. Dat is
 * precies wat de klassenband uit ONDERZOEK_SPREIDING_EN_USDA §1.7 moet
 * vervangen. SR Legacy is de terugval; Branded levert geen micronutriënten
 * (een etiket vermeldt ze wettelijk niet) en wordt overgeslagen.
 *
 * ## Gebruik
 *
 *   FDC_API_KEY=<sleutel van api.data.gov> node scripts/usda-extract.mjs
 *   FDC_API_KEY=... node scripts/usda-extract.mjs --only=amandelen,quinoa
 *   node scripts/usda-extract.mjs --plan   (geen API — toont alleen de dekking)
 *
 * Uitvoer: scripts/out/usda-rapport.json + een samenvatting op stdout.
 *
 * ## Nutriëntnummers — geverifieerd (sep 2026)
 *
 * De nummers hieronder zijn tegen USDA-documentatie gelegd: de 4-cijferige
 * FDC-nutriënt-ID's en hun 3-cijferige SR-Legacy-equivalenten (de FNDDS
 * Appendix K-crosswalk mapt die twee op elkaar). Alle zes bevestigd:
 *
 *   Protein            203 / 1003
 *   Magnesium, Mg      304 / 1090
 *   Zinc, Zn           309 / 1095
 *   Vitamin D (D2+D3)  328 / 1114
 *   EPA 20:5 n-3       629 / 1278
 *   DHA 22:6 n-3       621 / 1272
 *
 * Bronnen: FDC OpenAPI-nutriëntdocumentatie (fdc.nal.usda.gov/api-spec) en de
 * FNDDS-documentatie (Appendix K, ars.usda.gov). Het script matcht bovendien op
 * naampatroon (`namePat`), zodat een editie die een afwijkend nummer voert
 * alsnog aanslaat, en het logt per stof welke sleutel aansloeg — lees die regel
 * bij de eerste echte API-run als extra controle.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const API = "https://api.nal.usda.gov/fdc/v1";
const KEY = process.env.FDC_API_KEY;
const OUT_DIR = path.join("scripts", "out");
const OUT_FILE = path.join(OUT_DIR, "usda-rapport.json");
const CATALOG_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
  "nutrition",
  "food-catalog.ts",
);

const PLAN = process.argv.includes("--plan");

/**
 * De vijf stoffen, elk met de USDA-nummers en de naampatronen waarop we
 * matchen. Omega-3 is de uitzondering: EPA en DHA zijn aparte velden en
 * worden opgeteld — dat is de reden dat USDA hier voorgaat op NEVO, dat de
 * vetzuren vaak niet uitsplitst.
 */
const NUTRIENTS = {
  protein:   { nbrs: ["203", "1003"], namePat: /^protein$/i,                          unit: "g"  },
  magnesium: { nbrs: ["304", "1090"], namePat: /^magnesium,\s*mg$/i,                  unit: "mg" },
  zinc:      { nbrs: ["309", "1095"], namePat: /^zinc,\s*zn$/i,                       unit: "mg" },
  vitamin_d: { nbrs: ["328", "1114"], namePat: /^vitamin d \(d2 \+ d3\)$/i,           unit: "µg" },
  epa:       { nbrs: ["629", "1278"], namePat: /20:5\s*n-3/i,                         unit: "mg" },
  dha:       { nbrs: ["621", "1272"], namePat: /22:6\s*n-3/i,                         unit: "mg" },
};

/**
 * De curated zoektermen, gekozen per identiteit in de catalogus (een
 * `bron`-sleutel bij een gevulde regel, of de catalogus-key bij een open
 * regel). `q` is de Engelse zoekterm; `let` is waar de beoordelaar op moet
 * letten — geen documentatie maar werkinstructie: de val waar een automatische
 * match in trapt. Een ★ markeert een rij die een expliciet oordeel vraagt.
 *
 * `kern` is de vangrail, en hij is er niet theoretisch: in de eerste echte
 * API-run (17 sep 2026) zat 13 van de 53 rijen ernaast doordat het script
 * `treffers[0]` blind overnam. "herring atlantic raw" gaf kabeljauw — er is
 * geen haring in de Foundation-tak, dus FDC gaf het populairste record dat
 * "atlantic" of "raw" deelde. "black beans cooked boiled" gaf boerenkool, dat
 * "cooked, boiled, drained" in zijn naam draagt. "tofu raw firm" gaf bieten,
 * "leverpastei" gaf tomatenpuree, "sardines" gaf ansjovis.
 *
 * Elk van die getallen zag er precies zo uit als een goed getal. Daarom moet
 * de beschrijving van het gekozen record minstens één `kern`-term bevatten,
 * anders telt de treffer niet. Voeg je een query toe, dan hoort er een kern
 * bij; zonder kern slaat het script de rij over in plaats van te gokken.
 *
 * Deze map is bewust NIET de werklijst — die komt uit de catalogus. Staat een
 * fetchbare identiteit hier niet in, dan meldt het rapport `query-ontbreekt`
 * in plaats van blind op het Nederlandse label te zoeken.
 */
export const QUERIES = {
  amandelen:            { q: "almonds raw",                          kern: ["almond"], let: "ongezouten, ongeroosterd" },
  walnoten:             { q: "walnuts english raw",                  kern: ["walnut"], let: "ALA, telt niet mee voor EPA/DHA" },
  cashewnoten:          { q: "cashew nuts raw",                      kern: ["cashew"], let: "rauw, niet geroosterd/gezouten" },
  pompoenzaden:         { q: "pumpkin seeds kernels dried",          kern: ["pumpkin"], let: "gepeld; ongepeld scheelt fors" },
  zonnebloempitten:     { q: "sunflower seed kernels dried",         kern: ["sunflower"], let: "ongezouten" },
  hennepzaad:           { q: "hemp seed hulled",                     kern: ["hemp"], let: "gepeld" },
  lijnzaad:             { q: "flaxseed",                             kern: ["flaxseed", "flax seed", "linseed"], let: "gemalen vs heel; ALA-bron" },
  tahin:                { q: "sesame butter tahini",                 kern: ["tahini", "sesame"], let: "van geroosterd of rauw zaad" },
  hazelnoten:           { q: "hazelnuts or filberts raw",            kern: ["hazelnut", "filbert"], let: "rauw, ongezouten" },
  pecannoten:           { q: "pecans raw",                           kern: ["pecan"], let: "rauw, niet geroosterd/gezouten" },
  pistachenoten:        { q: "pistachio nuts raw",                   kern: ["pistachio"], let: "ongezouten; ★ geroosterd in schelp is de NL-norm" },
  paranoten:            { q: "brazilnuts dried unblanched",          kern: ["brazil"], let: "★ selenium varieert extreem — kleine portie is de norm" },
  macadamia:            { q: "macadamia nuts raw",                   kern: ["macadamia"], let: "rauw, ongezouten" },
  pinda:                { q: "peanuts all types raw",                kern: ["peanut"], let: "★ NL-pinda is vaak geroosterd/gezouten — niet het raw-record als de gebruiker dat bedoelt" },
  pijnboompitten:       { q: "pine nuts dried",                      kern: ["pine nut", "pignolia"], let: "gedroogd, ongebrand" },
  notenmix:             { q: "mixed nuts dry roasted without salt",  kern: ["mixed nuts"], let: "★ ongezouten; mix-samenstelling (met/zonder pinda) scheelt" },
  chiazaad:             { q: "chia seeds dried",                     kern: ["chia"], let: "ALA-bron; telt niet mee voor EPA/DHA" },
  sesamzaad:            { q: "sesame seeds whole dried",             kern: ["sesame"], let: "heel zaad, niet tahin" },
  maanzaad:             { q: "poppy seed",                           kern: ["poppy"], let: "gedroogd zaad, niet het maanzaadbrood" },
  pindakaas:            { q: "peanut butter smooth without salt",    kern: ["peanut butter"], let: "★ zonder zout; toegevoegde suiker/olie is merkkeuze" },
  amandelpasta:         { q: "almond butter plain without salt",     kern: ["almond butter"], let: "puur, zonder zout — niet amandeldrink" },

  havermout:            { q: "oats whole grain rolled",                                 kern: ["oats,"], let: "★ eerste treffer was havermeel (Flour, oat) — kern op \"oats,\" dwingt de vlokken af" },
  volkorenbrood:        { q: "bread whole-wheat commercially prepared", kern: ["bread"], let: "★ NL-volkoren wijkt af — andere uitmaalgraad en zout. Twijfel = geen match" },
  "volkoren-pasta":     { q: "pasta whole-wheat dry",                kern: ["pasta", "spaghetti", "macaroni"], let: "droog" },
  quinoa:               { q: "quinoa cooked",                        kern: ["quinoa"], let: "gekookt, niet droog" },
  zilvervliesrijst:     { q: "rice brown long-grain cooked",         kern: ["rice"], let: "gekookt" },
  "rijst-wit-gekookt":  { q: "rice white long-grain regular enriched cooked", kern: ["rice"], let: "★ VS verrijkt witte rijst; NL niet. Regular, niet parboiled (dat scheelt in mineralen)" },
  "aardappel-gekookt":  { q: "potatoes boiled cooked without skin flesh",         kern: ["potato"], let: "★ gekookt zonder schil, vruchtvlees — niet het schil-record" },
  haverzemelen:         { q: "oat bran raw",                          kern: ["oat bran"], let: "★ zemelen, niet havermout of havermeel" },
  "basmatirijst-gekookt": { q: "rice white basmati cooked",           kern: ["basmati"], let: "gekookt; ★ geen gewone long-grain en geen parboiled" },
  "wilde-rijst-gekookt": { q: "wild rice cooked",                     kern: ["wild rice"], let: "gekookt; ★ \"wild rice\" is Zizania, geen bruine rijst" },
  "quinoa-droog":       { q: "quinoa uncooked",                      kern: ["quinoa"], let: "★ droog gewicht — niet het cooked-record (verdrievoudigt bij koken)" },
  "bulgur-gekookt":     { q: "bulgur cooked",                        kern: ["bulgur"], let: "gekookt" },
  "couscous-gekookt":   { q: "couscous cooked",                      kern: ["couscous"], let: "gekookt; niet de droge korrel" },
  "boekweit-gekookt":   { q: "buckwheat groats cooked",              kern: ["buckwheat"], let: "gekookte grutten, niet boekweitmeel" },
  "gierst-gekookt":     { q: "millet cooked",                        kern: ["millet"], let: "gekookt" },
  "amarant-gekookt":    { q: "amaranth grain cooked",                kern: ["amaranth"], let: "gekookt graan, niet amarantblad" },
  teff:                 { q: "teff uncooked",                        kern: ["teff"], let: "★ catalogus is droog gewicht — niet cooked" },
  "gerst-gekookt":      { q: "barley pearled cooked",                kern: ["barley"], let: "★ parelgerst (pearled), niet ongepelde gerst; gort in NL" },
  "spelt-gekookt":      { q: "spelt cooked",                         kern: ["spelt"], let: "gekookte korrel, niet speltbrood of -meel" },
  polenta:              { q: "cornmeal cooked boiled",               kern: ["cornmeal", "polenta"], let: "★ gekookt maisgries — niet droge cornmeal en niet corn grits als dat een ander record is" },
  witbrood:             { q: "bread white commercially prepared",    kern: ["bread"], let: "commercieel witbrood, niet toast" },
  meergranenbrood:      { q: "bread multi-grain commercially prepared", kern: ["bread"], let: "★ VS-multigrain ≠ NL-meergranen (vaak deels wit)" },
  roggebrood:           { q: "bread rye",                            kern: ["rye"], let: "★ VS-rye bread is luchtig sandwichbrood — NL-roggebrood is dichter en vochtiger. Twijfel = geen match" },
  zuurdesembrood:       { q: "bread sourdough",                      kern: ["sourdough", "sour dough"], let: "zuurdesem; meelsoort (wit vs volkoren) controleren" },
  speltbrood:           { q: "bread spelt",                          kern: ["spelt"], let: "★ alleen als de FDC-naam spelt draagt — niet gewoon tarwebrood" },
  stokbrood:            { q: "bread french or vienna",               kern: ["french", "baguette", "vienna"], let: "stokbrood/baguette, niet sandwichbrood" },
  pita:                 { q: "bread pita white",                     kern: ["pita"], let: "wit pita; niet volkoren pita tenzij de naam dat zegt" },
  naan:                 { q: "bread naan",                           kern: ["naan"], let: "naan, niet pita" },
  "tortilla-wrap":      { q: "tortillas flour ready-to-bake",        kern: ["tortilla"], let: "★ tarwetortilla, niet maïstortilla (corn)" },
  bagel:                { q: "bagels plain",                         kern: ["bagel"], let: "plain, niet sesame/blueberry" },
  croissant:            { q: "croissants butter",                    kern: ["croissant"], let: "botercroissant, niet chocolade" },
  "crackers-volkoren":  { q: "crackers whole-wheat",                 kern: ["cracker"], let: "volkoren cracker, niet zoutje of knäckebröd" },
  knackebrod:           { q: "crispbread rye",                       kern: ["crispbread"], let: "★ rye crispbread ≈ knäckebröd; niet US wheat crackers" },
  rijstwafel:           { q: "rice cakes brown rice plain",          kern: ["rice cake", "rice cakes"], let: "plain, niet chocolate-covered" },
  maiswafel:            { q: "corn cakes",                           kern: ["corn cake", "corn cakes"], let: "★ maiswafel, niet tortillachip of popcorn cake" },
  toast:                { q: "bread white toasted",                  kern: ["toasted"], let: "★ geroosterd — vochtverlies t.o.v. vers brood; wit vs volkoren controleren" },
  "volkoren-pasta-gekookt": { q: "pasta whole-wheat cooked",         kern: ["pasta", "spaghetti", "macaroni"], let: "gekookt, niet droog" },
  "pasta-wit-droog":    { q: "pasta dry enriched",                   kern: ["pasta", "spaghetti", "macaroni"], let: "★ droog; VS enriched — NL meestal niet verrijkt" },
  "pasta-wit-gekookt":  { q: "pasta cooked enriched without added salt", kern: ["pasta", "spaghetti", "macaroni"], let: "gekookt zonder zout; ★ VS enriched" },
  "rijstnoedels-gekookt": { q: "noodles rice cooked",                kern: ["rice noodle", "rice noodles"], let: "gekookte rijstnoedel, niet droge vermicelli" },
  "eiernoedels-gekookt": { q: "noodles egg cooked enriched",         kern: ["egg noodle", "egg noodles"], let: "gekookt; ★ VS enriched" },
  "sobanoedels-gekookt": { q: "noodles japanese soba cooked",        kern: ["soba"], let: "★ soba is boekweit — niet eiernoedel of ramen" },
  friet:                { q: "potatoes french fried frozen prepared", kern: ["french fried", "french fry", "french fries"], let: "★ gefrituurd — vet én vochtverlies; niet ovenaardappel" },
  "aardappel-gebakken": { q: "potatoes hashed brown home-prepared",  kern: ["hashed brown", "hash brown"], let: "★ gebakken/hashbrown, niet frites; bakvet gaat mee" },
  aardappelpuree:       { q: "potatoes mashed home-prepared",        kern: ["mashed"], let: "★ recept (melk/boter) bepaalt het getal — geen instant puree" },
  ovenaardappel:        { q: "potatoes baked flesh and skin",        kern: ["baked"], let: "★ droge hitte, mét schil; niet boiled en niet french fried" },
  "zoete-aardappel-gekookt": { q: "sweet potato cooked boiled without skin", kern: ["sweet potato"], let: "gekookt zonder schil — niet baked/oranje pompoen" },

  linzen:               { q: "lentils mature seeds cooked boiled without salt",                kern: ["lentil"], let: "gekookt zonder zout" },
  kikkererwten:         { q: "chickpeas mature seeds cooked boiled without salt",            kern: ["chickpea", "garbanzo"], let: "gekookt, niet uit blik" },
  "zwarte-bonen":       { q: "beans black mature seeds cooked boiled without salt",            kern: ["black"], let: "gekookt" },
  kidneybonen:          { q: "beans kidney red mature seeds cooked boiled without salt",       kern: ["kidney"], let: "gekookt" },
  "witte-bonen":        { q: "beans white mature seeds cooked boiled without salt",             kern: ["bean"], let: "gekookt; ★ USDA schrijft \"Beans, white\" — kern op \"white bean\" mist dat" },
  "erwten-diepvries":   { q: "peas green frozen cooked boiled drained without salt",                    kern: ["pea"], let: "diepvries, onbereid" },
  tofu:                 { q: "tofu raw firm",                        kern: ["tofu"], let: "★ calciumsulfaat vs nigari scheelt in mineralen" },
  tempe:                { q: "tempeh",                               kern: ["tempeh"], let: "onbereid" },
  "kikkererwten-blik":  { q: "chickpeas canned drained solids",      kern: ["chickpea", "garbanzo"], let: "★ uit blik, uitgelekt — mineralen blijven deels in het vocht" },
  "linzen-blik":        { q: "lentils canned drained",               kern: ["lentil"], let: "★ blik, uitgelekt — niet de zelfgekookte linzen" },
  "kidneybonen-blik":   { q: "beans kidney red canned drained solids", kern: ["kidney"], let: "★ blik, uitgelekt" },
  "cannellinibonen-blik": { q: "beans white canned drained solids",  kern: ["bean"], let: "★ cannellini ≈ USDA \"Beans, white\" canned; uitgelekt. Geen kidney" },
  "bruine-bonen-gekookt": { q: "beans pinto mature seeds cooked boiled without salt", kern: ["pinto"], let: "★ NL-bruine bonen ≈ pinto; geen baked beans in saus" },
  "sojabonen-gekookt":  { q: "soybeans mature seeds cooked boiled without salt", kern: ["soybean"], let: "rijpe sojaboon, gekookt — niet edamame of tofu" },
  edamame:              { q: "edamame frozen prepared",              kern: ["edamame", "green soybean"], let: "groene (onrijpe) sojaboon; niet de rijpe gekookte boon" },
  "spliterwten-gekookt": { q: "peas split mature seeds cooked boiled without salt", kern: ["split pea"], let: "spliterwt, gekookt — niet doperwt of kapucijner" },
  "tuinbonen-gekookt":  { q: "broadbeans fava cooked boiled without salt", kern: ["fava", "broadbean", "broad bean"], let: "tuinboon/fava, gekookt" },
  seitan:               { q: "seitan",                               kern: ["seitan"], let: "tarwe-eiwit; niet tofu of tempeh" },

  spinazie:             { q: "spinach cooked boiled drained without salt",        kern: ["spinach"], let: "gekookt en uitgelekt" },
  "spinazie-rauw":      { q: "spinach raw",                          kern: ["spinach"], let: "★ rauw — niet het gekookte record (uitloging + krimp)" },
  "spinazie-diepvries": { q: "spinach frozen chopped cooked boiled drained without salt", kern: ["spinach"], let: "★ diepvries is geblancheerd; niet rauw en niet vers gekookt" },
  boerenkool:           { q: "kale cooked boiled drained",           kern: ["kale"], let: "gekookt" },
  "boerenkool-rauw":    { q: "kale raw",                             kern: ["kale"], let: "★ rauw — niet cooked (uitloging)" },
  snijbiet:             { q: "chard swiss cooked boiled drained without salt",            kern: ["chard"], let: "gekookt" },
  "andijvie-rauw":      { q: "chicory escarole raw",                 kern: ["escarole"], let: "★ andijvie ≈ escarole, niet witloof/endive (dat is witlof)" },
  "andijvie-gekookt":   { q: "chicory escarole cooked boiled drained without salt", kern: ["escarole"], let: "gekookt; ★ niet witloof" },
  "sla-kropsla":        { q: "lettuce butterhead raw",               kern: ["butterhead", "boston", "bibb"], let: "★ kropsla = butterhead, niet iceberg (ijsbergsla is natter)" },
  rucola:               { q: "arugula raw",                          kern: ["arugula"], let: "rauw" },
  veldsla:              { q: "cornsalad raw",                        kern: ["cornsalad", "corn salad"], let: "★ veldsla = cornsalad/mâche — niet lambsquarters (Chenopodium)" },
  "witlof-rauw":        { q: "chicory witloof raw",                  kern: ["witloof"], let: "★ witloof, niet escarole/endive" },
  "witlof-gekookt":     { q: "chicory witloof cooked boiled drained without salt", kern: ["witloof"], let: "gekookt; ★ niet escarole" },
  "broccoli-gekookt":   { q: "broccoli cooked boiled drained without salt",       kern: ["broccoli"], let: "gekookt" },
  "broccoli-gestoomd":  { q: "broccoli steamed",                     kern: ["broccoli"], let: "★ gestoomd loogt minder dan gekookt — niet het boiled-record" },
  "broccoli-rauw":      { q: "broccoli raw",                         kern: ["broccoli"], let: "rauw" },
  "broccoli-diepvries": { q: "broccoli frozen chopped cooked boiled drained without salt", kern: ["broccoli"], let: "★ diepvries is geblancheerd vóór invriezen" },
  "bloemkool-gekookt":  { q: "cauliflower cooked boiled drained without salt", kern: ["cauliflower"], let: "gekookt" },
  "bloemkool-rauw":     { q: "cauliflower raw",                      kern: ["cauliflower"], let: "rauw" },
  "spruitjes-gekookt":  { q: "brussels sprouts cooked boiled drained without salt", kern: ["brussels"], let: "gekookt" },
  "rodekool-gekookt":   { q: "cabbage red cooked boiled drained without salt", kern: ["cabbage, red", "red cabbage"], let: "★ rode kool — niet witte; gekookt zonder zout" },
  "witte-kool-gekookt": { q: "cabbage cooked boiled drained without salt", kern: ["cabbage, cooked"], let: "★ witte kool — kern op \"cabbage, cooked\" weert red/savoy/chinese" },
  zuurkool:             { q: "sauerkraut canned solids and liquids", kern: ["sauerkraut"], let: "★ blik met vocht (NL-zuurkool is vaak uit het vat); zoutgehalte controleren" },
  "paksoi-gekookt":     { q: "cabbage chinese pak-choi cooked boiled drained without salt", kern: ["pak-choi", "pak choi", "bok choy"], let: "paksoi/bok choy, gekookt — niet witte kool" },
  "wortel-rauw":        { q: "carrots raw",                          kern: ["carrot"], let: "rauw" },
  "wortel-gekookt":     { q: "carrots cooked boiled drained without salt", kern: ["carrot"], let: "gekookt — uitloging t.o.v. rauw" },
  "pastinaak-gekookt":  { q: "parsnips cooked boiled drained without salt", kern: ["parsnip"], let: "gekookt" },
  "biet-gekookt":       { q: "beets cooked boiled drained",          kern: ["beet"], let: "★ gekookte rode biet, niet raw en niet pickled" },
  "knolselderij-gekookt": { q: "celeriac cooked boiled drained without salt", kern: ["celeriac"], let: "knolselderij, gekookt — niet bleekselderij (celery)" },
  radijs:               { q: "radishes raw",                         kern: ["radish"], let: "rauw" },
  "koolraap-gekookt":   { q: "rutabagas cooked boiled drained without salt", kern: ["rutabaga"], let: "koolraap/swede, gekookt — niet raapstelen" },
  tomaat:               { q: "tomatoes red ripe raw",                kern: ["tomato"], let: "rauw; gemiddelde rode tomaat, niet sun-dried" },
  "tomaat-blik":        { q: "tomatoes red ripe canned packed in tomato juice", kern: ["tomato"], let: "★ blik in sap, niet drained diced en niet puree/paste" },
  "paprika-rauw":       { q: "peppers sweet red raw",                kern: ["pepper"], let: "rauw" },
  "paprika-gebakken":   { q: "peppers sweet red sauteed",            kern: ["pepper"], let: "★ gebakken/sauté — vochtverlies concentreert per 100 g; niet raw of boiled" },
  komkommer:            { q: "cucumber with peel raw",               kern: ["cucumber"], let: "mét schil, rauw" },
  "courgette-gebakken": { q: "squash summer zucchini sauteed",       kern: ["zucchini"], let: "★ gebakken; bakvet + vochtverlies — niet boiled" },
  "courgette-gekookt":  { q: "squash summer zucchini cooked boiled drained without salt", kern: ["zucchini"], let: "gekookt" },
  "pompoen-gekookt":    { q: "squash winter butternut cooked boiled without salt", kern: ["butternut"], let: "★ butternut als standaard winterpompoen; gekookt, niet baked" },
  "pompoen-geroosterd": { q: "squash winter butternut cooked baked without salt", kern: ["butternut"], let: "★ gebakken/geroosterd — droge hitte, geen uitloging" },
  "ui-rauw":            { q: "onions raw",                           kern: ["onion"], let: "rauw" },
  "ui-gebakken":        { q: "onions yellow sauteed",                kern: ["onion"], let: "★ gebakken; ui slinkt sterk en neemt bakvet op" },
  "prei-gekookt":       { q: "leeks bulb and lower leaf cooked boiled drained without salt", kern: ["leek"], let: "gekookt; bol + onderste blad" },
  knoflook:             { q: "garlic raw",                           kern: ["garlic"], let: "rauw, verse teen — niet poeder" },
  "asperges-gekookt":   { q: "asparagus cooked boiled drained",      kern: ["asparagus"], let: "gekookt; groene asperge is de USDA-norm (NL-wit is anders)" },
  "mais-blik":          { q: "corn sweet yellow canned whole kernel drained solids", kern: ["corn"], let: "★ blik, uitgelekt; vaak gezouten" },
  "mais-kolf":          { q: "corn sweet yellow cooked boiled drained without salt", kern: ["corn"], let: "gekookte kolf, niet blik en niet popcorn" },
  "sperziebonen-gekookt": { q: "beans snap green cooked boiled drained without salt", kern: ["snap"], let: "sperzieboon/snap bean, gekookt — niet kidney/white" },
  "sperziebonen-diepvries": { q: "beans snap green frozen cooked boiled drained without salt", kern: ["snap"], let: "★ diepvries, geblancheerd" },
  "champignons-gebakken": { q: "mushrooms white stir-fried",         kern: ["mushroom"], let: "★ gebakken/roerbak — vochtverlies >50%; niet raw, niet UV" },
  "champignons-rauw":   { q: "mushrooms white raw",                  kern: ["mushroom"], let: "rauw; ★ niet UV-behandeld (dat is paddenstoelen-uv)" },
  "zeewier-nori":       { q: "seaweed laver",                        kern: ["laver", "nori"], let: "★ nori = gedroogde laver; niet wakame/kelp; droog vs raw scheelt water" },
  "paddenstoelen-uv":   { q: "mushrooms white exposed to ultraviolet light", kern: ["mushroom"], let: "★ alleen UV-behandeld draagt vitamine D" },
  banaan:               { q: "bananas ripe raw",                          kern: ["banana"], let: "★ overrijp scheelt in suiker; \"ripe and slightly ripe\" is de normale banaan" },
  avocado:              { q: "avocados raw",                         kern: ["avocado"], let: "rauw" },
  "gedroogde-vijgen":   { q: "figs dried uncooked",                  kern: ["fig"], let: "gedroogd" },
  dadels:               { q: "dates medjool",                        kern: ["date"], let: "★ gedroogd; medjool vs deglet nour scheelt vocht" },
  rozijnen:             { q: "raisins seedless",                     kern: ["raisin"], let: "gedroogd, pitloos — niet verse druif" },
  "abrikoos-gedroogd":  { q: "apricots dried sulfured uncooked",     kern: ["apricot"], let: "gedroogd, uncooked; sulfured is de USDA-norm" },
  "pruimen-gedroogd":   { q: "plums dried prunes uncooked",          kern: ["prune"], let: "★ gedroogde pruim = prune, niet verse pruim" },

  "zalm-gekweekt":      { q: "salmon atlantic farmed raw",           kern: ["salmon"], let: "★ gekweekt ≠ wild; vitamine D en EPA/DHA verschillen factor 2–4" },
  "zalm-wild":          { q: "salmon atlantic wild raw",             kern: ["salmon"], let: "★ vangstgebied telt: Oostzee ≈ 2× Noordzee" },
  makreel:              { q: "mackerel atlantic raw",                kern: ["mackerel"], let: "★ soort telt: Atlantic ≠ King ≠ Spanish" },
  haring:               { q: "herring atlantic raw",                 kern: ["herring"], let: "rauw, niet gerookt of gemarineerd" },
  sardines:             { q: "sardines atlantic canned in oil drained", kern: ["sardine"], let: "uitgelekt; op olie vs water scheelt" },
  "tonijn-blik":        { q: "tuna light canned in water drained",   kern: ["tuna"], let: "op water, uitgelekt" },
  kabeljauw:            { q: "cod atlantic raw",                     kern: ["cod"], let: "rauw" },
  garnalen:             { q: "shrimp raw",                           kern: ["shrimp", "prawn"], let: "rauw" },
  oesters:              { q: "oysters eastern raw",                  kern: ["oyster"], let: "★ zink varieert extreem per soort en seizoen" },
  "zalm-gerookt":       { q: "salmon chinook smoked",                kern: ["salmon"], let: "★ gerookt/lox — gezouten en droger dan vers; chinook is de USDA-lox-norm" },
  "zalm-blik":          { q: "salmon pink canned drained solids with bone", kern: ["salmon"], let: "★ blik mét graat (calcium); pink ≠ atlantic" },
  "makreel-gerookt":    { q: "mackerel smoked",                      kern: ["mackerel"], let: "★ gerookt droogt en zout; Atlantic vs andere soort controleren" },
  ansjovis:             { q: "anchovy european canned in oil drained", kern: ["anchovy"], let: "★ blik op olie, uitgelekt — niet verse ansjovis" },
  forel:                { q: "trout rainbow farmed raw",             kern: ["trout"], let: "★ gekweekte regenboogforel is de USDA-norm; wild scheelt in vet" },
  "gerookte-forel":     { q: "trout smoked",                         kern: ["trout"], let: "★ gerookt — vocht- en zoutgehalte anders dan vers" },
  "tonijn-vers":        { q: "tuna yellowfin raw",                   kern: ["tuna"], let: "★ verse tonijn; yellowfin ≠ bluefin ≠ light canned" },
  koolvis:              { q: "pollock atlantic raw",                 kern: ["pollock"], let: "★ Atlantic pollock (Pollachius, NL-koolvis) ≠ Alaska pollock" },
  schelvis:             { q: "haddock raw",                          kern: ["haddock"], let: "rauw" },
  schol:                { q: "flatfish flounder sole raw",           kern: ["flatfish", "flounder", "sole"], let: "★ schol bestaat niet als FDC-soort — flounder/sole is de VS-benadering" },
  zeebaars:             { q: "sea bass mixed species raw",           kern: ["sea bass"], let: "★ mixed species; Europese zeebaars (Dicentrarchus) kan afwijken" },
  paling:               { q: "eel mixed species raw",                kern: ["eel"], let: "rauw; ★ gekweekt vs wild scheelt in vet" },
  vissticks:            { q: "fish sticks frozen prepared",          kern: ["fish stick", "fish sticks"], let: "★ paneer + frituurvet vormen een groot deel van het gewicht" },
  mosselen:             { q: "mussel blue raw",                      kern: ["mussel"], let: "rauw gewicht; gekookt loogt uit" },
  krab:                 { q: "crab blue raw",                        kern: ["crab"], let: "★ blauwe krab is de USDA-norm; NL-noordzeekrab wijkt af" },
  kreeft:               { q: "lobster northern raw",                 kern: ["lobster"], let: "Amerikaanse kreeft (Homarus) — niet langoest" },
  inktvis:              { q: "squid mixed species raw",              kern: ["squid"], let: "inktvis/calamari, rauw — niet octopus" },
  octopus:              { q: "octopus common raw",                   kern: ["octopus"], let: "octopus, rauw — niet squid" },

  kipfilet:             { q: "chicken breast skinless boneless raw", kern: ["chicken"], let: "zonder vel, rauw" },
  "rundvlees-mager":    { q: "beef loin lean raw",                   kern: ["beef"], let: "mager, rauw" },
  varkenshaas:          { q: "pork tenderloin lean raw",             kern: ["pork"], let: "rauw" },
  kalfsvlees:           { q: "veal loin lean raw",                   kern: ["veal"], let: "rauw" },
  lamsvlees:            { q: "lamb loin lean raw",                   kern: ["lamb"], let: "rauw" },
  leverpastei:          { q: "liver pate chicken canned",            kern: ["pate", "liver"], let: "★ leverproducten verschillen sterk per recept" },
  kipdij:               { q: "chicken thigh meat only raw",          kern: ["thigh"], let: "★ dij, vlees zonder vel, rauw — niet drumstick of whole chicken" },
  kippenvleugel:        { q: "chicken wing meat and skin raw",       kern: ["wing"], let: "★ vleugel mét vel (gangbaar); rauw" },
  kalkoenfilet:         { q: "turkey breast meat only raw",          kern: ["turkey"], let: "filet zonder vel, rauw — niet ground turkey" },
  biefstuk:             { q: "beef loin tenderloin steak raw",       kern: ["tenderloin", "steak"], let: "★ biefstuk ≈ tenderloin steak; niet ground beef" },
  rundergehakt:         { q: "beef ground 85% lean raw",             kern: ["ground"], let: "★ 85% lean is een middenweg; vetpercentage scheelt eiwit per 100 g" },
  varkenskarbonade:     { q: "pork loin chop raw",                   kern: ["chop"], let: "karbonade/chop, rauw — niet tenderloin (haas)" },
  eend:                 { q: "duck domesticated meat only raw",      kern: ["duck"], let: "★ tamme eend, vlees zonder vel; eendenborst mét vel is vetter" },
  konijn:               { q: "game meat rabbit raw",                 kern: ["rabbit"], let: "konijn, rauw" },
  wild:                 { q: "game meat deer raw",                   kern: ["deer"], let: "★ hert/ree ≈ deer/venison; niet wild zwijn" },
  hamburger:            { q: "beef ground 85% lean patty cooked pan-broiled", kern: ["patty", "ground"], let: "★ gebakken gehaktlap; niet fastfood-hamburger met broodje" },
  worst:                { q: "sausage pork fresh raw",               kern: ["sausage"], let: "★ verse varkensworst ≈ braadworst; rookworst/droge worst is een ander product" },
  bacon:                { q: "pork cured bacon cooked pan-fried",    kern: ["bacon"], let: "★ uitgebakken — gewicht halveert; niet raw/unheated" },
  ham:                  { q: "ham sliced extra lean",                kern: ["ham"], let: "plakham; vetpercentage controleren (extra lean vs regular)" },
  rosbief:              { q: "roast beef sliced",                    kern: ["roast beef"], let: "vleeswaren-rosbief, niet een verse biefstuk" },
  salami:               { q: "salami pork beef cooked",              kern: ["salami"], let: "gedroogde worst; recept (varken/rund) varieert" },
  "kipfilet-vleeswaren": { q: "chicken breast deli sliced",          kern: ["deli", "luncheon"], let: "★ vleeswaren, niet verse kipfilet; kruiden/zout zijn merkkeuze" },
  runderlever:          { q: "beef liver raw",                       kern: ["liver"], let: "runderlever, rauw — niet kip/varken" },
  kippenlever:          { q: "chicken liver raw",                    kern: ["liver"], let: "kippenlever, rauw" },
  varkenslever:         { q: "pork liver raw",                       kern: ["liver"], let: "varkenslever, rauw" },
  hart:                 { q: "beef heart raw",                       kern: ["heart"], let: "★ rundhart is de USDA-norm; soort controleren" },
  nier:                 { q: "beef kidneys raw",                     kern: ["kidney"], let: "★ rundernier is de USDA-norm" },
  tong:                 { q: "beef tongue raw",                      kern: ["tongue"], let: "★ rundertong is de USDA-norm" },
  pens:                 { q: "beef tripe raw",                       kern: ["tripe"], let: "pens/tripe, rund" },

  eieren:               { q: "egg whole raw fresh",                  kern: ["egg"], let: "★ vitamine D volgt het legvoer; NL-waarde kan afwijken" },
  "magere-kwark":       { q: "cheese cottage lowfat",                kern: ["cottage"], let: "★ kwark bestaat niet in de VS — beste benadering is magere kwark uit NEVO of etiket" },
  skyr:                 { q: "yogurt greek plain nonfat",            kern: ["yogurt", "skyr"], let: "★ skyr ≠ Griekse yoghurt; eiwit ligt hoger" },
  "griekse-yoghurt":    { q: "yogurt greek plain whole milk",        kern: ["yogurt"], let: "vetgehalte bepaalt eiwit per 100 g" },
  huttenkase:           { q: "cheese cottage creamed large curd",    kern: ["cottage"], let: "vetgehalte" },
  "belegen-kaas":       { q: "cheese gouda",                         kern: ["gouda", "cheese"], let: "★ rijping bepaalt vocht en dus eiwit per 100 g" },
  eiwit:                { q: "egg white raw fresh",                  kern: ["egg, white", "egg white"], let: "★ alleen het eiwit — vitamine D/zink zitten in de dooier" },
  eidooier:             { q: "egg yolk raw fresh",                   kern: ["yolk"], let: "alleen de dooier" },
  "melk-vol":           { q: "milk whole 3.25% milkfat",             kern: ["milk"], let: "★ volle melk; NL is sinds 2021 verrijkt met vitamine D, USDA-whole milk meestal niet" },
  karnemelk:            { q: "buttermilk fluid cultured",            kern: ["buttermilk"], let: "karnemelk; vetpercentage (whole vs lowfat) controleren" },
  "yoghurt-vol":        { q: "yogurt plain whole milk",              kern: ["yogurt"], let: "volle plain yoghurt — niet Grieks, niet fruit" },
  "yoghurt-mager":      { q: "yogurt plain skim milk",               kern: ["yogurt"], let: "★ mager/skim; niet Grieks (dat is geconcentreerd)" },
  "volle-kwark":        { q: "cheese cottage 4% milkfat",            kern: ["cottage"], let: "★ kwark bestaat niet in de VS — cottage 4% is de beste benadering; NEVO/etiket gaat voor" },
  kefir:                { q: "kefir plain",                          kern: ["kefir"], let: "plain kefir; vetpercentage controleren" },
  room:                 { q: "cream fluid light coffee cream",       kern: ["coffee cream", "table cream", "light (coffee"], let: "★ kookroom ≈ light/coffee cream (~20%); niet heavy whipping" },
  slagroom:             { q: "cream fluid heavy whipping",           kern: ["whipping"], let: "★ slagroom = heavy whipping (~36%); niet light cream" },
  "jonge-kaas":         { q: "cheese gouda",                         kern: ["gouda"], let: "★ jonger = natter, lager eiwit per 100 g — zelfde USDA-gouda als belegen; NEVO gaat voor als rijping telt" },
  "oude-kaas":          { q: "cheese gouda",                         kern: ["gouda"], let: "★ ouder = droger, hoger eiwit per 100 g — USDA heeft geen extra-belegen gouda" },
  mozzarella:           { q: "cheese mozzarella whole milk",         kern: ["mozzarella"], let: "volle mozzarella; niet part-skim tenzij dat de treffer is" },
  feta:                 { q: "cheese feta",                          kern: ["feta"], let: "feta; schapen/geitenmix is de USDA-norm" },
  geitenkaas:           { q: "cheese goat soft",                     kern: ["goat"], let: "★ zachte geitenkaas; niet harde geitenkaas of cheddar" },
  schapenkaas:          { q: "cheese pecorino romano",               kern: ["pecorino"], let: "★ pecorino is de USDA-schapenkaas; NL-schapenkaas kan natter/zachter zijn" },
  parmezaan:            { q: "cheese parmesan grated",               kern: ["parmesan", "parmigiano"], let: "geraspt; droog, hoog eiwit per 100 g" },
  "blauwe-kaas":        { q: "cheese blue",                          kern: ["cheese, blue", "blue cheese"], let: "★ blue cheese; gorgonzola/roquefort zijn varianten — soort controleren" },
  roomkaas:             { q: "cheese cream",                         kern: ["cheese, cream", "cream cheese"], let: "roomkaas; USDA schrijft \"Cheese, cream\"" },
  "sojadrink-onverrijkt": { q: "soymilk original unfortified",       kern: ["soymilk", "soy milk"], let: "★ onverrijkt — niet calcium/vit D fortified (dat is sojadrink-verrijkt)" },
  "pure-chocolade":     { q: "chocolate dark 70-85% cacao solids",   kern: ["cacao", "dark"], let: "★ 70–85% cacao; niet melkchocolade" },
  chocolademelk:        { q: "chocolate milk ready to drink",        kern: ["chocolate milk"], let: "★ VS-chocolademelk is vaak verrijkt; vetpercentage controleren" },
};

/** Producten die nooit uit USDA komen — verrijking is nationaal geregeld. */
export const NIET_UIT_USDA = {
  halvarine: "NL-kader: 7,5 µg vitamine D per 100 g (25 µg voor ouderenvarianten)",
  "sojadrink-verrijkt": "verrijking is fabrikantkeuze binnen NL-kader — etiket is de bron",
  "plantaardige-drank-verrijkt": "idem",
  melk: "verplicht verrijkt sinds 2021: 1,5 µg per 100 ml",
  algenolie: "productspecificatie van de fabrikant",
  zonlicht: "geen voedingsmiddel",
};

/**
 * Lees de catalogus en leid de fetchbare identiteiten af. Puur tekstueel, want
 * dit script draait op `node` zonder TS-loader. Per `f("key", …, bron, {…})`:
 * de key, de `bron` (null of een sleutel) en een eventueel `geenBron`.
 */
export function leesCatalogus() {
  const src = fs.readFileSync(CATALOG_FILE, "utf8");
  const regels = src.split("\n");
  const entries = [];
  let buffer = "";

  const verwerk = (blok) => {
    const key = blok.match(/f\("([^"]+)"/);
    if (!key) return;
    const geenBron = (blok.match(/geenBron:\s*"(\w+)"/) ?? [])[1] ?? null;
    // `bron` staat na de porties (die eindigen op `]` of `P.xxx`): een komma,
    // dan null of "sleutel", dan `, {` (extra volgt) of `)` (einde call).
    const bron = blok.match(/(?:\]|P\.\w+)\s*,\s*(null|"[^"]+")\s*(?:,\s*\{|\))/);
    const bronWaarde = !bron || bron[1] === "null" ? null : bron[1].slice(1, -1);
    entries.push({ key: key[1], bron: bronWaarde, geenBron });
  };

  for (const regel of regels) {
    if (/^\s*f\("/.test(regel)) {
      if (buffer) verwerk(buffer);
      buffer = regel;
    } else if (buffer) {
      buffer += " " + regel.trim();
      if (/\}\),?\s*$|null\),?\s*$|"\),?\s*$/.test(regel)) {
        verwerk(buffer);
        buffer = "";
      }
    }
  }
  if (buffer) verwerk(buffer);
  return entries;
}

/**
 * Van catalogusregels naar de te doorzoeken identiteiten. Eén identiteit kan
 * meerdere catalogusregels dragen (linzen-rood/groen/bruin → "linzen"): dan is
 * het één zoekopdracht. `geenBron`-regels en `NIET_UIT_USDA`-identiteiten
 * vallen af.
 */
export function bouwDoelen(entries) {
  const doelen = new Map();
  for (const e of entries) {
    if (e.geenBron) continue;
    const identiteit = e.bron ?? e.key;
    if (identiteit in NIET_UIT_USDA) continue;
    const bestaand = doelen.get(identiteit);
    if (bestaand) {
      bestaand.catalogusKeys.push(e.key);
    } else {
      doelen.set(identiteit, {
        key: identiteit,
        soort: e.bron ? "audit" : "open",
        catalogusKeys: [e.key],
      });
    }
  }
  return [...doelen.values()];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fdc(pad, params) {
  const url = new URL(API + pad);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`FDC ${res.status} op ${pad}: ${await res.text()}`);
  return res.json();
}

/**
 * Staat dit FDC-record werkelijk voor het gevraagde voedingsmiddel?
 *
 * De reden dat deze functie bestaat: FDC's relevantie-sortering zet bij een
 * zoekterm zonder treffers gewoon het populairste record bovenaan dat één
 * woord deelt. "herring atlantic raw" leverde zo kabeljauw, "black beans
 * cooked boiled" leverde boerenkool (die draagt "cooked, boiled, drained" in
 * zijn naam), en "tofu raw firm" leverde bieten. Dertien van de 53 rijen in de
 * eerste run zaten er zo naast — allemaal met een keurig ogend getal.
 *
 * `kern` is daarom geen zoekterm maar een controle: het woord dat in de
 * beschrijving móét staan, anders is het een ander voedingsmiddel. Een
 * afgewezen match is het gewenste resultaat, geen mislukking.
 */
function naamDekt(beschrijving, kern) {
  const naam = String(beschrijving ?? "").toLowerCase();
  return kern.some((k) => naam.includes(k.toLowerCase()));
}

/**
 * De beste match: Foundation Foods gaat voor, SR Legacy is de terugval.
 *
 * Twee harde regels boven op de vorige versie: `requireAllWords` staat aan, en
 * alleen records waarvan de naam de `kern` draagt komen in aanmerking. Levert
 * dat niets op, dan is "geen treffer" het eerlijke antwoord.
 */
async function zoekVoedingsmiddel(query, kern) {
  const afgewezen = [];
  for (const dataType of ["Foundation", "SR Legacy"]) {
    const r = await fdc("/foods/search", {
      query,
      dataType,
      pageSize: "10",
      requireAllWords: "true",
    });
    const treffers = (r.foods ?? []).filter((f) => {
      if (naamDekt(f.description, kern)) return true;
      afgewezen.push({ fdcId: f.fdcId, naam: f.description, dataType });
      return false;
    });
    if (treffers.length) return { dataType, treffers, afgewezen };
  }
  return { dataType: null, treffers: [], afgewezen };
}

/** Haal onze vijf stoffen uit een FDC-detailrecord, met spreiding waar aanwezig. */
function stoffenUit(detail) {
  const out = {};
  const gevonden = [];
  for (const [id, spec] of Object.entries(NUTRIENTS)) {
    const fn = (detail.foodNutrients ?? []).find((n) => {
      const nr = String(n.nutrient?.number ?? n.nutrientNumber ?? "");
      const nm = String(n.nutrient?.name ?? n.nutrientName ?? "");
      return spec.nbrs.includes(nr) || spec.namePat.test(nm);
    });
    if (!fn) continue;
    gevonden.push(`${id}=${fn.nutrient?.number ?? fn.nutrientNumber}:${fn.nutrient?.name ?? fn.nutrientName}`);
    out[id] = {
      amount: fn.amount ?? fn.value ?? null,
      unit: fn.nutrient?.unitName ?? fn.unitName ?? null,
      // Alleen Foundation Foods vult deze; leeg betekent: één monster, geen spreiding.
      min: fn.min ?? null,
      max: fn.max ?? null,
      median: fn.median ?? null,
      dataPoints: fn.dataPoints ?? null,
    };
  }
  return { stoffen: out, gevonden };
}

async function main() {
  if (!KEY && !PLAN) {
    console.error("Zet FDC_API_KEY. Gratis sleutel: https://fdc.nal.usda.gov/api-key-signup");
    console.error("Of draai zonder API: node scripts/usda-extract.mjs --plan");
    process.exit(1);
  }

  const entries = leesCatalogus();
  const doelen = bouwDoelen(entries);

  const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7);
  const gefilterd = only
    ? doelen.filter((d) => only.split(",").includes(d.key))
    : doelen;

  // Doelen met een curated query worden gezocht; de rest is een eerlijk gat.
  const teZoeken = gefilterd.filter((d) => QUERIES[d.key]);
  const zonderQuery = gefilterd.filter((d) => !QUERIES[d.key]);
  // Queries die naar een identiteit wijzen die niet (meer) in de catalogus zit.
  const catalogusIds = new Set(doelen.map((d) => d.key));
  const verweesd = Object.keys(QUERIES).filter((k) => !catalogusIds.has(k));

  console.log(`Catalogus: ${entries.length} regels`);
  console.log(`  fetchbare identiteiten:  ${doelen.length}`);
  console.log(`    met query (te zoeken): ${teZoeken.length}`);
  console.log(`    query ontbreekt:       ${zonderQuery.length}`);
  console.log(`  audit vs open: ${doelen.filter((d) => d.soort === "audit").length} / ${doelen.filter((d) => d.soort === "open").length}`);
  if (verweesd.length) {
    console.log(`\nQueries zonder doel in de catalogus (${verweesd.length}): ${verweesd.join(", ")}`);
  }

  if (PLAN) {
    console.log(`\n--plan: geen API-verzoeken gedaan.`);
    console.log(`Identiteiten die nog een curated query nodig hebben (${zonderQuery.length}):`);
    for (const d of zonderQuery) {
      console.log(`  ${d.soort === "audit" ? "audit" : "open "} ${d.key}  (${d.catalogusKeys.join(", ")})`);
    }
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rapport = { gedraaid: new Date().toISOString(), nietUitUsda: NIET_UIT_USDA, rijen: [] };
  let nutriëntsleutelsGelogd = false;

  // Identiteiten zonder query eerst als expliciet gat vastleggen.
  for (const d of zonderQuery) {
    rapport.rijen.push({
      key: d.key,
      soort: d.soort,
      catalogusKeys: d.catalogusKeys,
      status: "query-ontbreekt",
    });
  }

  for (const [i, doel] of teZoeken.entries()) {
    const item = { key: doel.key, soort: doel.soort, catalogusKeys: doel.catalogusKeys, ...QUERIES[doel.key] };
    process.stderr.write(`[${i + 1}/${teZoeken.length}] ${doel.key} … `);
    try {
      if (!item.kern?.length) {
        rapport.rijen.push({ ...item, status: "kern-ontbreekt" });
        process.stderr.write("kern ontbreekt — overgeslagen\n");
        continue;
      }
      const treffer = await zoekVoedingsmiddel(item.q, item.kern);
      if (!treffer.treffers.length) {
        rapport.rijen.push({
          ...item,
          status: "geen-treffer",
          afgewezen: treffer.afgewezen.slice(0, 5),
        });
        process.stderr.write(`geen treffer (${treffer.afgewezen.length} afgewezen)\n`);
        continue;
      }
      const best = treffer.treffers[0];
      const detail = await fdc(`/food/${best.fdcId}`, { format: "full" });
      const { stoffen, gevonden } = stoffenUit(detail);

      if (!nutriëntsleutelsGelogd && gevonden.length) {
        console.log("\nGevonden nutriëntsleutels (controleer deze regel op de eerste run):");
        console.log("  " + gevonden.join("\n  ") + "\n");
        nutriëntsleutelsGelogd = true;
      }

      rapport.rijen.push({
        ...item,
        status: "te-beoordelen",
        dataType: treffer.dataType,
        fdcId: best.fdcId,
        fdcNaam: best.description,
        publicatie: best.publishedDate ?? null,
        alternatieven: treffer.treffers.slice(1).map((f) => ({ fdcId: f.fdcId, naam: f.description })),
        afgewezen: treffer.afgewezen.slice(0, 5),
        stoffen,
      });
      process.stderr.write(`${treffer.dataType} #${best.fdcId}\n`);
    } catch (err) {
      rapport.rijen.push({ ...item, status: "fout", fout: String(err.message ?? err) });
      process.stderr.write(`FOUT: ${err.message}\n`);
    }
    // api.data.gov staat 1.000 verzoeken per uur toe; twee per rij.
    await sleep(400);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(rapport, null, 2));

  const metSpreiding = rapport.rijen.filter((r) =>
    Object.values(r.stoffen ?? {}).some((s) => s.min != null && s.max != null),
  ).length;

  console.log(`\nRapport: ${OUT_FILE}`);
  console.log(`  rijen:             ${rapport.rijen.length}`);
  console.log(`  te beoordelen:     ${rapport.rijen.filter((r) => r.status === "te-beoordelen").length}`);
  console.log(`  geen treffer:      ${rapport.rijen.filter((r) => r.status === "geen-treffer").length}`);
  console.log(`  query ontbreekt:   ${rapport.rijen.filter((r) => r.status === "query-ontbreekt").length}`);
  console.log(`  fouten:            ${rapport.rijen.filter((r) => r.status === "fout").length}`);
  console.log(`  mét waargenomen spreiding (min/max): ${metSpreiding}`);
  console.log("\nNiets is automatisch overgenomen. Elke rij met ★ in `let` vraagt");
  console.log("een expliciet oordeel voordat hij `verified: true` mag dragen.");
}

// Alleen draaien wanneer direct aangeroepen — bij import (test) niet.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
