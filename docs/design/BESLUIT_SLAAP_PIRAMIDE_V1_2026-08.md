# BESLUIT — Slaap v1: prioriteitenladder + check-in readout

> **Status.** Ontwerpbesluit, augustus 2026. Nog niet gebouwd.
> **Prebuild.** [`slaap-piramide-v1-prebuild-2026-08.html`](slaap-piramide-v1-prebuild-2026-08.html) — VQ · VR · VL, states F1–F6.
> **Parity.** Zelfde surface-contract als beweging R0 (`beweging-checkin-readout-prebuild-r0-2026-08.html`), eigen inhoud.

**Noordster.** Eerst voldoende slaap mogelijk maken. Daarna reguleren. Vervolgens verstorende factoren aanpakken. Pas daarna optimaliseren — en bij echte klachten gericht behandelen.

---

## Correcties op de opdracht (geverifieerd in repo)

| Aanname | Werkelijkheid |
|---|---|
| VL-pad `?tab=voortgang&screen=slaap` | `buildDashboardVoortgangHref("domein", null, "slaap")` → `/dashboard?tab=voortgang&screen=domein&domein=slaap` ([dashboard-url.ts:171](../../src/lib/dashboard-url.ts#L171)) |
| Nieuw `VoortgangDomeinSlaapScreen` | [`VoortgangDomeinScreen.tsx`](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx) is al generiek over `PillarId` met een `isMovement`-tak → slaap wordt een `isSleep`-tak, geen nieuw scherm |
| "intake licht op VQ/VR" | `--intake-bg: #1A2E1A` — intake is donkergroen ([globals.css:49](../../src/app/globals.css#L49)). Dashboard `#132414`. Beide donker |
| `src/lib/movement-ladder.ts` als patroon | Bestaat niet; het patroon is [`beweging-advies-treden.ts`](../../src/lib/beweging-advies-treden.ts) + [`session-catalog.ts`](../../src/data/movement/session-catalog.ts) |
| L6-gate = "aandacht-signaal op laag 1–3" | Intern tegenstrijdig met "eerst gelegenheid, dan potje". Opgelost als tweedelige poort — zie §E.6 en §H |

---

## A · Diagnose huidige slaap-UX

Vergelijking van de result-tak van [`SleepCheckin.tsx:203-410`](../../src/components/intake/SleepCheckin.tsx#L203-L410) met het gewenste C.1-model en met beweging R0.

| Blok | Nu (slaap) | Beweging R0 | Gewenst (slaap v1) |
|---|---|---|---|
| Kop | "Jouw slaap-overzicht" + "Op basis van hoe je nu slaapt" | "Jouw beweegcheck" + gemeten-datum | "Jouw slaapcheck" + "Wat je antwoorden laten zien · gemeten vandaag" |
| Conclusie | `headline` + `statement` + `secondaryHint`, in eigen terra-kaart | `.checkin-readout`: feit → antwoordlabel → statement → delta → implicatie → routing | Identiek aan R0, andere inhoud |
| Acties | `<ol>` "Jouw volgende 3 acties" uit `SLEEP_CHOICES` of `MAINTENANCE_ACTIONS` | geen actielijst | **Weg.** Vervangen door prioriteitenprofiel + één experiment |
| Focus | "Je grootste winst zit nu in {label}" op dimensie, niet op laag | focus = zwakste stuurbare dimensie | focus = zwakste **laag**, bottom-up opgelost |
| Keuzeknoppen | 4 toggle-knoppen + PATCH `chosen_actions` | geen | **Weg van VR.** Handelen hoort op VL/L1 |
| Supplement | `magnesiumGate()` bij focus inslapen/doorslapen → terra-kaart met claimtekst | geen supplement op check-in | **Weg van VR.** Alleen laag 6 op VL, gegate, label-only |
| Delta | `start.statement` uit `sleepStartStatement()` — één regel op totaalscore | per-dimensie delta met antwoordlabels + `also` + `start` | Per-dimensie delta met antwoordlabels; totaalregel blijft als `start` |
| Vervolg-CTA | `/intake/plan/sleep` ("Open je slaapplan") + `SleepDashboardCta` onderaan | één terra-knop naar Voortgang | Eén terra-knop "Bekijk je slaapbeeld →" naar Voortgang › Slaap |

**Waarom het nu supplement-first voelt.** Drie mechanismen stapelen. (1) `assessSleep()` kiest de zwakste van drie *dimensies* — inslapen, doorslapen, regelmaat — en twee daarvan hangen een magnesium-kaart onder het resultaat ([sleep-assessment.ts:110-113](../../src/lib/sleep-assessment.ts#L110-L113)). De kans dat een gebruiker met slaapklachten een productlink ziet is daarmee structureel hoog. (2) Slaapduur en grip zitten *niet* in `assessSleep()` — de laag die er het meest toe doet, kan dus nooit de focus worden. Iemand die 5 uur slaapt en moeilijk inslaapt krijgt "inslapen" als winst en magnesium als suggestie, terwijl het antwoord "je slaapt vijf uur" is. (3) De actielijst is een menu van laag 3- en laag 4-tips (telefoon, dimmen, koel houden) zonder volgorde — omgeving en gedrag komen visueel vóór gelegenheid en ritme.

Netto: het scherm beantwoordt "wat kan ik vanavond doen" terwijl de vraag "waar zit mijn winst" is. Dat is geen styling-probleem maar een ontbrekend laagmodel.

---

## B · Informatie-hiërarchie per surface

Prioriteit 1 = must see boven de vouw.

### VQ — `/intake/slaap`, één vraag per scherm

| # | Blok | Prio | Max | Status |
|---|---|---|---|---|
| 1 | Voortgangsbalk (3px) | 2 | — | Behoud |
| 2 | Vraagnummer + "Slaap" | 3 | 1 regel | Behoud |
| 3 | Vraag (h1, serif) | 1 | 2 regels | Behoud |
| 4 | Benchmark-regel (alleen `duur`) | 2 | 2 regels | **Nieuw** |
| 5 | Antwoordopties | 1 | 5 × 1 regel | Behoud |
| 6 | "Waarom vragen we dit?" — dicht | 2 | 1 regel dicht / 4 open | **Nieuw** |
| 7 | Terug | 3 | — | Behoud |

Weg: "Vraag X van 10" onder de kop — dubbel met de balk en het nummer, en het is de enige plek waar een ordinaal telt.

### VR — check-in resultaat

| # | Blok | Prio | Max | Status |
|---|---|---|---|---|
| 1 | Kop + gemeten-datum | 2 | 2 regels | Herschreven |
| 2 | `.checkin-readout` (feit → antwoord → statement → delta → implicatie → CTA) | 1 | ~14 regels | **Nieuw, gedeeld** |
| 3 | Feitelijke rijen — 4 zichtbaar + "Toon alle antwoorden" | 2 | 4 × 3 regels | **Nieuw** |
| 4 | Prioriteitenprofiel (winst / op orde / nog niet nu) | 2 | 3 banden | **Nieuw** |
| 5 | Eerste experiment | 3 | 4 regels | **Nieuw** |
| 6 | Footnote (7+ uur, zelfrapportage, onderbouwing) | 4 | 3 regels | **Nieuw** |

**Verdwijnt op VR:** de genummerde actielijst (blok 2 nu), de vier keuzeknoppen + `chosen_actions`-PATCH, de magnesium-kaart, de `deepen`-kaart, de losse band-chips-rij, de `regie`-reflectie als apart blok (gaat op in `implicatie`), de contextHints-lijst (gaat op in de feitelijke rijen), en de tweede CTA (`/intake/plan/sleep` + `SleepDashboardCta` → één CTA).

### VL — Voortgang › Slaap

| # | Blok | Prio | Max | Status |
|---|---|---|---|---|
| 1 | Tabbalk + terug + "Slaap" | 3 | — | Bestaand patroon |
| 2 | Stand-tegel (gauge + bron + gemeten) | 2 | 4 regels | Bestaand patroon |
| 3 | SSOT-vlag + `.checkin-readout` (identiek) | 1 | ~14 regels | **Nieuw, gedeeld** |
| 4 | Piramide-chrome ("niet omhoog klimmen") | 1 | 3 regels | **Nieuw** |
| 5 | Rail van zes lagen, winst-laag open | 1 | 6 rijen | **Nieuw** |
| 6 | Crossover-callout tussen 4 en 5 | 2 | 3 regels | **Nieuw** |
| 7 | Zelf-inschatting (max laag 5) | 4 | 3 regels | **Nieuw** |
| 8 | Tweede-as-uitleg (collapsed) | 5 | — | **Nieuw** |

---

## C · Vraag-uitleg contract

```ts
type SleepQuestionHelp = {
  fieldId: SleepFieldId;
  helpTitle: string;          // altijd "Waarom vragen we dit?"
  helpBody: string;           // 2-3 zinnen
  helpAnchor: string;         // "Hoort bij laag N · <laagnaam>"
  benchmarkLabel?: string;    // uitsluitend duur
  benchmarkDisclaimer?: string;
};
```

UI: `<button aria-expanded>` + `<div hidden>`, default dicht. Nooit auto-open.

| Veld | helpAnchor | helpBody (kern) |
|---|---|---|
| `duur` | Laag 1 · Slaapgelegenheid | Enige vraag met externe maatstaf ernaast. Niet als norm gebruikt maar om te bepalen of er überhaupt genoeg gelegenheid is om te herstellen. Onder de zes uur levert sleutelen aan avond of slaapkamer weinig op. |
| `SLP_CONS` | Laag 2 · Ritme & slaapgewoonten | Redelijk vaste opsta-tijd is een sterker anker dan een exacte bedtijd. Geen perfectie: half uur speling is normaal, grote verschuivingen tussen dagen niet. Bepaalt of we bij ritme of bij avond beginnen. |
| `grip` | Laag 2 · Ritme & slaapgewoonten | Gaat over je gevoel van invloed, niet over je slaap zelf. Weinig grip is bij veel mannen het punt waarop mensen naar een middel grijpen; wij gebruiken het om te bepalen hoe klein de eerste stap moet zijn. |
| `winddown` | Laag 3 · Gedrag & timing | Je zenuwstelsel schakelt niet op commando. Twintig tot dertig minuten herkenbare afbouw is voor de meesten genoeg — het gaat om volgorde, niet om inhoud. Weegt pas als ritme en duur staan. |
| `nightload` | Laag 3 · Gedrag & timing | Wakker liggen met een draaiend hoofd is iets anders dan niet kunnen inslapen door omgeving of ritme. Bepaalt of we bij avondafbouw of bij de laag daaronder uitkomen. Geen diagnose. |
| `morninglight` | Laag 3 · Gedrag & timing | Licht in de ochtend is het sterkste signaal waarmee je je klok zet, en daarmee indirect je inslaaptijd 's avonds. Bewolkt buiten is nog altijd veel meer licht dan binnen. Gratis en snel meetbaar. |
| `SLP_ONSET` | Laag 3 **of** laag 5 — hangt af van je slaapduur | Inslaaptijd zegt op zichzelf weinig; in combinatie met slaapduur veel. Lang wakker liggen mét genoeg tijd in bed is een ander verhaal dan na een korte drukke dag. |
| `SLP_WAKE` | Laag 3 **of** laag 5 — hangt af van je slaapduur | Wakker worden is normaal; wakker blíjven liggen is het signaal. Samen met inslapen en hoe je wakker wordt bepaalt dit of het over gedrag gaat of over aanhoudende klachten. |
| `SLP_QUAL` | Laag 5 · uitkomstmaat | Dit is geen aparte laag maar de uitkomst van alles eronder. We gebruiken het om te toetsen of de lagen die je aanpakt ook echt iets doen. |
| `sleepconfidence` | Geen laag — bepaalt de maat van je eerste stap | Vertrouwen voorspelt of je een verandering volhoudt. Bij weinig vertrouwen maken we het experiment kleiner, niet het advies strenger. Telt niet mee in je stand. |

**`duur` benchmark.** `benchmarkLabel: "Populatierichtlijn: 7+ uur"`, `benchmarkDisclaimer: "Voor gezonde volwassenen geldt regelmatig minstens 7 uur als gangbare ondergrens. Individuele behoefte verschilt."` Nooit als "jouw doel", nooit als tekort-percentage, nooit rood.

---

## D · Feitelijke meting-readout

```ts
type SleepFactRow = {
  fieldId: SleepFieldId;
  label: string;                 // "Slaapduur", "Regelmaat", "Avondafbouw"
  answerSummary: string;         // letterlijk antwoordlabel uit src/data/sleep-checkin
  benchmarkLabel?: string;       // alleen duur
  status: 'below' | 'near' | 'meets' | 'na';
  layer: 1 | 2 | 3 | 4 | 5 | 6 | null;   // null = readout-only (grip, sleepconfidence)
  priority: 'winst' | 'ok' | 'watch' | null;
};

type SleepCheckinSnapshot = {
  checkinId: string | null;
  measuredAt: string;
  focusLayer: 1 | 2 | 3 | 4 | 5;
  focusFieldId: SleepFieldId;
  focusLabel: string;            // "Slaapduur"
  focusStatus: 'aandacht' | 'redelijk' | 'sterk';   // BACKSTAGE, nooit in copy
  answerLabel: string;           // "5 tot 6 uur"
  focusStatement: string;
  implicationLine: string;
  priorityProfile: {
    winst: { layer: number; title: string; line: string };
    ok: string[];                                    // max 2
    skip: { title: string; line: string } | null;
  };
  firstExperiment: { layer: number; action: string; durationDays: 14; measure: string };
  factRows: SleepFactRow[];
  dimensionDeltas: SleepDimensionDelta[];
  aggregateDirection: 'improved' | 'stable' | 'worsened' | 'new';
  routingHint: string;
  clinicalSignals: boolean;
  layer6GateOpen: boolean;
  layer6GateReason: 'open' | 'fundament' | 'klinisch' | 'geen_klacht';
};

type SleepDimensionDelta = {
  fieldId: SleepFieldId;
  label: string;
  prevAnswerLabel: string | null;
  answerLabel: string;
  direction: 'up' | 'down' | 'same' | 'new';
};
```

`status`-afleiding: `meets` = maximale optie; `near` = één onder maximum; `below` = de rest. Voor `duur`: `meets` ≥ 7.5, `near` = 6.5, `below` ≤ 5.5.

### Delta-copy — templates

Antwoordlabels letterlijk, nooit het woord "band", nooit een getal dat niet in de vraag stond.

| # | Situatie | Template |
|---|---|---|
| D1 | eerste check | `Dit is je eerste slaapcheck. {label} staat op "{answerLabel}" — daar meet je vanaf nu tegenaf.` |
| D2 | vooruit | `{label} ging van "{prevAnswerLabel}" naar "{answerLabel}".` |
| D3 | terug | `{label} ging van "{prevAnswerLabel}" terug naar "{answerLabel}".` |
| D4 | gelijk | `{label} staat op hetzelfde punt als bij je vorige slaapcheck: "{answerLabel}".` |
| D5 | nevenverandering | `{otherLabel} ging van "{prevOther}" naar "{nowOther}".` |
| D6 | nevenstabiel | `{labelA} en {labelB} bleven gelijk.` |
| D7 | totaalregel (`start`) | `Sinds je start: {sleepStartStatement(direction)}` — hergebruikt [`sleep-delta.ts`](../../src/lib/sleep-delta.ts) ongewijzigd |
| D8 | alles gelijk | `Alle delen die we meten staan op hetzelfde punt als bij je vorige slaapcheck.` |

Regels: `also` bevat maximaal twee nevenveranderingen (D5/D6 gecombineerd tot één zin). `start` verschijnt alleen bij een hercheck. Bij `direction: 'down'` geen excuustoon en geen uitroepteken — zie F3.

---

## E · Prioriteitenladder op Voortgang

Rail van zes rijen, onderste = breedste. Breedte codeert **fundament**, niet voortgang. Geen balk over de piramide, geen percentage, geen "X van 6".

**Intro-callout (vast):**
> **Prioriteitenladder — niet omhoog klimmen**
> Geen ranglijst en geen niveaus. Breder betekent: draagt meer. Begin waar de winst het grootst is; de rest mag wachten.

### E.1 Laagresolutie (engine, bottom-up)

```
laag1_open  = duur <= 5.5  ||  (duur == 6.5 && SLP_QUAL <= 2)
laag2_open  = SLP_CONS <= 2
laag3_open  = telling(winddown<=2, nightload<=2, morninglight<=2) >= 2
laag4_open  = alleen na omgeving-scan (v2-veld) — nooit auto-focus in v1
laag5_route = clinicalSignals
focusLayer  = eerste open laag in volgorde 1,2,3 ; anders 5 als clinicalSignals ; anders 4 ; anders 3-watch
```

Eén open laag telt als `winst`, alle open lagen erboven krijgen `wacht` ("Nog niet nu"), gesloten lagen eronder `ok`, losse signalen `watch`.

### E.2 `clinicalSignals` — de belangrijkste regel

```
clinicalSignals = duur >= 6.5
               && SLP_CONS >= 2
               && (SLP_ONSET <= 2 || SLP_WAKE <= 2)
               && SLP_QUAL <= 2
```

Dit is de "klacht vs gedrag"-splitsing uit de mapping. Lang wakker liggen **zonder** genoeg gelegenheid is een laag 1-verhaal; lang wakker liggen **mét** gelegenheid én vast ritme is laag 5. Zonder deze conditie zou elke drukke veertiger een insomnia-signaal krijgen.

### E.3 Per laag op VL

Laag 1–3: kernvraag (2-3 regels) + max 4 chips + "Wat kun je hier doen?" met max 3 acties. Laag 4: acties + omgeving-scan (interactief). Laag 5: kernvraag + signalen-checklist + professionele-hulp-copy, géén behandel-UI, géén score op de checklist. Laag 6: kernvraag + evidence-matrix (collapsed) + gate-blok.

### E.4 Crossover 4 ↔ 5 (L3)

Tussen de twee rijen, horizontaal, met een dubbele pijl — nooit als verticale sprong:
> **Laag 4 en laag 5 staan naast elkaar, niet boven elkaar.** Bij echte slaapklachten kan een gerichte behandeling belangrijker zijn dan een beter matras. Welke van de twee voorgaat, hangt af van wat je merkt — niet van de volgorde in dit overzicht.

Beide rijen krijgen dezelfde breedte (74%). Dat is de visuele vertaling van "geen rangorde".

### E.5 Zelf-inschatting

"Waar denk je dat je nu zit?" — chips laag 1 t/m 5. Laag 6 ontbreekt bewust, met regel: *"Laag 6 kun je niet zelf kiezen. Die opent op basis van je antwoorden, niet op basis van interesse."* (L11)

Terugkoppeling bij afwijking: *"Wijkt dat af van je antwoorden, dan is dat geen fout — het is een goede vraag voor je volgende slaapcheck."* Geen score, geen correctie.

### E.6 Laag 6-gate

```
layer6GateOpen = checkinCompleted
              && heeftConcreteKlacht(laag 1..4)      // relevantie
              && !laag1_open && !laag2_open          // fundament staat
              && !clinicalSignals                    // geen klinisch patroon
```

Vier uitkomsten, elk met eigen copy:

| Reden | Copy |
|---|---|
| `open` | "Je basis staat en er is een concreet aanknopingspunt. Een vergelijking is nu een redelijke volgende vraag — geen advies om iets te gaan slikken." + `Vergelijk op prijs en kwaliteit →` (label-only) |
| `fundament` | "Nog niet. {concrete reden} — eerst gelegenheid, dan een potje. Een middel dat inslapen iets versnelt, geeft je geen extra uur in bed." Geen link. |
| `klinisch` | "Bij dit patroon zetten we de vergelijking niet open. Een middel dat inslapen iets versnelt, verandert niets aan wat hier speelt — en het stelt uit wat wél helpt." Geen link. |
| `geen_klacht` | Laag 6 blijft dicht zonder deur: er is niets op te lossen. |

Link is altijd label-only: geen prijs, geen foto, geen merk, geen claimtekst op VL. `resolveGatedComparisonPath("magnesium")` blijft de technische poort eronder.

### E.7 Tweede as (backstage, footnote)

```
bewijs sterk
   ^
   |  slaapduur      CGT-i
   |  regelmaat      (bij aanhoudende klachten)
   |  daglicht       omgeving
   |
   |                          meter
   |                    supplement
   |                          experiment
   +---------------------------------> minder fundamenteel
 bewijs onzeker
```

Verschijnt uitsluitend als collapsed uitleg onderaan VL. Nooit als assen in de UI, nooit als score per laag.

---

## F · States

| | Situatie | Frames | Focus | CTA | Gate |
|---|---|---|---|---|---|
| **F1** | Eerste check, duur 5–6u | VQ `duur` · VR · VL | Laag 1 | "Bekijk je slaapbeeld →" | dicht · fundament |
| **F2** | Hercheck vooruit (duur + ritme omhoog) | VQ `morninglight` · VR · VL | Laag 3 | idem | **open** · label-only |
| **F3** | Hercheck terug (ritme + duur omlaag) | VQ `nightload` · VR · VL | Laag 2 | idem | dicht · fundament |
| **F4** | Duur ok, ritme onregelmatig, laag 3 wacht | VQ `SLP_CONS` · VR · VL | Laag 2 | idem | dicht · fundament |
| **F5** | Klinische signalen | VQ `SLP_ONSET` · VR · VL | Laag 5 | idem (hint verwijst naar signalen) | dicht · **klinisch** |
| **F6** | Basis staat, avond open | VQ `winddown` · VR · VL | Laag 3 | idem | **open** · label-only |

Prioriteitenprofiel-copy per state staat voluit in de prebuild (`STATES.Fn.profile`).

Kernbeslissingen: **F3** maakt het experiment *kleiner* dan de vorige keer, niet groter — bij terugval is een zwaarder plan de klassieke fout. **F4** zet laag 3 expliciet op "Nog niet nu" met reden ("ze hangen aan een tijdstip dat er nog niet is"); dit is de state waarin de ladder iets wegneemt in plaats van toevoegt. **F5** sluit de laag 6-deur juist omdat er klachten zijn.

---

## G · Meetplan

**Hergebruik ongewijzigd:** `checkin_completed { domain: 'slaap' }` (server, [route.ts](../../src/app/api/intake/sleep-checkin/route.ts)) · GA4 `sleep_checkin_completed { surface }`.

**Vervalt:** `sleep_plan_link_click` op VR (de link verdwijnt; blijft bestaan op `/intake/plan/sleep`-ingangen elders). De PATCH `chosen_actions` vervalt met de keuzeknoppen — `SleepCheckinFocus.chosenActions` blijft in het type staan voor bestaande rijen maar wordt niet meer gevuld.

**Niet versterken:** `dashboard_slaap_premium_upsell` blijft op VL-niveau; geen upsell op VR.

**Nieuw — drieplek-registratie vereist** (`src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`):

| Event | Payload | Waarom het bestaat |
|---|---|---|
| `sleep_checkin_routing_click` | `{ target: 'voortgang_slaap' \| 'onderbouwing' }` | De enige VR-CTA. Zonder dit weet je niet of de brug werkt — dat is de kernhypothese van deze wijziging. |
| `sleep_question_help_opened` | `{ field_id }` | Toetst of de uitleg-expander gelezen wordt vóór het antwoord. Bepaalt of C überhaupt blijft. |
| `sleep_layer_action_click` | `{ layer, action_id }` | Meet of de ladder tot handelen leidt en op welke laag. Zonder dit is E een aanname. |
| `sleep_environment_scan_completed` | `{ top_disruption }` | Enige databron voor het v2-omgevingsveld. `top_disruption` is een enum-slug, geen vrije tekst. |

Niet gebouwd in v1: geen event op zelf-inschatting (te dun), geen event op de signalen-checklist — **bewust**: aankruisgedrag bij gezondheidsklachten is bijzondere persoonsgegevens-terrein en de checklist is expliciet geen meetinstrument.

**Geen PII** in GA4/Clarity-payloads. **Consent-bias:** deze events vuren alleen na de check-in-consent; de VQ-events (`sleep_question_help_opened`) vuren vóór consent en mogen daarom uitsluitend als GA4/Clarity gaan, niet als `domain_events`. Dat betekent dat help-openen structureel ondergerapporteerd is bij consent-weigeraars — meld dat bij interpretatie.

**Meetpunt:** `sleep_checkin_routing_click { target: 'voortgang_slaap' }` versus `checkin_completed { domain: 'slaap' }` — daar lees je af of de brug van check-in naar Voortgang daadwerkelijk gelopen wordt.

---

## H · Commissie

### /KRAAK AF — vijf redenen om nee te zeggen

1. **Je haalt het enige interactieve element van het resultaatscherm af zonder bewijs dat de vervanging beter converteert.** De keuzeknoppen produceren nu een micro-commitment en een `chosen_actions`-rij. Een prioriteitenprofiel produceert een gevoel. Je ruilt een gemeten gedragsstap in voor een ongemeten inzicht.
2. **Zes lagen is te veel voor 375px.** Beweging heeft één ladder met treden die een gebruiker in één blik overziet. Zes uitklapbare lagen met vijf interactieve mocks is een documentatiesite, geen scherm. De kans dat iemand voorbij laag 2 scrollt is klein.
3. **De laag 5-poort verplaatst je van vergelijkingsplatform naar triage-instrument.** Zodra je zegt "dit is een reden om je huisarts te bespreken", ben je feitelijk aan het screenen op een aandoening. Dat is precies de grens die "adviezen, geen diagnoses" moest bewaken, en je zet er acht signalen onder met een teller.
4. **Je sluit de monetisatie-deur voor de meerderheid.** Met de gate uit §E.6 blijft laag 6 dicht bij F1, F3, F4 én F5 — vier van zes states. Voor een platform dat van affiliate leeft is dit een structurele omzetreductie, ingebouwd met opzet en zonder omzetraming.
5. **De hele constructie hangt op velden die er niet zijn.** Laag 4 heeft geen enkel check-in-veld; laag 1 heeft er precies één (`duur`); laag 6 heeft er nul. Je bouwt een zeslaagse ordening op vier bruikbare signalen. De ladder suggereert een precisie die de data niet heeft.

### /WELKE AANNAMES zitten onuitgesproken

- Dat een gebruiker de vraag "waar zit mijn winst" stelt. Veel bezoekers komen met "wat moet ik vanavond doen" — een analyse zonder actie kan als ontwijken landen.
- Dat volgorde-discipline motiveert. Het kan ook demotiveren: "je mag nog niets aan je slaapkamer doen" is een verbod, ook als het wetenschappelijk klopt.
- Dat zelfrapportage over slaapduur betrouwbaar is. Mensen over- én onderschatten hun slaapduur systematisch; laag 1 rust volledig op één zelfgerapporteerd bucket.
- Dat de check-in de baseline levert voor de delta. Er is geen garantie dat vorige `raw_inputs` compleet zijn — bij deelinvulling zijn D2/D3 niet renderbaar.
- Dat "eerst gelegenheid, dan potje" ook geldt voor mensen die al jaren magnesium gebruiken. Voor hen is de deur dicht doen een ervaring van betutteling, niet van zorgvuldigheid.
- Dat 14 dagen genoeg is om een slaapverandering te merken. Voor duur en ritme plausibel; voor ochtendlicht en cafeïne-timing eerder optimistisch.
- Dat één winst-laag per check klopt. Bij iemand met duur 5u én onregelmatig ritme is de scheiding tussen laag 1 en 2 kunstmatig — het is hetzelfde probleem.

### /PRE-MORTEM — het is zes weken later en slaap S1 is mislukt

Wat er gebeurde: de conversie van check-in naar Voortgang bleef onder de tien procent. Mensen lazen de readout, herkenden zich, en sloten het tabblad — er was geen reden om door te klikken, want de conclusie stond al op het scherm en er was niets meer te doen. De ladder op VL werd door de weinigen die er kwamen tot laag 2 uitgeklapt en verder niet.

Tegelijk kwamen er twee klachten binnen: iemand met slaapapneu-signalen vond dat het platform "aan het dokteren" was, en iemand anders vond het paternalistisch dat een magnesium-vergelijking geweigerd werd terwijl hij er expliciet naar zocht. De magnesium-pagina zag zijn intake-verkeer met ongeveer de helft dalen zonder dat een andere bron dat opving.

Intern viel het besluit terug: de acties keerden terug op VR "voor de conversie", waarmee het scherm een hybride werd — analyse plus actielijst — die slechter was dan beide oorspronkelijke versies. De ladder bleef als dode code op VL staan.

De diepere oorzaak: er is nooit vastgesteld wát VR moest oplossen. "Het voelt supplement-first" is een smaakoordeel; er lag geen cijfer onder (bijvoorbeeld: hoeveel procent van de slaapcheck-afronders klikt de magnesium-kaart, en hoeveel daarvan slaapt minder dan zes uur). Zonder dat nulpunt was er ook geen manier om te zien of het beter werd.

### /WAT ZIE IK OVER HET HOOFD

- **De bestaande `/intake/plan/sleep`-pagina.** Die blijft na deze wijziging bestaan zonder inkomende link vanaf VR. Ofwel je hangt hem onder laag 1–3 op VL, ofwel je zet hem uit — een wees-pagina met afvinkbare acties ondermijnt de hele ordening.
- **`SleepScreen.tsx` toont nog het oude model.** Twee waarheden op één dashboard is precies de klacht waarmee dit begon. §M zegt "geen merge in v1" — dat is verdedigbaar, maar dan moet SleepScreen minimaal naar VL doorverwijzen in plaats van een eigen conclusie te tonen.
- **`assessSleep()` heeft consumers buiten de check-in.** `parseSleepCheckinFocus` voedt `account-dashboard.ts`. Een refactor van `buildSleepConclusion` raakt het dashboard, de nurture-selectie en mogelijk de hermeting.
- **De hermeting.** Als de winst-laag per check kan verspringen (F1 laag 1 → F2 laag 3), verandert ook waar de gebruiker op afgerekend wordt. Er is geen "je hebt laag 1 afgerond"-moment — dat is bewust, maar het betekent dat vooruitgang alleen in de delta zichtbaar is.
- **Nurture.** De slaap-mails verwijzen naar acties die op VR verdwijnen. Copy-drift tussen mail en product is een reëel risico.

### Compliance Officer — expliciet

**CGT-i.** De term "cognitieve gedragstherapie bij insomnia" wordt genoemd als bestaande behandeling met sterke onderbouwing, gekoppeld aan wie die levert (huisarts, slaaptherapeut). Wat het product níét doet: geen slaaprestrictie, geen stimuluscontrole-instructie, geen slaapdagboek als opdracht, geen voortgangsmeting op klachten. De grens ligt bij *informeren over het bestaan van een behandeling* versus *die behandeling leveren*. De signalen-checklist geeft daarom bewust geen uitslag, geen score en geen drempelwaarde — de terugkoppeling is "een reden om te bespreken", nooit "je hebt waarschijnlijk". De 8 items zijn ontleend aan gangbare verwijsindicaties (inslapen, doorslapen, vroeg wakker, niet-herstellende slaap, slaperigheid overdag, snurken/ademstops, onrustige benen, duur). Snurken met ademstops staat er bewust bij: dat is de ene klacht waarbij niet-verwijzen schadelijk is.

**7 uur.** Overal geformuleerd als populatierichtlijn met bronanker en variatie-clausule, nooit als persoonlijk doel. Geen tekort-percentage, geen rode kleur op de duur-rij, geen "je komt X uur tekort". Het woord "ondergrens" is bewust gekozen boven "norm". Op VR verschijnt de richtlijn alleen als `benchmarkLabel` naast het feitelijke antwoord en één keer in de footnote.

**Supplement-gate.** De strengere lezing (§E.6) is een bewuste afwijking van de letterlijke opdrachtregel. Onderbouwing: een gate die alleen op *aanwezigheid van een klacht* opent, opent hem het wijdst bij de mensen met de ernstigste klachten — dat is precies omgekeerd aan stepped care en juridisch het slechtst verdedigbaar. De toegevoegde condities (fundament staat, geen klinisch patroon) maken van de poort een relevantie-**en**-gereedheidstoets. Tier 3 blijft daarmee tier 3. Claims: uitsluitend EFSA-goedgekeurd via `getUsableClaims()`, en op VL verschijnt zelfs die claimtekst niet — de deur is label-only. Geen melatonine als default-advies, nergens; melatonine is in Nederland deels geneesmiddel en hoort niet in een leefstijl-vergelijking zonder aparte juridische toets.

**Zelfrapportage.** Elke surface draagt "zelfrapportage, geen diagnose" in de footnote. Geen enkel scherm gebruikt een aandoeningsnaam als label voor de gebruiker.

### Wat ik aanpas naar aanleiding hiervan

| Punt | Aanpassing |
|---|---|
| Kraak 1 (verlies van micro-commitment) | Het **eerste experiment** krijgt op VL één bevestigingsactie (`sleep_layer_action_click`) zodat er een meetbare gedragsstap overblijft — op VL, niet op VR. |
| Kraak 2 (zes lagen op 375px) | Alleen de winst-laag staat open; de rest is dicht met één regel. Mocks zitten uitsluitend ín een uitgeklapte laag. |
| Kraak 3 (triage-risico) | Checklist zonder score en zonder drempel; terugkoppeling in drie trappen zonder aandoeningsnaam; expliciete regel "geen behandeling en geen uitslag". |
| Kraak 4 (omzet) | Vastgelegd als expliciete kost, niet weggeschreven. **Meten vóór livegang:** huidig aandeel slaapcheck-afronders dat de magnesium-kaart klikt, en de duurverdeling daarbinnen. Zonder dat nulpunt niet uitrollen. |
| Kraak 5 / pre-mortem | Laag 4 kan in v1 **nooit** de winst-laag zijn (geen veld); dat staat nu hard in §E.1. Laag 6 heeft geen eigen invoer. |
| Pre-mortem (geen nulpunt) | §G krijgt een verplichte pre-meting; S1e mag niet live zonder. |
| Over het hoofd (`/intake/plan/sleep`) | Toegevoegd aan §M als open besluit — hangt onder laag 1–3 of gaat uit; geen wees-pagina. |
| Over het hoofd (SleepScreen) | §M: SleepScreen mag na S1 geen eigen conclusie meer tonen, alleen doorverwijzen. |
| Aanname (duur + ritme is één probleem) | Als laag 1 én laag 2 beide open zijn, benoemt de `implicationLine` ze samen; de winst blijft laag 1. |

---

## I · Copy-voorbeelden — drie persona's

### I1 · Duur-tekort (F1) — duur 5,5u, regelmaat redelijk, eerste check

**Kop.** Jouw slaapcheck · Wat je antwoorden laten zien · gemeten vandaag

**Readout.**
> WAT JE SLAAPCHECK ZEGT
>
> **Je grootste slaapwinst ligt nu bij de tijd die je jezelf geeft.**
>
> `Slaapduur · 5 tot 6 uur`
>
> Je slaapt doorgaans 5 tot 6 uur. Voor gezonde volwassenen geldt regelmatig minstens 7 uur als gangbare ondergrens — hoeveel jij precies nodig hebt verschilt, maar hieronder is er weinig over om te finetunen.
>
> **JE NULPUNT** — Dit is je eerste slaapcheck. Slaapduur staat op "5 tot 6 uur" — daar meet je vanaf nu tegenaf.
>
> Zolang de gelegenheid onder de zes uur blijft, verandert een donkerder slaapkamer of een ander avondritueel daar weinig aan. Eerst tijd, dan de rest.
>
> **[ Bekijk je slaapbeeld → ]**
> Daar zie je welke laag nu het meeste oplevert — en wat kan wachten.

**Feitelijke rijen.** Slaapduur · 5 tot 6 uur · *Populatierichtlijn: 7+ uur* · GROOTSTE WINST — Regelmaat · Meestal wel, soms niet · HOUD IN DE GATEN — Avondafbouw · Af en toe · HOUD IN DE GATEN — Ochtendlicht · Soms · HOUD IN DE GATEN — *Toon alle antwoorden ↓*

**Prioriteitenprofiel.**
> **GROOTSTE WINST** — Laag 1 · Slaapgelegenheid · De tijd die je jezelf geeft
> Je slaapt doorgaans 5 tot 6 uur. Dat is de laag waar nu het meeste te winnen valt.
>
> **GOED OP ORDE** — Doorslapen: je wordt soms wakker, maar slaapt meestal weer door · Inslapen: meestal binnen een half uur
>
> **NOG NIET NU** — Meten, gadgets en aanvullen
> Een draagbare meter of een potje verandert niets aan te weinig tijd in bed. Dat komt later, als er iets te finetunen valt.

**Eerste experiment · Laag 1.** Verschuif je bedtijd 45 minuten naar voren. Eén verandering, veertien dagen. Meet: hoe je wakker wordt, je energie rond drie uur 's middags, en of je overdag wegdommelt. Niet twintig dingen tegelijk.

**Footnote.** Voor gezonde volwassenen geldt regelmatig minstens 7 uur slaap als gangbare ondergrens; individuele behoefte verschilt (NHLBI). Dit is een zelfrapportage, geen diagnose. *Zo komen we aan deze indeling*.

---

### I2 · Weekend-ritme (F4) — SLP_CONS = 1, duur 7,5u, opsta-tijd wisselt

**Readout.**
> WAT JE SLAAPCHECK ZEGT
>
> **Je grootste slaapwinst ligt bij je ritme, niet bij je avond.**
>
> `Regelmaat · Nee, mijn ritme is onregelmatig`
>
> Je geeft jezelf genoeg tijd — doorgaans 7 tot 8 uur — maar je op- en bedtijden verschillen sterk per dag. Je interne klok krijgt daardoor geen vast aanknopingspunt.
>
> **SINDS JE VORIGE METING** — Regelmaat staat op hetzelfde punt als bij je vorige slaapcheck: "Nee, mijn ritme is onregelmatig".
> Slaapduur en avondafbouw bleven ook gelijk.
> *Sinds je start: ongeveer gelijk aan je startmeting — je houdt je lijn vast.*
>
> Avondafbouw en ochtendlicht staan bij jou ook open, maar die werken pas mee als er een vast tijdstip is om ze aan te hangen. Daarom staan ze nu op wachten.
>
> **[ Bekijk je slaapbeeld → ]**

**Prioriteitenprofiel.**
> **GROOTSTE WINST** — Laag 2 · Ritme & slaapgewoonten · Een vaste opsta-tijd
> Je tijden verschillen sterk per dag. Eén vast tijdstip is het goedkoopste anker dat er is.
>
> **GOED OP ORDE** — Slaapduur: doorgaans 7 tot 8 uur · Doorslapen: je slaapt meestal weer door
>
> **NOG NIET NU** — Avondafbouw en ochtendlicht
> Allebei staan ze bij jou open, maar ze hangen aan een tijdstip dat er nog niet is. Zodra je opsta-tijd staat, worden ze vanzelf de volgende stap.

**Eerste experiment · Laag 2.** Kies één opsta-tijd en houd hem veertien dagen binnen een uur — ook in het weekend. Eén verandering, veertien dagen. Meet: hoe lang je over inslapen doet, en of je zondagavond nog wakker ligt.

**Laag 6 (op VL).** Nog niet. Je ritme is onregelmatig, en dat is precies de laag waar een middel niets aan verandert. Eerst gelegenheid en ritme, dan pas de vraag of aanvullen zin heeft.

---

### I3 · Insomnia-signalen (F5) — SLP_ONSET = 1, SLP_WAKE = 1, duur 7,5u

**Readout.**
> WAT JE SLAAPCHECK ZEGT
>
> **Je geeft jezelf genoeg tijd, en toch komt de slaap niet.**
>
> `Inslapen · Vaak langer dan een uur of heel moeilijk`
>
> Je hebt doorgaans 7 tot 8 uur gelegenheid, je tijden liggen vast, en toch duurt inslapen vaak langer dan een uur en word je meerdere keren per nacht wakker. Dat patroon vraagt iets anders dan finetunen.
>
> **JE NULPUNT** — Dit is je eerste slaapcheck. Inslapen staat op "Vaak langer dan een uur of heel moeilijk" — daar meet je vanaf nu tegenaf.
>
> Als de gelegenheid en het ritme staan en de klachten blijven, is verder kijken zinvoller dan je omgeving verder aanpassen. Dit is geen diagnose — het is een reden om er iemand bij te halen.
>
> **[ Bekijk je slaapbeeld → ]**
> Daar staan de signalen op een rij, en wat je ermee kunt doen.

**Prioriteitenprofiel.**
> **GROOTSTE WINST** — Laag 5 · Gerichte interventies · Dit verder laten uitzoeken
> De lagen eronder staan bij jou. Als de klachten dan blijven, is de volgende stap iemand die met je meekijkt — niet nog een aanpassing.
>
> **GOED OP ORDE** — Slaapduur: doorgaans 7 tot 8 uur · Regelmaat: je tijden liggen vrij vast
>
> **NOG NIET NU** — Je slaapkamer, meters en supplementen
> Een beter matras of een middel dat inslapen iets versnelt, verandert niets aan dit patroon. Dat is geen strengheid, dat is de volgorde.

**Eerste experiment · Laag 5.** Houd twee weken kort bij wanneer de klachten er wel en niet zijn. Geen dagboekplicht: één regel per ochtend is genoeg. Neem die twee weken mee naar je huisarts — dat scheelt een consult raden.

**Laag 5-paneel op VL.** Deze laag gaat niet over beter slapen, maar over aanhoudende klachten. Het doel verschuift van optimaliseren naar onderzoeken. Voor langdurige slapeloosheid bestaat een behandeling met sterke onderbouwing: cognitieve gedragstherapie bij insomnia (CGT-i). Die krijg je niet hier — dat bespreek je met je huisarts of een slaaptherapeut. *Je krijgt hier geen behandeling en geen uitslag.*

**Laag 6 (op VL).** Bij dit patroon zetten we de vergelijking niet open. Een middel dat inslapen iets versnelt, verandert niets aan wat hier speelt — en het stelt uit wat wél helpt. Eerst laten uitzoeken wat eronder zit.

---

## J · Layout 375px

Eén `<h1>` per frame. VQ: de vraag. VR: "Jouw slaapcheck". VL: "Slaap".

```
VQ                          VR                          VL
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│ ▓▓▓▓▓░░░░░ 3px        │   │ ▓▓▓▓▓▓▓▓▓▓ 100%       │   │ PSF  Vandaag Agenda   │
│                       │   │                       │   │      [Voortgang] Herm.│
│      05 · SLAAP       │   │   Jouw slaapcheck  h1 │   ├───────────────────────┤
│                       │   │   gemeten vandaag     │   │ ←  SLAAP           h1 │
│  Hoeveel uur slaap    │   │ ┌───────────────────┐ │   │ ┌───────────────────┐ │
│  je doorgaans per     │h1 │ │ WAT JE SLAAPCHECK │ │   │ │ JE STAND          │ │
│  nacht?               │   │ │ feit (serif)      │ │   │ │ (ring)  band      │ │
│                       │   │ │ [dim · antwoord]  │ │   │ │         bron      │ │
│  populatierichtlijn   │   │ │ statement         │ │   │ └───────────────────┘ │
│  7+ uur — behoefte    │   │ │ ┌───────────────┐ │ │   │ zelfde blok als …     │
│  verschilt            │   │ │ │ DELTA         │ │ │   │ ┌───────────────────┐ │
│                       │   │ │ │ regel/also/   │ │ │   │ │ ▓ IDENTIEKE       │ │
│ ┌───────────────────┐ │   │ │ │ start         │ │ │   │ │ ▓ READOUT (L7)    │ │
│ │ Minder dan 5 uur  │ │   │ │ └───────────────┘ │ │   │ │ ▓ stille link     │ │
│ ├───────────────────┤ │   │ │ implicatie        │ │   │ └───────────────────┘ │
│ │ 5 tot 6 uur    ✓  │ │   │ │ [ BEKIJK JE       │ │   │ ┌───────────────────┐ │
│ ├───────────────────┤ │   │ │   SLAAPBEELD → ]  │ │   │ │ PRIORITEITENLADDER│ │
│ │ 6 tot 7 uur       │ │   │ │ hint              │ │   │ │ niet omhoog klim. │ │
│ ├───────────────────┤ │   │ └───────────────────┘ │   │ └───────────────────┘ │
│ │ 7 tot 8 uur       │ │   │ WAT JE HEBT INGEVULD  │   │  ┌─ L6 ─┐  58%        │
│ ├───────────────────┤ │   │ ● Slaapduur           │   │  ├─ L5 ──┤ 74%        │
│ │ Meer dan 8 uur    │ │   │   5 tot 6 uur         │   │ ⇄ crossover 4↔5       │
│ └───────────────────┘ │   │   richtlijn 7+        │   │  ├─ L4 ──┤ 74%        │
│ ───────────────────── │   │   GROOTSTE WINST      │   │ ┌── L3 ───┐ 84%       │
│ Waarom vragen we      │   │ ● Regelmaat …         │   │ ┌─── L2 ───┐ 92%      │
│ dit? ↓                │   │ ● Avondafbouw …       │   │ ┌──── L1 ────┐ 100%   │
│                       │   │ ● Ochtendlicht …      │   │ │ open: kern +  │     │
│ ← Terug               │   │ Toon alle antwoorden↓ │   │ │ chips + acties│     │
└───────────────────────┘   │ WAAR HET OM DRAAIT    │   │ │ + mock        │     │
                            │ GROOTSTE WINST …      │   │ └───────────────┘     │
                            │ GOED OP ORDE …        │   │ ZELF INSCHATTEN L1-L5 │
                            │ NOG NIET NU …         │   │ tweede as (collapsed) │
                            │ ┌ EERSTE EXPERIMENT ┐ │   │ footnote              │
                            │ └───────────────────┘ │   └───────────────────────┘
                            │ footnote 7+ uur       │
                            └───────────────────────┘
```

**Kleur.** VQ/VR draaien op de intake-tokens (`--intake-bg #1A2E1A`, terra `#C8956C` voor accent en primaire CTA), VL op de dashboard-tokens (`#132414`, sage `#5A8F6A` voor de ring, terra voor de readout-eyebrow). Beide zijn donkergroen — het verschil is bewust klein, want de readout moet op beide surfaces als hetzelfde blok herkend worden (L7). De enige echte differentiatie: op VR is de vervolg-affordance een volledige terra-knop, op VL een stille sage-link. Dat is exact het beweging-R0-contract.

---

## K · HTML-prebuild

[`slaap-piramide-v1-prebuild-2026-08.html`](slaap-piramide-v1-prebuild-2026-08.html) — self-contained, vanilla JS, inline CSS, alleen Google Fonts extern.

Bevat: surface-switcher VQ/VR/VL · state-switcher F1–F6 met toelichtingsregel · VQ met help-expander en benchmark-regel · VR met gedeelde readout, fact-rows (4 + toon-alles), prioriteitenprofiel, eerste experiment, één CTA, footnote · VL met stand-tegel, SSOT-vlag, identieke readout, piramide-chrome, rail van zes lagen op fundament-breedte, crossover-callout tussen 4 en 5, zelf-inschatting tot laag 5, tweede-as-diagram, footnote.

Interactieve mocks: laag 1 slaaptijd-chips met reflectieregel · laag 2 opsta-tijd + 7-daagse strip · laag 4 omgeving-scan (6 rijen → grootste verstoring) · laag 5 signalen-checklist (8 items, drie terugkoppelingstrappen, geen score) · laag 6 evidence-matrix + gate in beide standen.

`renderReadout(s, variant)` is één functie met twee aanroepers; `variant` raakt uitsluitend het gewicht van de vervolg-affordance. De tekst is op beide surfaces dezelfde string (L7).

Geverifieerd: geen verboden woorden (stappenplan, route, fase, spoor, level, trede, cockpit, kompas, journey, biohack, sleep score, deep sleep, perfecte slaap), geen emoji, geen supplement in de VR-fold.

---

## L · Cursor-implementatie-hints

| Slice | Bestanden | Inhoud |
|---|---|---|
| **S1a** | `src/data/sleep/lifestyle-pyramid.ts` (nieuw) | `SLEEP_LAYERS`: zes lagen met `id`, `name`, `sub`, `kern`, `chips[]`, `actions[]`, `railWidth`. `CLINICAL_SIGNALS[]` (8 items). `EVIDENCE_MATRIX[]` (8 rijen). `SLEEP_QUESTION_HELP` per veld (§C). Geen logica. |
| **S1b** | `src/lib/sleep-assessment.ts`, `src/lib/sleep-delta.ts` | `resolveSleepLayer()` (§E.1), `detectClinicalSignals()` (§E.2), `buildSleepFactRows()`, `buildPriorityProfile()`, `buildFirstExperiment()`, `buildSleepDimensionDeltas()` (§D-templates). `buildSleepConclusion` behoudt zijn signatuur voor bestaande consumers maar levert `SleepCheckinSnapshot`; `MAINTENANCE_ACTIONS` en `SLEEP_CHOICES` verdwijnen uit de VR-tak. **`magnesiumGate()` uit `assessSleep` halen** — verhuist naar S1e. Let op consumers: `parseSleepCheckinFocus` → `account-dashboard.ts`. |
| **S1c** | `src/components/intake/SleepCheckinReadout.tsx` (nieuw), `SleepCheckin.tsx` | Gedeelde component, spiegel van [`MovementCheckinReadout.tsx`](../../src/components/intake/MovementCheckinReadout.tsx) inclusief `variant: "checkin" \| "voortgang"`. Result-tak van `SleepCheckin.tsx` herschrijven: readout + fact-rows + profiel + experiment + één CTA. `selected`/`toggleChoice`/`persistChosenActions` verwijderen. |
| **S1d** | `src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx`, `src/components/dashboard/voortgang/SlaapPrioriteitenLadder.tsx` (nieuw) | `isSleep`-tak naast de bestaande `isMovement`-tak — **geen nieuw domeinscherm**. Rail rendert uit `SLEEP_LAYERS`; alleen de winst-laag default open. Crossover-callout als eigen element tussen rij 4 en 5. Patroon: [`BewegingAdviesTreden.tsx`](../../src/components/dashboard/voortgang/BewegingAdviesTreden.tsx). |
| **S1e** | `src/lib/sleep-supplement-gate.ts` (nieuw), `src/lib/events.ts`, `src/lib/intake-events-client.ts`, `src/app/api/intake/events/route.ts`, `src/lib/__tests__/sleep-assessment.test.ts` | `resolveSleepLayer6Gate()` boven op `resolveGatedComparisonPath("magnesium")` (§E.6). Vier events registreren op drie plekken (§G). Tests: laagresolutie per state F1–F6, `clinicalSignals` true/false-grenzen, gate in vier standen, delta-templates zonder het woord "band". |

Volgorde is bindend: S1b zonder S1a is niet testbaar, S1e vóór S1d zet een deur open in een scherm dat nog niet bestaat.

---

## M · Brug-contract

- **VR primaire CTA** → `buildDashboardVoortgangHref("domein", null, "slaap")` = `/dashboard?tab=voortgang&screen=domein&domein=slaap`. Geverifieerd in [`dashboard-url.ts:171`](../../src/lib/dashboard-url.ts#L171) — niet `screen=slaap`.
- **VL laag 6** → `/beste/magnesium`, label-only, uitsluitend als `layer6GateOpen`. Bestaande gate (`resolveGatedComparisonPath` + `isComparisonAllowed`), geen nieuwe affiliate-relatie, geen nieuwe slug.
- **`SleepScreen.tsx`** blijft L1-adjacent (dagelijkse laag); VL is L2 (analyse). Geen merge in v1. **Wel vereist:** SleepScreen mag na S1 geen eigen slaapconclusie meer tonen — één waarheid, dus doorverwijzen naar VL.
- **Open besluit — `/intake/plan/sleep`.** Verliest zijn inkomende link vanaf VR. Ofwel onder laag 1–3 hangen als "acties bijhouden", ofwel uitzetten. Een wees-pagina met afvinkbare acties ondermijnt de ordening.
- **Toekomst (spec only).** Omgeving-scan als check-in v2-velden (6 booleans + `top_disruption`), gevoed door `sleep_environment_scan_completed`. Slaap-snack op Mijn Dag: één regel uit de winst-laag, geen tweede conclusie.
- **Toekomstige pijplijn.** Profiel → zelfmeting → prioriteren → experimenteren → evalueren → opschalen. De check-in levert het profiel, de ladder prioriteert, het experiment is één verandering over veertien dagen, de hercheck evalueert via de delta, en opschalen betekent: de volgende laag opent pas als de vorige staat. Elke stap bestaat al als losse bouwsteen; wat ontbreekt is de terugkoppellus tussen experiment en hercheck — dat is een latere slice, geen v1-scope.
- **Differentiatie vs slaap-apps.** Een slaaptracker begint bij meten en eindigt bij een cijfer waar je niets mee kunt: je weet dat je slecht sliep, niet waarom of wat eerst. Wij beginnen bij prioriteren en gebruiken meten pas als er iets te toetsen valt — laag 6, na de rest. Dat is dezelfde beweging als de Consumentenbond maakt: niet het duurste product aanraden, maar eerst vaststellen of je het product überhaupt nodig hebt. Voor mannen 40+ die al drie apps en een ring hebben geprobeerd is dat het enige onderscheidende antwoord dat overblijft.
