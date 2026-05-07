# scripts/guide-content/slaap.py
# Content voor slaapgids-PDF (zie README.md voor schema).

GUIDE = {
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
                        "te rusten). In populatiescreening zie je dat melatonine-output met het ouder worden "
                        "afbouwt; auteurs zoals Zhdanova et al. beschrijven dalende nachtelijke melatonine bij "
                        "volwassenen — vaak in de orde van <b>ongeveer 10–15% minder per decennium na je 30e</b> "
                        "(richting; individueel sterk verschillend). Praktisch merk je dat als "
                        "‘intrappen’ lastiger wordt en je lichter slaapt."
                    ),
                },
                {"type": "subtitle", "text": "Je diepe slaap kan relatief korter worden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Slaap bestaat uit cycli met lichte slaap, diepe slaap en REM. Diepe slaap is een "
                        "belangrijke schakel voor herstel en consolidatie. Na 40 kan het totaal nog "
                        "hetzelfde voelen qua uren, terwijl de verdeling minder gunstig wordt — je wordt "
                        "sneller wakker en minder uitgerust."
                    ),
                },
                {"type": "subtitle", "text": "Cortisol kan je avond onnodig ‘warm’ houden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Cortisol hoort later op de dag te zakken zodat je systeem kan schakelen naar rust. "
                        "Bij langdurige stress blijft het avondniveau soms te hoog. Het gevolg: je bent moe, "
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
                        "In endocrinologische literatuur wordt vaak benadrukt dat een groot deel van de "
                        "dagelijkse testosteronrelease pulseert met slaap en met name met "
                        "<b>diepe slaap</b>. Als vuistregel in educatieve context wordt wel genoemd dat "
                        "<b>ruim 70–80%</b> van de dagelijkse productie in relatie staat tot slaapkwaliteit "
                        "en -duur — als je diepe slaap structureel terugloopt, wordt hormonaal herstel "
                        "moeilijker. Dit is géén diagnose: het is een reden om slaap serieus te nemen."
                    ),
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
                        "Cafeïne heeft een halfwaardetijd van ongeveer 5–6 uur. Een latte om 15:00 kan "
                        "‘s avonds nog merkbaar aanwezig zijn. "
                        "<b>Dit geldt ook voor sterke groene thee en veel energiedranken</b> — niet alleen "
                        "espresso."
                    ),
                },
                {"type": "subtitle", "text": "Fout 2: Scherm tot aan bed"},
                {
                    "type": "paragraph",
                    "text": (
                        "Helder licht en mentale prikkels schuiven je slaapdruk opzij. Zet je telefoon "
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
                        "Een koele kamer ondersteunt inslapen. Maar thermoregulatie gaat ook over timing: "
                        "<b>90 minuten voor bed een warme douche</b> gevolgd door afkoeling kan inslapen "
                        "helpen door een duidelijke daling van kern temperatuur daarna (warm bad werkt "
                        "vergelijkbaar voor veel mensen)."
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
                        "Binnen 30–60 min na opstaan daglicht",
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
                        "spierspanning. Niet elke vorm is gelijkwaardig voor slaapdoelen."
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
                    "type": "subtitle",
                    "text": "Ashwagandha — vooral bij stress-gestuurde slaapproblemen",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Als je hoofd niet uitstaat door prikkels en je cortisolcurve voelt ‘scheef’, kan een "
                        "adaptogeen onderdeel zijn van een breder plan — niet als enige hefboom."
                    ),
                },
                {"type": "subtitle", "text": "Melatonine — laagdrempelig, maar niet structureel voor iedereen"},
                {
                    "type": "paragraph",
                    "text": (
                        "Microdosering kan soms helpen bij ritmeverstoring; langdurig dagelijks gebruik "
                        "zonder evaluatie is zelden nodig."
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
                        "Veel gebruik: 200–400 mg elementair magnesium, 30–60 min voor slapen",
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
                        "Veel gebruik: 300 mg, 2× daags bij maaltijd — evalueren na 4–6 weken",
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
                        "Mini-slaapdagboek 4× per week: inslapen, wakker momenten, ochtendfrisheid",
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
                        "Bij aanhoudende vermoeidheid overdag ondanks voldoende tijd in bed, luid snurken met apneu-vermoeden, "
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
