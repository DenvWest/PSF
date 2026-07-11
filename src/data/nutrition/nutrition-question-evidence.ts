/**
 * Wetenschappelijke onderbouwing per voedingscheck-vraag (N1).
 * Eigen id-union — niet mixen met leefstijlcheck QuestionId.
 */

import type { EvidenceReference } from "@/data/leefstijlcheck-evidence";

export type NutritionQuestionId =
  | "vegetables"
  | "nutsSeedsLegumes"
  | "oilyFish"
  | "proteinMeals"
  | "meatLegumes"
  | "dairy"
  | "daylight"
  | "wholegrain"
  | "sugaryDrinks"
  | "b12_vegan";

export type NutritionQuestionEvidence = {
  questionId: NutritionQuestionId;
  /** Korte titel voor onderbouwing-pagina. */
  title: string;
  whyThisQuestion: string;
  scientificRationale: string[];
  answerMeaning: {
    higherAlignment: string;
    lowerAlignment: string;
  };
  strength: {
    stars: 3 | 4 | 5;
    label: string;
    rationale: string;
  };
  references: EvidenceReference[];
};

export const NUTRITION_EVIDENCE_DISCLAIMER =
  "De voedingscheck is een frequentie-inschatting op basis van zelf-gerapporteerd eetgedrag — geen medische uitspraak, geen bloedwaarde en geen individuele norm. Drempels zijn vuistregels t.o.v. algemene richtlijnen.";

export const NUTRITION_EVIDENCE_STRENGTH_DISCLAIMER =
  "Sterren meten signaalsterkte: hoe goed onderbouwd is het dat deze vraag een relevant voedingspatroon weerspiegelt? Dit is geen beoordeling van jouw gezondheid.";

const voedingscentrumRef: EvidenceReference = {
  apa: "Voedingscentrum. Schijf van Vijf — richtlijnen voor volwassenen. 2024.",
};

const gezondheidsraadRef: EvidenceReference = {
  apa: "Gezondheidsraad. Richtlijnen goede voeding 2015 — achtergronddocument. Den Haag: Gezondheidsraad; 2015.",
};

const efsaProteinRef: EvidenceReference = {
  apa: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Dietary reference values for protein. EFSA Journal. 2012.",
  doi: "10.2903/j.efsa.2012.2557",
};

const mediterraneanRef: EvidenceReference = {
  apa: "Dinu M, Pagliai G, Casini A, Sofi F. Mediterranean diet and multiple health outcomes: umbrella review. Eur J Clin Nutr. 2018.",
  doi: "10.1038/ejcn.2017.58",
  pmid: "28488692",
};

const omega3Ref: EvidenceReference = {
  apa: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for fats. EFSA Journal. 2010.",
  doi: "10.2903/j.efsa.2010.1461",
};

const magnesiumRef: EvidenceReference = {
  apa: "Gezondheidsraad. Voedingsnormen magnesium — achtergronddocument. Den Haag: Gezondheidsraad; 2012.",
};

const vitDRef: EvidenceReference = {
  apa: "Gezondheidsraad. Evaluatie van de voedingsnormen voor vitamine D. Den Haag: Gezondheidsraad; 2012.",
};

const zincRef: EvidenceReference = {
  apa: "Gezondheidsraad. Voedingsnormen zink — achtergronddocument. Den Haag: Gezondheidsraad; 2013.",
};

const fiberRef: EvidenceReference = {
  apa: "Reynolds A, Mann J, Cummings J, et al. Carbohydrate quality and human health: systematic reviews and meta-analyses. Lancet. 2019.",
  doi: "10.1016/S0140-6736(18)31809-9",
  pmid: "30638909",
};

const b12Ref: EvidenceReference = {
  apa: "Institute of Medicine. Dietary Reference Intakes for Thiamin, Riboflavin, Niacin, Vitamin B6, Folate, Vitamin B12, Pantothenic Acid, Biotin, and Choline. Washington, DC: National Academies Press; 1998.",
};

export const NUTRITION_QUESTION_EVIDENCE: NutritionQuestionEvidence[] = [
  {
    questionId: "proteinMeals",
    title: "Eiwitrijke eetmomenten",
    whyThisQuestion:
      "Hoe vaak je eiwit eet, vertelt meer over herstel en spiermassa dan één grote portie 's avonds — vooral na 40.",
    scientificRationale: [
      "Richtlijnen en reviews benadrukken voldoende eiwitinname en spreiding over meerdere maaltijden bij ouder worden en fysieke activiteit.",
      "Frequentie van eiwitmomenten is een praktische proxy wanneer je geen gram voor gram bijhoudt.",
      "De vraag helpt voedingskwaliteit en herstelgedrag concreet in kaart te brengen.",
    ],
    answerMeaning: {
      higherAlignment:
        "Meer eiwitmomenten per dag past bij patronen met aandacht voor herstel en kwalitatieve maaltijdopbouw.",
      lowerAlignment:
        "Minder eiwitmomenten wijst op een patroon waarin eiwit vooral incidenteel of laat op de dag zit.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Goede onderbouwing in richtlijnen en reviews naar ouder worden, training en herstel.",
    },
    references: [efsaProteinRef, gezondheidsraadRef, voedingscentrumRef],
  },
  {
    questionId: "meatLegumes",
    title: "Vlees, vis of peulvruchten",
    whyThisQuestion:
      "Deze bronnen leveren eiwit, ijzer, zink en B-vitaminen — een praktische indicator voor de kwaliteit van je warme maaltijden.",
    scientificRationale: [
      "Voedingsrichtlijnen adviseren gevarieerde eiwitbronnen: dierlijk en plantaardig.",
      "Peulvruchten en mager vlees/vis zijn concrete, herkenbare porties in de Schijf van Vijf.",
      "Frequentie per dag is een bruikbare proxy voor meerdere nutriënten tegelijk.",
    ],
    answerMeaning: {
      higherAlignment:
        "Meer porties per dag sluit aan bij gevarieerde eiwit- en mineraleninname via voeding.",
      lowerAlignment:
        "Minder porties kan wijzen op een eetpatroon met weinig structurele eiwit- en mineralenbronnen.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Brede ondersteuning via voedingsrichtlijnen en pattern-based reviews.",
    },
    references: [gezondheidsraadRef, voedingscentrumRef, mediterraneanRef],
  },
  {
    questionId: "oilyFish",
    title: "Vette vis",
    whyThisQuestion:
      "Vette vis is de meest directe voedingsbron van EPA en DHA — vetzuren die in richtlijnen expliciet terugkomen.",
    scientificRationale: [
      "Internationale richtlijnen adviseren regelmatige visconsumptie, waaronder vette vis.",
      "Mediterrane voedingsreviews gebruiken vis als terugkerend kwaliteitskenmerk van het patroon.",
      "Vis per week is een begrijpelijke frequentie-proxy zonder gram-logging.",
    ],
    answerMeaning: {
      higherAlignment:
        "Meer vette vis per week past bij richtlijnen voor omega-3 via voeding.",
      lowerAlignment:
        "Minder vette vis wijst op een patroon waarin EPA/DHA vooral uit andere bronnen moet komen.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Stevige ondersteuning via voedingsrichtlijnen en mediterrane pattern-reviews.",
    },
    references: [omega3Ref, mediterraneanRef, voedingscentrumRef],
  },
  {
    questionId: "vegetables",
    title: "Magnesiumrijke voeding",
    whyThisQuestion:
      "Dagelijkse groente levert onder andere magnesium, kalium en vezels — en is een kernonderdeel van de Schijf van Vijf.",
    scientificRationale: [
      "Voedingsrichtlijnen adviseren minimaal 250 g groente per dag voor volwassenen.",
      "Groente-inname correleert in populatiestudies met gezonder voedingspatroon en micronutriënt-dichtheid.",
      "Porties per dag zijn een praktische proxy voor magnesiumrijke voeding zonder dagboek.",
    ],
    answerMeaning: {
      higherAlignment:
        "Meer groenteporties per dag past bij richtlijnen en een micronutriënt-rijker patroon.",
      lowerAlignment:
        "Minder groente wijst op een patroon met minder structurele groente-inname.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Consistente ondersteuning via nationale richtlijnen en voedingspatroon-literatuur.",
    },
    references: [magnesiumRef, voedingscentrumRef, gezondheidsraadRef],
  },
  {
    questionId: "nutsSeedsLegumes",
    title: "Noten, zaden en peulvruchten",
    whyThisQuestion:
      "Noten, zaden en peulvruchten los van warme maaltijden leveren magnesium, gezonde vetten en plantaardig eiwit — een praktische proxy voor tussendoortjes en toppings.",
    scientificRationale: [
      "Voedingsrichtlijnen benoemen noten en peulvruchten als structurele bronnen van magnesium en vezels.",
      "Frequentie per week vangt gewoontes op die niet altijd in de warme-maaltijd-vraag zitten.",
      "De vraag verrijkt het magnesium-signaal naast bladgroenten en peulvruchten bij maaltijden.",
    ],
    answerMeaning: {
      higherAlignment:
        "Vaker noten, zaden of peulvruchten past bij een patroon met meer magnesiumrijke tussendoortjes.",
      lowerAlignment:
        "Minder frequentie wijst op een patroon waarin deze bronnen zelden los van maaltijden voorkomen.",
    },
    strength: {
      stars: 3,
      label: "Redelijk bewijs",
      rationale: "Onderbouwd via voedingsrichtlijnen; individuele porties variëren sterk.",
    },
    references: [magnesiumRef, voedingscentrumRef, gezondheidsraadRef],
  },
  {
    questionId: "dairy",
    title: "Zuivel",
    whyThisQuestion:
      "Zuivel levert eiwit, calcium en zink — en is voor veel mannen een vaste bron in het dagelijkse patroon.",
    scientificRationale: [
      "Voedingsrichtlijnen benoemen zuivel als bron van calcium en eiwit.",
      "Frequentie van zuivelporties helpt zink- en eiwitproxy's te verrijken naast vlees/peulvruchten.",
      "De vraag is praktisch en herkenbaar zonder grammetelling.",
    ],
    answerMeaning: {
      higherAlignment:
        "Meer zuivelporties past bij een patroon met structurele calcium- en eiwitbronnen.",
      lowerAlignment:
        "Minder zuivel kan wijzen op een patroon waarin deze bronnen bewust of onbewust worden vermeden.",
    },
    strength: {
      stars: 3,
      label: "Redelijk bewijs",
      rationale: "Onderbouwd via richtlijnen; individuele behoefte varieert sterk bij intolerantie of voorkeur.",
    },
    references: [zincRef, gezondheidsraadRef, voedingscentrumRef],
  },
  {
    questionId: "daylight",
    title: "Buiten in daglicht",
    whyThisQuestion:
      "Huid aan daglicht is de belangrijkste bron van vitamine D — in Nederland vooral relevant buiten de zomermaanden.",
    scientificRationale: [
      "Gezondheidsraad en EFSA benadrukken zonlicht als primaire vitamine-D-bron.",
      "In Nederland is huidproductie in winter beperkt; frequentie buiten is een bruikbare proxy.",
      "Daglicht heeft ook aparte waarde voor circadiaan ritme — los van vitamine D.",
    ],
    answerMeaning: {
      higherAlignment:
        "Vaker buiten met huid aan daglicht past bij richtlijnen voor vitamine-D-aanmaak.",
      lowerAlignment:
        "Minder buiten wijst op een patroon waarin vitamine D vooral via voeding moet worden gedekt.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Brede consensus in nationale richtlijnen over zonlicht en vitamine D.",
    },
    references: [vitDRef, gezondheidsraadRef],
  },
  {
    questionId: "wholegrain",
    title: "Volkoren granen",
    whyThisQuestion:
      "Volkoren levert vezels en complexe koolhydraten — een praktische indicator voor de kwaliteit van je brood- en graankeuzes.",
    scientificRationale: [
      "Gezondheidsraad adviseert volkoren producten als bron van vezels (vuistregel 30–40 g/dag).",
      "Systematische reviews tonen associaties tussen hogere vezelinname en gunstiger gezondheidsuitkomsten.",
      "Percentage volkoren is een eenvoudige proxy zonder dagboek.",
    ],
    answerMeaning: {
      higherAlignment:
        "Meer volkoren past bij richtlijnen voor vezelrijke granen en stabielere energie-inname.",
      lowerAlignment:
        "Minder volkoren wijst op een patroon met meer bewerkt wit brood/granen.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Onderbouwd via Gezondheidsraad en vezel-meta-analyses.",
    },
    references: [fiberRef, gezondheidsraadRef, voedingscentrumRef],
  },
  {
    questionId: "sugaryDrinks",
    title: "Suiker en snelle koolhydraten",
    whyThisQuestion:
      "Veel suiker of snelle koolhydraten kan energie-ondersteuning ondermijnen — frequentie helpt je patroon zichtbaar maken zonder calorie-telling.",
    scientificRationale: [
      "Voedingsrichtlijnen adviseren beperking van toegevoegde suikers en bewerkt wit brood.",
      "Frequentie van suikerhoudende dranken en snoep is een herkenbare proxy voor snelle koolhydraten.",
      "De vraag weegt negatief mee in de totaalscore — geen aparte nutriënt-band.",
    ],
    answerMeaning: {
      higherAlignment:
        "Minder suiker en snelle koolhydraten past bij stabielere energie-inname over de dag.",
      lowerAlignment:
        "Meer frequentie wijst op een patroon met meer suiker of bewerkt wit — relevant voor energie-as.",
    },
    strength: {
      stars: 3,
      label: "Redelijk bewijs",
      rationale: "Onderbouwd via richtlijnen; geen individuele energie-claim op basis van één vraag.",
    },
    references: [fiberRef, gezondheidsraadRef, voedingscentrumRef],
  },
  {
    questionId: "b12_vegan",
    title: "B12 bij veganistisch eten",
    whyThisQuestion:
      "B12 komt van nature vrijwel alleen voor in dierlijke producten — bij veganistisch eten is bewuste bronkeuze relevant.",
    scientificRationale: [
      "Internationale referentiewaarden beschrijven B12 als essentieel en vooral uit dierlijke bronnen.",
      "Verrijkte plantaardige producten zijn de gangbare aanvulling bij veganistische patronen.",
      "TODO: uitbreiden met medicatie-proxy (PPI/metformine) zodra health_flags in intake bestaan.",
    ],
    answerMeaning: {
      higherAlignment:
        "Bewuste keuze voor verrijkte bronnen past bij een veganistisch patroon met aandacht voor B12.",
      lowerAlignment:
        "Zonder verrijkte bronnen is B12-inname via voeding bij veganistisch eten waarschijnlijk beperkt.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale: "Brede consensus over B12-bronnen; individuele opname varieert.",
    },
    references: [b12Ref, gezondheidsraadRef],
  },
];

export const NUTRITION_EVIDENCE_BY_ID = Object.fromEntries(
  NUTRITION_QUESTION_EVIDENCE.map((entry) => [entry.questionId, entry]),
) as Record<NutritionQuestionId, NutritionQuestionEvidence>;

/** Volgorde op onderbouwing-pagina: kern-sliders + wholegrain + suiker + B12. */
export const NUTRITION_EVIDENCE_DISPLAY_ORDER: NutritionQuestionId[] = [
  "proteinMeals",
  "meatLegumes",
  "oilyFish",
  "vegetables",
  "nutsSeedsLegumes",
  "dairy",
  "daylight",
  "wholegrain",
  "sugaryDrinks",
  "b12_vegan",
];
