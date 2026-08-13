# BESLUIT — Verbinding v1: check-in, prioriteitenladder en compliance-kader

> **Status:** onderzoeksrapport + besluitvoorstel. Secties met **LOCK** zijn afgeleid van bestaande canon (COMPLIANCE, DPIA, slaap/voeding-besluiten) en staan vast. Secties met **VOORSTEL** wachten op expliciete GO van Dennis.
> **Datum:** 12 augustus 2026
> **Reeks:** `BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` (visueel skelet) · `BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md` (poort-/copy-canon) · dit document (5e en laatste interventiedomein)
> **Noordster:** *Verbinding win je met een moment in je agenda, niet met een gevoel dat je moet oproepen.*

---

## A · Diagnose — waar verbinding nu staat

Verbinding is sinds `rules_version 1.3.0` het vijfde interventiedomein en weegt volwaardig mee in de vitaalscore. Maar het is het enige domein zonder eigen instrument, zonder plan en zonder content. Vier concrete gaten:

**A1 · Eén item draagt het hele domein.** `connection_score` komt uit één intakevraag, `CON_SOC` ([intake-engine.ts:454](../../src/lib/intake-engine.ts#L454)). Slaap heeft vier items, stress twee, voeding elf. Verbinding heeft één.

**A2 · De schaal heeft een gat — en dat is een meetfout, geen detail.** `CON_SOC` heeft vier antwoordopties met de waarden **4, 4, 2, 1** ([intake-questions.ts:213](../../src/data/intake-questions.ts#L213)). Er is geen optie met waarde 3. Via `scaleItemScore(value, 4)` levert dat:

| Antwoord | Waarde | `connection_score` |
|---|---|---|
| "Ja, en dat voelt ruim voldoende" | 4 | **100** |
| "Ja, een paar — en dat is genoeg voor mij" | 4 | **100** |
| "Er zijn mensen, maar ik mis soms echt contact" | 2 | **33** |
| "Ik heb weinig mensen om op terug te vallen" | 1 | **0** |

De score kan dus uitsluitend **0, 33 of 100** zijn. 67 is onbereikbaar. Gevolg: wie van "ik mis soms echt contact" naar "genoeg voor mij" beweegt, springt 67 punten — en wie ertussenin verbetert, beweegt nul. Een verbinding-delta is in de praktijk binair. `CONNECTION_DELTA_COMPARABLE_FROM = "1.3.0"` ([rules-version.ts:55](../../src/lib/rules-version.ts#L55)) bewaakt versie-vergelijkbaarheid, maar niet resolutie.

**A3 · Geen check, expliciet uitgesteld.** [kompas-domain-actions.ts:108](../../src/lib/kompas-domain-actions.ts#L108) zegt het letterlijk: *"Geen aparte verbinding-check (DEFER, roadmap §3)"*. De Kompas-actie is altijd `Bekijk je verbinding` — een leeslink, geen meting. Er is geen `intake_domain_checkin`-rij met `domain_key = "connection_score"` mogelijk omdat de route niet bestaat.

**A4 · Geen plan, wel al doelen.** `src/data/lifestyle-plans/` bevat sleep, stress, movement, nutrition — geen connection ([index.ts:8](../../src/data/lifestyle-plans/index.ts#L8)). Maar `DOMAIN_GOAL_SITUATIONS.verbinding` staat er al mét zes situatie-enums ([domain-goal.ts:87](../../src/lib/domain-goal.ts#L87)), en die zijn goed: *"Vrienden zien zonder dat het van hen moet komen"*, *"Alleen kunnen zijn zonder me eenzaam te voelen"*. Dat is precies het juiste register. Er is dus een doelnaad zonder instrument erachter.

**Conclusie:** verbinding heeft geen ontwerpprobleem maar een fundamentprobleem. Het instrument, de ladder en het compliance-kader moeten er in één keer goed staan — juist omdat dit het domein is waar een verkeerd gestelde vraag de meeste schade doet.

---

## B · Wat het bewijs zegt

### B1 · Het is een harde gezondheidsfactor, geen zachte

De WHO-commissie voor sociale verbinding publiceerde op 30 juni 2025 *"From loneliness to social connection — charting a path to healthier societies"*: circa **16% van de wereldbevolking** (1 op 6) ervoer eenzaamheid in 2014–2023, en eenzaamheid en sociale isolatie worden in verband gebracht met ongeveer **871.000 sterfgevallen per jaar** — ruwweg 100 per uur. De commissie positioneert sociale verbinding als **derde pijler van gezondheid** naast fysieke en mentale gezondheid; *The Lancet Public Health* (2025) noemt het *"the neglected third pillar"*.

Dat geeft ons de evidence-autoriteit die we bij de andere vier domeinen ook hebben — met één voorbehoud dat in de copy moet landen: dit zijn **populatieverbanden**, geen individuele risicovoorspelling. Zie §C2.

### B2 · Nederlandse cijfers — verbinding is geen ouderenprobleem

| Bron | Cijfer |
|---|---|
| CBS, verslagjaar 2024 (gepubliceerd 2025) | **10%** van 15-plussers sterk eenzaam · **30%** enigszins · 61% niet |
| Gezondheidsmonitor Volwassenen en Ouderen 2024 (GGD'en/CBS/RIVM), 18+ | **46%** eenzaam totaal · 33% matig · **13%** sterk |
| Geslacht | Eenzaamheid komt **iets vaker voor bij mannen** dan bij vrouwen; bij *sterke* eenzaamheid nauwelijks verschil |

**Gat in de bron:** vzinfo publiceert de uitsplitsing naar leeftijd×geslacht niet voor de band 40–65 — alleen 75+ (51%) en 85+ (60%). Wie de doelgroepcijfers hard wil hebben, moet StatLine `85766NED` zelf raadplegen. **Tot dat gebeurd is: geen doelgroepspecifiek percentage in de copy.** Niet "1 op de 3 mannen van 45 is eenzaam" — dat cijfer hebben we niet.

### B3 · Twee soorten, en ze vragen verschillende dingen

De Nederlandse meettraditie (De Jong Gierveld) scheidt:

- **Emotionele eenzaamheid** — het missen van een hechte band. *Meer* contacten lossen dit niet op; één vertrouwensrelatie wel.
- **Sociale eenzaamheid** — het missen van een breder netwerk waarop je terugvalt. Hier helpen gelegenheid en frequentie wél.

Dat onderscheid is de belangrijkste ontwerpimplicatie van dit hele document: **een ladder die alleen "meer contact" adviseert, mist de helft van het probleem.** Daarnaast staat de *structurele* laag (hoeveel mensen, hoe vaak — LSNS-6-traditie) los van de *functionele* laag (ervaren steun — OSSS-3, MSPSS). Ons bestaande `CON_SOC` meet functioneel-met-eigenoordeel, en de evidence-notitie in de repo zegt dat al correct: *"Kwaliteit weegt zwaarder dan kwantiteit"* ([leefstijlcheck-evidence.ts:595](../../src/data/leefstijlcheck-evidence.ts#L595)).

### B4 · Wat werkt — en in welke volgorde

Masi et al. (2011, *Pers Soc Psychol Rev*) onderscheidden vier interventietypen: sociale vaardigheden, sociale steun, gelegenheid voor interactie, en **maladaptieve sociale cognitie**. In RCT's had die laatste het grootste effect. Een recente meta-analytische review over **280 studies** (2024/2025, *American Psychologist*) bevestigt dat: interventies gericht op maladaptieve sociale cognitie leverden een duidelijk groter gemiddeld effect (**d ≈ −0,60**) dan interventies gericht op sociale steun of vaardigheden. Psychologische behandeling, sociale steun en sociaal-emotionele vaardigheidstraining komen als sterkste strategieën naar voren.

**Wat dat voor ons betekent — en wat níet.** "Maladaptieve sociale cognitie aanpakken" is CGT-gebied. Dat is **buiten onze scope** (zie §C2): wij doen geen psychologische behandeling. Wat er wél uit volgt en binnen leefstijl blijft:

1. **Agency boven volume.** De hefboom zit in *wie het in gang zet*, niet in *hoeveel contacten*. Een man die wacht tot anderen bellen heeft geen netwerkprobleem maar een initiatiefprobleem. Dat is gedrag, geen therapie.
2. **Gelegenheid is de vloer.** Het zwakste-maar-noodzakelijke interventietype is het enige dat je in een agenda kunt zetten. Zonder ruimte in de week landt de rest niet.
3. **Geen belofte van gevoelsverandering.** Wij beloven een gezet moment en een gemeten gedragsverschuiving — nooit "je voelt je minder eenzaam".

### B5 · Mannen verbinden schouder aan schouder

Consistent bevinding over Australië, Ierland, Schotland en Canada (Men's Sheds-onderzoek; narratieve review *Frontiers in Public Health* 2026; *Canadian Journal on Aging*): mannen verbinden **naast elkaar via een gedeelde activiteit**, niet tegenover elkaar via een gesprek als doel. Het gesprek ontstáát uit de activiteit. Deelname voorspelt grotere sociale netwerken, en grotere netwerken voorspellen hoger welbevinden en lagere eenzaamheid.

Dit is de sterkste doelgroep-specifieke bevinding in dit dossier en hij hoort structureel in de ladder — niet als tip, maar als eigen laag (§E, P3).

### B6 · Hoe je ernaar vraagt bepaalt of je antwoord krijgt

Movisie (kennisinstituut sociaal domein) is expliciet: eenzaamheid is taboe, mensen schamen zich, en **frontaal vragen is voor veel mensen te confronterend**. De aanbeveling is beginnen bij het concrete en het gevoel later laten komen.

Voor een zelfinvul-check bij mannen 40+ betekent dat: **geen enkele vraag die het woord "eenzaam" gebruikt.** We meten gedrag, ritme, initiatief en één eigen-oordeelvraag over toereikendheid. Het woord komt in de check niet voor. (In de kennisbank/inzichten mag het wel — daar kiest de lezer zelf om het te lezen.)

---

## C · Compliance-kader — het zwaartepunt van dit document

Verbinding is het domein met het hoogste compliancerisico van de vijf, om drie redenen tegelijk: de constructen grenzen aan mentale gezondheid, de bruikbare meetinstrumenten zijn juridisch niet vrij, en er is geen legitiem product om te verkopen. Zeven locks.

### C1 · LOCK — geen gevalideerd instrument letterlijk overnemen

| Instrument | Status | Consequentie |
|---|---|---|
| **De Jong Gierveld** (11- en 6-item) | Rechthebbende stelt expliciet: beschikbaar **"voor gebruik in wetenschappelijk onderzoek"**, mits bronvermelding. Commercieel gebruik valt buiten de gegeven toestemming. | **Niet gebruiken.** Ook niet "geïnspireerd op" met bijna-identieke formuleringen. |
| **UCLA-3** (Hughes et al. 2004) | Auteursrechtelijk beschermde publicatie; geen expliciete vrijgave voor commercieel gebruik gevonden. | Niet gebruiken zonder schriftelijke licentie. |
| **LSNS-6** (Lubben) | Geen expliciete vrije licentie gevonden; afkapwaarde <12 is bovendien cultuurafhankelijk. | Niet gebruiken; afkapwaarden zeker niet. |
| **OSSS-3** (Kocalevent et al. 2018) | Ruim verspreid, o.a. in de IASC MHPSS M&E-toolkit; item 3 gaat over praktische hulp van **buren** — slecht passend voor onze doelgroep. | Constructen bruikbaar als inspiratie, items niet overnemen. |
| **SDT / BPNS relatedness-subschaal** | selfdeterminationtheory.org geeft schalen vrij voor **academisch** gebruik; commercieel gebruik vereist toestemming. | Theorie citeren mag, items overnemen niet. |

**Het besluit:** wij bouwen **eigen items**, geformuleerd in onze eigen stem, geankerd op de constructen uit de literatuur — precies zoals we dat bij slaap, stress, voeding en beweging ook doen. De literatuur is onze *evidence-onderbouwing* (`leefstijlcheck-evidence.ts`), niet onze *itembron*.

Bijkomend voordeel: eigen items mogen gedragsgericht en actiegericht zijn. Een gevalideerde eenzaamheidsschaal meet een toestand waar we niets mee kunnen; onze items meten hefbomen waar een actie aan hangt.

**Wat we wél letterlijk overnemen:** niets. **Wat we citeren in de evidence-laag:** De Jong Gierveld & Van Tilburg (2006) voor het emotioneel/sociaal-onderscheid, Masi et al. (2011) en de 280-studie-review voor interventie-effectiviteit, WHO (2025) voor de gezondheidsrelevantie, Men's Sheds-literatuur voor het doelgroepmechanisme.

### C2 · LOCK — geen klinische drempel, geen diagnostische vorm

Onder MDR (Verordening 2017/745) en MDCG 2019-11 (revisie 1, 17 juni 2025) is software voor **leefstijl- en welzijnsdoeleinden geen medisch hulpmiddel**; software die informatie levert voor diagnose of behandeling van een ziekte of klinische conditie is dat wél. De grens loopt bij het *beoogde doel* en bij hoe de output zich presenteert.

Verbinding zit dichter bij die grens dan onze andere domeinen. Daarom, aanvullend op de bestaande `COMPLIANCE.md`-regels:

**Verboden:**
- Elke afkapwaarde of categorie uit een gevalideerde schaal ("sterk eenzaam", "sociaal geïsoleerd", `< 12`, somscore 0–6).
- Elk woord dat een toestand benoemt in plaats van gedrag: eenzaam, isolatie, sociaal angstig, depressief, teruggetrokken.
- Elke screeningvraag over stemming, hopeloosheid, zelfbeschadiging of suïcidaliteit. **Geen PHQ, geen GAD, geen enkel item daaruit.** Dat is een klinische verwerking en zou het beoogde doel van het platform veranderen.
- Elke individuele risico-uitspraak op basis van de WHO-cijfers ("dit verhoogt jouw sterfterisico").

**Toegestaan:**
- Gedragsfeiten en frequenties uit eigen antwoorden, letterlijk teruggegeven.
- Populatie-uitspraken met bron, expliciet als populatieverband gelabeld — zelfde patroon als "populatierichtlijn" bij voeding.
- Eigen-oordeelvragen over toereikendheid ("is dit genoeg voor jou?"), omdat het antwoord van de gebruiker komt en niet van ons.

### C3 · LOCK — AVG art. 9, zelfde pad als de andere check-ins

Verbinding-antwoorden zijn **gezondheidsgegevens** (art. 9) — even goed als slaap- of voedingsantwoorden, en gevoeliger in beleving. Geen nieuwe rechtsgrond, geen nieuw pad: hergebruik het bestaande.

| Aspect | Invulling |
|---|---|
| Rechtsgrond | Art. 9 lid 2 sub a jo. art. 6 lid 1 sub a — uitdrukkelijke toestemming |
| Consent-tekst | Bestaande `domain_checkin_logging` ([consent-texts.ts:47](../../src/lib/consent-texts.ts#L47)) — dekt "periodieke domein-checkin", geen nieuwe tekst nodig |
| Vastlegging | `consent_records` met hash, zoals `sleep-checkin/route.ts:313-322` |
| Opslag | `intake_domain_checkin`, `domain_key = "connection_score"`, antwoorden in `raw_inputs` |
| Retentie | 24 maanden, volgt intake-retentie — geautomatiseerd |
| Intrekken | Bestaande revoke-flow; `cleanup_intake_session_linked_data()` **verwijdert** `intake_domain_checkin`-rijen al ([migratie r.64](../../supabase/migrations/20260612100000_intake_domain_checkin.sql#L64)) — geen aanpassing nodig |
| Toegang | Tabel heeft RLS aan **zonder anon/authenticated policies**: uitsluitend service-role via API-route |
| Doorgifte | Geen; blijft in Supabase Frankfurt |
| Vrije tekst | **Nooit** in `domain_events`, GA4 of Clarity — bestaande lock uit het ijkpunt-plan, hier extra scherp |

**DPIA-actie:** §1.3 krijgt één rij — *"Verbinding-checkin (contactritme, initiatief, ervaren steun) — **Ja**, gezondheidsgegevens"*. En §3 krijgt één risico:

> **R8 · Vragen over sociaal contact raken schaamte en worden als beoordeling gelezen.** Kans: middel. Impact: middel. Maatregel: geen toestandslabels, geen klinische afkap, zelf-kalibratievraag die "weinig contact als eigen keuze" expliciet valide maakt, één neutrale doorverwijsregel zonder trigger-copy, geen e-mailnurture op een laag verbinding-antwoord (§C5).

### C4 · VOORSTEL — het vangnet: één stille regel, geen crisisflow

Dit is de moeilijkste afweging in het dossier. Twee foute uitersten:

- **Te veel:** een crisisbanner of 113-verwijzing na een laag antwoord. Dat vereist dat we suïciderisico *inschatten* — een klinische handeling die we niet doen, niet mogen en niet kunnen. Het is bovendien schadelijk: iemand die aangeeft weinig mensen te hebben, wordt dan behandeld als noodgeval.
- **Te weinig:** een man vult in dat hij niemand heeft om op terug te vallen, en het systeem antwoordt met "plan een vast moment in je week". Dat is tone-deaf en ondermijnt vertrouwen.

**Voorstel — de middenweg:** één permanent zichtbare, niet-conditionele regel onder de verbinding-readout, identiek in elke toestand:

> *Loopt dit verder dan een druk leven — voel je je langere tijd niet goed — dan is je huisarts het juiste startpunt. Deze check meet leefstijl, geen klachten.*

**Waarom niet-conditioneel:** een regel die alleen bij lage scores verschijnt, is zelf een diagnostische uitspraak ("wij vinden jou een geval"). Altijd-zichtbaar is informatie; conditioneel-zichtbaar is een oordeel. Dat is precies dezelfde logica als `urgency_level` niet user-facing maken (DPIA R4).

**Aanvullend, wel conditioneel maar op gedrag:** bij het laagste antwoord op de anker-vraag krimpt de ladder naar **één** actie en verdwijnt elke "verder"-copy — hetzelfde `railSingleAction`-patroon als voeding F3. Minder aanbod, niet meer.

### C5 · LOCK — geen nurture, geen e-mail, geen upsell op een laag verbinding-signaal

`nurture-content.ts` en `resolve-nurture-cta.ts` mogen **niet** getriggerd worden door een laag verbinding-antwoord. Reden: een geautomatiseerde e-mail over sociaal contact naar iemand die net invulde dat hij weinig mensen heeft, is precies de functie-creep uit DPIA R4 — en het is commercieel gebruik van het gevoeligste gegeven dat we hebben. [resolve-nurture-cta.ts:46](../../src/lib/resolve-nurture-cta.ts#L46) bevat al de CTA *"Bekijk je inzichten over verbinding"*; die mag blijven bestaan als route, maar mag niet **door** een verbinding-antwoord worden geselecteerd.

### C6 · LOCK — verbinding heeft geen schap, structureel

Er bestaat **geen EFSA-goedgekeurde claim die een voedingsstof verbindt met sociaal contact, verbondenheid of eenzaamheid.** Wat wél bestaat en misbruikt kan worden: magnesium *"Draagt bij tot een normale psychologische functie"* ([approved-claims.ts:131](../../src/data/approved-claims.ts#L131)). Dat gaat over zenuwstelselfunctie, niet over relaties.

**Lock:** in het verbinding-domein — check-in, readout, ladder, plan, inzichten — komt **nooit** een supplement, prijs, productkaart of vergelijk-link. Laag 6 van de ladder is bij slaap en voeding "aanvullen & vergelijken"; **bij verbinding bestaat die laag niet.** De zesde laag is "volgen & bijsturen", en die eindigt met een expliciete weigering in de copy:

> *Hier komt geen potje. Er is geen supplement dat contact vervangt, en geen goedgekeurde claim die dat suggereert.*

Dat is geen omzetverlies maar het scherpste Consumentenbond-signaal dat we kunnen afgeven — op de enige plek waar een concurrent wél een magnesiumpot zou neerzetten. Commercieel is verbinding een **vertrouwens- en retentiedomein**, geen conversiedomein. Dat moet in de businessverwachting staan vóór er gebouwd wordt.

### C7 · LOCK — vraagontwerp tegen schaamte

Vier regels, direct uit §B6:

1. Het woord "eenzaam" komt niet voor in de check.
2. Vragen gaan over **de afgelopen twee weken** en over **gedrag**, niet over "hoe voel je je".
3. Elke vraag heeft een antwoordoptie die **geen probleem** is. Er is geen vraag waar elk antwoord een tekort impliceert.
4. De kalibratievraag (§D, V7) is verplicht en komt vóór de readout: weinig contact dat voor jou klopt, is **geen** aandachtspunt. Zonder die vraag labelen we introverte mannen als probleemgeval — feitelijk fout en compliance-gevoelig.

---

## D · De vragenlijst — VOORSTEL

**Zeven items + één contextvraag.** Vergelijkbaar met stress (2 score + 1 regie + 6 diepte). Doorlooptijd ± 90 seconden.

### D1 · Scoredrager — ongewijzigd

**LOCK:** `CON_SOC` blijft **het enige score-dragende item** voor `connection_score`, met exact de bestaande vier opties en waarden. Alle nieuwe items zijn **context in `raw_inputs`**, niet in `calcDomainScores` — hetzelfde patroon als `STRESS_REGIE_QUESTION.grip` ([stress-checkin/index.ts:44](../../src/data/stress-checkin/index.ts#L44)).

Gevolg: **geen `rules_version`-bump, geen comparabiliteitsbreuk, baseline intact, geen migratie.** De check-in levert een readout en een ladderfocus, geen nieuw getal. Voor de ladderfocus geldt hetzelfde als bij slaap: `resolveSleepFocusLayer` leest de ruwe velden, niet de score ([sleep-ladder.ts:42](../../src/lib/sleep-ladder.ts#L42)).

De schaalfout uit §A2 wordt **niet** hier gerepareerd. Zie §L1.

### D2 · De items

Veldnamen `CON_*`. In de check-in wordt V1 (= `CON_SOC`) op dezelfde manier herhaald als bij stress/slaap, zodat de hermeting op hetzelfde item rust.

**V1 · Terugvalsteun — ANKER, score-dragend, ongewijzigd**
> Heb je mensen op wie je kunt terugvallen?
> *Denk aan partner, vrienden of familie waar je op drukke of mindere dagen op kunt bouwen.*
- Ja, en dat voelt ruim voldoende — `4`
- Ja, een paar — en dat is genoeg voor mij — `4`
- Er zijn mensen, maar ik mis soms echt contact — `2`
- Ik heb weinig mensen om op terug te vallen — `1`

*Construct: ervaren steun-adequaatheid, kwaliteit-first. Evidence: bestaand `CON_SOC`-blok in `leefstijlcheck-evidence.ts`.*

**V2 · Contactritme — `CON_FREQ`, context**
> Hoe vaak zag of sprak je de afgelopen twee weken iemand buiten je huishouden, langer dan even iets praktisch?
- Meerdere keren per week — `4`
- Ongeveer één keer per week — `3`
- Een paar keer in die twee weken — `2`
- Eigenlijk niet — `1`

*Construct: structurele laag (contactfrequentie). Waarom gedrag en niet gevoel: dit is het enige item dat een gebruiker kan verifiëren en dat direct in een agenda past. "Langer dan even iets praktisch" scheidt logistiek van contact.*

**V3 · Initiatief — `CON_INIT`, context. De hefboomvraag.**
> Als je iemand ziet, van wie komt het initiatief meestal?
- Meestal van mij, of om en om — `4`
- Wisselt, maar vaak van de ander — `3`
- Bijna altijd van de ander — `2`
- Er komt weinig van beide kanten — `1`

*Construct: agency. Evidence: §B4 — de sterkst werkende interventierichting is die op eigen regie, niet op netwerkomvang. Sluit direct aan op doelenum `contact_onderhouden` ("Vrienden zien zonder dat het van hen moet komen").*

**V4 · Gedeelde activiteit — `CON_ACT`, context**
> Is er iets wat je regelmatig sámen met anderen doet — sport, klussen, muziek, kaarten, wandelen?
- Ja, wekelijks of vaker — `4`
- Ja, maar onregelmatig — `3`
- Nee, maar er is wel iets wat ik zou willen — `2`
- Nee — `1`

*Construct: schouder-aan-schouder-verbinding. Evidence: §B5. Optie 3 is bewust geen tekort maar een openingsactie.*

**V5 · Vertrouwenspersoon — `CON_CONF`, context**
> Is er iemand met wie je kunt praten over wat er echt speelt?
- Ja, meerdere mensen — `4`
- Ja, één iemand — `4`
- Iemand wel, maar ik doe het bijna nooit — `2`
- Nee, niet echt — `1`

*Construct: emotionele laag. Waarom twee opties dezelfde waarde: één vertrouwenspersoon is voldoende — de literatuur (§B3) zegt dat emotionele eenzaamheid niet met aantallen opgaat. De derde optie onderscheidt "geen persoon" van "geen gewoonte" — een gedragsverschil met een andere actie.*

**V6 · Wederkerigheid — `CON_GIVE`, context**
> Is er iemand die op jou rekent — iemand voor wie je iets doet?
- Ja, meerdere mensen — `4`
- Ja, iemand — `3`
- Nauwelijks — `2`
- Nee — `1`

*Construct: wederkerigheid/betekenis. Waarom deze vraag erin hoort: verbinding is niet alleen krijgen. Bij mannen 40+ is "nodig zijn" een sterker aangrijpingspunt dan "steun ontvangen" — en het is de enige vraag die geen hulpvraag is.*

**V7 · Kalibratie — `CON_FIT`, context. VERPLICHT, vóór de readout.**
> Past de hoeveelheid contact die je nu hebt bij jou?
- Ja, dit past me goed — `4`
- Grotendeels wel — `3`
- Niet helemaal — ik zou meer willen — `2`
- Nee, dit is te weinig — `1`

*Construct: eigen ijkpunt. Dit is de compliance-sleutel (§C7.4): **bij `4` toont de readout geen aandachtspunt, ongeacht V2–V6.** Weinig contact dat past, is geen probleem. Zonder dit item maken we van een voorkeur een tekort.*

**V8 · Barrière — `CON_BLOCK`, context, routeert acties**
> Wat houdt contact het vaakst tegen?
- Tijd en werk — `4`
- Afstand — mijn mensen wonen niet dichtbij — `3`
- Ik heb er 's avonds de energie niet voor — `2`
- Ik weet niet goed waar ik zou beginnen — `1`

*Geen scorewaarde-betekenis (de cijfers zijn alleen sleutels), wel actie-routering: tijd → agenda-actie · afstand → bel/videoritme · energie → koppeling met slaap/stress · niet weten → activiteit-eerst (V4-route).*

### D3 · Wat er níet in zit, en waarom

| Weggelaten | Reden |
|---|---|
| Directe eenzaamheidsvraag | §B6 + §C7.1 — frontaal vragen kost respons en levert niets actionabels |
| Netwerkomvang ("hoeveel vrienden") | Kwantiteit voorspelt zwakker dan kwaliteit (§B3); levert een getal zonder actie |
| Stemming, energie-in-relaties, sociale angst | §C2 — klinisch terrein |
| Buren/praktische hulp (OSSS-3 item 3) | Slecht passend voor NL man 40+; levert geen actie |
| Vrije tekst | §C3 — schaamtegevoelige vrije tekst is een bewaarrisico zonder opbrengst; het doel-eigen-woorden-veld bestaat al apart en is aan strengere regels gebonden |
| Relatiestatus / scheiding / verlies | Zeer gevoelig, en de enige toepassing zou segmentatie zijn. Doelenum `opnieuw_opbouwen` vangt dit al **op initiatief van de gebruiker** — dat is de juiste kant op |

### D4 · Help-disclosure per vraag

Zelfde patroon als voeding V1e: één `<details>`, trigger vast **"Waarom vragen we dit?"**, ónder het antwoordblok en bóven de nav-rij. Body = mechanisme + bron, feit-eerst. Voorbeeld bij V3:

> Onderzoek naar wat eenzaamheid vermindert vindt de sterkste effecten niet bij méér contacten, maar bij verschuiving in wie het initiatief neemt (meta-analyse over 280 studies, 2024). Daarom vragen we niet hoeveel mensen je kent, maar van wie het uitgaat.

---

## E · De prioriteitenladder — VOORSTEL

Zes lagen, laag 1 boven, `.pl-row`-shell uit slaap v2, vier toestanden (`winst` · `ok` · `watch` · `wacht`) — identiek aan `STRESS_PRIORITY_LAYERS` en direct bruikbaar in de bestaande `DomainLifestyleLadder`.

| # | Naam | Ondertitel | Gemeten door | Winst-conditie |
|---|---|---|---|---|
| **P1** | Vast moment in je week | Eén contactmoment dat niet van de dag afhangt | V2, V8 | V2 ≤ 2 |
| **P2** | Jij zet het in gang | Van wachten naar zelf voorstellen | V3 | V3 ≤ 2 en V2 ≥ 3 |
| **P3** | Samen iets doen | Een activiteit als drager, niet een gesprek als doel | V4 | V4 ≤ 2 en V2/V3 ≥ 3 |
| **P4** | Eén gesprek dat verder gaat | Iemand die weet wat er echt speelt | V5 | V5 ≤ 2 en P1–P3 staan |
| **P5** | Iets betekenen voor iemand | Nodig zijn is ook verbinding | V6 | V6 ≤ 2 en P1–P4 staan |
| **P6** | Volgen & bijsturen | Je eigen nulpunt, geen norm — en geen schap | — | nooit `winst` |

**Waarom deze volgorde.** Van goedkoop-en-structureel naar duur-en-persoonlijk. P1 is gelegenheid (§B4.2: de vloer). P2 is agency (§B4.1: de sterkste hefboom, maar zinloos zonder gelegenheid). P3 is het doelgroepmechanisme (§B5) en de brug van structuur naar inhoud. P4 raakt emotionele eenzaamheid (§B3) en staat bewust laat: een diepgesprek forceren bij iemand die niemand regelmatig ziet, is een advies dat niet kan landen. P5 is wederkerigheid — de laag die van ontvanger naar deelnemer maakt. P6 is de weigering.

**Acties per laag** — max 3, één regel, concreet en vandaag te doen. P1 als voorbeeld:
- Zet één terugkerend moment in je agenda met een naam erbij — niet "iemand bellen", maar wie en wanneer.
- Kies een moment dat niet van je energie afhangt: koppel het aan iets wat toch al vast staat.
- Stuur vandaag één bericht om dat moment te zetten, ook als het over drie weken valt.

**P6-copy, letterlijk (LOCK per §C6):**
> Geen norm, geen benchmark — je eigen nulpunt en wat er sindsdien verschuift. Hier komt geen potje: er is geen supplement dat contact vervangt, en geen goedgekeurde claim die dat suggereert.

**Kalibratie-uitzondering (LOCK per §C7.4):** bij `CON_FIT = 4` staat er **geen** `winst`-laag. Alle lagen krijgen `ok` of `wacht`, en de readout opent met de erkenning dat dit past. De ladder blijft leesbaar, maar duwt niet.

**Toestandslabels** — hergebruik `STRESS_LAYER_STATE_LABEL`: *Grootste winst · Op orde · Houd in de gaten · Nog niet nu*.

**Gedegradeerde modus (zonder check-in, zie §L0a).** Draait de ladder op `CON_SOC` alleen, dan is de focusresolutie: `CON_SOC ≤ 2` → **P1** `winst`, P2–P5 `wacht`, P6 `wacht` · `CON_SOC = 4` → **geen** `winst`-laag, alles `ok`/`wacht`. Twee toestanden, geen zes. Verplichte herkomstregel boven de ladder: *"Dit beeld komt uit je Leefstijlcheck — één vraag over terugvalsteun."* De laagnamen, acties en P6-weigering blijven identiek, zodat de latere check-in alleen de focus verfijnt en niets herschrijft.

---

## F · Gratis versus premium

Bestaand besluit: **check-in gratis, plan premium.** Voor verbinding geldt dat met één aanscherping — hier is gratis niet alleen een funnel maar de kern van de propositie, omdat er geen product achter zit (§C6).

**Gratis, en goed:**
- De verbinding-check (V1–V8) en de readout — inclusief V1 als hermeetbaar anker.
- De **volledige** ladder met alle zes lagen open leesbaar, focuslaag gemarkeerd, en **één** actie op de focuslaag.
- De kalibratie-erkenning en de vangnetregel (§C4).
- De hermeting-aftelling (14 dagen) en de delta op V1–V6 in letterlijke antwoordlabels.
- Eén inzichten-artikel dat het emotioneel/sociaal-onderscheid uitlegt.

**Premium:** het Verbindingsplan (`connectionPlanTemplate`) — fase-opbouw over weken, agenda-koppeling, cross-domein (stress-grenzen → ruimte in de week; slaap → avondenergie voor contact), en de doel-ijkpunt-lus per hermeting.

**Waarom de hele ladder gratis en niet drie-van-zes:** bij voeding en slaap is de ladder een aanloop naar een schap. Hier is de ladder het eindproduct. Een poort in een domein zonder product levert geen omzet en kost precies het vertrouwen dat dit domein moet opbouwen. **Verbinding gratis houden is de prijs van de Consumentenbond-positionering** — en het is de goedkoopste geloofwaardigheidsinvestering in het hele platform.

---

## G · Data & engine — geen migratie

| Onderdeel | Invulling |
|---|---|
| Tabel | `intake_domain_checkin` — bestaat; `domain_key` is `text` **zonder CHECK-constraint** ([migratie](../../supabase/migrations/20260612100000_intake_domain_checkin.sql#L9)) |
| `domain_key` | `"connection_score"` — nieuwe waarde, geen DDL |
| `raw_inputs` | `{ CON_SOC, CON_FREQ, CON_INIT, CON_ACT, CON_CONF, CON_GIVE, CON_FIT, CON_BLOCK }` + readout-snapshot, patroon `sleep-checkin/route.ts:383` |
| `score` | `{ connection_score }` — afgeleid van **alleen** `CON_SOC`, identiek aan intake |
| `CHECKIN_DOMAIN_TO_PILLAR` | Rij toevoegen: `connection_score: "verbinding"` ([account-dashboard.ts:118](../../src/lib/account-dashboard.ts#L118)) |
| `rules_version` | **Onveranderd 1.4.0.** Geen bump, geen breuk (§D1) |
| Route | `src/app/api/intake/connection-checkin/route.ts` — kopie van sleep-checkin: consent-verplicht, rate-limited, service-role |
| Consent | Bestaande `domain_checkin_logging` |
| Ladder-lib | `src/lib/connection-ladder.ts` + `src/data/connection/lifestyle-priorities.ts` |
| Component | `DomainLifestyleLadder` — `domain`-prop uitbreiden van `"slaap" \| "stress"` naar `\| "verbinding"` ([DomainLifestyleLadder.tsx:47](../../src/components/dashboard/domain/DomainLifestyleLadder.tsx#L47)) |
| Kompas-actie | `kompas-domain-actions.ts` case `"verbinding"`: DEFER-tak vervangen door checkin/result-tak zoals stress |

---

## H · Meetpunten

Drie lagen zoals de meet-standaard voorschrijft; elk nieuw client-event op drie registratieplekken (`events.ts` + `intake-events-client.ts` + allowlist in `api/intake/events/route.ts`).

| Event | Status | Payload | Hier lees je aan af |
|---|---|---|---|
| `connection_checkin_completed` | nieuw | `{ has_delta, focus_layer }` | Of de check überhaupt wordt afgemaakt — verwacht de hoogste drop-off van alle vijf |
| `connection_checkin_routing_click` | nieuw | `{ target, surface }` | Welke uitgang na de readout wint |
| `connection_question_help_opened` | nieuw | `{ field }` | De vraag met de meeste opens is de slechtst geformuleerde vraag |
| `verbinding_ladder_layer_open` | hergebruik patroon | `{ layer, surface }` | Of de ladder werkscherm is of leesscherm |
| `connection_layer_action_click` | nieuw | `{ layer, action_id }` | Of één actie op de focuslaag genoeg is |
| `domain_tool.snapshot_viewed` | hergebruik | `{ domain: "verbinding" }` | Terugkeer los van de check |

**Geen PII, geen antwoordlabels in payloads, geen vrije tekst.** Specifiek verboden: het uitzenden van `CON_FIT`, `CON_CONF` of `CON_SOC`-waarden als event-parameter — dat zou een gezondheidsgegeven naar GA4 sturen.

**Meetpunt bij oplevering:** `connection_checkin_completed` tegenover de start van de flow — daar lees je af of §C7 (vraagontwerp tegen schaamte) werkt. Blijft de completion-ratio ver onder slaap/stress, dan is een vraag te confronterend en niet de flow te lang.

---

## I · Copy-lock

**Verboden in gerenderde tekst, aria-labels en eyebrows:**
eenzaam · eenzaamheid · isolatie · sociaal geïsoleerd · teruggetrokken · depressief · sociale angst · netwerk (als score) · "sterk/enigszins eenzaam" · elke somscore of afkapwaarde · "je hebt te weinig vrienden" · "Laag N" / "Prioriteit N" als ordinaal boven de laagnaam · stappenplan · route · fase · spoor · categorie · cockpit · biohack · pijl als richtingsteken · eindelijk/gelukkig/helaas · elk supplement, merk, prijs of vergelijk-link.

**Toegestaan:** de zes laagnamen · "contact" · "steun" · "iemand op wie je kunt terugvallen" · letterlijke antwoordlabels · "hier ligt je winst" · populatiecijfer mét bron en mét het woord populatie.

**Toonijkpunt (WRITING_VOICE):** begrip → mechanisme → actie. Nooit "je moet meer sociaal zijn". Wel: *"Contact dat van de dag moet komen, komt er niet. Een moment met een naam en een tijd erin, komt er wel."*

---

## J · Toestanden — acceptatiematrix

| | Readout opent met | Focuslaag | Acties | Vangnetregel | Schap |
|---|---|---|---|---|---|
| **C1** eerste check, V2 laag | contactritme-feit | P1 | 3 | zichtbaar | geen |
| **C2** ritme staat, initiatief laag | initiatief-feit | P2 | 3 | zichtbaar | geen |
| **C3** V1 laagste antwoord | erkenning, geen advies-opening | P1 | **1** | zichtbaar | geen |
| **C4** `CON_FIT = 4` | "dit past je" | **geen** | 0 | zichtbaar | geen |
| **C5** onderhoud, alles ≥ 3 | volhouden | P4 of P5 | 3 | zichtbaar | geen |
| **C6** geen check | CTA naar de check | wachtstand | 0 | zichtbaar | geen |

Machinaal te bevestigen bij oplevering: één `<h1>` per frame · C3 rendert precies één actie · C4 rendert nul `winst`-lagen · nul supplement-/prijs-/vergelijkstrings in élke toestand · vangnetregel byte-identiek in alle zes · nul verboden woorden uit §I over alle toestand×laag-combinaties.

---

## K · Bouwvolgorde

| Slice | Inhoud | Afhankelijk van |
|---|---|---|
| **W0** | Dit besluit vaststellen; §C4-vangnetcopy en §L-besluiten beslecht | Dennis |
| **W1** | `src/data/connection-checkin/index.ts` — V1–V8 + help-objecten; `leefstijlcheck-evidence.ts` uitbreiden met de nieuwe velden | W0 |
| **W2** | `src/data/connection/lifestyle-priorities.ts` — zes lagen + acties; `src/lib/connection-ladder.ts` — focus + toestanden + `whyWait` | W1 |
| **W3** | `ConnectionCheckin.tsx` + `api/intake/connection-checkin/route.ts` (consent, rate-limit, `domain_key`) | W1 |
| **W4** | `ConnectionCheckinReadout.tsx` + delta op letterlijke antwoordlabels | W2, W3 |
| **W5** | Verbinding-tak in `VoortgangDomeinScreen`; `DomainLifestyleLadder`-prop uitbreiden; `CHECKIN_DOMAIN_TO_PILLAR` | W2, W4 |
| **W6** | `kompas-domain-actions.ts` DEFER-tak weg; `dashboard-route`/`context-rail` doorlopen | W5 |
| **W7** | Meetpunten §H op drie registratieplekken | W3–W6 |
| **W8** | DPIA §1.3 + R8, `COMPLIANCE.md`-sectie verbinding, privacyverklaring-check | W3 |
| **W9** | Eén inzichten-artikel (emotioneel vs sociaal), gratis | W1 |
| **W10** | Premium `connectionPlanTemplate` in `lifestyle-plans/` | W5 |

W8 is **geen sluitpost**: de DPIA-rij en de compliancesectie horen in dezelfde review als de route die de gegevens gaat opslaan.

---

## L · Open besluiten voor Dennis — vijf

**L0 · Dit document draait de DEFER van 26 juli terug. Bevestigen of niet?**
Op 26 juli is expliciet vastgelegd: *"Verbinding heeft bewust geen eigen check (DEFER)"* → de leefstijlbalk toont *"Meet mee in je hermeting — over N dagen"*, zodat verbinding meetelt in het ritme **zonder een test te suggereren**. Dat besluit staat nog in `kompas-domain-actions.ts:108` en in `DomainCheckStrip`. §D–§K hierboven vereist een eigen check en dus een terugdraai.

Drie routes:

| | Wat je bouwt | Ladderfocus | Kosten |
|---|---|---|---|
| **a. DEFER blijft** | W1 + W2 + W5 + W9: items als data, ladder-data, ladder op de domeinpagina, één artikel | **Gedegradeerd**: alleen uit `CON_SOC` — `≤ 2` → focus P1, `= 4` → geen focus (§E-kalibratie). Twee toestanden i.p.v. zes | Laag. Geen route, geen consent-pad, geen event-registratie, geen DPIA-wijziging |
| **b. DEFER terugdraaien** | W0–W10 volledig | Zes lagen, echte focus | Hoog. Nieuwe route + consent + DPIA + `DomainCheckStrip`-copy om |
| **c. Nu niets** | Alleen dit document | — | Nul, maar verbinding blijft het gat in de vitaalscore |

**Advies: a.** Het levert precies wat je vroeg — de basis en het gratis deel goed neergezet, verbinding alvast meegenomen — zonder het 26-juli-besluit te breken en zonder het gevoeligste consent-pad te openen voordat §L2 en §L4 beslecht zijn. W1 en W2 zijn pure data en zijn later één-op-één de input voor route b: niets van dat werk gaat verloren als je de check later alsnog bouwt. De gedegradeerde focus is eerlijk — de ladder claimt dan niet meer te weten dan één intakevraag oplevert.

Wat route a **niet** mag doen: de ladder tonen alsof er gemeten is. Bij `CON_SOC`-only staat er één regel boven de ladder: *"Dit beeld komt uit je Leefstijlcheck — één vraag over terugvalsteun. Een eigen verbinding-check bestaat nog niet."*



**L1 · ✅ BESLIST 13 augustus 2026 — repareer nu, vóór de W1-bouw, gebundeld met "Overtrainer".**
Dennis' vraag: waarom wachten als er (mogelijk) geen actieve gebruikers zijn? Het aantal is niet geverifieerd — verbinding draait sinds 1 juli in productie (`121db26`, rules_version 1.3.0) en de site is live sinds april, dus vermoedelijk bestaat er wél sessiedata. **Dat aantal is echter niet de doorslaggevende factor.** De doorslaggevende factor: Verbinding v1 (dit hele document, W0–W10) staat nog nergens in `src/` — er is dus geen bestaande feature die een breaking bump zou verstoren, alleen historische sessiedata. Een `rules_version`-bump is precies het bestaande mechanisme hiervoor en is dit kwartaal al drie keer bewust ingezet (1.3.0 → 1.4.0 → 1.5.0, laatste 19 juli). Wachten betekent Verbinding v1 bouwen óp de kapotte schaal en er ná oplevering nog een bump overheen moeten zetten — dat is duurder dan nu, niet goedkoper.

**Besluit:** reparatie + de al openstaande "Overtrainer"-P2 (semantisch scheef label bij lage beweging) samen in **`RULES_VERSION 1.6.0`**, vóór W1 start:
1. `CON_SOC`-optie *"Ja, een paar — en dat is genoeg voor mij"* van `value: 4` naar `value: 3` ([intake-questions.ts:221](../../src/data/intake-questions.ts#L221))
2. `CONNECTION_DELTA_COMPARABLE_FROM` → `"1.6.0"` ([rules-version.ts](../../src/lib/rules-version.ts))
3. Nieuw label voor `NAMED_DOMAIN_LABELS.movement` (nu `"Overtrainer"`, [intake-engine.ts:300](../../src/lib/intake-engine.ts#L300)) — verschijnt bij te wéínig beweging, niet te veel. Naamkeuze aan Dennis.

Aanvullend, bij de doorvoer: eerst tellen via Supabase Dashboard SQL Editor (`select rules_version, count(*) from intake_sessions where domain_scores ? 'connection_score' group by rules_version`) om de breuk te documenteren, niet om het besluit ervan te laten afhangen.

**Zijstap — vitaliteitsscore-als-geheel, geen aparte actie.** Dennis vroeg of de totale vitaliteitsscore net als de leefstijlmeter een "dit is speculatie"-signaal moet krijgen voor domeinen zonder gevalideerd instrument. **Advies: totaalscore ongewijzigd laten** — dat raakt alle vijf domeinen, ondermijnt de Consumentenbond-zekerheid op het enige herkenbare getal, en het probleem wordt vanzelf kleiner na deze reparatie (4 punten i.p.v. een gat) en verdwijnt verder zodra Verbinding v1 acht items heeft. **Wat wél hergebruikt wordt, in W4/W5:** het bestaande `own`-patroon uit beweging (`MOVEMENT_FACT_STATUS_LABELS`, neutrale badge "Jouw ijkpunt", [MovementFactReadout.tsx:14](../../src/components/intake/MovementFactReadout.tsx#L14)) toepassen op `connection_score` in de domeinuitsplitsing op Voortgang — niet op de totaalscore.

**L2 · ✅ BESLIST — altijd zichtbaar.**
Akkoord met het advies: één regel, geen kader, geen icoon, niet-conditioneel. Geen verdere actie.

**L3 · ✅ BESLIST — P-prefix blijft.**
Akkoord met het advies: P-prefix laten staan bij verbinding (consistent met slaap/stress), harmonisatie naar de voeding-glyph apart beslissen wanneer V1f landt.

**L4 · ✅ BESLIST — StatLine ophalen.**
Akkoord: `85766NED` ophalen voor het doelgroepcijfer 40–65 vóór W9.

---

## M · Bronnen

- WHO Commission on Social Connection, *From loneliness to social connection: charting a path to healthier societies* (30 juni 2025) — [who.int](https://who.int/news/item/30-06-2025-social-connection-linked-to-improved-heath-and-reduced-risk-of-early-death) · [commissiepagina](https://www.who.int/groups/commission-on-social-connection)
- *Social health — the neglected third pillar*, The Lancet Public Health (2025) — [thelancet.com](https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(25)00175-6/fulltext)
- CBS, *10 procent van de 15-plussers sterk eenzaam in 2024* (2025) — [cbs.nl](https://www.cbs.nl/nl-nl/nieuws/2025/39/10-procent-van-de-15-plussers-sterk-eenzaam-in-2024) · [technische toelichting](https://www.cbs.nl/nl-nl/nieuws/2020/13/bijna-1-op-de-10-nederlanders-voelde-zich-sterk-eenzaam-in-2019/technische-toelichting-eenzaamheid) · [StatLine 85766NED](https://www.cbs.nl/nl-nl/cijfers/detail/85766NED)
- VZinfo, *Eenzaamheid — leeftijd en geslacht*, Gezondheidsmonitor 2024 — [vzinfo.nl](https://www.vzinfo.nl/eenzaamheid/leeftijd-en-geslacht) · [methoden](https://www.vzinfo.nl/eenzaamheid/verantwoording/methoden)
- De Jong Gierveld & Van Tilburg (2006/2008), *De ingekorte schaal voor algemene, emotionele en sociale eenzaamheid* — [VU-repository](https://research.vu.nl/files/2359269/2008%20TGG%20dJG%20vT%206-item%20eenzaamheidsschaal.pdf) · [gebruiksvoorwaarden](http://jennygierveld.blogspot.com/p/eenzaamheidsschaal.html) (**wetenschappelijk onderzoek**)
- Masi, Chen, Hawkley & Cacioppo (2011), *A Meta-Analysis of Interventions to Reduce Loneliness* — [journals.sagepub.com](https://journals.sagepub.com/doi/10.1177/1088868310377394)
- *Are Loneliness Interventions Effective for Reducing Loneliness? A Meta-Analytic Review of 280 Studies*, American Psychologist (2025) — [apa.org](https://www.apa.org/pubs/journals/releases/amp-amp0001578.pdf)
- Kocalevent et al. (2018), *Standardization of the Oslo social support scale (OSSS-3)*, BMC Psychology — [springer](https://link.springer.com/article/10.1186/s40359-018-0249-9)
- Lubben et al. (2006), *Performance of an Abbreviated Version of the Lubben Social Network Scale*, The Gerontologist — [academic.oup.com](https://academic.oup.com/gerontologist/article/46/4/503/623897)
- *The role of activity engagement, social connection, and masculinity norms in men's shed outcomes*, Frontiers in Public Health (2026) — [frontiersin.org](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2026.1884564/full) · *Building Purpose and Belonging Shoulder-to-Shoulder*, Can J Aging — [cambridge.org](https://www.cambridge.org/core/journals/canadian-journal-on-aging-la-revue-canadienne-du-vieillissement/article/building-purpose-and-belonging-shouldertoshoulder-exploring-the-social-and-emotional-impacts-of-the-squamish-mens-shed/003BFCCDA0512CC6A8DF1702884BC9C2)
- Movisie, *Hoe maak je eenzaamheid bespreekbaar?* — [movisie.nl](https://www.movisie.nl/tool/tool-hoe-maak-je-eenzaamheid-bespreekbaar) · *Hoe praat je over eenzaamheid?* — [movisie.nl](https://www.movisie.nl/artikel/hoe-praat-je-over-eenzaamheid)
- MDCG 2019-11 (rev. 1, 17 juni 2025), *Qualification and classification of software* — [health.ec.europa.eu](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_en_0.pdf)
- Intern: `docs/core/COMPLIANCE.md` · `docs/core/DPIA.md` · `docs/core/WRITING_VOICE.md` · `docs/design/BESLUIT_SLAAP_PIRAMIDE_V2_2026-08.md` · `docs/design/BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md`
