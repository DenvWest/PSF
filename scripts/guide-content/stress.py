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
            "Zo breng je je lichaam weer wat meer naar rust — zonder je leven op zijn kop te zetten."
        ),
        "usps": [
            "Waarom chronische stress na je veertigste harder aanvoelt — en wat dat met herstel doet",
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
                        "Stress hoort er te zijn — het maakt je scherp als het moet. Het probleem wordt pas als "
                        "je wekenlang onder spanning blijft. Dan kan je <b>stresssysteem te lang op scherp blijven</b> "
                        "<super>1</super>: de keten tussen je hersenen en de kleine orgaantjes boven je nieren "
                        "(je <b>bijnieren</b>)."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Je <b>testosteron kan dalen</b> als je stresshormoon (<b>cortisol</b>) lang hoog blijft. "
                        "In ouder onderzoek bij mannen zagen onderzoekers bij chronisch verhoogd cortisol vaak "
                        "<b>ongeveer 10–15% lagere testosteronwaarden</b> dan bij vergelijkbare leeftijdgenoten "
                        "<super>2</super>. Los daarvan kan een plotseling hoge dosis cortisol je testosteron "
                        "kort onderdrukken <super>3</super>. Zo’n gemiddelde zegt niet wat er bij jou gebeurt — "
                        "wel verklaart het waarom je je bij aanhoudende stress minder hersteld kunt voelen."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Waarom je lichaam soms ‘kiezen’ moet",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Je lichaam gebruikt voor hormonen dezelfde bouwstoffen. Bij langdurige stress schuift de "
                        "prioriteit vaak naar <b>stresshormoon</b>. Informeel zeggen sommigen: dan wordt er "
                        "minder ruimte voor testosteron — ze gebruiken dezelfde grondstof. Zo uitgelegd "
                        "klinkt het simpeler dan het in elk individu echt werkt <super>4</super>."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Je buik doet mee — via een grote ‘rustzenuw’",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Er loopt een <b>grote zenuw</b> van je hersenstam naar je buik die je helpt kalmeren na "
                        "stress (informeel: je ‘rustzenuw’). Sta je lang ‘aan’, dan voelt je spijsvertering dat "
                        "ook. Daarnaast maakt een groot deel van je <b>serotonine</b> — een stof die met stemming "
                        "te maken heeft — niet alleen ‘in je hoofd’, maar ook met hulp van je darmen en bacteriën "
                        "daar; onderzoekers benadrukken vaak dat het grootste deel buiten de klassieke "
                        "‘hoofdpool’ zit <super>5</super>. Vandaar dat eten, vezels en rust rond maaltijden meetellen."
                    ),
                },
                {"type": "subtitle", "text": "Het voelt alsof je gaspedaal klemt"},
                {
                    "type": "paragraph",
                    "text": (
                        "Dan blijft het <b>‘aan-de-slag’-deel</b> van je zenuwstelsel te veel de baas. Het "
                        "<b>‘eerst herstellen’-deel</b> komt minder aan bod — een patroon dat samenhangt met "
                        "langdurige stress en hormonen <super>6</super>. Je slaap wordt oppervlakkiger, je "
                        "merkt minder snel signalen van je lichaam."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Na je 40e merk je zo’n buffer sneller: hetzelfde ritme voelt zwaarder. Dat zegt niets "
                        "over falen — alleen dat herstel wat kwetsbaarder wordt."
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
                        "Stress verminderen is geen enkele truc. Het zijn vier pijlers die elkaar versterken. "
                        "Twee dingen goed volhouden slaat vier dingen half doen."
                    ),
                },
                {"type": "subtitle", "text": "Pijler 1: Ademhaling"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je adem is het snelste hulpmiddel dat je gratis hebt om je lichaam uit de hoogste spanning "
                        "te halen."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        "<b>4–6 ademen:</b> 4 tellen in, 6 tellen uit — een paar minuten per dag kan helpen om rustiger te worden <super>7</super>",
                        (
                            "<b>Vierkant ademen:</b> 4 tellen in, 4 vasthouden, 4 uit, 4 wachten — handig bij een acute stresspie "
                            "(vaak ‘box breathing’ genoemd)"
                        ),
                        (
                            "<b>Dubbele inademing:</b> twee keer kort door je neus (snif-snif), daarna één keer lang uit door je mond"
                            "<super>8</super>"
                        ),
                    ],
                },
                {
                    "type": "tip",
                    "title": "Waarom die dubbele inademing werkt",
                    "text": (
                        "Die eerste twee korte happen helpen je longen goed open te zetten. "
                        "Die lange uitademing zet je <b>rustzenuw</b> harder aan het werk — vaak merk je dan "
                        "sneller dat je hartslag daalt <super>8</super>."
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
                        "Download voor een volledig slaapplan met supplement-tabellen en ritme de slaapgids via "
                        f"{_GUIDE_LINK}."
                    ),
                },
                {"type": "subtitle", "text": "Pijler 3: Beweging — afstemmen op wat je aankan"},
                {
                    "type": "paragraph",
                    "text": (
                        "Rustige beweging wordt in onderzoek vaak gunstiger gezien voor stresshormonen dan "
                        "heel harde sport — zo’n harde sessie kan cortisol even doen pieken <super>9</super>. "
                        "<b>Wandelen</b>, vooral buiten, wordt in samenvattingen van onderzoek gekoppeld aan "
                        "minder spanning en een beter humeur <super>10</super>. Het punt: niet stoppen, maar het "
                        "tempo aanpassen."
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
                        ["Dinsdag", "Korte krachttraining (40–50 min), niet tot het uiterste gaan"],
                        ["Woensdag", "Rust actief: yoga / mobiliteit 25–35 min"],
                        ["Donderdag", "30 min wandelen + lichte core"],
                        ["Vrijdag", "Korte krachttraining"],
                        ["Zaterdag", "Langere wandeling — geen trainingswedstrijd"],
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
                            "<b>Ontbijt met eiwit</b> — eieren, kwark of noten — helpt bij veel mensen om de "
                            "ochtendbloedsuiker rustiger te houden <super>11</super>"
                        ),
                        "Geen koffie op volledig lege maag als je daar trillerig van wordt",
                        "Voldoende water — vermoeidheid maskeert vaak dehydratie",
                        (
                            "Denk aan omega-3 uit vis en aan kleur op je bord: bessen, groente, kurkuma als kruid "
                            "(met een beetje zwarte peper), groene thee — maar let op cafeïne als je daar "
                            "hipper van wordt"
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
                {"type": "subtitle", "text": "Week 3: Beweging aanpassen"},
                {
                    "type": "bullets",
                    "items": [
                        "Dagelijks wandelen",
                        "Kracht kort en rustig — geen maximale intervallen",
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
                    "title": "Belangrijk over claims en regels",
                    "text": (
                        "<b>Ashwagandha heeft geen door de EFSA goedgekeurde gezondheidsclaims.</b> Wat je hier "
                        "leest komt uit onderzoek bij vrijwilligers — niet uit zo’n officiële claim op een "
                        "pillendoosje. Labels verschillen; kies merken met duidelijke extractinfo. "
                        "<b>In Nederland wordt de regelgeving rondom ashwagandha scherper bekeken;</b> "
                        "houd het nieuws in de gaten."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium draagt bij aan de normale werking van het zenuwstelsel en kan bijdragen aan "
                        "vermindering van vermoeidheid — dat zijn <b>EFSA-goedgekeurde claims</b> onder de juiste "
                        "product- en dosisvoorwaarden (EU-verordening nr. 432/2012)<super>15</super>. "
                        "Dat wil nog niet zeggen dat jij het verschil meteen voelt — maar het verklaart waarom "
                        "veel mensen het serieus nemen."
                    ),
                },
                {"type": "subtitle", "text": "Ashwagandha (extracten zoals KSM-66 / Sensoril worden veel besproken)"},
                {
                    "type": "paragraph",
                    "text": (
                        "In gecontroleerde studies bij vrijwilligers werd bij sommige extracten "
                        "<b>minder stresshormoon (cortisol) gemeten</b> en geven mensen vaak lagere stressscores "
                        "aan dan met een placebo — maar uitkomsten <b>lopen sterk uiteen</b>"
                        "<super>12</super><super>13</super>. Dit is geen ‘uit-knop’. Stop bij klachten aan je maag "
                        "of ongewenste sufheid. Gebruik je schildkliermedicatie? Overleg eerst met je arts."
                    ),
                },
                {"type": "subtitle", "text": "L-theanine"},
                {
                    "type": "paragraph",
                    "text": (
                        "Sommige mensen gebruiken dit aminozuur uit thee als ze spanning willen temperen zonder "
                        "meteen suf te worden. Doseringen rond <b>100–200 mg</b> komen vaak voor — voel zelf wat "
                        "bij je past. Drink je veel sterke koffie? Ga voorzichtig om met combinaties als je "
                        "hart sneller klopt."
                    ),
                },
                {"type": "subtitle", "text": "Omega-3 (EPA/DHA)"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>EPA en DHA uit visolie</b> worden in onderzoek in verband gebracht met ontstekingsbalans "
                        "en met het ondersteunen van celmembranen — relevant als je weinig vis eet "
                        "<super>16</super>. Belangrijker dan megadosissen is verse olie van goede kwaliteit."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Stapelvolgorde (praktisch)",
                    "text": (
                        "<b>Week 1–2:</b> magnesium naast je basisroutine — raadpleeg je huisarts bij medicatie.<br/>"
                        "<b>Week 3–4:</b> eventueel ashwagandha, alleen als spanning nog overheerst "
                        "(geen EFSA-claims; zie kader hierboven).<br/>"
                        "<b>Week 5–6:</b> evalueer eerlijk: merk je iets? Zo niet, niet verder stapelen.<br/>"
                        "L-theanine kun je gericht proberen voor slapen of stresspieken; omega-3 past naast "
                        "normale voeding."
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
                                "EFSA — Europese lijst van goedgekeurde gezondheidsclaims (EU-verordening nr. "
                                "432/2012): voor <i>Withania somnifera</i> (ashwagandha) zijn geen dergelijke claims "
                                "vastgesteld; raadpleeg registers voor actuele status."
                            ),
                        },
                        {
                            "num": 15,
                            "text": (
                                "EFSA — goedgekeurde claims voor magnesium o.a. normale werking zenuwstelsel en "
                                "bijdrage aan vermindering van vermoeidheid — EU-verordening nr. 432/2012 "
                                "(onder voorwaarden)."
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
                        "Deze gids helpt je bij langdurige spanning die niet meer vanzelf wegzakt. "
                        "Denk je dat het breder is — bijvoorbeeld diepe somberheid of paniek — zoek dan hulp "
                        "buiten deze teksten om."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Bel je huisarts of vraag een POH-GGZ-gesprek aan bij onder andere",
                },
                {
                    "type": "bullets",
                    "items": [
                        "Je bent weken of maanden somber",
                        "Niets waar je blij van werd voelt nog leuk",
                        "Je komt ’s ochtends niet meer uit bed",
                        "Je hebt paniek- of angstaanvallen",
                        "Je denkt heel negatief over jezelf",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>113 Zelfmoordpreventie</b> (telefoon <b>0800-0113</b>) en de "
                        "<b>huisartsenpost</b> bereik je 24 uur per dag bij acute crisis of als je bang bent voor "
                        "wat je voelt."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>POH-GGZ</b> staat voor een gespecialiseerde hulpverlener op de praktijk van je "
                        "huisarts. Zo’n eerste gesprek is meestal <b>gratis</b> en wordt "
                        "<b>vergoed vanuit je basisverzekering</b> — check jouw polis voor details "
                        "<super>17</super>."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Twijfel je?</b> Bel je huisarts. Dat is geen zwakte — dat is verstandig."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Dat je hier terechtkomt, hoeft niets te zeggen over falen. Soms staat een systeem te lang "
                        "aan."
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
                        "Nee. Burn-out is een diagnose die alleen een arts in een vaste procedure mag vaststellen. "
                        "‘Chronische stress’ beschrijft hoe zwaar het voelt — dat kan wijzen op meer, maar het "
                        "is niet hetzelfde."
                    ),
                },
                {"type": "subtitle", "text": "Kan stress mijn testosteron verlagen?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ja, dat kan bij sommige mannen spelen. Langdurig hoog cortisol hangt samen met lagere "
                        "testosteronwaarden in onderzoek — en je lichaam kan tijdelijk meer aan stresshormoon "
                        "bouwen dan aan testosteron (zie hoofdstuk 02)<super>2</super><super>3</super>. "
                        "Elk lichaam reageert anders."
                    ),
                },
                {"type": "subtitle", "text": "Hoe snel merk ik resultaat van stressvermindering?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ademoefeningen merk je soms binnen enkele minuten subtiel. "
                        "Slaap en wandelen hebben meestal een paar weken nodig om een trend te zien. "
                        "Kruiden zoals ashwagandha kunnen pas na meerdere weken beoordeeld worden — "
                        "onthoud dat ze <b>geen EFSA-goedgekeurde claims</b> hebben."
                    ),
                },
                {"type": "subtitle", "text": "Mag ik ashwagandha combineren met medicatie?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Niet zonder overleg bij schildkliermedicatie, bij kalmerende pillen of bij "
                        "immunotherapie. Wil je zwanger worden of gebruik je andere vaste medicatie? "
                        "Neem je potjes mee naar huisarts of apotheek. "
                        "<b>Ashwagandha heeft geen EFSA-goedgekeurde claims;</b> extra reden om niet zelf te "
                        "stoeien."
                    ),
                },
                {"type": "subtitle", "text": "Ik kan niet stoppen met hard trainen — wat dan?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je hoeft niet te stoppen met sport — maar parkeer even de zwaarste vormen. "
                        "Wandelen en rustige krachttraining leveren in zo’n herstelfase vaak meer op dan jezelf "
                        "kapot intervaltrainen. Het voelt rustiger; je systeem heeft juist dat nodig."
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
            "Stress is een van de zes domeinen die we meten in de gratis Leefstijlcheck. In een paar minuten "
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
