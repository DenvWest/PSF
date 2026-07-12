# Leefstijlcheck — Integrale expertreview (validiteit, psychometrie, inclusie, score)

> **Type:** multidisciplinaire expertreview (leefstijlgeneeskunde, gezondheidspsychologie, gedragswetenschap, epidemiologie, psychometrie, UX-research, preventie). Geen code.
> **Datum:** 11 juli 2026 · RULES_VERSION 1.3.1 · alle claims geverifieerd tegen `src/` op deze datum.
> **Relatie tot eerdere review:** `docs/research/LEEFSTIJLCHECK_SCOPE_REVIEW.md` behandelde scope-architectuur (tier-1/tier-2) en verbinding als anker. Dit rapport gaat verder: per-vraag-validiteit, psychometrische kwaliteit, bias/stigmatisering, inclusiviteit en het scoringsmodel zelf. Overlap wordt kort aangestipt met verwijzing; nieuwe bevindingen krijgen de ruimte.
> **Compliance-legenda:** ✅ toegestaan · ⚠️ voorzichtig formuleren (veilige copy gegeven) · ❌ niet toegestaan.
> **Referentie-caveat:** DOI/PMID's zijn op vakkennis aangeleverd; drie verbinding-referenties zijn extern geverifieerd (juli 2026), de overige moeten vóór user-facing gebruik op `/onderbouwing` tegen de bron gecheckt worden.

---

## 1. Algemene beoordeling van de totale vragenlijst

**Wat staat er goed.** De check heeft een conceptueel model dat veel commerciële leefstijltests missen: een expliciet onderscheid tussen **interventiedomeinen** (slaap, stress, verbinding, voeding, beweging — sturen de vitaliteitsscore), **readouts** (energie, herstel — uitkomsten, geen gedragsdoelen) en **signalen** (alcohol, daglicht — quick-win-triggers). Dat onderscheid is wetenschappelijk verdedigbaar en zeldzaam netjes doorgevoerd (`vitaliteit.ts` middelt bewust alleen de vijf interventiedomeinen). De engine is regelgebaseerd en transparant, elke vraag heeft publieke onderbouwing (`/onderbouwing`), de cross-domein-balansregel (`enforceCrossDomainBalance`) voorkomt kale supplementlijsten, en legacy-antwoord-id's worden netjes gemigreerd (`getStressRecoveryAnswer` vangt `STR_RECV`/`RCV_MENT` op) — een goede gewoonte voor delta-vergelijkbaarheid.

**Waar het wringt.** Vier structurele problemen, in aflopende ernst:

1. **Het scoringsmodel bevat meetartefacten** die niemand bewust heeft ontworpen. Het aantal antwoordopties (een UX-keuze) bepaalt stilzwijgend het itemgewicht (een meetkeuze); de nominale 0–100-schaal loopt effectief van ~25–100 waardoor de "Prioriteit"-band en de urgentie-drempels grotendeels dood terrein zijn; en single-item-domeinen springen met stappen van 25 punten. Details en fixes in §9.
2. **Drie vragen meten iets anders dan ze pretenderen**: NRG_DEP (mengvat van drie constructen), NUT_PROT ("weet niet" wordt gescoord als laagste inname) en CON_SOC (de schaal overrulet het adequaatheidsoordeel dat de respondent zelf uitspreekt). §3.
3. **De vragenlijst is smaller dan het woord "vitaliteit" suggereert**: roken ontbreekt volledig, zingeving/maatschappelijke verbondenheid ontbreekt, sedentair gedrag ontbreekt. Sommige grenzen zijn bewust en juist (geen mentale-klachten-screening — compliance), maar ze zijn nergens als bewuste grens gedocumenteerd. §5.
4. **Meerdere formuleringen dragen impliciete normativiteit**: koffie wordt moreel gestraft terwijl de evidence dat niet draagt, een onregelmatig ritme leest als persoonlijk falen voor ploegendienstwerkers, en de beweging-voorbeelden ademen een sportief milieu. Geen ervan is kwaadaardig; samen kleuren ze wie zich welkom voelt. §6.

**Eindoordeel:** het fundament (drie-lagen-model, transparantie, compliance-discipline) is sterk genoeg om op door te bouwen; de vragenlijst is in de huidige vorm **bruikbaar maar niet af**. De prioriteitenlijst (§10) is zo geordend dat de validiteitswinst vooraan zit en de meeste fixes copy- of scoringsniveau zijn, geen architectuurverbouwing.

---

## 2. Review per domein

### 2.1 Slaap (SLP_QUAL, SLP_CONS, SLP_ONSET, SLP_WAKE — 4 vragen, 15 punten)

Inhoudelijk het sterkste domein: kwaliteit, regelmaat, inslapen en doorslapen dekken de vier klinisch relevante assen (subjectieve kwaliteit + de twee insomnia-subtypes + regulariteit). De evidence-basis is solide (CBT-I eerste keus, Riemann 2017, PMID 27890572; regelmaat als sterke voorspeller, Windred 2024, PMID 37738616). De problemen zijn psychometrisch: één antwoordoptie breekt de ordinaliteit (SLP_QUAL "Wisselend"), één vraag is dubbelloops (SLP_WAKE), en SLP_CONS weegt door zijn 3-puntsschaal stilzwijgend 20% van het domein waar de andere drie 26,7% wegen. Chronotype, ploegendienst en de alcohol-slaapkoppeling ontbreken (de laatste is als K-regel voorgesteld in de scope-review). Duur wordt niet gemeten — voor een screener verdedigbaar, want subjectieve kwaliteit en regelmaat voorspellen beter dan zelfgerapporteerde uren, maar het hoort bij de tier-2-slaaplog thuis.

### 2.2 Stress (STR_FREQ, STR_RCV — 2 vragen, 8 punten)

Frequentie + herstelvermogen is een verdedigbare minimale set (het spiegelt de kern van het effort-recovery-model, Geurts & Sonnentag 2006, PMID 16932076). Wat ontbreekt: **ervaren regie** — het hart van de Perceived Stress Scale (Cohen 1983, PMID 6668417) is niet "hoe vaak stress" maar "hoe vaak had je het gevoel het niet aan te kunnen". Twee mensen met dagelijkse stress verschillen fundamenteel in wat het met ze doet naargelang hun gevoel van controle. Coping, werkdruk vs privébelasting, en beschermende factoren zijn tier-2-materiaal. STR_RCV blijft dubbelloops (loslaten ≠ pauzes nemen — al geconstateerd in de scope-review; splitsing hoort in tier-2).

### 2.3 Verbinding (CON_SOC — 1 vraag, 4 punten)

De scope-review behandelde kwaliteit-vs-kwantiteit en de introvert-benadeling. Deze review gaat verder en vindt **vier aanvullende hiaten** in het construct:

- **Wederkerigheid.** De vraag meet alleen *ontvangen* steun ("op wie je kunt terugvallen"). Steun *geven* is een onafhankelijke voorspeller van welzijn en overleving (Brown et al. 2003, *Psychol Sci*, PMID 12807404). Voor mannen 40+ — vaak in de rol van kostwinner/mantelzorger die wél geeft maar niet vraagt — is dit precies de blinde vlek: iemand kan "nauwelijks terugvallen" scoren terwijl zijn verbindingsprobleem is dat de relatie eenrichtingsverkeer de andere kant op is.
- **Sociale belasting.** Contact dat energie kost (conflict, verplichting, toxische dynamiek) wordt niet onderscheiden van contact dat draagt (Umberson 2006, PMID 16583773). De huidige vraag telt een belastende relatie mogelijk als "mensen om je heen".
- **Eenzaamheid als eigen as.** Ervaren eenzaamheid ≠ objectief netwerk (Cacioppo & Hawkley 2010, PMID 20652462). Nederland heeft hiervoor een gevalideerd, kort instrument: de **De Jong Gierveld-schaal** (6-item versie: De Jong Gierveld & Van Tilburg 2006, *Res Aging*, DOI 10.1177/0164027506289723) — de logische basis voor een tier-2 verbinding-check-in, in coaching-taal hertaald (⚠️ nooit als "eenzaamheidstest" framen).
- **Maatschappelijke verbondenheid.** Vrijwilligerswerk, vereniging, buurt — geassocieerd met welzijn en lagere sterfte (Jenkinson 2013, *BMC Public Health*, DOI 10.1186/1471-2458-13-773). Volledig afwezig; voor de doelgroep (mannen die na hun 40e vriendschappen zien verwateren) vaak de meest begaanbare route terug — laagdrempeliger dan "verdiep een vriendschap".

Wat de vraag **wél goed doet**: "bij wie je echt jezelf kunt zijn" dekt emotionele veiligheid — de kern van relatiekwaliteit — beter dan de meeste netwerk-vragen. Dat behouden.

### 2.4 Voeding (NUT_O3, NUT_PROT — 2 vragen, 7 punten)

Twee gerichte proxy's (omega-3, eiwit) met de sterkste 40+-relevantie. Bewust smal — de diepte zit in de aparte voedingscheck; die naad is in de scope-review gedefinieerd en blijft hier buiten beschouwing. Drie punten verdienen wél aandacht: (a) het "weet niet"-scoringsprobleem bij NUT_PROT (§3.10); (b) NUT_O3 sluit niet-visseters uit zonder alternatieve route (§3.9); (c) het ijkpunt "2× vette vis/week" is strenger dan de Gezondheidsraad-richtlijn (1× per week vis, bij voorkeur vet — Richtlijnen goede voeding 2015). Dat mag — een optimum-check mag ambitieuzer zijn dan het populatie-minimum — maar het moet transparant zijn: wie de nationale richtlijn volgt, scoort hier "midden", en de onderbouwing moet uitleggen waarom (EFSA-referentie-inname 250 mg EPA+DHA/dag ≈ 1–2 porties vette vis). ⚠️ In copy nooit "je eet te weinig vis volgens de richtlijn" — wél "voor het optimum uit de omega-3-literatuur zit je onder de 2 porties".

Wat structureel ontbreekt (eetpatroon, regelmaat, emotioneel eten — juist het stress-eten-mechanisme is voor deze doelgroep relevant): tier-2-materiaal voor de voedingscheck, hier alleen genoteerd als hiaat.

### 2.5 Beweging (MOV_STR, MOV_CARD — 2 vragen, 8 punten)

Kracht/cardio-splitsing is voor 40+ mannen de juiste eerste snede, en het kracht-anker (2×/week = hoogste score) valt exact samen met de WHO-richtlijn voor spierversterkende activiteit (Bull 2020, DOI 10.1136/bjsports-2020-102955) — goed geijkt. Drie hiaten: (a) **sedentair gedrag** ontbreekt volledig, terwijl langdurig zitten een deels onafhankelijke risicofactor is die pas bij hoge dosis bewegen wordt gecompenseerd (Ekelund 2016, *Lancet*, DOI 10.1016/S0140-6736(16)30370-1) — voor een doelgroep van kantoorwerkende mannen waarschijnlijk het meest prevalente bewegingsprobleem; (b) de cardio-voorbeelden ("hardlopen, fietsen, teamsport") missen stevig wandelen — het meest gekozen én meest volgehouden bewegingsgedrag boven de 40, waardoor actieve wandelaars zichzelf te laag inschalen; (c) er is geen route voor fysieke beperkingen — wie niet kán krachttrainen scoort identiek aan wie niet wil, en krijgt hetzelfde advies. Plezier/intrinsieke motivatie (de beste voorspeller van volhouden, SDT) is tier-2.

### 2.6 Energie — readout (NRG_PATN, NRG_DEP — 2 vragen, 8 punten)

NRG_PATN is een schone uitkomst-vraag met één smetje: de "middagdip" wordt gescoord als sub-optimaal (waarde 3) terwijl een post-lunch-dip circadiaan normaal is — de check pathologiseert hier gezond functioneren, mild maar onnodig. NRG_DEP is de zwakste vraag van de hele set: drie constructen (cafeïne, suiker, alcohol) op één geforceerde rangorde, met een koffie-oordeel dat de evidence niet draagt (matige koffieconsumptie is in umbrella-reviews neutraal tot gunstig geassocieerd — Poole 2017, *BMJ*, DOI 10.1136/bmj.j5024) en een alcohol-optie die LIF_ALC dubbelt. Volledige analyse in §3.6.

### 2.7 Herstel — readout (RCV_PHYS — 1 vraag, 3 punten) + signalen (LIF_ALC, LIF_SUN)

RCV_PHYS is dun maar dat past bij een readout; het echte probleem is conditionele relevantie ("na sport, fysiek werk" — voor de zittende niet-sporter is de vraag halfleeg) en het mengen van spierstijfheid met vermoeidheid (stijfheid bij beginnende artrose ≠ slecht herstel — leeftijdsbias, zie §6). LIF_ALC is het best geconstrueerde item van de lijst: episodisch drinken (3+ glazen/avond) is een betere risico-indicator dan gemiddelde consumptie, het spiegelt de logica van AUDIT-C-item 3 (Bush 1998, PMID 9738608), en de formulering is opvallend oordeelvrij. LIF_SUN meet feitelijk daglichtblootstelling (circadiaan, stemming) maar wordt verkocht als vitamine-D-vraag — in de Nederlandse winter (okt–mrt, zonkracht < 3) maakt de huid nauwelijks vitamine D, hoeveel je ook buiten bent. De subtitle belooft dus meer dan de vraag kan waarmaken, en de onderste twee antwoordopties zijn vrijwel niet te onderscheiden ("Weinig, vooral binnen" vs "Bijna nooit, vooral binnen").

### 2.8 Samenhang tussen domeinen

- **Dubbel uitgevraagd:** alcohol zit in NRG_DEP (optie 1) én LIF_ALC — dezelfde gedraging beïnvloedt twee plekken in het systeem zonder dat de engine dat weet. Herstel zit in STR_RCV ("herstelmomenten") én RCV_PHYS — verdedigbaar (mentaal vs fysiek) maar nergens geëxpliciteerd.
- **Kruisverbanden:** K1–K3 (`low_recovery_no_load`, `sleep_issue_no_stress`, `energy_dip_unexplained`) zijn precies het soort patroonherkenning dat een coach onderscheidt van een symptoomchecker — het kroonjuweel, terecht zo benoemd in `ANALYSIS_PILLAR_COVERAGE.md`. Ontbrekend en klinisch goed verdedigbaar: alcohol×slaap (Ebrahim 2013, PMID 23347102), verbinding×stress (buffering: Cohen & Wills 1985, PMID 3901065), stress-zonder-uitlaat (STR_FREQ laag + STR_RCV laag, slaap intact). Deze drie staan als K4–K6 in de scope-review (L5) en deze review onderschrijft ze vanuit klinisch perspectief.
- **Tegenstrijdigheden:** het systeem kan omgaan met "slaap goed, energie laag" (K3 vangt dit). Niet afgedekt: "beweging hoog + herstel hoog + energie laag" (mogelijk overtraining in de opbouwfase, mogelijk iets dat de check bewust niet meet — hier is de juiste output een verwijs-nuance, geen nieuwe regel: ⚠️ "als vermoeidheid aanhoudt ondanks goede gewoonten: bespreek het met je huisarts" — die disclaimer bestaat al, koppel hem aan dit patroon).
- **Compleet beeld?** Nee — zie §5. Maar het geraamte (gedrag → readout → signaal) is het juiste; de hiaten zijn invullingen, geen ontwerpfouten.

---

## 3. Review per individuele vraag

*Elke vraag beoordeeld op: construct-validiteit, diepgang, verbreding, personalisatie, bias, psychometrie, evidence. Oordeel: **behouden** / **aanpassen** / **herbouwen** / **tier-2**. Herformuleringen staan uitgewerkt in §8.*

### 3.1 SLP_QUAL — "Hoe voel je je gemiddeld als je wakker wordt?"
Meet subjectief herstellende slaap — valide en relevant (niet-verkwikkende slaap is een kernsymptoom in alle insomnia-definities). **Psychometrisch probleem:** optie 2 "Wisselend, verschilt per dag" is geen ernst-niveau maar een variabiliteits-uitspraak — de schaal is daardoor niet ordinaal (iemand met 5 goede en 2 slechte ochtenden "hoort" tussen 3 en 4, niet op 2). Interpretatieverschillen gegarandeerd. **Fix:** frequentie-ankers (§8.1). Bias: laag. Sociale wenselijkheid: laag. **Oordeel: aanpassen (opties).**

### 3.2 SLP_CONS — "Lukt het je om op een vast tijdstip te gaan slapen en wakker te worden?"
Sterk construct (regelmaat voorspelt onafhankelijk van duur — Windred 2024). Twee problemen: (a) de 3-puntsschaal geeft dit item stilzwijgend 20% domeingewicht waar de andere drie 26,7% krijgen — geen inhoudelijke keuze maar een artefact (§9); (b) "Lukt het je" + "Nee, mijn ritme is onregelmatig" framet regelmaat als persoonlijke competentie — voor ploegendienst- en onregelmatig werkenden (die het ritmeprobleem hébben maar niet kiezen) leest dat als falen, terwijl juist zij de relevante doelgroep zijn (Kecklund & Axelsson 2016, *BMJ*, DOI 10.1136/bmj.i5210). **Oordeel: aanpassen (neutralere formulering + 4e optie).**

### 3.3 SLP_ONSET — "Hoe lang lig je gemiddeld wakker voordat je in slaap valt?"
Het psychometrisch beste slaapitem: gedragsmatig, tijds-geankerd (15/30/60 min sluit aan op het klinische SOL-criterium ≥30 min), weinig interpretatieruimte. Smetje: optie 4 "Vaak langer dan een uur **of heel moeilijk**" is dubbelloops — "heel moeilijk" is een oordeel, geen duur. Schrap de bijzin. **Oordeel: behouden (minimale optie-fix).** In de tier-1-afslanking uit de scope-review verhuist dit item naar de slaap-check-in; dat besluit staat los van de kwaliteit van het item.

### 3.4 SLP_WAKE — "Word je 's nachts wakker en lukt doorslapen niet altijd?"
**Dubbelloops als vraag** (twee proposities + een ontkenning in één zin — cognitief zwaar) én construct-vermenging: 's nachts even wakker worden is boven de 40 vrijwel universeel (slaapcycli, nycturie — prostaat-gerelateerd plassen is bij 40+ mannen de meest voorkomende oorzaak en géén slaapprobleem). Het onderscheidende construct is niet *of* je wakker wordt maar *of je weer in slaap valt*. De huidige formulering telt de normale ontwaker mee met de piekeraar. **Fix:** vraag naar her-inslapen (§8.2). Overlap met SLP_QUAL is empirisch waarschijnlijk (wie niet doorslaapt, wordt moe wakker) — item-analyse op bestaande sessies kan dit kwantificeren (§9.6). **Oordeel: aanpassen.**

### 3.5 NRG_PATN — "Hoe zou je je energieniveau overdag omschrijven?"
Goede readout. Twee punten: (a) "Goed in de ochtend, dip in de middag" (waarde 3) pathologiseert de circadiaan normale post-lunch-dip — een gebruiker die verder floreert scoort sub-optimaal op normaal functioneren; (b) het ochtend-frame benadeelt avondtypes (chronotype wordt nergens gemeten). Beide mild. **Fix:** scoor op stabiliteit + hinder, niet op het moment van de dip (§8.3). **Oordeel: aanpassen (licht).**

### 3.6 NRG_DEP — "Waar leun je op voor energie?"
**Herbouwen.** Drie onvergelijkbare constructen op één geforceerde rangorde: cafeïne (waarde 3), suiker/snacks (2), alcohol (1). Problemen: (a) de rangorde is moreel, niet wetenschappelijk — 1–2 koffie/dag is in umbrella-reviews neutraal tot gunstig (Poole 2017) en hoort geen punt te kosten; (b) alcohol dubbelt LIF_ALC — dezelfde gedraging drukt tweemaal op het systeem; (c) een respondent die op suiker én alcohol leunt kan maar één optie kiezen — de vraag dwingt tot informatieverlies; (d) sociale wenselijkheid is hoog en de opties lezen als een biecht-ladder. Het onderliggende, wél zinvolle construct: *heb je kunstmatige oppeppers nodig om de dag door te komen* (compensatiegedrag als readout van onderliggend tekortschietend herstel). **Fix:** §8.4. **Oordeel: herbouwen.**

### 3.7 STR_FREQ — "Hoe vaak voel je je gestrest of overprikkeld?"
Acceptabele single-item-screener met heldere frequentie-ankers. Kanttekeningen: "gestrest **of** overprikkeld" bundelt psychische druk en sensorische overbelasting — voor neurodivergente gebruikers zijn dat verschillende ervaringen met verschillende interventies; als screener verdedigbaar (beide rechtvaardigen het stress-spoor), maar de advies-copy moet niet doen alsof alleen "werkdruk" is gemeten. Mist: ervaren regie (PSS-kern) — de belangrijkste tier-2-toevoeging voor dit domein. **Oordeel: behouden.**

### 3.8 STR_RCV — "Lukt het je om op een drukke dag tot rust te komen en herstelmomenten te pakken?"
Dubbelloops (loslaten ≠ pauzes inbouwen — effort-recovery-model onderscheidt ze omdat de interventies verschillen: piekeraar → cognitieve technieken; door-denderaar → gedragsmatige pauze-structuur). Voor tier-1-ranking volstaat het gecombineerde item; de splitsing hoort in de stress-check-in. "Drukke dag" veronderstelt agenda-druk — werkt ook voor mantelzorgers en gepensioneerden, dus acceptabel. **Oordeel: behouden in tier-1, splitsen in tier-2** (conform scope-review §4).

### 3.9 CON_SOC — "Heb je mensen om je heen bij wie je echt jezelf kunt zijn en op wie je kunt terugvallen?"
Aanvullend op de scope-review (kwaliteit>kwantiteit, introvert-benadeling) drie bevindingen: (a) **de schaal overrulet de respondent**: optie 3 luidt "Eén of twee, **dat voelt voldoende**" en scoort tóch 75 i.p.v. 100 — het instrument verzamelt een expliciet adequaatheidsoordeel en negeert het vervolgens; dat is een validiteitsfout, geen stijlkwestie; (b) alleen *ontvangen* steun wordt gemeten — wederkerigheid ontbreekt (§2.3); (c) optie 1 "ik sta er meestal alleen voor" is deficit-framing die schaamte kan oproepen bij precies de groep die eerlijk moet kunnen antwoorden. De subtitle ("partner, vrienden of familie") is prettig breed. **Oordeel: aanpassen (opties, conform scope-review §2e) + tier-2-check-in voor eenzaamheid/wederkerigheid/belasting** (De Jong Gierveld-basis, ⚠️ coaching-taal).

### 3.10 NUT_O3 — "Eet je regelmatig vette vis (zalm, makreel, sardines)?"
Gedragsproxy voor EPA/DHA-inname — legitiem. Drie inclusie-problemen: (a) **vegetariërs/veganisten hebben geen route** — zij scoren structureel 1 zonder dat het advies (algenolie, ALA-bronnen) daarop inspeelt, terwijl de data om te differentiëren in de aparte voedingscheck al wordt verzameld (voorkeur-vraag) maar hier niet bestaat; (b) vette vis is duur — het item meet deels koopkracht (SES-bias); (c) visconsumptie is cultureel bepaald. Daarnaast de ijkpunt-transparantie uit §2.4 (2×/week > Gezondheidsraad-norm van 1×). **Oordeel: behouden, met "ik eet geen vis"-route en transparant ijkpunt** (§8.5).

### 3.11 NUT_PROT — "Hoeveel eiwitrijke producten eet je per dag?"
Relevant construct (eiwit-adequaatheid 40+, PROT-AGE: Bauer 2013, PMID 23867520). **Validiteitsfout:** "Ik weet het niet / ik let er niet op" krijgt waarde 1 — de laagste score. Niet-weten is geen inname-niveau: iemand die onbewust bij elke maaltijd vlees/zuivel eet (het Nederlandse standaardpatroon) scoort "slechtst" terwijl zijn inname waarschijnlijk adequaat is. Het item meet daardoor deels *voedingsbewustzijn* en noemt het *inname*. Ook: "een goede eiwitbron" is ongedefinieerd (interpretatieverschil) en de opties zijn dubbelloops. **Fix:** gedragsankers zonder kennis-eis; "weet niet" als aparte, niet-strafbare categorie (§8.6 + §9.4). **Oordeel: aanpassen.**

### 3.12 MOV_STR — "Doe je kracht- of weerstandstraining (gewichten, banden, eigen lichaamsgewicht)?"
Beste bewegingsitem: construct helder, voorbeelden inclusief (banden, lichaamsgewicht — geen sportschool-eis), anker geijkt op WHO-norm (2×/week spierversterkend). Eén hiaat: geen route voor wie niet kán (blessure, aandoening) — oplossen aan de advies-kant, niet met een extra vraag-optie die naar gezondheidsgegevens vist (AVG art. 9-voorzichtigheid: geen "vanwege welke aandoening"-uitvraag; wél hedging in de copy: ⚠️ "lukt trainen niet door fysieke klachten — begin bij wat wél gaat en overleg zo nodig met een fysiotherapeut"). **Oordeel: behouden.**

### 3.13 MOV_CARD — "Hoe vaak doe je cardio of intensieve sport (hardlopen, fietsen, teamsport)?"
Constructvermenging in de voorbeelden: "cardio **of intensieve** sport" plus sportieve voorbeelden zet de lat op sport, terwijl matig-intensief bewegen (stevig wandelen — de WHO-norm draait om *moderate* intensiteit) volwaardig telt. Gevolg: de actieve wandelaar en de woon-werk-fietser onderschatten zichzelf systematisch (in NL is fietsen vervoer — telt dat? de vraag zegt het niet). Dit is tegelijk leeftijds- en fitheid-bias én een meetfout (ondergerapporteerde noemer). **Fix:** voorbeelden herijken op intensiteit i.p.v. sportcultuur (§8.7). **Oordeel: aanpassen (voorbeelden/formulering).**

### 3.14 RCV_PHYS — "Hoe snel herstel je na inspanning (sport, fysiek werk)?"
Conditionele relevantie: de zittende niet-sporter heeft geen referentie-ervaring en gokt. De engine ondervangt dit deels slim (creatine-signaal weegt `movementLoad` mee), maar de *score* telt het antwoord gewoon mee. "Langer moe **of stijf**" mengt bovendien vermoeidheid met stijfheid — ochtend-/startstijfheid bij beginnende artrose is boven de 40 prevalent en zegt niets over herstelcapaciteit (leeftijdsbias: het item leest normale veroudering als disfunctie). Als readout acceptabel; noteer de beperking in de onderbouwing. **Oordeel: behouden (met evidence-kanttekening); herzien zodra herstel ooit interventiedomein wordt.**

### 3.15 LIF_ALC — "Hoe vaak drink je 3 glazen alcohol of meer op één avond?"
Sterkste item van de lijst. Episodisch drinken als indicator (i.p.v. weekgemiddelde) spoort met de screeningsliteratuur (AUDIT-C item 3), de frequentie-ankers zijn concreet, en de formulering is opvallend vrij van moralisering — knap voor het meest sociaal-wenselijkheids-gevoelige onderwerp van de set. Evidence-kader voor de advies-copy: de Gezondheidsraad adviseert niet drinken of maximaal 1 glas/dag; formuleer winst-gericht, niet norm-berispend (✅ "elke alcoholvrije avond geeft je nacht merkbaar meer herstel" — mechanisme, geen oordeel). **Oordeel: behouden.**

### 3.16 LIF_SUN — "Hoeveel zon en buitenlicht krijg je gemiddeld?"
Twee gebreken: (a) de **subtitle belooft vitamine D** maar in de NL-winter (okt–mrt) synthetiseert de huid vrijwel geen vitamine D ongeacht buitenzijn — wat de vraag werkelijk meet (daglicht → circadiane verankering, stemming, avond-melatonine) is waardevoller én eerlijker te claimen; (b) de onderste opties "Weinig, vooral binnen" en "Bijna nooit, vooral binnen" zijn semantisch bijna identiek → het item discrimineert niet aan de onderkant, waar het juist moet discrimineren. **Fix:** §8.8. **Oordeel: aanpassen.**

---

## 4. Geconstateerde zwakke punten (consolidatie)

| # | Zwakte | Items | Ernst |
|---|--------|-------|-------|
| 1 | Optie-aantal bepaalt itemgewicht (meetartefact) | SLP_CONS 20% vs 26,7%; NUT_O3 43% vs NUT_PROT 57% | Hoog (onzichtbaar, structureel) |
| 2 | Effectieve schaal ~25–100 op een nominale 0–100; urgentie-drempels (<30) vrijwel onbereikbaar | alle domeinen; `getUrgency` | Hoog (§9.2–9.3) |
| 3 | Schaal overrulet zelfoordeel respondent | CON_SOC optie 3 | Hoog (validiteit) |
| 4 | "Weet niet" gescoord als slechtste waarde | NUT_PROT optie 4 | Hoog (validiteit) |
| 5 | Mengvat-item met morele rangorde | NRG_DEP | Hoog |
| 6 | Dubbelloopse vragen/opties | SLP_WAKE, STR_RCV, SLP_ONSET-optie 4, NUT_PROT-opties | Middel |
| 7 | Niet-ordinale antwoordoptie | SLP_QUAL "Wisselend" | Middel |
| 8 | Dubbele uitvraag alcohol | NRG_DEP ↔ LIF_ALC | Middel |
| 9 | Niet-discriminerende opties onderin | LIF_SUN opties 1–2 | Middel |
| 10 | Single-item-domeinen met 25/33-puntsprongen | CON_SOC, RCV_PHYS | Middel (verbinding: al geadresseerd in scope-review) |
| 11 | Label-mismatch: beweging-primair krijgt energielabel | `NAMED_DOMAIN_LABELS.movement = "Lage Batterij"` | Middel (nieuw gevonden — zie §9.5) |
| 12 | Conditionele relevantie zonder n.v.t.-pad | RCV_PHYS, deels MOV_* | Laag |

---

## 5. Geconstateerde hiaten

1. **Roken.** De grootste enkelvoudige leefstijl-risicofactor ontbreekt volledig in een check die "vitaliteit" claimt. Vermoedelijke reden: geen interventie-/vergelijkingspad. Maar een leefstijl-eerst-merk dat wél naar alcohol vraagt en niet naar roken is inhoudelijk moeilijk verdedigbaar. Aanbeveling: één signaalvraag (zelfde rol als LIF_ALC), quick-win = verwijzing (Thuisarts/ikstopnu), expliciet géén supplementroute. ✅ compliance-veilig; commercieel neutraal; merk-versterkend ("Consumentenbond" die de olifant benoemt). Als het besluit "niet uitvragen" is, documenteer het als bewuste grens in `DOMAIN_MODEL.md`.
2. **Sedentair gedrag.** §2.5 — sterkste evidence-hiaat binnen beweging (Ekelund 2016). Kandidaat-signaalvraag of tier-2.
3. **Ervaren regie bij stress.** PSS-kern; tier-2 stress-check-in (§2.2).
4. **Wederkerigheid, sociale belasting, eenzaamheid, maatschappelijke verbondenheid.** §2.3 — tier-2 verbinding-check-in (De Jong Gierveld-basis).
5. **Zingeving.** Purpose-in-life is consistent geassocieerd met gezondheidsuitkomsten (Cohen 2016, *Psychosom Med*, PMID 26630073). Geen tier-1-kandidaat (te zwaar voor een 3-minuten-check, lastig zonder therapeutische lading), wél legitiem als content/tier-2-thema. ⚠️ nooit als "zingevingsscore".
6. **Chronotype & ploegendienst.** Modereert slaapadvies fundamenteel; tier-2 slaap-check-in.
7. **Bewuste, correcte grenzen die zo moeten blijven:** geen mentale-klachten-screening (PHQ/GAD-achtig ❌ — diagnose-territorium), geen medicatie/aandoeningen-uitvraag (AVG art. 9), geen slaapduur-registratie in tier-1. Deze grenzen zijn goed gekozen; ze verdienen alleen documentatie.

---

## 6. Bias en stigmatisering

| Vraag | Biastype | Waar het zit | Neutraler alternatief |
|-------|----------|--------------|----------------------|
| NRG_DEP | Normatief/moraliserend | Koffie-straf zonder evidence-basis; biecht-ladder-opties | Herbouw (§8.4): compensatie-construct i.p.v. middelen-rangorde |
| SLP_CONS | Competentie-framing | "Lukt het je" + "mijn ritme is onregelmatig" → falen, ook bij ploegendienst | "Hoe regelmatig zijn je slaaptijden?" + optie "wisselt door werk of omstandigheden" |
| CON_SOC | Deficit-framing | "ik sta er meestal alleen voor" | "Ik heb weinig mensen om op terug te vallen" (feit, geen identiteit) |
| MOV_CARD | Fitheid-/milieu-bias | Sportieve voorbeelden sluiten wandelaars/fietsforensen uit | Voorbeelden op intensiteit: "stevig wandelen, fietsen, hardlopen, sport" |
| NUT_O3 | SES-/cultuur-/dieetbias | Vette vis = duur, cultureel specifiek, geen vegetarische route | "Ik eet geen vis"-optie met eigen adviespad |
| NRG_PATN | Chronotype-/gezondheidsbias | Middagdip (normaal) scoort sub-optimaal | Scoor stabiliteit + hinder (§8.3) |
| RCV_PHYS | Leeftijdsbias | Stijfheid (normale veroudering/artrose) telt als slecht herstel | "of stijf" schrappen; stijfheid hoort niet in het herstel-construct |
| NUT_PROT | Kennis-bias | Onwetendheid = laagste score | "Weet niet" niet strafbaar scoren (§9.4) |

**Sociale wenselijkheid** is het hoogst bij LIF_ALC, NRG_DEP en NUT_PROT. Mitigaties die passen bij de bestaande architectuur: (a) frequentie-ankers i.p.v. oordeel-ankers (LIF_ALC doet dit al goed); (b) normaliserende micro-copy vóór gevoelige vragen ("veel mannen herkennen dit" — het patroon bestaat al in de schrijfstem); (c) geen tussentijdse oordeel-feedback tijdens het invullen. **Gender/doelgroep:** de check is expliciet voor mannen 40+ — dat is een bewuste productkeuze, geen bias; wel consistent houden (LIF_SUN-subtitle spreekt al "na je 40e"-taal, prima). **Algemeen:** geen van de gevonden biases is disqualificerend; het patroon (gezond-bewuste, sportieve, koopkrachtige norm als impliciet referentiepunt) is wél precies wat een "Consumentenbond"-merk zich niet kan veroorloven.

---

## 7. Evidence-based verbeteringen (samenvatting met bronnen)

| Verbetering | Bron | Compliance |
|-------------|------|------------|
| Frequentie-ankers voor slaapkwaliteit i.p.v. "wisselend" | Standaard-itemconstructie; sluit aan op PSQI-logica (Buysse 1989, PMID 2748771) | ✅ |
| Her-inslapen als construct voor SLP_WAKE | Sleep-maintenance-insomnia-definitie; nycturie-prevalentie 40+ | ✅ |
| Regelmaat neutraal formuleren + ploegendienst-optie | Windred 2024 (PMID 37738616); Kecklund & Axelsson 2016 | ✅ |
| Koffie de-moraliseren in NRG_DEP-herbouw | Poole 2017 umbrella review (DOI 10.1136/bmj.j5024) | ✅ |
| CON_SOC: zelfoordeel respecteren; wederkerigheid in tier-2 | Brown 2003 (PMID 12807404); De Jong Gierveld 2006 | ✅ / ⚠️ (coaching-taal) |
| NUT_O3: geen-vis-route + transparant ijkpunt | Gezondheidsraad RGV 2015; EFSA 250 mg EPA+DHA | ⚠️ ("optimum", nooit "richtlijn-falen") |
| MOV_CARD: intensiteit-voorbeelden incl. stevig wandelen | WHO 2020 (Bull, DOI 10.1136/bjsports-2020-102955) | ✅ |
| Sedentair-item overwegen | Ekelund 2016 (DOI 10.1016/S0140-6736(16)30370-1) | ✅ |
| Rook-signaalvraag met verwijs-quick-win | Elke leefstijlrichtlijn; geen supplementpad | ✅ |
| LIF_SUN: daglicht-framing i.p.v. vitamine-D-belofte | NL-winter-synthese (zonkracht); circadiane literatuur | ✅ |

---

## 8. Concrete alternatieve vraagformuleringen

*Volledige teksten, direct bruikbaar. Waarde-toekenning tussen haakjes. Elke wijziging = RULES_VERSION-bump + delta-documentatie (zie legacy-patroon `getStressRecoveryAnswer`).*

**8.1 SLP_QUAL** — "Hoe vaak word je uitgerust en helder wakker?"
- Bijna elke ochtend (4) · De meeste ochtenden (3) · Een paar ochtenden per week (2) · Zelden of nooit (1)
*Frequentie-anker herstelt ordinaliteit; "wisselend" wordt vanzelf een midden-frequentie.*

**8.2 SLP_WAKE** — "Als je 's nachts wakker wordt, hoe makkelijk val je dan weer in slaap?"
- Ik word zelden wakker, of slaap direct weer in (4) · Meestal binnen een paar minuten weer in slaap (3) · Het duurt regelmatig lang voor ik weer slaap (2) · Ik lig vaak lang wakker, soms de rest van de nacht (1)
*Meet her-inslapen (het discriminerende construct); ontkoppelt normale ontwakingen (nycturie) van het slaapprobleem.*

**8.3 NRG_PATN** — "Hoe is je energie overdag?"
- Stabiel — ik kom de dag goed door (4) · Een dip op een vast moment, maar het hindert me weinig (3) · Wisselend — het hindert me regelmatig (2) · Laag — de dag kost me moeite (1)
*Scoort stabiliteit én hinder; de fysiologische middagdip zonder hinder is niet langer sub-optimaal.*

**8.4 NRG_DEP (herbouw)** — "Heb je oppeppers nodig om de dag door te komen (extra koffie, energiedrank, zoetigheid)?"
- Nee, zelden (4) · Soms, op zware dagen (3) · De meeste dagen wel (2) · Zonder kom ik de dag niet door (1)
*Eén construct (compensatie-afhankelijkheid als readout), koffie-als-genotmiddel niet langer bestraft, alcohol volledig naar LIF_ALC. Subtitle-optie: "Gewone koffie bij je ontbijt telt niet — het gaat om wat je nodig hebt om overeind te blijven." ✅*

**8.5 NUT_O3** — vraag ongewijzigd; opties:
- 2× per week of vaker (3) · Ongeveer 1× per week (2) · Zelden of nooit (1) · **Ik eet geen vis** (1, mét eigen adviespad: algenolie/ALA-bronnen i.p.v. "eet vette vis")
*Zelfde score-impact (inname-proxy blijft eerlijk), ander advies. Onderbouwing vermeldt expliciet: Gezondheidsraad-norm is 1×/week; het 2×-anker is het omega-3-optimum. ⚠️ copy: "voor het optimum zit je eronder", nooit "je haalt de richtlijn niet".*

**8.6 NUT_PROT** — "Hoe vaak bevat een maaltijd bij jou een flinke portie eiwit (vlees, vis, eieren, zuivel, peulvruchten)?"
- (Vrijwel) elke maaltijd (4) · 1–2 maaltijden per dag (3) · Niet elke dag (2) · Zelden — of ik weet het echt niet (aparte afhandeling, §9.4)
*Gedragsanker zonder kennis-eis; "goede eiwitbron" geconcretiseerd in de vraag zelf.*

**8.7 MOV_CARD** — "Hoe vaak beweeg je stevig — flink doorwandelen, fietsen, hardlopen of sport waarvan je hartslag omhoog gaat?"
- 3× per week of meer (4) · 1–2× per week (3) · Minder dan 1× per week (2) · Zelden of nooit (1)
*Intensiteit als criterium ("hartslag omhoog"), wandelen en fietsforensen tellen mee — conform WHO-definitie van matig-intensief.*

**8.8 LIF_SUN** — "Hoeveel daglicht krijg je op een gewone dag?" — subtitle: "Buitenlicht zet je biologische klok — belangrijk voor slaap en energie. In de zomer maakt je huid er ook vitamine D mee aan."
- Dagelijks ruim buiten, ook doordeweeks (4) · De meeste dagen wel een periode buiten (3) · Doordeweeks vrijwel alleen binnen, weekend buiten (2) · Vrijwel altijd binnen (1)
*Eerlijke framing (daglicht/circadiaan voorop, vitamine D seizoensgebonden) en een discriminerende onderkant (doordeweeks/weekend-anker i.p.v. tweemaal "vooral binnen").*

**8.9 SLP_CONS** — "Hoe regelmatig zijn je bedtijd en opstaan?"
- Vrijwel elke dag hetzelfde (4) · Doordeweeks vast, weekend anders (3) · Wisselt regelmatig (2) · Wisselt sterk — door werk, diensten of omstandigheden (1)
*Vier niveaus (weging gelijkgetrokken), geen competentie-framing, ploegendienst expliciet genoemd zodat het antwoord feitelijk is i.p.v. bekentenis. Het "sociale jetlag"-anker (doordeweeks/weekend) is het evidence-relevante midden.*

**CON_SOC:** herformulering staat in de scope-review §2e en blijft leidend (kwaliteit-first: "een paar — en dat is genoeg voor mij" = 4). Dit rapport voegt de onderste optie-fix toe: "Ik heb weinig mensen om op terug te vallen" (1) i.p.v. "ik sta er meestal alleen voor".

---

## 9. Adviezen voor de vitaliteitsscore

*Huidige mechaniek (geverifieerd): domeinscore = som van ruwe antwoordwaarden ÷ domein-maximum × 100; vitaliteit = ongewogen gemiddelde van de 5 interventiedomeinen (`vitaliteit.ts`, gewicht 1,0); energie/herstel readouts tellen niet mee; urgentie telt interventiedomeinen onder 30/50/60; banden: <40 Prioriteit, 40–59 Aandacht, 60–79 Voldoende, ≥80 Sterk.*

**9.1 Het domein-gelijk-gewicht-principe is juist — houd het.** Vijf domeinen à 20% is uitlegbaar ("je vitaliteit steunt op vijf pijlers, elk telt even zwaar") en voorkomt dat het vragenrijkste domein de score kaapt. De readout-uitsluiting is conceptueel correct en zeldzaam zuiver. Wat ontbreekt is de **uitleg aan de gebruiker**: één zin op het resultaat ("gemiddelde van je vijf leefstijlpijlers; energie en herstel zijn uitlezingen, geen pijlers") maakt de score verdedigbaar én persoonlijker. ✅

**9.2 Repareer het optie-aantal-artefact met item-herskalering.** Bereken elk item eerst als (waarde − 1) ÷ (max − 1) × 100 en middel dán per domein. Twee vliegen: (a) itemgewicht wordt onafhankelijk van het aantal antwoordopties (SLP_CONS gaat van 20% naar 25% binnen slaap; NUT_O3/NUT_PROT worden 50/50 — nu 43/57 zonder inhoudelijke reden); (b) de schaal wordt écht 0–100 (slechtste antwoord = 0, nu ≈ 25–33). Dit is de structurele fix waar meerdere symptomen aan hangen.

**9.3 Herijk urgentie en banden ná 9.2.** Nu geldt: geen enkel domein kan onder ~25 (slaap: minimum 27, herstel: 33) — "critical" (2 domeinen < 30) vereist twee domeinen op de absolute bodem en komt empirisch vrijwel nooit voor; de "Prioriteit"-band (nominaal 0–39) bestaat effectief alleen als 25–39. Na herskalering kloppen de drempels weer met hun intentie; valideer ze daarna op de werkelijke verdeling in `intake_sessions` (percentiel-check) i.p.v. ronde getallen.

**9.4 Scoor "weet niet" nooit als slechtste waarde.** Behandel het als ontbrekend: laat het item weg en middel het domein over de resterende items (bij single-item-domeinen: toon "nog geen beeld" i.p.v. een getal). Een score die onwetendheid als risicogedrag telt, is niet verdedigbaar tegenover precies de gebruiker die je wilt bereiken — degene die er nog nooit op lette.

**9.5 Repareer de label-mismatch.** `NAMED_DOMAIN_LABELS.movement = "Lage Batterij"`: wie beweging als zwakste domein heeft, krijgt het *energie*-label opgeplakt. Dat ondermijnt de uitlegbaarheid ("waarom heet ik Lage Batterij terwijl mijn energie prima scoort?") en de content-koppeling (het movement-profiel heet elders "Overtrainer"). Verbinding, voeding en herstel kunnen bovendien nooit een eigen label dragen — voor verbinding is dat al geadresseerd (scope-review L2); trek voeding/beweging daarin mee of documenteer waarom niet.

**9.6 Bouw de validatie-lus die nu al kan.** Er is geen extern criterium nodig om te beginnen: `intake_sessions` bevat de data voor item-analyse — spreiding per item, plafond-/vloereffecten, item-rest-correlaties binnen domeinen (kwantificeert de vermoede SLP_QUAL↔SLP_WAKE-overlap), en de hermeting-flow is een natuurlijke test-hertest-betrouwbaarheidsmeting. Eén analyse-script, geen productwijziging, en elke toekomstige vraag-discussie krijgt data in plaats van meningen. Voorspellende validiteit (voorspelt de score wie opknapt?) kan later via de voortgangs-delta.

**9.7 Verandermanagement.** Elke wijziging uit dit rapport die scoring raakt = RULES_VERSION-bump met gedocumenteerde delta; het bestaande legacy-patroon (`getStressRecoveryAnswer`) laat zien hoe oude sessies leesbaar blijven. Bundel 9.2+9.3 in één bump (één herijking, één communicatiemoment) en houd copy-fixes (bias-herformuleringen zonder waarde-wijziging) erbuiten.

---

## 10. Prioriteitenlijst — hoogste impact op validiteit, betrouwbaarheid, inclusiviteit en bruikbaarheid

| # | Actie | Raakt | Type | Waarom deze plek |
|---|-------|-------|------|------------------|
| 1 | **Item-herskalering + drempel-herijking** (§9.2–9.3) | scoringsmodel | Engine, RULES_VERSION | Repareert drie structurele artefacten (gewicht, vloer, dode urgentie-banden) in één beheerste wijziging; alles hierna landt op een kloppend fundament |
| 2 | **CON_SOC-opties: zelfoordeel respecteren** (§3.9 + scope-review §2e) | validiteit | Vraag-copy, RULES_VERSION (mee in bump #1) | Aantoonbare validiteitsfout; fix is klein en al ontworpen |
| 3 | **NUT_PROT: "weet niet" ontkoppelen van inname** (§3.11, §9.4) | validiteit | Vraag + engine (zelfde bump) | Tweede aantoonbare validiteitsfout; raakt de kern-doelgroep (de niet-bewuste eter) |
| 4 | **NRG_DEP herbouwen** (§8.4) | validiteit + bias | Vraag-copy (zelfde bump) | Zwakste item, dubbelt alcohol, moraliseert koffie; herbouw is ontworpen en klein |
| 5 | **Bias-herformuleringen zonder waarde-wijziging** (SLP_CONS-framing, CON_SOC-optie 1, MOV_CARD-voorbeelden, LIF_SUN-subtitle; §6, §8) | inclusiviteit | Copy-only, geen RULES_VERSION | Direct uitvoerbaar, nul risico, zichtbaar effect op wie zich aangesproken voelt |
| 6 | **SLP_QUAL/SLP_WAKE-herformulering** (§8.1–8.2) | psychometrie | Vraag-copy, RULES_VERSION | Kan meeliften met bump #1 óf wachten op de tier-1-afslanking uit de scope-review (L3) — niet twee keer bumpen |
| 7 | **Item-analyse-pipeline op bestaande sessies** (§9.6) | betrouwbaarheid | Analyse-script, geen product | Maakt elke volgende beslissing datagedreven; bouw hem vóór bump #1 zodat je vóór/ná kunt vergelijken |
| 8 | **NUT_O3 geen-vis-route + ijkpunt-transparantie** (§8.5) | inclusiviteit | Vraag + advies-copy | Kleine wijziging, sluit een hele gebruikersgroep weer aan |
| 9 | **Label-mismatch movement repareren** (§9.5) | bruikbaarheid | Engine-copy | Klein, verhoogt uitlegbaarheid en content-consistentie |
| 10 | **Besluit roken + sedentair** (§5.1–5.2) | construct-dekking | Productbesluit Dennis | Geen implementatie vóór besluit: uitvragen (signaalvraag + verwijs-quick-win) óf documenteren als bewuste grens — de huidige stilte is de enige onverdedigbare optie |

**Samenhang met de scope-review:** prioriteiten 2 en 6 vallen samen met L1/L3 daaruit; dit rapport voegt vooral #1 (scoringsmodel), #3–4 (validiteitsfouten) en #5 (bias-laag) toe. Praktische bundeling: één copy-PR (prio 5), één engine-bump (prio 1+2+3+4, eventueel 6), één analyse-script (prio 7), twee productbesluiten (prio 10 + tier-2-check-ins).

---

*Meetpunt bij implementatie: `intake_completed` (completion vóór/ná vraagwijzigingen) en de bestaande score-events; nieuwe events pas bij nieuwe CTA's — registratie op drie plekken (`events.ts`, `intake-events-client.ts`, events-route-allowlist).*
