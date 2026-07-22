# Beweegsysteem — UX-blauwdruk: Dashboard ↔ Stappenplan als één systeem

> **Status (22 jul 2026): productontwerp / UX-blauwdruk. Geen code, geen implementatie.**
> Opgesteld als antwoord op de vraag naar een complete UX-blauwdruk voor een interactieve beweegapp waarin het **Dashboard Main** (de beweeg-cockpit) en het **Dynamische Stappenplan** (plan-reader + route + planner) volledig met elkaar verbonden zijn.
> **Verandert geen enkele bestaande DEFER/FREEZE/KILL-status en overschrijft geen gelockt besluit.** Waar de opdracht-wens botst met een vastgelegd SSOT-besluit, staat dat expliciet gemarkeerd (§0.2).
> **Verankerd tegen `main`** en drie SSOT-bronnen die samen al ~2000 regels ontwerp dekken:
> - [`BEWEEG_COCKPIT_FUTURE_YOU.md`](BEWEEG_COCKPIT_FUTURE_YOU.md) — de zes cockpit-tegels, copy, states, craft-tokens, afgewezen patronen.
> - [`KOMPAS_BEWEGING_NAAR_STAPPENPLAN.md`](KOMPAS_BEWEGING_NAAR_STAPPENPLAN.md) — surface-architectuur, sync-model (F1/F2/F3), doorway-besluit.
> - [`ARCHITECTUUR_LIFESTYLE_PLANNER.md`](ARCHITECTUUR_LIFESTYLE_PLANNER.md) — de planner-engine (tabellen, priority/progression, notificaties, wearables).
>
> Dit document is de **overkoepelende laag**: het brengt die drie samen in de vorm van een productontwerp en vult de gaten die de opdracht expliciet vraagt (hulpvraag-discovery, persona's/JTBD, dynamische inzichten, complete beslisboom, edge cases, visuele principes, toekomst).

---

## 0. Leeswijzer & verankering

### 0.1 Wat dit systeem *is* in PSF-termen

De opdracht spreekt over een losse "beweegapp" met twee schermen. In PerfectSupplement bestaan die twee schermen al als concrete surfaces binnen **Kompas**, de account-dashboard-laag:

| Opdracht-term | PSF-realiteit | Route / component |
|---|---|---|
| **Dashboard Main** | De **beweeg-cockpit**: donker craft-blok + light onderbouw op de beweeg-pijler | `/dashboard?kompas=beweging` → `BewegingScreen` → `MovementCockpit` |
| **Dynamisch Stappenplan** | **Plan-reader** (read-only arc) + **route-ladder** in de cockpit + later de **planner-engine** (tijd/agenda) | `MovementRouteLadder` (in cockpit) → herontworpen plan-reader (`MovementPlanDeepBody`) → `lp_*` planner (F3) |

Het is dus **geen greenfield app**, maar de volwassen-wording van een bestaande pijler. Deze blauwdruk beschrijft de doelstaat waar de huidige B-1a/B-1b-cockpit en de F1-harmonisatie naartoe bouwen — zonder de web-first, mono-tenant, service-role-architectuur van PSF te verlaten.

> **Web-first, geen native app.** "App" in de opdracht = de web-cockpit. Notificaties/herinneringen zijn daarom gefaseerd: **in-app → e-mail (Resend) → web push (later)**. Niet: iOS/Android-pushmeldingen op dag 1.

### 0.2 Botsingen tussen de opdracht-wens en gelockte besluiten

Dit is het belangrijkste deel van de leeswijzer. De opdracht vraagt een aantal dingen die **bewust zijn afgewezen** in PSF — vaak om precies dezelfde reden die de opdracht zélf noemt ("geen gamification, geen fitness-app-uitstraling, geen schuldgevoel"). Waar de wens en het besluit uiteenlopen, kiezen we het besluit en leggen we uit waarom.

| Opdracht-wens | Verdict | Reden |
|---|---|---|
| Foto ("Hier begon je"), progress-foto | ❌ **Niet doen** | Botst met de anti-transformatie-lijn (§7 BEWEEG-doc: "geen uiterlijk-transformatie/avatar") én met AVG art. 9 (biometrisch/gezondheid). De "beginsituatie" wordt de **beginwaarde** (score + antwoorden), niet een foto. |
| Streaks / "X dagen op rij" | ❌ **Niet doen** | Schuld-mechaniek. De opdracht vraagt zelf "geen schuldgevoel". Ritme tonen we als **readout** ("Kracht 1× · wandelen 2×"), niet als teller. |
| Badges / gamification | ❌ **Niet doen** | Expliciet afgewezen (BEWEEG §7) én door de opdracht ("zonder gamification-overload"). Beloning = echte data: lijn, fase, hermeting. |
| Dagelijks bewegend "Future You Score 62→78" | ❌ **Niet doen** | Verzonnen tweede cijfer naast de engine-score. Future You leeft in **copy en richting**, niet in een gefaket getal. |
| Meerdere afvink-oppervlakken (dashboard + elke stap in het plan) | ❌ **Eén check-off** | De énige "Markeer als gedaan" zit in de VANDAAG-hero (day-model SSOT). Route-ladder en "Deze week" vinken niet — het zijn readouts. Dit is de kern-invariant. |
| "Calorieën", trainingsvolume-cijfers | ❌ **Niet doen** | Fitness-app-signaal. We meten **minuten/modaliteit** en zelf-gerapporteerde exertie (licht/matig/zwaar), nooit calorieën. |
| Rijke dagelijkse check-in (energie + pijn + motivatie + stress + slaap, elke dag) | ⚠️ **Bewust licht** | Eén zware dagelijkse vragenlijst schendt "one primary action" + cognitive-load-reductie. De dagelijkse check-in is **één vraag** (herstelgevoel `RCV_FEEL`) die de tier stuurt; de rijke 11-dimensie-check hoort bij de **hermeting**, niet elke dag. |
| Weer-adaptatie ("regen voorspeld → binnen bewegen") | ⚠️ **Toekomst-adapter** | Concept is goed, maar vereist een weer-adapter die nog niet bestaat. Nu: alternatief-mechaniek is manueel ("Geen tijd/geen zin? → binnenvariant"). Weer = §15. |
| "Nieuw stappenplan opnieuw opbouwen bij doelwijziging" | ✅ **Ja, maar gefaseerd** | De arc herbouwt op scores/context (`computeCurrentPhaseId`); volledige herkalibratie op tijd/agenda is planner-engine-werk (F3, premium). |

**Alles wat de opdracht wél vraagt en wat we omarmen**, staat in de rest van dit document. De rode draad — *van pijn → persoonlijk doel → kleine haalbare acties* — is exact de PSF-positionering (Consumentenbond-coach, identiteit vóór mechanisme, nuchtere toon).

### 0.3 De ontwerp-noord­ster in vier zinnen

1. Het Dashboard beantwoordt **"waar sta ik?"**, het Stappenplan **"wat doe ik nu?"** — en na elke actie verandert het Dashboard. Beide moeten voelen alsof ze *leven* en elkaar voeden.
2. De gebruiker beweegt niet om te bewegen, maar om **iets te bereiken** dat hij zelf koos (het *anker*). Dat anker is overal zichtbaar en kleurt elke "waarom deze stap".
3. Eén afvink, één waarheid, geen verzinsels: de VANDAAG-hero is de enige check-off, de engine-score de enige score, de daily-log de enige executie-waarheid.
4. Bouw klein, wijs groot: de **dagstap is altijd gratis**; premium voegt alleen de *planning/uitvoering-laag* toe (wanneer, agenda, herkalibratie, wearables), nooit de inhoud van vandaag.

---

## 1. Productvisie

**Positionering.** Een rustige, wetenschappelijk verankerde beweeg-begeleider voor mannen 40+ (secundair 35–65) die de eenvoud van Apple, de gedragsprecisie van Duolingo (zónder de badges) en de rust van Headspace combineert — binnen de Consumentenbond-toon van PerfectSupplement. Geen coach die schreeuwt "jij kunt dit!", maar een systeem dat feit-eerst uitlegt *waarom* een kleine stap vandaag telt voor de man die je over tien jaar wilt zijn.

**Het probleem dat we oplossen.** Mannen 40+ weten meestal *dat* ze moeten bewegen, maar stranden op drie dingen: (a) het doel is abstract ("fitter worden"), (b) de drempel is te hoog (een heel schema, de sportschool), (c) de terugkoppeling ontbreekt (je ziet pas na maanden iets, of nooit). Ons systeem vertaalt een abstract doel naar een **anker met betekenis**, verlaagt de drempel tot **één haalbare stap per dag**, en maakt vooruitgang **eerlijk zichtbaar** via de leefstijllijn en de hermeting — zonder valse dagelijkse dopamine.

**Waardebelofte.** *"Vertel ons waar je last van hebt en wat je straks weer wilt kunnen. Wij vertalen dat naar de kleinste stap van vandaag — en laten je zien dat je lijn de goede kant op beweegt."*

**Wat het systeem uniek maakt (de moat):**
- **Anker-gedreven, niet metriek-gedreven.** De diepere motivatie (`movementAnchor`) is de motor, niet een stappenteller.
- **Eerlijke terugkoppeling.** Geen gefaket dagelijks cijfer; de payoff landt bij de hermeting, en dat zeggen we ook.
- **Adaptief zonder te oordelen.** Ziek, moe, geen tijd, een week niks gedaan → het plan schuift mee, nooit met schuld.
- **Alles gratis wat "vandaag" betreft.** De paywall raakt nooit de dagstap.

**Wat het systeem uitdrukkelijk *niet* is:** geen kalorieënteller, geen social-fitness-netwerk, geen PT-vervanger met sets/reps-logboek als kern, geen medisch hulpmiddel (adviezen, geen diagnoses).

---

## 2. Gebruikersreis (User Journey)

De reis kent vier fasen. Elke fase noemt: het gebruikersdoel, wat het systeem doet, en welke data ontstaat.

### Fase A — Herkenning & intake (van pijn naar profiel)
1. **Binnenkomst** via een symptoom-ingang (homepage/blog/gids): *"'s avonds geen energie meer", "de trap voelt zwaarder"*. → Leefstijlcheck-intake.
2. **De echte hulpvraag vinden** (zie §2.5 voor de vraagset). Niet alleen "wat is je doel", maar "waaróm, wat wil je straks weer kunnen, wat belemmert je nu".
3. **Uitkomst:** een `symptom_profile`, `domain_scores` (waaronder `beweging`), een `profile_label`, en de 11 beweeg-dimensies (`MOVEMENT_QUESTIONS`). Dit is de **beginwaarde** ("Hier begon je").

### Fase B — Verankering & startkeuze (van profiel naar richting)
4. **Het anker kiezen** (`MovementStartChoice`): *"Als bewegen over tien jaar één ding voor je geregeld heeft — wat moet dat zijn?"* → één van vier ankers (zelfstandigheid / meedoen / energie / kracht). Dit wordt "Mijn Waarom" op het Dashboard.
5. **Startpatroon kiezen** (geen squat-default): Kracht / Conditie / Dagelijks ritme (`WEEK_CATEGORY_OPTIONS`). Dit stuurt welke stappen de dagkeuze aanbiedt.
6. **Uitkomst:** `movementAnchor` + `preferredStartPattern` in de answers-jsonb. De cockpit heeft nu een startpunt.

### Fase C — Dagelijkse lus (van richting naar gewoonte)
7. **Terugkeer** → cockpit toont de **dagkeuze** (Herstel / Matig / Trainen), met een *Aanbevolen*-badge uit het verse herstelgevoel of de recovery-hint.
8. **Tier gekozen → stap laadt direct** (day-model SSOT), met "waarom" in de termen van het anker + dosis (⏱ min).
9. **Afvinken** ("Markeer als gedaan") → **exertie-microvraag** (licht/matig/zwaar) → *"Morgen kies je opnieuw."*
10. **Uitkomst:** een rij in `daily_action_log` (account-scoped). Dit voedt "Deze week", de trend en later de planner-occurrences.

### Fase D — Terugblik & herkalibratie (van gewoonte naar bewijs)
11. **De lijn beweegt.** Na genoeg dagen toont de trend-tegel de leefstijllijn (`buildDomainTrendRow`).
12. **De hermeting** (na ~8 weken) herhaalt de 11-dimensie-check → nieuwe score, delta, en de payoff: *"dit is wat er veranderde sinds je start."*
13. **Herkalibratie:** score/context verschuift → `computeCurrentPhaseId` promoot de fase → de route-ladder schuift mee → nieuwe dagstappen worden ontsloten. Bij doelwijziging: nieuw anker/startpatroon → arc herbouwt.

### 2.5 De hulpvraag-vraagset (mapping op bestaande intake)

De opdracht somt een reeks vragen op ("waarom is dat belangrijk", "wat wil je weer kunnen", "welke pijn", "hoeveel tijd"). Die worden **niet** een nieuwe vragenlijst — ze zijn al (grotendeels) gedekt. Deze tabel is de mapping, met de gaten die F2 moet vullen:

| Opdracht-vraag | Bestaat als | Bron |
|---|---|---|
| Waar loop je tegenaan? / welke pijn? | `MOV2_PAIN` (klachten) + symptom_profile | intake |
| Wat wil je straks weer kunnen? (diepere motivatie) | **anker** (`movementAnchor`) | `MovementStartChoice` |
| Welke beweging vermijd/vind je leuk? | `preferredStartPattern` (grof) | `MovementStartChoice` |
| Hoeveel tijd heb je? | ⚠️ **gat → F2** `weeklyAvailability` | nieuw intake-veld |
| Fysieke beperkingen? | `MOV2_PAIN`, `MOV2_MOB`, `MOV2_FUNC` | intake |
| Mentale barrières / motivatie? | `MOV2_MOTIV`, `MOV2_CONSIST` | intake |
| Hoe ervaar je je energie? | `MOV2_COND` + energie-domeinscore (cross-pijler) | intake |
| Welke momenten op een dag zijn haalbaar? | ⚠️ **gat → F2** `weeklyAvailability` (tijdvak-buckets) + `workActivity` | nieuw intake-veld |
| Zittend/staand/fysiek werk? | ⚠️ **gat → F2** `workActivity` (bestaat in `movement-pal.ts`, niet in UI) | nieuw intake-veld |

**Ontwerpprincipe voor de intake:** progressive disclosure. De **eerste** intake blijft kort en gratis (scores + anker + startpatroon). De **F2-velden** (tijd, werk, sport-voorkeur) komen als een *lichte dashboard-onboarding* ná de eerste dagstap — niet als muur vooraf. Zo verlagen we de drempel (Fogg: ability) en vragen we pas om detail als de gebruiker al waarde zag.

---

## 3. Persona's en Jobs To Be Done

Drie primaire persona's binnen de doelgroep mannen 40+ (35–65 secundair). Elke persona: de dominante barrière (COM-B), het anker dat waarschijnlijk resoneert, en de JTBD.

### Persona 1 — "De vastgelopen prof" (48, zittend werk, weinig tijd)
- **COM-B-barrière:** *Opportunity* (tijd/gelegenheid) + *Automatic motivation* (avondmoeheid).
- **Waarschijnlijk anker:** `energie` — "aan het eind van de dag nog energie over".
- **JTBD:** *"Als mijn dag vol zit, wil ik één beweegmoment dat écht past, zodat ik me 's avonds niet leeg voel en niet het gevoel heb dat ik weer 'gefaald' heb."*
- **Systeemantwoord:** korte tiers, "Geen tijd vandaag?"-variant die volledig meetelt, beweegsnacks (F3) tegen het zitten.

### Persona 2 — "De herstellende" (55, klachten/blessure, voorzichtig)
- **COM-B-barrière:** *Physical capability* (klachten) + *Reflective motivation* (angst om iets te forceren).
- **Waarschijnlijk anker:** `zelfstandigheid` — "zelf blijven doen wat ik wil".
- **JTBD:** *"Als ik last heb, wil ik weten wat vandaag veilig is, zodat ik opbouw zonder terug te vallen — en zonder een dokter nodig te hebben voor elke stap."*
- **Systeemantwoord:** recovery-hint (licht/rust), medische-verwijs-copy bij `medical`-signaal, conservative load-level, alternatieven binnen het domein.

### Persona 3 — "De herontdekker" (43, was ooit sportief, nu ingezakt)
- **COM-B-barrière:** *Reflective motivation* (het gat tussen wie hij was en is) + *Opportunity* (routine kwijt).
- **Waarschijnlijk anker:** `kracht` — "me sterk en capabel blijven voelen".
- **JTBD:** *"Als ik weer wil beginnen, wil ik een opbouw die me niet meteen sloopt, zodat ik het volhoud in plaats van na twee weken af te haken."*
- **Systeemantwoord:** progression-curve (week 1–12), fase-promotie-momenten als betekenis (geen badge), trend die de terugkeer zichtbaar maakt.

**Rode draad in alle drie:** de motor is *identiteit* (wie word ik), niet *metriek* (hoeveel deed ik). Het systeem maakt de identiteit continu zichtbaar via het anker en de route-fasenamen ("Opnieuw leren gebruiken" → "Mijn toekomst onderhouden").

---

## 4. Functionele blauwdruk — Dashboard Main (de beweeg-cockpit)

Het Dashboard is één donker craft-blok (first viewport) + een lichte onderbouw. Het beantwoordt continu: *waar sta ik op mijn lijn · wat doe ik vandaag · houd ik ritme · beweegt mijn lijn · wie word ik · wanneer zie ik het.* Zes tegels, elk met: **waarom het bestaat**, **welk probleem**, **welke data**, **invloed op het Stappenplan**.

### 4.1 VANDAAG — de hero (dominante tegel, de enige check-off)
- **Waarom:** één primaire actie per scherm (Fogg-trigger op het laagst-drempelige gedrag).
- **Probleem:** "een heel schema" verlamt; één kleine stap activeert.
- **Data:** day-model SSOT (`resolveActiveHabitContent` → `model.activeHabit`), afvinken via `/api/account/daily-log`, override door `movement-recovery-hint.ts`. De dagkeuze (Herstel/Matig/Trainen) selecteert de stap; `resolvePatternTrainingStepId` mapt startpatroon → stap.
- **States:** *todo* (titel + waarom-in-ankertermen + dosis + primair "Markeer als gedaan" + secundair "Geen tijd vandaag?"); *gedaan* (→ exertie-microvraag → "Morgen kies je opnieuw", **geen streak**); *geen-tijd* (lichtere/rustdag-variant, "telt volledig mee"); *recovery-licht* (hint overrulet → licht/rust; bij `medical` → verwijs-copy).
- **Invloed op Stappenplan:** de afvink schrijft naar `daily_action_log` → dat voedt de plan-reader (one-way read) en later `lp_occurrences`. De hero is de *ingang* van de dagelijkse lus; het Stappenplan is de *context* eromheen.

### 4.2 WAAR JE STAAT — de score/lijn-tegel ("Hier sta je nu")
- **Waarom:** oriëntatie ("waar sta ik?") + Future You-lading in narratief, niet in een cijfer.
- **Probleem:** zonder standpunt geen richting; maar een dagelijks bewegend cijfer is oneerlijk.
- **Data:** `model.scores.beweging` (dé engine-score) in de ring-craft. **Geen** tweede/groeiend getal. Narratieve FY-regel eronder.
- **States:** *leeg* ("Dit wordt je startpunt") · *normaal* (ring + FY-regel) · *recovery-licht* (ring blijft rustig, geen daling faken).
- **Invloed op Stappenplan:** de score voedt `computeCurrentPhaseId` → bepaalt de NU-fase in de route-ladder en welke stappen zichtbaar zijn. Score omhoog → fase kan promoveren → nieuwe stappen ontsloten.

### 4.3 MIJN WAAROM — het anker (prominente, altijd zichtbare kaart)
- **Waarom:** SDT-autonomie + betekenis. Dé bron van volhouden.
- **Probleem:** abstracte doelen ("fitter") motiveren niet; een concreet toekomstbeeld wel.
- **Data:** `movementAnchor` (enum, geen vrije tekst → geen PII/moderatie). Toont de gekozen anker-copy ("Zelf blijven doen wat ik wil…").
- **Wijzigbaar:** ja — via "Wijzig mijn waarom" → heropent de `MovementStartChoice`-anker-picker. Wijziging herkleurt alle "waarom deze stap"-regels en (later) de nurture-toon.
- **Invloed op Stappenplan:** het anker kleurt de **waarom-suffix** van elke stap (`buildAnchorWhySuffix`). Zelfde oefening, andere betekenis per gebruiker.

> **Ontwerpkeuze:** in de huidige cockpit is "Mijn Waarom" verweven in de hero-waarom-regel, niet een losse grote kaart. De opdracht vraagt een *prominente* kaart. Aanbeveling: houd het anker als **eyebrow-regel boven de hero** ("VANDAAG · voor: zelf blijven doen wat je wilt") én als bewerkbare regel in de score-tegel — zo is het prominent zonder een zevende tegel toe te voegen die de first viewport overlaadt.

### 4.4 DEZE WEEK — de ritme-readout (Doelen, procesgericht)
- **Waarom:** ritme > perfectie; procesdoelen voorspellen resultaat beter dan resultaatdoelen.
- **Probleem:** een todo-lijst met vinkjes creëert schuld; een spiegel van wat je deed niet.
- **Data:** week-samenvatting uit `daily_action_log` — *"Kracht 1× · wandelen 2×"* als constatering, **geen checkboxes**.
- **States:** *leeg* ("Nog niets deze week — je eerste moment telt al mee") · *gedaan* (readout) · *recovery-week* ("vooral herstel — dat is óók bouwen").
- **Invloed op Stappenplan:** dit is de brug naar de weekdoelen (`GuidelineTarget`, F3): "Deze week" is de menselijke readout, `lp_guideline_progress` de machine-teller eronder.

**Over "Doelen" (opdracht §Doelen).** We onderscheiden bewust:
- **Procesdoelen** (leidend, gratis): "beweeg deze week 3× iets". Zichtbaar in "Deze week".
- **Gedragsdoelen** (het anker vertaald): "elke dag de kleinste stap".
- **Resultaatdoelen** (secundair, hermeting): "score/functionele test omhoog" — pas zichtbaar bij de hermeting, nooit als dagelijkse stok.
- Week-/maanddoelen = de progression-curve (`ProgressionWeekDefinition`), getoond als route-fasen, niet als aftel-targets.

### 4.5 JE TREND — beweegt de lijn? ("Hier begon je" → "Hier sta je nu")
- **Waarom:** eerlijke terugkoppeling; bewijs dat de kleine stappen optellen.
- **Probleem:** zonder zichtbare vooruitgang haakt men af; maar dagelijks ruis tonen ontmoedigt.
- **Data:** `buildDomainTrendRow(model, "beweging")` — sparkline + `DeltaBadge`. "Begin 55 · nu 58 ▲+3". De **beginwaarde** = de eerste meting = "Hier begon je" (startdatum, beginscore, eerste antwoorden, eerste anker). **Geen foto** (§0.2).
- **States:** *leeg* (<2 punten: "Nog te vroeg voor een lijn") · *normaal* · *RULES_VERSION-grens* (delta `null` + "meetmethode bijgewerkt", geen getal-met-sterretje).
- **Invloed op Stappenplan:** de trend voedt geen keuzes direct, maar is de *payoff-belofte* waar de hermeting-teaser naar wijst.

### 4.6 JOUW ROUTE — de read-only ladder (de brug naar het Stappenplan)
- **Waarom:** "wie word ik, en wat komt daarna?" — identiteit + progressie zonder afvink.
- **Probleem:** een 12-weeks plan overweldigt; een 4-fasen-arc met identiteitsnamen oriënteert.
- **Data:** `movementPlanTemplate.phases` + `computeCurrentPhaseId`. NU-fase licht op, toekomst gedimd. **Geen checkbox op enige rij.** Fasenamen: F1 *Opnieuw leren gebruiken* → F2 *Kracht bouwen* → F3 *Functioneel sterk* → F4 *Mijn toekomst onderhouden*.
- **Invloed op Stappenplan:** dit ís de ingang. De regel **"Bekijk je volledige stappenplan →"** onder de ladder is dé (enige) doorway naar de plan-reader.

### 4.7 JE VOLGENDE MEETMOMENT — de hermeting-teaser
- **Waarom:** verwachting sturen ("wanneer zie ik écht iets?") en de eerlijke keuze expliciet maken.
- **Probleem:** mensen zoeken dagelijkse bevestiging; wij verplaatsen die naar een eerlijk moment.
- **Data:** afstand tot de volgende hermeting (dagen sinds start/laatste meting).
- **States:** *te vroeg* · *klaar* ("Je hermeting staat klaar" + CTA).
- **Invloed op Stappenplan:** de hermeting herijkt scores → herkalibreert fase en dagstappen (Fase D).

### 4.8 Dynamische inzichten (opdracht §Dynamische inzichten)
De opdracht vraagt inzichten als *"je motivatie stijgt na wandelen", "je slaapt beter na actieve dagen"*. Eerlijke fasering:
- **Nu leverbaar (F1–F2):** binnen-domein readouts uit de daily-log en exertie — *"Je logt vaker op woensdag", "Je hield conditie langer vol dan kracht"*. Regelgebaseerd, deterministisch.
- **Cross-pijler (later, /inzichten-feed):** *"Je slaapscore is hoger op dagen dat je bewoog"* vereist correlatie tussen `daily_action_log` en de slaap-check-in — dat hoort in de **Inzichten-feed**, niet in de beweeg-cockpit, en pas als er genoeg datapunten zijn.
- **Persoonlijk-lerend (AI, §15):** *"Je beweegt het best rond 17u"* = `PersonalizationEngine` op occurrence-histogrammen — Fase 6+, achter guardrails, geen medische output.

**Regel:** een inzicht verschijnt pas als het **statistisch eerlijk** is (genoeg punten) en **actionable** (leidt tot een betere dagstap of tijd-suggestie). Geen "data om de data".

### 4.9 Acties op het Dashboard (opdracht §Acties)
Eén primaire, de rest secundair (progressive disclosure):
- **Primair:** `Markeer als gedaan ✓` (in de hero — de enige check-off).
- **Secundair (tekstlinks):** `Geen tijd vandaag?` · `Wijzig keuze` · `Waarom deze stap? →`.
- **Tertiair (elders op het scherm):** `Bekijk je volledige stappenplan →` (route-ladder) · `Wijzig mijn waarom` · `Open je voortgang →` · `Doe de hermeting` (als klaar) · `Maak beweging mijn prioriteit` (als een andere pijler vandaag voorrang heeft).
- **Bewust géén** knop "Nieuwe vragenlijst" prominent op het dashboard: de hermeting is de gestuurde herijking; een losse "opnieuw invullen" ondermijnt de trend-continuïteit.

---

## 5. Functionele blauwdruk — Dynamisch Stappenplan (plan-reader + route + planner)

Het Stappenplan is **geen vaste checklist**. Het bestaat op drie niveaus die samen reageren op alles wat op het Dashboard gebeurt:

1. **Route-ladder** (in de cockpit) — de 4-fasen-arc, read-only, altijd zichtbaar. "Waar zit dit in mijn reis?"
2. **Plan-reader** (aparte light 768px-surface) — het volledige 12-weeks plan als leescontent. "Wat komt er, en waarom?"
3. **Planner-engine** (F3, premium) — tijd, agenda, herkalibratie. "Wanneer, en automatisch bijgesteld."

### 5.1 Bovenaan de plan-reader (opdracht §Bovenaan)
Direct zichtbaar: **Vandaag** (spiegelt de hero-stap, read-only), **volgende stap/fase**, **voortgang** (welke fase, hoe ver), en **de persoonlijke motivatie** (het anker als kop). Eén canonieke naam overal: *"Jouw stappenplan · beweging"*.

### 5.2 De tijdlijn (opdracht §Tijdlijn)
Interactieve verticale tijdlijn, maar **read-only afvinken** in account-context (de sync-invariant):
```
✓ Deze week      — jouw stap staat op ✓ (gespiegeld uit daily-log)
→ Week 2–4        — Structureel krachttrainen   (NU-fase, accent)
○ Week 4–12       — Verankeren en meten          (toekomst, gedimd)
```
Elke stap-kaart bevat (uitklap, progressive disclosure): **duur · intensiteit · reden · verwacht effect · alternatief · uitleg/tips · (optioneel) video**. De **startknop** en **afvinken** leven in de VANDAAG-hero, niet hier — de plan-reader *toont* de stap, de hero *doet* 'm. "Pauzeren/overslaan" = de "Geen tijd vandaag?"- en recovery-mechaniek in de hero, gespiegeld als status in de reader.

> **Waarom geen tweede afvinklijst:** twee check-off-oppervlakken met verschillende sleutels (daily-log = account+dag; plan-progress = sessie+fase) leidden tot tegenstrijdige staat ("hero zegt gedaan, plan zegt todo"). Eén executie-SSOT (daily-log), één afgeleide structuur-laag (plan-reader). *Anonieme intake-users* (geen account) houden wél de checkboxes — daar is de plan-progress hun enige tracker.

### 5.3 "Waarom deze stap?" (opdracht §Waarom deze stap)
Elke stap legt uit, feit-eerst dan anker:
1. **Mechanisme** (waarom dit fysiologisch helpt) — bv. *"Opstaan uit een stoel zonder handen traint precies de beenkracht die na 40 het snelst afneemt."*
2. **Welk doel het steunt** — gekoppeld aan het anker: *"…want jij wilt zelf blijven doen wat je wilt."*
3. **Welke klacht het verlicht** — indien van toepassing, uit het symptom_profile/`MOV2_PAIN`.

De copy komt uit `MOVEMENT_STATEMENTS` / `MOVEMENT_DEEPEN` (feit-eerst, geen "jij kunt dit!") + de anker-suffix. Nooit een medische belofte.

### 5.4 Alternatieven (opdracht §Alternatieven)
Twee lagen:
- **Nu (gratis, in de hero):** de **tier-keuze zelf** is het primaire alternatief-mechanisme (Herstel ↔ Matig ↔ Trainen), plus "Geen tijd vandaag?" (lichtere/kort-variant) en de recovery-hint (automatisch lichter bij zwaar herstel).
- **F2 (template):** modaliteit-alternatieven binnen dezelfde intensiteit uit de activity-catalogus — *kan niet wandelen? → fietsen / zwemmen / binnen bewegen / rustige yoga*. Het systeem biedt deze automatisch aan op basis van `preferredSport` + beschikbare `ActivityDefinition`s met vergelijkbare `intensity` en `category`.
- **F3 (planner):** context-alternatieven (weer, agenda-vol) via de priority-engine.

### 5.5 Na iedere stap (opdracht §Na iedere stap)
De check-in ná een stap is **bewust minimaal** (één tik): *"Hoe voelde dit? ○ licht ○ matig ○ zwaar"* (exertie). Dat is de default. Pijn/energie/motivatie/leuk-vroeg elke keer vragen zou de drempel voor de *volgende* dag verhogen (Fogg: elke extra vraag verlaagt ability). De rijke evaluatie hoort bij de hermeting.
- **Invloed op Dashboard (direct):** de exertie is een payload-dimensie op de afvink-event; "Deze week" en de trend updaten; bij herhaald "zwaar" kan de recovery-context de volgende dag lichter voorstellen.

### 5.6 Adaptief systeem (opdracht §Adaptief) — samengevat, uitgewerkt in §13
Het plan verandert bij: ziek/veel pijn → recovery-hint licht/rust of medisch-verwijs; regen → (F3) binnenvariant; veel energie → geen forcering omhoog, maar de Trainen-tier blijft beschikbaar; doel verandert → arc herbouwt; motivatie daalt → kortere stap + meer coaching-copy; tijdgebrek → lichtere tier, zelfde telling; veel vooruitgang → fase-promotie; week niks gedaan → geen schuld, "pak de volgende gewoon weer op", eventueel terug naar een lichtere instap.

---

## 6. Interactie tussen beide schermen

De kern van de opdracht: het moet *leven*. Onderstaande lus is het contract.

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD (waar sta ik?)                                    │
│  score-ring · anker · trend · route-ladder · hermeting-teaser│
└───────────────┬─────────────────────────────────────────────┘
                │  dagkeuze (tier)  →  stap laadt in hero
                ▼
        ┌───────────────────────────┐
        │  VANDAAG-HERO (wat nu?)    │  ← enige check-off
        │  Markeer als gedaan ✓      │
        └───────────┬───────────────┘
                    │  afvink → exertie-microvraag
                    ▼
        ┌───────────────────────────┐
        │  daily_action_log          │  ← EXECUTIE-SSOT (account, dag)
        └───────────┬───────────────┘
        ┌───────────┴───────────────┬───────────────────────────┐
        ▼                           ▼                           ▼
  "Deze week" readout        trend / leefstijllijn        plan-reader (read-only)
  (ritme spiegelt)           (lijn beweegt, traag)        (stap toont ✓, arc-status)
        │                           │                           │
        └───────────┬───────────────┴───────────────────────────┘
                    ▼
        computeCurrentPhaseId(scores, ctx, logged)
                    │  fase promoot?
                    ▼
        route-ladder schuift → nieuwe dagstappen ontsloten
                    │
                    ▼  (na ~8 weken)
        HERMETING → nieuwe score/delta → arc herbouwt → nieuw advies
                    │
                    ▼
        DASHBOARD verandert  → de lus begint opnieuw, op een hoger niveau
```

**De vijf concrete "het leeft"-koppelingen** (elk observeerbaar voor de gebruiker):
1. **Tier → stap:** kies een tier op het dashboard, de hero-stap verandert *direct* (al gebouwd).
2. **Afvink → readout:** vink af, "Deze week" en de trend-sparkline updaten bij de volgende render.
3. **Afvink → plan-reader:** open het stappenplan, de stap van vandaag staat op ✓ (one-way read).
4. **Herstelgevoel → morgen:** log "zwaar", en de recovery-context stelt morgen een lichtere tier voor.
5. **Fase-promotie → route + advies:** genoeg volgehouden → de NU-badge schuift een fase op, nieuwe stappen verschijnen, de copy verandert ("Je bent klaar voor fase 2").

**Meetpunt:** `dashboard_vandaag_action_toggled` (hero-conversie, surface=`kompas_beweging`) + `dashboard_beweging_plan_click` (doorway) + `plan_reader_shown` — hieraan lees je af of de lus daadwerkelijk rondloopt (afvinken → plan bekijken → terugkeren). Geen PII in GA4/Clarity.

---

## 7. Beslisboom en systeemlogica

Drie beslislagen, van snel/deterministisch naar traag/lerend. Alle drie bestaan (deels) al of zijn ontworpen.

### 7.1 Dag-selectie (recovery-hint + tier) — bestaat
```
INVOER: verse RCV_FEEL (≤7d) of recovery-context, startPattern, andere-pijler-prioriteit
─────────────────────────────────────────────────────────────────
ALS medisch signaal (klachten ernstig / expliciete flag)
    → toon medische verwijs-copy (huisarts/fysio), GEEN training forceren
ANDERS ALS herstel = moe/uitgeput  (RCV_FEEL ≤ 2)
    → override naar Herstel-tier (rustdag / 10 min wandelen)
ANDERS ALS een andere pijler vandaag prioriteit heeft
    → hero toont "Vandaag ligt je stap bij [slaap]" + [Maak beweging mijn prioriteit]
ANDERS
    → toon 3 tiers met Aanbevolen-badge op de tier die past bij herstel + startPattern
       ├─ Herstel  → REST_DAY_STEP_ID
       ├─ Matig    → resolveModerateStepId(startPattern)
       └─ Trainen  → resolvePatternTrainingStepId(MOV_STR, startPattern)
                     ALS Trainen gekozen → training-gate: "Gisteren zwaar getraind?"
                        ├─ ja → herstel / matig / toch-trainen
                        └─ nee → laad krachtstap
```

### 7.2 Progression (fase-unlock + load-level) — ontworpen (F3)
```
loadLevel:
  ALS lage recovery OF hoge leeftijd OF lage movement_score → conservative
  ANDERS ALS hoge movement_score EN jong EN goede recovery   → ambitious
  ANDERS                                                       → standard

conservative → +1 week vertraging op kracht-unlock, lagere week-minuten
week-advance → maandag 06:00  OF  ≥80% weekdoel vóór zondag (early unlock)
fase-promotie → computeCurrentPhaseId(scores, ctx, gelogde sessies)
   → NU-badge schuift, nieuwe ActivityDefinition-ids ontsloten
```

### 7.3 Priority (één beste interventie nu) — ontworpen (F3)
```
score = basePriority × guidelineUrgency × recoveryFit × timingFit × fatiguePenalty
band:  ≥70 high · 40–69 mid · <40 low
suppress: slaapvenster · focusmodus (alleen high) · low max 8/dag ·
          geen snack <60min na hoofdactiviteit · agenda-busy bij fixed overlap
```

### 7.4 De gecombineerde gedragsregels (opdracht §Beschrijf de logica)
| ALS … | DAN … |
|---|---|
| motivatie laag **én** energie laag | kortere activiteit · meer coaching-copy · lagere intensiteit (Herstel/Matig) |
| gebruiker gaat sneller vooruit dan curve | early-unlock (≥80% weekdoel) → fase promoot eerder |
| gebruiker verandert doel/anker | arc herbouwt op nieuw anker + startpatroon; dagstappen herselecteren |
| ziek / veel pijn | recovery-hint rust/licht; bij ernstig → medische verwijs-copy, geen forcering |
| veel energie | Trainen-tier beschikbaar, maar nooit *automatisch* opschroeven (herstel is de limiet, niet motivatie) |
| tijdgebrek | "Geen tijd?" → lichtere/kort-variant, telt volledig mee (zelfde daily-log-key) |
| week niets gedaan | geen schuld-copy; "pak de volgende gewoon weer op"; eventueel terug naar lichtere instapstap |
| regen voorspeld (F3) | priority-engine kiest binnenvariant met gelijke intensiteit |
| lang aaneengesloten zitten (F3) | beweegsnack-kandidaat (low band), telt níét mee in matig-minuten |

---

## 8. Componentenbibliotheek

Per component: bestaat/nieuw, verantwoordelijkheid, koppeling. (Namen = werkelijke of voorgestelde PSF-componenten.)

### Dashboard-cockpit (donker)
| Component | Status | Verantwoordelijkheid |
|---|---|---|
| `MovementCockpit` | bestaat | Grid-omhulsel (preview-craft), rendert de zes tegels |
| `MovementTodayHero` | bestaat | VANDAAG-hero: dagkeuze, stap, afvink, exertie, geen-tijd, recovery-states |
| `MovementStartChoice` | bestaat | Startpatroon + anker-picker (B-1b) |
| `MovementScoreRing` (score-tegel) | bestaat/demotie | Echte `scores.beweging` + narratieve FY-regel |
| `MovementWeekRhythm` | nieuw | "Deze week" ritme-readout uit daily-log |
| `MovementTrendTile` | hergebruik | `buildDomainTrendRow` sparkline + `DeltaBadge` |
| `MovementRouteLadder` | bestaat | 4-fasen read-only ladder + doorway naar plan-reader |
| `MovementRemeasureTeaser` | nieuw | Forward-pointer naar hermeting |
| `CockpitShell` / `CockpitTile` | bestaat | Gedeelde craft-primitives (rounded-2xl, eyebrow, serif) |

### Stappenplan (light 768px)
| Component | Status | Verantwoordelijkheid |
|---|---|---|
| Plan-reader (`MovementPlanDeepBody`) | herontwerp | Read-only 12-weeks arc, cockpit-tokens, one-way sync uit daily-log |
| `MovementPlanConfigurator` | bestaat | Basis-template-keuze (F2) |
| Stap-kaart (uitklap) | nieuw | Duur/intensiteit/reden/effect/alternatief/tips/video, read-only |

### Planner-engine (F3, service-role)
| Component | Status | Verantwoordelijkheid |
|---|---|---|
| `PriorityEngine` / `ProgressionEngine` / `RecommendationEngine` | ontwerp | Pure functies: beste stap, fase-opbouw, kandidaten |
| `NotificationEngine` | ontwerp | Dosering + suppress-regels |
| `CalendarService` / `WearableService` | ontwerp | Adapters, privacy-gate |
| `PlannerTodayCard` / `SnackPrompt` | ontwerp | UI voor tijd-bewuste stap + beweegsnack |

### Gedeeld
| Component | Status | Verantwoordelijkheid |
|---|---|---|
| `day-model` | bestaat, SSOT | "Wat is vandaag" — één waarheid |
| `movement-prefs` | bestaat | Anker + startpatroon (answers-jsonb) |
| `movement-recovery-hint` / `-context` | bestaat | Herstel-override op de dagstap |
| `daily_action_log` (API) | bestaat | Executie-SSOT |

---

## 9. Informatiearchitectuur

### 9.1 Schermen & staten
```
/dashboard?kompas=beweging  (Dashboard Main — cockpit)
├── first viewport (donker)
│   ├── anker-eyebrow  (Mijn Waarom)
│   ├── VANDAAG-hero   [todo · gedaan · geen-tijd · recovery-licht · medical · leeg]
│   ├── score-ring     [leeg · normaal · recovery-licht]
│   ├── Deze week      [leeg · gedaan · recovery-week]
│   ├── trend          [leeg(<2) · normaal · rules-version-grens]
│   ├── route-ladder   [normaal · fase-promotie · leeg]
│   └── hermeting-teaser [te-vroeg · klaar]
├── onderbouw (light)
│   ├── gedaan-log (chips + minuten)
│   ├── ▸ Voeding & supplementen (ingeklapt)
│   └── Verdieping: Gids · Inzichten · Stappenplan →
│
└── plan-reader (Dynamisch Stappenplan — light 768px)
    ├── kop: "Jouw stappenplan · beweging" + anker
    ├── tijdlijn (✓ deze week · → NU-fase · ○ toekomst)
    ├── stap-kaart (uitklap: duur/intensiteit/reden/effect/alternatief/tips)
    └── [F2] basis-variant-label · [F3] tijd-slots
```

### 9.2 Lege schermen (empty states)
- Geen check gedaan → score verborgen, "Dit wordt je startpunt" + "Doe de beweegcheck (3 min)".
- Geen startpatroon → picker eerst, geen dagstap forceren.
- Geen data voor trend (<2 punten) → "Nog te vroeg voor een lijn".
- Lege week → "Nog niets deze week — je eerste moment telt al mee".

### 9.3 Foutafhandeling
- Daily-log write faalt → optimistische UI met retry, geen dubbel-tellen (idempotent op stepId+dag).
- Recovery-hint data ontbreekt → val terug op day-model-stap (fail-safe: toon iets, forceer niets).
- Plan-reader zonder account → toon plan-progress-checkboxes (anonieme vertakking), geen daily-log-sync.

### 9.4 Onboarding · instellingen · notificaties · herinneringen
- **Onboarding:** progressive (intake kort → dagstap → F2-lichte dashboard-onboarding voor tijd/werk/sport).
- **Instellingen:** anker wijzigen, startpatroon wijzigen, (F3) agenda/wearable koppelen achter privacy-gate, notificatie-voorkeuren.
- **Notificaties/herinneringen:** gefaseerd (in-app → e-mail → push), dosering via suppress-regels; nooit binnen slaapvenster; low-band gelimiteerd.

---

## 10. UX-principes (en hoe ze hier landen)

| Principe | Concreet in dit systeem |
|---|---|
| **Progressive disclosure** | Eén primaire actie zichtbaar; "waarom", alternatieven en het volledige plan achter tikken/uitklap |
| **Cognitive load reduction** | Zes tegels max; dagelijkse check-in = één vraag; geen calorieën/sub-scores |
| **One primary action per screen** | Alleen de hero heeft een primaire knop; alle andere acties zijn secundair/tertiair |
| **Behaviour change (COM-B/Fogg)** | Capability ↑ (kleinste stap), Opportunity ↑ (tijd/alternatieven), Motivation ↑ (anker + eerlijke trend) |
| **Habit formation / Tiny Habits** | "De kleinste investering van vandaag"; koppel aan bestaande gewoonte (uit `MOVEMENT_CHOICES`) |
| **Autonomie (SDT)** | Gebruiker kiest anker, tier, startpatroon; systeem forceert nooit op |
| **Vertrouwen** | Echte score, eerlijke "niet elke dag een cijfer", geen medische belofte, feit-eerst copy |
| **Rust & eenvoud** | Headspace-kalmte: veel witruimte, weinig knoppen, geen rode-badge-urgentie |

**Vermeden (opdracht + SSOT):** overvolle dashboards, te veel cijfers/knoppen, fitness-app-uitstraling, competitie, schuldgevoel. Zie §0.2 voor de expliciete afwijzingen.

---

## 11. Wireframebeschrijvingen per scherm

### 11.1 Dashboard (375px — hero dominant, first viewport)
```
┌ DomainTopNav ─────────────────────────────┐
│[■] voor: zelf blijven doen wat je wilt     │  ← anker-eyebrow (Mijn Waarom)
│[■] ◉ Kracht   Conditie   Ritme             │  ← startpatroon-focus (dun)
│[■] ┌─ VANDAAG · trainen ───────────────────┐│  ┐ HERO
│[■] │ Eén krachtsessie: squat, push, pull   ││  │ dominant,
│[■] │ waarom (anker) · ⏱ 30–45 min          ││  │ first
│[■] │ [ Markeer als gedaan ✓ ]  Geen tijd?  ││  │ viewport
│[■] │ Waarom deze training? →                ││  ┘
│[■] └───────────────────────────────────────┘│
│[■] ◔ 58 Beweging  "met jouw plan bouw je…"  │  ← score + FY-regel
│[■] ┌ Deze week ─┐ ┌ Je trend ──┐            │  ← 2-up readouts
│[■] │ kracht 1×  │ │ ▁▂▃▅ ▲+3   │            │
│[■] ┌ Jouw route ───────────────────────────┐│
│[■] │ ● F1 NU · ○F2 ○F3 ○F4                  ││  ← read-only ladder
│[■] │ Bekijk je volledige stappenplan →      ││  ← DE doorway
│[■] ┌ Je volgende meetmoment ───────────────┐│
│[■] │ "over ~3 weken zie je je lijn bewegen" ││
├────────────────────────────────────────────┤
│[ ] Gedaan-log (chips + minuten)             │  ← light onderbouw
│[ ] ▸ Voeding & supplementen (ingeklapt)     │
│[ ] Verdieping: Gids · Inzichten · Stappenpl.│
└────────────────────────────────────────────┘
```

### 11.2 Dashboard (1024px — score-anker links, hero rechtsboven)
Grid `[220px_1fr]`: **score-ring = linker anker-kolom**, **hero = dominante tegel rechtsboven**, daaronder "Deze week + Trend" (2-up), dan route-ladder als horizontale stepper, dan hermeting-teaser. Light onderbouw als 2-koloms.

### 11.3 Stappenplan / plan-reader (light 768px)
```
┌ Jouw stappenplan · beweging ──────────────────┐
│ voor: zelf blijven doen wat je wilt            │  ← anker-kop
│ ● Deze week   Kracht leren    (jouw stap ✓)    │  ← reflecteert daily-log
│ → Week 2–4    Structureel krachttrainen        │  ← NU-fase, accent
│   ┌ uitklap ─────────────────────────────────┐ │
│   │ ⏱ 30–45 min · matig · 2×/week            │ │
│   │ Waarom: … (mechanisme) …want jij wilt …  │ │
│   │ Verwacht effect: … · Alternatief: fietsen │ │
│   │ Tips · (video)                            │ │
│   └───────────────────────────────────────────┘ │
│ ○ Week 4–12   Verankeren en meten              │  ← toekomst, gedimd
│ [Basis] Aanbevolen voor jou: kracht-thuis, 2×  │  ← F2 variant-label
└────────────────────────────────────────────────┘
```

---

## 12. Visuele ontwerpprincipes

**Twee werelden, één familie.** De cockpit is **donker** (craft-atmosfeer, "staand besluit"), de plan-reader **light 768px** (leescontent leest beter licht). Ze delen **tokens, geen thema** — de overgang voelt als "van cockpit naar werkblad", niet als "andere app".

| Element | Waarde | Toepassing |
|---|---|---|
| Accent | sage `#5A8F6A` (`PILLAR.beweging`) | ring, NU-rij, primaire CTA |
| Tegel | `rounded-2xl border border-white/10 bg-black/20 p-4` | alle sub-tegels |
| Paneel | `rounded-3xl`, gradient `#131F1D→#0C1315` | cockpit-omhulsel |
| Eyebrow | `text-[10px] uppercase tracking-[0.1em] text-[#9FB0A6]` | tegel-labels |
| Serif | DM Serif Display | scores + tegel-titels |
| Ring | SVG r=64, strokeWidth 12, track `#22302E`, accent-arc | echte beweegscore |

**Visueel gewicht (hiërarchie):**
1. **VANDAAG-hero** — grootste tegel, serif-titel, enige gevulde (sage) knop. *Waarom: het is de enige actie.*
2. **Score-ring** — tweede anker, groot serif-cijfer. *Waarom: oriëntatie.*
3. **Route-ladder** — accent op NU-fase. *Waarom: de brug naar het plan.*
4. Deze week / trend / hermeting — rustige readouts, kleiner. *Waarom: context, geen actie.*

**Iconografie:** minimaal, lijn-iconen; geen medaille/vlam/trofee (gamification-signaal). **Animatie/micro-interacties:** subtiel — afvink → sage-fill + zachte check; ring vult bij load; fase-promotie → eenmalige rustige highlight (geen confetti). **Statusindicatoren:** ● NU / ○ toekomst / ✓ gedaan — geen rode urgentie-badges. **Feedbackmomenten:** afvink-bevestiging + exertie-microvraag; "telt volledig mee" bij geen-tijd; "dat is óók bouwen" bij herstel.

---

## 13. Adaptieve gedragslogica

Hoe het plan mee-ademt met de mens (uitgebreider dan §7.4, met de databron per regel):

| Situatie | Signaalbron | Aanpassing | Toon |
|---|---|---|---|
| Ziek / veel pijn | `MOV2_PAIN`, recovery-hint `medical` | Rust/licht; bij ernstig → verwijs-copy | zorgzaam, geen forcering |
| Zwaar hersteld (moe) | `RCV_FEEL ≤2`, recovery-context | Override naar Herstel-tier | "vandaag licht — dat is verstandig" |
| Veel energie | `RCV_FEEL ≥4` | Trainen-tier beschikbaar (niet automatisch verhoogd) | uitnodigend, geen druk |
| Doel/anker verandert | `movementAnchor` wijziging | Arc herbouwt, waarom-copy herkleurt | "je richting is bijgesteld" |
| Motivatie daalt | `MOV2_MOTIV`, log-gaten | Kortere stap + meer coaching-copy | "verklein je doel, forceer niet" |
| Tijdgebrek | "Geen tijd?"-tik | Lichtere/kort-variant, telt vol mee | "drukke dag? dit telt volledig mee" |
| Snel vooruit | ≥80% weekdoel | Early fase-unlock | "je bent klaar voor fase 2" |
| Week niets gedaan | log-hiaat | Geen schuld; eventueel lichtere instap | "pak de volgende gewoon weer op" |
| Regen (F3) | weer-adapter (toekomst) | Binnenvariant, gelijke intensiteit | neutraal-praktisch |
| Lang zitten (F3) | timer/wearable | Beweegsnack (low band), aparte teller | "je zit 25 min — 3 min lopen?" |

**Kernregel adaptatie:** herstel en klachten zijn de *limiterende* factoren, motivatie en energie de *toestaande*. Het systeem schroeft nooit automatisch op boven wat herstel toelaat — het biedt ruimte aan, de gebruiker kiest (SDT-autonomie).

---

## 14. Edge cases en uitzonderingssituaties

| Edge case | Gedrag |
|---|---|
| Nieuwe gebruiker, geen enkele check | Score verborgen, "Dit wordt je startpunt"; picker eerst; geen dagstap forceren |
| Startpatroon niet gekozen | `MovementStartChoice` blokkeert de dagflow tot gekozen |
| Andere pijler heeft vandaag prioriteit | Hero: "Vandaag ligt je stap bij [slaap]" + "Maak beweging mijn prioriteit" |
| Trainen gekozen ná zware dag | Training-gate: "Gisteren zwaar getraind?" → herstel/matig/toch |
| Recovery = medisch signaal | Exacte verwijs-copy (huisarts/fysio), niets eromheen, geen stap |
| Anonieme intake-user (geen account) | Plan-progress-checkboxes blijven (hun enige tracker); geen daily-log-sync |
| RULES_VERSION-grens in de trend | Delta `null` + "meetmethode bijgewerkt" — geen getal met sterretje |
| Dubbele afvink / offline-retry | Idempotent op stepId+dag; geen dubbeltelling |
| Fase-lock (tier trekt alleen uit fase 1) | **Bekend gat** — "Trainen" in week 6 toont nog de week-1-stap; besluit nodig: fase-aware maken óf bewust anker houden en progressie via route-ladder tonen (§L2 KOMPAS-doc) |
| Hermeting te vroeg geopend | "Nog even bouwen — het meetmoment komt vanzelf" |
| Geen daily-log-data maar wél plan-progress | Val terug op plan-progress voor weergave; markeer bron |
| Data-verwijdering (account delete) | Alle `lp_*` + daily-log cascaden; `session_id` → set null (account-data blijft) |

---

## 15. Toekomstige uitbreidingen

Modulair toe te voegen zónder de kernervaring (dagstap, cockpit) complexer te maken. Elke uitbreiding is een aparte poort met eigen privacy-vereisten.

| Uitbreiding | Wat het toevoegt | Poort / voorwaarde |
|---|---|---|
| **Planner-engine (F3)** | Tijd-slots, agenda, herkalibratie, beweegsnacks, meerdere plan-varianten | Premium; `lp_*`-tabellen; app-first |
| **Agenda-koppeling** | Google/Outlook free/busy → stap op vrij moment | OAuth + privacy-gate (register/DPA/DPIA) |
| **Wearables** | Slaap/HRV/trainingLoad → soft recovery-hint op de **analyse-laag** (nooit een 2e domeinscore, nooit sensor-raw in een stap) | Art. 9-gate: expliciete toestemming, client-side aggregatie, TTL 90d |
| **AI-coaching** | `ModelRecommendationStrategy` reranking op pseudonieme features (beste tijdstip, snack-frequentie) | Fase 6+; guardrails (max intensity, medische grens); geen vrije-tekst/health-dump in features |
| **Cross-pijler inzichten** | "Je slaapt beter na actieve dagen" (correlatie beweging ↔ slaap) | /inzichten-feed; genoeg datapunten; eerlijk-statistisch |
| **Weer-adapter** | Regen → binnenvariant | Adapter-interface; geen gebruikersvoorkeur schenden |
| **Zorgprofessional / B2B** | Fysio/coach voegt activiteiten toe zonder deploy | `lp_activity_definitions` DB-tabel; CMS; aparte tenant-overweging |
| **Nieuwe leefstijlmodules** | `energy`, `recovery`, `nutrition`, `sleep`, `stress` op dezelfde engine | `LifestyleModule`-interface + `src/data/planner/<module>.ts` |

**Uitbreidings-invariant:** elke nieuwe module/adapter respecteert de vier noordsterren (§0.3) — één check-off, één score, dagstap gratis, geen gamification. Nieuwe modules erven de cockpit-structuur en de sync-architectuur; ze verzinnen geen tweede afvink-oppervlak.

---

## Slot — de aanbeveling in één alinea

Bouw dit niet als een nieuw dashboard, maar als de **volwassen-wording van de bestaande cockpit**, langs de reeds vastgelegde fasering: **F1** harmoniseert de plan-reader (één light 768px-surface, cockpit-tokens, één terminologie, one-way sync uit daily-log) en houdt de hero heilig als enige actie; **F2** voegt de basis-template + de ontbrekende intake-velden (tijd/werk/sport) toe zonder paywall op de dagstap; **F3** brengt de planner-engine (tijd, agenda, herkalibratie, wearables) als premium *planning/uitvoering-laag*, nooit als inhoud van vandaag. De opdracht-visie — *van pijn → persoonlijk doel → kleine haalbare acties, met twee schermen die elkaar voortdurend voeden* — is exact wat deze architectuur al belooft; dit document is het contract dat borgt dat elke toevoeging die belofte versterkt in plaats van 'm te verdunnen met een tweede cijfer, een streak of een derde vinklijst.

> **Meetpunt:** `dashboard_vandaag_action_toggled` (hero-conversie) + `dashboard_beweging_plan_click` + `plan_reader_shown` — hier lees je af of Dashboard en Stappenplan als één levend systeem functioneren. Geen PII in GA4/Clarity.

*Opgesteld 22 juli 2026, geverifieerd tegen `main` + de drie SSOT-docs. Geen implementatie, geen code — UX-blauwdruk. Verandert geen enkele DEFER/FREEZE/KILL-status.*
