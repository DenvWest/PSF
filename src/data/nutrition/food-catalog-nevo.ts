/**
 * Koppeling van `FOOD_CATALOG`-regels aan een NEVO-code (NEVO-online 2025/9.0).
 *
 * Gegenereerd door `scripts/nevo-koppel.mjs` — niet met de hand aanpassen;
 * draai het script opnieuw. Een koppeling zegt alleen "dit voedingsmiddel is in
 * NEVO dit record"; het gehalte staat nooit hier maar in `nevo_foods`, bij die
 * code, ongewijzigd en met versie.
 *
 * `basis`:
 *   - `bron`: de catalogusregel wijst naar een `FOOD_SOURCES`-rij die al uit NEVO komt.
 *   - `naam`: één sterke naamkandidaat, bereiding niet in strijd (zie het script).
 *
 * Regels die hier ontbreken zijn onzeker of hebben geen tegenhanger in NEVO;
 * ze staan met kandidaten in `docs/plan/STEEKPROEF_NEVO_KOPPELING_2026-10.md`.
 */
export type NevoKoppelingBasis = "bron" | "naam";

export interface NevoKoppeling {
  /** NEVO-code, de sleutel in `nevo_foods`. */
  code: string;
  basis: NevoKoppelingBasis;
}

export const FOOD_CATALOG_NEVO: Readonly<Record<string, NevoKoppeling>> = {
  "aardappel-gebakken": { code: "1457", basis: "naam" },
  "amandelen": { code: "5049", basis: "bron" },
  "andijvie-gekookt": { code: "8", basis: "naam" },
  "andijvie-rauw": { code: "7", basis: "naam" },
  "avocado": { code: "689", basis: "bron" },
  "banaan": { code: "151", basis: "bron" },
  "belegen-kaas": { code: "2758", basis: "bron" },
  "biefstuk": { code: "1400", basis: "bron" },
  "biet-gekookt": { code: "958", basis: "naam" },
  "blauwe-bessen": { code: "152", basis: "naam" },
  "bramen": { code: "157", basis: "naam" },
  "broccoli-gekookt": { code: "920", basis: "bron" },
  "broccoli-rauw": { code: "921", basis: "naam" },
  "bruine-bonen-gekookt": { code: "5168", basis: "naam" },
  "cashewnoten": { code: "199", basis: "bron" },
  "champignons-gebakken": { code: "5609", basis: "naam" },
  "champignons-rauw": { code: "19", basis: "naam" },
  "chilisaus": { code: "3343", basis: "naam" },
  "citroen": { code: "158", basis: "naam" },
  "courgette-gekookt": { code: "966", basis: "naam" },
  "doperwten-diepvries": { code: "953", basis: "bron" },
  "ei-gebakken": { code: "83", basis: "bron" },
  "ei-gekookt": { code: "83", basis: "bron" },
  "erwten-diepvries": { code: "953", basis: "bron" },
  "feta": { code: "3362", basis: "bron" },
  "forel": { code: "1611", basis: "bron" },
  "gedroogde-vijgen": { code: "193", basis: "bron" },
  "gierst-gekookt": { code: "2159", basis: "naam" },
  "granaatappel": { code: "1007", basis: "naam" },
  "griekse-yoghurt": { code: "2503", basis: "bron" },
  "halvarine": { code: "2566", basis: "bron" },
  "haring": { code: "113", basis: "bron" },
  "havermout": { code: "213", basis: "bron" },
  "hazelnoten": { code: "200", basis: "bron" },
  "hennepzaad": { code: "3446", basis: "bron" },
  "honing": { code: "443", basis: "naam" },
  "huttenkase": { code: "654", basis: "bron" },
  "jonge-kaas": { code: "2756", basis: "bron" },
  "kabeljauw": { code: "820", basis: "bron" },
  "kalfsvlees": { code: "5280", basis: "bron" },
  "kefir": { code: "1076", basis: "naam" },
  "kidneybonen-gekookt": { code: "5173", basis: "bron" },
  "kipfilet": { code: "1634", basis: "bron" },
  "kippenlever": { code: "475", basis: "bron" },
  "kokosolie": { code: "3243", basis: "naam" },
  "koolraap-gekookt": { code: "29", basis: "naam" },
  "koolzaadolie": { code: "3449", basis: "naam" },
  "kreeft": { code: "352", basis: "naam" },
  "lamsvlees": { code: "2057", basis: "bron" },
  "leverpastei": { code: "335", basis: "bron" },
  "lijnzaadolie": { code: "3051", basis: "naam" },
  "limoen": { code: "691", basis: "naam" },
  "linzen-bruin-gekookt": { code: "970", basis: "bron" },
  "linzen-gekookt": { code: "970", basis: "bron" },
  "linzen-groen-gekookt": { code: "970", basis: "bron" },
  "linzen-rood-gekookt": { code: "970", basis: "bron" },
  "maanzaad": { code: "2805", basis: "bron" },
  "macadamia": { code: "2844", basis: "bron" },
  "magere-kwark": { code: "305", basis: "bron" },
  "makreel": { code: "353", basis: "bron" },
  "mango": { code: "692", basis: "naam" },
  "mayonaise": { code: "451", basis: "naam" },
  "melk-vol": { code: "279", basis: "bron" },
  "mosselen": { code: "111", basis: "bron" },
  "mozzarella": { code: "1955", basis: "bron" },
  "nectarine": { code: "1812", basis: "naam" },
  "oesters": { code: "354", basis: "bron" },
  "olijfolie": { code: "601", basis: "naam" },
  "paksoi-gekookt": { code: "3086", basis: "naam" },
  "paling": { code: "1624", basis: "bron" },
  "parmezaan": { code: "718", basis: "naam" },
  "pastinaak-gekookt": { code: "3128", basis: "naam" },
  "pecannoten": { code: "1895", basis: "bron" },
  "pijnboompitten": { code: "2176", basis: "naam" },
  "pinda": { code: "204", basis: "bron" },
  "pistachenoten": { code: "5112", basis: "bron" },
  "pompoen-gekookt": { code: "2113", basis: "naam" },
  "pompoenzaden": { code: "2806", basis: "bron" },
  "prei-gekookt": { code: "37", basis: "naam" },
  "quinoa": { code: "3154", basis: "bron" },
  "quinoa-droog": { code: "3153", basis: "bron" },
  "radijs": { code: "124", basis: "naam" },
  "rijst-wit-gekookt": { code: "658", basis: "naam" },
  "rundergehakt": { code: "1405", basis: "bron" },
  "rundvlees-mager": { code: "1663", basis: "bron" },
  "sardines-blik": { code: "355", basis: "bron" },
  "seitan": { code: "1458", basis: "bron" },
  "sesamolie": { code: "3376", basis: "naam" },
  "sesamzaad": { code: "838", basis: "bron" },
  "sinaasappel": { code: "171", basis: "naam" },
  "skyr": { code: "5295", basis: "bron" },
  "snijbiet-gekookt": { code: "48", basis: "naam" },
  "sojabonen-gekookt": { code: "971", basis: "bron" },
  "sojadrink-verrijkt": { code: "3180", basis: "bron" },
  "sojasaus": { code: "5470", basis: "naam" },
  "sperziebonen-diepvries": { code: "954", basis: "naam" },
  "spinazie-diepvries": { code: "1146", basis: "bron" },
  "spinazie-gekookt": { code: "52", basis: "bron" },
  "spinazie-rauw": { code: "51", basis: "bron" },
  "tahin": { code: "1461", basis: "bron" },
  "tempe": { code: "5573", basis: "bron" },
  "teriyakisaus": { code: "5471", basis: "naam" },
  "tofu": { code: "5519", basis: "bron" },
  "tonijn-blik": { code: "1590", basis: "bron" },
  "tuinbonen-gekookt": { code: "962", basis: "bron" },
  "varkenshaas": { code: "1422", basis: "bron" },
  "vijg-vers": { code: "1010", basis: "naam" },
  "volkoren-pasta": { code: "811", basis: "bron" },
  "volkoren-pasta-gekookt": { code: "2157", basis: "naam" },
  "volkorenbrood": { code: "246", basis: "bron" },
  "witlof-gekookt": { code: "68", basis: "naam" },
  "witlof-rauw": { code: "67", basis: "naam" },
  "witte-bonen-gekookt": { code: "5175", basis: "bron" },
  "witte-kool-gekookt": { code: "70", basis: "naam" },
  "zalm-gerookt": { code: "1096", basis: "naam" },
  "zilvervliesrijst": { code: "1014", basis: "bron" },
  "zoete-aardappel-gekookt": { code: "2112", basis: "naam" },
  "zonnebloemolie": { code: "317", basis: "naam" },
  "zonnebloempitten": { code: "872", basis: "bron" },
  "zwarte-bonen-gekookt": { code: "5176", basis: "bron" },
};

/** NEVO-koppeling van een catalogusregel, of `null` als die (nog) niet zeker is. */
export function nevoKoppelingVoor(catalogKey: string): NevoKoppeling | null {
  return FOOD_CATALOG_NEVO[catalogKey] ?? null;
}
