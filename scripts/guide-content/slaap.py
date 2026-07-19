# scripts/guide-content/slaap.py
# Content voor slaapgids-PDF (zie README.md voor schema).

_GUIDE = {
    "meta": {
        "header_banner": "SLAAPGIDS VOOR MANNEN 40+",
        "output_filename": "slaapgids-perfectsupplement.pdf",
        "pdf_title": "Slaapgids voor mannen 40+ — PerfectSupplement",
    },
    "title_page": {
        "label": "GRATIS SLAAPGIDS",
        "title": "Beter slapen begint<br/>met begrijpen",
        "subtitle": (
            "Een praktische gids voor mannen 40+: van herkenning en uitleg naar "
            "leefstijl, een persoonlijk plan en — pas daarna — supplementen."
        ),
        "usps": [
            "Waarom slaap na je 40e verandert — en wat je daar zelf aan kunt doen",
            "Vier slaaponderdelen: Inslapen, Doorslapen, Regelmaat en Uitgerust wakker",
            "Leefstijl en ritme eerst; supplementen alleen als aanvulling",
            "Checklist en actieplan om één of twee verbeterpunten te kiezen",
        ],
        "quote": (
            "Slaap is het fundament waar stress en herstel op bouwen. Begin met ritme en leefstijl — "
            "supplementen zijn pas een gerichte aanvulling als dat basisplaatje klopt."
        ),
        "quote_source": "PerfectSupplement — redactioneel uitgangspunt",
        "footer_url": "perfectsupplement.nl",
    },
    "chapters": [
        {
            "number": "01",
            "title": "Waarom slaap verandert na je 40e",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Na je 40e merk je vaak drie dingen in je slaap. Dat is biologie — geen karakter. "
                        "Als je begrijpt wat er verandert, kun je gerichter kiezen wat je wél aanpast."
                    ),
                },
                {"type": "subtitle", "text": "Je maakt minder melatonine aan"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Melatonine</b> vertelt je lichaam dat het tijd is om rust te nemen. Donker helpt "
                        "die aanmaak. Onderzoek suggereert dat je eigen aanmaak na je 30e en 40e stap voor stap "
                        "kan dalen<super>1</super><super>2</super>. In de praktijk voelt dat als minder makkelijk "
                        "inslapen en wat lichter slapen."
                    ),
                },
                {"type": "subtitle", "text": "Je diepe slaap kan korter worden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je slaap loopt in rondjes: lichte slaap, diepe slaap en droomslaap (REM). "
                        "<b>Diepe slaap</b> is het deel waarin je lichaam echt herstelt. Studies laten zien "
                        "dat die fase met de jaren korter kan worden — ook als je nog even lang in bed ligt"
                        "<super>3</super>. Je wordt dan sneller wakker en staat minder fris op."
                    ),
                },
                {"type": "subtitle", "text": "Je stresshormoon blijft soms te hoog hangen"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Cortisol</b> is je belangrijkste stresshormoon. 's Avonds hoort het te zakken. "
                        "Bij langdurige spanning blijft het soms te hoog — dan sta je nog ‘aan’ terwijl je "
                        "eigenlijk wilt slapen<super>4</super>. Je voelt je dan vaak moe én gespannen tegelijk."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Herken je dit?",
                    "text": (
                        "Inslapen lukt nog, maar rond 03:00 lig je wakker met een bonzend hart. "
                        "Dat patroon komt vaker voor na je 40e — en het vraagt andere aanpak dan "
                        "‘gewoon harder proberen’ in bed."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "In het volgende hoofdstuk kijken we hoe je slaap in de praktijk uit elkaar valt — "
                        "niet in één cijfer, maar in onderdelen die je kunt verbeteren."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 1,
                            "text": (
                                "Wurtman RJ. Age-Related Decreases in Melatonin Secretion—Clinical Consequences. "
                                "J Clin Endocrinol Metab. 2000;85(6):2135-2136. PMID: 10852443"
                            ),
                        },
                        {
                            "num": 2,
                            "text": (
                                "Hardeland R. Melatonin in Aging and Disease—Multiple Consequences of Reduced Secretion, "
                                "Options and Limits of Treatment. Aging Dis. 2012;3(2):194-225. PMC3377831"
                            ),
                        },
                        {
                            "num": 3,
                            "text": (
                                "Ohayon MM et al. Meta-analysis of quantitative sleep parameters from childhood to old "
                                "age in healthy individuals. Sleep. 2004;27(7):1255-1273. PMID: 15586779"
                            ),
                        },
                        {
                            "num": 4,
                            "text": (
                                "Leproult R, Van Cauter E. Effect of 1 week of sleep restriction on testosterone levels "
                                "in young healthy men. JAMA. 2011;305(21):2173-2174. PMID: 21632481"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "02",
            "title": "Hoe goed slaap jij?",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Goede slaap gaat niet alleen over hoeveel uur je slaapt. Veel mannen focussen op "
                        "Slaapduur, terwijl het probleem ergens anders zit: inslapen, doorslapen, ritme "
                        "of hoe je wakker wordt."
                    ),
                },
                {
                    "type": "table",
                    "headers": ["Onderdeel", "Wat het zegt over je slaap"],
                    "rows": [
                        ["Inslapen", "Hoe lang je wakker ligt voordat je slaapt"],
                        ["Doorslapen", "Of je 's nachts wakker wordt en weer doorslaapt"],
                        ["Regelmaat", "Of je op vaste tijden gaat slapen en opstaat"],
                        ["Uitgerust wakker", "Hoe je je voelt als je wakker wordt"],
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Samen geven deze vier onderdelen een beeld van je slaap. "
                        "<b>Slaapduur</b> hoort daarbij als context — minder dan 6,5 uur kan herstel "
                        "onder druk zetten, maar lang slapen zonder uitgerust te worden wijst op "
                        "iets anders dan alleen te weinig uren."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Waarom kijken we naar meer dan uren?",
                    "text": (
                        "Veel mensen denken dat slaap alleen om het aantal uren draait. In werkelijkheid "
                        "zien we vaker problemen met Regelmaat, Doorslapen of Uitgerust wakker. "
                        "Daarom is het zinvol om per onderdeel te kijken waar jij winst kunt halen."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Herken je al een zwak punt? In het volgende hoofdstuk gaan we per onderdeel "
                        "dieper in op wat het betekent — en wat je concreet kunt doen."
                    ),
                },
            ],
        },
        {
            "number": "03",
            "title": "Welk slaapprobleem herken jij?",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Waar herken jij jezelf het meest in? Vink aan wat past en lees het bijbehorende "
                        "blok. Elke sectie volgt dezelfde logica: herkenning, uitleg, praktische stappen — "
                        "supplementen pas als laatste."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        "□ Ik lig lang wakker voordat ik slaap → <b>Inslapen</b>",
                        "□ Ik word vaak 's nachts wakker → <b>Doorslapen</b>",
                        "□ Mijn bed- en opstaantijden wisselen → <b>Regelmaat</b>",
                        "□ Ik word niet uitgerust wakker → <b>Uitgerust wakker</b>",
                        "□ Ik slaap minder dan 6,5 uur → zie ook hoofdstuk 05 en 07",
                    ],
                },
                {"type": "subtitle", "text": "Inslapen"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Herkenning:</b> je ligt regelmatig langer dan 30 minuten wakker. Je hoofd blijft "
                        "actief terwijl je lichaam rust wil."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Waarom dit ontstaat:</b> schermlicht 's avonds, cafeïne na de lunch, piekeren "
                        "of geen vaste Avondafbouw. Je systeem krijgt te weinig signalen dat het nacht wordt."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": "<b>Wat helpt meestal:</b>",
                },
                {
                    "type": "bullets",
                    "items": [
                        "Leg je telefoon 30 minuten vóór bed buiten bereik",
                        "Dim de lichten een uur voor bedtijd",
                        "Geen cafeïne meer na de lunch",
                        "Een vast afbouw-ritueel: zelfde volgorde, zelfde tijd",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Supplementen:</b> pas overwegen als Avondafbouw en Regelmaat al op orde zijn "
                        "(zie hoofdstuk 08)."
                    ),
                },
                {"type": "subtitle", "text": "Doorslapen"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Herkenning:</b> je wordt 's nachts wakker en slaapt niet altijd weer door. "
                        "Soms lig je lang wakker."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Waarom dit ontstaat:</b> alcohol, te warme slaapkamer, stress die je meeneemt "
                        "naar bed, of een onregelmatig ritme. Je slaap wordt lichter na je 40e."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": "<b>Wat helpt meestal:</b>",
                },
                {
                    "type": "bullets",
                    "items": [
                        "Plan 2–3 avonden per week zonder alcohol",
                        "Houd je slaapkamer koel en donker",
                        "Schrijf 's avonds kort op wat in je hoofd zit",
                        "Sta bij lang wakker liggen even op in plaats of te malen",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Supplementen:</b> eerst alcohol en slaapkamer aanpakken. Glycine of magnesium "
                        "kunnen soms helpen als de basis al klopt."
                    ),
                },
                {"type": "subtitle", "text": "Regelmaat"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Herkenning:</b> je bed- en opstaantijden wisselen. In het weekend slaap je uit — "
                        "maandag voelt als jetlag."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Waarom dit ontstaat:</b> wisselende werktijden, laat avondeten, schermen tot laat, "
                        "te weinig Ochtendlicht. Je interne klok mist houvast."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": "<b>Wat helpt meestal:</b>",
                },
                {
                    "type": "bullets",
                    "items": [
                        "Sta elke ochtend rond dezelfde tijd op — ook in het weekend",
                        "Kies één vaste bedtijd en houd 'm 3 nachten vast",
                        "Ga kort naar buiten in het ochtendlicht na het opstaan",
                        "Vermijd lange dutjes overdag",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Supplementen:</b> Regelmaat los je meestal met Vaste wektijd en Ochtendlicht — "
                        "niet met pillen."
                    ),
                },
                {"type": "subtitle", "text": "Uitgerust wakker"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Herkenning:</b> je slaapt wel uren, maar wordt moe wakker — alsof je "
                        "niet geslapen hebt."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Waarom dit ontstaat:</b> slechte Doorslapen, te korte diepe slaap, alcohol, "
                        "langdurige stress of onregelmatig ritme. Uitgerust wakker is vaak het resultaat "
                        "van andere zwakke punten."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Wat helpt meestal:</b> verbeter eerst Inslapen, Doorslapen en Regelmaat. "
                        "Uitgerust wakker volgt vaak vanzelf als de basis beter wordt."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Supplementen:</b> geen enkel supplement compenseert slechte slaaphygiëne. "
                        "Pas overwegen als leefstijl en ritme al op orde zijn."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Veel mannen passen in één van de herkenbare patronen uit het volgende hoofdstuk — "
                        "dat helpt om je focus te kiezen."
                    ),
                },
            ],
        },
        {
            "number": "04",
            "title": "Herkenbare slaaptypes",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Geen diagnose — wel herkenning. De meeste mannen passen het best in één van "
                        "deze vier patronen. Kijk welke het meest op jou lijkt."
                    ),
                },
                {
                    "type": "table",
                    "headers": ["Type", "Herkenning", "Waar begin je?"],
                    "rows": [
                        [
                            "De Piekeraar",
                            "Lang wakker liggen · hoofd actief · wisselend ritme",
                            "Avondafbouw · scherm · magnesium",
                        ],
                        [
                            "De lichte slaper",
                            "Meerdere keren wakker · gevoelig voor alcohol/cafeïne",
                            "Doorslapen · koele kamer · alcohol beperken",
                        ],
                        [
                            "De vroege wakkere",
                            "Wordt 04:30–05:30 wakker · kan niet verder slapen",
                            "Regelmaat · Ochtendlicht · niet te vroeg naar bed",
                        ],
                        [
                            "De uitgeputte slaper",
                            "Slaapt lang · wordt niet uitgerust wakker",
                            "Doorslapen + Regelmaat · geen extra uren in bed",
                        ],
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Scoor je op meerdere onderdelen tegelijk zwak? Dan is slaap vaak je belangrijkste "
                        "verbeterpunt — ongeacht welk type het meest past."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Nu je weet waar je staat, kijken we naar de leefstijlhefbomen die voor "
                        "de meeste mannen het meeste opleveren."
                    ),
                },
            ],
        },
        {
            "number": "05",
            "title": "Leefstijl die echt verschil maakt",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Supplementen kunnen ondersteunen — maar leefstijl en ritme zijn de basis. "
                        "Deze vier hefbomen leveren voor de meeste mannen meer op dan elke capsule."
                    ),
                },
                {"type": "subtitle", "text": "Vaste wektijd"},
                {
                    "type": "paragraph",
                    "text": (
                        "Sta elke ochtend rond dezelfde tijd op — ook in het weekend. Je interne klok "
                        "heeft houvast nodig. Dat is de basis van Regelmaat."
                    ),
                },
                {"type": "subtitle", "text": "Ochtendlicht"},
                {
                    "type": "paragraph",
                    "text": (
                        "Binnen 30 minuten na opstaan even naar buiten. Daglicht zet je biologische klok "
                        "op tijd<super>5</super>. Zelfs 10 minuten helpt."
                    ),
                },
                {"type": "subtitle", "text": "Avondafbouw"},
                {
                    "type": "paragraph",
                    "text": (
                        "Bouw je avond bewust af in het laatste uur voor bed. Dim lichten, leg schermen weg, "
                        "doe iets rustigs in dezelfde volgorde. Je lichaam leert wanneer het mag zakken."
                    ),
                },
                {"type": "subtitle", "text": "Cafeïne-cutoff"},
                {
                    "type": "paragraph",
                    "text": (
                        "Geen cafeïne meer na de lunch. Na 5–6 uur zit nog de helft in je bloed"
                        "<super>6</super>. Koffie om 15:00 kan 's avonds nog spelen."
                    ),
                },
                {"type": "subtitle", "text": "Veelgemaakte valkuilen"},
                {
                    "type": "bullets",
                    "items": [
                        "Scherm tot aan bed — remt melatonine<super>7</super>",
                        "Alcohol als slaapmiddel — je wordt lichter wakker",
                        "Weekend uitslapen — sociale jetlag op maandag",
                        "Te lang in bed liggen terwijl je niet slaapt",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "In het volgende hoofdstuk zetten we dit om in een concreet plan van zeven dagen — "
                        "stap voor stap, zonder alles tegelijk te willen veranderen."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 5,
                            "text": (
                                "Blume C et al. Effects of light on human circadian rhythms, sleep and mood. "
                                "Somnologie. 2019;23(3):147-156. PMC6751071"
                            ),
                        },
                        {
                            "num": 6,
                            "text": (
                                "Drake C et al. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. "
                                "J Clin Sleep Med. 2013;9(11):1195-1200. PMC3805807"
                            ),
                        },
                        {
                            "num": 7,
                            "text": (
                                "Chang AM et al. Evening use of light-emitting eReaders negatively affects sleep. "
                                "Proc Natl Acad Sci USA. 2015;112(4):1232-1237. PMID: 25535358"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "06",
            "title": "Je slaap verbeteren in 7 dagen",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Dit plan bouwt voort op de hefbomen uit het vorige hoofdstuk. "
                        "Je hoeft niet perfect te zijn — kies wat je wél volhoudt."
                    ),
                },
                {"type": "subtitle", "text": "Dag 1–2: Basis"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaste wektijd — ook in het weekend",
                        "Cafeïne-cutoff: niet na de lunch",
                        "Slaapkamer koeler en donkerder maken",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Niet doen (fase 1)",
                    "text": "Geen lange dutjes overdag. Geen alcohol ‘om te ontspannen’.",
                },
                {"type": "subtitle", "text": "Dag 3–4: Avondafbouw"},
                {
                    "type": "bullets",
                    "items": [
                        "Schermen weg vanaf 45–60 min voor slapen",
                        "Eenvoudig ritueel: lezen, stretch, ademhaling",
                        "Geen zware discussies of werk-mail vlak voor bed",
                    ],
                },
                {"type": "subtitle", "text": "Dag 5–6: Ochtendlicht"},
                {
                    "type": "bullets",
                    "items": [
                        "Binnen 30 minuten na opstaan even naar buiten",
                        "Rustige wandeling na diner",
                    ],
                },
                {"type": "subtitle", "text": "Dag 7: Evalueer"},
                {
                    "type": "paragraph",
                    "text": (
                        "Welke pijler is verbeterd? Kies maximaal één extra stap voor week 2. "
                        "In het volgende hoofdstuk maak je daar een persoonlijk plan van."
                    ),
                },
            ],
        },
        {
            "number": "07",
            "title": "Jouw persoonlijk actieplan",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Je hebt nu de basis: herkenning, uitleg en leefstijl. Tijd om te kiezen "
                        "waar je mee begint — niet alles tegelijk."
                    ),
                },
                {"type": "subtitle", "text": "Checklist: waar zit jouw winst?"},
                {
                    "type": "bullets",
                    "items": [
                        "□ Ik slaap minder dan 6,5 uur",
                        "□ Ik lig langer dan 30 minuten wakker (Inslapen)",
                        "□ Ik word vaker dan twee keer wakker (Doorslapen)",
                        "□ Mijn bed- en opstaantijden wisselen sterk (Regelmaat)",
                        "□ Ik gebruik mijn telefoon in bed",
                        "□ Ik drink cafeïne na de lunch (Cafeïne-cutoff)",
                        "□ Ik voel me niet uitgerust wakker",
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Hoe meer je herkent, hoe groter de kans dat kleine aanpassingen verschil maken. "
                        "Begin met <b>één of twee verbeterpunten</b> voor de komende week. "
                        "Kleine, consistente veranderingen leveren vaak meer op dan grote plannen "
                        "die je niet volhoudt."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Wil je dit verder verdiepen?",
                    "text": (
                        "In je Leefstijlcheck en slaap-check zie je dezelfde onderdelen terug: "
                        "Inslapen, Doorslapen, Regelmaat en Uitgerust wakker. Vergelijk je antwoorden "
                        "met deze gids — zo zie je waar je de meeste winst kunt halen."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Als je basis staat, kun je supplementen overwegen als gerichte aanvulling — "
                        "niet als vervanging van wat je hierboven al doet."
                    ),
                },
            ],
        },
        {
            "number": "08",
            "title": "Supplementen als aanvulling",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Supplementen vullen niets aan als Regelmaat, Avondafbouw en leefstijl niet kloppen. "
                        "Als dat basisplaatje staat, kunnen deze vier soms een gerichte extra zijn."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium (glycinaat)"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium hoort bij de meest onderzochte mineralen rond slaap. Bij glycinaat/bisglycinaat "
                        "melden sommige proeven betere slaapkwaliteit<super>8</super><super>9</super>. "
                        "Geen harde belofte — wel een logische eerste keus in een avondroutine."
                    ),
                },
                {"type": "subtitle", "text": "Glycine"},
                {
                    "type": "paragraph",
                    "text": (
                        "Het aminozuur <b>glycine</b> wordt in onderzoek in verband gebracht met sneller ontspannen, "
                        "lichaamstemperatuur en slaapkwaliteit<super>10</super>. Vaak apart of als onderdeel "
                        "van magnesiumglycinaat."
                    ),
                },
                {"type": "subtitle", "text": "L-theanine"},
                {
                    "type": "paragraph",
                    "text": (
                        "L-theanine komt uit thee. Sommige studies suggereren meer rust zonder zware sedatie. "
                        "Veel mensen proberen 100–200 mg, 30–60 minuten voor slapen."
                    ),
                },
                {"type": "subtitle", "text": "Melatonine — alleen wanneer passend"},
                {
                    "type": "paragraph",
                    "text": (
                        "Een kleine dosis kan soms helpen bij ritme-shifts (jetlag, late shifts). "
                        "Langdurig elke dag zonder arts is zelden nodig<super>11</super>."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Stapelen vs. niet stapelen",
                    "text": (
                        "Begin met één supplement. Voeg pas na minimaal 2 weken een tweede toe — "
                        "zo weet je wat bijdraagt."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Doseringen en veiligheid staan in het volgende hoofdstuk. "
                        "Twijfel je over medicatie? Overleg altijd met je huisarts."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 8,
                            "text": (
                                "Schuster J et al. Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor "
                                "Sleep: A Randomized, Placebo-Controlled Trial. Nat Sci Sleep. 2025;17. PMC12412596"
                            ),
                        },
                        {
                            "num": 9,
                            "text": (
                                "Rawji A et al. Examining the Effects of Supplemental Magnesium on Self-Reported Anxiety "
                                "and Sleep Quality: A Systematic Review. Cureus. 2024;16(4):e59317. PMC11136869"
                            ),
                        },
                        {
                            "num": 10,
                            "text": (
                                "Bannai M, Kawai N. New therapeutic strategy for amino acid medicine: glycine improves "
                                "the quality of sleep. J Pharmacol Sci. 2012;118(2):145-148. PMID: 22293292"
                            ),
                        },
                        {
                            "num": 11,
                            "text": (
                                "Auld F et al. Evidence for the efficacy of melatonin in the treatment of primary adult "
                                "sleep disorders. Sleep Med Rev. 2017;34:10-22. PMID: 28648359"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "09",
            "title": "Doseringen & veiligheid",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Dit zijn geen voorschriften — gangbare vensters uit onderzoek en praktijk. "
                        "Gebruik je medicatie? Bespreek altijd even met je huisarts."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium (glycinaat/bisglycinaat)"},
                {
                    "type": "bullets",
                    "items": [
                        "Veel gebruik: 200–400 mg elementair magnesium, 30–60 min voor slapen",
                        "Begin bij een lagere dosis als je maag gevoelig is",
                        "Houd minimaal 2 uur tussen pil en magnesium (antibiotica, schildklier)",
                    ],
                },
                {"type": "subtitle", "text": "Glycine"},
                {
                    "type": "bullets",
                    "items": [
                        "Veel gebruik in studies: 3 g voor slapen, 30–60 min voor bed",
                        "Goed verdragen bij de meeste volwassenen in korte studies",
                        "Raadpleeg je huisarts als je medicatie gebruikt",
                    ],
                },
                {"type": "subtitle", "text": "L-theanine"},
                {
                    "type": "bullets",
                    "items": [
                        "Avond: vaak 100–200 mg voor slapen",
                        "Overdag kleiner proberen bij spanning",
                    ],
                },
                {"type": "subtitle", "text": "Melatonine"},
                {
                    "type": "bullets",
                    "items": [
                        "Veel microdosering: 0,3–0,5 mg, 30–60 min voor slapen",
                        "Korte periodes proberen — niet maandenlang zelf ophogen",
                        "Let op bij bloedverdunners — overleg bij twijfel",
                    ],
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 12,
                            "text": (
                                "Zhang Y et al. Association of magnesium intake with sleep duration and sleep quality. "
                                "PLoS One. 2022;17(1):e0261989. PMC8782427"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "10",
            "title": "Veelgestelde vragen",
            "blocks": [
                {"type": "subtitle", "text": "Wat zijn Inslapen, Doorslapen, Regelmaat en Uitgerust wakker?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Vier onderdelen van je slaap. Inslapen gaat over hoe snel je wegzakt. Doorslapen "
                        "over wakker worden 's nachts. Regelmaat over vaste tijden. Uitgerust wakker over "
                        "hoe je je voelt als je opstaat. Samen geven ze een completer beeld dan alleen uren."
                    ),
                },
                {"type": "subtitle", "text": "Waarom niet alleen naar Slaapduur kijken?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Omdat slaap meer is dan uren. Iemand die 7,5 uur slaapt maar niet uitgerust "
                        "wordt wakker, heeft vaak een ander probleem dan iemand die te kort slaapt."
                    ),
                },
                {"type": "subtitle", "text": "Hoe lang moet ik supplementen gebruiken?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Evalueer na 2–4 weken. Wat heeft geholpen? Wat niet? "
                        "Twijfel je over dosering of medicatie? Vraag het aan je huisarts."
                    ),
                },
                {"type": "subtitle", "text": "Ik slaap lang maar word niet uitgerust wakker — wat dan?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Kijk naar Doorslapen en Regelmaat — niet alleen naar Slaapduur. "
                        "Vaak helpt een vaste wektijd, minder alcohol en betere Avondafbouw meer dan nog een capsule."
                    ),
                },
                {"type": "subtitle", "text": "Wanneer naar de huisarts?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Bij aanhoudende vermoeidheid overdag, luid snurken met apneu-vermoeden, "
                        "onverklaarde pijn, of slaapproblemen die je dagfunctioneren ondermijnen."
                    ),
                },
            ],
        },
    ],
    "cta": {
        "title": "Wil je weten waar je staat?",
        "text": (
            "Doe de gratis slaapanalyse en krijg inzicht in Inslapen, Doorslapen, Regelmaat "
            "en Uitgerust wakker — plus drie persoonlijke acties voor deze week."
        ),
        "url_href": "https://perfectsupplement.nl/gids/slaap",
        "url_label": "perfectsupplement.nl/gids/slaap",
    },
    "disclaimer": {
        "title": "Disclaimer",
        "body": (
            "Deze gids is informatief en geen medisch advies. Bij aanhoudende slaapproblemen raden we aan "
            "contact op te nemen met je huisarts. Supplementen vervangen geen diagnose of behandeling."
        ),
        "copyright": (
            "© 2026 PerfectSupplement.nl — Onafhankelijk. Onderbouwd. Voor mannen 40+."
        ),
    },
}

_GUIDE["all_references"] = [
    {"num": 1, "text": _GUIDE["chapters"][0]["blocks"][-1]["items"][0]["text"]},
    {"num": 2, "text": _GUIDE["chapters"][0]["blocks"][-1]["items"][1]["text"]},
    {"num": 3, "text": _GUIDE["chapters"][0]["blocks"][-1]["items"][2]["text"]},
    {"num": 4, "text": _GUIDE["chapters"][0]["blocks"][-1]["items"][3]["text"]},
    {"num": 5, "text": _GUIDE["chapters"][4]["blocks"][-1]["items"][0]["text"]},
    {"num": 6, "text": _GUIDE["chapters"][4]["blocks"][-1]["items"][1]["text"]},
    {"num": 7, "text": _GUIDE["chapters"][4]["blocks"][-1]["items"][2]["text"]},
    {"num": 8, "text": _GUIDE["chapters"][7]["blocks"][-1]["items"][0]["text"]},
    {"num": 9, "text": _GUIDE["chapters"][7]["blocks"][-1]["items"][1]["text"]},
    {"num": 10, "text": _GUIDE["chapters"][7]["blocks"][-1]["items"][2]["text"]},
    {"num": 11, "text": _GUIDE["chapters"][7]["blocks"][-1]["items"][3]["text"]},
    {"num": 12, "text": _GUIDE["chapters"][8]["blocks"][-1]["items"][0]["text"]},
]

GUIDE = _GUIDE
