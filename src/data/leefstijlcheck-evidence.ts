import type { QuestionId } from "@/data/intake-questions";

export type EvidenceStrength = 3 | 4 | 5;

export type EvidenceReference = {
  apa: string;
  doi?: string;
  pmid?: string;
};

export type QuestionEvidence = {
  questionId: QuestionId;
  whyThisQuestion: string;
  scientificRationale: string[];
  answerMeaning: {
    higherAlignment: string;
    lowerAlignment: string;
  };
  strength: {
    stars: EvidenceStrength;
    label: string;
    rationale: string;
  };
  references: EvidenceReference[];
};

export type EvidenceTheme =
  | "voeding"
  | "beweging"
  | "slaap"
  | "stress"
  | "motivatie"
  | "sociale-verbinding"
  | "mediterrane-leefstijl"
  | "gedragsverandering";

export const LEEFSTIJLCHECK_EVIDENCE_PILLARS: string[] = [
  "Mediterrane leefstijl als breed leefstijlpatroon (voeding, ritme, beweging, herstel en sociale context).",
  "Self-Determination Theory (autonomie, competentie en verbondenheid) voor duurzame gedragsverandering.",
  "Leefstijlwetenschap met prioriteit voor umbrella reviews, meta-analyses, systematische reviews en internationale richtlijnen.",
  "Gedragsbehoud via kleine haalbare stappen, zelfregulatie en gewoontevorming.",
];

export const LEEFSTIJLCHECK_INTERPRETATION_NOTES: string[] = [
  "Resultaten zijn geen medische diagnose en geen gezondheidsvoorspelling.",
  "De score laat zien in welke mate jouw leefstijlpatroon aansluit bij wetenschappelijk onderzochte leefstijlprincipes.",
  "Interpretatie gebeurt op leefstijlpatronen, niet op ziekten of individuele medische risico's.",
  "Uitkomsten zijn bedoeld voor bewustwording, prioritering en duurzame gedragsverandering in kleine stappen.",
];

export const LEEFSTIJLCHECK_TRANSPARANTIE_NOTES: string[] = [
  "Bronnen worden periodiek herzien door nieuwe reviews en richtlijnen te screenen op kwaliteit en relevantie.",
  "Nieuwe studies worden alleen toegevoegd als methodologische kwaliteit en toepasbaarheid voldoende zijn.",
  "Bij belangrijke nieuwe evidence kan de onderbouwingstekst en sterkteclassificatie worden geactualiseerd.",
];

const sleepRefs: EvidenceReference[] = [
  {
    apa: "Watson NF, Badr MS, Belenky G, et al. Recommended Amount of Sleep for a Healthy Adult: A Joint Consensus Statement. Sleep. 2015.",
    doi: "10.5665/sleep.4716",
    pmid: "25979105",
  },
  {
    apa: "Hirshkowitz M, Whiton K, Albert SM, et al. National Sleep Foundation's sleep time duration recommendations. Sleep Health. 2015.",
    doi: "10.1016/j.sleh.2014.12.010",
    pmid: "29073412",
  },
  {
    apa: "Baglioni C, Battagliese G, Feige B, et al. Insomnia as a predictor of depression: a meta-analytic evaluation. J Affect Disord. 2011.",
    doi: "10.1016/j.jad.2010.12.014",
    pmid: "21300408",
  },
  {
    apa: "Trauer JM, Qian MY, Doyle JS, et al. Cognitive Behavioral Therapy for Chronic Insomnia: A Systematic Review and Meta-analysis. Ann Intern Med. 2015.",
    doi: "10.7326/M14-2841",
    pmid: "26054060",
  },
  {
    apa: "Cappuccio FP, D'Elia L, Strazzullo P, Miller MA. Sleep duration and all-cause mortality: a systematic review and meta-analysis. Sleep. 2010.",
    doi: "10.1093/sleep/33.5.585",
    pmid: "20469800",
  },
];

const stressRefs: EvidenceReference[] = [
  {
    apa: "Liu Y, Wang Z, Lu S, et al. The effects of mindfulness on stress and burnout among healthcare professionals: meta-analysis. Psychol Health Med. 2023.",
    doi: "10.1080/13548506.2022.2104364",
  },
  {
    apa: "Pascoe MC, Thompson DR, Jenkins ZM, Ski CF. Mindfulness mediates the physiological markers of stress: Systematic review and meta-analysis. J Psychiatr Res. 2017.",
    doi: "10.1016/j.jpsychires.2017.08.004",
    pmid: "28863392",
  },
  {
    apa: "Richardson KM, Rothstein HR. Effects of occupational stress management intervention programs: a meta-analysis. J Occup Health Psychol. 2008.",
    doi: "10.1037/1076-8998.13.1.69",
    pmid: "18211170",
  },
  {
    apa: "Epel ES, Crosswell AD, Mayer SE, et al. More than a feeling: A unified view of stress measurement. Nat Rev Neurosci. 2018.",
    doi: "10.1038/s41583-018-0094-7",
    pmid: "30546074",
  },
  {
    apa: "WHO. Guidelines on mental health at work. World Health Organization. 2022.",
  },
];

const movementRefs: EvidenceReference[] = [
  {
    apa: "Bull FC, Al-Ansari SS, Biddle S, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020.",
    doi: "10.1136/bjsports-2020-102955",
    pmid: "33239350",
  },
  {
    apa: "Warburton DER, Bredin SSD. Health benefits of physical activity: a systematic review of current systematic reviews. Curr Opin Cardiol. 2017.",
    doi: "10.1097/HCO.0000000000000437",
    pmid: "28708630",
  },
  {
    apa: "Panza GA, Taylor BA, MacDonald HV, et al. Can exercise improve sleep quality? A systematic review and meta-analysis. Sleep Med Rev. 2019.",
    doi: "10.1016/j.smrv.2018.08.003",
    pmid: "30340935",
  },
  {
    apa: "Grgic J, Schoenfeld BJ, Davies TB, et al. Effect of resistance training frequency on gains in muscular strength: a systematic review and meta-analysis. Sports Med. 2018.",
    doi: "10.1007/s40279-018-0872-x",
    pmid: "29508273",
  },
  {
    apa: "Stamatakis E, Ekelund U, Ding D, et al. Is the time right for quantitative public health guidelines on sitting? A narrative review. Br J Sports Med. 2019.",
    doi: "10.1136/bjsports-2018-099131",
    pmid: "29739785",
  },
];

const nutritionRefs: EvidenceReference[] = [
  {
    apa: "Dinu M, Pagliai G, Casini A, Sofi F. Mediterranean diet and multiple health outcomes: umbrella review. Eur J Clin Nutr. 2018.",
    doi: "10.1038/ejcn.2017.58",
    pmid: "28488692",
  },
  {
    apa: "Estruch R, Ros E, Salas-Salvado J, et al. Primary prevention of cardiovascular disease with a Mediterranean diet. N Engl J Med. 2018.",
    doi: "10.1056/NEJMoa1800389",
    pmid: "29897866",
  },
  {
    apa: "Schwingshackl L, Hoffmann G. Mediterranean dietary pattern and risk of mortality: a systematic review and meta-analysis. Nutrients. 2014.",
    doi: "10.3390/nu6115224",
    pmid: "25394358",
  },
  {
    apa: "Reynolds A, Mann J, Cummings J, et al. Carbohydrate quality and human health: systematic reviews and meta-analyses. Lancet. 2019.",
    doi: "10.1016/S0140-6736(18)31809-9",
    pmid: "30638909",
  },
  {
    apa: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Dietary reference values for protein. EFSA Journal. 2012.",
    doi: "10.2903/j.efsa.2012.2557",
  },
];

const behaviorRefs: EvidenceReference[] = [
  {
    apa: "Deci EL, Ryan RM. Self-determination theory: A macrotheory of human motivation, development, and health. Can Psychol. 2008.",
    doi: "10.1037/a0012801",
  },
  {
    apa: "Ryan RM, Deci EL. Self-determination theory and the facilitation of intrinsic motivation. Am Psychol. 2000.",
    doi: "10.1037/0003-066X.55.1.68",
    pmid: "11392867",
  },
  {
    apa: "Ntoumanis N, Ng JYY, Prestwich A, et al. A meta-analysis of self-determination theory-informed intervention studies. Health Psychol Rev. 2021.",
    doi: "10.1080/17437199.2020.1718529",
    pmid: "32064938",
  },
  {
    apa: "Lally P, van Jaarsveld CHM, Potts HWW, Wardle J. How are habits formed: Modelling habit formation in the real world. Eur J Soc Psychol. 2010.",
    doi: "10.1002/ejsp.674",
  },
  {
    apa: "Michie S, Richardson M, Johnston M, et al. The Behavior Change Technique Taxonomy (v1). Ann Behav Med. 2013.",
    doi: "10.1007/s12160-013-9486-6",
    pmid: "23512568",
  },
];

const alcoholDaylightRefs: EvidenceReference[] = [
  {
    apa: "Wood AM, Kaptoge S, Butterworth AS, et al. Risk thresholds for alcohol consumption: combined analysis of individual-participant data. Lancet. 2018.",
    doi: "10.1016/S0140-6736(18)30134-X",
    pmid: "29676281",
  },
  {
    apa: "Stockwell T, Zhao J, Panwar S, et al. Do moderate drinkers have reduced mortality risk? A systematic review and meta-analysis. J Stud Alcohol Drugs. 2016.",
    doi: "10.15288/jsad.2016.77.185",
    pmid: "26997174",
  },
  {
    apa: "World Health Organization. No level of alcohol consumption is safe for our health. WHO statement, 2023.",
  },
  {
    apa: "Khalsa SBS, Jewett ME, Cajochen C, Czeisler CA. A phase response curve to single bright light pulses in humans. J Physiol. 2003.",
    doi: "10.1113/jphysiol.2003.040477",
    pmid: "12717008",
  },
  {
    apa: "Riemersma-van der Lek RF, Swaab DF, Twisk J, et al. Effect of bright light and melatonin on cognitive and sleep function in elderly people. JAMA. 2008.",
    doi: "10.1001/jama.299.22.2642",
    pmid: "18544724",
  },
];

export const LEEFSTIJLCHECK_QUESTION_EVIDENCE: QuestionEvidence[] = [
  {
    questionId: "SLP_QUAL",
    whyThisQuestion:
      "Slaapkwaliteit is een kernindicator van herstel en dagelijks functioneren binnen leefstijlwetenschap.",
    scientificRationale: [
      "Internationale slaapconsensus beschrijft ervaren slaapkwaliteit als relevant leefstijlsignaal naast slaapduur.",
      "Systematische reviews tonen dat stabiele slaapkwaliteit samenhangt met beter energieritme, stemming en dagelijks functioneren.",
      "In leefstijlbegeleiding is slaapkwaliteit bruikbaar om prioriteiten te kiezen zonder medische diagnose te stellen.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij een herstelgericht ritme en past binnen leefstijlpatronen met consistente rust.",
      lowerAlignment:
        "Een lager antwoord wordt vaker gezien binnen leefstijlpatronen met verstoorde rust en minder stabiele dagenergie.",
    },
    strength: {
      stars: 5,
      label: "Zeer sterk bewijs",
      rationale:
        "Meerdere richtlijnen en meta-analyses ondersteunen slaapkwaliteit als robuust leefstijlconstruct.",
    },
    references: sleepRefs,
  },
  {
    questionId: "SLP_CONS",
    whyThisQuestion:
      "Slaapregulariteit ondersteunt de biologische klok en helpt leefstijlgedrag over de dag te stabiliseren.",
    scientificRationale: [
      "Chronobiologie laat zien dat vaste bed- en waaktijden bijdragen aan stabiele circadiane afstemming.",
      "Reviews tonen dat onregelmatige slaappatronen vaak samengaan met minder gunstige leefstijlgewoonten.",
      "Ritmevragen zijn praktisch inzetbaar voor gedragssturing in kleine haalbare stappen.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen een regelmatiger dag-nachtritme en sluit meer aan bij leefstijlpatronen met voorspelbare routines.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor een wisselend ritme, wat vaak samengaat met minder consistente leefstijlkeuzes.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Breed gedragen in slaap- en circadiane literatuur met consistente associaties in meerdere populaties.",
    },
    references: sleepRefs,
  },
  {
    questionId: "SLP_ONSET",
    whyThisQuestion:
      "Inslapen weerspiegelt hoe goed spanning, prikkels en dagritme op elkaar aansluiten.",
    scientificRationale: [
      "In slaapliteratuur is sleep onset latency een standaardmaat voor slaapcontinuiteit en routinekwaliteit.",
      "Gedragsinterventies zoals stimuluscontrole en slaaphygiëne laten in meta-analyses verbetering zien op inslaappatronen.",
      "De maat is praktisch en begrijpelijk in leefstijlcoaching.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij rustgevende avondroutines en een ritme dat past binnen herstelgericht gedrag.",
      lowerAlignment:
        "Een lager antwoord wordt vaak gezien binnen leefstijlpatronen met meer avonddrukte, onregelmaat of mentale activatie.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Gestandaardiseerde uitkomstmaat met consistente bevindingen in klinische en leefstijlcontext.",
    },
    references: sleepRefs,
  },
  {
    questionId: "SLP_WAKE",
    whyThisQuestion:
      "Nachtelijk ontwaken zegt iets over slaapcontinuiteit en de mate van nachtelijk herstel.",
    scientificRationale: [
      "Slaaponderbrekingen worden in richtlijnen meegenomen als kernonderdeel van slaapkwaliteit.",
      "Systematische reviews koppelen gefragmenteerde slaap aan minder gunstig dagelijks functioneren.",
      "Binnen leefstijlbegeleiding helpt deze vraag om avond- en herstelfactoren concreet te maken.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen meer aaneengesloten slaap en sluit aan bij patronen met stabieler nachtelijk herstel.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor meer slaapfragmentatie en wordt vaak gezien bij minder consistente herstelroutines.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Consistente ondersteuning uit slaapreviews en richtlijnkaders.",
    },
    references: sleepRefs,
  },
  {
    questionId: "NRG_PATN",
    whyThisQuestion:
      "Dagenergie laat zien hoe slaap, voeding, beweging en stress in de praktijk samen uitpakken.",
    scientificRationale: [
      "Leefstijlonderzoek gebruikt ervaren energie als functionele uitkomst van meerdere gedragsdomeinen.",
      "Systematische reviews naar fysieke activiteit, slaap en voeding tonen associaties met energiestabiliteit.",
      "In coaching is energieritme een bruikbare samenvattende indicator voor prioritering.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij een gebalanceerd dagpatroon en past binnen stabiele leefstijlroutines.",
      lowerAlignment:
        "Een lager antwoord wordt vaak gezien binnen patronen met grotere schommelingen in ritme, herstel of dagstructuur.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Meerdere domeinoverstijgende reviews ondersteunen energie als relevante leefstijluitkomst.",
    },
    references: [...movementRefs.slice(0, 2), ...sleepRefs.slice(0, 2), behaviorRefs[3]],
  },
  {
    questionId: "NRG_DEP",
    whyThisQuestion:
      "Afhankelijkheid van stimulanten of snelle oppeppers geeft inzicht in energiemanagement binnen de leefstijl.",
    scientificRationale: [
      "Gedragsliteratuur beschrijft dat compenserend gedrag (veel cafeine/suiker/alcohol) vaak past bij onstabiele routines.",
      "Voedings- en gedragsreviews tonen dat energiemanagement samenhangt met regelmaat, slaap en maaltijdkwaliteit.",
      "Deze vraag helpt onderscheid maken tussen structurele en tijdelijke energieaanpak.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen meer intrinsiek energiemanagement en sluit aan bij stabielere dagelijkse gewoonten.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor externe oppepmomenten en wordt vaker gezien bij minder consistente basisroutines.",
    },
    strength: {
      stars: 3,
      label: "Redelijk bewijs",
      rationale:
        "Goede gedragsmatige plausibiliteit, met vooral observationeel bewijs en minder directe RCT-ketens.",
    },
    references: [...behaviorRefs, nutritionRefs[3]],
  },
  {
    questionId: "STR_FREQ",
    whyThisQuestion:
      "Ervaren stressfrequentie is een centrale leefstijlfactor die gedrag, herstel en volhoudbaarheid beinvloedt.",
    scientificRationale: [
      "Meta-analyses en richtlijnen tonen dat stressmanagement samenhangt met dagelijks functioneren en gedragsbehoud.",
      "Stressfrequentie is in leefstijlsettings een bruikbare indicator voor herstelruimte en prioriteitsstelling.",
      "Niet bedoeld als diagnose, wel als context voor leefstijlkeuzes.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij leefstijlpatronen met voldoende herstelmomenten en stressregulatie.",
      lowerAlignment:
        "Een lager antwoord wordt vaak gezien binnen patronen met oplopende mentale belasting en minder hersteltijd.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Steun uit systematische reviews en internationale arbeids- en mentale gezondheidsrichtlijnen.",
    },
    references: stressRefs,
  },
  {
    questionId: "STR_RCV",
    whyThisQuestion:
      "Herstellen na drukte is essentieel voor duurzame prestaties en leefstijlgedrag op lange termijn.",
    scientificRationale: [
      "Stress-herstelmodellen benadrukken dat herstelcapaciteit belangrijker is dan incidentele piekbelasting.",
      "Meta-analyses naar mindfulness, ontspanning en zelfregulatie laten gunstige effecten op ervaren herstel zien.",
      "De vraag sluit aan bij gedragsbehoud en volhoudbaarheid van leefstijlstappen.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen leefstijlpatronen met actieve herstelstrategien en betere zelfregulatie.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor opstapeling van belasting en minder effectieve herstelroutines.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Consistent bewijs uit stressinterventies en gedragswetenschappelijke kaders.",
    },
    references: [...stressRefs.slice(0, 4), behaviorRefs[4]],
  },
  {
    questionId: "NUT_O3",
    whyThisQuestion:
      "Vette visinname is een praktische indicator voor voedingskwaliteit binnen mediterrane leefstijlpatronen.",
    scientificRationale: [
      "Mediterrane voedingsreviews gebruiken visconsumptie als terugkerend onderdeel van het patroon.",
      "Internationale richtlijnen adviseren regelmatige visconsumptie als onderdeel van een gevarieerd voedingspatroon.",
      "In leefstijlchecks is het een concrete, begrijpelijke proxy voor patroonkwaliteit.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij mediterrane voedingsprincipes en past binnen gevarieerde eetpatronen.",
      lowerAlignment:
        "Een lager antwoord wordt vaker gezien binnen minder visrijke patronen en minder aansluiting op mediterrane principes.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Stevige ondersteuning vanuit voedingsrichtlijnen en pattern-based meta-analyses.",
    },
    references: nutritionRefs,
  },
  {
    questionId: "NUT_PROT",
    whyThisQuestion:
      "Regelmatige eiwitinname ondersteunt behoud van spierfunctie en herstel binnen een actieve leefstijl.",
    scientificRationale: [
      "Richtlijnen en reviews benadrukken voldoende eiwitinname, vooral bij ouder worden en fysieke activiteit.",
      "Verdeling van eiwit over de dag wordt in leefstijl- en sportvoedingsliteratuur relevant gevonden.",
      "De vraag helpt voedingskwaliteit en herstelgedrag praktisch in kaart te brengen.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen leefstijlpatronen met meer aandacht voor herstel en kwalitatieve maaltijdopbouw.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor minder structurele eiwitmomenten en minder doelgerichte voedingsplanning.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Goede onderbouwing in richtlijnen en systematische reviews naar ouder worden, training en herstel.",
    },
    references: [...nutritionRefs.slice(2, 5), movementRefs[3], behaviorRefs[3]],
  },
  {
    questionId: "MOV_STR",
    whyThisQuestion:
      "Krachttraining is een kerncomponent van functionele fitheid en veerkracht in de volwassen levensfase.",
    scientificRationale: [
      "WHO-richtlijnen adviseren spierversterkende activiteit als vast onderdeel van weekbeweging.",
      "Meta-analyses tonen consistente verbeteringen in kracht, functionele capaciteit en zelfredzaamheid.",
      "De vraag maakt direct zichtbaar of deze pijler aanwezig is in de routine.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij leefstijlpatronen met structurele belastbaarheid en functioneel onderhoud.",
      lowerAlignment:
        "Een lager antwoord past vaker binnen patronen met minder spierprikkel en minder planmatige trainingsroutine.",
    },
    strength: {
      stars: 5,
      label: "Zeer sterk bewijs",
      rationale:
        "Internationale richtlijnen en veel meta-analyses ondersteunen deze gedragscomponent.",
    },
    references: movementRefs,
  },
  {
    questionId: "MOV_CARD",
    whyThisQuestion:
      "Cardio-activiteit geeft inzicht in aerobe belasting en dagelijke bewegingsdosis.",
    scientificRationale: [
      "WHO-richtlijnen beschrijven wekelijkse matig-intensieve tot intensieve activiteit als basis voor fitheid.",
      "Meta-analyses tonen dat meer cardiorespiratoire activiteit samenhangt met betere functionele uitkomsten.",
      "Frequentievraag is eenvoudig inzetbaar voor monitoring en gedragsdoelen.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen leefstijlpatronen met regelmatige aerobe prikkel en meer beweegritme.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor minder frequente aerobe activiteit en minder opgebouwde routine.",
    },
    strength: {
      stars: 5,
      label: "Zeer sterk bewijs",
      rationale:
        "Zeer brede en consistente onderbouwing in richtlijnen en meta-analyses.",
    },
    references: movementRefs,
  },
  {
    questionId: "RCV_PHYS",
    whyThisQuestion:
      "Ervaren fysiek herstel na belasting laat zien hoe belasting en herstel in balans zijn.",
    scientificRationale: [
      "Herstelwetenschap benadrukt dat adaptatie plaatsvindt in de combinatie van prikkel, rust en slaap.",
      "Reviews tonen dat herstelbeleving samenhangt met slaapkwaliteit, trainingsbelasting en routine.",
      "Binnen leefstijlcoaching helpt deze vraag om overbelasting en onderherstel gedragmatig te signaleren.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij leefstijlpatronen waarin belasting en herstel beter op elkaar zijn afgestemd.",
      lowerAlignment:
        "Een lager antwoord wordt vaker gezien binnen patronen met minder hersteltijd of minder ondersteunende routines.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Goede ondersteuning vanuit sport- en slaapreviews, vooral als patroonindicator.",
    },
    references: [...movementRefs.slice(0, 4), sleepRefs[0]],
  },
  {
    questionId: "LIF_ALC",
    whyThisQuestion:
      "Alcoholpatroon hoort bij leefstijlgedrag omdat het samenhangt met slaap, herstel en dagelijkse routinekwaliteit.",
    scientificRationale: [
      "Grote cohortanalyses en systematische reviews tonen dosis-responsrelaties bij hogere alcoholinname.",
      "Publieke gezondheidsinstanties benadrukken terughoudendheid met alcohol in leefstijlcontext.",
      "Frequentie van zwaardere avonden is praktisch te monitoren als leefstijlgedrag.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord past binnen leefstijlpatronen met minder verstoring van slaap en herstelroutines.",
      lowerAlignment:
        "Een lager antwoord is kenmerkend voor patronen met vaker alcoholpieken, wat minder past binnen herstelgericht gedrag.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Robuuste cohort- en reviewliteratuur, aangevuld met consistente publieke richtlijnboodschap.",
    },
    references: alcoholDaylightRefs,
  },
  {
    questionId: "LIF_SUN",
    whyThisQuestion:
      "Buitenlicht overdag ondersteunt dag-nachtritme en sluit aan bij leefstijlprincipes rond slaap en energie.",
    scientificRationale: [
      "Chronobiologische studies laten zien dat lichttiming een belangrijke zeitgeber is voor circadiane afstemming.",
      "Interventiestudies met lichtblootstelling tonen effecten op slaap-waakritme en dagalertheid.",
      "Buitenlicht is een concrete leefstijlinterventie die eenvoudig te operationaliseren is.",
    ],
    answerMeaning: {
      higherAlignment:
        "Een hoger antwoord sluit meer aan bij ritmeondersteunende leefstijlpatronen met dagelijkse lichtankers.",
      lowerAlignment:
        "Een lager antwoord wordt vaker gezien binnen patronen met minder daglichtblootstelling en minder stabiele ritmes.",
    },
    strength: {
      stars: 4,
      label: "Sterk bewijs",
      rationale:
        "Consistente circadiane evidence en praktische vertaling in gedragsinterventies.",
    },
    references: alcoholDaylightRefs,
  },
];

export const LEEFSTIJLCHECK_REFERENCE_LIBRARY: Record<
  EvidenceTheme,
  EvidenceReference[]
> = {
  voeding: nutritionRefs,
  beweging: movementRefs,
  slaap: sleepRefs,
  stress: stressRefs,
  motivatie: behaviorRefs,
  "sociale-verbinding": [
    {
      apa: "Holt-Lunstad J, Smith TB, Baker M, et al. Loneliness and social isolation as risk factors: meta-analytic review. Perspect Psychol Sci. 2015.",
      doi: "10.1177/1745691614568352",
      pmid: "25910392",
    },
    {
      apa: "Santini ZI, Koyanagi A, Tyrovolas S, et al. Social relationships and depression: systematic review and meta-analysis. J Affect Disord. 2015.",
      doi: "10.1016/j.jad.2014.12.049",
      pmid: "25594509",
    },
    {
      apa: "Umberson D, Montez JK. Social relationships and health: a flashpoint for health policy. J Health Soc Behav. 2010.",
      doi: "10.1177/0022146510383501",
      pmid: "20943583",
    },
    {
      apa: "Nielsen L, Meilstrup C, Nelausen MK, et al. Promotion of social and emotional competence: a meta-analysis. Educ Res Rev. 2015.",
      doi: "10.1016/j.edurev.2015.02.003",
    },
    {
      apa: "Berkman LF, Krishna A. Social network epidemiology. In: Social Epidemiology. 2014.",
    },
  ],
  "mediterrane-leefstijl": [
    ...nutritionRefs,
    {
      apa: "Sofi F, Macchi C, Abbate R, et al. Mediterranean diet and health status: updated meta-analysis. BMJ Open. 2014.",
      doi: "10.1136/bmjopen-2013-003143",
      pmid: "24502945",
    },
  ],
  gedragsverandering: behaviorRefs,
};

export const LEEFSTIJLCHECK_EVIDENCE_BY_ID: Record<QuestionId, QuestionEvidence> =
  LEEFSTIJLCHECK_QUESTION_EVIDENCE.reduce(
    (acc, item) => {
      acc[item.questionId] = item;
      return acc;
    },
    {} as Record<QuestionId, QuestionEvidence>,
  );
