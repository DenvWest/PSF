# scripts/guide-content/stress.py
# Content voor stressgids-PDF (zie README.md voor schema).

_GUIDE_LINK = (
    '<a href="https://perfectsupplement.nl/thema/slaap" color="#5A8F6A">'
    "<u>perfectsupplement.nl/thema/slaap</u></a>"
)

GUIDE = {
    "meta": {
        "header_banner": "STRESSGIDS VOOR MANNEN 40+",
        "output_filename": "stressgids-perfectsupplement.pdf",
        "pdf_title": "De Stressgids voor mannen 40+ — PerfectSupplement",
    },
    "title_page": {
        "label": "GRATIS STRESSGIDS",
        "title": "De Stressgids voor mannen 40+",
        "subtitle": (
            "Hoe je je zenuwstelsel weer kalmeert — zonder dat je je leven hoeft om te gooien."
        ),
        "usps": [
            "Waarom chronische stress na 40 harder voelt en wat dat met cortisol en herstel doet",
            "Vier pijlers die elkaar versterken: ademhaling, slaap, de juiste beweging, voeding",
            "Een haalbaar vierwekenplan én een verdieping voor daarna — met stresslog-sjabloon",
            "Supplementen in perspectief: magnesium, ashwagandha, L-theanine en omega-3",
        ],
        "quote": (
            "Stress verminderen is geen project van een week. Het is een richting — met 1–2 dingen die je "
            "consequent volhoudt."
        ),
        "quote_source": "PerfectSupplement",
        "footer_url": "perfectsupplement.nl",
    },
    "chapters": [
        {
            "number": "01",
            "title": "Voor wie deze gids is",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Je hebt mogelijk de Leefstijlcheck gedaan en je profiel is Stressdrager — maar "
                        "<b>deze gids werkt ook als je de Leefstijlcheck niet hebt gedaan</b>. De "
                        "herkenningspunten hieronder zijn je instaptoets."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Stressdrager betekent niet automatisch burn-out. Het betekent vaak dat je "
                        "zenuwstelsel lang ‘aan’ staat — soms zo lang dat je het niet meer als spanning voelt."
                    ),
                },
                {"type": "subtitle", "text": "Herken je dit bij jezelf?"},
                {
                    "type": "bullets",
                    "items": [
                        "Je schouders staan standaard hoog",
                        "Je wordt ’s nachts wakker met een hoofd vol gedachten",
                        "Je wordt in de eerste vakantiedagen ziek of extra moe",
                        "Je geduld is korter dan vroeger",
                        "Kleine ergernissen voelen onevenredig groot",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": "Herken je hier drie of meer van: dit is voor jou.",
                },
            ],
        },
        {
            "number": "02",
            "title": "Wat er biologisch gebeurt (en waarom het na 40 harder voelbaar wordt)",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Stress op zich is niet fout — acute stress scherpt aan en helpt je prioriteren. "
                        "Het probleem is chronische belasting: dan blijft je <b>HPA-as te lang actief</b>"
                        "<super>1</super>."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Cortisol en testosteron concurreren</b>: prospectieve data tonen associaties tussen "
                        "cortisolprofielen en androgene markers bij mannen<super>2</super>. Experimenteel kan "
                        "acute cortisol circulating testosteron onderdrukken<super>3</super>. "
                        "Niet elk individu volgt hetzelfde patroon — het verklaart wel waarom chronische spanning "
                        "herstel kan uitstellen."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Pregnenolon steal — waarom ‘prioriteit’ ertoe doet",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Je lichaam gebruikt dezelfde bouwstenen voor verschillende hormonen. Als het systeem "
                        "structureel uitlijning zoekt op overleven (cortisol), kan dat ten koste gaan van "
                        "andere takken van hormoonsynthese — informeel <b>pregnenolon steal</b>; wetenschappelijk "
                        "beschreven in neurosteroid-frameworks<super>4</super> (vereenvoudigde voorlichting; "
                        "geen strikte diagnose-term)."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Darmen, vagus en serotonine — waarom je buik bij stress ‘meedoet’",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Je nervus vagus verbindt brein en onderbuik: hij coördineert rust-digest modussen. "
                        "Onder chronische stress verschuift vaak de balans naar minder ‘repair-and-digest’. "
                        "Daarnaast regelt darmmicrobioom-host interactie een groot deel van de "
                        "<b>serotoninebiosynthese</b>: circa <b>95%</b> van het lichaams-serotonine zit buiten "
                        "de klassieke centrale pool — relevant voor stemming en stressverwerking<super>5</super>."
                    ),
                },
                {"type": "subtitle", "text": "Sympathisch vs. parasympathisch — wat je voelt"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je <b>sympathisch zenuwstelsel</b> (‘gas’) kan te dominant worden; je parasympathische "
                        "tak (‘rem’) krijgt dan minder ruimte — een patroon dat samenhangt met chronische "
                        "stresssystemen en endocriene disbalans<super>6</super>. Slaap wordt oppervlakkiger, "
                        "herstel faalt, je merkt minder wat je lichaam probeert te signaleren."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Na 40 is je buffer kleiner: hetzelfde werkpakket voelt zwaarder omdat herstel "
                        "trager en kwetsbaarder wordt. Dat is geen falen — het is fysiologie."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 1,
                            "text": (
                                "Herman JP et al. Regulation of the Hypothalamic-Pituitary-Adrenocortical Stress "
                                "Response. Compr Physiol. 2016;6(2):603-621. PMC4867107"
                            ),
                        },
                        {
                            "num": 2,
                            "text": (
                                "Smith GD et al. Cortisol, Testosterone, and Coronary Heart Disease: Prospective "
                                "Evidence from the Caerphilly Study. Circulation. 2005;112(3):332-340. PMID: 16009799"
                            ),
                        },
                        {
                            "num": 3,
                            "text": (
                                "Cumming DC et al. Acute suppression of circulating testosterone levels by cortisol "
                                "in men. J Clin Endocrinol Metab. 1983;57(3):671-673. PMID: 6348068"
                            ),
                        },
                        {
                            "num": 4,
                            "text": (
                                "Baulieu EE. Neurosteroids: a novel function of the brain. "
                                "Psychoneuroendocrinology. 1998;23(8):963-987. PMID: 9924747"
                            ),
                        },
                        {
                            "num": 5,
                            "text": (
                                "Yano JM et al. Indigenous bacteria from the gut microbiota regulate host serotonin "
                                "biosynthesis. Cell. 2015;161(2):264-276. PMC4393509"
                            ),
                        },
                        {
                            "num": 6,
                            "text": (
                                "Chrousos GP. Stress and disorders of the stress system. Nat Rev Endocrinol. "
                                "2009;5(7):374-381. PMID: 19488073"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "03",
            "title": "De vier pijlers van herstel",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Stress verminderen is niet één hack. Het zijn vier pijlers die elkaar versterken. "
                        "Twee pijlers goed uitvoeren slaat vier pijlers half uitvoeren."
                    ),
                },
                {"type": "subtitle", "text": "Pijler 1: Ademhaling"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je adem is de snelste vrij beschikbare schakelaar richting meer parasympatische "
                        "activiteit."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        (
                            "<b>4–6 ademhaling</b> (4 sec in, 6 sec uit) — traag ademen activeert parasympathisch "
                            "effect-pathway’s in reviews van psycho-fysiologie<super>7</super>"
                        ),
                        "Box breathing: 4–4–4–4 — geschikt bij acute spanning",
                        (
                            "Fysiologische zucht: twee korte inhalaties door de neus, één langere uitademing "
                            "door de mond — gestructureerde varianten verlagen arousal in onderzoek"
                            "<super>8</super>"
                        ),
                    ],
                },
                {
                    "type": "tip",
                    "title": "Waarom een ‘zucht’ kan helpen",
                    "text": (
                        "Een <b>dubbele inademing</b> kan longblaasjes extra openzetten; een "
                        "<b>langere uitademing</b> versterkt vagale remming en verlaagt hartfrequentie sneller "
                        "dan alleen focussen op inhaleren — in lijn met gecontroleerde adem-protocollen"
                        "<super>8</super>."
                    ),
                },
                {"type": "subtitle", "text": "Pijler 2: Slaap"},
                {
                    "type": "paragraph",
                    "text": (
                        "Slaap is je belangrijkste hersteltool. Chronische stress maakt slaap oppervlakkiger — "
                        "wat stress weer versterkt."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        "Vaste bedtijd, ook weekend",
                        "Laatste 30 min voor slapen: geen scherm",
                        "Koele, donkere kamer (richting 17–19 °C)",
                        "Geen cafeïne na 12:00 als je gevoelig bent voor halfwaardetijd-effecten",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Voor een compleet slaapprotocol met supplement-tabellen en ritme-opbouw: download de "
                        f"slaapgids via {_GUIDE_LINK}."
                    ),
                },
                {"type": "subtitle", "text": "Pijler 3: Beweging — kalibreren i.p.v. stoppen"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Matige beweging</b> kan cortisol gunstiger profileren dan zeer hoge intensiteit, "
                        "waarbij acute cortisolresponses hoger uit kunnen vallen<super>9</super>. "
                        "<b>Wandelen</b> — vooral in groen — wordt in reviews gekoppeld aan stressvermindering "
                        "en stemming<super>10</super>. Het doel is kalibreren: voldoende prikkel om fit te blijven, "
                        "niet constant alarm."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": "<b>Voorbeeld weekschema (Stressdrager-fase)</b>",
                },
                {
                    "type": "table",
                    "headers": ["Dag", "Focus"],
                    "rows": [
                        ["Maandag", "40–45 min wandelen (liefst buiten)"],
                        ["Dinsdag", "Krachttraining kort (40–50 min), geen failure sets"],
                        ["Woensdag", "Rust actief: yoga / mobiliteit 25–35 min"],
                        ["Donderdag", "Wandelen 30 min + lichte core"],
                        ["Vrijdag", "Krachttraining kort"],
                        ["Zaterdag", "Langer wandelen (60–75 min), geen wedstrijd-intensiteit"],
                        ["Zondag", "Rust of heel lichte beweging"],
                    ],
                },
                {"type": "subtitle", "text": "Pijler 4: Voeding en hydratatie"},
                {
                    "type": "paragraph",
                    "text": (
                        "Chronische stress heeft ook een ontstekingscomponent. Voeding kan koelen of olie op "
                        "het vuur gooien."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        (
                            "<b>Eiwit bij ontbijt</b> stabiliseert bloedsuiker en appetitieve hormonen in "
                            "proefpersoonstudies bij mis-breakfast-populaties<super>11</super>"
                        ),
                        "Geen koffie op volledig lege maag als je daar trillerig van wordt",
                        "Voldoende water — vermoeidheid maskeert vaak dehydratie",
                        (
                            "Anti-inflammatoire bouwstenen: vette vis (omega-3), bessen, kleurrijke groenten, "
                            "kurkuma als kruid (combineer met zwarte peper voor curcumine-opname), groene thee "
                            "(let op cafeïne)"
                        ),
                    ],
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 7,
                            "text": (
                                "Zaccaro A et al. How Breath-Control Can Change Your Life: A Systematic Review on "
                                "Psycho-Physiological Correlates of Slow Breathing. Front Hum Neurosci. "
                                "2018;12:353. PMC6137615"
                            ),
                        },
                        {
                            "num": 8,
                            "text": (
                                "Huberman AD et al. Brief structured respiration practices enhance mood and reduce "
                                "physiological arousal. Cell Rep Med. 2023;4(1):100895. PMID: 36630953"
                            ),
                        },
                        {
                            "num": 9,
                            "text": (
                                "Hill EE et al. Exercise and circulating cortisol levels: the intensity threshold "
                                "effect. J Endocrinol Invest. 2008;31(7):587-591. PMID: 18787373"
                            ),
                        },
                        {
                            "num": 10,
                            "text": (
                                "Mikkelsen K et al. Exercise and mental health. Maturitas. 2017;106:48-56. "
                                "PMID: 29150166"
                            ),
                        },
                        {
                            "num": 11,
                            "text": (
                                "Leidy HJ et al. Beneficial effects of a higher-protein breakfast on the appetitive, "
                                "hormonal, and neural signals controlling energy intake regulation in overweight/obese, "
                                "breakfast-skipping, late-adolescent girls. Am J Clin Nutr. 2013;97(4):677-688. "
                                "PMC3718776"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "04",
            "title": "Het vierwekenplan (+ verdieping)",
            "blocks": [
                {"type": "subtitle", "text": "Week 1: Voelen wat er is"},
                {
                    "type": "paragraph",
                    "text": "<b>Doel:</b> eerst meten, nog niet ‘fixen’.",
                },
                {
                    "type": "bullets",
                    "items": [
                        "Elke avond: spanning 1–10",
                        "5 minuten uitademing met langere uit dan in",
                        "Stop cafeïne na 12:00",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Stresslogboek — mini-template",
                    "text": (
                        "Noteer naast je 1–10 score ook in één regel: "
                        "<b>(1) trigger</b> — wat ging vooraf? "
                        "<b>(2) reactie</b> — wat deed je lichaam en gedachten? "
                        "<b>(3) wat hielp</b> — ook klein (wandelen, ademen, eten, grens)? "
                        "Dat maakt patronen zichtbaar."
                    ),
                },
                {"type": "subtitle", "text": "Week 2: Slaap eerst"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaste bedtijd",
                        "Schermen weg pre-slaap",
                        "Slaapkamer koel en donker",
                    ],
                },
                {"type": "subtitle", "text": "Week 3: Beweging kalibreren"},
                {
                    "type": "bullets",
                    "items": [
                        "Dagelijks wandelen",
                        "Kracht kort en gecontroleerd — geen maximale intervals",
                    ],
                },
                {"type": "subtitle", "text": "Week 4: Meten wat werkt"},
                {
                    "type": "bullets",
                    "items": [
                        "Herhaal je Leefstijlcheck",
                        "Vergelijk scores met je startpunt",
                        "Kies maximaal twee gewoontes om vast te houden",
                    ],
                },
                {"type": "subtitle", "text": "Week 5–8: Verdieping"},
                {
                    "type": "paragraph",
                    "text": (
                        "Nu verander je niet elke week van strategie — je "
                        "<b>verdiept wat werkte</b>. Bijvoorbeeld: dezelfde opstaantijd, zelfde wandelmoment, "
                        "zelfde shutdown van werk. Voeg hooguit één nieuwe variabele toe (zoals magnesium of "
                        "adem-protocol uitbreiding)."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        "Maandelijks één ‘stressreview’ van 10 minuten met je logboek",
                        "Als je niet vooruitgaat: zoek één externe factor (werk, training, alcohol) om aan te scherpen",
                    ],
                },
            ],
        },
        {
            "number": "05",
            "title": "Supplementen die veel mensen met dit profiel proberen",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Leefstijl eerst.</b> Supplementen tweede. Dit zijn geen medicijnen en geen garantie."
                    ),
                },
                {
                    "type": "tip",
                    "title": "EFSA / regulering — even rechtzetten",
                    "text": (
                        "Veel kruidenextracten — waaronder ashwagandha — hebben in de EU "
                        "<b>geen erkende gezondheidsclaims</b> volgens EFSA-beoordelingen voor "
                        "<i>Withania somnifera</i><super>14</super>. Labels verschillen per leverancier; kies "
                        "transparante extractinfo en batch-testing."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium draagt bij aan een <b>normale werking van het zenuwstelsel</b> — een "
                        "EFSA-goedgekeurde claim onder voorwaarden van Verordening (EU) nr. 432/2012"
                        "<super>15</super>."
                    ),
                },
                {"type": "subtitle", "text": "Ashwagandha (extracten zoals KSM-66 / Sensoril worden veel besproken)"},
                {
                    "type": "paragraph",
                    "text": (
                        "RCT’s melden <b>lager cortisol</b> en minder stressscores met sommige "
                        "full-spectrum- en hoog-concentratie-extracten"
                        "<super>12</super><super>13</super>. Geen acute uit-knop — stop bij maagklachten "
                        "of sufheid en overleg bij schildklier- of schildkliermedicatie."
                    ),
                },
                {"type": "subtitle", "text": "L-theanine"},
                {
                    "type": "paragraph",
                    "text": (
                        "Kan overdag of voor rustmomenten helpen zonder zware sedatie — veel gebruikers zitten rond "
                        "<b>100–200 mg</b>. Combineer voorzichtig met veel cafeïne als je gevoelig bent voor hartslag."
                    ),
                },
                {"type": "subtitle", "text": "Omega-3 (EPA/DHA)"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>EPA</b> moduleert ontstekingsroutes relevant bij chronische stressbelasting"
                        "<super>16</super> — vooral als je weinig vis eet. Kwaliteit en oxidatie zijn belangrijker dan "
                        "megadosissen."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Stapelvolgorde (praktisch)",
                    "text": (
                        "<b>Week 1–2:</b> magnesium + basisroutine.<br/>"
                        "<b>Week 3–4:</b> eventueel ashwagandha toevoegen als stress nog dominant is.<br/>"
                        "<b>Week 5–6:</b> evalueer — werk het? Zo niet: niet stapellen, maar terug naar één variabele.<br/>"
                        "L-theanine kun je gericht inzetten rond bedtijd of stresspieken; omega-3 parallel aan voeding."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 12,
                            "text": (
                                "Chandrasekhar K et al. A prospective, randomized double-blind, placebo-controlled study "
                                "of safety and efficacy of a high-concentration full-spectrum extract of ashwagandha root "
                                "in reducing stress and anxiety in adults. Indian J Psychol Med. 2012;34(3):255-262. "
                                "PMID: 23439798"
                            ),
                        },
                        {
                            "num": 13,
                            "text": (
                                "Lopresti AL et al. An investigation into the stress-relieving and pharmacological actions "
                                "of an ashwagandha extract: A randomized, double-blind, placebo-controlled study. Medicine. "
                                "2019;98(37):e17186. PMC6979308"
                            ),
                        },
                        {
                            "num": 14,
                            "text": (
                                "EFSA Panel on Dietetic Products, Nutrition and Allergies (NDA). Scientific opinions on "
                                "health claims related to botanical substances — geen goedgekeurde claims voor "
                                "<i>Withania somnifera</i> (ashwagandha) vastgesteld per mei 2026 (EFSA Journal; "
                                "botanical claim dossiers)."
                            ),
                        },
                        {
                            "num": 15,
                            "text": (
                                "EFSA. Magnesium draagt bij tot een normale werking van het zenuwstelsel — "
                                "Verordening (EU) nr. 432/2012 (lijst goedgekeurde claims)."
                            ),
                        },
                        {
                            "num": 16,
                            "text": (
                                "Calder PC. Omega-3 fatty acids and inflammatory processes: from molecules to man. "
                                "Biochem Soc Trans. 2017;45(5):1105-1115. PMC5745491"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "06",
            "title": "Wanneer is het meer dan stress?",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Deze gids gaat over chronische stress als fysiologisch fenomeen. Soms is het breder — dan "
                        "hoort er professionaliteit bij."
                    ),
                },
                {"type": "subtitle", "text": "Bel je huisarts of plan POH-GGZ bij onder andere"},
                {
                    "type": "bullets",
                    "items": [
                        "Weken tot maanden somberheid",
                        "Geen plezier meer in wat je eerder leuk vond",
                        "'s Ochtends structureel niet uit bed komen",
                        "Paniek- of angstaanvallen",
                        "Sterk negatieve gedachten over jezelf",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>113 Zelfmoordpreventie</b> (0800-0113) en de <b>huisartsenpost</b> zijn 24/7 bereikbaar "
                        "bij acute crisis of zorgen over veiligheid."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Een <b>POH-GGZ-gesprek</b> via je huisarts is in Nederland doorgaans "
                        "<b>gratis en vergoed vanuit de basisverzekering</b> volgens landelijke kaders "
                        "<super>17</super> — controleer je polis voor details bij jouw zorgverzekeraar."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Dit hoeft geen falen te zijn — het kan betekenen dat je systeem te lang overbelast was."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 17,
                            "text": (
                                "Rijksoverheid. Geestelijke gezondheidszorg (GGZ) — vergoeding en toegang via "
                                "huisarts (actueel per 2026)."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "07",
            "title": "Veelgestelde vragen",
            "blocks": [
                {"type": "subtitle", "text": "Is chronische stress hetzelfde als een burn-out?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Nee. Burn-out is een diagnoseterm in specifieke medische contexten (criteria via arts). "
                        "Chronische stress beschrijft een belastingstoestand — die kan voorafgaan aan meer, maar "
                        "is niet hetzelfde."
                    ),
                },
                {"type": "subtitle", "text": "Kan stress mijn testosteron verlagen?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ja, dat kan — onder andere via langdurig verhoogde cortisol en concurrentie tussen "
                        "stress- en androgene assen (zie hoofdstuk 02)<super>2</super><super>3</super>."
                    ),
                },
                {"type": "subtitle", "text": "Hoe snel merk ik resultaat van stressvermindering?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ademhaling kan binnen minuten subtiel verschil geven; slaap en training vragen vaak "
                        "2–4 weken om trend zichtbaar te maken; adaptogenen zoals ashwagandha worden vaak pas "
                        "na meerdere weken geëvalueerd."
                    ),
                },
                {"type": "subtitle", "text": "Mag ik ashwagandha combineren met medicatie?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Niet zonder overleg bij schildkliermedicatie, immunotherapie, sedativa of als je zwanger "
                        "probeert te worden. Neem je stack mee naar je apotheek/huisarts."
                    ),
                },
                {"type": "subtitle", "text": "Ik kan niet stoppen met hard trainen — wat dan?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Dan train je nog — maar je verandert de <b>kwaliteit</b>: minder tot falen, meer "
                        "technische reps, meer slaap en meer wandelen. Het voelt als minder; voor je hormonen is "
                        "het vaak meer herstel."
                    ),
                },
            ],
        },
        {
            "number": "08",
            "title": "Tot slot",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Stress verminderen is een richting — geen project met einddatum. Slechte dagen horen erbij."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Mensen die hier winst boeken, doen zelden alles tegelijk. Ze kiezen 1–2 dingen die ze "
                        "volhouden. Niet perfect — consequent."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Veel succes. Vragen? Je kunt antwoorden op de mails die we sturen — we lezen mee."
                    ),
                },
                {"type": "paragraph", "text": "— Het PerfectSupplement-team"},
            ],
        },
    ],
    "cta": {
        "title": "Wil je weten waar je staat?",
        "text": (
            "Stress is één van de zes domeinen die we meten in de gratis Leefstijlcheck. In een paar minuten "
            "zie je waar je op scoort — en welk profiel bij jou past."
        ),
        "url_href": "https://perfectsupplement.nl/intake",
        "url_label": "perfectsupplement.nl/intake",
    },
    "disclaimer": {
        "title": "Disclaimer",
        "body": (
            "Deze gids is informatief en geen medisch advies. Bij langdurige somberheid, burn-outklachten, "
            "paniek, medicatiegebruik of acute crisis: raadpleeg een arts of bel 0800-0113. Supplementen zijn "
            "geen vervanging voor medische zorg."
        ),
        "copyright": (
            "© 2026 PerfectSupplement.nl — Onafhankelijk. Onderbouwd. Voor mannen 40+."
        ),
    },
}

GUIDE["all_references"] = [
    {"num": 1, "text": GUIDE["chapters"][1]["blocks"][-1]["items"][0]["text"]},
    {"num": 2, "text": GUIDE["chapters"][1]["blocks"][-1]["items"][1]["text"]},
    {"num": 3, "text": GUIDE["chapters"][1]["blocks"][-1]["items"][2]["text"]},
    {"num": 4, "text": GUIDE["chapters"][1]["blocks"][-1]["items"][3]["text"]},
    {"num": 5, "text": GUIDE["chapters"][1]["blocks"][-1]["items"][4]["text"]},
    {"num": 6, "text": GUIDE["chapters"][1]["blocks"][-1]["items"][5]["text"]},
    {"num": 7, "text": GUIDE["chapters"][2]["blocks"][-1]["items"][0]["text"]},
    {"num": 8, "text": GUIDE["chapters"][2]["blocks"][-1]["items"][1]["text"]},
    {"num": 9, "text": GUIDE["chapters"][2]["blocks"][-1]["items"][2]["text"]},
    {"num": 10, "text": GUIDE["chapters"][2]["blocks"][-1]["items"][3]["text"]},
    {"num": 11, "text": GUIDE["chapters"][2]["blocks"][-1]["items"][4]["text"]},
    {"num": 12, "text": GUIDE["chapters"][4]["blocks"][-1]["items"][0]["text"]},
    {"num": 13, "text": GUIDE["chapters"][4]["blocks"][-1]["items"][1]["text"]},
    {"num": 14, "text": GUIDE["chapters"][4]["blocks"][-1]["items"][2]["text"]},
    {"num": 15, "text": GUIDE["chapters"][4]["blocks"][-1]["items"][3]["text"]},
    {"num": 16, "text": GUIDE["chapters"][4]["blocks"][-1]["items"][4]["text"]},
    {"num": 17, "text": GUIDE["chapters"][5]["blocks"][-1]["items"][0]["text"]},
]
