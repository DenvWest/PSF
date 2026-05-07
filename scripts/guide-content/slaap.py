# scripts/guide-content/slaap.py
# Content voor slaapgids-PDF (zie README.md voor schema).

_GUIDE = {
    "meta": {
        "header_banner": "SLAAPGIDS VOOR MANNEN 40+",
        "output_filename": "slaapgids-perfectsupplement.pdf",
        "pdf_title": "De complete gids voor betere slaap na 40 — PerfectSupplement",
    },
    "title_page": {
        "label": "GRATIS SLAAPGIDS",
        "title": "De complete gids voor<br/>betere slaap na 40",
        "subtitle": (
            "Alles wat je moet weten over slaaphygiëne, gerichte supplementen en ritme-opbouw — "
            "in één overzichtelijke PDF."
        ),
        "usps": [
            "Waarom magnesiumglycinaat praktischer is dan oxide voor slaapkwaliteit",
            "Een 7-dagen protocol dat je direct kunt inzetten — met ‘niet doen’-lijsten per fase",
            "Doseringen in perspectief: magnesium, ashwagandha, melatonine en L-theanine",
            "Veelgemaakte fouten die je slaap saboteren zonder dat je het doorhebt",
        ],
        "quote": (
            "Slaap is het fundament waar stressbeheer en herstel op rusten. Verbeter eerst je ritme en "
            "omgeving — daarna zijn supplementen pas zinvol als gerichte aanvulling."
        ),
        "quote_source": "PerfectSupplement — redactioneel uitgangspunt",
        "footer_url": "perfectsupplement.nl",
    },
    "chapters": [
        {
            "number": "01",
            "title": "Waarom je slaap verandert na 40",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Na je 40e veranderen er drie dingen die direct impact hebben op hoe je slaapt. "
                        "Dit is geen kwestie van discipline — het is biologie. Als je begrijpt wat er "
                        "verschuift, kun je gericht ingrijpen."
                    ),
                },
                {"type": "subtitle", "text": "Je melatonine-productie daalt geleidelijk"},
                {
                    "type": "paragraph",
                    "text": (
                        "Melatonine helpt je circadiaanse ritme te sturen (donker signaleert: tijd om "
                        "te rusten). De <b>melatonineproductie daalt</b> na je 40e<super>1</super>; ook "
                        "speelt op langere termijn geleidelijk verminderde secretie een rol<super>2</super>. "
                        "In mensen ouder dan 90 jaar ligt melatonine gemiddeld op "
                        "<b>minder dan 20%</b> van het niveau bij jonge volwassenen — individueel sterk "
                        "verschillend<super>3</super>. Praktisch merk je dat als "
                        "‘intrappen’ lastiger wordt en je lichter slaapt."
                    ),
                },
                {"type": "subtitle", "text": "Je diepe slaap kan relatief korter worden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Slaap bestaat uit cycli met lichte slaap, diepe slaap en REM. Diepe slaap is een "
                        "belangrijke schakel voor herstel en consolidatie. Meta-analyses laten zien dat "
                        "kwantitatieve slaapparameters — waaronder diepe slaap — met de leeftijd verschuiven; "
                        "<b>diepe slaap neemt relatief af na 40</b><super>4</super>. Het totaal kan nog "
                        "hetzelfde voelen qua uren, terwijl de verdeling minder gunstig wordt — je wordt "
                        "sneller wakker en minder uitgerust."
                    ),
                },
                {"type": "subtitle", "text": "Cortisol kan je avond onnodig ‘warm’ houden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Cortisol hoort later op de dag te zakken zodat je systeem kan schakelen naar rust. "
                        "Bij langdurige stress blijft het avondniveau soms te hoog — het "
                        "<b>saboteert je avond</b> en kan samenhangen met verstoring van herstelsignalen en "
                        "hormoonbalans<super>5</super>. Het gevolg: je bent moe, "
                        "maar je lichaam staat nog te veel op scherp."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Het klassieke patroon",
                    "text": (
                        "In slaap vallen gaat nog, maar rond 03:00 word je wakker met bonzend hart en een hoofd "
                        "dat niet stilstaat. Dat past bij een te vroege of te harde ‘opstart’ van "
                        "stress-as activiteit — maak overdag ventilatie en ritme prioriteit, niet alleen "
                        "'s nachts harder proberen te slapen."
                    ),
                },
                {"type": "subtitle", "text": "Slaap en testosteron zitten aan elkaar gekoppeld"},
                {
                    "type": "paragraph",
                    "text": (
                        "In endocrinologische literatuur wordt benadrukt dat een groot deel van de "
                        "dagelijkse testosteronrelease pulseert met slaap en met name met "
                        "<b>diepe slaap</b>. Als vuistregel wordt wel genoemd dat "
                        "ongeveer <b>70–80%</b> van de dagelijkse testosteronproductie tijdens slaap plaatsvindt "
                        "of daarmee samenhangt — kwetsbaar dus als diepe slaap structureel terugloopt<super>6</super>. "
                        "Dit is géén diagnose: het is een reden om slaap serieus te nemen."
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
                                "Claustrat B, Leston J. Melatonin: Physiological effects in humans. Neurochirurgie. "
                                "2015;61(2-3):77-84."
                            ),
                        },
                        {
                            "num": 4,
                            "text": (
                                "Ohayon MM et al. Meta-analysis of quantitative sleep parameters from childhood to old "
                                "age in healthy individuals. Sleep. 2004;27(7):1255-1273. PMID: 15586779"
                            ),
                        },
                        {
                            "num": 5,
                            "text": (
                                "Leproult R, Van Cauter E. Effect of 1 week of sleep restriction on testosterone levels "
                                "in young healthy men. JAMA. 2011;305(21):2173-2174. PMID: 21632481"
                            ),
                        },
                        {
                            "num": 6,
                            "text": (
                                "Wittert G. The relationship between sleep disorders and testosterone in men. "
                                "Asian J Androl. 2014;16(2):262-265. PMC3955336"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "02",
            "title": "De 5 grootste slaapfouten (+ een veel voorkomende zesde)",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "De meeste mannen 40+ maken dezelfde fouten — niet uit onwetendheid, maar omdat dit "
                        "op je 30e vaak nog ‘werkte’. Na 40 tikt elke verstoring harder door."
                    ),
                },
                {"type": "subtitle", "text": "Fout 1: Cafeïne laat op de dag"},
                {
                    "type": "paragraph",
                    "text": (
                        "Cafeïne heeft een halfwaardetijd van ongeveer <b>5–6 uur</b><super>7</super>. "
                        "Een latte om 15:00 kan "
                        "‘s avonds nog merkbaar aanwezig zijn. "
                        "<b>Dit geldt ook voor sterke groene thee en veel energiedranken</b> — niet alleen "
                        "espresso."
                    ),
                },
                {"type": "subtitle", "text": "Fout 2: Scherm tot aan bed"},
                {
                    "type": "paragraph",
                    "text": (
                        "Helder licht en vooral <b>blauwrijk schermlicht onderdrukt ’s avonds melatonine</b><super>8</super>. "
                        "Zet je telefoon "
                        "minimaal 45–60 minuten voor slapen uit het bereik — niet alleen op zijn kant."
                    ),
                },
                {"type": "subtitle", "text": "Fout 3: Willekeurige bedtijden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je klok houdt niet van sociale jetlag. Streef naar opstaan binnen hetzelfde venster "
                        "(±30 min), ook in het weekend."
                    ),
                },
                {"type": "subtitle", "text": "Fout 4: Te laat zwaar trainen"},
                {
                    "type": "paragraph",
                    "text": (
                        "Intensieve training laat je systeem nog lang nagloeien. Plan zware blokken liever "
                        "eerder op de avond; een rustige wandeling kan juist helpen om af te bouwen."
                    ),
                },
                {"type": "subtitle", "text": "Fout 5: Een slaapkamer die te warm is — en alleen maar aan het klimaat denken"},
                {
                    "type": "paragraph",
                    "text": (
                        "Voor veel mensen is een slaapkamer van <b>ongeveer 16–18 °C</b> gunstig voor "
                        "inslapen<super>9</super>. Thermoregulatie gaat ook over timing: "
                        "<b>90 minuten voor bed een warme douche</b> gevolgd door afkoeling kan inslapen "
                        "helpen door een duidelijke daling van kerntemperatuur daarna."
                    ),
                },
                {"type": "subtitle", "text": "Fout 6: Te lang in bed liggen terwijl je niet slaapt"},
                {
                    "type": "paragraph",
                    "text": (
                        "Als je regelmatig wakker ligt, daalt je <b>slaapefficiëntie</b> — het deel van de tijd "
                        "in bed dat je echt slaapt. Vaak is "
                        "<b>7 uur in bed met 6,5 uur slapen</b> gunstiger dan "
                        "<b>9 uur in bed met dezelfde 6,5 uur slapen</b>, omdat je brein bed niet associeert "
                        "met frustratie en piekeren. Sta op, zoek rust zonder scherm, en ga pas terug als je "
                        "weer slaapdruk voelt."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 7,
                            "text": (
                                "Drake C et al. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. "
                                "J Clin Sleep Med. 2013;9(11):1195-1200. PMC3805807"
                            ),
                        },
                        {
                            "num": 8,
                            "text": (
                                "Chang AM et al. Evening use of light-emitting eReaders negatively affects sleep. "
                                "Proc Natl Acad Sci USA. 2015;112(4):1232-1237. PMID: 25535358"
                            ),
                        },
                        {
                            "num": 9,
                            "text": (
                                "Okamoto-Mizuno K, Mizuno K. Effects of thermal environment on sleep and circadian rhythm. "
                                "J Physiol Anthropol. 2012;31(1):14. PMC3427038"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "03",
            "title": "Het 7-dagen slaapritme-protocol",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Dit protocol stapelt gedrag — je hoeft niet alles perfect te doen. Focus op "
                        "consistentie."
                    ),
                },
                {"type": "subtitle", "text": "Dag 1–2: Basis"},
                {
                    "type": "bullets",
                    "items": [
                        "Vaste opstaantijd (ook weekend)",
                        "Cafeïne niet na lunch",
                        "Slaapkamer koeler en donkerder maken",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Niet doen (fase 1)",
                    "text": (
                        "Geen ‘compensatie-siesta’ van 90 minuten midden op de dag; geen laat avondmaal met "
                        "veel alcohol ‘om te ontspannen’."
                    ),
                },
                {"type": "subtitle", "text": "Dag 3–4: Avondafsluiting"},
                {
                    "type": "bullets",
                    "items": [
                        "Schermen weg vanaf 45–60 min voor slapen",
                        "Eenvoudig ritueel: lezen, stretch, ademhaling",
                        "Geen alcohol als slaapmiddel — niet ‘even een glas’ om sneller weg te zijn",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Niet doen (fase 2)",
                    "text": (
                        "Geen zware discussies of werk-mail vlak voor bed; geen scherm in bed ‘nog één video’."
                    ),
                },
                {"type": "subtitle", "text": "Dag 5–6: Daglicht en lichte beweging"},
                {
                    "type": "bullets",
                    "items": [
                        (
                            "<b>Daglicht binnen 30 minuten na opstaan</b> om je circadiaanse klok te verankeren"
                            "<super>10</super>"
                        ),
                        "Rustige wandeling na diner om spanning af te bouwen",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Niet doen (fase 3)",
                    "text": (
                        "Geen late HIIT of maximale krachtsessie na 20:00 als je merkt dat je dan hoger op tilt "
                        "staat."
                    ),
                },
                {"type": "subtitle", "text": "Dag 7: Check"},
                {
                    "type": "paragraph",
                    "text": (
                        "Noteer in één minuut: inslaaptijd, nachtelijke wakker periodes, ochtendfrisheid (1–10). "
                        "Dat is je baseline voor de volgende weken."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Niet doen (fase 4)",
                    "text": (
                        "Geen dramatische ‘alles-of-niets’ correctie op dag 7 — kies maximaal één extra stap "
                        "voor week 2."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Tip:</b> Overweeg vanaf dag 3 magnesiumglycinaat als onderdeel van je avondroutine "
                        "(zie hoofdstuk 5 voor dosering)."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 10,
                            "text": (
                                "Blume C et al. Effects of light on human circadian rhythms, sleep and mood. "
                                "Somnologie. 2019;23(3):147-156. PMC6751071"
                            ),
                        },
                    ],
                },
            ],
        },
        {
            "number": "04",
            "title": "Supplementen die werken (en context)",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Supplementen zijn geen vervanging voor ritme, licht, temperatuur en stresshuishouding. "
                        "Als de basis klopt, kunnen ze wél gericht ondersteunen."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium — vaak de eerste logische stap"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium speelt mee in talloze processen, waaronder neurotransmitters en "
                        "spierspanning; studies naar bisglycinaat en bredere magnesium-suppletie rapporteren "
                        "verbeteringen in <b>slaapkwaliteit</b> bij sommige populaties<super>11</super><super>12</super>. "
                        "Niet elke vorm is gelijkwaardig voor slaapdoelen."
                    ),
                },
                {
                    "type": "table",
                    "headers": ["Vorm", "Opname / gebruik", "Slaap-context"],
                    "rows": [
                        ["Glycinaat / bisglycinaat", "Meestal goed verdragen", "Zeer gangbaar voor avondroutine"],
                        ["Citraat", "Andere toilet-gevoeligheid", "Soms gekozen om andere redenen"],
                        ["Oxide", "Lagere biologische beschikbaarheid", "Minder geschikt als hoofdoptie"],
                        [
                            "L-theanine ( aminozuur uit thee )",
                            "Geen sedatie bij veel gebruikers",
                            "Vaak 100–200 mg voor slapen; ontspanning zonder ‘chemisch suf’",
                        ],
                        ["Ashwagandha (KSM-66)", "Langduriger gebruik", "Interessant bij stress-gestuurde slaap"],
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Het aminozuur <b>glycine</b> — onderdeel van glycinaatverbindingen — heeft kalmerende "
                        "eigenschappen die in onderzoek met slaapkwaliteit in verband worden gebracht"
                        "<super>13</super>."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Ashwagandha — vooral bij stress-gestuurde slaapproblemen",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Extracten zoals KSM-66 zijn onderzocht op <b>cortisol</b> en stressklachten en tonen in "
                        "RCT’s verbetering ten opzichte van placebo — relevant als je slaap vooral door spanning "
                        "lijdt<super>14</super><super>15</super>. Het is onderdeel van een breder plan — niet als enige hefboom."
                    ),
                },
                {"type": "subtitle", "text": "Melatonine — laagdrempelig, maar niet structureel voor iedereen"},
                {
                    "type": "paragraph",
                    "text": (
                        "Microdosering kan soms helpen bij ritmeverstoring; reviews benadrukken dat "
                        "<b>langdurig dagelijks gebruik zonder medische evaluatie zelden nodig is</b>"
                        "<super>16</super>."
                    ),
                },
                {"type": "subtitle", "text": "L-theanine — rust zonder zware sedatie"},
                {
                    "type": "paragraph",
                    "text": (
                        "L-theanine komt van thee en wordt veel onderzocht op kalmerende effecten zonder "
                        "dezelfde ‘knock-out’ als sommige slaapmiddelen. Gangbare avonddosering is vaak "
                        "<b>200 mg</b>, 30–60 minuten voor slapen — start conservatief."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Stapelen vs. niet stapelen",
                    "text": (
                        "<b>Begin met één supplement.</b> Voeg pas na minimaal "
                        "<b>2 weken</b> een tweede toe als je basis al aanvoelt alsof die klopt. Zo weet je "
                        "wat bijdraagt — en wat alleen kosten en complexiteit toevoegt."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 11,
                            "text": (
                                "Schuster J et al. Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor "
                                "Sleep: A Randomized, Placebo-Controlled Trial. Nat Sci Sleep. 2025;17. PMC12412596"
                            ),
                        },
                        {
                            "num": 12,
                            "text": (
                                "Rawji A et al. Examining the Effects of Supplemental Magnesium on Self-Reported Anxiety "
                                "and Sleep Quality: A Systematic Review. Cureus. 2024;16(4):e59317. PMC11136869"
                            ),
                        },
                        {
                            "num": 13,
                            "text": (
                                "Bannai M, Kawai N. New therapeutic strategy for amino acid medicine: glycine improves "
                                "the quality of sleep. J Pharmacol Sci. 2012;118(2):145-148. PMID: 22293292"
                            ),
                        },
                        {
                            "num": 14,
                            "text": (
                                "Lopresti AL et al. An investigation into the stress-relieving and pharmacological actions "
                                "of an ashwagandha extract: A randomized, double-blind, placebo-controlled study. Medicine. "
                                "2019;98(37):e17186. PMC6979308"
                            ),
                        },
                        {
                            "num": 15,
                            "text": (
                                "Chandrasekhar K et al. A prospective, randomized double-blind, placebo-controlled study "
                                "of safety and efficacy of a high-concentration full-spectrum extract of ashwagandha root "
                                "in reducing stress and anxiety in adults. Indian J Psychol Med. 2012;34(3):255-262. "
                                "PMID: 23439798"
                            ),
                        },
                        {
                            "num": 16,
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
            "number": "05",
            "title": "Doseringen en veiligheid (globaal kader)",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Dit zijn geen voorschriften: het zijn gangbare gebruiksvensters uit literatuur en "
                        "praktijkrichtlijnen. Bij medicatie, zwangerschap, borstvoeding of diagnose: altijd "
                        "je arts raadplegen."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium (glycinaat/bisglycinaat)"},
                {
                    "type": "bullets",
                    "items": [
                        (
                            "Veel gebruik: 200–400 mg elementair magnesium, 30–60 min voor slapen "
                            "(populatiestudies koppelen hogere magnesiuminname aan betere slaapduur en "
                            "-kwaliteit)<super>17</super>"
                        ),
                        "Start bij de onderkant als je een gevoelige maag hebt",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Interacties / let-op",
                    "text": (
                        "Magnesium kan de opname van sommige antibiotica (zoals quinolonen en tetracyclines) "
                        "verminderen — houd minimaal "
                        "<b>2 uur</b> tussen magnesium en die medicatie. Bij schildklierpillen en "
                        "bisfosfonaten geldt vaak hetzelfde scheidingsprincipe."
                    ),
                },
                {"type": "subtitle", "text": "Ashwagandha (KSM-66 voorbeeld)"},
                {
                    "type": "bullets",
                    "items": [
                        (
                            "Veel gebruik: 300 mg, 2× daags bij maaltijd — evalueren na 4–6 weken "
                            "(zie onderbouwing en veiligheid in RCT-literatuur<super>14</super><super>15</super>)"
                        ),
                    ],
                },
                {
                    "type": "tip",
                    "title": "Interacties / let-op",
                    "text": (
                        "Niet combineren zonder arts bij schildklierziekte of bij gebruik van sedativa. Stop bij "
                        "ondigestelijke bijwerkingen en overleg."
                    ),
                },
                {"type": "subtitle", "text": "Melatonine"},
                {
                    "type": "bullets",
                    "items": [
                        "Veel microdosering: 0,3–0,5 mg, 30–60 min voor slapen",
                        "Gebruik korte periodes en evalueer — niet blindeloos maandenlang op hogere doses",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Interacties / let-op",
                    "text": (
                        "Let op bij bloedverdunners en immunosuppressiva — melatonine wordt niet altijd verdragen "
                        "door iedereen; overleg bij twijfel."
                    ),
                },
                {"type": "subtitle", "text": "L-theanine"},
                {
                    "type": "bullets",
                    "items": [
                        "Avond: vaak 100–200 mg voor slapen",
                        "Kan overdag kleiner worden ingezet bij spansignalen (individueel)",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Interacties / let-op",
                    "text": (
                        "Overweg voorzichtig bij gebruik van bloeddrukmedicatie of stimulantia — bespreek bij "
                        "combinaties met cafeïne als je gevoelig bent voor bloeddruk."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 17,
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
            "number": "06",
            "title": "Week-voor-week actieplan",
            "blocks": [
                {"type": "subtitle", "text": "Week 1: Quick wins"},
                {
                    "type": "bullets",
                    "items": [
                        "Koele, donkere slaapkamer",
                        "Schermen weg voor bed",
                        "Vaste opstaantijd",
                        "Cafeïne niet na lunch",
                    ],
                },
                {"type": "subtitle", "text": "Week 2–4: Ritme verdiepen"},
                {
                    "type": "bullets",
                    "items": [
                        "Avondwandeling na diner",
                        "Magnesiumglycinaat routinematig (zie hoofdstuk 5)",
                        "Alcohol beperken en niet als slaapmiddel",
                        "Alcohol niet vlak voor slapen — minimale ‘relax’ is een vals signaal voor je brein",
                    ],
                },
                {"type": "subtitle", "text": "Week 5–8: Verdieping"},
                {
                    "type": "paragraph",
                    "text": (
                        "Nu gaat het niet om ‘nog meer regels’, maar om stabiliteit en meetbare verbetering. "
                        "Kies één extra scherp punt — bijvoorbeeld consistent daglicht binnen een vast venster, "
                        "of een vaste ‘shutdown’ van werk om 20:00."
                    ),
                },
                {
                    "type": "bullets",
                    "items": [
                        (
                            "Mini-<b>slaapdagboek</b> 4× per week (gestandaardiseerde registratie verhoogt "
                            "betrouwbaarheid)<super>18</super>"
                        ),
                        "Optioneel: voeg ashwagandha toe alleen als stress/nachtelijk wakker blijven nog leidend is",
                        "Evalueer supplementkeuzes met startdatum — wat heeft geholpen, wat niet?",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Meet je baseline — dan pas optimaliseren",
                    "text": (
                        "Gebruik de gratis Leefstijlcheck om je uitgangspunt vast te leggen vóór je grote "
                        "wijzigingen doorvoert en "
                        "<b>herhaal na ±4 weken</b>. Zo voorkom je dat je blind stapelt zonder te weten wat "
                        "werkte."
                    ),
                },
                {
                    "type": "references",
                    "items": [
                        {
                            "num": 18,
                            "text": (
                                "Carney CE et al. The consensus sleep diary: standardizing prospective self-monitoring. "
                                "Sleep. 2012;35(2):287-302. PMC3250369"
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
                {"type": "subtitle", "text": "Kan ik magnesium combineren met ashwagandha?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ja, dat gebeurt veel — maar niet gelijktijdig innemen als je maag gevoelig is. Hanteer "
                        "liever het ‘één voorrang, na 2 weken uitbreiden’ principe zodat je bijwerkingen kunt "
                        "toeschrijven."
                    ),
                },
                {"type": "subtitle", "text": "Hoe lang moet ik supplementen gebruiken?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ashwagandha evalueer je meestal pas na enkele weken; magnesium kan eerder subtiele "
                        "effecten geven. Stopperioden en dosering zijn afhankelijk van je plan — bij twijfel: arts."
                    ),
                },
                {"type": "subtitle", "text": "Mijn slaap is ‘goed’ maar ik word moe wakker — wat dan?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Kijk naar diepe slaap en stresscurve overdag, niet alleen naar 'uren gelegen'. "
                        "Soms helpt eerder opstaan + sterker daglicht en minder alcohol meer dan een extra pil."
                    ),
                },
                {"type": "subtitle", "text": "Helpt CBD-olie voor slaap?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Het bewijs is wisselend en productkwaliteit varieert sterk. CBD kan bij sommigen "
                        "kalmeren en bij anderen juist alertheid geven. Het is geen eerste-lijn advies in deze "
                        "gids; leg medicatie en leverenzymen altijd voor bij je arts."
                    ),
                },
                {"type": "subtitle", "text": "Wanneer naar de huisarts met slaapproblemen?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Bij aanhoudende vermoeidheid overdag ondanks voldoende tijd in bed, luid snurken met "
                        "apneu-vermoeden, "
                        "onverklaarde pijn, depressieve klachten, of slaapproblemen die je dagfunctioneren "
                        "ondermijnen: vraag professioneel onderzoek aan."
                    ),
                },
            ],
        },
    ],
    "cta": {
        "title": "Wil je weten waar je staat?",
        "text": (
            "Slaap is één van de zes domeinen die we meten in de gratis Leefstijlcheck. In een paar minuten "
            "zie je waar je op scoort — en welk profiel bij jou past."
        ),
        "url_href": "https://perfectsupplement.nl/intake",
        "url_label": "perfectsupplement.nl/intake",
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
    _GUIDE["chapters"][0]["blocks"][-1]["items"][0],
    _GUIDE["chapters"][0]["blocks"][-1]["items"][1],
    _GUIDE["chapters"][0]["blocks"][-1]["items"][2],
    _GUIDE["chapters"][0]["blocks"][-1]["items"][3],
    _GUIDE["chapters"][0]["blocks"][-1]["items"][4],
    _GUIDE["chapters"][0]["blocks"][-1]["items"][5],
    _GUIDE["chapters"][1]["blocks"][-1]["items"][0],
    _GUIDE["chapters"][1]["blocks"][-1]["items"][1],
    _GUIDE["chapters"][1]["blocks"][-1]["items"][2],
    _GUIDE["chapters"][2]["blocks"][-1]["items"][0],
    _GUIDE["chapters"][3]["blocks"][-1]["items"][0],
    _GUIDE["chapters"][3]["blocks"][-1]["items"][1],
    _GUIDE["chapters"][3]["blocks"][-1]["items"][2],
    _GUIDE["chapters"][3]["blocks"][-1]["items"][3],
    _GUIDE["chapters"][3]["blocks"][-1]["items"][4],
    _GUIDE["chapters"][3]["blocks"][-1]["items"][5],
    _GUIDE["chapters"][4]["blocks"][-1]["items"][0],
    _GUIDE["chapters"][5]["blocks"][-1]["items"][0],
]

GUIDE = _GUIDE
