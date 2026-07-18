# Verdict — check-in → agenda: REFINE van architectuur B (juli 2026)

**Type:** Opus architectuur-/productverdict (REFINE). Geen implementatie — brondocument voor de handoffs.
**Briefing:** `docs/cursors/fable-agenda-checkin-architectuur-2026-07.md`
**Status:** ontwerp gelockt · bouw DEFER achter retentie-trigger · vastgelegd 18 jul 2026 (Dennis akkoord op 4 besluiten)
**Regels:** scoring dicht · readouts nooit slot/tweak · geen scores/PII in reminder/ICS · evidence = link only · verbinding = quickWin · nooit automatisch committen.

---

## 0. Verdict in één zin

De vooruit-gegenereerde 7-dagen schedule (architectuur **B**) blijft; het interactie-model gaat van *vast schema met klok-tijden* naar een **candidate-pool per domein + gebruiker-tweak** (swap binnen domein + tijdvak-bucket), met **evidence als link-laag** naar bestaande bronnen. Een niet-tweakbare weekkaart is alleen een langere habit-kaart — de tweakbaarheid ís de bestaansreden van een agenda.

**Fit met "gratis Kompas sterker vóór betaald":** tweakbaarheid + onderbouwing verdiepen de *dagelijkse* gratis-lus (retentie) met bestaande content — nul nieuwe schrijfronde, geen paywall geraakt.

---

## 0b. Precursor (pre-trigger, jul 2026)

**Vóór** de weekagenda-MVP: herontwerp van `VandaagCard` op Kompas tot één **1-slot prioriteit-check-in** — geen nieuwe tab, route of tabel.

| Precursor (nu) | Weekagenda (DEFER) |
|---|---|
| Auto tier-1 lifestyle-stap uit prioriteit 1 | 7-dagen schedule + multi-domein-mix |
| Evidence = link (“Waarom?” → `/onderbouwing`) | Swap binnen domein + tijdvak-bucket |
| Completie = `daily_action_log` | + `agenda_preferences` + `agenda.slot_tweaked` |

Copy: weg met “Vandaag · PRIORITEIT · Op basis van je laatste check-in” — één rustige check-in (actie + waarom + gedaan). Prioriteit blijft engine, geen UI-jargon. Meetpunten: hergebruik `dashboard_vandaag_*`, daily-log toggle, onderbouwing-click — geen nieuwe domain_events.

---

## 1. Vier gelockte besluiten (18 jul 2026)

| # | Besluit | Detail |
|---|---------|--------|
| 1 | **Build-trigger DEFER→BUILD** | 2e-dag-retour (volgende kalenderdag) van de dagelijkse-actie-habit over **alle geactiveerde accounts**, per activatie-week, **< 30% in 2 opeenvolgende weken** (met N-floor) → bouw MVP-slice. Anders blijft DEFER. Consent-filter vervalt (besluit 18 jul): `daily_action_log` is functionele first-party data achter login; analytics-consent geldt voor GA4/Clarity, niet voor een intern aggregaat op je eigen tabel. Meetdefinitie + query = Appendix A. Logica: lekt de 1-habit-kaart, dan is de tweakbare agenda de weddenschap; houdt hij mensen vast, dan is de agenda onbewezen overhead. |
| 2 | **`agenda_preferences` = kleine MVP-tabel** | Account-scoped, RLS deny-all, service-role-only. Geen localStorage → zonder prefs geen echte tweak. |
| 3 | **Nieuw event `agenda.slot_tweaked`** | Naast hergebruik van `dashboard.daily_action_toggled` (completie) + `plan.evidence_clicked` (evidence). Payload: `domain`, `tweak_type` (swap/bucket/opt_out) — **geen scores**. |
| 4 | **Fase 1 = beweging** | `movementPlanTemplate` is het enige domein met volledige step-pool + eiwit/creatine-triggers. Verbinding blijft quickWin-only. |

---

## 2. Hypothese-oordelen

- **H1 — tweakbaarheid > vast schema: BEVESTIGD, met guardrail.** Pool bestaat al (`selectVisibleSteps` levert 1–5 zichtbare stappen per fase, trigger-gefilterd via `showWhen` — [`lifestyle-plan-eval.ts:71-79`](../../src/lib/lifestyle-plan-eval.ts#L71-L79)). Eigenaarschap zonder de prioriteits-weging te breken kan alleen als de swap **binnen het reeds gekozen domein** blijft.
- **H2 — evidence = link naar bestaande laag: BEVESTIGD.** `evidence_claims → evidence_sources (claim_text, vancouver, url)` draait al ([`plan-content.ts:150-168`](../../src/lib/content/plan-content.ts#L150-L168)); `/onderbouwing` rendert vancouver/pmid/url publiek. Voor niet-gated pijlers is een inline claim compliance-technisch niet eens toegestaan.
- **H3 — bucket default, exacte klok opt-in: BEVESTIGD.** `PlanStep` heeft geen tijd-veld ([`lifestyle-plan.ts:82-94`](../../src/types/lifestyle-plan.ts#L82-L94)); vaste klok = bron van de rigiditeit. Bucket leeft in de prefs-laag, niet in het serialiseerbare template.
- **H4 — personalisatie in lichte account-scoped prefs: BEVESTIGD.** `daily_action_log` is al account-scoped ([`daily-action-log.ts:31-33`](../../src/lib/daily-action-log.ts#L31-L33)); prefs spiegelen dat. Buckets/opt-out/chosen-id zijn geen scores/labels → veilig op te slaan, nooit te exporteren.

---

## 3. Refined interactie-model

**Mix (ongewijzigd):** prioriteit-gewogen over de 5 interventies bepaalt *welk domein* per dag het slot krijgt. De refine raakt alleen *welke actie binnen dat domein* en *wanneer op de dag*.

**Pool per domein:**

| Domein | Pool-bron | Filter | Swap |
|--------|-----------|--------|------|
| beweging / slaap / stress / voeding | `selectVisibleSteps(phase, ctx)` op de huidige fase | `showWhen` (PlanCondition: signal / scoreBelow / answerAtMost) | binnen domein, pool = zichtbare stappen |
| idem (DB-variant) | `free_action`-bucket uit `getInterventionsForTheme` | `passesSafetyFilter` (veiligheid ≥ 4, [`intervention-scoring.ts:21-26`](../../src/lib/content/intervention-scoring.ts#L21-L26)) | idem |
| verbinding | `PILLAR.verbinding.quickWin` ([`dashboard/index.ts:120-133`](../../src/data/dashboard/index.ts#L120-L133)) | n.v.t. (geen `connection.ts`) | **geen** (pool = 1); kernel-fallback [`dashboard-active-plan.ts:133-144`](../../src/lib/dashboard-active-plan.ts#L133-L144) |

Het **slot bevat alleen een gedragsstap** (`free_action` / PlanStep). Supplement-kind komt nooit in het slot — alleen als gate-gefilterde link (§5).

**Completie-scheiding (verankerd):** dag-toggle schrijft `daily_action_log` (`action_key` = `PlanStep.id`, ≤120 tekens vrij veld — [`daily-log/route.ts:81`](../../src/app/api/account/daily-log/route.ts#L81)). De huidige *fase* wordt gelezen uit `plan_progress` via `computeCurrentPhaseId`; de agenda schrijft daar **niet** naar terug — geen dubbele boekhouding.

**Eén voorbeeld-dag (geen week, geen vaste klokken):**
- Domein vandaag (prioriteit-gewogen) = **beweging**, fase `mov-phase-deze-week`.
- **Pool** (`selectVisibleSteps`, ctx-afhankelijk): `mov-thuis-basisoefening` · `mov-rustdag-na-inspanning` · `mov-trap-of-wandeling` (laatste alleen bij `MOV_CARD ≤ 2`).
- **Default gekozen**: `mov-thuis-basisoefening`. Gebruiker **swapt** → `mov-trap-of-wandeling` (blijft beweging; prioriteit onaangetast).
- **Bucket**: default `ochtend` → gebruiker zet op `avond` (exacte `19:00` mogelijk, maar opt-in).
- **Evidence** onder het slot: link → `/onderbouwing` (beweging-vragen) of bestaand blog-artikel via `PlanStepLink` — geen inline claim.
- **Completie**: dag-toggle → `daily_action_log(domain="beweging", action_key="mov-trap-of-wandeling")`, streak telt door.

---

## 4. Prefs-datamodel + AVG-lijn

**Verdict: lichte `agenda_preferences`-tabel wint van puur-afgeleid.** Persistente swap/tijdvak kan niet in localStorage (projectregel). Greenfield bevestigd — `agenda_preferences` / `account_preferences` / `agenda_entries` bestaan nergens (grep src/ + supabase/).

Schema-voorstel (geen migratie — ontwerp):

```
agenda_preferences
  account_id         uuid  fk accounts
  domain             text  (NL-pijler: "beweging" …)
  chosen_action_key  text  null → default = eerste zichtbare stap
  time_bucket        text  ochtend|middag|avond, null → afgeleide default
  exact_time         time  null → alléén bij opt-in
  opt_out            bool  default false
  updated_at         timestamptz
  unique (account_id, domain)
```

- **RLS: deny-all, service-role only** via `createSupabaseAdmin()` — spiegelt `daily_action_log` en het `pd_*`/`af_*`-patroon.
- **AVG-lijn:** kolommen dragen **geen scores/labels/PII** — alleen een stabiele step-id, een bucket-enum en een bool. Nooit naar GA4/Clarity/ICS/shareable. Slot-titel die ooit extern zou verschijnen blijft generiek ("Eiwitrijk ontbijt"), nooit "voeding 38/100" of "Lage Batterij" (art. 9).
- **Precedent:** `personalizeLifestyleText` varieert copy op voorkeur/allergie **zonder** de scoring te raken ([`nutrition-advice-personalization.ts:47-83`](../../src/lib/nutrition-advice-personalization.ts#L47-L83)) — `agenda_preferences` is dezelfde vorm, één niveau hoger (welke actie, welk tijdvak), geen tweede scoring-waarheid.

---

## 5. Evidence-koppeling (Kompas → Onderbouwing → Kennisbank)

Drie lagen, alle bestaand — het slot **linkt omlaag, embedt nooit een claim**:

1. **Kompas (slot)** = WIIFM + actie: `PlanStep.title` (imperatief) + `rationale.body` (mechanisme). Reeds geschreven in [`movement.ts`](../../src/data/lifestyle-plans/movement.ts) e.a. Geen bron inline.
2. **Onderbouwing** = feitelijk + bron: link naar `/onderbouwing` (publiek, question-level) óf, voor DB-plannen, naar `evidence_claims.claim_text` + `evidence_sources.vancouver/url` ([`plan-content.ts:150-168`](../../src/lib/content/plan-content.ts#L150-L168)). Hergebruikte velden: `claim_text`, `vancouver`, `url`, `pmid`.
3. **Kennisbank** = termen: `PlanStepLink.kind = "kennisbank"` bestaat al ([`lifestyle-plan.ts:69`](../../src/types/lifestyle-plan.ts#L69)).

**Gate-eerlijkheid (geen gat, maar mechanisme):** tier ≤ 3 vereist een gepubliceerde, EFSA-geautoriseerde claim, anders `ready:false` ([`plan-content.ts:272-279`](../../src/lib/content/plan-content.ts#L272-L279)). Pijlers zonder verified tier-3 — ashwagandha `on_hold`, melatonine `forbidden` ([`approved-claims.ts:377-394`](../../src/data/approved-claims.ts#L377-L394)) — krijgen simpelweg **geen supplement-link** in het slot. Gedragsstappen (`free_action`) hebben geen EFSA-claim nodig en linken naar de question-level onderbouwing. **Geen nieuwe schrijfronde**: selectie + link, geen authoring. Meet: `plan.evidence_clicked` bestaat al ([`events.ts:30`](../../src/lib/events.ts#L30)).

---

## 6. Fasering + privacy-gates + meetpunten

Alle bouw **DEFER** achter de week-0/retentie-trigger (§1.1); hieronder de ontwerp-gerede slices.

| Slice | Verdict | Scope | Risico/Privacy | Meetpunt |
|-------|---------|-------|----------------|----------|
| **(a) beweging-only + 1 swap + tijdvak** | **REFINE-KEEP (MVP)** | pool uit `selectVisibleSteps(movementPlan)`; bucket-default afgeleid; completie op `daily_action_log` | laag; account-scoped, geen export | completie = `dashboard.daily_action_toggled` (hergebruik, [`events.ts:16`](../../src/lib/events.ts#L16)); tweak = **1 nieuw event** `agenda.slot_tweaked` |
| **(b) evidence-link** | **KEEP** | `PlanStep` → `/onderbouwing` / `evidence_claims` | laag; publieke evidence | `plan.evidence_clicked` (hergebruik) |
| **(c) `agenda_preferences` opslag** | **REFINE — gekoppeld aan (a)** | tabel + RLS deny-all; persistente swap/bucket | laag; deny-all service-role, geen PII | leest mee op `agenda.slot_tweaked` |

**Waarom (c) niet los-DEFER't van (a):** persistente swap kan niet in localStorage → zonder de tabel is er geen tweakbaarheid, alleen een bucket-default. Klein genoeg om deel van de MVP-slice te zijn.

**Harde privacy-gate (fase ≥ 2, geblokkeerd in MVP):** push/service-worker, ICS-export, Google/Outlook-OAuth — nieuwe verwerker/doorgifte → **verwerkingsregister + DPA + DPIA** eerst. Bucket → reminder = **in-app only** in MVP (Kompas sorteert het slot in het juiste dagdeel; geen cron, geen push).

---

## 7. Meetbaarheid van de build-trigger — opgelost (18 jul)

Onderzoek wees uit dat **"consented cohort" niet server-side berekenbaar is**: analytics-consent leeft in een cookie (`psf_analytics_consent`, [`analytics-consent.ts:8`](../../src/lib/analytics-consent.ts#L8)), de `consent_records`-rij draagt alleen `ipHash`/`uaHash` — geen email/account ([`consent/analytics/route.ts:78-91`](../../src/app/api/consent/analytics/route.ts#L78-L91)) — en `consent.analytics_set` wordt zonder email/session_id geëmit ([`route.ts:128-132`](../../src/app/api/consent/analytics/route.ts#L128-L132)). Er is dus géén brug van `daily_action_log.account_id` naar een consent-status.

**Besluit (Dennis, 18 jul): consent-filter vervalt; cohort = alle geactiveerde accounts.** `daily_action_log` is functionele first-party data achter login; de analytics-consent-gate geldt voor derde-partij-trackers (GA4/Clarity), niet voor een intern aggregaat op je eigen tabel. Daarmee is de trigger volledig berekenbaar uit één geverifieerde tabel, zonder nieuwe join, zonder PII, zonder codewijziging — alleen een leesquery.

**Definitie:**
- **Teller** = geactiveerde accounts die op `first_date + 1` (volgende kalenderdag) opnieuw een dagelijkse actie toggelden.
- **Noemer** = accounts die op hun eerste actieve dag (`first_date`) minstens één actie toggelden (= geactiveerd), gegroepeerd per **activatie-week** (`date_trunc('week', first_date)`).
- **N-floor** = weken met noemer < floor tellen niet mee (pre-traffic-regel: geen drempel-tuning op ruis). Startwaarde ter besluit — advies ≥ 30 accounts/week.
- **Trigger** = 2 opeenvolgende kwalificerende weken met `retention_day2_pct < 30` → DEFER→BUILD.

De volledige leesquery staat in **Appendix A** (Supabase SQL Editor, read-only, draaien zodra er verkeer is). Anker = activatie-week uit `daily_action_log` (enige volledig geverifieerde bron); wil je intake-week als anker, dan join op `accounts.created_at` of het `intake.completed`-event — kolom/veld eerst verifiëren.

---

## 8. NIET-lijst

1. **Geen vaste klok-tijden** in de afgeleide schedule of het template — exacte tijd alleen opt-in in `agenda_preferences`.
2. **Geen tweede scoring-waarheid** — swap kiest binnen het al door de engine geselecteerde domein; `intake-engine` + `intervention-scoring` niet herwogen.
3. **Geen energie/herstel-slot/-swap/-tweak** — readout only ([`domain-role.ts:9-23`](../../src/lib/domain-role.ts#L9-L23)); blijft dag-inzicht (delta).
4. **Geen verbinding-template of check-in bouwen** — quickWin-pool van 1 (geen `connection.ts`; kernel-fallback).
5. **Geen scores/profiel-/domeinlabels** in reminder/ICS/shareable — slot-titel generiek (art. 9).
6. **Geen nieuwe medische claim inline** — evidence uitsluitend als link naar bestaande `evidence_claims`/`/onderbouwing`.
7. **Geen supplement-CTA in het slot** — supplement-kind blijft gate-gefilterde link (approved-claims).
8. **Geen push/ICS/OAuth in MVP** — register/DPA/DPIA-gate, fase ≥ 2.
9. **Geen localStorage** voor tweaks — persistente prefs uitsluitend via Supabase.
10. **Geen bouw vóór de trigger** — deze sessie levert alleen ontwerp.

---

## 9. Handoffs (pas ná trigger + akkoord)

0. **(voorwaarde) Meet-slice trigger-evaluatie** — gedocumenteerd, **geen codewijziging**: leesquery (Appendix A) op `daily_action_log`, alle geactiveerde accounts, activatie-week + N-floor; leest af of DEFER omslaat zodra er verkeer is.
1. **Beweging-agenda MVP-slice** — pool uit `selectVisibleSteps` + bucket-default + 1 swap, completie op `daily_action_log`.
2. **`agenda_preferences` schema + RLS deny-all** — kolommen (account_id, domain, chosen_action_key, time_bucket, exact_time, opt_out), service-role-only.
3. **Evidence-link-laag agenda → onderbouwing** — `PlanStep` koppelt omlaag naar `evidence_claims`/`/onderbouwing`, `plan.evidence_clicked` hergebruikt.

---

---

## 10. Uitrolvolgorde (gated — besluit 18 jul)

Eén doorlopende, poort-bewaakte lijn. Elke stap ontgrendelt de volgende; niets springt vooruit.

1. **Handoff 0** — Appendix A-query op **prod** draaien, N-floor vaststellen, **2 weken afwachten**. (Meet-werk, pre-traffic-legaal, geen code.)
2. **Trigger slaat?** (2 opeenvolgende weken `retention_day2_pct < 30` ≥ N-floor) → **Handoff 1 (beweging-MVP)** + **Handoff 2 (`agenda_preferences`)**. Anders: DEFER blijft.
3. **Lift zichtbaar?** (retentie meetbaar omhoog ná de MVP) → **fase 2–5** (slaap/stress/voeding als volle pool, verbinding quickWin-only) + **agenda herberekenen na elke check-in** (arch B: afgeleid uit de laatste check-in, geen statisch schema).
4. **Pas dán beslissen:** is een **`focus_nudge`**-mechanisme nodig, of zijn de bestaande check-ins genoeg? Open, geparkeerd — geen bouw, geen ontwerp vóór stap 3 data oplevert.

**Handoff 3 (evidence-link):** mag **parallel** als losse, kleine PR op de bestaande `PlanStep`/vandaag-kaart. **Niet blokkerend, niet verplicht vóór stap 1.** Pre-traffic content/koppelwerk zonder nieuwe tabel.

---

## Appendix A — build-trigger meetquery (handoff 0)

Read-only. Draaien in de **Supabase Dashboard SQL Editor** (projectconventie voor DB-toegang) zodra er verkeer is. Geen `src/`-wijziging, geen migratie. Bron = `daily_action_log` (`account_id`, `domain`, `action_key`, `log_date` — [`daily-action-log.ts:31-74`](../../src/lib/daily-action-log.ts#L31-L74)). Domein-agnostisch: de trigger meet of iemand *überhaupt* de volgende dag terugkomt op de dagelijkse-actie-habit, niet per domein.

```sql
-- 2e-dag-retour (volgende kalenderdag) van de dagelijkse-actie-habit, per activatie-week.
-- Cohort = alle geactiveerde accounts (geen consent-filter; functionele first-party data).
with first_activity as (
  select account_id, min(log_date) as first_date
  from daily_action_log
  group by account_id
),
scored as (
  select
    fa.account_id,
    fa.first_date,
    date_trunc('week', fa.first_date::timestamp)::date as cohort_week,
    exists (
      select 1 from daily_action_log d
      where d.account_id = fa.account_id
        and d.log_date = fa.first_date + 1          -- volgende kalenderdag
    ) as returned_day2
  from first_activity fa
)
select
  cohort_week,
  count(*)                                as activated_accounts,   -- noemer
  count(*) filter (where returned_day2)   as returned_day2_count,  -- teller
  round(100.0 * count(*) filter (where returned_day2)
        / nullif(count(*), 0), 1)         as retention_day2_pct
from scored
group by cohort_week
order by cohort_week;
```

**Afleesregel:** DEFER→BUILD zodra **2 opeenvolgende** `cohort_week`-rijen beide voldoen aan `activated_accounts >= :n_floor` **én** `retention_day2_pct < 30`. Anders blijft DEFER.

**Open definitie-keuzes (Dennis):**
- `:n_floor` per week — advies ≥ 30 (pre-traffic-regel: geen drempel-tuning op ruis).
- Retour-venster — default = exact volgende dag (`+ 1`). Variant "terug binnen 7 dagen" = `d.log_date between fa.first_date + 1 and fa.first_date + 7`; kies bewust (strenger = eerder BUILD-signaal).
- Anker = activatie-week (uit `daily_action_log`). Wil je intake-week: join `accounts.created_at` of `intake.completed` — veld eerst verifiëren.

---

_Geheugen: `psf-agenda-checkin-verdict.md`. Verwant: leefstijlcheck-herziening · meet-roadmap · dashboard-tabshell · moat & premium-gating._
