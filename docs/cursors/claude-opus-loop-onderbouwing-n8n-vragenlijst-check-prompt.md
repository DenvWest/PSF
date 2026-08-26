# Prompt — Loop onderbouwing: vragenlijst-check als product-dienst, evidence, n8n, EU-wet

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, met repo-toegang in `~/psf`).
> **Output:** één verdict-markdown. **Geen code, geen diffs, geen SQL, geen HTML-prebuild, geen commits.**
> **Opgesteld:** 26 augustus 2026.
> **Aanleiding:** de leefstijlcheck en de domeinchecks lopen als twee producten met twee uitkomsten; Kompas heeft nu drie gescheiden naden (welk domein · welke laag · welke inhoud) waar later producten en diensten op landen. Deze ronde toetst die loop feitelijk tegen evidence, n8n-koppelbaarheid en EU-wet — vóór verdere bouw.

## Plaats in de reeks

| Doc | Relatie |
| --- | --- |
| Dit document | **Denkronde** — plattegrond + onderbouwing + n8n + wet; geen Cursor-bouw |
| [claude-analyse-plan-fase-n8n-tier-prompt.md](claude-analyse-plan-fase-n8n-tier-prompt.md) | n8n was outbound-only; hier: koppeling aan check + hertest → kompas-schap |
| [PROMPT_CLAUDE_LEEFSTIJLCHECK_SCOPE.md](../plan/PROMPT_CLAUDE_LEEFSTIJLCHECK_SCOPE.md) | Scope-review (verbinding als anker); **niet herdoen** |
| [LEEFSTIJLCHECK_EXPERT_REVIEW.md](../research/LEEFSTIJLCHECK_EXPERT_REVIEW.md) | Per-vraag psychometrie juli 2026, engine 1.3.1; **niet herdoen**, wél delta tot 1.6.0 |
| [claude-opus-ecosysteem-aanbevelingsmotor-prompt.md](claude-opus-ecosysteem-aanbevelingsmotor-prompt.md) | Kompas = aanbevelingsmotor; deze ronde toetst de *aanvoer* (check → naad 1–3) |
| [KOMPAS_SIDEBAR_ROADMAP_2026-08.md](KOMPAS_SIDEBAR_ROADMAP_2026-08.md) | Surface-rollen lock; heropenen alleen onder PIVOT |
| [opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md](opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md) | Bond = oordeel, niet locatie; niet heropenen |

## Gebruiksinstructie

1. Open **Claude Opus** in een **nieuw** gesprek met repo-toegang.
2. Kopieer het volledige blok onder **Prompt (copy-paste)**.
3. Claude leest de leeslijst zelf — geen bijlagen meeplakken.
4. Output = **alleen** `docs/cursors/opus-loop-onderbouwing-n8n-vragenlijst-check-verdict-2026-08.md` met secties A–H.
5. **Niets bouwen** vóór Dennis' review van het verdict.

## Wat Dennis vooraf vasthoudt (hint — toets, neem niet blind over)

- Twee producten, twee uitkomsten: leefstijlcheck (breed, 30d hermeting) vs domeincheck (diep, 14d, één pijler).
- Drie naden op Kompas liggen nu apart en zijn de basis om later inhoud, producten en diensten bij te sturen — niet de tegel verbouwen.
- n8n is voorbereid in code, **niet live**. Nurture/hertest-mail loopt via Resend.
- Feitelijk houden: geen verzonnen papers, geen verzonnen wetparagrafen. ABSENT mag.

---

## Prompt (copy-paste)

```text
## Rol
Je bent tegelijkertijd:
- product-architect voor PerfectSupplement (perfectsupplement.nl) — mannen 40+,
  "Consumentenbond van supplementen / leefstijl", affiliate-monetisatie, geen eigen
  producten vandaag
- evidence-reviewer — richtlijnen en wat in de repo staat, geen nieuwe papers verzinnen
- n8n/orchestratie-architect — app blijft bron van waarheid; n8n is timing/kanaal
- compliance-reviewer — NL/EU: AVG art. 9, Claimsverordening 1924/2006, MDR 2017/745
  + MDCG 2019-11, DPIA art. 22, ePrivacy/cookies; AI Act alleen als hiaat markeren

Je levert één VERDICT-markdown. GEEN code, GEEN JSX, GEEN SQL, GEEN Tailwind,
GEEN HTML-prebuild, GEEN commits. Nederlands; paden, types en event-namen Engels.

Je bent niet meegaan met een mooi verhaal. Citeer pad:regel. Als iets ontbreekt:
schrijf ABSENT. Verzinnen is een fout.

## Doel
Beantwoord in één ronde, feitelijk:

1. Hoe lopen de leefstijlcheck en de domeinchecks NU, inclusief beide aparte
   uitkomsten — als plattegrond van de product-dienst.
2. Zet die loop tegenover wetenschap-evidence-aanbeveling: wat de UI/nurture/schap
   aanbeveelt vs wat `/onderbouwing` en de eigen evidence-bestanden dragen.
3. Hoe is n8n NU in te verbinden aan vragenlijst-check + hertest → kompas-schap,
   inclusief de drie Kompas-naden (domein · laag · inhoud).
4. Hoe loopt dezelfde keten onder Europees recht (consent → art. 9 → scoring →
   uitkomst → events/n8n/analytics → retentie).

## Vaste defaults (niet heropenen zonder PIVOT + schade)

1. Surface-rollen uit docs/cursors/KOMPAS_SIDEBAR_ROADMAP_2026-08.md — Kompas
   beveelt aan, Mijn Dag vinkt af, Voortgang meet, Favorieten/schap is oordeel-archief.
2. 5 interventiedomeinen + 2 readouts (domain-role.ts). Energie/herstel blijven readout.
3. Dual readout Bond vs fit (BESLUIT_FIT_PREFS L1–L2) — nooit één samengevoegd cijfer.
4. Geen diagnose-taal. Adviezen, geen diagnoses. EFSA via approved-claims.
5. Per-vraag psychometrie uit docs/research/LEEFSTIJLCHECK_EXPERT_REVIEW.md (juli 2026,
   RULES_VERSION 1.3.1) NIET overdoen. Wél: wat veranderde tot intake-engine.ts
   RULES_VERSION 1.6.0, en of die delta de LOOP (check → uitkomst → Kompas) raakt.
6. Fable 7×7 domain-gap NIET opnieuw. Verbinding-schap-lock en CON_* vs cprofile_*
   firewall blijven.
7. src/app/intake/ niet "verbouwen" in het verdict — alleen beschrijven.
8. Geen inbound-n8n ontwerpen als bouwplan. Alleen triage: WEL / DEELS / NIET.

## Lees vóór je begint (open echt — citeer pad:regel)

### Docs — product / evidence
- docs/core/INTAKE_SYSTEM.md
- docs/core/DOMAIN_MODEL.md
- docs/core/STEPPED_CARE_MODEL.md
- docs/core/COMPLIANCE.md (EFSA, MDR-grens, verbinding-kill-lijst)
- docs/core/ENTITY_MODEL.md (domain_events)
- docs/research/LEEFSTIJLCHECK_EXPERT_REVIEW.md (baseline, niet herdoen)
- docs/research/LEEFSTIJLCHECK_SCOPE_REVIEW.md (alleen waar de loop sindsdien week)
- docs/cursors/KOMPAS_SIDEBAR_ROADMAP_2026-08.md
- docs/cursors/claude-analyse-plan-fase-n8n-tier-prompt.md (n8n outbound-only stand)

### Docs — wet / register
- docs/core/VERWERKINGSREGISTER.md (n8n/PostHog "niet actief"; art. 9)
- docs/core/DPIA.md (R7 art. 22; scoring = geautomatiseerde beoordeling)
- src/app/privacy/page.tsx (noemt n8n ABSENT)
- src/data/leefstijl-disclaimer.ts
- src/lib/consent-texts.ts

### Code — twee checks + uitkomsten
- src/data/intake-questions.ts (16 vragen; copy elders zegt soms 15)
- src/lib/intake-engine.ts (RULES_VERSION 1.6.0) — GEEN src/lib/scoring.ts
- src/lib/intake-compute.ts
- src/app/api/intake/session/route.ts (intake.completed / remeasure.completed)
- src/app/api/account/remeasure/start/route.ts
- src/app/intake/{slaap,stress,voeding,beweging}/page.tsx
- src/app/api/intake/{sleep-checkin,stress-checkin,movement-checkin,nutrition-log}/route.ts
- src/data/sleep-checkin/ · stress-checkin/ · movement-checkin/ · nutrition/lifescore-questions.ts
- src/lib/account-dashboard.ts (latest-wins series: intake ∪ checkin ∪ nutrition_log)
- src/lib/domain-measurements.ts
- src/lib/kompas-domain-check.ts (DOMAIN_CHECK_INTERVAL_DAYS = 14; verbinding = remeasure)
- src/lib/kompas-home.ts
- src/data/leefstijlcheck-evidence.ts + src/app/onderbouwing/page.tsx
- src/app/onderbouwing/voeding/page.tsx

### Code — drie naden (augustus 2026, live geverifieerd)
- src/lib/priority-over-time.ts → shouldShowEngineShiftNudge
- src/lib/account-priority-pref.ts → PriorityPrefSource = user_selected | accept_engine
- src/components/dashboard/focus/useFocusPickerControl.ts
- src/components/dashboard/kompas/KompasHomeCard.tsx (één eigenaar: picker + nudge)
- src/components/dashboard/kompas/KompasVoortgangFocusBlock.tsx
- src/components/dashboard/kompas/KompasKeuzeSectie.tsx (EngineShiftNudge, GA4)
- src/lib/kompas-aanbeveling.ts → buildKompasAanbevelingen, rotateLadderAction
- src/lib/domain-ladder-readout.ts → resolveDomainLadderReadout
- src/lib/leefstijl-ladder.ts (layer.actions = string[]; ladders per domein)
- src/components/dashboard/domain/LadderActionRow.tsx (kind hard "activiteit")
- src/lib/account-favorites.ts (kind: activiteit | supplement | dienst)
- src/lib/schap-availability.ts (SCHAP_DOMAINS = beweging, slaap, voeding)

### Code — n8n / events
- src/lib/events.ts (DOMAIN_EVENT_TYPES, emitEvent, deliveredTo)
- src/lib/n8n-webhook.ts (geen HMAC; payload bevat email + session_id)
- src/app/api/cron/n8n-events/route.ts + src/app/api/cron/README.md
- src/lib/nurture.ts · nurture-cron.ts · intake-reminder-cron.ts · remeasure-reminder-cron.ts
- src/lib/intake-events-client.ts · src/lib/account-events-client.ts
- src/app/api/intake/events/route.ts · src/app/api/account/events/route.ts
- src/app/api/affiliate/click/route.ts
- supabase/migrations/20260706120000_funnel_views.sql (v_funnel_week e.d.)

## CODEBASE-REALITEIT (geverifieerd 26 augustus 2026 — toets, citeer, corrigeer als code afwijkt)

Neem onderstaande als startwaarheid. Als je een pad:regel vindt die dit weerspreekt, wint de code en markeer je de delta.

### 1) Twee producten, twee uitkomsten

Product A — Leefstijlcheck (/intake)
- 16 vragen in QUESTIONS (SLP_QUAL/CONS/ONSET/WAKE, NRG_PATN/DEP, STR_FREQ/RCV,
  CON_SOC, NUT_O3/PROT, MOV_STR/CARD, RCV_PHYS, LIF_ALC/SUN). Symptoompicker
  (stress|slaap|energie) is niet gescored.
- POST /api/intake/session → intake_sessions (domain_scores, profile_label,
  urgency_level, session_kind initial|remeasure, baseline_session_id).
- Uitkomst die de gebruiker ziet: Reveal (profiellabel, vitaliteit, ladder,
  recognition) + optioneel /intake/plan/{domain} + nurture.
- Hermeting: GET /api/account/remeasure/start → cookie psf_intake_remeasure →
  /intake?hermeting=1. Cyclus 30 dagen vanaf laatste full check
  (REMEASURE_CYCLE_DAYS). Nieuwe session-rij, append-only.
- Events: intake.completed deliveredTo ["nurture"]; remeasure.completed
  deliveredTo ["nurture"] — NIET n8n.

Product B — Domeincheck (/intake/{slaap|stress|voeding|beweging})
- Slaap/stress/beweging → intake_domain_checkin. Voeding → intake_intake_log.
- Vraagsets overlappen deels (SLP_*, STR_*), maar voeding en beweging zijn
  grotendeels eigen instrumenten (NUTRITION_QUESTIONS / MOV2_*).
- Uitkomst: 1-pijler snapshot/conclusie, optioneel ijkpunt-prompt, return vaak
  /dashboard?kompas={domain}. Geen nieuw profiellabel, geen hermeting-baseline
  (uitzondering: movement full mode merget MOV2 in intake_sessions.answers).
- Cadence: DOMAIN_CHECK_INTERVAL_DAYS = 14. Verbinding heeft GEEN check
  (status "remeasure"). Energie/herstel: geen check-route.

Score-naad (de plek waar A en B samenkomen):
- account-dashboard.ts bouwt per pijler een tijdreeks: source "intake" +
  "checkin" + "nutrition_log". currentScores = laatste punt.
- Kompas-ringen en enginePriority lezen die currentScores (getPriorityPillar /
  derivePriority). Een verse stresscheck verschuift de analyse ZONDER hermeting.
- Gevolg: de ring kan afwijken van de laatste full-check snapshot tot de
  volgende hermeting. Dat is ontwerp, geen bug — maar het is twee meetritmes
  op één getal. Toets of dat evidence- en wet-houdbaar is.

Schap ≠ meetloop. Completing a check schrijft geen schap-staat. Schap bestaat
alleen voor beweging/slaap/voeding (schap-availability.ts). Stress =
lifestyle_first; verbinding = geen_schap.

### 2) Drie naden — de basis om later producten en diensten bij te sturen

Live geverifieerd (hele lus): focus omgezet naar Beweging → nudge verscheen,
Stress vooraan met ADVIES, Beweging met JE FOCUS → knop geklikt → focus is
Stress, nudge weg, één kaart met beide chips.

Naad 1 — WÉLK DOMEIN
- Bron: model.enginePriority (analyse) vs model.priority (jouw focus).
- shouldShowEngineShiftNudge (priority-over-time.ts): true alleen als
  priorityIsUserChosen EN enginePriority.id !== priority.id.
- Bestond al, werd alleen op Agenda gebruikt (PriorityOverTimePanel).
  Staat nu óók in de Aanbevolen-tab op Kompas-home.
- Eén eigenaar: useFocusPickerControl in KompasHomeCard.tsx. De picker in
  KompasVoortgangFocusBlock en de nudge in KompasKeuzeSectie delen busy-stand
  en schrijven dezelfde voorkeur. Geen tweede pad.
- Nudge-copy (alleen Aanbevolen-tab): "Je meting wijst nu {X} aan, terwijl je
  focus ergens anders staat. Je hoeft niets te doen — of je beweegt mee."
  Knop: "Volg het nieuwe advies" → accept_engine via focusControl.acceptEngine.
  Dringt niet aan; verdwijnt als focus en analyse samenvallen.
- Meetpunt (GA4, GEEN domain_event): dashboard_kompas_engine_shift_accept
  { surface, from, to }. n8n ziet dit dus NIET, tenzij je een durable event
  bijbouwt (drie registratieplekken).

Naad 2 — WÉLKE LAAG
- resolveDomainLadderReadout(domain, data): winst-laag uit de laatste
  domeincheck. Live voor beweging, slaap, stress. Voeding en verbinding → null.
- kompas-aanbeveling.ts: als readout ontbreekt, fallback LADDER_FALLBACK_LAYER = 1
  met origin.kind "ladder" ("Nog niet apart gemeten — dit is de basis van je
  ladder."). Geen verzonnen reden (zelfde lat als resolveLadderLayerReason).
- De laag verschuift als je opnieuw meet, niet per week.

Naad 3 — WÉLKE INHOUD
- rotateLadderAction(layer.actions, weekIndex) — weekIndexFromDate is doorlopend
  (geen ISO-week, geen jaargrens-sprong). Eén actie in de laag = elke week dezelfde.
- layer.actions is nu een string[] van gratis ladder-acties.
- De rij op Kompas draagt al een kind: AccountFavoriteKind = activiteit |
  supplement | dienst (account-favorites.ts). resolveKeuzeDestination kiest per
  rij: agenda (als moment gepland) / schap (supplement of dienst, mits hasSchap)
  / domain (ladder).
- buildAanbevolenGroups zet Aanbevolen-items hard op kind: "activiteit".
  LadderActionRow.buildFavoriteItem idem.
- Product-dienst-stelling (toets, niet automatisch bevestigen): een betaald
  item, affiliate-product of dienst toevoegen is de ROTATIEBRON uitbreiden —
  niet de tegel verbouwen. De tegel, de kind-iconen en de bestemmingsregel
  bestaan al.
- Meetpunt (GA4): dashboard_kompas_aanbeveling_shown { surface, domain,
  is_priority, week_index }. Samen met engine_shift_accept lees je af hoe vaak
  focus en analyse uiteenlopen én hoe vaak mensen meebewegen. Beide zijn
  client-GA4; consent-gate geldt. Geen n8n.

### 3) n8n — outbound, niet live

- emitEvent → domain_events. Alleen als deliveredTo "n8n_webhook" bevat:
  directe POST naar N8N_WEBHOOK_URL { source: "perfectsupplement", event }.
- Event-payload naar n8n bevat id, organization_id, occurred_at, event_type,
  session_id, email, payload. Geen HMAC/secret header. ABSENT inbound
  /api/webhooks/*.
- N8N_WEBHOOK_URL ontbreekt in productie (VERWERKINGSREGISTER: n8n niet
  geconfigureerd). PostHog-label in deliveredTo is géén forwarder.
- Cron /api/cron/n8n-events: oudste 50 rijen die n8n_webhook nog niet in
  delivered_to hebben — dus NIET alleen getagde events. Broadcast-risico zodra
  URL + cron aan staan.
- Nurture en remeasure-mail: Resend + app-cron, niet n8n. n8n krijgt hooguit
  het event ná send.

Getagde n8n in deze loop-familie (alleen als URL ooit aan gaat):
- measurement.checkin_completed — ALLEEN nutrition-log (posthog + n8n)
- remeasure.invited — ALLEEN intake-reminder-cron (n8n + email in payload)
- nurture.email_sent / nurture.scheduled / nurture.skipped
- affiliate.click
- sommige plan-events

NIET naar n8n vandaag:
- intake.completed, remeasure.completed (nurture)
- sleep/stress/movement measurement.checkin_completed (deliveredTo [])
- measurement.direction_detected, measurement.gap_detected
- dashboard.domain_check_cta_clicked, dashboard.schap_*, choice.shelf_opened
  (posthog-label via client-route)
- goal.benchmark_* (default [])
- GA4 dashboard_kompas_* (geen domain_event)

Funnel-views: v_funnel_week telt intake.completed, nurture, affiliate.click,
remeasure.*, focus.viewed — NIET measurement.checkin_completed, NIET schap,
NIET domain_check_cta, NIET de GA4 kompas-events. n8n_readonly-rol ABSENT in
migraties.

Sleep-checkin payload van measurement.checkin_completed bevat ruwe itemwaarden
(grip, duur, winddown, …). Register §7 claimt categorische payloads / geen
bijzondere gegevens in events — die claim botst hier. Movement blijft
categorisch (domain_key, rules_version, checkin_mode).

### 4) Evidence-publicatie is smaller dan de loop

- /onderbouwing dekt de 16 leefstijlcheck-vragen via leefstijlcheck-evidence.ts.
- /onderbouwing/voeding dekt de voedingscheck.
- Slaap-, stress- en beweging-checkin: GEEN eigen evidence-map in src/data
  die op /onderbouwing landt. ABSENT als publieke onderbouwing van de
  diepere check, terwijl die check wél de winst-laag (naad 2) en daarmee de
  Aanbevolen-kaart (naad 3) stuurt.
- Aanbeveling op Kompas is nu een geroteerde gratis ladder-actie, niet een
  EFSA-claim of affiliate-product. Zodra naad 3 supplement/dienst in de
  rotatie zet, geldt Claimsverordening 1924/2006 + sponsored-disclosure.

### 5) EU-loop (huidige praktijk)

consent_records (granulair: health, analytics, marketing, domain_checkin, …)
→ intake / domain-check (art. 9, EU Supabase)
→ regelgebaseerde scoring (geen arts, geen bloedwaarden — leefstijl-disclaimer)
→ UI-uitkomst (Reveal / Kompas / schap)
→ domain_events + GA4/Clarity (Clarity uit op health-routes; client durable
  events droppen zonder analytics-consent)
→ retentie-cron (sessions 24m / nurture 12m; revoke anonimiseert)

DPIA R7: geen geautomatiseerd besluit met rechtsgevolg (art. 22); output is
informatief/vrijblijvend. De engine-shift-nudge + accept_engine is een
menselijke keuze over een geautomatiseerde aanwijzing — relevant voor art. 22,
geen besluit op zich.

MDR: welzijn/leefstijl OK; diagnose/behandeling niet. Intended purpose + hoe
de output zich presenteert. Inbound n8n die "behandeling"-achtige messaging
terugstuurt verscherpt de grens; outbound-only is lager risico.

AI Act: ABSENT als documentsectie in deze repo. Markeer als hiaat, verzamel
geen AI-Act-advies uit het niets.

Privacy-pagina noemt n8n niet. Activatie N8N_WEBHOOK_URL vereist register +
privacy in dezelfde wijziging (projectregel).

## Werkwijze
F0  Scope — wat deze ronde WEL en NIET beslist (max 15 regels).
F1  Verificatie — as-built vs stelling hierboven; per claim WEL/NIET/DEELS +
    pad:regel. Minimaal 10 rijen.
Dan de secties A–H. Geen extra essays daarbuiten.

## Output — schrijf naar
docs/cursors/opus-loop-onderbouwing-n8n-vragenlijst-check-verdict-2026-08.md

Exact deze secties, in deze volgorde:

### A. Executive summary
Max 20 regels.
- Eén zin: is dit één product-dienst of twee (leefstijlcheck vs domeincheck),
  en wat is Kompas daarin (aanbevelingslaag, geen derde check).
- GO/NO-GO: mag de huidige loop zo blijven staan als basis voor producten en
  diensten op naad 3, of moet eerst iets in evidence/wet/n8n?
- Wat Dennis nu wél en niet moet doen.

### B. Plattegrond as-built
Mermaid flowchart (in het verdict-bestand): entry → check A/B → persist →
dashboard latest-wins → drie naden → Kompas/schap/nurture → hermeting.
Daaronder één tabel met twee kolommen (Leefstijlcheck | Domeincheck):
entry, vragenbron, write-tabel, user-artifact, effect op Kompas, effect op
Schap, hermeting-rol, event bij afronden, n8n vandaag.
Markeer ABSENT-routes (energie, herstel, verbinding-check) in één alinea.

### C. Drie naden als product-dienst-contract
Per naad (domein · laag · inhoud):
- Wat de bron van waarheid is (pad + veld).
- Wat de gebruiker ziet als ze uiteenlopen.
- Waar producten/diensten later wél/niet mogen landen.
- Wat je NIET mag doen (bv. tegel verbouwen i.p.v. rotatiebron; laag laten
  rouleren per week; focus stil overrulen).
Toets de stelling "betaald item = rotatiebron uitbreiden". KEEP / REFINE /
PIVOT / KILL, max 8 regels onderbouwing. Noem wat kapotgaat bij PIVOT.

### D. Evidence-toets van de loop
Niet per vraag. Wel per schakel in de keten:
leefstijlcheck-vraag → score → profiel/reveal → (domeincheck) → winst-laag →
geroteerde actie → (toekomst: supplement/dienst) → schap/affiliate.
Per schakel: wat is feitelijk onderbouwd in repo (/onderbouwing of data-file),
wat is ABSENT, compliance-label ✅ toegestaan · ⚠️ voorzichtig (geef veilige
copy) · ❌ niet toegestaan.
Geen DOI/PMID verzinnen. Als de expert-review (1.3.1) iets zei dat 1.6.0
raakt: één alinea delta, rest verwijzen.

Specifiek toetsen:
- Mag latest-wins (domeincheck overschrijft full-check-score op de ring) zo
  gecommuniceerd worden, of is dat een tweede meetconstruct zonder onderbouwing?
- Mag origin.kind "ladder" (fallback laag 1) user-facing blijven zonder
  evidence-regel?
- Mag naad 3 ooit een supplement roteren zonder dat die actie op /onderbouwing
  of approved-claims staat?

### E. n8n-triage: check + hertest → kompas-schap
Driedeling WEL / DEELS / NIET, onderbouwd met de outbound-only realiteit.

WEL: orchestratie buiten request-cyclus (hertest-invite timing, weekrapport
op views, affiliate-click fan-out die al getagd is).
DEELS: domain-check completed, engine-shift, aanbeveling-shown — mag n8n
lezen, maar app houdt consent, RLS, en de drie naden. Beschrijf taakverdeling
én of het GA4-only events zijn die eerst durable moeten worden.
NIET: scoring, accept_engine-beslissing, schap-oordeel, art. 9-payloads,
inbound content-push die de naden overschrijft.

Daarnaast verplicht:
- Minimale veilige eerste koppeling (één event of één view), met register-
  en privacy-gate eerst.
- Cron-broadcast-risico in één alinea: wat er gebeurt als URL+cron aan gaan
  zonder filter.
- Welke bestaande events je hergebruikt; nieuw event alleen als onvermijdelijk,
  met de drie registratieplekken (events.ts + client-union + route-allowlist)
  én consent-laag (intake vs account).
- PII/art. 9 in webhook-body: email op nurture/remeasure.invited; ruwe sleep-
  items. Wat eruit moet vóór activatie.

Koppel expliciet aan de drie naden: n8n mag timing/kanaal zijn, niet de
kiezer van domein, laag of inhoud.

### F. EU-wetgevingsloop
Teken de keten: consent → verwerking → scoring → UI-uitkomst → n8n/analytics
→ retentie/revoke.
Per schakel: welk regime (AVG art. 6/9, ePrivacy, 1924/2006, MDR 2017/745,
art. 22/DPIA R7). Wat de code nu doet vs wat ontbreekt (AI Act = hiaat).
Specifiek:
- Is de dual-ritme-score (30d full + 14d domain) nog "informatief/vrijblijvend"
  onder art. 22, of gaat het richting profilering met merkbaar effect zodra
  naad 3 betaalde/affiliate-inhoud roteert?
- MDR-grens als n8n later inbound messaging zou doen vs huidige outbound-only.
- Doelbinding: domain_checkin-consent vs n8n voor marketing-orchestratie =
  nieuw doel → nieuwe registerregel, geen stille meelifter.
- Verbinding: herinner de lock (geen nurture op laag CON_SOC; geen schap).

Geen juridisch advies verzinnen voorbij de docs. Als de repo zwijgt: ABSENT
+ de vraag aan Dennis.

### G. Gap-matrix
Proza-tabel, max ~12 rijen. Kolommen: schakel | loop nu | evidence | n8n | wet |
ernst (blokker / later / bewust). Alleen feiten + pad. Geen wensenlijst.

### H. Open vragen + één volgende stap
Max 5 vragen aan Dennis, elk met waarom het de ronde blokkeert of niet.
Sluit af met exact één zin:
"Aanbeveling: <de ene volgende stap die ik zou nemen>"
Die stap is een besluit of een document-update, geen Cursor-bouw — tenzij je
expliciet zegt dat de loop al houdbaar is en dan de kleinste veilige n8n- of
evidence-stap noemt.

## Verboden in deze sessie
- Code implementeren, diffs, SQL, HTML-prebuild
- Per-vraag herbouw van de 16-set
- Native rollout slaap/stress/voeding als bouwplan
- Inbound n8n-architectuur tekenen alsof die al mag
- AI Act-classificatie verzinnen
- DOI's of wetsartikelen citeren die niet in repo of in je geverifieerde
  kennis van de genoemde verordeningen zitten — bij twijfel ABSENT
- Hermeting-cyclus of wearable-scope heropenen
- De drie naden samenvoegen tot één score of één tegel

## Toon
Direct, Nederlands, geen hype. Adviezen geen diagnoses. Schrijf voor Dennis
die zelf bouwt in Cursor — hij wil een plattegrond en een houdbaarheids-
oordeel, geen essay.
```

---

## Na het verdict

| Stap | Wie | Actie |
| --- | --- | --- |
| 1 | Dennis | Review sectie A + C + E — GO of bijsturen |
| 2 | Opus (optioneel) | Aparte Cursor-prompt voor de ene volgende stap uit H |
| 3 | Cursor | Bouw pas na GO; context = dit verdict |

## Meetpunt (deze ronde)

Geen nieuwe product-events — dit is een besluitronde. Effect af te lezen aan: of sectie C de rotatiebron-stelling overeind houdt, of n8n in E een veilige eerste koppeling krijgt zonder art. 9-payloads, en of H één stap is in plaats van vijf.
