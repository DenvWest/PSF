# Eigen ijkpunt — een kwalitatief doel per domein

> **Status (29 juli 2026): ontwerp, akkoord op richting, nog niet gebouwd.** Aanleiding: het Voortgang-blok (`VoortgangRichtingBeat`) verkoopt vandaag een vitaliteitsband als "waar dit heen loopt" — een afgeleide schaal, geen doel van de gebruiker. De vraag was of daar een **persoonlijke doelstelling per domein** kan staan die meebeweegt met de 30-dagen-cyclus, gratis.
> Dit doc legt dat ontwerp vast. Het is de **kwalitatieve** tegenhanger van [`PLAN_DOELGREEP_DOSIS_NA_CHECK.md`](./PLAN_DOELGREEP_DOSIS_NA_CHECK.md) (de kwantitatieve dosis-as) en de **meetbare** invulling van [`PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md`](./PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md) (het generieke band-narratief). Erft de locks uit [`BEWEEG_COCKPIT_FUTURE_YOU.md`](./BEWEEG_COCKPIT_FUTURE_YOU.md) besluit 4 en [`ANALYSE_LONGEVITY_HOME_DOMEINGEDREVEN.md`](./ANALYSE_LONGEVITY_HOME_DOMEINGEDREVEN.md). Copy volgt [`WRITING_VOICE.md`](../core/WRITING_VOICE.md).

---

## 0. De kern in drie zinnen

1. De gebruiker benoemt per domein **één concrete situatie uit zijn eigen leven** (gestuurd-open: enum + eigen woorden) en scoort die met **één 0-10-vraag** die bij elke domeincheck terugkomt.
2. Dat is een **aparte as naast de engine-score** — de gebruiker is er de enige bron van, hij loopt nooit mee in `domain_scores`, de ring of de vitaliteitsscore.
3. Het doel is **kwalitatief en functioneel** ("twee trappen op zonder buiten adem"), nooit een scoretarget en nooit een medische uitkomst — dat verschil is wat het idee redt.

---

## 1. Waarom het huidige blok niet volstaat

`VoortgangRichtingBeat` toont nu: baseline → nu → `getNextVitalityBand`, met de lede *"geen doel dat je moet halen, wel het volgende leesniveau"*. Dat is eerlijk maar leeg:

- Het is **afgeleid**, niet gekozen. De gebruiker heeft nergens gezegd dat hij naar "Sterk" wil.
- Het is **één domein** (alleen `priorityRow` uit `buildKompasDomainRows`), terwijl Home al rond vijf domeinen is heringericht.
- Het is **niet tijdgebonden**. De 30-dagen-cyclus zit al in `data.cycleEvidence` (`cycleDay`, `daysUntilRemeasure`, zie `VoortgangHero.tsx:50-52`) maar raakt dit blok niet.
- Een bandgrens kruisen duurt lang. Bij delta +3 blijf je in dezelfde band en is er letterlijk niets te zien — terwijl er wel iets veranderd is in iemands leven.

Wat ontbreekt is het antwoord op *"waarvoor doe ik dit"* in de woorden van de gebruiker zelf.

---

## 2. Het concept — gestuurd-open, drie lagen

| Laag | Wat | Waarom gestuurd |
|---|---|---|
| **Situatie** | Keuze uit 6 voorgeschreven situaties per domein (§3) | Aggregeerbaar over gebruikers; stuurt copy, agenda-suggesties en later cohortanalyse |
| **Eigen woorden** | Vrij tekstveld, max 80 tekens, voorgevuld met de gekozen situatie | Eigenaarschap zonder dat het systeem vrije tekst hoeft te begrijpen |
| **IJkpunt** | Eén 0-10-vraag op díe activiteit, bij elke domeincheck opnieuw | Maakt het meetbaar zonder een tweede scoringsmodel |

Het patroon komt uit de **PSFS** (Patient Specific Functional Scale) uit de revalidatie: de patiënt benoemt zelf de activiteit, de schaal blijft constant, en de vergelijking is altijd *jij-nu vs jij-toen* — nooit jij vs een norm. Dat is precies de positionering die we elders al hanteren.

**Verhouding tot het bestaande beweeganker.** `movement-prefs.ts` heeft al vier ankers (`zelfstandigheid` · `meedoen` · `energie` · `kracht`), alleen voor beweging, en die kleuren uitsluitend copy. Die blijven bestaan en worden **niet** vervangen: het anker is het *waaróm* (motief), de situatie is het *wat* (meetbare activiteit). Eén beweeganker kan bij meerdere situaties horen. Geen tweede ankersysteem bouwen.

---

## 3. Situatie-enums per domein

Zes per domein, functioneel geformuleerd, in de taal van de doelgroep. Deze lijst is het contract: de `id` gaat mee in events, de label-tekst niet.

### Slaap
| id | Label |
|---|---|
| `inslapen` | Binnen een half uur in slaap vallen |
| `doorslapen` | De nacht doorkomen zonder lang wakker te liggen |
| `uitgerust_wakker` | Uitgerust wakker worden, zonder snooze |
| `vast_ritme` | Op vaste tijden naar bed en eruit, ook in het weekend |
| `avond_afbouwen` | De avond afbouwen zonder scherm of glas als slaapmiddel |
| `middag_doorkomen` | De middag doorkomen zonder in te storten |

### Beweging
| id | Label |
|---|---|
| `trap_lopen` | Twee trappen op zonder buiten adem te zijn |
| `tillen_dragen` | Boodschappen in één keer naar boven dragen |
| `lang_volhouden` | Een dag lopen of staan volhouden zonder rugklachten |
| `sport_meedoen` | Meedoen met een partij of tocht zonder af te haken |
| `opstaan_bukken` | Vanaf de grond opstaan zonder me op te trekken |
| `weer_beginnen` | Weer op gang komen na een lange stilstand |

### Voeding
| id | Label |
|---|---|
| `avond_stoppen` | Na het avondeten stoppen met eten |
| `stevig_eten` | Elke maaltijd iets stevigs binnenkrijgen |
| `regelmaat` | Drie keer per dag eten in plaats van doorgrazen |
| `zelf_koken` | Doordeweeks zelf koken volhouden |
| `dip_voorkomen` | De middag doorkomen zonder in te zakken |
| `alcohol_terug` | Doordeweekse glazen terugbrengen |

### Stress
| id | Label |
|---|---|
| `hoofd_uitzetten` | 's Avonds mijn hoofd uit kunnen zetten |
| `werk_loslaten` | Na werktijd niet meer in de mail zitten |
| `pauze_nemen` | Overdag een echte pauze nemen |
| `korte_lont` | Minder snel geïrriteerd zijn thuis |
| `drukte_opvangen` | Een drukke week doorkomen zonder in te storten |
| `lijf_ontspannen` | Tot rust komen zonder dat mijn lijf gespannen blijft |

### Verbinding
| id | Label |
|---|---|
| `contact_onderhouden` | Vrienden zien zonder dat het van hen moet komen |
| `echt_gesprek` | Met iemand praten over wat er echt speelt |
| `partner_tijd` | Tijd met mijn partner die niet over logistiek gaat |
| `aanwezig_zijn` | Aanwezig zijn bij mijn kinderen, zonder telefoon |
| `alleen_zijn` | Alleen kunnen zijn zonder me eenzaam te voelen |
| `opnieuw_opbouwen` | Iets nieuws opbouwen na een verhuizing of scheiding |

**Herformuleringsregel — pijn wordt functie.** Waar een gebruiker "pijn" zou invullen, stuurt de enum naar wat hij weer wil kúnnen. Nooit "minder pijn" of "pijn weg" als doel: dat is een medische uitkomstbelofte en valt buiten wat dit platform mag claimen. Dit is de reden dat de lijst gesloten is.

---

## 4. Het ijkpunt — de 0-10-vraag

**Vraagtekst:** *"Hoe makkelijk gaat dit op dit moment?"* met de eigen woorden van de gebruiker eronder. 0 = lukt me niet · 10 = gaat vanzelf.

- Gesteld bij het **zetten** van het doel (baseline) en bij **elke domeincheck/hermeting** daarna.
- Altijd dezelfde activiteit, dezelfde schaal. Dat is de hele meetwaarde.
- Terugkoppeling is **verschil met jezelf**, in woorden: *"Bij je start stond dit op 4, nu op 6."* Geen percentage, geen balk naast de domeinscore, geen kleuroordeel.
- Bij gelijk gebleven score: neutrale formulering zonder schuld (*"dit staat nog op 4 — je hebt hier deze cyclus 9 dagen aan gewerkt"*), nooit "je bent niet vooruitgegaan".

**Wat dit niet is:** geen tweede vitaliteitsscore, geen input voor de engine, geen gemiddelde over domeinen, geen "PSFS-score" in de UI (vakterm blijft intern).

---

## 5. Locks

1. **Nooit een tweede score naast de engine-score.** Het ijkpunt staat náást `domain_scores` (RULES_VERSION 1.4.0), gaat nooit de ring, de leefstijlscore of de vitaliteit in, en beïnvloedt de hermeting-delta niet. Erft `BEWEEG_COCKPIT_FUTURE_YOU.md` besluit 4 en de lock "minuten = evidence, nooit een tweede score".
2. **Doel is functie, geen scoretarget.** Geen "naar 70" en geen voorspelde score-uitkomst — richting mag, belofte niet (`PLAN_DOELGREEP_DOSIS_NA_CHECK.md` besluit 1+2).
3. **Geen medische uitkomstbelofte.** Geen pijn-, herstel- of genezingsdoelen; geen tempo-uitspraken ("binnen 6 weken").
4. **Gewicht** mag als eigen as met eenheid, maar nooit in de ring/score en zonder tempo-belofte.
5. **Vrije tekst gaat nooit mee** in GA4-, Clarity- of PostHog-payloads. Alleen de enum-`id` en een boolean of er eigen woorden zijn ingevuld.
6. **Geen oordeelstaal.** Geen streaks, badges, "goed bezig", "achterstand" of biologische leeftijd.

---

## 6. Datamodel

De 0-10-reeks is een **tijdreeks** en hoort niet in de answers-jsonb van één sessie — dat is precies het probleem dat `carryOverMovementPlanProfile` in `movement-plan-profile.ts` moest repareren. Twee nieuwe tabellen, RLS deny-all, uitsluitend server-side via `createSupabaseAdmin()`.

```sql
-- Eén actief doel per account per domein. Situatie = gesloten enum, eigen woorden = vrije tekst.
create table if not exists public.domain_goal (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  domain text not null check (domain in ('slaap','beweging','voeding','stress','verbinding')),
  situation_id text not null,
  own_words text check (own_words is null or char_length(own_words) <= 80),
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Eén actief doel per domein; ingetrokken doelen blijven staan voor de historie.
create unique index if not exists domain_goal_active_idx
  on public.domain_goal (account_id, domain) where retired_at is null;

-- Append-only ijkpuntreeks. Nooit updaten, nooit verwijderen bij herformulering.
create table if not exists public.domain_goal_score (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.domain_goal (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  session_id uuid,
  score smallint not null check (score between 0 and 10),
  scored_at timestamptz not null default now()
);

create index if not exists domain_goal_score_goal_idx
  on public.domain_goal_score (goal_id, scored_at);

alter table public.domain_goal enable row level security;
alter table public.domain_goal_score enable row level security;
-- Geen anon/authenticated policies: alleen service role via account-API-routes.
```

**Herformulering.** Wisselt iemand van situatie, dan breekt de reeks — een 6 op "trap lopen" is niet vergelijkbaar met een 6 op "boodschappen dragen". Daarom: oude rij `retired_at` zetten, nieuwe `domain_goal` aanmaken, scores blijven aan het oude doel hangen. De UI toont dan de nieuwe reeks vanaf nul metingen met de bestaande *"Dit wordt je startpunt"*-frase.

**Migratie uitvoeren via de Supabase Dashboard SQL Editor** — nooit `supabase db push`. Verwerkingsregister + DPIA bijwerken zoals bij `movement_session_log` (vrije tekst = persoonsgegeven met eigen grondslag-regel).

---

## 7. Waar het landt in de UI

**Focusdomein — `VoortgangRichtingBeat` wordt het doelblok.** De vitaliteitsband-as verdwijnt als hoofdinhoud; wat overblijft:

- Eyebrow: `Je doel · dag {cycleDay} van 30` — `cycleDay`/`daysUntilRemeasure` komen uit `data.cycleEvidence`. `VoortgangHubScroll` heeft `data` al; `VoortgangRichtingBeat` krijgt het alleen nog niet doorgegeven (één prop erbij).
- De eigen woorden als kop, in serif — het doel is de kop, niet een label boven een grafiek.
- Modus-zin, drie standen: **verwerven** (ijkpunt stijgt of is nieuw), **behouden** (stabiel hoog), **herpakken** (ijkpunt daalt). Geen vierde stand, geen oordeel.
- IJkpunt-verloop als tekstregel (*"bij je start 4, nu 6"*), pas zichtbaar vanaf de tweede meting.
- CTA blijft naar Statistieken (zie §10) — gratis.
- Het gehardcodeerde *"berichtje van je toekomstige ik"*-blok vervalt: de blockquote noemt "twaalf dagen", een getal dat bij niemands cyclus hoort.

**Overige domeinen.** Één regel per domein in de vijf doelregels uit `PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md` §6.2. Domeinen zonder doel tonen het bestaande band-narratief — het doel is opt-in, niet verplicht.

**Zetmoment.** Direct ná de check van dat domein, één scherm, overslaan mag. Niet in de intake zelf (verlengt de flow, verlaagt de completion) en niet als losse taak in de agenda.

---

## 8. Meetplan

Twee nieuwe `domain_events`, **server-side geëmit** door de API-route die de rij schrijft. Daarmee volstaat registratie in `DOMAIN_EVENT_TYPES` (`src/lib/events.ts`) en is de drieplekken-registratie (`intake-events-client.ts` + allowlist in `api/intake/events/route.ts`) niet nodig — die is alleen voor client-events.

| Event | Payload | Afleesvraag |
|---|---|---|
| `goal.benchmark_set` | `{ domain, situation_id, has_own_words, initial_score, entry_point }` | Welke situaties kiezen mensen per domein, en hoeveel procent slaat over? |
| `goal.benchmark_rescored` | `{ domain, situation_id, score, previous_score, cycle_day, entry_point }` | Beweegt het zelfbenoemde ijkpunt mee met de domeinscore, of lopen ze uiteen? |

Die tweede vraag is de interessante: als de engine-score stijgt terwijl het ijkpunt stil blijft, meet de engine iets dat de gebruiker niet merkt. Dat is een signaal over de scoring, niet over de gebruiker.

**Nooit in de payload:** `own_words`, in geen enkele laag.

### 8.1 Meetplan-lock (bevestigd 29 juli 2026)

- **Server-side, één registratieplek.** Beide events worden geëmit door de API-route uit slice A via `emitEvent()` (`src/lib/events.ts:94`). Registratie **alleen** in `DOMAIN_EVENT_TYPES` (`src/lib/events.ts:8`). Géén `intake-events-client.ts`, géén `CLIENT_EMIT_TYPES`-allowlist in `src/app/api/intake/events/route.ts:95` — die drieplekken-route bestaat uitsluitend om browser-emits te beperken en zou hier een schrijfpad openzetten dat we niet nodig hebben.
- **`session_id` is verplicht op `goal.benchmark_rescored`.** `domain_events` heeft geen `account_id` — alleen `session_id` (FK naar `intake_sessions`) en `email` (migratie `20260529200000_domain_events.sql`). Zonder `session_id` is de engine-divergentie **niet berekenbaar**, want je kunt het ijkpunt dan niet naast de domeinscore van diezelfde check leggen. De route zet hem via het `resolveLatestSessionId`-patroon uit `api/account/movement-prefs/route.ts`.
- **`email` blijft leeg** op beide events. De join loopt over `session_id`; e-mail toevoegen zou PII opslaan zonder afleesvraag die het nodig heeft.
- **`entry_point: "check" | "domeinrij"`** in beide payloads. Doelen die buiten een check worden gezet (slice B) hebben geen bruikbare `session_id`; met dit veld filter je die uit de divergentie-analyse in plaats van ze als ruis mee te tellen.
- **`previous_score` in plaats van `delta`.** Delta is afleidbaar; `previous_score` maakt de reeks reconstrueerbaar als er een event mist of dubbel binnenkomt. Bij de eerste herscore ná het zetten is `previous_score` de baseline uit `goal.benchmark_set`.
- **Geen GA4/Clarity-variant.** Dit is durable analyse, geen funnel-signaal. Wil je later kliks op het zetmoment meten, dan is dat een bestaand `dashboard_*`-event op de knop — geen tweede kopie van deze twee.

> **Meetpunt:** `goal.benchmark_set` → `goal.benchmark_rescored` — hier lees je af of het eigen ijkpunt meebeweegt met de domeinscore, en welke situaties per domein daadwerkelijk gekozen worden.

---

## 9. Wat dit expliciet niet wordt

- Geen doel op de score-as, in geen enkel oppervlak (de balk blijft onaanraakbaar).
- Geen premium-feature. Dit is "zelf lezen" en valt onder gratis, conform de as *zelf lezen = gratis · met je meekijken = premium*.
- Geen AI-gegenereerde doelen uit vrije tekst.
- Geen doelen op de readout-domeinen (energie, herstel) — die zijn afgeleid, niet stuurbaar.
- Geen herinneringen of nudges op het doel zelf; de bestaande hermeting-reminder is het enige ritme.

---

## 10. Volgorde en afhankelijkheden

**Dit is niet geblokkeerd door S2/S3/S4.** De dosis-greep (`PLAN_DOELGREEP_DOSIS_NA_CHECK.md`, stap 8) moest wachten omdat hij naar de *routestructuur* schrijft, die door S3/S4 wordt geherdefinieerd. Het kwalitatieve doel schrijft naar een eigen tabel en raakt de route niet — het kan dus eerder.

Wel geldt: **niet tegelijk met de dosis-greep bouwen.** Beide claimen hetzelfde blok in Voortgang; twee doelbegrippen naast elkaar in één tegel is precies de verwarring die lock 5 ("positie is afgeleid, route is gekozen") probeert te voorkomen. Kwalitatief doel eerst, dosis-greep als tweede laag daarbovenop.

**Voorafgaand:** de Inzichten-IA-slice (K8 in `docs/cursors/premium-axis-wederprompt-productas-2026-07.md` §6) — CTA-herroutering en de gauge/ring-doublure. Anders bouw je het doelblok op een routering die daarna alsnog verschuift.

### 10.1 Bouwslices (herzien 29 juli 2026 — van 5 naar 4)

De oorspronkelijke vijfdeling ging uit van "zetmoment = één scherm". Dat klopt niet met de as-built: er is **geen gedeelde domeincheck-component**. `SleepCheckin.tsx`, `StressCheckin.tsx` en `MovementCapture.tsx` hebben elk een eigen `Step`-union met een eigen `result`-tak, voeding loopt via `nutrition-log` (log, geen check-in) en **verbinding heeft helemaal geen check-in-route** — dat is S6, geblokkeerd tot ná de week-0-aflezing. Slice 3 was daarmee stilletjes de grootste slice én de enige met een afhankelijkheid buiten dit traject.

Daarom: **de oude slices 1+2 samen, de oude slice 3 uit elkaar.** Netto vier slices, en na slice C is de lus compleet zonder dat er één check-in-flow is aangeraakt.

| Slice | Inhoud | Waarom deze grens |
|---|---|---|
| **A · Server** | Migratie (§6) + `src/lib/domain-goal.ts` (enums, validatie, modus-afleiding, pure helpers) + tests + API-route (zetten / herformuleren / herscoren) + server-side events (§8) | De helpers hebben buiten de route geen call-site; los reviewen betekent helpers zonder gebruiker beoordelen. Auth-patroon bestaat al: `getAccountFromCookie` + `createSupabaseAdmin`, en `resolveLatestSessionId` uit `api/account/movement-prefs/route.ts` levert de `session_id` voor de events |
| **B · Zetmoment** | `DomeinDoelZetten`-component (situatiekeuze → eigen woorden → 0-10) met **één** entry: de domeinrij in Voortgang | Eén call-site, geen intake-flow aangeraakt, werkt meteen voor alle vijf domeinen — óók verbinding, dat geen check-in heeft. Hier landt ook de ankerordening uit §11.3 |
| **C · Doelblok** | `VoortgangRichtingBeat` wordt het doelblok (§7): eyebrow `dag N van 30` via de nieuwe `data`-prop, eigen woorden als kop, modus-zin, ijkpuntregel vanaf de tweede meting; band-as en "toekomstige ik"-blockquote eruit | Leespad ná het schrijfpad. Ná deze slice is de lus rond en aflezbaar |
| **D · Check-in-haak** | Zetmoment aanhaken op de `result`-tak van `SleepCheckin` / `StressCheckin` / `MovementCapture` (+ voeding via `nutrition-log`); component uit slice B hergebruiken, niet herbouwen | Drie tot vier flows in één slice is de breedste blast radius van het traject — die hoort achteraan, waar hij een versneller is en geen blokkade. **Verbinding blijft domeinrij-only tot S6** |

Slice D is de enige die uitgesteld mag worden zonder dat het traject onaf is: zonder D werkt het doel volledig, alleen wordt het gezet vanuit Voortgang in plaats van in de flow van de check.

---

## 11. Open punten

☑ **1. PSFS-drempel — beslecht 29 juli 2026: ná de evidence-audit.** In de revalidatieliteratuur circuleert een getal voor het kleinste verschil dat mensen zelf merken op één activiteit. Dat getal komt **niet** in user-facing copy tot het door de evidence-audit is (`psf-evidence-audit-leefstijlcheck`). Tot dan toont de UI **alleen het ruwe verschil zonder interpretatie**: *"bij je start 4, nu 6"* — nooit *"twee punten is een echt verschil"*, nooit een drempelwoord ("betekenisvol", "merkbaar", "echte vooruitgang"). Bouwregel: de modus-zin (§7) leunt op de **richting** van het verschil, niet op de grootte ervan.

☑ **2. Scope bij start — beslecht 29 juli 2026: alleen het focusdomein.** Bij het eerste zetmoment wordt één doel gezet, voor het prioriteitsdomein. De overige vier domeinen zijn **opt-in vanuit de domeinrijen** (§7). Vijf doelen ineens is een intake-verlenging in vermomming.

  *Bouwgevolg — let op de valkuil:* "alleen focusdomein" verkleint de **UI-oppervlakte niet**, want het focusdomein verschilt per gebruiker. Het zetmoment moet dus alsnog voor élk domein kunnen renderen; wat het besluit wél schrapt is de meervoudige flow (nooit 2–5 doelen achter elkaar in één sessie). Zie de sliceherziening in §10.

3. **Beweeganker vs situatie.** Blijven de vier `MovementAnchor`-opties náást de zes beweegsituaties, of gaat het anker op in de situatie? **Voorstel (bouwbaar zonder data):** náást elkaar houden — het anker is het motief, de situatie de activiteit — en het bestaande anker uit `movement-prefs` gebruiken om de zes beweegsituaties te **ordenen** in het zetmoment (bekend anker → passende situaties bovenaan, alle zes blijven kiesbaar). Daarmee voelt het zetmoment nooit als dezelfde vraag voor de tweede keer, zonder een tweede ankersysteem. De evaluatievraag ("voorspelt het anker nog iets bovenop de situatie?") blijft open tot drie maanden data.
4. **Aggregatie.** De enums zijn zo gekozen dat ze over gebruikers optelbaar zijn ("38% van de mannen met slaapfocus kiest doorslapen"). Of dat ooit publiek wordt (contentmarketing, benchmarkpagina's) is een apart besluit met een eigen privacytoets. **Vooraf vastgelegde ondergrens, zodat het besluit later niet per ongeluk al genomen is:** geen enkele cel (domein × situatie) verlaat het systeem onder n = 100, nooit gekruist met een tweede as (leeftijd, profiellabel, regio), en `own_words` gaat in geen enkele vorm mee — ook niet geparafraseerd of als voorbeeldcitaat. Intern aflezen mag wel vanaf event 1.

---

*Opgesteld 29 juli 2026 n.a.v. de vraag of `VoortgangRichtingBeat` een persoonlijke doelstelling per domein kan tonen. Vervangt de doelbalk-redesignprompt van dezelfde datum, die de vitaliteitsband slechts herverfde. Verandert geen bestaande DEFER/FREEZE/KILL-status.*
