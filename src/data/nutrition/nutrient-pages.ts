import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De redactionele laag van de voedingsstofpagina's.
 *
 * ## Wat hier bewust NIET staat
 *
 * **Geen claims.** Die leest de pagina uit `approved-claims.ts` via
 * `getUsableClaims(claimKey)`. Zou de copy ze overschrijven, dan kan een pagina
 * een claim blijven voeren die daar is ingetrokken — en dat is precies het
 * soort drift dat een compliance-bron waardeloos maakt.
 *
 * **Geen drempels en geen bronnen.** Die komen uit `nutrient-routes.ts` en
 * `food-sources.ts`. Eén getal hoort op één plek te staan.
 *
 * **Geen milligrammen, geen dagtotalen, geen percentage van een ADH.** Dezelfde
 * harde grens als in `food-sources.ts` en `nutrient-rail.ts`: de band per
 * nutriënt komt uit frequentievragen, niet uit grammen. Een test leest deze
 * teksten en faalt op een mg-getal.
 *
 * Wat hier wél staat: waarom deze stof er na je dertigste toe doet, wat mensen
 * erover vragen, en de zinnen die een zoekresultaat leesbaar maken.
 */

export interface NutrientPageFaq {
  vraag: string;
  antwoord: string;
}

export interface NutrientPageCopy {
  nutrient: NutrientId;
  /** Slug in de URL — Nederlands, want de route is user-facing. */
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Eén alinea onder de H1. Antwoord-eerst: de eerste zin is het antwoord. */
  intro: string;
  /** Drie tot vier regels die de vraag beantwoorden zonder scrollen. */
  kernpunten: readonly string[];
  /** Wat er verandert na je dertigste. Geen diagnose-taal. */
  waaromNa30: readonly string[];
  faq: readonly NutrientPageFaq[];
}

export const NUTRIENT_PAGES: Record<NutrientId, NutrientPageCopy> = {
  omega3: {
    nutrient: "omega3",
    slug: "omega-3",
    h1: "Omega-3: waar het in zit en hoeveel je nodig hebt",
    metaTitle: "Omega-3: waar zit het in en hoeveel heb je nodig?",
    metaDescription:
      "Welke voeding levert EPA en DHA, hoe vaak vette vis per week, en wanneer een supplement pas logisch wordt. Met bronnen per portie.",
    intro:
      "Omega-3 haal je in bruikbare vorm vooral uit vette vis. De Gezondheidsraad houdt één portie per week aan, twee is beter. Haal je dat, dan voegt een supplement er weinig aan toe; eet je geen vis, dan is dit de enige van de vijf stoffen waar je bord nauwelijks een alternatief heeft.",
    kernpunten: [
      "Vette vis is de enige bron die EPA en DHA direct levert.",
      "Plantaardig omega-3 (ALA uit lijnzaad, walnoot) zet je lichaam maar voor enkele procenten om.",
      "Eén portie per week is de ondergrens, twee is beter.",
      "Eet je geen vis, dan is aanvulling hier eerder aan de orde dan bij de andere stoffen.",
    ],
    waaromNa30: [
      "De behoefte aan omega-3 verandert na je dertigste niet dramatisch, maar het eetpatroon van veel mensen wel: vis verdwijnt vaker van het menu dan dat het erbij komt.",
      "Wie zelden vis eet, bouwt geen voorraad op. Anders dan bij vitamine D is er geen seizoen dat het gat opvult — het is puur een kwestie van wat er op je bord ligt.",
    ],
    faq: [
      {
        vraag: "Hoe vaak moet ik vette vis eten?",
        antwoord:
          "De Gezondheidsraad houdt één portie per week aan als ondergrens; twee keer per week is beter. Dat is één boodschap per week, geen dagelijkse handeling.",
      },
      {
        vraag: "Tellen lijnzaad en walnoten mee?",
        antwoord:
          "Ze leveren ALA, een plantaardige omega-3 die je lichaam maar voor enkele procenten omzet naar EPA en DHA. Ze zijn zinvol, maar ze vervangen vette vis niet.",
      },
      {
        vraag: "Is gekweekte zalm net zo goed als wilde?",
        antwoord:
          "Gekweekte zalm levert doorgaans minder EPA en DHA per portie dan wilde, maar nog altijd ruim. Het verschil is kleiner dan het verschil tussen wél en geen vis eten.",
      },
    ],
  },

  protein: {
    nutrient: "protein",
    slug: "eiwit",
    h1: "Eiwit: waar het in zit en hoeveel je nodig hebt",
    metaTitle: "Eiwit: waar zit het in en hoeveel heb je nodig?",
    metaDescription:
      "Welke voeding levert eiwit, waarom de verdeling over de dag telt, en wanneer een eiwitpoeder ergens over gaat. Met bronnen per portie.",
    intro:
      "Eiwit is de enige van de vijf stoffen waar de verdeling over de dag net zo veel uitmaakt als het totaal. Drie eiwitrijke eetmomenten werkt beter dan één grote portie 's avonds — je lichaam slaat eiwit niet op voor later.",
    kernpunten: [
      "Drie eiwitrijke eetmomenten per dag is de vuistregel, niet één grote portie.",
      "Het ontbijt is bij de meeste mensen het moment dat het eiwit mist.",
      "Vlees, vis, zuivel, peulvruchten en eieren zijn de dragende bronnen.",
      "Een eiwitpoeder is een gemak, geen noodzaak — het lost hetzelfde op als een extra portie kwark.",
    ],
    waaromNa30: [
      "Na je dertigste reageert spieraanmaak minder sterk op dezelfde hoeveelheid eiwit. Dat heet anabole resistentie, en het is de reden dat de verdeling over de dag zwaarder gaat wegen.",
      "Wie traint en het herstel voelt achterblijven, komt vaak uit bij eiwit — maar net zo vaak bij slaap en trainingsbelasting. Eiwit is één knop van drie.",
    ],
    faq: [
      {
        vraag: "Hoeveel eiwit heb ik per dag nodig?",
        antwoord:
          "Dat hangt af van je gewicht en hoeveel je beweegt. Wij rekenen niet met één getal voor iedereen; de voedingscheck rekent een persoonlijke band uit op basis van je gewicht en je beweegdagen.",
      },
      {
        vraag: "Heb ik eiwitpoeder nodig?",
        antwoord:
          "Alleen als het je helpt de eetmomenten te halen. Een poeder doet niets wat kwark, eieren of peulvruchten niet ook doen — het is sneller, meer niet.",
      },
      {
        vraag: "Waarom is het ontbijt zo vaak het probleem?",
        antwoord:
          "Een Nederlands ontbijt is doorgaans koolhydraatrijk en eiwitarm. Dat maakt het het makkelijkste moment om iets te veranderen zonder je hele dag om te gooien.",
      },
    ],
  },

  vitamin_d: {
    nutrient: "vitamin_d",
    slug: "vitamine-d",
    h1: "Vitamine D: waar het vandaan komt en hoeveel je nodig hebt",
    metaTitle: "Vitamine D: waar komt het vandaan en hoeveel heb je nodig?",
    metaDescription:
      "Waarom zon de hoofdbron is, welke voeding meetelt, en waarom het Nederlandse winterhalfjaar hier een uitzondering maakt.",
    intro:
      "Vitamine D is de enige van de vijf die je grotendeels zelf aanmaakt, in je huid, onder invloed van zonlicht. Voeding levert een bijrol. Dat maakt hem ook de enige waarbij het seizoen bepaalt of je route openstaat: van oktober tot maart komt er in Nederland vrijwel geen relevante huidaanmaak op gang.",
    kernpunten: [
      "Zon is de hoofdbron; voeding levert een bijrol.",
      "Van oktober tot maart maakt de zon in Nederland te weinig aan — dat is geen persoonlijk tekort maar een breedtegraad.",
      "Vette vis, eieren en verrijkte producten zijn de bruikbare voedingsbronnen.",
      "Dit is de enige van de vijf waar een bloedbepaling de schatting echt harder maakt.",
    ],
    waaromNa30: [
      "De aanmaak in de huid neemt met de jaren af bij dezelfde hoeveelheid zon. Dat gaat geleidelijk en je merkt er niets van; het verschuift alleen wat er nodig is om op dezelfde plek uit te komen.",
      "Het Nederlandse winterhalfjaar doet de rest. Voor wie daar bovenop weinig buiten komt of een bedekkende kledingstijl heeft, stapelen die twee.",
    ],
    faq: [
      {
        vraag: "Hoeveel zon heb ik nodig?",
        antwoord:
          "Als vuistregel: dagelijks een kwartier buiten met onbedekte huid, in de maanden dat de zon hoog genoeg staat. Tussen oktober en maart helpt dat in Nederland niet meer.",
      },
      {
        vraag: "Kan ik vitamine D uit voeding halen?",
        antwoord:
          "Deels. Vette vis, eieren en verrijkte producten dragen bij, maar voeding alleen komt bij de meeste mensen niet in de buurt van wat de zon in de zomer doet.",
      },
      {
        vraag: "Is een bloedtest zinvol?",
        antwoord:
          "Bij vitamine D wel — dit is de enige van de vijf waar een bepaling de schatting merkbaar harder maakt. Bespreek dat met je huisarts.",
      },
    ],
  },

  magnesium: {
    nutrient: "magnesium",
    slug: "magnesium",
    h1: "Magnesium: waar het in zit en hoe je eraan komt",
    metaTitle: "Magnesium: waar zit het in en hoe kom je eraan?",
    metaDescription:
      "Welke voeding magnesium levert, waarom de opname net zo veel uitmaakt als het gehalte, en wanneer aanvullen ergens over gaat.",
    intro:
      "Magnesium zit in noten, peulvruchten, volkoren en bladgroente — en juist bij deze stof bepaalt de opname minstens zo veel als het gehalte. Fytaat in diezelfde bronnen bindt een deel van het magnesium, waardoor twee keer hetzelfde getal op papier niet hetzelfde is op je bord.",
    kernpunten: [
      "Noten, peulvruchten, volkoren en bladgroente zijn de dragende bronnen.",
      "Fytaat in plantaardige bronnen remt de opname — het gehalte alleen zegt niet genoeg.",
      "Er is geen eenvoudige test die je magnesiumstatus betrouwbaar afleest.",
      "Wij meten dit met je plantporties, niet met milligrammen — dat is een benadering en we noemen hem zo.",
    ],
    waaromNa30: [
      "De opname via de darm neemt met de jaren wat af, terwijl de behoefte door stress en herstel gelijk blijft of stijgt. Dat is geen dramatische verschuiving, maar hij loopt de kant op die je niet wilt.",
      "Magnesium duikt op in verhalen over slaap, spierkramp en spanning. Dat het bij die dingen betrokken is, betekent niet dat aanvullen ze oplost — daarvoor moet er eerst iets missen.",
    ],
    faq: [
      {
        vraag: "Hoe weet ik of ik te weinig magnesium binnenkrijg?",
        antwoord:
          "Dat is lastiger dan het klinkt. Er is geen eenvoudige bloedtest die je status betrouwbaar afleest, en wij meten het met de frequentie waarin je de bronnen eet. Dat geeft een richting, geen uitslag.",
      },
      {
        vraag: "Welke magnesiumvorm kan ik het beste nemen?",
        antwoord:
          "Dat hangt af van waarvoor je hem wilt. De vormen verschillen in opname en in waar ze in onderzoek voor gebruikt zijn; de supplementgids zet ze naast elkaar.",
      },
      {
        vraag: "Haalt volkoren brood mijn magnesium omhoog?",
        antwoord:
          "Het draagt bij, maar het fytaat in volkoren bindt tegelijk een deel van het magnesium. Variatie over meerdere bronnen werkt beter dan één bron opvoeren.",
      },
    ],
  },

  zinc: {
    nutrient: "zinc",
    slug: "zink",
    h1: "Zink: waar het in zit en hoe je eraan komt",
    metaTitle: "Zink: waar zit het in en hoe kom je eraan?",
    metaDescription:
      "Welke voeding zink levert, waarom dierlijke bronnen beter opnemen dan plantaardige, en wanneer aanvullen zinvol kan zijn.",
    intro:
      "Zink zit in vlees, vis, peulvruchten en zuivel. Net als bij magnesium bepaalt de opname veel: de verhouding tussen fytaat en zink in een máaltijd doet meer dan het gehalte van één product. Wie vooral plantaardig eet, haalt dus minder uit hetzelfde getal.",
    kernpunten: [
      "Vlees, vis, schaaldieren, peulvruchten en zuivel zijn de dragende bronnen.",
      "Dierlijke bronnen nemen beter op dan plantaardige — fytaat is opnieuw de reden.",
      "De fytaat-zinkverhouding is een eigenschap van de maaltijd, niet van één product.",
      "Wij meten dit met je porties, niet met milligrammen.",
    ],
    waaromNa30: [
      "Zink komt vaak ter sprake rond weerstand, herstel en testosteron. Bij een daadwerkelijk tekort doet aanvullen daar iets; zonder tekort is er weinig reden om te verwachten dat het iets verschuift.",
      "Wie plantaardiger is gaan eten zonder daar de bronnen op aan te passen, is de groep waar dit het vaakst speelt.",
    ],
    faq: [
      {
        vraag: "Krijg ik genoeg zink binnen als ik vegetarisch eet?",
        antwoord:
          "Het kan, maar het vraagt meer aandacht: plantaardige bronnen leveren zink dat slechter opneemt. Peulvruchten weken of kiemen helpt, en variatie over meerdere bronnen ook.",
      },
      {
        vraag: "Helpt zink bij mijn weerstand?",
        antwoord:
          "Zink draagt bij aan de normale werking van het afweersysteem — dat is een Europees goedgekeurde claim, en hij geldt bij voldoende inname. Meer dan voldoende maakt het niet beter.",
      },
      {
        vraag: "Heeft zink met testosteron te maken?",
        antwoord:
          "Zink draagt bij aan het behoud van een normaal testosterongehalte in het bloed. Dat zegt iets over normaal houden, niet over verhogen.",
      },
    ],
  },
};

export const NUTRIENT_PAGE_SLUGS = Object.values(NUTRIENT_PAGES).map(
  (page) => page.slug,
);

export function nutrientPageBySlug(slug: string): NutrientPageCopy | undefined {
  return Object.values(NUTRIENT_PAGES).find((page) => page.slug === slug);
}
