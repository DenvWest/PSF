# scripts/guide-content/herstel.py
# Herstelgids — zelfde PDF-layout als energie/stress via generate-guide-pdf.py

_LINK_SLAAP = (
    '<a href="https://perfectsupplement.nl/gids/slaap" color="#5A8F6A">'
    "<u>perfectsupplement.nl/gids/slaap</u></a>"
)
_LINK_STRESS = (
    '<a href="https://perfectsupplement.nl/gids/stress" color="#5A8F6A">'
    "<u>perfectsupplement.nl/gids/stress</u></a>"
)
_LINK_ENERGIE = (
    '<a href="https://perfectsupplement.nl/gids/energie" color="#5A8F6A">'
    "<u>perfectsupplement.nl/gids/energie</u></a>"
)
_LINK_MAG = (
    '<a href="https://perfectsupplement.nl/beste/magnesium" color="#5A8F6A">'
    "<u>perfectsupplement.nl/beste/magnesium</u></a>"
)
_LINK_OMEGA = (
    '<a href="https://perfectsupplement.nl/beste/omega-3-supplement" color="#5A8F6A">'
    "<u>perfectsupplement.nl/beste/omega-3-supplement</u></a>"
)
_LINK_ASH = (
    '<a href="https://perfectsupplement.nl/beste/ashwagandha" color="#5A8F6A">'
    "<u>perfectsupplement.nl/beste/ashwagandha</u></a>"
)
_LINK_EIWIT = (
    '<a href="https://perfectsupplement.nl/beste/eiwitpoeder" color="#5A8F6A">'
    "<u>perfectsupplement.nl/beste/eiwitpoeder</u></a>"
)

_GUIDE = {
    "meta": {
        "header_banner": "HERSTELGIDS VOOR MANNEN 40+",
        "output_filename": "herstelgids-perfectsupplement.pdf",
        "pdf_title": "De Herstelgids voor mannen 40+ — PerfectSupplement",
    },
    "title_page": {
        "label": "GRATIS HERSTELGIDS",
        "title": "De Herstelgids<br/>voor mannen 40+",
        "subtitle": (
            "Slaap, eiwit, rust en beweging als basis — supplementen alleen als aanvulling, "
            "met realistische verwachtingen en EFSA-kaders waar relevant."
        ),
        "usps": [
            "Waarom herstel na 40 fundamenteel anders werkt dan op je dertigste",
            "De vijf herstelfouten die mannen 40+ het vaakst ondermijnen",
            "Een vierwekenprotocol én een concreet weekplan om te volgen",
            "Supplementen, EFSA-kaders en praktische doseringen — ná slaap, eiwit en rust",
        ],
        "quote": (
            "Herstel is niet lui zijn. Het is de investering die maakt dat training werkt, dat je scherp blijft, "
            "en dat je lichaam na 40 zijn belofte inlost."
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
                        "Je hebt misschien de Leefstijlcheck gedaan en gezien dat <b>herstel</b> meespeelt in je "
                        "scores — maar <b>je hoeft die check niet te hebben gedaan</b> om hier iets aan te hebben. "
                        "De punten hieronder zijn je instaptest."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Herstel is een van de vier leefstijldomeinen</b> die de gratis Leefstijlcheck in kaart brengt. "
                        "Doe de check op "
                        '<a href="https://perfectsupplement.nl/intake" color="#5A8F6A">'
                        "<u>perfectsupplement.nl/intake</u></a>."
                    ),
                },
                {"type": "subtitle", "text": "Herken je dit bij jezelf?"},
                {
                    "type": "bullets",
                    "items": [
                        "Je hebt na training meerdere dagen spierpijn of stijfheid",
                        "Je slaapt genoeg uren, maar wordt niet uitgerust wakker",
                        "Je traint door, maar wordt niet sterker — of word juist sneller moe",
                        "Je gebruikt het weekend om ‘bij te slapen’, maar het voelt niet als herstel",
                        "Je lichaam voelt langer nodig te hebben voor hetzelfde werk als vroeger",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": "Drie of meer punten? Dan sluit deze gids bij je aan.",
                },
            ],
        },
        {
            "number": "02",
            "title": "Waarom herstel na 40 verandert",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Na je 40e merk je dat je lichaam langer nodig heeft om te herstellen van dezelfde belasting. "
                        "Dat is geen kwakkel — het is biologie. Snap je wat er schuift, dan kun je gerichter kiezen "
                        "wat je wel aanpast."
                    ),
                },
                {"type": "subtitle", "text": "Testosteron en groeihormoon dalen geleidelijk"},
                {
                    "type": "paragraph",
                    "text": (
                        "Groeihormoon speelt een centrale rol in weefselherstel, vetmetabolisme en spiermassa. "
                        "Onderzoek laat zien dat de pulsatiele afgifte van GH met de leeftijd afneemt "
                        "<super>1</super>. Testosteron — dat een rol speelt bij spiereiwitsyntese en "
                        "herstelcapaciteit — daalt bij mannen gemiddeld met ongeveer 1–2% per jaar na het 30e "
                        "levensjaar, al verschilt dat sterk per individu <super>2</super>. In de praktijk voelt dat "
                        "als langere spierpijn, trager herstel en minder uitgerust wakker worden."
                    ),
                },
                {"type": "subtitle", "text": "Laaggradige ontsteking neemt toe"},
                {
                    "type": "paragraph",
                    "text": (
                        "Naarmate je ouder wordt, stijgt het basisniveau van ontstekingsmarkers zoals IL-6 en "
                        "CRP licht — wel eens <b>inflammaging</b> genoemd <super>3</super>. Dat betekent niet dat je "
                        "ziek bent, maar wel dat je lichaam achtergrondruis heeft die herstel bemoeilijkt. "
                        "Voeding, slaap en beweging zijn de eerste knoppen om aan te draaien — vóór supplementen."
                    ),
                },
                {"type": "subtitle", "text": "Spiereiwitaanmaak reageert trager"},
                {
                    "type": "paragraph",
                    "text": (
                        "De anabole respons — hoe sterk spieren reageren op eiwit en training — kan met de leeftijd "
                        "minder efficiënt worden. Oudere volwassenen hebben vaak relatief meer eiwit per maaltijd nodig "
                        "om dezelfde mate van spiereiwitsyntese te bereiken als jongere mensen <super>4</super>. "
                        "Reden om eiwit en timing serieuzer te nemen dan op je dertigste."
                    ),
                },
                {"type": "subtitle", "text": "Slaap en herstel versterken elkaar"},
                {
                    "type": "paragraph",
                    "text": (
                        "Veel weefselherstel en hormoonafgifte gebeurt tijdens diepe slaap. Als die fase "
                        "— die met de jaren relatief korter kan worden — inboet, heeft dat direct gevolgen voor "
                        "je herstelcapaciteit <super>1</super>. Herstel verbeteren zonder slaap aan te pakken is "
                        "zelden effectief. Zie ook het slaapthema via "
                        f"{_LINK_SLAAP}."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 1,
                            "text": (
                                "Veldhuis JD et al. Alterations in growth hormone secretory dynamics in healthy "
                                "elderly men. J Clin Endocrinol Metab. 1995;80(12):3459. PMID: 8530591"
                            ),
                        },
                        {
                            "num": 2,
                            "text": (
                                "Harman SM et al. Longitudinal effects of aging on serum total and free testosterone "
                                "levels in healthy men. J Clin Endocrinol Metab. 2001;86(2):724. PMID: 11158037"
                            ),
                        },
                        {
                            "num": 3,
                            "text": (
                                "Franceschi C et al. Inflammaging and anti-inflammaging: a systemic perspective on "
                                "aging and longevity. Ann N Y Acad Sci. 2007;908:244. Zie ook bespreking in "
                                "Mech Ageing Dev. 2007;128(1):92. PMID: 17116321"
                            ),
                        },
                        {
                            "num": 4,
                            "text": (
                                "Moore DR et al. Protein Requirements: Methodological Issues. Am J Clin Nutr. "
                                "2015;101(6):1281S. PMID: 25926519"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "03",
            "title": "De vijf grootste herstelfouten",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Veel mannen van midden veertig herkennen dezelfde valkuilen — niet omdat ze lui zijn, "
                        "maar omdat wat op hun dertigste nog werkte, nu harder tegenaan tikt."
                    ),
                },
                {"type": "subtitle", "text": "Fout 1: te weinig slaap, te veel training"},
                {
                    "type": "paragraph",
                    "text": (
                        "Herstel gebeurt niet tijdens de training — vooral tijdens slaap. Wie structureel te weinig "
                        "slaapt en toch blijft trainen, hoopt een tekort op. Meer trainen lost dat niet op "
                        "<super>5</super>. Plan rust even bewust als je trainingsschema."
                    ),
                },
                {"type": "subtitle", "text": "Fout 2: te weinig eiwit"},
                {
                    "type": "paragraph",
                    "text": (
                        "Voor actieve mannen wordt in reviews vaak rond <b>1,6–2,2 g eiwit per kg lichaamsgewicht per "
                        "dag</b> geadviseerd <super>6</super>. Na je 40e ligt de ondergrens eerder bij 1,6 g/kg dan "
                        "bij 0,8 g/kg. Denk aan het bord: eieren, vis, vlees, kwark, peulvruchten — niet alleen poeder."
                    ),
                },
                {"type": "subtitle", "text": "Fout 3: geen rustige dag tussen zware sessies"},
                {
                    "type": "paragraph",
                    "text": (
                        "Twee keer kracht plus twee keer lichte cardio past voor veel mannen 40+ beter dan vijf "
                        "zware dagen. Je zenuwstelsel herstelt soms trager dan spieren laten merken <super>5</super>. "
                        "Een lichte wandeling of mobiliteit is actief herstel, geen ‘verloren’ dag."
                    ),
                },
                {"type": "subtitle", "text": "Fout 4: alcohol vlak na training"},
                {
                    "type": "paragraph",
                    "text": (
                        "Alcohol kan de spiereiwitsynthese na training remmen — ook bij matige hoeveelheden in "
                        "gecontroleerde opstellingen <super>7</super>. Nooit drinken hoeft niet, maar direct na "
                        "trainen is het slechtst getimede moment voor herstel."
                    ),
                },
                {"type": "subtitle", "text": "Fout 5: supplementen stapelen zonder basis"},
                {
                    "type": "paragraph",
                    "text": (
                        "Creatine, omega-3 en magnesium kunnen een rol spelen — maar niet als slaap, eiwit, "
                        "rustdagen en stress nog niet op orde zijn. Zie ook "
                        f"{_LINK_STRESS} en {_LINK_ENERGIE} als die hoeken meespelen."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 5,
                            "text": (
                                "Meeusen R et al. Prevention, diagnosis and treatment of the overtraining syndrome: "
                                "joint consensus statement. Eur J Sport Sci. 2013;13(1):1. PMID: 23235941"
                            ),
                        },
                        {
                            "num": 6,
                            "text": (
                                "Morton RW et al. A systematic review, meta-analysis and meta-regression of the effect "
                                "of protein supplementation on resistance training-induced gains in muscle mass and "
                                "strength in healthy adults. Br J Sports Med. 2018;52(6):376. PMID: 28698222"
                            ),
                        },
                        {
                            "num": 7,
                            "text": (
                                "Parr EB et al. Alcohol ingestion impairs muscle protein synthesis following "
                                "acute exercise in humans. PLoS One. 2014;9(2):e88384. PMC3914791"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "04",
            "title": "Vier weken herstel — protocol en weekplan",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Je bouwt stap voor stap op — je hoeft niet perfect te zijn. Kies een paar vaste gewoontes "
                        "die je wél volhoudt."
                    ),
                },
                {"type": "subtitle", "text": "Week 1–2: basis"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaste slaaptijden (ook weekend) — je herstel-fundament",
                        "Eiwit bij elke maaltijd — streef naar ±1,6 g/kg/dag (zie ook hoofdstuk 3)",
                        "Plan bewust 1–2 rustdagen per week zonder zware training",
                        "Beperk alcohol rondom zware sessies",
                    ],
                },
                {"type": "subtitle", "text": "Niet doen in fase 1"},
                {
                    "type": "bullets",
                    "items": [
                        "Geen extra trainingsdag toevoegen omdat je ‘even energie voelt’",
                        "Geen supplementenstapel starten vóór dit basisplaatje",
                    ],
                },
                {"type": "subtitle", "text": "Week 3–4: verdieping"},
                {
                    "type": "bullets",
                    "items": [
                        "Actief herstel: mobiliteit, foam rollen of wandeling na zware training",
                        "Log een week je eiwit (app) als je twijfelt of je het haalt",
                        "Overweeg magnesiumglycinaat ’s avonds (dosering: hoofdstuk 6)",
                        "Daglicht binnen ±30 minuten na opstaan — ondersteunt je ritme",
                    ],
                },
                {"type": "subtitle", "text": "Niet doen in fase 2"},
                {
                    "type": "bullets",
                    "items": [
                        "Geen ‘compensatieweek’ met dubbel trainenvolume",
                        "Geen nieuwe supplementen stapelen zonder dat week 1–2 voelt alsof die klopt",
                    ],
                },
                {"type": "subtitle", "text": "Dag 28: één minuut meten"},
                {
                    "type": "paragraph",
                    "text": (
                        "Noteer kort: ochtendfrisheid (1–10), herstel na training, energie overdag. "
                        "Herhaal daarna de Leefstijlcheck om trend te zien."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Magnesium vergelijken",
                    "text": (
                        f"Overweeg vanaf week 3 magnesiumglycinaat als onderdeel van je avondroutine. "
                        f"Onafhankelijke vergelijking: {_LINK_MAG}."
                    ),
                },
                {"type": "pagebreak"},
                {"type": "subtitle", "text": "Week-voor-week overzicht"},
                {
                    "type": "subtitle",
                    "text": "Week 1 — quick wins",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Vaste slaaptijden, eiwit per maaltijd (doel 1,6 g/kg/dag).<br/>"
                        "Twee bewuste rustdagen, geen alcohol rondom training."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Week 2–3 — ritme",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Rustige wandeling na het avondeten.<br/>"
                        "Magnesiumglycinaat voor het slapen (zie hoofdstuk 6).<br/>"
                        "Daglicht kort na opstaan; foam rollen of mobiliteit na zware sessies."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Week 4 — meten en kiezen",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Mini-hersteldagboek: frisheid, herstel, energie.<br/>"
                        "Optioneel: omega-3 als je structureel weinig vis eet — eerst vis/voeding, dan pas pil.<br/>"
                        "Evalueer supplementen: wat hielp, wat was ruis?<br/>"
                        "Herhaal de Leefstijlcheck op perfectsupplement.nl/intake."
                    ),
                },
            ],
        },
        {
            "number": "05",
            "title": "Supplementen in perspectief",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Slaap, eiwit en rust eerst.</b> Hieronder staan middelen die vaak genoemd worden — met "
                        "EFSA-claims waar die bestaan, en voorzichtige formulering waar dat niet zo is."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium draagt bij aan normale spierfunctie en kan bijdragen aan vermindering van "
                        "vermoeidheid — <b>EFSA onder voorwaarden</b> <super>8</super>. Veel mensen kiezen "
                        "glycinaat of bisglycinaat vanwege verdragen en gebruik rond slapen."
                    ),
                },
                {
                    "type": "table",
                    "headers": ["Vorm", "Opname / verdragen", "Herstel-context"],
                    "rows": [
                        ["Glycinaat / bisglycinaat", "Meestal goed verdragen", "Eerste keuze rond slaap/herstel"],
                        ["Citraat", "Redelijke opname", "Soms gekozen om andere redenen"],
                        ["Malaat", "Over het algemeen goed verdragen", "Vaak gekoppeld aan energiemetabolisme"],
                        ["Oxide", "Minder goed opgenomen", "Geen eerste keuze voor doelgericht herstel"],
                    ],
                },
                {
                    "type": "paragraph",
                    "text": f"Producten vergelijken: {_LINK_MAG}.",
                },
                {"type": "subtitle", "text": "Omega-3 (EPA/DHA)"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>EPA en DHA</b> hebben onder voorwaarden EU-claims voor o.a. hart en (voor DHA) "
                        "hersenen/gezichtsvermogen. Er zijn <b>geen</b> vergelijkbare erkende etiketclaims voor "
                        "\"direct spierherstel\" of \"ontsteking\" — houd verwachtingen daarom nuchter; onderzoek "
                        "blijft lopen <super>9</super>."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": f"Vergelijken op EPA/DHA, versheid (TOTOX) en transparantie: {_LINK_OMEGA}.",
                },
                {"type": "subtitle", "text": "Vitamine D"},
                {
                    "type": "paragraph",
                    "text": (
                        "Vitamine D draagt o.a. bij aan normale spierfunctie en immuunsysteem — "
                        "<b>EFSA onder voorwaarden</b> <super>10</super>. Laat 25(OH)D desnoods meten voordat je "
                        "structureel suppleert."
                    ),
                },
                {"type": "subtitle", "text": "Zink"},
                {
                    "type": "paragraph",
                    "text": (
                        "Zink draagt bij aan normale eiwitsynthese en een werkend immuunsysteem — "
                        "<b>EFSA onder voorwaarden</b> <super>11</super>. Tekort komt voor bij intensief trainen "
                        "of weinig dierlijk eiwit."
                    ),
                },
                {"type": "subtitle", "text": "Creatine"},
                {
                    "type": "paragraph",
                    "text": (
                        "Creatine ondersteunt ATP-buffering bij korte, zware inspanning. In de EU bestaat een "
                        "erkende claim voor <b>opeenvolgende zeer korte bursts</b> bij voldoende dagdosis — "
                        "<b>geen</b> brede garantie op algemeen herstel op kantoor; onderzoek blijft relevant voor "
                        "krachtsporters <super>12</super>."
                    ),
                },
                {"type": "subtitle", "text": "Eiwitpoeder"},
                {
                    "type": "paragraph",
                    "text": (
                        "Eiwitpoeder is geconcentreerde voeding — whey, caseïne, isolaat of plantaardig kan helpen "
                        "als je via maaltijden onder je doel blijft. Na 40+ is de behoefte eerder hoger dan lager "
                        "<super>6</super>. EFSA erkent dat eiwit bijdraagt aan instandhouding van spiermassa "
                        "(onder productvoorwaarden)."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": f"Whey, isolaat en plantaardig: {_LINK_EIWIT}.",
                },
                {"type": "subtitle", "text": "Ashwagandha — alleen als stress het hoofdthema is"},
                {
                    "type": "paragraph",
                    "text": (
                        "Sommige extracten zijn getest in RCT’s waarin subjectieve stress soms lager uitkwam vs. "
                        "placebo <super>13</super>. Als herstel vooral uit overbelasting en stress voortkomt, kan dit "
                        "een gesprek met je arts waard zijn — geen vervanging voor slaap en workload."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Let op — Ashwagandha (geen EFSA-claim)",
                    "text": (
                        "Voor <b>Withania somnifera</b> gelden in de EU geen goedgekeurde gezondheidsclaims op "
                        "supplementetiketten; EFSA-dossiers staan veelal on-hold. Wat je leest steunt op literatuur, "
                        "niet op een officiële claim. Het ministerie van VWS overweegt aanvullende regels; signalen "
                        "kunnen medio 2026 relevant zijn. Gebruik op eigen risico; bespreek medicatie met je arts."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": f"Extractkwaliteit en withanolide-gehalte: {_LINK_ASH}.",
                },
                {
                    "type": "tip",
                    "title": "Stapel niet blind",
                    "text": (
                        "<b>Begin met één middel.</b> Wacht minimaal twee weken voordat je een tweede toevoegt — "
                        "zo zie je wat echt bijdroeg."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 8,
                            "text": (
                                "EFSA Panel on NDA. Scientific opinion on magnesium health claims. "
                                "EFSA J. 2009;7(9):1216."
                            ),
                        },
                        {
                            "num": 9,
                            "text": (
                                "Smith GI et al. Omega-3 polyunsaturated fatty acids in muscle health. Clin Sci. "
                                "2011;121(6):267. PMID: 21501117"
                            ),
                        },
                        {
                            "num": 10,
                            "text": (
                                "EFSA Panel on NDA. Scientific opinion on vitamin D health claims. "
                                "EFSA J. 2010;8(2):1468."
                            ),
                        },
                        {
                            "num": 11,
                            "text": (
                                "EFSA Panel on NDA. Scientific opinion on zinc health claims. "
                                "EFSA J. 2009;7(9):1229."
                            ),
                        },
                        {
                            "num": 12,
                            "text": (
                                "Rawson ES, Volek JS. Effects of creatine supplementation and resistance training "
                                "on muscle strength and weightlifting performance. J Strength Cond Res. "
                                "2003;17(4):822. PMID: 14636102"
                            ),
                        },
                        {
                            "num": 13,
                            "text": (
                                "Chandrasekhar K et al. A prospective, randomized double-blind, placebo-controlled "
                                "study of safety and efficacy of a high-concentration full-spectrum extract of "
                                "ashwagandha root in adults. Indian J Psychol Med. 2012;34(3):255. PMID: 23439798"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "06",
            "title": "Doseringen en veiligheid",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Dit zijn geen voorschriften, maar gangbare vensters uit onderzoek en praktijk. "
                        "<b>Medicatie, ziekte, zwangerschap of borstvoeding?</b> Overleg met je huisarts."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium (glycinaat/bisglycinaat)"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaak 200–400 mg <b>elementair</b> magnesium per dag — controleer het etiket",
                        "Neem ’s avonds 30–60 min voor slapen als dat past bij je routine",
                        "Begin laag bij een gevoelige maag",
                        "Houd ≥2 uur tussen magnesium en bepaalde antibiotica (chinolon, tetracycline), "
                        "schildklierhormoon of bisfosfonaten",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": f"Vergelijken: {_LINK_MAG}.",
                },
                {"type": "subtitle", "text": "Omega-3 (EPA+DHA)"},
                {
                    "type": "bullets",
                    "items": [
                        "250–500 mg EPA+DHA per dag bij een maaltijd is een veelgebruikte ondergrens rond "
                        "claimcontext",
                        "Hogere doses (1–2 g/dag) komen in studies voor — geen standaard voor iedereen",
                        "Kies een product met duidelijke versheidsindicatie (bijv. TOTOX laag)",
                        "Bloedverdunners: overleg bij hogere doses",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": f"Vergelijken: {_LINK_OMEGA}.",
                },
                {"type": "subtitle", "text": "Vitamine D"},
                {
                    "type": "bullets",
                    "items": [
                        "Bij afgesproken tekort vaak 1000–2000 IE/dag bij de vetrijkste maaltijd",
                        "Laat 25(OH)D meten voor je lang suppleert",
                        "Chronisch hoge doses kunnen ophopen — niet zomaar structureel >4000 IE/dag zonder arts",
                    ],
                },
                {"type": "subtitle", "text": "Zink"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaak 10–25 mg elementair zink per dag bij voeding — minder graag nuchter",
                        "Langdurig >40 mg/dag kan koperopname beknotten; sommige producten voegen koper toe",
                    ],
                },
                {"type": "subtitle", "text": "Creatine"},
                {
                    "type": "bullets",
                    "items": [
                        "3–5 g creatinemonohydraat per dag; gelijkmatige inname volstaat meestal (geen verplichte "
                        "laadfase)",
                        "Voldoende vocht; bij nierproblematiek altijd overleg",
                    ],
                },
                {"type": "subtitle", "text": "Eiwitpoeder"},
                {
                    "type": "bullets",
                    "items": [
                        "20–30 g eiwit per shake als aanvulling — niet ter vervanging van maaltijden",
                        "Houd het totaal in de buurt van 1,6–2,2 g/kg/dag als je actief traint <super>6</super>",
                    ],
                },
                {"type": "subtitle", "text": "Ashwagandha (extracten)"},
                {
                    "type": "bullets",
                    "items": [
                        "In studies vaak 300–600 mg gestandaardiseerd extract per dag, verdeeld over de dag",
                        "Evalueer na 4–6 weken; effect is zelden acuut",
                        "Extra voorzichtig bij schildklier en kalmerende medicatie; stop bij maagklachten en overleg",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": f"Vergelijken: {_LINK_ASH}.",
                },
            ],
        },
        {
            "number": "07",
            "title": "Veelgestelde vragen",
            "blocks": [
                {"type": "subtitle", "text": "Hoeveel eiwit heb ik echt nodig?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Voor actieve mannen 40+ wordt 1,6–2,2 g/kg/dag vaak aangehouden <super>6</super>. "
                        "Voor 85 kg: ruwweg 136–187 g per dag, verdeeld over 3–4 maaltijden."
                    ),
                },
                {"type": "subtitle", "text": "Kan ik magnesium combineren met creatine?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ja, ze hebben geen klassieke farmacologische clash. Praktisch: magnesium ’s avonds, "
                        "creatine rond training of bij een maaltijd. Begin liever met één middel en bouw rustig op."
                    ),
                },
                {"type": "subtitle", "text": "Mijn spierpijn duurt vijf dagen — normaal?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Structureel 5+ dagen pijn bij vergelijkbare training wijst vaak op onvoldoende herstel "
                        "(slaap, eiwit, volume). Pas dat eerst aan vóór je gaat stapelen."
                    ),
                },
                {"type": "subtitle", "text": "Werken ijsbaden voor herstel?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Koude-waterimmersie kan kortetermijnpijn dempen, maar mogelijk ook adaptatie na krachttraining "
                        "beïnvloeden bij frequent gebruik <super>14</super>. Als je prestatiegericht traint: spaarzaam "
                        "inzetten."
                    ),
                },
                {"type": "subtitle", "text": "Wanneer naar de huisarts?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Bij aanhoudende vermoeidheid ondanks voldoende slaap, onverklaard gewichtsverlies, pijn of "
                        "herstelklachten die je functioneren ondermijnen: professioneel laten onderzoeken. "
                        "Laat onder meer vitamine D, zink en ferritine zinvol afwegen — niet zelf ‘blog-diagnosticeren’."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 6,
                            "text": (
                                "Morton RW et al. Br J Sports Med. 2018;52(6):376. PMID: 28698222 — eiwit en "
                                "krachttraining."
                            ),
                        },
                        {
                            "num": 14,
                            "text": (
                                "Roberts LA et al. Post-exercise cold water immersion attenuates acute anabolic "
                                "signalling. J Physiol. 2015;593(18):4285. PMID: 26174323"
                            ),
                        },
                    ],
                },
            ],
        },
    ],
    "cta": {
        "title": "Wil je weten waar je staat?",
        "text": (
            "Herstel is één van de vier domeinen in de gratis Leefstijlcheck. In een paar minuten zie je waar je "
            "op scoort — en welk profiel bij jou past."
        ),
        "url_href": "https://perfectsupplement.nl/intake",
        "url_label": "perfectsupplement.nl/intake",
    },
    "disclaimer": {
        "title": "Disclaimer",
        "body": (
            "Deze gids is informatief en geen medisch advies. Bij aanhoudende herstelklachten, pijn of vermoeidheid: "
            "neem contact op met je huisarts. Supplementen vervangen geen diagnose of behandeling."
        ),
        "copyright": (
            "© 2026 PerfectSupplement.nl — Onafhankelijk. Onderbouwd. Voor mannen 40+."
        ),
    },
}

_GUIDE["all_references"] = []
_seen: set[int] = set()
for ch in _GUIDE["chapters"]:
    for block in ch.get("blocks", []):
        if block.get("type") == "references":
            for item in block["items"]:
                n = int(item["num"])
                if n not in _seen:
                    _seen.add(n)
                    _GUIDE["all_references"].append({"num": n, "text": item["text"]})

_GUIDE["all_references"].sort(key=lambda r: r["num"])

GUIDE = _GUIDE
