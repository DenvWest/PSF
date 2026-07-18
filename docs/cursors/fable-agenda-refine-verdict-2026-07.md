# Opus-verdict — REFINE check-in → agenda (candidate-pool + tweak) (juli 2026)

Bindend ontwerp-SSOT na de REFINE-sessie op architectuur B. Geen implementatie in dit
document — alleen het verfijnde interactie-model, prefs-schema, evidence-koppeling en fasering.

**Voorgeschiedenis:**
1. Briefing-prompt: [`fable-agenda-checkin-architectuur-2026-07.md`](fable-agenda-checkin-architectuur-2026-07.md)
2. Eerste Opus-verdict: architectuur B (vooruit 7-dagen schedule, geen `lp_*`), prioriteit-gewogen mix,
   `daily_action_log` als completie-waarheid, bouw DEFER achter week-0
3. REFINE-sessie: punt 5 te rigide (vaste kloktijden) → candidate-pool + tweak + evidence-link

**Scope:** geen code, geen commits in dit doc. Handoff-prompts pas ná week-0-trigger + akkoord.

---

## Dennis-besluiten (checklist afgerond)

| # | Besluit | Waarde |
|---|---------|--------|
| Build-trigger | DEFER → BUILD wanneer | `dashboard.daily_action_toggled` 2e-dag-retour **< 30%** in consented cohort, gemeten over **2 opeenvolgende intake-weken** |
| `agenda_preferences` | MVP-tabel meenemen? | **Ja** — geen localStorage; zonder prefs geen persistente tweak |
| Nieuw event | `agenda.slot_tweaked` | **Ja**, naast hergebruik `dashboard.daily_action_toggled` + `plan.evidence_clicked`; payload: `domain`, `tweak_type` ∈ swap\|bucket\|opt_out (geen scores) |
| Fase 1 domein | Start | **Beweging** — enige domein met volledige step-pool + triggers; verbinding blijft quickWin-only |

---

## 1. Executive summary

**Verdict:** REFINE van architectuur B — de vooruit-gegenereerde 7-dagen schedule blijft, maar
punt 5 (interactie-model) gaat van vast schema met klok-tijden naar een **candidate-pool per
domein + gebruiker-tweak** (swap binnen domein + tijdvak-keuze), met evidence als link-laag
naar bestaande bronnen.

Reden: een niet-tweakbare weekkaart is alleen een langere habit-kaart — de tweakbaarheid ís
de bestaansreden van een agenda.

- **Pool** = zichtbare stappen van de huidige fase via `selectVisibleSteps`
  (`lifestyle-plan-eval.ts:71`); verbinding = quickWin-pool van 1
- **Tijden** = bucket (ochtend/middag/avond) default, exacte klok opt-in — `PlanStep` heeft géén
  tijd-veld (`lifestyle-plan.ts:82-94`)
- **Prefs** = lichte `agenda_preferences` (account-scoped, RLS deny-all) wint van puur-afgeleid —
  persistente swap/bucket kan niet in localStorage (projectregel)
- **Evidence** = link omlaag naar `evidence_claims` / `/onderbouwing`, géén nieuwe claims
- **MVP-slice** = beweging-only + 1 swap + tijdvak-keuze, completie op `daily_action_log`
- **Bouw** blijft DEFER achter week-0 verkeer-trigger (zie checklist)

**Fit met "gratis Kompas sterker vóór betaald":** tweakbaarheid + onderbouwing verdiepen de
dagelijkse gratis-lus (retentie) met bestaande content — nul nieuwe schrijfronde, geen paywall
geraakt.

---

## 2. Hypothese-oordelen

### H1 — tweakbaarheid > vast schema

**BEVESTIGD**, met guardrail. De pool bestaat al: `selectVisibleSteps` levert 1–5 zichtbare
stappen per fase, trigger-gefilterd via `showWhen` (`lifestyle-plan-eval.ts:71-79`). Eigenaarschap
zonder de prioriteits-weging te breken kan alleen als de swap **binnen het reeds gekozen domein**
blijft — welk domein die dag het slot krijgt is upstream (prioriteit-gewogen) en blijft ongemoeid.

### H2 — evidence = link naar bestaande laag

**BEVESTIGD.** De keten `evidence_claims` → `evidence_sources` (`claim_text`, `vancouver`, `url`)
draait al (`plan-content.ts:150-168`); `/onderbouwing` rendert vancouver/pmid/url publiek
(`leefstijlcheck-evidence.ts`, `onderbouwing/page.tsx`). Voor niet-gated pijlers is een inline
claim compliance-technisch niet eens toegestaan (`approved-claims`-gate) — link is de enige
juiste vorm.

### H3 — bucket default, exacte klok opt-in

**BEVESTIGD.** `PlanStep` heeft geen tijd-veld (`lifestyle-plan.ts:82-94`); vaste klok zou én een
nieuw veld vragen én is de bron van de rigiditeit. Bucket leeft in de prefs-laag, niet in het
serialiseerbare template (dat naar PDF/e-mail/n8n moet — comment r.18-22).

### H4 — personalisatie in lichte account-scoped prefs

**BEVESTIGD.** `daily_action_log` is al account-scoped (`daily-action-log.ts:31-33`); prefs
spiegelen dat. Buckets/opt-out/chosen-id zijn géén scores/labels → veilig op te slaan, maar
nooit te exporteren naar GA4/ICS/shareable.

---

## 3. Refined interactie-model

### Refine-fit

Vast schema = geen eigenaarschap, acties zweven zonder "waarom+bron", klok-rigiditeit dwingt
iedereen in hetzelfde ritme. Candidate-pool + tweak geeft eigenaarschap binnen engine-grenzen;
evidence-link geeft "waarom+bron" zonder schrijfronde; bucket-default haalt rigiditeit eruit.

**Mix (ongewijzigd):** prioriteit-gewogen over de 5 interventies bepaalt welk domein per dag het
slot krijgt. De refine raakt alleen welke actie binnen dat domein en wanneer op de dag.

### Pool per domein

| Domein | Pool-bron | Filter | Swap |
|--------|-----------|--------|------|
| beweging/slaap/stress/voeding | `selectVisibleSteps(phase, ctx)` op huidige fase | `showWhen` (PlanCondition: signal/scoreBelow/answerAtMost) | binnen domein |
| beweging/slaap/stress/voeding (DB) | `free_action`-bucket uit `getInterventionsForTheme` | `passesSafetyFilter` (veiligheid ≥ 4, `intervention-scoring.ts:21-26`) | idem |
| verbinding | `PILLAR.verbinding.quickWin` (`dashboard/index.ts:120-133`) | n.v.t. (geen template) | geen (pool = 1); kernel-fallback `dashboard-active-plan.ts:133-144` |

Het slot bevat alleen een **gedragsstap** (`free_action` / `PlanStep`). Supplement-kind komt
nooit in het slot — alleen als gate-gefilterde link (§5).

### Completie-scheiding (verankerd)

- Dag-toggle schrijft `daily_action_log` (`action_key` = `PlanStep.id`, ≤120 tekens — `daily-log/route.ts:81`)
- Huidige fase wordt gelezen uit `plan_progress` via `computeCurrentPhaseId`
- Agenda schrijft **niet** terug naar `plan_progress` — geen dubbele boekhouding

### Voorbeeld-dag (geen week, geen vaste klokken)

- Domein vandaag (prioriteit-gewogen) = **beweging**, fase `mov-phase-deze-week`
- **Pool** (`selectVisibleSteps`, ctx-afhankelijk): `mov-thuis-basisoefening` · `mov-rustdag-na-inspanning` · `mov-trap-of-wandeling` (laatste alleen bij `MOV_CARD ≤ 2`)
- **Default gekozen:** `mov-thuis-basisoefening`. Gebruiker swapt → `mov-trap-of-wandeling` (blijft beweging; prioriteit onaangetast)
- **Bucket:** default ochtend → gebruiker zet op avond (exacte 19:00 mogelijk, opt-in)
- **Evidence:** link → `/onderbouwing` (beweging-vragen) of blog via `PlanStepLink` — geen inline claim
- **Completie:** dag-toggle → `daily_action_log(domain="beweging", action_key="mov-trap-of-wandeling")`, streak telt door

---

## 4. Prefs-datamodel + AVG-lijn

**Verdict:** REFINE — lichte `agenda_preferences`-tabel (opslag wint van puur-afgeleid).

Puur-afgeleid verliest swap-keuze en tijdvak tussen sessies; localStorage mag niet → persistentie
vereist een tabel. Greenfield bevestigd: `agenda_preferences` / `account_preferences` /
`agenda_entries` bestaan nergens (grep `src/` + `supabase/`).

### Schema-voorstel (ontwerp — geen migratie in dit doc)

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

- **RLS:** deny-all, service-role only via `createSupabaseAdmin()` — spiegelt `daily_action_log`
  en het `pd_*`/`af_*`-patroon
- **AVG:** kolommen dragen geen scores/labels/PII — alleen stabiele step-id, bucket-enum, bool.
  Nooit naar GA4/Clarity/ICS/shareable. Externe slot-titel blijft generiek ("Eiwitrijk ontbijt"),
  nooit "voeding 38/100" of "Lage Batterij" (art. 9)
- **Precedent:** `personalizeLifestyleText` varieert copy op voorkeur/allergie zonder scoring te
  raken (`nutrition-advice-personalization.ts:47-83`) — `agenda_preferences` is dezelfde vorm,
  één niveau hoger (welke actie, welk tijdvak)

---

## 5. Evidence-koppeling (Kompas → Onderbouwing → Kennisbank)

Drie lagen, alle bestaand — het slot linkt omlaag, embedt nooit een claim:

| Laag | Vorm | Bron |
|------|------|------|
| **Kompas** (slot) | WIIFM + actie | `PlanStep.title` + `rationale.body` (movement.ts e.a.) |
| **Onderbouwing** | feitelijk + bron | `/onderbouwing` óf `evidence_claims` + `evidence_sources` (`plan-content.ts:150-168`) |
| **Kennisbank** | termen | `PlanStepLink.kind = "kennisbank"` (`lifestyle-plan.ts:69`) |

**Gate-eerlijkheid:** tier ≤ 3 vereist gepubliceerde EFSA-geautoriseerde claim, anders
`ready:false` (`plan-content.ts:272-279`). Pijlers zonder verified tier-3 (ashwagandha on_hold,
melatonine forbidden — `approved-claims.ts:377-394`) krijgen geen supplement-link in het slot.
Gedragsstappen linken naar question-level onderbouwing. Geen nieuwe schrijfronde.

**Meet:** `plan.evidence_clicked` bestaat al (`events.ts:30`).

---

## 6. Fasering + privacy-gates + meetpunten

Alle bouw **DEFER** achter week-0 verkeer-trigger (checklist).

| Slice | Verdict | Scope | Meetpunt |
|-------|---------|-------|----------|
| (a) beweging-only + swap + tijdvak | REFINE-KEEP (MVP) | pool uit `selectVisibleSteps(movementPlan)`; bucket-default; completie `daily_action_log` | `dashboard.daily_action_toggled` (hergebruik) + **nieuw** `agenda.slot_tweaked` |
| (b) evidence-link | KEEP | PlanStep → `/onderbouwing` / `evidence_claims` | `plan.evidence_clicked` (hergebruik) |
| (c) `agenda_preferences` | REFINE — gekoppeld aan (a) | tabel + RLS deny-all | leest mee op `agenda.slot_tweaked` |

**(c) niet los-DEFER'en van (a):** zonder tabel geen persistente tweak, alleen bucket-default.

**Harde privacy-gate (fase ≥ 2, geblokkeerd in MVP):** push, ICS-export, Google/Outlook-OAuth →
verwerkingsregister + DPA + DPIA eerst. MVP-reminder = in-app only (Kompas sorteert slot in
dagdeel; geen cron, geen push).

**Nieuw event (bij implementatie):** `agenda.slot_tweaked` — registratie op drie plekken
(`events.ts` + account-events-client + route-allowlist); payload zonder scores/PII.

**Effect aflezen:** swap-ratio + completie-streak per domein via `daily_action_toggled` vs
`agenda.slot_tweaked`.

---

## 7. NIET-lijst

1. Geen vaste klok-tijden in schedule/template — exacte tijd alleen opt-in in `agenda_preferences`
2. Geen tweede scoring-waarheid — swap binnen engine-geselecteerd domein
3. Geen energie/herstel-slot/-swap/-tweak — readout only (`domain-role.ts`)
4. Geen verbinding-template of check-in bouwen — quickWin-pool van 1
5. Geen scores/profiel-/domeinlabels in reminder/ICS/shareable (art. 9)
6. Geen nieuwe medische claim inline — evidence uitsluitend als link
7. Geen supplement-CTA in het slot — gate-gefilterde link only
8. Geen push/ICS/OAuth in MVP — register/DPA/DPIA-gate, fase ≥ 2
9. Geen localStorage voor tweaks — persistente prefs uitsluitend via Supabase
10. Geen bouw vóór week-0 trigger
11. Geen `lp_*`-engine — week is puur afgeleid (eerste verdict blijft staan)

---

## 8. Doc-drift (aparte doc-PR vóór bouw)

`ARCHITECTUUR_LIFESTYLE_PLANNER.md` noemt `energy`/`recovery` als planner-modules en mist
`connection`. Corrigeren naar `DOMAIN_MODEL.md`: planner-modules = 5 interventies;
energy/recovery = readout-insight-laag, geen module.

---

## 9. Handoff-prompts (pas ná week-0-trigger + akkoord)

1. **Beweging-agenda MVP-slice** — pool uit `selectVisibleSteps` + bucket-default + 1 swap,
   completie op `daily_action_log`
2. **agenda_preferences schema + RLS deny-all** — kolommen zoals §4, service-role-only
3. **Evidence-link-laag agenda → onderbouwing** — PlanStep koppelt omlaag; `plan.evidence_clicked`
   hergebruiken

---

## Na uitvoering

1. Week-0 aflezen: 2e-dag-retour `daily_action_toggled` vs drempel 30% — trigger slaat ja/nee
2. Bij trigger: handoff 1–3 in aparte Cursor-sessies, één PR met feature-flag
3. Planner-doc drift (§8) in doc-only PR vóór of parallel aan implementatie
4. Bij implementatie: `agenda.slot_tweaked` + allowlist; register-check als ICS/OAuth ooit fase 2 wordt

**Meetpunt (bestaand + nieuw):** `dashboard.daily_action_toggled` + `agenda.slot_tweaked` +
`plan.evidence_clicked` — adherence, tweak-ratio en evidence-engagement per domein.
