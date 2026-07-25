# Blauwdruk — Stappenplan als roadmap + beweegvorm/sport-model

> **Status:** voorstel, klaar voor review. Opgesteld 23 juli 2026, geverifieerd tegen `main`.
> **Scope:** het beweeg-stappenplan (`view=stappenplan`) — breedte, mobiel, informatie-architectuur — plus het onderliggende model voor beweegvormen en sporten.
> **Geen codewijziging in dit document.**

## Relatie tot andere documenten

| Document | Rol |
|---|---|
| [`BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md`](BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md) | Bovenliggend: wat het beweegsysteem is. Blijft leidend. |
| [`BLAUWDRUK_DOMEIN_STAPPENPLANNEN.md`](BLAUWDRUK_DOMEIN_STAPPENPLANNEN.md) | Generalisatie naar slaap/stress/voeding. Deel 3 en 5 hieronder leveren daaraan. |
| [`claude-opus-stappenplan-roadmap-supplementen-prompt.md`](../cursors/claude-opus-stappenplan-roadmap-supplementen-prompt.md) | De Opus-prompt. Dit doc is de **hypothese die die prompt laat toetsen**, niet de uitkomst ervan. |

Waar dit document en de Opus-output botsen, wint de best onderbouwde — met één uitzondering: de vier besluiten in §0 zijn gelockt omdat ze op geverifieerde codebase-feiten rusten, niet op smaak.

---

## 0. Kernbesluit

Het stappenplan wordt een **roadmap met één as** in plaats van een instellingenscherm, en het krijgt een tweelaags model onder zich: **beweegvormen programmeren, sporten duiden**. Een sport krijgt nooit een eigen schema — hij krijgt een dekkingsprofiel over de beweegvormen, en wat de gebruiker leest is de *gat-uitspraak* die daaruit volgt.

Vijf gelockte besluiten:

1. **Breedte is maat, geen container.** Drie maten (lees / werk / as); proza rekt nooit mee met het scherm.
2. **De omslag naar tweekoloms hangt aan de midden-zone, niet aan het viewport.** Container query, want het contextpaneel bepaalt de beschikbare breedte en die staat niet in het viewport.
3. **Sport stuurt de copy, nooit het programma.** Het programma blijft kracht / duurbasis / ritme.
4. **Het huidige veld "Trainingsvorm" wordt gesplitst** in locatie (programma-sturend) en sport (copy-sturend). Het mengt die twee nu, en levert daardoor niets.
5. **Positie is afgeleid, route is gekozen.** Zie §5.1. Niemand schrijft "hoe ver ben ik" — het is een pure functie van (daily-log, routestructuur), één keer berekend en door alle oppervlakken gedeeld. De routestructuur heeft één schrijver: de gebruiker. Het systeem mag structuurwijzigingen vóórstellen (copy); alleen de gebruiker commit ze.

---

## 5.1 Positie is afgeleid, route is gekozen (lock 5)

Een route die meebeweegt met wat iemand behaalt én tegelijk aanpasbaar blijft, klinkt als een bron van fragmentatie. Dat is het alleen als je één feit door twee partijen laat schrijven. Split daarom twee assen die nu door elkaar lopen:

| As | Wat het is | Wie schrijft | Verandert door |
|---|---|---|---|
| **Positie** — "hoe ver ben ik" | afgeleid feit | **niemand** — pure functie van (daily-log, routestructuur) | loggen: je verdient je plek, je zet 'm niet |
| **Route** — "wat is mijn plan" | keuze | **alleen de gebruiker** | spoor/locatie/frequentie aanpassen |

Deze twee kunnen niet met elkaar in tegenspraak zijn, want het zijn verschillende assen. Verander je de route, dan **herprojecteert** je positie op de nieuwe structuur — hij reset niet, hij herleest de log. Positie schuift dus door een stabiele route terwijl je logt; de structuur muteert nooit vanzelf. Recalibratie na een hermeting is een **voorstel** (S5b, copy-only), nooit een automatische wissel.

**Geverifieerde naad die dit al schendt.** Er zijn nu twee bronnen voor de positie: een opgeslagen `current_phase_id` in `plan_progress` ([`plan-progress.ts:210`](../../src/lib/plan-progress.ts#L210)) die de route-ladder, het day-model en de active-plan-resolver de voorkeur geven (`progress?.currentPhaseId ?? computeCurrentPhaseId(...)`), naast een pure afleiding uit de daily-log die het stappenplan-body gebruikt. Dat is exact de fragmentatie die lock 5 verbiedt.

**Regel op codeniveau:** één `routeProgress`-afleiding, één keer berekend uit de daily-log, door Overzicht-route-rail, stappenplan-fase-as en programma gedeeld. De opgeslagen `current_phase_id` wordt hooguit een cache, nooit een tweede waarheid. Dit is wat slice S5 afdwingt (zie §7).

---

## 1. Waarom — drie geverifieerde feiten

**a. Het sportveld is dode input.** `MOVEMENT_SPORT_OPTIONS` biedt thuis · sportschool · wandelen/hardlopen · fietsen · zwemmen. In [`resolveRecommendedSessionVariant`](../../src/data/movement/session-catalog.ts#L110-L129) wordt `preferredSport` alleen in de kracht-tak gelezen, en daar telt uitsluitend `sportschool`. Bij startspoor conditie beslist alleen de kracht-score; bij dagelijks ritme niets. Wie "Fietsen" of "Zwemmen" kiest, krijgt hetzelfde plan als wie niets kiest.

**b. Erger nog: de keuze wordt gefingeerd.** [`resolveEffectivePlanProfile`](../../src/lib/movement-plan-profile.ts#L88-L101) vult een leeg `preferredSport` met een default (kracht → `thuis`, conditie → `wandelen`). De chip staat dus opgelicht alsof de gebruiker koos, terwijl hij niets koos — en de keuze doet niets.

**c. Breedte is onbegrensd.** [`<main>`](../../src/components/dashboard/cockpit/CockpitFrame.tsx#L229) heeft geen max-width en de plan-body is `w-full`. Met ingeklapt contextpaneel op 1920px wordt de leeskolom ~1600px. Het inklappen — bedoeld als ruimte-winst — maakt het scherm nu meetbaar slechter leesbaar.

**d. Vandaag en het stappenplan berekenen dezelfde fase uit twee verschillende bronnen.** Dit is de grootste vertrouwensbreuk in het domein, en de diagnose is subtieler dan "de tier-picker zit vast op fase 1" — die diagnose is achterhaald.

[`resolvePatternTrainingStepId`](../../src/lib/movement-prefs.ts#L148-L157) is namelijk wél fase-aware: hij roept `computeCurrentPhaseId` aan en gebruikt fase 1 alleen als fallback. Maar [`computeCurrentPhaseId`](../../src/lib/lifestyle-plan-eval.ts#L104-L115) wordt volledig gedreven door de step-states die je hem voert — met een lege map valt hij altijd terug op de eerste fase. En daar loopt het uiteen:

| Oppervlak | Voedt de fase-berekening met | Gevolg |
|---|---|---|
| Stappenplan | `loggedStepIds` uit de **daily-log** (vandaag + 7 dagen) | kan doorschuiven naar fase 2 |
| Vandaag-hero | `model.movementPlanProgress?.steps` uit **plan_progress** ([`loadPlanProgress`](../../src/lib/account-dashboard.ts#L630-L639)) | blijft op fase 1 zodra die bron leeg is |

Voor account-users is `plan_progress` juist de bron die is uitgezet (plan-checkboxes zijn daar read-only). De hero ziet dan geen enkele voltooide stap en blijft op fase 1 hangen, terwijl het plan ernaast fase 2 toont.

**Gevolg voor de fix:** niet de resolver herschrijven, maar hem dezelfde daily-log-afgeleide staat voeren die het plan al gebruikt. Dat is een bron-unificatie, geen fase-logica-wijziging — en het raakt `MovementTodayHero` plus het dashboard-model, niet `movement-prefs.ts`.

---

## 2. Het model: twee lagen

### 2.1 Waarom splitsen

Twee behoeften worden nu op één hoop gegooid:

| Behoefte | Wat de gebruiker wil | Wat het kost om te leveren |
|---|---|---|
| **Herkenning** — "dit gaat over mij" | Zijn sport terugzien in zijn plan | Laag: één regel copy per sport |
| **Programmering** — "dit verandert wat ik doe" | Advies dat op zijn sport is toegesneden | Hoog: content, dosering en evidence per sport |

Een platte sportenlijst belooft het tweede en levert het eerste. De splitsing maakt de belofte eerlijk: **de sport bepaalt wat je al afdekt, het plan vult wat je mist.**

### 2.2 Laag 1 — beweegvormen (gesloten, vijf)

Dit is waar dosis, opbouw en bron aan hangen. Dit is wat het stappenplan programmeert.

| id | Label | Wat het doet | Waarom het telt voor 40+ |
|---|---|---|---|
| `kracht` | Kracht | Spierbehoud, functionele kracht, botbelasting | Vanaf ~40 daalt spiermassa gestaag; kracht is de enige vorm die dat direct tegengaat |
| `duurbasis` | Duurbasis | Aerobe basis op matige intensiteit | Draagt herstelvermogen en dagenergie |
| `interval` | Interval | Korte inspanning boven je comfortgrens | Efficiënt, maar vraagt herstelruimte — later in de opbouw |
| `mobiliteit` | Beweeglijkheid | Bewegingsbereik onderhouden | Bepaalt of je kracht bruikbaar blijft in dagelijkse bewegingen |
| `dagelijks_ritme` | Dagelijks ritme | Minder aaneengesloten zitten | Werkt los van je training; het grootste deel van je dag |

> **Nog te doen bij implementatie:** dosering, contra-indicatie en bron per vorm uitschrijven volgens [`WRITING_VOICE.md`](../core/WRITING_VOICE.md). Dit doc legt de structuur vast, niet de eindcopy.

### 2.3 Beweegvorm ≠ sessie-variant

Dit onderscheid lost meteen het "sportschool"-probleem op:

```
beweegvorm (mechanisme, wat je lichaam nodig heeft)
   └── sessie-variant (uitvoerbaar, wat je deze week doet)
         gekozen op: locatie + niveau

kracht          → kracht-thuis | kracht-sportschool      ← locatie beslist
duurbasis       → conditie-wandelen | conditie-zone2      ← niveau beslist
dagelijks_ritme → dagelijks-ritme
interval        → (nog geen variant)
mobiliteit      → (nog geen variant)
```

De bestaande sessie-catalogus is hiervan de voorloper en past er zonder herschrijving in. Twee vormen hebben nog geen variant — die markeren we eerlijk in plaats van ze te verstoppen. "Sportschool" is dus een **locatie**, geen sport; dat is precies waarom het huidige veld rammelt.

### 2.4 Laag 2 — sport als dekkingsprofiel

```ts
type MovementFormId =
  | "kracht" | "duurbasis" | "interval" | "mobiliteit" | "dagelijks_ritme";

type FormCoverage = "dekt" | "deels" | "niet";

type MovementSportEntry = {
  id: string;
  label: string;
  status: "ready" | "beta" | "hidden";
  coverage: Record<MovementFormId, FormCoverage>;
  recognition: string;   // één zin, wat deze sport doet — feit, geen compliment
  gapNote?: string;      // optioneel accent bij de grootste gap
};
```

Een sport heeft géén `steps`, géén `duration`, géén `structure`. Kan hij niet krijgen ook — dat is het punt.

### 2.5 Startset (20 + "anders")

`●` dekt · `◐` deels · `○` niet — kolommen: **K**racht · **D**uurbasis · **I**nterval · **M**obiliteit · dagelijks **R**itme.

| Sport | K | D | I | M | R | Grootste gap |
|---|:-:|:-:|:-:|:-:|:-:|---|
| Hardlopen | ○ | ● | ◐ | ○ | ◐ | kracht |
| Wielrennen / MTB | ○ | ● | ◐ | ○ | ◐ | kracht (+ botbelasting) |
| Wandelen | ○ | ◐ | ○ | ○ | ● | kracht |
| Krachttraining / fitness | ● | ○ | ○ | ◐ | ○ | duurbasis |
| Voetbal | ◐ | ◐ | ● | ◐ | ○ | kracht |
| Tennis | ◐ | ◐ | ● | ◐ | ○ | duurbasis |
| Padel | ○ | ◐ | ● | ◐ | ○ | kracht |
| Golf | ○ | ◐ | ○ | ◐ | ● | kracht |
| Zwemmen | ◐ | ● | ◐ | ● | ○ | kracht (+ botbelasting) |
| Roeien / indoor rowing | ◐ | ● | ◐ | ○ | ○ | kracht |
| Hockey | ◐ | ◐ | ● | ◐ | ○ | kracht |
| Squash | ○ | ◐ | ● | ◐ | ○ | kracht |
| Vechtsport | ◐ | ◐ | ● | ● | ○ | duurbasis |
| Klimmen / boulderen | ● | ○ | ○ | ● | ○ | duurbasis |
| Yoga / pilates | ◐ | ○ | ○ | ● | ○ | duurbasis |
| Schaatsen | ◐ | ● | ◐ | ◐ | ○ | kracht |
| Volleybal | ◐ | ○ | ● | ◐ | ○ | duurbasis |
| Basketbal | ◐ | ◐ | ● | ◐ | ○ | kracht |
| Dansen | ○ | ◐ | ◐ | ● | ◐ | kracht |
| Watersport (surf / zeilen) | ◐ | ◐ | ○ | ◐ | ○ | duurbasis |

> **Belangrijk voorbehoud.** Dit is een *typisch* profiel van een sport, geen meting van deze gebruiker. Copy moet dat dragen ("wielrennen bouwt je duurbasis", niet "jij hebt genoeg duurbasis"). De matrix hierboven is een redactioneel startvoorstel en vraagt vóór livegang één review-ronde op de vormen `kracht` en `duurbasis` — dat zijn de twee waar we daadwerkelijk advies aan hangen.

**"Anders — welke?"** levert een vrij tekstveld dat *alleen data* is: geen advies, geen gap-uitspraak, geen invloed op het plan. Dat is het fysio-stambestand omgedraaid — niet 200 rijen vooraf onderhouden, maar de vraag laten bepalen welke vijf sporten je erbij bouwt.

### 2.6 Van dekking naar uitspraak

```
1. Neem de gekozen sporten (max 3) en bepaal per beweegvorm de BESTE dekking
   over die sporten heen (dekt > deels > niet).
2. Filter op vormen met dekking "niet".
3. Sorteer op prioriteit voor 40+:  kracht > duurbasis > dagelijks_ritme
                                    > mobiliteit > interval
4. Toon maximaal twee gaten. Bij nul gaten: toon de dekking als bevestiging,
   niet als "je bent klaar".
5. Het startspoor blijft leidend voor WAT het plan doet — de gap-uitspraak legt
   alleen uit WAAROM dat spoor logisch is.
```

Stap 5 is de veiligheidsklep: verandert de gap-analyse ooit van mening, dan verandert het plan niet mee zonder dat iemand daar bewust voor kiest.

**Copy-skelet:** `{Sport} {wat het dekt}. Wat het niet raakt is {gap} — {waarom dat telt}.`

Goed:
- "Wielrennen bouwt je duurbasis. Wat een fiets niet doet is je spieren en botten belasten — daarom begint je plan bij kracht."
- "Padel is intensief en met stops. Wat er meestal onder blijft is rustige duurinspanning waarin je nog kunt praten — dat is de basis waar je herstel op draait."

Afgekeurd:
- ~~"Als tennisser heb jij een verhoogd risico op schouderklachten."~~ — medische claim over een individu, en het werkt op angst.
- ~~"Jouw sport is niet genoeg."~~ — schuldtaal, en feitelijk scheef: geen enkele sport dekt alles.

### 2.7 De harde grens: wat mag welk veld sturen

| Veld | Stuurt het programma | Stuurt de copy | Toelichting |
|---|:-:|:-:|---|
| `startPattern` (spoor) | ✅ | ✅ | Bestaand, blijft leidend |
| `trainingLocation` (thuis / sportschool) | ✅ | — | Alleen binnen `kracht`: thuis- versus sportschool-variant |
| `weeklyFrequency` | ✅ | ✅ | Dosis |
| `MOV_STR` (kracht-score) | ✅ | — | Bestaand, bepaalt wandelen versus zone 2 |
| `sports[]` | ❌ | ✅ | Gap-lens, nadruk en volgorde — nooit de sessie-variant |

**Locatie kent precies twee waarden: thuis en sportschool.** Geen "buiten". Buiten trainen is geen programma-locatie maar een sport plus een beweegvorm (meestal duurbasis) — het hoort dus in `sports[]`, niet in `trainingLocation`. Een derde locatie-waarde zou exact de vermenging herintroduceren die §2.8 juist opruimt. In het sheet staan daarom **twee losse controls**: "Waar train je" (2 chips) en "Wat doe je al" (sport-chips).

Dat maakt de sportlaag **structureel laag-risico**: een fout dekkingsprofiel geeft een suboptimale zin, nooit een verkeerd trainingsadvies. En het is de reden dat de sportlaag ná de rest gebouwd kan worden zonder iets te blokkeren.

### 2.8 Velden en migratie

Voorkeuren leven als **string-keys in de `answers`-jsonb** van de laatst geclaimde intake-sessie ([movement-prefs route](../../src/app/api/account/movement-prefs/route.ts)); `parseAnswers()` is number-only en ziet ze nooit, dus scoring blijft onaangeraakt.

**Gevolg: geen SQL-migratie, geen nieuwe tabel, geen Dashboard-SQL-Editor-stap.** Nieuwe keys erbij zetten is het hele werk.

| Nu | Straks |
|---|---|
| `preferredSport: "thuis" \| "sportschool" \| "wandelen" \| "fietsen" \| "zwemmen"` | `trainingLocation: "thuis" \| "sportschool" \| null` + `sports: string[]` (max 3) |

Afleiding voor bestaande waarden — géén backfill, puur bij lezen:

```
"thuis"        → trainingLocation "thuis",       sports []
"sportschool"  → trainingLocation "sportschool", sports []
"wandelen"     → trainingLocation null,          sports ["wandelen"]
"fietsen"      → trainingLocation null,          sports ["wielrennen"]
"zwemmen"      → trainingLocation null,          sports ["zwemmen"]
```

De resolver leest eerst de nieuwe keys en valt terug op de afleiding. De oude key blijft één release staan en wordt daarna niet meer geschreven.

**Weg met de stille default.** `defaultSportForPattern` verdwijnt: `trainingLocation` mag leeg blijven en de UI toont dan "nog niet gekozen" in plaats van een opgelichte chip die de gebruiker nooit aanraakte. Voor het *programma* verandert dat niets — de kracht-variant valt zonder locatie terug op thuis, precies zoals nu, alleen zonder te doen alsof dat een keuze was.

### 2.9 Status en groei

Elke sport krijgt `status`, in de geest van de `detailStatus: "coming_soon"` die de sessie-catalogus al kent:

| Status | Betekenis | UI |
|---|---|---|
| `ready` | Dekkingsprofiel gereviewd | Selecteerbaar, gap-uitspraak zichtbaar |
| `beta` | Profiel plausibel, niet gereviewd | Selecteerbaar, gap-uitspraak voorzichtiger geformuleerd |
| `hidden` | Nog niet klaar | Rendert niet |

Groeiregel: een sport gaat van `hidden` naar `beta` zodra iemand hem invult bij "anders", en van `beta` naar `ready` na een review-ronde op `kracht` en `duurbasis`. Zo bepaalt de vraag het aanbod, in plaats van andersom.

### 2.10 Medische grens

Sport-specifiek advies glijdt makkelijk richting blessurepreventie en behandeling. De grens: **we beschrijven wat een sport belast en wat hij onbelast laat. We voorspellen geen klachten, stellen niets vast en behandelen niets.**

Nooit schrijven:
- ~~"Bij tennis krijg je vaak een tenniselleboog — doe deze oefening om dat te voorkomen."~~
- ~~"Jouw houding op de fiets veroorzaakt je rugklachten."~~
- ~~"Deze oefeningen herstellen je knie."~~

### 2.11 Wat dit expliciet niet wordt

- Geen 200-rijen-stambestand met CRUD. Het fysio-EPD dat als inspiratie diende, heeft een praktijkbeheerder en gebruikt sport als registratielabel zonder advies; wij hebben geen beheerder en een label zonder advies heeft hier geen bestaansrecht.
- Geen sport-specifieke trainingsschema's.
- Geen techniek-, tactiek- of wedstrijdadvies.
- Geen tweede plek waar iets wordt afgevinkt.

---

## 3. Breedte: maat, geen container

### 3.1 De ladder

| Maat | Waarde | Waarvoor |
|---|---|---|
| **Lees** | ~68 tekens (≈620–680px) | Fase-intro, mechanisme, medische grens, stap-rationale |
| **Werk** | plafond ~1040px | Programma-kaart, stap-rijen, profielblok |
| **As** | 100% van de midden-zone | Fase-as en positie-header |

Alleen de as verdient volle breedte: daar *betekent* horizontale ruimte iets (tijd). Overal elders is extra breedte een leesbaarheidsprobleem.

### 3.2 Drie regimes — op de midden-zone, niet op het viewport

Het contextpaneel bepaalt hoe breed de midden-zone is, en dat staat niet in het viewport: op 1536px met open contextpaneel is de midden-zone ~936px, met ingeklapt paneel ~1240px. Viewport-breakpoints kunnen dat verschil per definitie niet zien, en `contextCollapsed` is lokale state in [`CockpitFrame`](../../src/components/dashboard/cockpit/CockpitFrame.tsx#L88) die de children niet bereikt.

**Daarom: container query op de midden-zone.** Tailwind 4 heeft dat ingebouwd; het project gebruikt het nog nergens, dus dit is de eerste toepassing — bewust, want het alternatief is collapsed-state door de hele boom draden.

| Container-breedte | Layout |
|---|---|
| `< 560px` | Eén kolom, alles binnen padding. Geen horizontale scroll. |
| `560–1080px` | Eén kolom; proza op leesmaat, kaarten op werkmaat. |
| `> 1080px` | **Tweekoloms:** as-kolom 260–300px sticky links, inhoud rechts op lees-/werkmaat. |

Daarmee wordt inklappen van de context een echte upgrade: je krijgt de fase-as er permanent naast, in plaats van langere regels.

```
┌─ rail ─┬─ midden-zone (> 1080px) ──────────────────────────┬─ (context ingeklapt)
│        │ ┌─ as (sticky) ─┐ ┌─ inhoud (leesmaat) ─────────┐ │
│ Vandaag│ │ ● Deze week   │ │  Fase 2 · Week 2–4          │ │
│ Stappen│ │   afgerond    │ │  ─────────────────────────  │ │
│ Check  │ │ ◉ Week 2–4    │ │  Wat deze fase doet: …      │ │
│ Suppl. │ │   nu          │ │                             │ │
│ Gids   │ │ ○ Week 4–12   │ │  [ Programma-kaart ]        │ │
│        │ │               │ │  [ Stap ]  [ Stap ]         │ │
└────────┴─┴───────────────┴─┴─────────────────────────────┴─┘
```

---

## 4. Mobiel (375px)

Regels:

1. **Eerste viewport is positie, geen configuratie.** Volgorde: positieregel ("Fase 2 van 3 · week 3") → één zin wat deze fase doet → programma-kaart.
2. **Fase-as als drie segmenten, geen chip-rij.** Alleen het actieve segment krijgt een vol label; de andere twee de korte horizon ("2–4", "4–12"). Dan passen drie fasen zonder horizontale scroll.
   > **Praktijkbevinding uit het prototype:** dit klopt, maar zonder marge. Bij drie fasen houdt elk segment op 375px ongeveer 91px over — genoeg voor "Week 4–12" plus de statusregel. **Bij een vierde fase valt deze aanname om** en moet de as terug naar de tekentafel. De regel geldt dus voor drie fasen, niet in het algemeen.
3. **Nul horizontaal scrollende elementen.**
4. **Selectie vervangt, stapelt niet.** Eén fase-paneel tegelijk — dit vervangt het huidige gedrag waarbij elke aangeraakte fase open blijft staan.
5. **Meescrollende positie-header** met maximaal drie elementen (fase · week · terug naar Vandaag). Geen tweede navigatiebalk; hij vervangt de statische diepte-breadcrumb bij scroll.
6. **Profiel achter één knop** ("Plan aanpassen") die een bottom sheet opent. Tik-doelen ≥ 44px.

---

## 5. Informatie-architectuur van het stappenplan

Volgorde, mobile-first:

| # | Sectie | Functie | Bron |
|---|---|---|---|
| 1 | **Positie-header** | Waar sta ik, en waarom dit spoor | Actieve fase + anker + startspoor |
| 2 | **Fase-as** | Navigatie langs de tijd, met "je bent hier" | Plan-template + afgeleide staat |
| 3 | **Programma-kaart** | Wat doe ik deze weken, en waarom dit | Sessie-catalogus + locatie + frequentie |
| 4 | **Sport-lens** | Wat dek je al af, wat mist er | Dekkingsprofiel (§2.6) |
| 5 | **Fase-paneel** | De stappen, read-only, staat uit de daily-log | Plan-template + daily-log |
| 6 | **Plan aanpassen** | Spoor, locatie, frequentie, sporten | movement-prefs |
| 7 | **Mechanisme + grens** | Onderbouwing en medische grens | Plan-template |

Wat verdwijnt van dit scherm:

| Weg | Waarheen |
|---|---|
| Score-ring + trend ("Waar je staat") | Alleen nog op Vandaag — hier vervangen door de positie-header |
| Lege intro-tegel "Jouw stappenplan" | Geschrapt; de positie-header doet dit werk |
| Banner "Afvinken doe je in VANDAAG" | Als rustige regel ín de positie-header, niet als onderbrekend blok |
| Chip-rijen als primaire inhoud | Naar het bottom sheet / de drawer (sectie 6) |

---

## 6. Bestanden en datavorm

| Wat | Waar | Nieuw? |
|---|---|---|
| Beweegvormen | `src/data/movement/movement-forms.ts` | nieuw |
| Sport-catalogus | `src/data/movement/sport-catalog.ts` | nieuw |
| Gap-berekening | `src/lib/movement-sport-lens.ts` | nieuw |
| Sessie-catalogus | `src/data/movement/session-catalog.ts` | bestaand — sportvelden eruit |
| Profiel + migratie-afleiding | `src/lib/movement-plan-profile.ts` | bestaand — uitbreiden |
| Plan-body (nu 607 regels) | `src/components/dashboard/beweging/` | opsplitsen per slice |

Geen admin-CRUD. Die verdient zichzelf pas terug bij een redactie met meerdere mensen; `/admin` is bovendien de PartnerDesk-shell, waar een content-stambestand niet vanzelf thuishoort.

---

## 7. Slices

| PR | # | Naam | Raakt het model? | Levert |
|:-:|---|---|---|---|
| 1 | **S0** | Breedte-ladder | nee | Lees/werk/as-maten + container-query-omslag op de bestaande plan-body |
| 2 | **S1** | Positie-header | nee | Fase-positie + anker; score-ring en intro-tegel weg |
| 3 | **S2** | Fase-as + fase-paneel | nee | Vervangt de tabstrip; selectie vervangt, tweekoloms bij brede container |
| 4 | **S3** | Programma-kaart | nee | Sessie-catalogus als coach-kaart |
| 5 | **S4** | Plan-aanpassen-sheet + veldsplitsing | **ja** | Locatie los van sport; stille default weg |
| 6 | **S6** | Sport-lens | **ja** | Beweegvormen + sport-catalogus + gap-uitspraak |
| 7 | **S5** | Positie-unificatie | nee (gedrag) | Eén afgeleide `routeProgress` uit de daily-log; opgeslagen `current_phase_id` wordt cache. Dwingt lock 5 af (§5.1) |
| 8 | **S5b** | Hermeting-haak | deels | Delta → copy in de positie-header, géén automatische planwijziging |
| later | **S7** | Support-strip (supplementen) | ja | Na het supplementen-verdict uit de Opus-analyse |

**Volgorde en afhankelijkheden.** S0 is de eerste PR: goedkoop, direct zichtbaar op groot scherm, raakt geen datamodel. S1 en S3 kunnen daarna parallel. S2 wacht op S0 (het tweekoloms-gedrag hangt aan de breedte-ladder). S6 wacht op S4 (heeft het gesplitste veld nodig). S5 en S5b staan bewust ná de sport-lens: ze leveren minder zichtbare waarde per regel code, en S5b bouwt op de positie-header uit S1.

S0–S3 zijn puur visueel en goedkoop terug te draaien. S4, S6 en S7 raken opgeslagen data; S5 raakt gedrag dat twee oppervlakken deelt — alle vier vragen een aparte review.

### Componentsplitsing

De plan-body van 607 regels gaat uit elkaar in vier bestanden. Doe dit **verspreid over de slices, niet als losse opruim-PR** — de risicovolle plek is [`getStepState`](../../src/components/dashboard/beweging/MovementPlanDeepBody.tsx#L189-L192) en de daily-log-hydratie eromheen; die blijft in de shell en wordt niet verplaatst.

| Bestand | Ontstaat bij | Bevat |
|---|---|---|
| `MovementPlanRoadmap.tsx` | S1 / S2 | Shell, positie-header, fase-as, fase-paneel, daily-log-hydratie |
| `MovementProgramCard.tsx` | S3 | Programma-kaart uit de sessie-catalogus |
| `MovementSportLens.tsx` | S6 | Dekkingsmeter + gap-uitspraak |
| `MovementPlanAdjustSheet.tsx` | S4 | Spoor, locatie, frequentie, sporten |

### S5b — hermeting-haak (dun, bewust)

De closed loop hermeting → plan bestaat niet: fase-promotie draait op step-states, niet op een nieuwe `MOV_STR`. De delta-berekening bestaat wél ([`movement-delta.ts`](../../src/lib/movement-delta.ts): `movementDirection`, `movementStartStatement`). Deze slice verbindt die twee — op copy-niveau.

| Trigger | Transformatie | Planeffect |
|---|---|---|
| Hermeting voltooid, richting ≠ stabiel | Eén zin uit `movementStartStatement()` in de positie-header | alleen copy |
| `MOV_STR` kruist de drempel (≥ 3) | Suggestie om de conditie-variant te herzien (wandelen ↔ zone 2) | zacht: een regel "plan bekijken", geen automatische wissel |
| Hermeting + fase 3 in beeld | "Verankeren en meten"-copy gekoppeld aan de trend | alleen copy |

Uitdrukkelijk **niet** in v1: automatische fase-promotie op score, het sport-dekkingsprofiel herberekenen per individu, en de `lp_*`-planner-engine.

### Acceptatiecriteria per slice

**S0 — Breedte-ladder**
- [ ] Geen proza-blok in het stappenplan is breder dan ~68 tekens, bij welke schermbreedte dan ook.
- [ ] Bij ingeklapt contextpaneel op ≥1080px midden-zone verschijnt de tweekoloms-layout; bij open paneel blijft het één kolom op dezelfde viewport-breedte.
- [ ] Op 375px is er geen horizontaal scrollend element.
- [ ] De omslag werkt zonder dat `contextCollapsed` door de componentboom wordt gedraaid.

**S1 — Positie-header**
- [ ] De score-ring is niet meer zichtbaar op `view=stappenplan`; op Vandaag ongewijzigd.
- [ ] De eerste viewport op 375px toont fase-positie, week en één zin over deze fase — geen chip-rij.
- [ ] De afvink-verwijzing staat als één regel in de header, niet als los blok.

**S2 — Fase-as + paneel**
- [ ] Eén fase-paneel tegelijk; een tweede fase openen vervangt de eerste.
- [ ] De actieve fase is zonder kleurwaarneming herkenbaar (niet alleen via accentkleur).
- [ ] Drie fasen passen op 375px zonder horizontale scroll.
- [ ] De afgeleide stap-staat uit de daily-log is ongewijzigd — geen enkel afvinkbaar element toegevoegd.

**S4 — Veldsplitsing**
- [ ] Bestaande waarden leiden correct af volgens §2.8, zonder backfill.
- [ ] Een gebruiker die nooit koos, ziet geen opgelichte chip.
- [ ] De aanbevolen sessie-variant is voor bestaande gebruikers identiek aan vóór de slice.

**S5 — Positie-unificatie (dwingt lock 5 af)**
- [ ] Er is één `routeProgress`-afleiding uit de daily-log; Overzicht-route-rail, stappenplan-fase-as en day-model consumeren die, niet elk een eigen `currentPhaseId`.
- [ ] De opgeslagen `current_phase_id` wordt niet meer als voorkeur boven de afleiding gelezen (hooguit als cache met de afleiding als waarheid).
- [ ] Hero en stappenplan tonen dezelfde actieve fase, met een testcase voor een account-user die stappen in de daily-log heeft maar niets in `plan_progress`.
- [ ] `resolvePatternTrainingStepId` is functioneel ongewijzigd; alleen zijn invoer verandert.
- [ ] Anonieme intake-users houden hun huidige gedrag.
- [ ] De positie is nergens handmatig te zetten — alleen de routestructuur (spoor/locatie/frequentie) is bewerkbaar.

**S6 — Sport-lens**
- [ ] Sport wijzigen verandert nooit de aanbevolen sessie-variant.
- [ ] Maximaal twee gaten in beeld; bij nul gaten een bevestigende formulering, geen "klaar".
- [ ] `hidden`-sporten renderen niet; `beta` gebruikt de voorzichtiger formulering.
- [ ] "Anders" slaat vrije tekst op zonder gap-uitspraak of planeffect.
- [ ] Geen enkele copy-regel voorspelt een klacht of stelt iets vast.

---

## 8. Meetplan

Hergebruik waar mogelijk: `movement_plan_profile_updated` (bestaat), `plan.viewed` (bestaat), `dashboard_context_collapsed` / `_expanded` (bestaan — deze geven al antwoord op "wordt de context ingeklapt?", wat S0 rechtvaardigt).

Nieuw, per slice te registreren:

| Slice | Event | Payload | Vraag die het beantwoordt |
|---|---|---|---|
| S2 | `plan.phase_opened` | `domain`, `phase_id`, `is_active` | Kijken mensen vooruit, of alleen naar nu? |
| S4 | `movement_location_selected` | `location` | Wordt locatie überhaupt gekozen als de default weg is? |
| S6 | `movement_sport_selected` | `sport_ids` (max 3), `is_other` | Welke sporten, en hoe vaak "anders"? |
| S6 | `movement_gap_shown` | `gap_forms` | Welk gat zien mensen het vaakst — stuurt de content-roadmap |

Elk nieuw client-event vereist registratie op drie plekken: `src/lib/events.ts`, `src/lib/intake-events-client.ts` en de allowlist in `src/app/api/intake/events/route.ts`. Geen PII, geen vrije tekst van de gebruiker in GA4 of Clarity — het "anders"-veld gaat alleen als boolean mee.

Meetpunt: `movement_sport_selected` + `movement_gap_shown` — daar lees je af of de sportlaag herkenning oplevert en welke sporten je erbij moet bouwen.

---

## 9. Open vragen

1. **Meerdere sporten of één?** *Aanbeveling: maximaal drie.* Een 45-jarige doet vaak fitness én fietsen; met één sport klopt de gap-analyse niet. Drie is genoeg en houdt de uitspraak scherp.
2. **Waar leeft de sport-lens — Vandaag of stappenplan?** *Aanbeveling: stappenplan.* Vandaag gaat over uitvoeren, het plan over begrijpen. De lens is uitleg.
3. **Vragen we sport in de intake of pas in het plan?** *Aanbeveling: pas in het plan.* De intake is al lang, en de lens heeft pas betekenis náást een plan.
4. **Wat doen `interval` en `mobiliteit` zonder sessie-variant?** *Aanbeveling: zichtbaar als vorm, gemarkeerd als "nog niet in je plan".* Verbergen maakt de gap-analyse onbetrouwbaar; net doen alsof er een programma is, is erger.
5. **Botbelasting: zesde beweegvorm of attribuut van kracht?** *Aanbeveling: attribuut.* Vijf vormen is al de bovengrens van wat je uitlegt; botbelasting hoort inhoudelijk bij kracht en komt terug in de copy bij zwemmen en fietsen.
6. **Reviewt iemand de dekkingsmatrix vóór livegang?** *Aanbeveling: ja, één ronde op `kracht` en `duurbasis`.* Dat zijn de enige twee vormen waar we advies aan hangen; de rest mag `beta` blijven.

---

## 10. Anti-patterns

Dit ontwerp vermijdt expliciet:

- Een keuzeveld dat het advies niet verandert (het huidige sportveld).
- Een opgelichte chip die een keuze suggereert die de gebruiker niet maakte.
- Proza dat meerekt tot 1600px.
- Een stambestand van 200 rijen zonder inhoud erachter.
- Sport-specifieke claims over klachten of blessures.
- Een tweede plek om af te vinken.
- Een accordeon die stapelt in plaats van een as die navigeert.
- Een disclaimer-banner die als inhoud wordt gepresenteerd.

---

Meetpunt: geen — dit document activeert niets. De events uit §8 worden per slice geregistreerd bij implementatie.
