/**
 * Bekende snippet-schulden op 15 september 2026 — de rode lijst van A3.
 *
 * Het snippet-contract (`src/lib/seo/snippet-contract.ts`) faalt op álles wat
 * hier niet in staat. Deze lijst bestaat dus om precies twee redenen:
 *
 *   1. nieuwe dubbele of generieke snippets worden meteen rood;
 *   2. wie een snippet herschrijft, haalt de regel hier weg — blijft er een
 *      regel staan die al opgelost is, dan faalt de test óók. De lijst kan
 *      alleen krimpen.
 *
 * Werkvolgorde: eerst de vergelijkingspagina's (daar komt het geld binnen),
 * daarna de gidsen. Het magnesium-paar staat er al niet meer in: /beste/magnesium
 * rankt en is als eerste aangescherpt, met de gids mee naar informationele vorm.
 */
export const SNIPPET_CONTRACT_BASELINE: readonly string[] = [
  // /beste/ashwagandha
  //   · H1 botst met /supplementen/ashwagandha — geen eigen onderscheidend woord
  "/beste/ashwagandha::intentie-botsing",
  //   · H1 is hetzelfde sjabloon als /beste/vitamine-d, /beste/creatine, /beste/zink — alleen de stofnaam verschilt
  "/beste/ashwagandha::sjabloon",
  // /beste/creatine
  //   · H1 botst met /supplementen/creatine — geen eigen onderscheidend woord
  //   · Titel botst met /supplementen/creatine — geen eigen onderscheidend woord
  "/beste/creatine::intentie-botsing",
  //   · H1 is hetzelfde sjabloon als /beste/ashwagandha, /beste/vitamine-d, /beste/zink — alleen de stofnaam verschilt
  "/beste/creatine::sjabloon",
  // /beste/eiwitpoeder
  //   · Beschrijving is 110 tekens (moet 120–160 zijn)
  "/beste/eiwitpoeder::beschrijving-lengte",
  //   · H1 botst met /supplementen/eiwitpoeder — geen eigen onderscheidend woord
  "/beste/eiwitpoeder::intentie-botsing",
  // /beste/vitamine-d
  //   · H1 botst met /supplementen/vitamine-d — geen eigen onderscheidend woord
  "/beste/vitamine-d::intentie-botsing",
  //   · H1 is hetzelfde sjabloon als /beste/ashwagandha, /beste/creatine, /beste/zink — alleen de stofnaam verschilt
  "/beste/vitamine-d::sjabloon",
  //   · Titel is 67 tekens (moet 30–60 zijn)
  "/beste/vitamine-d::titel-lengte",
  // /beste/zink
  //   · H1 botst met /supplementen/zink — geen eigen onderscheidend woord
  "/beste/zink::intentie-botsing",
  //   · H1 is hetzelfde sjabloon als /beste/ashwagandha, /beste/vitamine-d, /beste/creatine — alleen de stofnaam verschilt
  "/beste/zink::sjabloon",
  //   · Titel is 65 tekens (moet 30–60 zijn)
  "/beste/zink::titel-lengte",
  // /supplementen/ashwagandha
  //   · Beschrijving is 90 tekens (moet 120–160 zijn)
  "/supplementen/ashwagandha::beschrijving-lengte",
  //   · H1 botst met /beste/ashwagandha — geen eigen onderscheidend woord
  "/supplementen/ashwagandha::intentie-botsing",
  //   · H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*
  "/supplementen/ashwagandha::rolverdeling",
  //   · Titel is hetzelfde sjabloon als /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  //   · Beschrijving is hetzelfde sjabloon als /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  //   · H1 is hetzelfde sjabloon als /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink, /supplementen/eiwitpoeder — alleen de stofnaam verschilt
  "/supplementen/ashwagandha::sjabloon",
  // /supplementen/creatine
  //   · Beschrijving is 87 tekens (moet 120–160 zijn)
  "/supplementen/creatine::beschrijving-lengte",
  //   · H1 botst met /beste/creatine — geen eigen onderscheidend woord
  //   · Titel botst met /beste/creatine — geen eigen onderscheidend woord
  "/supplementen/creatine::intentie-botsing",
  //   · H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*
  "/supplementen/creatine::rolverdeling",
  //   · Titel is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/zink — alleen de stofnaam verschilt
  //   · Beschrijving is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/zink — alleen de stofnaam verschilt
  //   · H1 is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/zink, /supplementen/eiwitpoeder — alleen de stofnaam verschilt
  "/supplementen/creatine::sjabloon",
  // /supplementen/eiwitpoeder
  //   · H1 botst met /beste/eiwitpoeder — geen eigen onderscheidend woord
  "/supplementen/eiwitpoeder::intentie-botsing",
  //   · H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*
  "/supplementen/eiwitpoeder::rolverdeling",
  //   · H1 is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  "/supplementen/eiwitpoeder::sjabloon",
  // /supplementen/melatonine
  //   · Beschrijving is 89 tekens (moet 120–160 zijn)
  "/supplementen/melatonine::beschrijving-lengte",
  //   · H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*
  "/supplementen/melatonine::rolverdeling",
  //   · Titel is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  //   · Beschrijving is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  //   · H1 is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/creatine, /supplementen/zink, /supplementen/eiwitpoeder — alleen de stofnaam verschilt
  "/supplementen/melatonine::sjabloon",
  // /supplementen/vitamine-d
  //   · Beschrijving is 89 tekens (moet 120–160 zijn)
  "/supplementen/vitamine-d::beschrijving-lengte",
  //   · H1 botst met /beste/vitamine-d — geen eigen onderscheidend woord
  "/supplementen/vitamine-d::intentie-botsing",
  //   · H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*
  "/supplementen/vitamine-d::rolverdeling",
  //   · Titel is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  //   · Beschrijving is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink — alleen de stofnaam verschilt
  //   · H1 is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/melatonine, /supplementen/creatine, /supplementen/zink, /supplementen/eiwitpoeder — alleen de stofnaam verschilt
  "/supplementen/vitamine-d::sjabloon",
  // /supplementen/zink
  //   · Beschrijving is 83 tekens (moet 120–160 zijn)
  "/supplementen/zink::beschrijving-lengte",
  //   · H1 botst met /beste/zink — geen eigen onderscheidend woord
  "/supplementen/zink::intentie-botsing",
  //   · H1 van een gidspagina gebruikt de keuzezin "past bij jou" — die hoort bij /beste/*
  "/supplementen/zink::rolverdeling",
  //   · Titel is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine — alleen de stofnaam verschilt
  //   · Beschrijving is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine — alleen de stofnaam verschilt
  //   · H1 is hetzelfde sjabloon als /supplementen/ashwagandha, /supplementen/vitamine-d, /supplementen/melatonine, /supplementen/creatine, /supplementen/eiwitpoeder — alleen de stofnaam verschilt
  "/supplementen/zink::sjabloon",
];
