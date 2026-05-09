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
            "Waarom magnesiumglycinaat voor veel mensen handiger is dan oxide voor slaap",
            "Een 7-dagenprotocol dat je direct kunt proberen — mét ‘niet doen’-lijsten per fase",
            "Doseringen in perspectief: magnesium, ashwagandha, melatonine en L-theanine",
            "Veelgemaakte fouten die je slaap ondermijnen zonder dat je het merkt",
        ],
        "quote": (
            "Slaap is het fundament waar stress en herstel op bouwen. Zorg eerst voor ritme en rust om je "
            "heen — supplementen zijn hooguit een gerichte aanvulling als dat basisplaatje klopt."
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
                        "Na je 40e merk je vaak drie dingen in je slaap. Dit hoeft niets te zeggen over je "
                        "karakter — het is gewoon biologie. Snap je wat er schuift, dan kun je gerichter kiezen "
                        "wat je wél aanpast."
                    ),
                },
                {"type": "subtitle", "text": "Je maakt minder melatonine aan — geleidelijk"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Melatonine</b> is het hormoon dat je lichaam vertelt: nu wordt het tijd om rust te "
                        "nemen (donker helpt die aanmaak op gang). Onderzoek suggereert dat je eigen "
                        "aanmaak na je 30e en 40e stap voor stap kan dalen<super>1</super><super>2</super>. "
                        "Ook op latere leeftijd zie je lagere nachtwaarden dan bij jonge volwassenen — "
                        "<b>hoe sterk dat verschilt, verschilt per mens</b><super>3</super>. In de praktijk "
                        "voelt dat als minder makkelijk ‘intrappen’ en wat lichter slapen."
                    ),
                },
                {"type": "subtitle", "text": "Je diepe slaap kan relatief korter worden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je slaap loopt in rondjes met lichte slaap, diepe slaap en droomslaap (REM). "
                        "<b>Diepe slaap</b> is het deel waarin je lichaam echt herstelt: spieren bijtrekken, "
                        "geheugen opslaan, immuunsysteem opladen. Studies laten zien dat zo’n diepe fase met "
                        "de jaren minder lang kan zijn — ook als je nog even lang in bed ligt<super>4</super>. "
                        "Je wordt dan sneller wakker en staat minder fris op."
                    ),
                },
                {"type": "subtitle", "text": "Je stresshormoon kan ’s avonds te hoog blijven hangen"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Cortisol</b> is je belangrijkste stresshormoon. ’s Avonds hoort het te zakken, "
                        "zodat je systeem naar rust kan schakelen. Bij langdurige spanning blijft het soms te "
                        "hoog — dan sta je nog ‘aan’ terwijl je eigenlijk wilt slapen. Dat kan samenhangen "
                        "met herstel en hormonen — maar het legt geen diagnose bij jou vast<super>5</super>. "
                        "Je voelt je dan vaak moe én gespannen tegelijk."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Het klassieke patroon",
                    "text": (
                        "In slaap vallen lukt nog, maar rond 03:00 lig je wakker met een bonzend hart en een "
                        "hoofd dat maar doorjaagt. Dan kan het zijn dat je lichaam te vroeg schakelt alsof het "
                        "ochtend is — terwijl het midden in de nacht is. Zoek eerst rust en ritme overdag; "
                        "alleen harder je best doen in bed lost dat zelden op."
                    ),
                },
                {"type": "subtitle", "text": "Slaap en testosteron horen bij elkaar"},
                {
                    "type": "paragraph",
                    "text": (
                        "Onderzoek laat zien dat een groot deel van je dagelijkse testosteron in spanning staat "
                        "met slaap — vooral met <b>diepe slaap</b>. Als vuistregel wordt wel genoemd dat een "
                        "flink deel (vaak in de buurt van <b>70–80%</b>) samenhangt met slaap en "
                        "slaapkwaliteit — maar het is <b>geen vast recept voor elk individu</b><super>6</super>. "
                        "Het punt voor jou: als diepe slaap blijft teruglopen, wordt zo’n keten kwetsbaarder. "
                        "Dit is geen medische oordeel — alleen een reden om slaap serieus te nemen."
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
                        "Veel mannen van midden veertig herkennen dezelfde valkuilen — niet omdat ze lui zijn, "
                        "maar omdat wat op je dertigste nog werkte, op je veertigste harder tegenaan tikt."
                    ),
                },
                {"type": "subtitle", "text": "Fout 1: Cafeïne laat op de dag"},
                {
                    "type": "paragraph",
                    "text": (
                        "Na ongeveer <b>5–6 uur</b> zit nog de helft van de cafeïne in je bloed<super>7</super>. "
                        "Koffie om 15:00 kan ’s avonds dus nog merkbaar spelen. "
                        "<b>Hetzelfde geldt voor sterke groene thee en energy drinks</b> — niet alleen espresso."
                    ),
                },
                {"type": "subtitle", "text": "Fout 2: Scherm tot aan bed"},
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Helder licht</b> — vooral het schermlicht waar veel blauw in zit — "
                        "<b>remt ’s avonds je aanmaak van melatonine</b>. Dat is het hormoon dat je lichaam "
                        "vertelt dat het bedtijd wordt<super>8</super>. Leg je telefoon minimaal 45–60 minuten "
                        "voor slapen ergens waar je niet grijpjes naar wordt."
                    ),
                },
                {"type": "subtitle", "text": "Fout 3: Willekeurige bedtijden"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je <b>biologische klok</b> houdt niet van sociale jetlag. Streef ernaar om ook in het "
                        "weekend binnen ongeveer hetzelfde halfuur uit bed te komen."
                    ),
                },
                {"type": "subtitle", "text": "Fout 4: Te laat zwaar sporten"},
                {
                    "type": "paragraph",
                    "text": (
                        "Zware training laat je lichaam nog lang opspelden. Plan zo’n blok liever eerder op "
                        "de dag; een rustige wandeling ’s avonds kan juist helpen om spanning kwijt te raken."
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
                        "Als je vaak wakker ligt, noemen ze dat een <b>lage slaapefficiëntie</b>: een groot deel "
                        "van je tijd in bed is wakker tijd. "
                        "<b>7 uur in bed met 6,5 uur slapen</b> voelt dan vaak beter dan "
                        "<b>9 uur in bed met dezelfde 6,5 uur slapen</b>. Je wilt niet dat je brein bed koppelt "
                        "aan piekeren. Sta op, zoek rust zonder scherm, en ga pas terug als je weer moe wordt."
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
                        "Dit bouwt stap voor stap — je hoeft niet perfect te zijn. Ga voor een paar vaste "
                        "gewoontes die je wél volhoudt."
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
                            "<b>Binnen 30 minuten na opstaan even naar buiten</b> — daglicht helpt je "
                            "biologische klok op tijd te zetten<super>10</super>"
                        ),
                        "Rustige wandeling na diner om spanning af te bouwen",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Niet doen (fase 3)",
                    "text": (
                        "Geen zeer zware intervaltraining of maximale krachtsessie na 20:00 als je merkt dat je "
                        "daarna nog te lang ‘opgewonden’ blijft."
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
            "title": "Supplementen in perspectief",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": (
                        "Supplementen vullen niets aan als ritme, licht, temperatuur en stress niet eerder aan bod "
                        "zijn. Als dat basisplaatje klopt, kunnen ze soms een gerichte extra zijn."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium — waar veel mensen mee beginnen"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium hoort bij <b>een van de meest onderzochte mineralen</b> rond slaap en spanning "
                        "— maar uitkomsten verschillen per persoon. Bij magnesiumglycinaat/bisglycinaat melden "
                        "sommige proeven betere <b>ingeschatte slaapkwaliteit</b><super>11</super>; bredere "
                        "reviews zien wisselende maar vaak bescheiden effecten<super>12</super>. Het kan een rol "
                        "spelen bij ontspanning van spieren en een rustiger gevoel — dat betekent "
                        "<b>geen harde belofte</b> voor elke lezer."
                    ),
                },
                {
                    "type": "table",
                    "headers": ["Vorm", "Opname / gebruik", "Slaap-context"],
                    "rows": [
                        ["Glycinaat / bisglycinaat", "Meestal goed verdragen", "Veel gekozen in een avondroutine"],
                        ["Citraat", "Kan het toilet-op zoeken", "Soms gekozen om andere redenen"],
                        ["Oxide", "Wordt minder goed opgenomen", "Meestal geen eerste keus voor slaap"],
                        [
                            "L-theanine (uit thee)",
                            "Voelt voor velen niet als ‘chemisch suf’",
                            "Vaak 100–200 mg voor slapen; uitkomst verschilt per persoon",
                        ],
                        ["Ashwagandha (bijv. KSM-66)", "Langere horizon nodig", "Sommigen gebruiken het bij stress en slaap"],
                    ],
                },
                {
                    "type": "paragraph",
                    "text": (
                        "<b>Kort gezegd:</b> kies bij slaap meestal <b>glycinaat of bisglycinaat</b>. Oxide levert "
                        "vaak minder waar voor je geld. De andere rijen zijn opties als ze bij jou passen."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Het aminozuur <b>glycine</b> — onderdeel van glycinaatverbindingen — wordt in onderzoek "
                        "in verband gebracht met een kalmerend effect en slaapkwaliteit<super>13</super>."
                    ),
                },
                {
                    "type": "subtitle",
                    "text": "Ashwagandha — vooral als spanning je slaap saboteert",
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Sommige extracten (zoals KSM-66) zijn getest in gecontroleerde studies: daar rapporteerden "
                        "<b>deelnemers soms lagere stressscores en gunstigere stresshormoonprofielen</b> ten "
                        "opzichte van een placebo — maar niet iedereen merkt het even sterk<super>14</super>"
                        "<super>15</super>. Bij gestandaardiseerde extracten staat op het etiket een vast "
                        "percentage werkzame stoffen (withanoliden) — zo weet je dat een capsule niet steeds "
                        "anders sterk is."
                    ),
                },
                {
                    "type": "tip",
                    "title": "Belangrijk over ashwagandha",
                    "text": (
                        "<b>Voor Withania somnifera gelden nog geen door de Europese autoriteiten goedgekeurde "
                        "gezondheidsclaims op supplementetiketten — EFSA beschouwt dossiers veelal als on-hold.</b> "
                        "Wat je hier leest steunt alleen op literatuur, niet op zo’n officiële claim voor consumenten. "
                        "<b>Het Nederlandse ministerie van VWS overweegt aanvullende regels; signalen verwijzen naar "
                        "besluitvorming rond medio 2026.</b> Gebruik op eigen risico en bespreek medicatiecombinaties met je arts."
                    ),
                },
                {"type": "subtitle", "text": "Melatonine — soms handig, niet voor iedereen voor altijd"},
                {
                    "type": "paragraph",
                    "text": (
                        "Een heel kleine dosis kan soms helpen bij ritme-shifts; langdurig elke dag gebruiken "
                        "zonder dat een arts meedenkt, is zelden nodig<super>16</super>."
                    ),
                },
                {"type": "subtitle", "text": "L-theanine — rust zonder meteen ‘weg te zijn’"},
                {
                    "type": "paragraph",
                    "text": (
                        "L-theanine komt uit thee. Sommige studies suggereren dat het kan bijdragen aan meer rust "
                        "zonder zware sedatie — maar je eigen gevoel telt. Veel mensen starten rond "
                        "<b>200 mg</b>, 30–60 minuten voor slapen; bouw liever rustig op."
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
                        "Dit zijn <b>geen voorschriften</b>, maar gangbare vensters uit onderzoek en praktijk. "
                        "Gebruik je medicatie, ben je ziek, zwanger of geef je borstvoeding? Bespreek altijd "
                        "even met je huisarts voordat je begint."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium (glycinaat/bisglycinaat)"},
                {
                    "type": "bullets",
                    "items": [
                        (
                            "Veel gebruik: <b>200–400 mg elementair magnesium</b> — dat is het deel dat je "
                            "lichaam echt meetelt; staat zo op het etiket. Neem het 30–60 min voor slapen. "
                            "Grotere magnesium-inname wordt in bevolkingsonderzoek geassocieerd met slaapduur "
                            "en -kwaliteit — maar correlatie is geen garantie voor jou<super>17</super>"
                        ),
                        "Begin bij een lagere dosis als je maag daar gevoelig voor is",
                        "Raadpleeg je huisarts als je medicatie gebruikt",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Interacties / let-op",
                    "text": (
                        "Magnesium kan de opname van sommige antibiotica verminderen (zoals quinolonen en "
                        "tetracyclines). Houd minimaal <b>2 uur</b> tussen pil en magnesium. "
                        "Zelfde idee vaak voor schildklierpillen en bisfosfonaten."
                    ),
                },
                {"type": "subtitle", "text": "Ashwagandha (KSM-66 voorbeeld)"},
                {
                    "type": "bullets",
                    "items": [
                        (
                            "Veel gebruik: 300 mg, 2× per dag bij eten — evalueer na 4–6 weken "
                            "(zie onderzoekscontext<super>14</super><super>15</super>)"
                        ),
                        "Raadpleeg je huisarts als je medicatie gebruikt",
                    ],
                },
                {
                    "type": "tip",
                    "title": "Interacties / let-op",
                    "text": (
                        "Let extra op bij schildklierklachten of kalmerende medicatie. Stop bij klachten aan "
                        "je maag en overleg. Gebruik je medicatie? Neem dit altijd even langs je arts."
                    ),
                },
                {"type": "subtitle", "text": "Melatonine"},
                {
                    "type": "bullets",
                    "items": [
                        "Veel microdosering: 0,3–0,5 mg, 30–60 min voor slapen",
                        "Korte periodes proberen en evalueren — niet maandenlang zelf ophogen",
                        "Raadpleeg je huisarts als je medicatie gebruikt",
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
                        "Overdag kleiner proberen bij spanning — als het bij jou past",
                        "Raadpleeg je huisarts als je medicatie gebruikt",
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
                            "Mini-<b>slaapdagboek</b> vier keer per week — kort genoteerd is genoeg om patronen te "
                            "zien<super>18</super>"
                        ),
                        (
                            "Optioneel ashwagandha alleen als spanning nog het hoofdthema is — "
                            "<b>geen EFSA-goedgekeurde claims</b>; eerst je arts raadplegen bij medicatie"
                        ),
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
                        "Ja, veel mensen combineren ze — maar niet alle pillen tegelijk in één slok als je maag "
                        "daar gevoelig voor is. Begin liever met één middel; voeg na een paar weken pas een tweede "
                        "toe zodat je bijwerkingen kunt herleiden. "
                        "<b>Ashwagandha heeft geen EFSA-goedgekeurde claims;</b> overleg bij medicatie."
                    ),
                },
                {"type": "subtitle", "text": "Hoe lang moet ik supplementen gebruiken?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Ashwagandha wil je vaak pas na een paar weken opnieuw bekijken; magnesium kan voor sommige "
                        "mensen eerder subtiel verschil geven — voor anderen nauwelijks. Twijfel je over dosering "
                        "of medicatie? Vraag het aan je huisarts."
                    ),
                },
                {"type": "subtitle", "text": "Mijn slaap is ‘goed’ maar ik word moe wakker — wat dan?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Kijk dan naar <b>diepe slaap</b> en hoe gespannen je overdag blijft — niet alleen naar het "
                        "aantal uren in bed. Vaak helpt eerder opstaan, meer daglicht buiten en minder alcohol "
                        "meer dan nog een capsule."
                    ),
                },
                {"type": "subtitle", "text": "Helpt CBD-olie voor slaap?"},
                {
                    "type": "paragraph",
                    "text": (
                        "Het wetenschappelijke beeld is wisselend; kwaliteit van olieën verschilt sterk. Bij de "
                        "enen voelt het rustgevender, anderen worden er alert van. Het is geen eerste stap in deze "
                        "gids; neem medicatie en lever altijd mee naar je arts."
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
            "Slaap is een van de zes domeinen die we meten in de gratis Leefstijlcheck. In een paar minuten "
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
