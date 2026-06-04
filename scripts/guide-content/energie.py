# scripts/guide-content/energie.py
# Energiegids — zelfde PDF-layout als stress/slaap via generate-guide-pdf.py

_LINK_SLAAP = (
    '<a href="https://perfectsupplement.nl/gids/slaap" color="#5A8F6A">'
    "<u>perfectsupplement.nl/gids/slaap</u></a>"
)
_LINK_STRESS = (
    '<a href="https://perfectsupplement.nl/gids/stress" color="#5A8F6A">'
    "<u>perfectsupplement.nl/gids/stress</u></a>"
)

_GUIDE = {
    "meta": {
        "header_banner": "ENERGIEGIDS VOOR MANNEN 40+",
        "output_filename": "energiegids-perfectsupplement.pdf",
        "pdf_title": "De Energiegids voor mannen 40+ — PerfectSupplement",
    },
    "title_page": {
        "label": "GRATIS ENERGIEGIDS",
        "title": "De Energiegids<br/>voor mannen 40+",
        "subtitle": (
            "Meer pit overdag — met slaap, ritme, beweging en voeding als hoofdlijn. Supplementen alleen als "
            "extra, met realistische verwachtingen."
        ),
        "usps": [
            "Waarom ‘alleen harder werken’ je energie kan laten dalen na je veertigste",
            "Vier praktische hefbomen: slaap, beweging, maaltijdpatronen en daglicht",
            "Een vierwekenplan om oorzaken te zien vóór dat je stapelt op shortcuts",
            "Welke micronutriënten in onderzoek terugkomen — en wat officieel mag worden gezegd (EFSA)",
        ],
        "quote": (
            "Duurzame energie is bijna nooit één pil. Het is een keten van slaap, herstel en voorspelbare "
            "gewoontes die je wél volhoudt."
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
                        "Je hebt misschien de Leefstijlcheck gedaan en een profiel als <b>Lage Batterij</b> — "
                        "maar <b>je hoeft die check niet te hebben gedaan</b> om hier iets aan te hebben. "
                        "De punten hieronder zijn je simpele instaptest."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "‘Minder energie’ is geen verwijt. Het betekent vaak dat aanvoer (slaap, voeding, rust) "
                        "en verbruik (stress, training, schermen) uit balans zijn geraakt."
                    ),
                },
                {"type": "subtitle", "text": "Herken je dit bij jezelf?"},
                {
                    "type": "bullets",
                    "items": [
                        "Je bent fit genoeg, maar je hoofd voelt vaak wollig",
                        "Je hebt een tweede koffie nodig voordat je echt op gang komt",
                        "Je stort in na het eten of juist als je te lang stilzit",
                        "Je weekend voelt als bijladen dat maar niet lukt",
                        "Je bent korter lontje tegen mensen om je heen",
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
            "title": "Waarom energie na 40 anders voelt",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Je lichaam wordt niet ‘kapot’ op je veertigste — maar je buffer wordt kleiner. "
                        "Kleine uitspattingen die je tien jaar geleden opving, merk je nu harder."
                    ),
                },
                {"type": "subtitle", "text": "Slaap en hormonen"},
                {
                    "type": "paragraph",
                    "text": (
                        "Structureel te weinig slaap hangt samen met lagere testosteronspiegels bij gezonde "
                        "mannen in onderzoeksopstellingen — een hint dat herstel en energie samenhangen, "
                        "geen diagnose voor jouw situatie<super>1</super>."
                    ),
                },
                {"type": "subtitle", "text": "Spieren, conditie en ‘brandstofgebruik’"},
                {
                    "type": "paragraph",
                    "text": (
                        "Vanaf middelbare leeftijd neemt spiermassa geleidelijk af als je niets compenseert met "
                        "beweging en eiwit <super>2</super>. Minder spiermassa kan dagelijks werk zwaarder laten "
                        "aanvoelen — ook zonder dat je ziek bent."
                    ),
                },
                {"type": "subtitle", "text": "Mitochondriën — kort uitgelegd"},
                {
                    "type": "paragraph",
                    "text": (
                        "In je cellen zitten kleine ‘energiefabriekjes’ (mitochondriën). Die worden ouder en "
                        "minder flexibel — onderzoek naar ontspanning daarvan is nog volop gaande. "
                        "Praktisch voor jou: beweging en voldoende slaap zijn de meest robuuste hefbomen om "
                        "je systeem scherp te houden <super>3</super><super>4</super>."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Waarom dit geen ‘lazy’ verhaal is",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Je hoeft geen marathon te lopen. Wel wil je voorspelbare routines waar je brein op "
                        "kan vertrouwen — dan hoeft je stresssysteem minder bij te springen."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 1,
                            "text": (
                                "Leproult R, Van Cauter E. Effect of 1 week of sleep restriction on testosterone "
                                "levels in young healthy men. JAMA. 2011;305(21):2173-2174."
                            ),
                        },
                        {
                            "num": 2,
                            "text": (
                                "Hunter GR et al. Exercise training and energy expenditure following weight loss. "
                                "Med Sci Sports Exerc. 2015 — discussie verlies spiermassa en energieverbruik bij "
                                "volwassenen."
                            ),
                        },
                        {
                            "num": 3,
                            "text": (
                                "Booth FW, Roberts CK, Laye MJ. Lack of exercise is a major cause of chronic diseases. "
                                "Compr Physiol. 2012 — over gezond gedrag en stofwisseling."
                            ),
                        },
                        {
                            "num": 4,
                            "text": (
                                "Nicolson GL. Mitochondrial dysfunction and chronic disease: treatment with natural "
                                "supplements. Integr Med (Encinitas). 2014 — review (interpretatie voorzichtig; "
                                "geen reden om megadosissen te nemen)."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "03",
            "title": "Waar je energie naartoe lekt",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Voordat je iets koopt bij de drogist, helpt het om te weten waar het gas naartoe gaat."
                    ),
                },
                {"type": "subtitle", "text": "Chronische stress en hersenen"},
                {
                    "type": "paragraph",
                    "text": (
                        "Langdurige stress kost je mentaal brandstof — concentratie en besluitvaardigheid dalen "
                        "vaak eerder dan spiermassa <super>5</super>. Zie ook onze stressgids via "
                        f"{_LINK_STRESS}."
                    ),
                },
                {"type": "subtitle", "text": "Slaap die er niet is — of van slechte kwaliteit"},
                {
                    "type": "paragraph",
                    "text": (
                        "Zonder diepe slaap mis je herstel van hersenen en hormonen. Start met de slaapgids via "
                        f"{_LINK_SLAAP} voordat je energie aan caféïne hangt."
                    ),
                },
                {"type": "subtitle", "text": "Te lang stilzitten"},
                {
                    "type": "paragraph",
                    "text": (
                        "Meerdere studies laten zien dat lichte beweging verspreid over de dag mood en alertheid "
                        "kan ondersteunen ten opzichte van uren achter elkaar zitten <super>6</super>."
                    ),
                },
                {"type": "subtitle", "text": "Suikerpieken en cafeïne-rollercoasters"},
                {
                    "type": "paragraph",
                    "text": (
                        "Grote hoeveelheden snelle koolhydraten geven een korte piek en vaak een dip daarna. "
                        "Cafeïne maskeert moeheid — het lost onderliggende slaaptekort niet op."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 5,
                            "text": (
                                "McEwen BS. Neurobiological and systemic effects of chronic stress. Chronic Stress "
                                "(Thousand Oaks). 2017 — review stress en cognitie."
                            ),
                        },
                        {
                            "num": 6,
                            "text": (
                                "Benatti FB, Ried-Larsen M. The effects of breaking up sedentary time with "
                                "physical activity on metabolic profiles. J Phys Act Health. 2015."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "04",
            "title": "Vier hefbomen voor meer pit in je batterij",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Je hoeft niet alles tegelijk te veranderen. Pak twee hefbomen die het minst pijn doen in "
                        "jouw schema — en hou die vier weken vol."
                    ),
                },
                {"type": "subtitle", "text": "1. Slaap als basis"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaste opstaantijd, ook in het weekend",
                        "Geen scherm in de laatste 45 min voor slapen",
                        "Slaapkamer koel en donker",
                    ],
                },
                {"type": "subtitle", "text": "2. Beweging die oplaadt — niet alleen uitput"},
                {
                    "type": "paragraph",
                    "text": (
                        "Reviews suggereren dat gecontroleerd sporten bij mensen met langdurige vermoeidheid "
                        "voorzichtig kan worden opgebouwd en soms klachten verbetert — maar individuele "
                        "verschillen zijn groot en medische begeleiding is slim bij ziekte <super>7</super>."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        "Dagelijks 25–40 minuten wandelen buiten",
                        "Twee keer per week korte krachttraining",
                        "Voorkom weken achter elkaar zonder enige conditiebelasting",
                    ],
                },
                {"type": "subtitle", "text": "3. Eiwit en regelmaat op je bord"},
                {
                    "type": "paragraph",
                    "text": (
                        "Een stevig ontbijt met eiwit kan bij veel mensen de bloedsuiker rustiger houden dan "
                        "alleen koffie en een croissant <super>8</super>."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        "Elke maaltijd: handje eiwit (vis, peulvrucht, zuivel, vlees naar voorkeur)",
                        "Vezels uit groente en volkoren om pieken te dempen",
                        "Drink water — dorst voelt vaak als vermoeidheid",
                    ],
                },
                {"type": "subtitle", "text": "4. Daglicht 's ochtends"},
                {
                    "type": "paragraph",
                    "text": (
                        "Licht kort na het opstaan helpt je biologische klok scherp te zetten — dat ondersteunt "
                        "alertheid later op de dag <super>9</super>."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 7,
                            "text": (
                                "Larun L et al. Exercise therapy for chronic fatigue syndrome. Cochrane Database "
                                "Syst Rev. 2019 — voorzichtige exercisetherapie onder voorwaarden."
                            ),
                        },
                        {
                            "num": 8,
                            "text": (
                                "Leidy HJ et al. Beneficial effects of a higher-protein breakfast on hormonal "
                                "signals controlling intake. Am J Clin Nutr. 2013."
                            ),
                        },
                        {
                            "num": 9,
                            "text": (
                                "Blume C et al. Effects of light on human circadian rhythms, sleep and mood. "
                                "Somnologie. 2019."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "05",
            "title": "Het vierwekenplan (met energielog)",
            "blocks": [
                {"type": "subtitle", "text": "Week 1: Meet je baseline"},
                {
                    "type": "paragraph",
                    "text": "<b>Doel:</b> je hoeft nog niets groot te veranderen — alleen eerlijk kijken.",
                },
                {
                    "type": "bullets",
                    "items": [
                        "Noteer 1–10 energie om 11:00 en om 16:00",
                        "Hoeveel uur sliep je werkelijk — niet hoe lang je in bed lag",
                        "Welke maaltijd ging vooraf aan een dip?",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Mini-log (één regel per dag)",
                    "text": (
                        "<b>Slaapuren</b> | <b>cafeïne na 14:00 ja/nee</b> | <b>beweging minuten</b> | "
                        "<b>hoofdpijn/jitters ja/nee</b>. Na een week zie je patronen sneller dan je denkt."
                    ),
                },
                {"type": "subtitle", "text": "Week 2: Slaap eerst strak trekken"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaste wake-up",
                        "Schermloze avond",
                        "Geen alcohol als slaapmiddel",
                    ],
                },
                {"type": "subtitle", "text": "Week 3: Beweging + daglicht"},
                {
                    "type": "bullets",
                    "items": [
                        "Dagelijks buiten wandelen binnen 90 min na opstaan",
                        "Twee krachtsessies van maximaal 45 minuten",
                    ],
                },
                {"type": "subtitle", "text": "Week 4: Eén aanpassing op je bord"},
                {
                    "type": "bullets",
                    "items": [
                        "Voeg structureel eiwit toe aan ontbijt en lunch",
                        "Laat één suikerrijke gewoonte los (energy drink, zoete koek om 15:00)",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Meet daarna opnieuw met de Leefstijlcheck — zo zie je of het een trend wordt of een "
                        "toevalstreffer."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 10,
                            "text": (
                                "Carney CE et al. The consensus sleep diary: standardizing prospective "
                                "self-monitoring. Sleep. 2012."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "06",
            "title": "Supplementen die vaak ter sprake komen",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Voeding en slaap eerst.</b> Wat hier staat is geen vervanging voor bloedonderzoek als "
                        "je klachten hebt."
                    ),
                },
                {
                    "type": "tip",
                    "title": "EFSA — wat mag wél op een label",
                    "text": (
                        "De Europese voedselautoriteit keurt alleen specifieke claims goed. "
                        "<b>Vitamine D, vitamine B12, ijzer en magnesium</b> hebben zulke claims "
                        "— maar alleen als het product aan strenge voorwaarden voldoet. "
                        "Kruiden zoals <b>ginseng of rhodiola</b> hebben doorgaans <b>geen</b> vergelijkbare "
                        "erkende claims voor energie."
                    ),
                },
                {"type": "subtitle", "text": "Vitamine D"},
                {
                    "type": "paragraph",
                    "text": (
                        "Vitamine D draagt o.a. bij aan een normale werking van het immuunsysteem en aan het "
                        "behoud van normale botten — <b>EFSA-goedgekeurde claims onder voorwaarden</b>. "
                        "Dat zegt nog niet automatisch dat jij je fitter voelt; tekort moet eerst zinvol zijn "
                        "<super>11</super>."
                    ),
                },
                {"type": "subtitle", "text": "Vitamine B12 en ijzer"},
                {
                    "type": "paragraph",
                    "text": (
                        "B12 en ijzer zijn onderdeel van zuurstoftransport en energiestofwisseling. "
                        "<b>B12 draagt bij aan normaal energieleverend metabolisme</b> (EFSA). "
                        "<b>Ijzer draagt bij aan vermindering van moeheid</b> (EFSA). "
                        "Suppletie heeft vooral zin bij vastgesteld tekort of verhoogd risico — niet ‘voor de leuk’ "
                        "<super>12</super><super>13</super>."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium draagt bij aan een normale werking van het zenuwstelsel en kan bijdragen aan "
                        "vermindering van vermoeidheid — <b>EFSA-goedgekeurd onder voorwaarden</b>. "
                        "Effectvariatie blijft groot tussen mensen <super>14</super>."
                    ),
                },
                {"type": "subtitle", "text": "Omega-3 (EPA/DHA)"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>EPA en DHA</b> worden in officieuze EU‑lijsten gekoppeld aan hart‑ en hersenclaims "
                        "(DHA‑drempels voor hersenen en gezichtsvermogen). "
                        "Gebruik deze claims om verwachtingen te kaderen — <b>geen Europese supplementclaim hier op "
                        "‘direct meer energie’</b>; dat blijft leefstijl + waar nodig medisch onderzoek."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Ashwagandha (extracten worden buiten officiële claims besproken)",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Geen EU‑labels met goedgekeurde gezondheidsclaims — EFSA dossiers staan veelal \"on‑hold\". "
                        "Studies bespreken soms beleefde stress of subjectieve vermoeidheid, maar overdraag je dat "
                        "niet naar harde garanties.</b> VWS bekijkt aanvullende regels; signalen medio 2026 mogelijk relevant. "
                        "Gebruik op eigen risico."
                    ),
                },
                {"type": "subtitle", "text": "Co-enzym Q10"},
                {
                    "type": "paragraph",
                    "text": (
                        "CoQ10 wordt onderzocht bij statingebruikers en bij sommige vormen van ernstige vermoeidheid "
                        "— resultaten zijn <b>niet consistent</b> en noemen zich geen wondermiddel "
                        "<super>15</super>. Overleg met je arts als je medicatie gebruikt."
                    ),
                },
                {"type": "subtitle", "text": "Creatine"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Creatine</b> fungeert vooral als creatinefosfaat‑buffer bij korte, zware spiertaken "
                        "(onderzoekscontext verwijst ook naar cognitie tijdens slaaptekort — dat is géén brede dagclaim). "
                        "De erkende EU‑claim beschrijft zeer korte, intense inspanning bij voldoende dagdosis; "
                        "formuleer geen garantie voor algemeen energieniveau op kantoor."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Stapel niet blind",
                    "text": (
                        "<b>Begin met één middel</b> (vaak vitamine D of magnesium als arts akkoord is). "
                        "Wacht minimaal twee weken voor je een tweede toevoegt — zo weet je wat bijdroeg."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 11,
                            "text": (
                                "EFSA — goedgekeurde claims vitamine D (immunsysteem, botten, spieren) EU-verordening "
                                "432/2012."
                            ),
                        },
                        {
                            "num": 12,
                            "text": (
                                "EFSA — vitamine B12 draagt bij tot een normaal energieleverend metabolisme "
                                "(EU-verordening 432/2012)."
                            ),
                        },
                        {
                            "num": 13,
                            "text": (
                                "EFSA — ijzer draagt bij tot vermindering van moeheid (EU-verordening 432/2012)."
                            ),
                        },
                        {
                            "num": 14,
                            "text": (
                                "EFSA — magnesium o.a. zenuwstelsel en vermoeidheid (EU-verordening 432/2012)."
                            ),
                        },
                        {
                            "num": 15,
                            "text": (
                                "Potgieter M et al. Coenzyme Q10 in the treatment of statin-associated myalgia — "
                                "mixed trial outcomes. Review studies variabel succes."
                            ),
                        },
                        {
                            "num": 16,
                            "text": (
                                "Rawson ES et al. Creatine supplementation and cognitive performance in elderly "
                                "individuals. Aging Neuropsychol Cogn. 2008 — context-specifiek."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "07",
            "title": "Wanneer energie-onderzoek slim is",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Deze gids is geen vervanging voor onderzoek als je signalen hebt die niet passen bij "
                        "‘alleen te weinig slaap’."
                    ),
                },
                {"type": "subtitle", "text": "Bel je huisarts bij onder andere"},
                {
                    "type": "bullets",
                    "items": [
                        "Onverklaard gewichtsverlies of nachtzweten",
                        "Benauwdheid, druk op de borst, hartritmestoornissen",
                        "Diepe vermoeidheid na een infectie die maar niet wegtrekt",
                        "Extreme dorst, veel plassen of plotseling zichtverslechtering",
                        "Langdurige somberheid samen met energieverlies",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Laat bloedbeeld (hemoglobine, ferritine, B12, schildklier, glucose) zinvol afwegen door "
                        "je arts — niet zelf interpreteren via blogs."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 17,
                            "text": (
                                "NICE guideline NG116 — Chronic fatigue syndrome/myalgic encephalomyelitis: "
                                "diagnosis en management principles (Engeland, referentiekader)."
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "08",
            "title": "Veelgestelde vragen",
            "blocks": [
                {"type": "subtitle", "text": "Helpen energy shots?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ze geven een korte prikkel door cafeïne en suiker. Je onderliggende slaaptekort blijft "
                        "bestaan — en dips worden vaak dieper."
                    ),
                },
                {"type": "subtitle", "text": "Moet ik intermittent fasting voor energie?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Sommige mensen voelen zich helderder; anderen juist duizelig of chagrijnig. "
                        "Er is geen universeel ‘beste’ schema — vooral niet als je al streng sport."
                    ),
                },
                {"type": "subtitle", "text": "Is een multivitamine voldoende?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Multivitaminen dekken gemiddeld kleine gaten — ze voorkomen geen slaapproblemen of "
                        "burn-out. Bij concrete tekorten zijn gerichte doses vaak logischer na bloedonderzoek."
                    ),
                },
                {"type": "subtitle", "text": "Kan ik creatine veilig langdurig gebruiken?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Voor gezonde volwassenen wordt langdurig gebruik in veel reviews als redelijk veilig "
                        "beschouwd bij adequate hydratatie — maar nierproblemen of medicatie wijken daarvan af. "
                        "Vraag het aan je arts."
                    ),
                },
                {"type": "subtitle", "text": "Ik sport al fanatiek maar ben gesloopt — hoe kan dat?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Dan is ‘meer sporten’ zelden het antwoord. Kijk naar slaap, calorieën, stress en "
                        "hersteldagen. Soms staat je zenuwstelsel te lang ‘aan’ door te veel harde prikkels."
                    ),
                },
            ],
        },
        {
            "number": "09",
            "title": "Tot slot",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Meer energie is zelden een sprint. Het is een ketting van kleine keuzes die je brein "
                        "herkent: vaste wake-up, echte maaltijden, daglicht, en beweging die niet alleen maar "
                        "afbreuk doet."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Kies twee punten uit deze gids en geef ze vier weken de tijd — daarna pas denken aan "
                        "supplementen als aanvulling."
                    ),
                },
                {"type": "paragraph", "text": "— Het PerfectSupplement-team"},
            ],
        },
    ],
    "cta": {
        "title": "Wil je weten waar je staat?",
        "text": (
            "Energie is een van de zes domeinen in de gratis Leefstijlcheck. In een paar minuten zie je waar "
            "je op scoort — en welk profiel bij jou past."
        ),
        "url_href": "https://perfectsupplement.nl/intake",
        "url_label": "perfectsupplement.nl/intake",
    },
    "disclaimer": {
        "title": "Disclaimer",
        "body": (
            "Deze gids is informatief en geen medisch advies. Bij aanhoudende vermoeidheid, duizeligheid, "
            "hartklachten of andere acute klachten: neem contact op met je huisarts. Supplementen vervangen "
            "geen diagnose of behandeling."
        ),
        "copyright": (
            "© 2026 PerfectSupplement.nl — Onafhankelijk. Onderbouwd. Voor mannen 40+."
        ),
    },
}

_GUIDE["all_references"] = []
_seen = set()
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
