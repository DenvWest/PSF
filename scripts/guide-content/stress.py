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
                        "Het probleem is chronische belasting: dan blijft je stress-as (HPA-as) te lang actief."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "In klassieke hormoonliteratuur wordt het beeld beschreven dat chronisch verhoogde "
                        "cortisol samen kan hangen met lagere androgene signalering bij mannen. "
                        "<b>Cumming et al. (1983)</b> rapporteerden bij een cohort dat mannen met chronisch "
                        "verhoogde cortisolwaarden gemiddeld "
                        "<b>ongeveer 10–15% lagere testosteronniveaus</b> hadden dan leeftijdgenoten — een "
                        "richtingsindicator; niet elk individu volgt dit patroon."
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
                        "andere takken van hormoonsynthese — informeel wordt dat concept ook wel "
                        "<b>‘pregnenolon steal’</b> genoemd (vereenvoudigde voorlichting; geen strikte "
                        "diagnose-term)."
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
                        "Daarnaast wordt een groot deel van je serotonine gemaakt in het maag-darmgebied — "
                        "educatief wordt vaak genoemd dat "
                        "<b>ruim 90–95%</b> van serotonine elders wordt geproduceerd dan klassiek alleen ‘in "
                        "je hoofd’. Daarom zijn routine, vezels en rust rond eten geen bijzaak bij stress."
                    ),
                },
                {"type": "subtitle", "text": "Sympathisch vs. parasympathisch — wat je voelt"},
                {
                    "type": "paragraph",
                    "text": (
                        "Je sympathische tak (‘gas’) kan te dominant worden; je parasympathische tak (‘rem’) "
                        "krijgt dan minder ruimte. Slaap wordt oppervlakkiger, herstel faalt, je merkt minder "
                        "wat je lichaam probeert te signaleren."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Na 40 is je buffer kleiner: hetzelfde werkpakket voelt zwaarder omdat herstel "
                        "trager en kwetsbaarder wordt. Dat is geen falen — het is fysiologie."
                    ),
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
                        "4–6 ademhaling: 4 sec in, 6 sec uit — 5 minuten dagelijks",
                        "Box breathing: 4–4–4–4 — geschikt bij acute spanning",
                        (
                            "Fysiologische zucht: twee korte inhalaties door de neus, één langere uitademing "
                            "door de mond — vaak natuurlijk aanwezig na stresspieken"
                        ),
                    ],
                },
                {
                    "type": "tip",
                    "title": "Waarom een ‘zucht’ kan helpen",
                    "text": (
                        "Een <b>dubbele inademing</b> kan longblaasjes extra openzetten; een "
                        "<b>langere uitademing</b> versterkt vagale remming en verlaagt hartfrequentie sneller "
                        "dan alleen focussen op inhaleren. Daardoor voelt het alsof je systeem weer ‘ruimte’ "
                        "krijgt."
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
                        "Te zwaar trainen kan tijdens een herstelfase als extra stressor voelen. Het doel is "
                        "kalibreren: voldoende prikkel om fit te blijven, niet constant alarm."
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
                        "Eiwit bij ontbijt — stabielere bloedsuiker eerder op de dag",
                        "Geen koffie op volledig lege maag als je daar trillerig van wordt",
                        "Voldoende water — vermoeidheid maskeert vaak dehydratie",
                        (
                            "Anti-inflammatoire bouwstenen: vette vis (omega-3), bessen, kleurrijke groenten, "
                            "kurkuma als kruid (combineer met zwarte peper voor curcumine-opname), groene thee "
                            "(let op cafeïne)"
                        ),
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
                        "<b>geen erkende gezondheidsclaims</b> zoals voor sommige micronutriënten. Labels en "
                        "claims verschillen per leverancier; discussie over novel foods/registratie kan per tijd "
                        "verschuiven. Koop bij voorkeur bij merken met batch-testing en transparante extractinfo."
                    ),
                },
                {"type": "subtitle", "text": "Magnesium"},
                {
                    "type": "paragraph",
                    "text": (
                        "Magnesium ondersteunt normale spier- en zenuwfunctie en kan bij tekort bijdragen aan "
                        "minder vermoeidheid (EFSA-claims waar van toepassing op specifieke vormen/doses)."
                    ),
                },
                {"type": "subtitle", "text": "Ashwagandha (extracten zoals KSM-66 / Sensoril worden veel besproken)"},
                {
                    "type": "paragraph",
                    "text": (
                        "Wordt onderzocht in stress-/cortisolcontexten; geen ‘acute uit-knop’. Stop bij maagklachten "
                        "of ongewenste sufheid en overleg bij schildklier- of schildkliermedicatie."
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
                        "EPA heeft anti-inflammatoire signalering relevant bij chronische stressbelasting — vooral "
                        "als je weinig vis eet. Kwaliteit en oxidatie-advies zijn belangrijker dan megadosissen."
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
                        "<b>gratis en vergoed vanuit de basisverzekering</b> — controleer wel je eigen polis voor "
                        "details bij jouw zorgverzekeraar."
                    ),
                },
                {
                    "type": "paragraph",
                    "text": (
                        "Dit hoeft geen falen te zijn — het kan betekenen dat je systeem te lang overbelast was."
                    ),
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
                        "Ja, dat kan — onder andere via langdurig verhoogde cortisol en prioriteit naar "
                        "stress-hormoonpaden (zie ook hoofdstuk 02 over cortisol–testosteron onderzoek)."
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
