# BESLUIT — Zitgedrag v1: de zit-as, passieve meting en de weg naar een aanbod

> **Status:** onderzoeksrapport + besluitvoorstel. Secties met **LOCK** volgen uit bestaande canon (`ARCHITECTUUR_LIFESTYLE_PLANNER.md` §15, COMPLIANCE, DPIA, de piramide-besluiten). Secties met **VOORSTEL** wachten op expliciete GO van Dennis.
> **Datum:** 13 augustus 2026 · **herzien dezelfde dag:** §B3 en §B4 geverifieerd tegen de primaire literatuur (het ⚖️-voorbehoud op het stapgetal vervalt), §A6 en §C3 toegevoegd — het onderbrekingsritme als eerste meetbare handeling op zitten, zonder wearable
> **Reeks:** `BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` (de ladder) · dit document (Prioriteit 1 inhoudelijk + de passieve-meetnaad) · `BESLUIT_BEWEGING_KOPPELNAAD_V1_2026-08.md` (Prioriteit 2–6 koppelingen)
> **Noordster:** *Eerst laten zien wat er gebeurt, dan pas iets aanbieden. Een meter die verkoopt is geen meter meer.*

---

## A · Diagnose — waar zitgedrag nu staat

**A1 · De vraag bestaat en is goed gesteld.** `MOV2_SIT` — *"Hoeveel uur zit je gemiddeld per dag?"* — met vijf geordende banden ([movement-checkin/index.ts:113](../../src/data/movement-checkin/index.ts#L113)):

| Antwoord | Waarde |
|---|---|
| Minder dan 4 uur | `5` |
| 4–6 uur | `4` |
| 6–8 uur | `3` |
| 8–10 uur | `2` |
| Meer dan 10 uur | `1` |

Vijf banden, geen gat in de schaal (anders dan `CON_SOC` bij verbinding). De help-copy staat er al en is scherp: *"Een getalsnorm is er niet: de richtlijn zegt alleen 'voorkom veel stilzitten'."*

**A2 · De ontbrekende norm is een correcte keuze, geen gebrek.** `factStatus()` geeft voor de dimensie `zitten` bewust `"own"` terug — geen `meets`/`near`/`below` ([movement-assessment.ts:639](../../src/lib/movement-assessment.ts#L639)). Kracht en aeroob krijgen wél een statusoordeel, want daar bestáát een getalsnorm. Voor zitten niet. Dat is het systeem dat zich aan de wetenschap houdt, en het is precies waarom Prioriteit 1 vandaag geen legitieme `winst`-staat kan krijgen op zitten alleen.

**A3 · Er is geen tijdlijn.** Elke check-in levert één `MOV2_SIT`-waarde in `raw_inputs`. Er is geen zit-trend, geen reeks, geen "hoe ging dit de afgelopen acht weken". De hermeting geeft twee punten, niet een lijn.

**A4 · De wearable-naad is gereserveerd maar volledig leeg.** Dit is de belangrijkste vondst van dit onderzoek. `AgendaBlockSource` enumereert de providers al letterlijk ([types/agenda.ts:4-15](../../src/types/agenda.ts#L4)):

```
"external:apple_health" | "external:google_fit" | "external:garmin"
| "external:fitbit" | "external:oura" | "external:whoop"
```

En `agenda_blocks` draagt twee kolommen `external_provider` + `external_ref`, met een tabelcomment die het doel expliciet maakt: *"external_* kolommen gereserveerd voor latere koppelingen"* ([migratie](../../supabase/migrations/20260718160000_agenda_blocks.sql)). De read-mapping bestaat ([agenda-blocks.ts:103-104](../../src/lib/agenda-blocks.ts#L103)).

**Schrijvers: nul.** Buiten testfixtures is er geen enkele plek in `src/` die deze velden ooit vult. De naad is ontworpen, gereserveerd, getypt — en niet bedraad. Dat is goed nieuws voor de bouwkosten en gevaarlijk nieuws voor de governance: een naad die er al ligt, wordt makkelijk bedraad zónder dat iemand door de §15-poort loopt.

**A5 · De engine die dit zou dragen bestaat niet.** `ARCHITECTUUR_LIFESTYLE_PLANNER.md` beschrijft de `PriorityEngine`, `SignalSnapshot` en `NotificationEngine` in detail — en zegt in zijn eigen kop: *"Status: ontwerp (juli 2026). Geen productiecode."* Geverifieerd: **nul `lp_*`-tabellen** in `supabase/migrations/`. De alert-/tip-lus die je wilt (§E) is Fase 3 van dat document en is niet gebouwd.

**A6 · De logtabel bestaat al; de herinnering heeft geen infrastructuur.** Twee vondsten die samen de kosten van §C3 bepalen:

- [`movement_session_log`](../../supabase/migrations/20260718120000_movement_session_log.sql) bestaat, is bedraad ([movement-session-log.ts](../../src/lib/movement-session-log.ts)), account-gescoopt, RLS deny-all, cascadeert bij accountverwijdering. Een onderbreking loggen kost **geen migratie**. Wél zit er een val in: [`getMovementWeekSummary()`](../../src/lib/movement-session-log.ts#L109) telt álle minuten uit die tabel op in één `totalMinutes` — onderbrekingen zouden daar als beweegminuten in landen (§C3.3).
- **Push-infrastructuur: nul.** Geen service worker, geen web-manifest, geen enkele treffer op `Notification`, `serviceWorker` of VAPID in `src/`. Een herinnering die buiten de app afgaat, bestaat vandaag niet en is geen kleine toevoeging.

**Conclusie:** zitgedrag heeft een goede vraag, een eerlijke niet-norm, geen trend, een lege maar volledig voorbereide koppelnaad — en één handeling die al bijna bedraad is. Het inhoudelijke werk (§C1, §C2) kan vandaag, zonder één regel wearable-code; het onderbrekingsritme (§C3) kan er direct achteraan, zonder migratie en zonder nieuwe consent. Het passieve deel (§D) is een AVG-traject, geen feature.

---

## B · Wat het bewijs zegt

### B1 · Er is geen getalsnorm voor zitten — en dat is de bevinding

De WHO-richtlijn 2020 (*Guidelines on physical activity and sedentary behaviour*) adviseert sedentaire tijd te beperken en te vervangen door activiteit van welke intensiteit dan ook, maar geeft **bewust geen drempelwaarde**: het bewijs werd onvoldoende geacht om een getal te kwantificeren. De Nederlandse Beweegrichtlijnen 2017 (Gezondheidsraad) doen hetzelfde — *"voorkom veel stilzitten"*, zonder uren.

Dat betekent: elk uurgetal dat wij als grens presenteren, verzinnen wij. Onze eigen help-copy zegt dit al goed en die formulering is de standaard voor alles wat hierna komt.

### B2 · Waar het bewijs wél hard is: de gezamenlijke associatie

De geharmoniseerde meta-analyse van Ekelund et al. (2016, *The Lancet*, >1 miljoen deelnemers) is het scharnierpunt: het verhoogde sterfterisico bij lang zitten wordt **sterk afgezwakt — en bij de hoogste activiteitscategorie grotendeels weggenomen — bij voldoende matig-intensieve activiteit** (in de orde van 60–75 minuten per dag in dat cohort). Latere accelerometer-gebaseerde analyses (Ekelund et al. 2019, *BMJ*) bevestigen de richting met objectieve meting.

De bruikbare uitspraak is dus niet *"je zit te veel"* maar *"lang zitten wéégt zwaarder als je weinig beweegt"*. Dat is een uitspraak over een **combinatie** — en die combinatie kunnen wij vandaag al afleiden uit twee velden die we allebei hebben.

### B3 · Stappen hebben wél een dosis-respons, mét plateau — ⚖️ opgelost

**Geverifieerd 13 augustus 2026.** Het ⚖️-voorbehoud uit de eerste versie van dit document vervalt: er is een primaire publicatie die het getal draagt.

Ding et al. (2025, *The Lancet Public Health*), *Daily steps and health outcomes in adults* — systematische review van 57 studies uit 35 cohorten, meta-analyse over 31 studies, **device-gemeten** stappen. Vergeleken met **2.000** stappen per dag hangt **7.000** stappen per dag samen met:

| Uitkomst | Verschil t.o.v. 2.000 stappen |
|---|---|
| Totale sterfte | −47% |
| Hart- en vaatziekten (incidentie) | −25% |
| Sterfte aan hart- en vaatziekten | −47% |
| Kankersterfte | −37% |
| Type 2 diabetes | −14% |
| Dementie | −38% |
| Depressieve klachten | −22% |
| Vallen | −28% |

De curves vlakken boven ~7.000 grotendeels af. De auteurs stellen expliciet dat het 10.000-doel heroverwogen mag worden: 7.000 is klinisch betekenisvol én haalbaarder. Paluch et al. (2022, meta-analyse van 15 cohorten) wees dezelfde kant op met een leeftijdsafhankelijk plateau (~6.000–8.000 bij 60-plussers, ~8.000–10.000 daaronder).

Drie dingen die daaruit volgen en die in de copy moeten landen:
1. **10.000 is geen wetenschappelijke norm.** Het is een marketinggetal uit de jaren zestig. Het plateau ligt lager, en dat eerlijk zeggen is precies de Consumentenbond-positie.
2. **De referentie is 2.000, niet nul en niet 10.000.** Elke zin die we schrijven, moet die vergelijking dragen: *de eerste duizend stappen erbij tellen het zwaarst*. Wie 7.000 als drempel presenteert waar je "onder" zit, maakt er een norm van die de publicatie niet stelt.
3. **Het blijft een populatieverband op device-gemeten stappen.** Wij meten vandaag geen stappen (§D). Zolang dat zo is, is 7.000 een **evidence-anker in de uitleg**, geen getal waar een gebruiker zich aan meet.

### B4 · Onderbreken van zitten: sterk op mechanisme, met een band in plaats van een getal

**Aangescherpt 13 augustus 2026 na verificatie.** Het bewijs is steviger dan de eerste versie van dit document aannam, en het is preciezer over het interval.

Het "elke 20–30 minuten even staan"-advies staat al in onze eigen evidence-laag ([leefstijlcheck-evidence.ts:769-785](../../src/data/leefstijlcheck-evidence.ts#L769)) en rustte daar op één experiment (Dunstan et al., *Diabetes Care* 2012). Inmiddels staat er meer onder:

- **Netwerk-meta-analyse** (*Journal of Sport and Health Science*) en een **systematische review met meta-analyse** (*Obesity Reviews*, 2025): ongeveer **1,5–5 minuten** lichte tot matige activiteit elke **20–30 minuten** verlaagt de postprandiale glucose- en insulinerespons ten opzichte van 2–9 uur aaneengesloten zitten.
- **Het interval doet ertoe:** onderbreken elke **15–20 minuten** gaf de grootste daling in glucose- en insuline-iAUC. Korter interval, groter acuut effect.
- **De vorm doet ertoe:** wandelpauzes werken beter dan staan alleen.
- **Wie het meest wint:** het effect is consistenter en groter bij mensen met lagere fitheid, insulineresistentie of overgewicht.

Wat dit **wel** is: een robuust, herhaald, acuut-fysiologisch effect. Wat het **niet** is: bewijs dat onderbreken op de lange termijn harde uitkomsten (sterfte, incidente diabetes) verbetert — daar is geen RCT voor — en het is **geen richtlijngetal** voor de algemene bevolking. De WHO en de Beweegrichtlijnen geven het niet (§B1); de enige harde intervalaanbeveling die bestaat, komt uit diabeteszorg en geldt daar voor een klinische populatie.

**Ontwerpimplicatie, en het is een gelukkige:** er is geen enkel juist getal, er is een **band van 15 tot 30 minuten**. Een instelbaar interval is daarmee niet een concessie aan gebruiksgemak maar de wetenschappelijk correcte vorm. Wij tonen de band met bron en laten de gebruiker kiezen — dat is precies dezelfde structuur als "geen getalsnorm voor zitten" (§B1), één niveau dieper.

### B5 · Wat dat samen betekent voor Prioriteit 1

Prioriteit 1 kan **geen** `winst` verdienen op zitten alleen — er is geen norm om onder te zitten. Prioriteit 1 kan **wel** `winst` verdienen op de combinatie *lang zitten × weinig bewegen*, want dat is precies de as waarop het bewijs uitspraken doet. Dat is §C1.

En Prioriteit 1 krijgt daarnaast voor het eerst een **handeling met een meetbare uitkomst** die geen wearable nodig heeft: het onderbrekingsritme (§C3). Zitten is tot nu toe het enige beweegonderwerp waar we wel een vraag over stellen en niets mee kunnen doen. Dat verandert daar.

---

## C · BESLUIT — de Prioriteit 1-winstconditie

**Dit is het deel dat vandaag bouwbaar is, zonder wearable, zonder OAuth, zonder DPIA-wijziging.** Beide ingrediënten bestaan al in `src/`.

### C1 · De joint-conditie

`aerobicStatus(MOV2_CARD, MOV2_VIG)` levert al `meets` / `near` / `below` met correcte equivalentierekening (1 minuut intensief = 2 matig, [movement-assessment.ts:591](../../src/lib/movement-assessment.ts#L591)). `MOV2_SIT` levert de zitband. De kruising:

| | `MOV2_SIT` ≥ 4 (< 6 uur) | `MOV2_SIT` = 3 (6–8 uur) | `MOV2_SIT` ≤ 2 (> 8 uur) |
|---|---|---|---|
| aeroob **`meets`** | `ok` | `ok` | `watch` |
| aeroob **`near`** | `ok` | `watch` | `watch` |
| aeroob **`below`** | `watch` | `watch` | **`winst`** |

Eén cel geeft `winst`, en het is de enige cel waarvoor het bewijs een gerichte uitspraak toestaat: veel zitten én onder de aerobe richtlijn.

**Waarom niet meer cellen `winst`:** zodra Prioriteit 1 en Prioriteit 2 tegelijk `winst` claimen, verliest de ladder zijn functie — hij hoort één plek aan te wijzen. De cel rechtsonder is bovendien de enige waar Prioriteit 1 aantoonbaar zwaarder weegt dan Prioriteit 2: bij iemand die veel zit én weinig beweegt is de eerste winst dagelijkse beweging, niet een krachtschema.

**Waarom `watch` en niet `winst` bij veel zitten met goede aerobe status:** dat is exact het Ekelund-resultaat. Wie de richtlijn haalt, heeft het grootste deel van het zitrisico afgekocht. Dan is "houd in de gaten" eerlijk en "grootste winst" onwaar.

### C2 · De copy die daarbij hoort

Feit-eerst, mechanisme, dan actie — conform `WRITING_VOICE.md` en de leefstijlcheck-copy-stijl.

**Bij `winst` (rechtsonder):**
> Je zit **[label]** per dag en je zit onder de aerobe richtlijn. Die twee samen wegen zwaarder dan elk apart: in groot cohortonderzoek zwakt voldoende dagelijkse beweging het risico van lang zitten sterk af. Daarom begint je winst hier, niet bij een trainingsschema.

**Bij `watch` met goede aerobe status:**
> Je zit **[label]** per dag. Dat telt mee — maar je haalt de aerobe richtlijn, en dat vangt het grootste deel op. Houd het in de gaten; je winst ligt nu ergens anders.

**Permanent, in elke staat (de niet-norm expliciet):**
> Voor zitten bestaat geen getalsnorm. De richtlijn zegt alleen: voorkom veel stilzitten. Je ziet hier je eigen uren, niet een cijfer waar je onder moet.

Die laatste regel is het analogon van de vangnetregel bij verbinding (§C4 daar): niet-conditioneel, altijd zichtbaar, want een uitleg die alleen bij een slechte score verschijnt, is zelf een oordeel.

### C3 · Het onderbrekingsritme — VOORSTEL, de eerste meetbare handeling op zitten

§B4 geeft een band van 15–30 minuten en geen getal. Dat vertaalt naar drie onderdelen, en ze zijn los van elkaar bruikbaar.

**C3.1 · Het interval is van de gebruiker.** Eén instelling, standaard **uit**, met een schuif of chiprij over de band **15 · 20 · 25 · 30 minuten** en de bron eronder. Geen default-aanbeveling die als norm leest; wél de feitelijke zin dat een korter interval in de studies het grootste acute effect gaf, zodat de keuze geïnformeerd is in plaats van willekeurig.

**C3.2 · De herinnering — en de infrastructuur die er niet is.** Geverifieerd: er is in dit project **geen service worker, geen web-manifest en geen push-infrastructuur** (nul treffers op `Notification`, `serviceWorker` of VAPID in `src/`). Dat bepaalt de vorm:

| Route | Werkt waar | Kosten | Oordeel |
|---|---|---|---|
| **Browsertab-timer** — teller in de app, page-level `Notification` na toestemming | Desktop, zolang het tabblad open staat | **S** | **Bouwen.** Zitgedrag is een bureau-usecase; desktop is hier de natuurlijke context, niet de uitzondering |
| **PWA + Web Push** | Ook telefoon (iOS alleen ná toevoegen aan beginscherm) | **L** — service worker, manifest, VAPID, notificatie-opt-in, eigen DPIA-regel | **Niet nu.** Meet eerst of onderbrekingen überhaupt gelogd worden |
| **Doorverwijzen naar de telefoonwekker** | Overal | nul | Als tussenstap eerlijk, maar levert geen enkel meetpunt op |

De browsertab-route vraagt één expliciete regel in de UI: *"Deze herinnering loopt zolang dit tabblad open staat."* Een timer die stilletjes stopt, is erger dan geen timer.

**C3.3 · De meting — en dit is het punt.** Een onderbreking is de eerste beweeghandeling die de gebruiker **zelf kan bevestigen op het moment zelf**: één tik op "gedaan". Daarmee is zitgedrag niet langer het domein waar we alleen naar vragen.

De tabel bestaat al: [`movement_session_log`](../../supabase/migrations/20260718120000_movement_session_log.sql) — account-gescoopt, RLS deny-all, service-role-only, cascadeert bij accountverwijdering. **Geen migratie nodig.** Een onderbreking wordt een rij met een eigen modaliteit (voorstel: `zit_onderbreking`).

> ⚠️ **Blokkerende voorwaarde — regel vóór de eerste onderbrekingsrij.** [`getMovementWeekSummary()`](../../src/lib/movement-session-log.ts#L109) telt **alle** minuten uit die tabel op in `totalMinutes` en `modalityMix`. Tien onderbrekingen van twee minuten zouden als **twintig minuten beweging** in de weekreeks verschijnen — een tweede beweegwaarheid, precies wat de evidence-reeks niet mag worden. De aggregatie moet gesplitst worden in `movementMinutes` (exclusief onderbrekingen) en een aparte `breakCount`, mét de bestaande consumenten nagelopen. Dat is code-werk in één functie, geen migratie — maar het moet vóór de eerste schrijver, niet erna.

**C3.4 · Wat de teruggave mag zeggen.** De uitkomst is een **aantal per dag**, nooit een percentage van een doel, nooit een streak (§H verbiedt streak en badge expliciet):

> Je onderbrak je zitten vandaag **[n]** keer. In onderzoek verlaagt een korte onderbreking elke 20–30 minuten de glucose- en insulinerespons na het eten, vergeleken met uren achter elkaar zitten. Wat dat op lange termijn oplevert, is niet in harde uitkomsten gemeten — het mechanisme wel.

Feit · mechanisme · grens van het bewijs. Geen doel, geen oordeel, geen "je hebt het niet gehaald".

**C3.5 · Waarom dit compliance-technisch licht is.** Zelfrapportage, account-gescoopt, bestaande tabel, bestaande cascade, geen nieuwe verwerker, geen doorgifte, geen continue stroom. Dit is categorisch de linkerkolom van §D2 — het tegenovergestelde van passieve meting. Eén aandachtspunt, gelijk aan §D4: `movement_session_log` is account- en niet sessie-gescoopt en valt dus buiten `cleanup_intake_session_linked_data()`. Dat is vandaag al zo en verandert hier niet, maar het hoort in dezelfde DPIA-regel vastgelegd.

### C4 · Het stap-anker zonder stapteller

§B3 levert een sterk getal dat wij niet kunnen meten. Drie routes, en de derde is de valkuil:

1. **Anker in de uitleg (nu).** 7.000 verschijnt in de evidence-laag en in de help-copy als populatiebevinding mét bron en mét de referentie van 2.000. Geen invoerveld, geen doel, geen voortgangsbalk. Kosten: nul, buiten de tekst.
2. **Zelfrapportage (optioneel later).** Eén bandvraag — *"wat staat er de meeste dagen op je telefoon?"* — in de beweegcheck. Zelfde consent-pad als `MOV2_SIT`, geen migratie, geen poort. Levert een ruwe trend zonder wearable-traject. Nadeel: schatting op geheugen, en het nodigt uit tot doelgedrag rond een getal dat de publicatie niet als doel stelt.
3. **Passief (§D).** Nauwkeurig, en het volledige AVG-traject.

**Advies: route 1 nu, route 2 alleen als de zit-trend (spoor 1, §E2) laat zien dat mensen hun eigen verloop bekijken.** Een tweede zelfrapportagevraag toevoegen aan een check die al lang is, terwijl niemand de eerste trend opent, is de verkeerde volgorde.

### C5 · Wat dit expliciet níet doet

- Geen zit-score, geen zit-cijfer, geen bijdrage aan `movement_score`. `rules_version` blijft **1.4.0**, geen bump, geen comparabiliteitsbreuk. Ook het onderbrekingsaantal is **geen** score-input — het is evidence náást de scorelijn, zelfde lock als de sessielog.
- Geen "uw zitgedrag is ongezond"-taal. Geen enkele toestandsbenoeming.
- Geen stappendoel, geen stappeninvoer, geen voortgang naar 7.000. Het getal is een bevinding, geen streefwaarde (§C4).
- Geen streak, geen badge, geen dagdoel op onderbrekingen — ook niet als "motivatie".

---

## D · Passieve meting — het compliance-kader

Dit is het zwaartepunt. Passieve meting is niet "dezelfde data, makkelijker verzameld". Het is een andere verwerking met een ander risicoprofiel.

### D1 · LOCK — de §15-poort geldt onverkort

[`ARCHITECTUUR_LIFESTYLE_PLANNER.md` §15.3](../plan/ARCHITECTUUR_LIFESTYLE_PLANNER.md) stelt vijf acties vóór één regel OAuth-code:

| # | Actie | Document |
|---|---|---|
| 1 | Verwerking registreren (doel, grondslag, bewaartermijn, verwerker) | `docs/core/VERWERKINGSREGISTER.md` |
| 2 | Publieke privacy-pagina bijwerken | `src/app/privacy/page.tsx` |
| 3 | DPA accepteren en archiveren per verwerker | `Documenten/.../privacy/dpa/` |
| 4 | DPIA herzien (art. 9, doorgifte buiten EU) | `docs/core/DPIA.md` |
| 5 | Legal PDF's genereren | `npm run generate-legal-pdfs` |

Aanvullend, en dit is de reden dat dit document bestaat: **actie 3 is niet één DPA maar één per provider.** Apple, Google, Garmin, Fitbit, Oura en Whoop zijn zes losse verwerkersrelaties met zes voorwaardensets, en meerdere daarvan verwerken buiten de EU. Dat is geen implementatiedetail — het is de duurste post in het hele traject en hij schaalt lineair met het aantal providers.

**Gevolg voor de scope:** begin met **één** bron, niet met de zes uit het type-union. Elke extra bron is een eigen DPA, een eigen registerregel en een eigen intrekpad.

### D2 · LOCK — passief is categorisch anders dan zelfrapportage

| | Zelfrapportage (`MOV2_SIT`) | Passieve meting |
|---|---|---|
| Frequentie | Eén moment, bewust ingevuld | Continu, zonder handeling |
| Bewustzijn | De gebruiker weet exact wat hij deelt | De gebruiker deelt een stroom |
| Reikwijdte | Eén antwoord | Locatiegedrag, dagritme, afwezigheid, ziekte-patronen zijn afleidbaar |
| Intrekken | Sessie anonimiseren volstaat | Token intrekken **plus** historie verwijderen |

Dat verschil moet in de consent-tekst zichtbaar zijn en in de UI, niet alleen in de privacyverklaring.

### D3 · LOCK — eigen consent-type, default uit, per bron intrekbaar

Hergebruik van `health_data_processing` of `domain_checkin_logging` ([consent-texts.ts](../../src/lib/consent-texts.ts)) is **niet toegestaan**: die teksten dekken een periodieke zelfrapportage, niet een continue stroom. Toestemming die niet specifiek is, is geen geldige toestemming (art. 4 lid 11 / art. 9 lid 2 sub a).

Nieuw: `wearable_sync`, in de bestaande vorm van `consent-texts.ts`, met bump van `CONSENT_VERSION` (nu `2.1`). Voorstel-tekst:

> Ik geef toestemming om activiteitsgegevens (zoals stappen en actieve minuten) uit de bron die ik koppel automatisch te laten meelezen, zodat ik mijn eigen verloop over tijd kan terugzien. Dit is geen medisch advies en geen diagnose. Ik kan de koppeling per bron verbreken, en dan worden de opgehaalde gegevens verwijderd.

Drie eigenschappen die niet onderhandelbaar zijn: **default uit** · **per bron losstaand** · **verbreken verwijdert historie** (niet alleen: stopt de stroom).

### D4 · LOCK — de revoke-naad die niemand heeft opgemerkt

`cleanup_intake_session_linked_data()` is **sessie-gescoopt**: hij ruimt `nurture_emails`, `intake_reminders`, `plan_progress`, `intake_baseline_snapshots`, `intake_intake_log` en `intake_domain_checkin` op via `session_id`.

`agenda_blocks` is **account-gescoopt** (`account_id`, cascade vanaf `accounts`) en zit dáárom niet in die functie. Vandaag is dat onschuldig: het gaat om zelf ingevoerde routines. Zodra `external_provider` gevuld wordt met wearable-herkomst, staat er art. 9-data in een tabel die het bestaande intrekpad **niet** raakt.

**Vereiste vóór de eerste schrijver:** een account-gescoopt intrekpad dat wearable-afkomstige rijen verwijdert, plus een DPIA-regel die dit onderscheid vastlegt. Dit is geen nice-to-have; het is het verschil tussen een werkende en een gebroken intrekking.

### D5 · LOCK — geen alert die een toestand benoemt

Onder MDCG 2019-11 (rev. 1, 17 juni 2025) blijft software voor leefstijl- en welzijnsdoeleinden buiten de MDR zolang het beoogde doel niet diagnose of behandeling is. Een passieve meter die uit zichzelf een waarschuwing genereert, schuift op naar die grens — sneller dan een formulier dat de gebruiker zelf invult.

**Verboden in elke tip, notificatie of e-mail op basis van passieve data:**
- Toestandsbenoeming: "je zitgedrag is ongezond", "risicovol", "te veel", "zorgelijk"
- Elke individuele risico-uitspraak ("dit verhoogt jouw risico op …")
- Elke drempelwaarde gepresenteerd als norm (§B1)
- Elke vergelijking met andere gebruikers

**Toegestaan:** de gebruiker zijn eigen cijfers teruggeven, zijn eigen verloop tonen, en het mechanisme uitleggen met bron.

### D6 · LOCK — geen commerciële trigger op passieve data

Parallel aan de verbinding-lock (§C5 daar): `nurture-content.ts` en `resolve-nurture-cta.ts` mogen **niet** getriggerd worden door een passief gemeten waarde. Een verkoopmail die afgaat omdat iemands horloge een slechte week doorgaf, is functie-creep (DPIA R4) en commercieel gebruik van het meest intieme gegeven dat we hebben.

Dit is tegelijk de technische vertaling van jouw eigen noordster: bewustwording eerst, aanbod later, en het aanbod komt **nooit** uit de meting rollen. Zie §E3.

### D7 · VOORSTEL — granulariteit en retentie

| Aspect | Voorstel | Reden |
|---|---|---|
| Opslag-granulariteit | **Dagtotalen**, geen intraday-reeks | Een dagtotaal draagt de bewustwording; een minuutreeks draagt een dagpatroon en daarmee locatie- en afwezigheidsinferentie |
| Raw payloads | **Nooit** opslaan | `ARCHITECTUUR_LIFESTYLE_PLANNER.md` §15.3 data-minimalisatie |
| Retentie | 90 dagen rollend (voorstel-`SignalSnapshot`-TTL uit §15.3) | Genoeg voor trend, kort genoeg om geen levensarchief te worden |
| Tokens | Nooit in logs, events of analytics | idem |
| Doorgifte | Provider-afhankelijk — **per bron vastleggen** | Meerdere providers verwerken buiten de EU |

Het spanningspunt: 90 dagen is genoeg voor "hoe ging dit de afgelopen maanden" en te kort voor "hoe ging dit sinds vorig jaar". Als je die tweede vraag wilt beantwoorden, moet je geaggregeerde weekcijfers apart bewaren met een eigen termijn — dat is een bewuste keuze, geen bijproduct. **Open besluit J3.**

---

## E · De bewustwordingslus — awareness vóór aanbod

Dit is jouw expliciete productvolgorde en hij verdient een lock, want het is precies de plek waar dit soort features doorgaans ontsporen.

### E1 · Wat een tip mag zeggen

Drie niveaus, oplopend in opdringerigheid, en alleen de eerste twee zijn nu in beeld:

| Niveau | Vorm | Toegestaan? |
|---|---|---|
| **1 · Teruggave** | In het dashboard staat je eigen verloop. Je komt kijken. | Ja — dit is geen bericht |
| **2 · Awareness-tip** | Een regel op de surface, feit-eerst, geen badge, geen belofte | Ja, binnen §D5 |
| **3 · Push/e-mail** | Ongevraagd bericht buiten de app | **Alleen met eigen opt-in**, los van `wearable_sync` |

Niveau 3 vraagt een tweede toestemming, want "ik wil dat je meeleest" is niet hetzelfde als "ik wil dat je me mailt". Dat onderscheid is ook praktisch: notificatiemoeheid is de snelste manier om een meter uit te laten zetten.

**Vorm van een niveau-2-tip:**
> Je stapte deze week gemiddeld **[n]** per dag, tegen **[m]** in de vier weken ervoor. Onderzoek naar stappen en gezondheid laat de sterkste winst zien in het lagere bereik — de eerste duizend stappen erbij tellen zwaarder dan de laatste.

Feit · eigen vergelijking · mechanisme. Geen norm, geen oordeel, geen actie-imperatief.

### E2 · Wat "over tijd meten" concreet betekent

Vandaag ontbreekt de trend volledig (§A3), ook zonder wearable. Twee onafhankelijke sporen, en het eerste heeft geen poort nodig:

- **Spoor 1 — zelfrapportage-trend.** Elke check-in levert al een `MOV2_SIT`. Ze staan er, in `intake_domain_checkin.raw_inputs`, en er wordt niets mee gedaan behalve de laatste tonen. Een reeks van vier check-ins tonen is puur leeswerk op bestaande data. **Geen consent-wijziging, geen migratie, geen poort.**
- **Spoor 2 — passieve trend.** Dagtotalen uit een gekoppelde bron, achter §D. Rijker, veel duurder.

Spoor 1 is het eerlijke antwoord op "meten hoe dit gaat over tijd" voor de eerste versie, en het bewijst bovendien of mensen de trend überhaupt bekijken — vóór je zes DPA's tekent om dezelfde vraag rijker te beantwoorden.

### E3 · De poort naar een aanbod — LOCK

> **Een coach-, product- of dienstaanbod mag nooit worden getoond op grond van een passief gemeten waarde, en nooit in dezelfde weergave als de meting.**

Drie redenen, waarvan de laatste de belangrijkste:

1. **Compliance** — §D6: automatische commerciële triggering op art. 9-data is functie-creep.
2. **Positionering** — een meter die verkoopt, wordt gelezen als een verkooptruc met een grafiekje. Dat is exact het omgekeerde van de Consumentenbond-positie.
3. **Werkzaamheid** — de meting is precies zoveel waard als het vertrouwen dat hij niet stuurt. Eén verkoopmoment op de verkeerde plek kost dat vertrouwen permanent, en het komt niet terug.

Wat wél mag: de gebruiker gaat zélf naar het schap of naar de koppelnaad (`BESLUIT_BEWEGING_KOPPELNAAD_V1`), vanuit een permanente, niet-conditionele ingang. De meting mag die ingang **niet** oplichten, prioriteren of aanbevelen op grond van een gemeten waarde.

Dit is dezelfde structuur als Prioriteit 6 in de ladder: de deur bestaat, hij is gegate, en de gate gaat niet open omdat een getal slecht is.

---

## F · Data & engine

| Onderdeel | Spoor 1 (nu) | Onderbrekingsritme (§C3) | Spoor 2 (achter §15) |
|---|---|---|---|
| Bron | `intake_domain_checkin.raw_inputs.MOV2_SIT` | eigen bevestiging in de app | Provider-API via OAuth |
| Tabel | bestaand | **`movement_session_log`** — bestaat, modaliteit `zit_onderbreking` | `lp_signal_snapshots` (ontwerp §15.3) of een `movement_*`-equivalent |
| Migratie | geen | **geen** | ja, plus register + DPIA + DPA's |
| Voorwaarde | — | **aggregatiesplitsing** `movementMinutes` / `breakCount` vóór de eerste rij (§C3.3) | §15-poort compleet |
| Consent | bestaand `domain_checkin_logging` | bestaand — zelfrapportage, account-gescoopt | **nieuw** `wearable_sync` + `CONSENT_VERSION`-bump |
| Interval-voorkeur | — | account-instelling, default **uit**; `account_priority_pref`-patroon of eigen kolom | n.v.t. |
| `rules_version` | onveranderd **1.4.0** | onveranderd — evidence náást de scorelijn | onveranderd — passieve data raakt de score **niet** |
| Ladder-logica | `resolveMovementLadderState()` in `src/lib/movement-ladder.ts` — leest `MOV2_SIT` + `aerobicStatus` | ongewijzigd — een onderbreking verandert **geen** laagstaat | idem, ongewijzigd |
| Intrekpad | bestaand (sessie-gescoopt) | bestaand account-cascade — vastleggen in DPIA (§C3.5) | **nieuw** account-gescoopt (§D4) |

**Eén architectuurlock:** passieve data voedt **nooit** `calcDomainScores`. Zodra een horloge de vitaalscore beweegt, is de score niet meer vergelijkbaar tussen gebruikers mét en zónder wearable, en is elke delta oncontroleerbaar. Passieve data is een **readout naast** de score, nooit een input erin. Zelfde patroon als de contextvelden bij verbinding en stress.

---

## G · Meetpunten

| Event | Fase | Payload | Hier lees je aan af |
|---|---|---|---|
| `movement_sit_trend_viewed` | spoor 1 | `{ surface, points }` | Of de trend überhaupt bekeken wordt — de goedkoopste toets vóór het wearable-traject |
| `movement_break_interval_set` | §C3 | `{ minutes, enabled }` | Welk interval mensen kiezen — en of ze het überhaupt aanzetten |
| `movement_break_logged` | §C3 | `{ source: "reminder" \| "self" }` | **De kernvraag.** Leidt de herinnering tot een onderbreking, of tikt alleen wie het toch al deed |
| `movement_break_reminder_dismissed` | §C3 | `{ }` | Het eerlijkste irritatiesignaal — kijk hiernaar vóór je aan push begint |
| `movement_ladder_layer_open` | ladder | `{ priority, state, surface }` | Of Prioriteit 1 met de nieuwe joint-conditie meer geopend wordt |
| `wearable.connect_started` / `_completed` | spoor 2 | `{ provider }` | Koppel-funnel, per bron |
| `wearable.disconnected` | spoor 2 | `{ provider, reason }` | Het eerlijkste kwaliteitssignaal dat er is |
| `wearable.tip_shown` / `_dismissed` | spoor 2 | `{ tip_id }` | Of niveau-2-tips helpen of irriteren |

**Geen PII, geen meetwaarden in payloads.** Specifiek verboden: stapaantallen, ziturenen of `MOV2_SIT`-waarden als event-parameter — dat zou een gezondheidsgegeven naar GA4 sturen. Het **aantal** onderbrekingen per dag hoort daar ook niet in: `movement_break_logged` vuurt per gebeurtenis, zonder teller in de payload. Het gekozen **interval** mag wel mee — dat is een voorkeur, geen meting.

**Meetpunt bij oplevering van spoor 1:** `movement_sit_trend_viewed` tegenover `domain_tool.snapshot_viewed{domain:"beweging"}` — daar lees je af of de trend een reden is om terug te komen. Blijft die verhouding laag, dan is het wearable-traject een dure oplossing voor een vraag die niemand stelt.

**Meetpunt bij oplevering van §C3:** `movement_break_logged` tegenover `movement_break_interval_set{enabled:true}` — daar lees je af of een herinnering gedrag verandert of alleen ruis toevoegt. Dit is bovendien de goedkoopste voorspeller voor het hele wearable-traject: wie zijn eigen onderbreking niet bevestigt, koppelt zijn horloge ook niet.

---

## H · Copy-lock

**Verboden in gerenderde tekst, aria-labels, eyebrows, tips en e-mails:**
te veel zitten · ongezond · risicovol · zorgelijk · sedentair (als label voor de gebruiker) · zitziekte · "10.000 stappen" als norm · **7.000 stappen als doel, drempel of streefwaarde** · elke urennorm voor zitten · elke individuele risico-uitspraak · vergelijking met andere gebruikers · elk supplement, merk of prijs in de zit-context · badge · streak · dagdoel op onderbrekingen · "je hebt je doel niet gehaald".

**Toegestaan:** de eigen antwoordlabels ("8–10 uur") · "voorkom veel stilzitten" mét bron · het eigen verloop · het eigen aantal onderbrekingen · populatie-uitspraken mét bron én met het woord populatie · "geen getalsnorm".

**Twee getallen die nu wél mogen, met vaste voorwaarden:**

| Getal | Voorwaarde |
|---|---|
| **7.000 stappen** | Alleen als populatiebevinding, **altijd mét de referentie van 2.000** en mét bron (Ding et al. 2025). Nooit als doel, drempel, balk of "je zit eronder". De toegestane strekking is: *de eerste duizenden stappen erbij tellen het zwaarst* |
| **15–30 minuten** | Alleen als **band** met bron, nooit als één aanbevolen getal en nooit als richtlijn. De toegestane strekking is: *in de studies gaf een korter interval het grootste acute effect* — plus de grens van het bewijs (postprandiale glucose en insuline, geen harde uitkomsten) |

**Toonijkpunt:** feit → mechanisme → actie. Nooit *"je moet minder zitten"*. Wel: *"Lang zitten weegt zwaarder als je weinig beweegt. Dat maakt dagelijkse beweging hier je eerste winst, niet een zwaarder schema."* En bij het ritme: *"Er is geen juist getal — er is een band. Kies wat past bij je werk."*

---

## I · Bouwvolgorde

| Slice | Inhoud | Poort | Kosten |
|---|---|---|---|
| **Z1** | Joint-conditie §C1 in `movement-ladder.ts` + copy §C2 · Prioriteit 1 krijgt een eerlijke staat | geen | **S** |
| **Z2** | Zit-trend uit bestaande check-ins (spoor 1) + `movement_sit_trend_viewed` | geen | **S/M** |
| **Z3** | ~~Verificatie §B3-getallen~~ **GEDAAN 13 aug** (§B3, §B4). Rest: evidence-blok in `leefstijlcheck-evidence.ts` uitbreiden met Ding 2025 + de onderbrekings-meta-analyses | geen | **S** |
| **Z3b** | **Aggregatiesplitsing** in `movement-session-log.ts`: `movementMinutes` (excl. onderbrekingen) + `breakCount`, consumenten nagelopen | geen | **S** — *voorwaarde voor Z3c* |
| **Z3c** | Onderbrekingsritme: interval-instelling (15/20/25/30, default uit) + browsertab-timer + "gedaan"-tik → `movement_session_log` + teruggave §C3.4 | Z3b | **M** |
| **Z4** | **POORT** — §15-acties 1 t/m 5 voor één bron; DPA; DPIA-revisie incl. §D4-intrekpad | ⚖️ | **L**, extern |
| **Z5** | OAuth-adapter voor die ene bron + dagtotalen + intrekpad | Z4 | **L** |
| **Z6** | Niveau-2-tips (§E1) achter eigen opt-in | Z5 | **M** |
| **Z7** | Extra bronnen — één DPA + registerregel per bron | Z4 per bron | **M** elk |
| **Z8** | PWA + Web Push voor de herinnering op telefoon | Z3c **plus** bewijs uit `movement_break_logged` | **L** |

Z1 t/m Z3c zijn samen kleiner dan Z4 alleen. Dat is het hele punt van de volgorde: het inhoudelijke werk levert de winst, het passieve werk levert de rijkdom — en pas ná Z2 en Z3c weet je of iemand zijn eigen verloop bekijkt en zijn eigen onderbreking bevestigt. Wie dat niet doet, koppelt zijn horloge ook niet.

**Z3b is geen bijzaak.** Hij staat vóór Z3c omdat de aggregatie anders stilzwijgend fout gaat en dat pas maanden later opvalt, in een reeks die dan al vervuild is.

---

## J · Open besluiten voor Dennis — zes

**J1 · Gaan Z1 t/m Z3 nu, los van het wearable-traject?**
Ze hebben geen poort, geen migratie en geen consent-wijziging, en ze maken Prioriteit 1 voor het eerst eerlijk. **Advies: ja**, en bundel ze met R1b/R2 uit het beweging-statusverdict. De ladder heeft dan één prioriteit met een echte, onderbouwde staat in plaats van een hardcoded demo-waarde.

**J1b · Gaat het onderbrekingsritme (Z3b + Z3c) mee in diezelfde reeks?**
Het is de eerste beweeghandeling die iemand op het moment zelf kan bevestigen, het bewijs eronder is sterker dan dit document eerst aannam (§B4), en het kost geen migratie en geen nieuwe consent. **Advies: ja, ná Z1/Z2 en met Z3b eerst.** Twee voorwaarden die niet onderhandelbaar zijn: de aggregatiesplitsing gaat vóór de eerste onderbrekingsrij (§C3.3), en de herinnering wordt een browsertab-timer met de zin *"loopt zolang dit tabblad open staat"* — geen PWA, geen push, niet nu (J5).

**J1c · Het stap-anker: alleen in de uitleg, of ook als zelfgerapporteerd veld?**
7.000 is nu hard onderbouwd (§B3) maar wij meten geen stappen. **Advies: route 1 — anker in de uitleg, geen invoerveld.** Een bandvraag toevoegen aan een check die al lang is, terwijl de zit-trend uit Z2 nog niet bewezen bekeken wordt, is de verkeerde volgorde. Herweeg dit zodra `movement_sit_trend_viewed` er is.

**J2 · Welke bron als eerste, als het wearable-traject doorgaat?**
Elke bron is een eigen DPA. De keuze is een afweging tussen dekking en verwerkersrisico:

| | Dekking NL 40+ | Verwerkersrisico |
|---|---|---|
| **Apple Health / Health Connect (client-side)** | Hoog, en dekt onderliggende merken mee | **Laagst** — §15.3 noemt client-side expliciet als voorkeur; mogelijk geen server-side doorgifte |
| Garmin / Fitbit / Oura / Whoop (server-side API) | Elk apart lager | Hoger — eigen API, eigen DPA, mogelijke doorgifte buiten EU |

**Advies: Health Connect / Apple Health client-side eerst.** Het is de enige route waarbij de data mogelijk niet als stroom naar onze server hoeft, en dat verlaagt zowel het DPA-werk als het restrisico in de DPIA aanzienlijk. Vereist wel een technische verkenning: zonder native app is de client-side route in een webcontext beperkt. **Die verkenning is de eerste stap, niet het DPA-werk.**

**J3 · Retentie — 90 dagen rollend, of ook geaggregeerde weekcijfers langer bewaren?**
Zonder langere aggregatie kun je "hoe ging dit sinds vorig jaar" niet beantwoorden — en dat is nou juist de vraag waarvoor mensen terugkomen. Met langere aggregatie bewaar je een gedragsarchief. **Advies: 90 dagen ruw + weekgemiddelden 24 maanden**, gelijk aan de intake-retentie, zodat er één bewaartermijn-verhaal is in plaats van twee.

**J4 · Krijgt niveau 3 (push/e-mail) een eigen opt-in, of schrappen we het niveau?**
§E1 stelt een eigen opt-in voor. Het alternatief is niveau 3 helemaal niet bouwen en de teruggave in het dashboard laten staan. **Advies: eerst niet bouwen.** Meet met `movement_sit_trend_viewed` of mensen uit zichzelf terugkomen. Een bericht sturen omdat de retentie tegenvalt, is de verkeerde volgorde — en het is de snelste route naar een uitgezette koppeling.

**J5 · Bouwen we PWA + Web Push voor de herinnering op telefoon (Z8)?**
Vandaag bestaat er geen service worker, geen manifest en geen push-infrastructuur (§C3.2). De browsertab-route dekt de bureau-usecase, en dat is precies de context waarin het zitgedrag ontstaat. **Advies: nee, en maak het afhankelijk van bewijs.** Pas als `movement_break_logged` laat zien dat de herinnering tot echte onderbrekingen leidt, is push een investering in iets dat werkt in plaats van een gok op notificaties. Let op de volgorde: PWA + push raakt óók de notificatie-opt-in en een eigen DPIA-regel, dus het is geen puur technische slice.

---

## K · Bronnen

- WHO, *Guidelines on physical activity and sedentary behaviour* (2020) — [who.int](https://www.who.int/publications/i/item/9789240015128)
- Gezondheidsraad, *Beweegrichtlijnen 2017* — [gezondheidsraad.nl](https://www.gezondheidsraad.nl/documenten/adviezen/2017/08/22/beweegrichtlijnen-2017)
- Ekelund et al. (2016), *Does physical activity attenuate … the association between sitting time and all-cause mortality?*, The Lancet — geharmoniseerde meta-analyse, >1 mln deelnemers
- Ekelund et al. (2019), *Dose-response associations between accelerometry measured physical activity and sedentary time and all cause mortality*, BMJ
- **Ding et al. (2025), *Daily steps and health outcomes in adults: a systematic review and dose-response meta-analysis*, The Lancet Public Health** — 57 studies / 35 cohorten; 7.000 vs 2.000 stappen; ✅ geverifieerd 13 aug 2026 — [thelancet.com](https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(25)00164-1/fulltext) · [PubMed 40713949](https://pubmed.ncbi.nlm.nih.gov/40713949/) · [duiding Univ. of Sydney](https://www.sydney.edu.au/news-opinion/news/2025/07/24/rethink-the-10000-a-day-step-goal-study-suggests.html)
- Paluch et al. (2022), *Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts*, The Lancet Public Health — leeftijdsafhankelijk plateau
- Dunstan et al. (2012), *Breaking up prolonged sitting reduces postprandial glucose and insulin responses*, Diabetes Care — [PMC3329818](https://pmc.ncbi.nlm.nih.gov/articles/PMC3329818/)
- **Netwerk-meta-analyse**, *Effects of interrupting prolonged sitting on postprandial glycemia and insulin responses*, Journal of Sport and Health Science — ✅ geverifieerd 13 aug 2026 — [sciencedirect.com](https://www.sciencedirect.com/science/article/pii/S2095254620301708)
- **Gale et al. (2025)**, *The acute effects of interrupting prolonged sitting with regular activity breaks on postprandial glucose and insulin*, Obesity Reviews — interval 15–20 min gaf de grootste daling — [Wiley](https://onlinelibrary.wiley.com/doi/10.1111/obr.70152)
- MDCG 2019-11 (rev. 1, 17 juni 2025), *Qualification and classification of software* — [health.ec.europa.eu](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_en_0.pdf)
- Intern: `docs/plan/ARCHITECTUUR_LIFESTYLE_PLANNER.md` §15–16 · `docs/core/DPIA.md` · `docs/core/VERWERKINGSREGISTER.md` · `docs/core/COMPLIANCE.md` · `docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` · `docs/design/BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md`
