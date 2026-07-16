# Uitvoeringsplan — Leefstijlcheck-herziening (SDT · score · verbinding)

> **Doel:** dit is het werkdocument voor de implementatie van de leefstijlcheck-herziening. Elke Claude-sessie opent dit bestand, pakt de eerstvolgende stap met status ⬜, leest de "Lees eerst"-lijst van die stap, voert uit, verifieert, en werkt de status bij (⬜ → ✅ met datum).
> **Workflow-wijziging (11 jul 2026):** implementatie gebeurt **direct door Claude** — niet meer via Cursor-prompts. Alle overige regels blijven: Dennis reviewt, Claude commit nooit zelf.
> **Bronnen (besluiten en ontwerpen — niet opnieuw ter discussie stellen):**
> - `docs/research/LEEFSTIJLCHECK_SCOPE_REVIEW.md` — architectuur tier-1/tier-2, verbinding-anker, L0–L6
> - `docs/research/LEEFSTIJLCHECK_EXPERT_REVIEW.md` — psychometrie, bias, herschreven vragen (§8), score-adviezen (§9)
> - `docs/research/AANBEVELING_SDT_VITALITEIT_VERBINDING.md` — besluitdoc; fasering §5; **besloten:** check-in gratis, verdiepend plan premium
> **Status-legenda:** ⬜ open · 🔄 bezig · ✅ klaar (datum + evt. commit-hash) · ⏸ geblokkeerd (reden)

---

## Werkafspraken — gelden voor ELKE sessie uit dit plan

1. **Nooit zelf committen.** Stop na de wijzigingen; geef een voorgestelde commit-message. Dennis reviewt en commit.
2. **Verificatie per stap:** `grep -rn "console.log" src/` (leeg) · `npx tsc --noEmit` (groen) · `npm test` (groen). **Geen `next build` draaien terwijl de dev-server actief is** — verifieer met tsc + vitest.
3. **Compliance-invarianten:** patroon-taal, geen diagnose; nooit het woord "tekort"; EFSA-teksten letterlijk laten; leefstijl-eerst invariant (supplement nooit zonder ander-domein quick-win) niet breken.
4. **RULES_VERSION:** elke wijziging aan vragen, opties-waarden of scoring = bump + delta-documentatie in `leefstijlcheck-evidence.ts` (`LEEFSTIJLCHECK_TRANSPARANTIE_NOTES`) én in de versie-kop van `intake-engine.ts`. Copy-wijzigingen zonder waarde-impact: geen bump, wél een transparantie-note als de vraagtekst wijzigt.
5. **Legacy-patroon:** oude sessies blijven leesbaar via mapping (voorbeeld: `getStressRecoveryAnswer` vangt `STR_RCV`/`STR_RECV`/`RCV_MENT`). Baseline↔hermeting-vergelijking moet regelset-bewust blijven.
6. **UI-wijzigingen:** check op 375px (doelgroep is mobiel).
7. **Meetpunt melden** bij elke afronding: "Meetpunt: <event(s)> — hier lees je het effect af." Nieuw client-event = 3 registratiepunten: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist `src/app/api/intake/events/route.ts`.
8. **DB-wijzigingen** (alleen S6): migraties via Supabase Dashboard SQL Editor, nooit `supabase db push`. `.env.local` nooit aanraken.
9. **Status bijwerken in dit document** aan het eind van elke sessie — dit bestand is de backlog.
10. Bij twijfel over een ontwerpbeslissing: de drie bronrapporten zijn leidend; wijk je af, noteer het expliciet in de stap-sectie hieronder.

---

## Overzicht & prioriteit

| # | Stap | Prio | Afhankelijk van | RULES_VERSION | Risico | Omvang | Status |
|---|------|------|-----------------|---------------|--------|--------|--------|
| S0 | Evidence-, habit- & docs-sync (was "L0") | **1** | — | Nee | Laag | ~1 sessie | ✅ (12 jul) |
| S1 | Bias- & framing-copy (zonder waarde-wijziging) | **1** | — | Nee | Laag | ~1 sessie | ✅ (16 jul) |
| S2 | Item-analyse-script + baseline-rapport | **2** | — (vóór S3!) | Nee | Laag | ~1 sessie | ✅ (16 jul) — N=1, geen empirische baseline; S3 = math-gedreven |
| S3 | Engine-bump 1.4.0: herskalering + validiteitsfixes | **3** | S2 (baseline eerst) | **Ja** | Middel | 1–2 sessies | ⬜ |
| S4 | Vraagset-herverdeling 16→17 (bump 1.5.0) | **4** | S3 | **Ja** | Middel–hoog | 1–2 sessies | ⬜ |
| S5 | Verbinding-fundament: plan + label + content-map | **5** | S0 (copy klaar) | Nee* | Middel | ~1 sessie | ⬜ |
| S6 | Verbinding-check-in (gratis) + premium plan-gate + SVS-anker | **6** | S5, besluit DB-opslag | Nee | Middel–hoog | 2–3 sessies | ⬜ |
| S7 | Motivatie-module (V4–V6) → PlanCondition | **7** | S6 | Nee | Middel | later | ⬜ |
| B1 | Besluit roken-signaalvraag | — | Dennis | — | — | besluit | ⬜ |

*S5 wijzigt de profiellabel-uitkomst (verbinding krijgt eigen label) — geen scoring-wijziging, wel documenteren.

**Volgorde-rationale:** S0+S1 zijn risicoloos en direct zichtbaar (copy/docs); S2 legt de nulmeting vast zodat S3/S4 een vóór/ná-vergelijking hebben; S3 vóór S4 zodat de nieuwe vragen op een kloppend scoringsmodel landen; S5 vóór S6 omdat de check-in ergens naartoe moet leiden (plan). S3+S4 mogen in één branch en één bump gecombineerd worden als ze kort na elkaar landen — dan wordt 1.4.0 de gecombineerde herziening en vervalt 1.5.0 (één delta, één communicatiemoment). Maximaal 2 bumps totaal.

---

## S0 — Evidence-, habit- & docs-sync

**Doel:** de verbinding-pijler feitelijk kloppend maken in copy, evidence en documentatie — zonder enige scoring-wijziging. (Dit was de eerder geleverde "L0-Cursor-prompt"; hieronder integraal als directe instructie.)

**Lees eerst:** `LEEFSTIJLCHECK_SCOPE_REVIEW.md` (secties "Verificatie vooraf", §2f, §8c) · `docs/core/COMPLIANCE.md`.

**Wijzigingen (exact):**

1. **`src/lib/vitality-habit-kernel.ts`** — in `resolveNextBestHabit`, vervang uitsluitend de CON_SOC-returnstring:
   - Oud: `"Focus nu: plan één vast contactmoment deze week."`
   - Nieuw: `"Focus nu: kies één contact waar je energie van krijgt en zoek dat bewust op."`
   - De probleemzin in `resolveProblemStatement` ("Betekenisvol contact of steun schiet erbij in.") blijft ongewijzigd.
2. **`src/lib/content/themes.ts`** — vervang uitsluitend `STATIC_HEFBOOM.connection`:
   - Oud: `"Verbinding en steun bepalen hoeveel je aankunt. Eén vast contactmoment per week doet vaak **meer** dan nog een product of protocol."`
   - Nieuw: `"Verbinding en steun bepalen hoeveel je aankunt. Het gaat niet om veel contacten — **een paar mensen bij wie je tot rust komt** doen vaak meer dan nog een product of protocol."`
3. **`src/data/leefstijlcheck-evidence.ts`** — vier wijzigingen:
   a) Voeg aan het **begin** van `socialConnectionRefs` toe (huisstijl: korte APA, geen volume/pagina's):
      - Holt-Lunstad J, Smith TB, Layton JB. Social relationships and mortality risk: a meta-analytic review. PLoS Med. 2010. — doi `10.1371/journal.pmed.1000316`, pmid `20668659` *(extern geverifieerd 11 jul)*
      - Cohen S, Wills TA. Stress, social support, and the buffering hypothesis. Psychol Bull. 1985. — doi `10.1037/0033-2909.98.2.310`, pmid `3901065` *(geverifieerd)*
      - Sutcliffe A, Dunbar R, Binder J, Arrow H. Relationships and the social brain: integrating psychological and evolutionary perspectives. Br J Psychol. 2012. — doi `10.1111/j.2044-8295.2011.02061.x`, pmid `22506741` *(geverifieerd)*
   b) Voeg dezelfde drie toe aan het **begin** van `LEEFSTIJLCHECK_REFERENCE_LIBRARY["sociale-verbinding"]` (aparte inline lijst — beide plekken!).
   c) CON_SOC-entry: voeg als **eerste** `scientificRationale`-bullet toe: `"Kwaliteit weegt zwaarder dan kwantiteit: enkele sterke, gelijkwaardige relaties bufferen stress effectiever dan een groot netwerk — sociale netwerken zijn gelaagd en de binnenste laag draagt de meeste steun."`
   d) `LEEFSTIJLCHECK_TRANSPARANTIE_NOTES`, achteraan: `"Per juli 2026: verbinding-onderbouwing verbreed met de mortaliteits-meta-analyse (2010), de buffering-hypothese en sociale-netwerklagen (kwaliteit vs kwantiteit)."`
4. **`docs/copy/themes/connection.md`** — volledig herschrijven naar het sleep.md-formaat: `Gemeten in intake: ja (CON_SOC, sinds rules_version 1.3.0)`; herkenningszin-tabel ("Je mist soms echt contact of staat er vaak alleen voor." · `CON_SOC <= 2` · prio 1 · bron `STATIC_RECOGNITION_LINES`); generieke fallback (bestaande intro-zin); nieuwe hefboom-copy (zie punt 2); sectie "Status & open punten" (5e interventiedomein, kan primair thema worden via `TIEBREAK_ORDER`; open: eigen profiellabel → S5, leefstijlplan → S5, check-in → S6).
5. **`docs/plan/ANALYSIS_PILLAR_COVERAGE.md`** — drie correcties: §1-tabel verbinding-rij ("1 vraag (`CON_SOC`), score 0–100 — gescoord sinds rules_version 1.3.0 · Geen check-in of plan-template · Nee — zacht"); onder de §1-tabel een geactualiseerd-regel (11 juli 2026, kernobservatie blijft gelden); §4-tabel verbinding-rij (gescoord; verdieping = open punt); "Open beslispunten" punt 4 herformuleren (meetvraag bestaat; vervolgbeslispunt = label/plan/check-in, zie de rapporten).

**Acceptatie:** `grep -rn "plan één vast contactmoment" src/` → 0 · `socialConnectionRefs` = 7 refs · REFERENCE_LIBRARY sociale-verbinding = 8 · CON_SOC rationale = 4 bullets · beide docs gecorrigeerd · tsc + vitest groen.
**Meetpunt:** `intake_completed` (bestaand) — completion vóór/ná copy-wijziging.
**Voorgestelde commit:** `fix(leefstijlcheck): S0 verbinding — evidence verbreed, generieke habit-copy vervangen, docs gesynct met rules_version 1.3.x`

**Uitgevoerd 12 jul 2026 — afwijkingen t.o.v. deze instructie:**
- **Habit-copy CON_SOC:** de hierboven voorgeschreven zin ("Focus nu: kies één contact waar je energie van krijgt en zoek dat bewust op.") is tijdens uitvoering door Dennis afgekeurd als te generaliserend/coach-taal. Op zijn expliciete keuze is de regel vervangen door een feit-eerst variant: `"Focus nu: enkele sterke contacten dragen meer dan een groot netwerk — investeer deze week in één daarvan."` (leunt direct op de nieuw toegevoegde Cohen & Wills 1985 / Sutcliffe-Dunbar 2012-referenties). Verbinding blijft verder volledig in scope — geen bredere koerswijziging.
- **Acceptatiecijfer `socialConnectionRefs` = 7 refs klopt niet:** het array had bij aanvang 5 entries (niet 4), dus na de drie toevoegingen is de telling **8**, gelijk aan `REFERENCE_LIBRARY["sociale-verbinding"]`. Geverifieerd met een programmatische telling; dit is een tel-fout in de oorspronkelijke instructie, geen implementatie-afwijking.

---

## S1 — Bias- & framing-copy (zonder waarde-wijziging)

**Doel:** de normativiteits- en framing-fixes die géén optie-waarden raken — direct uitvoerbaar, nul scoring-risico.

**Lees eerst:** `LEEFSTIJLCHECK_EXPERT_REVIEW.md` §6 (bias-tabel) + §1-framing uit `AANBEVELING_SDT_VITALITEIT_VERBINDING.md` · `docs/core/WRITING_VOICE.md`.

**Wijzigingen:**

1. **`src/data/intake-questions.ts`** — alleen tekst, géén waarden of optie-aantallen:
   - MOV_CARD-vraagtekst: voorbeelden herijken op intensiteit → `"Hoe vaak beweeg je stevig — flink doorwandelen, fietsen, hardlopen of sport waarvan je hartslag omhoog gaat?"` (opties ongewijzigd).
   - LIF_SUN-subtitle: → `"Buitenlicht zet je biologische klok — belangrijk voor slaap en energie. In de zomer maakt je huid er ook vitamine D mee aan."` (vraag + opties ongewijzigd; de optie-herformulering wacht op S4).
2. **Resultaat-framing** — voeg de niet-medische score-uitleg toe op het resultaatscherm. Anker: `src/lib/results-reveal-copy.ts` (`vitalityScoreEyebrow` zit daar al). Eén zin, conform aanbeveling §1: *"Geen medische test: we meten hoe goed je leefstijl je vitaliteit ondersteunt — vijf pijlers, elk even zwaar. Energie en herstel zijn je uitlezing."* Zoek de juiste bestaande copy-plek (results-framing/reveal); geen nieuwe component als een bestaande copy-key volstaat.
3. **Autonomie-ondersteunende advies-taal** — inventariseer waar advies als enkelvoudige opdracht staat (habit-kernel `nextBestHabit`, quick-wins) en waar al meerdere opties bestaan. Kleine copy-aanpassing waar hetc goedkoop kan ("kies wat bij je past"); géén structuurwijziging in deze stap — de volledige keuze-architectuur is S7.
4. **Transparantie-note** in `leefstijlcheck-evidence.ts`: `"Per juli 2026: vraagteksten MOV_CARD en LIF_SUN-toelichting geherformuleerd (inclusiever, geen waarde-wijziging)."`

**Acceptatie:** geen enkel `value:`-veld gewijzigd in `intake-questions.ts` (diff-check) · framing-zin zichtbaar op resultaat · tsc + vitest groen · 375px-check resultaatscherm.
**Meetpunt:** `intake_completed` + bestaande score-events; geen nieuw event (geen nieuwe CTA).
**Voorgestelde commit:** `fix(leefstijlcheck): S1 inclusieve vraag-copy (MOV_CARD, LIF_SUN) + niet-medische scoreframing`

**Uitgevoerd 16 jul 2026 — afwijkingen t.o.v. deze instructie:**
- **MOV_CARD-formulering herzien door Dennis tijdens uitvoering.** De plan-tekst ("Hoe vaak beweeg je stevig — flink doorwandelen, fietsen, hardlopen of sport waarvan je hartslag omhoog gaat?") is afgekeurd; op zijn keuze is de vraag wetenschappelijk verankerd op matig-intensief/zone 2 met spreektest-anker: `"Hoe vaak beweeg je matig intensief — stevig doorwandelen, fietsen of sport waarbij praten nog lukt, maar zingen niet?"` + nieuwe subtitle `"Dit tempo (zone 2) traint je conditie — de basis onder je energie en herstel."` (WHO 2020-basis uit expertreview §7; bias-doel — wandelaars/fietsforensen tellen mee — blijft behaald.)
- **Consistentie-uitbreiding buiten het genoemde bestand:** dezelfde MOV_CARD-herformulering doorgevoerd in `src/data/movement-checkin/index.ts` (check-in stelt letterlijk dezelfde vraag; werkafspraak 5 — baseline↔hermeting moet hetzelfde construct meten) en verkort in het `chat-intake.ts`-label. Evidence-copy `whyThisQuestion` (MOV_CARD) meebewogen naar het matig-intensief-construct.
- **S1.3 bewust géén copy-wijziging.** Inventaris: engine-quick-wins (`getAdvice`) en `PILLAR_DRAWER_FALLBACKS` bieden al meerdere opties; de `resolveNextBestHabit`-regels zijn enkelvoudig maar concreet en feit-gebonden, en het één-pad-principe is een gedocumenteerde ontwerpbeslissing (STEPPED_CARE_MODEL: "de engine bepaalt de volgorde — geen keuzestress"). "Kies wat bij je past"-toevoegingen zouden botsen met het feit-eerst-besluit uit S0. Volledige keuze-architectuur blijft S7.
- **S1.2 implementatie:** nieuwe copy-key `vitalityScoreFraming` in `results-reveal-copy.ts`, gerenderd in `RevealHeroCard` direct onder het score-instrument (geen nieuwe component). 375px: zelfde patroon als bestaande hero-paragraaf (`mx-auto max-w-[40ch]`), visueel na te lopen bij review.

---

## S2 — Item-analyse-script + baseline-rapport

**Doel:** de psychometrische nulmeting vastleggen vóórdat S3 de scoring wijzigt — anders is vóór/ná-vergelijking onmogelijk.

**Lees eerst:** `LEEFSTIJLCHECK_EXPERT_REVIEW.md` §9.6 · `scripts/check-supabase-schema.sh` (patroon voor Supabase-toegang vanuit een script) · memory: `SUPABASE_SERVICE_ROLE_KEY` heeft een `sb_secret_`-waarde.

**Wijzigingen:**

1. **Nieuw `scripts/item-analyse.mjs`** (patroon: `generate-state.mjs` voor node-scripts, `check-supabase-schema.sh` voor env-gebruik) + npm-script `"analyse:items": "node scripts/item-analyse.mjs"`. Het script leest `intake_sessions` (kolommen `answers`, `domain_scores`, `created_at`, en het rules-version-veld dat bij de sessie is opgeslagen — verifieer de exacte kolomnaam in het schema vóór het schrijven) en berekent per vraag-id:
   - antwoordverdeling + spreiding (SD), vloer-/plafondpercentages;
   - item-rest-correlatie binnen het eigen domein (voor domeinen ≥ 2 items);
   - inter-item-correlaties binnen slaap (kwantificeert de vermoede SLP_QUAL↔SLP_WAKE-overlap);
   - domeinscore-verdeling + percentielen (ijkt de urgentie-drempels van S3);
   - vitaliteitsscore-verdeling; aandeel sessies per urgentieniveau en per band (verwachting uit expertreview: "critical" vrijwel 0%).
   - Filter op de actuele RULES_VERSION-generatie(s); rapporteer N per generatie.
2. **Output:** `docs/research/ITEM_ANALYSE_BASELINE.md` — tabellen + een korte duiding-sectie die het script NIET zelf schrijft (Claude vult de duiding in dezelfde sessie handmatig in).
3. Geen productcode geraakt; alleen `scripts/` + `package.json` + het rapport.

**Acceptatie:** script draait lokaal met bestaande env zonder errors · rapport bevat alle bovengenoemde metrieken · geen wijziging in `src/`.
**Risico/valkuil:** privacy — het rapport bevat alleen aggregaten, nooit losse sessies of e-mails. Bij lage N (< ~100 per generatie): rapporteer dat expliciet en trek geen harde conclusies.
**Voorgestelde commit:** `feat(analyse): item-analyse-script + psychometrische baseline leefstijlcheck`

**Uitgevoerd 16 jul 2026 — resultaat en afwijkingen:**
- **Script gebouwd** (`scripts/item-analyse.mjs` + `npm run analyse:items`). Alle voorgeschreven metrieken zitten erin: item-verdeling/SD/vloer/plafond, item-rest-correlaties (complete-case, domeinen ≥2 items), slaap-inter-item-matrix, domein- en vitaliteitspercentielen, urgentie- + bandverdeling, N per `rules_version`. Extra t.o.v. de instructie: **integriteitscheck** (herberekende scores vs. opgeslagen `domain_scores` → driftdetectie) — dit valideert dat het script de engine-math exact spiegelt. Env-namen: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (uit `src/lib/supabase-admin.ts`), niet via `supabase link`; het script leest ze uit `process.env` of parseert `.env.local` zónder waarden te printen. Rules-version-kolom = `rules_version` (geverifieerd via migratie `20260609120000`).
- **KERNBEVINDING: N = 1.** De via `.env.local` bereikbare database bevat exact één sessie. Er is dus **geen empirische baseline** — SD/correlaties/percentielen zijn betekenisloos. Het rapport (`docs/research/ITEM_ANALYSE_BASELINE.md`) zegt dit expliciet in de duiding.
- **Gevolg voor S3 (dwingend):** de percentiel-herijking van urgentiedrempels valt op de **else-tak** van de S3-instructie → drempels `<30/<50/<60` behouden, herschaling puur math-/theorie-gedreven, empirische drempel-herijking uitstellen tot N ≥ ~100. Het vloer-artefact (effectieve domein-min 25–33, `<30` onbereikbaar voor meer-item-domeinen) is wél wiskundig bewezen en rechtvaardigt S3 zonder data.
- **Openstaand vóór S3 — databron bevestigen:** onduidelijk of `.env.local` naar dev of productie wijst (mag `.env.local` niet inzien). Als dev: opnieuw draaien met productie-env. Als productie: de intake-funnel heeft ~geen voltooiingen — een verkeer-/distributiesignaal los van deze herziening.
- Geen `src/`-wijziging (geverifieerd). Alleen `scripts/`, `package.json`, rapport.

---

## S3 — Engine-bump 1.4.0: herskalering + validiteitsfixes

**Doel:** het scoringsmodel kloppend maken (expertreview prio 1–4) in één beheerste RULES_VERSION-bump.

**Lees eerst:** `LEEFSTIJLCHECK_EXPERT_REVIEW.md` §9 (volledig) + §8.4/8.6 en §3.9 · `src/lib/intake-engine.ts` versie-kop (delta-documentatie-patroon 1.2.0/1.3.0/1.3.1) · `ITEM_ANALYSE_BASELINE.md` (uit S2) · relevante tests: `intake-engine.test.ts`, `intake-engine.signals.test.ts`, `intake-engine.balance.test.ts`, `intake-engine.compliance.test.ts`, `vitaliteit.test.ts`, `vitality-score-copy.test.ts`, `intake-baseline.test.ts`.

**Wijzigingen:**

1. **Item-herskalering** in `calcDomainScores` (`intake-engine.ts`): elk item eerst `(waarde − 1) / (max − 1) × 100`, domeinscore = gemiddelde van item-scores. Gevolgen die je expliciet in tests vastlegt: SLP_CONS weegt 25% binnen slaap (was 20%); NUT_O3/NUT_PROT 50/50 (was 43/57); slechtst mogelijke domeinscore = 0 (was ~25–33); RCV_PHYS → 0/50/100 (was 33/67/100); CON_SOC → 0/33/67/100 (was 25/50/75/100).
2. **Urgentie- en band-herijking** (`getUrgency`, en check `getDisplayStatus`-gebruik): drempels opnieuw ijken nu de schaal écht 0–100 loopt. Startpunt: percentielen uit S2-baseline; als de baseline te dun is, houd <30/<50/<60 aan en noteer dat de herijking op data volgt. Banden in `score-display.ts` alleen aanpassen als de S2-verdeling daar aanleiding toe geeft.
3. **CON_SOC kwaliteit-first** (`intake-questions.ts`): opties conform scope-review §2e + expertreview: `"Ja, en dat voelt ruim voldoende"` (4) · `"Ja, een paar — en dat is genoeg voor mij"` (4) · `"Er zijn mensen, maar ik mis soms echt contact"` (2) · `"Ik heb weinig mensen om op terug te vallen"` (1). Let op: twee opties met waarde 4 — verifieer dat de UI en de engine geen uniciteit van waarden aannemen (check `QuestionOption`-gebruik en eventuele reverse-lookups).
4. **NUT_PROT "weet niet" ontkoppelen**: opties conform expertreview §8.6; de "weet niet"-keuze wordt niet als waarde 1 gescoord maar als ontbrekend behandeld — voeding-score middelt dan over de resterende items (NUT_O3 + t.z.t. NUT_VEG). Implementatie-suggestie: sentinel-waarde (bv. 0) + filter in `calcDomainScores`; legacy: oude sessies met waarde 1 blijven zoals ze waren (regelset-bewust).
5. **NRG_DEP herbouwen** (expertreview §8.4): nieuwe vraag "Heb je oppeppers nodig om de dag door te komen…", 4 frequentie-opties, alcohol volledig eruit (zit in LIF_ALC). Check alle plekken die NRG_DEP-semantiek gebruiken: `getSignals`/`getDeficiencySignals` (energie-signalen), `vitality-habit-kernel.ts` (NRG_DEP-habit-regels), recognition-lines in `themes.ts`, en de QuestionEvidence-entry (nieuwe rationale + refs, o.a. Poole 2017 — DOI vóór publicatie verifiëren).
6. **Label-mismatch movement** (`NAMED_DOMAIN_LABELS`): beweging-primair krijgt niet langer "Lage Batterij". Opties: eigen labelnaam toevoegen aan het `ProfileLabel["name"]`-union (afstemmen met content-profiel "Overtrainer" in `THEME_CONTENT_MAP.movement.profileSlug`) — kies de naam die met de bestaande profielpagina spoort en documenteer.
7. **SLP_QUAL-herformulering** (§8.1, frequentie-ankers) mag meeliften; SLP_WAKE/SLP_ONSET **niet** herformuleren (die verhuizen in S4 — niet twee keer aan hetzelfde item sleutelen).
8. **Versie-administratie:** `RULES_VERSION = "1.4.0"`; delta-blok in de versie-kop van `intake-engine.ts`; transparantie-notes in `leefstijlcheck-evidence.ts`; QuestionEvidence-entries van gewijzigde vragen actualiseren (answerMeaning blijft patroon-taal).
9. **Tests:** alle bestaande engine-tests updaten op de nieuwe schaal + nieuwe tests voor: herskalering-uitkomsten, weet-niet-afhandeling, CON_SOC dubbele-4, NRG_DEP-signalen, movement-label. `intake-baseline.test.ts` checken op regelset-bewust vergelijken.

**Acceptatie:** alle tests groen (inclusief herschreven verwachtingen) · slechtste totaal-invulling geeft vitaliteit 0 · "weet niet" verlaagt de voedingsscore niet · delta gedocumenteerd op beide plekken · tsc groen.
**Risico/valkuil:** dit raakt de hermeting-vergelijking — verifieer dat de voortgangs-/hermeting-flow de RULES_VERSION per sessie meeweegt vóór je afrondt (zoek de vergelijkingslogica en test hem expliciet). Dashboard-dev-data (`dashboard-dev-data.ts`) ook mee-updaten.
**Meetpunt:** `intake_completed` + verdeling urgentieniveaus vóór/ná (S2-script na live-gang opnieuw draaien als vervolg-sessie).
**Voorgestelde commit:** `feat(engine): RULES_VERSION 1.4.0 — item-herskalering, drempel-herijking, CON_SOC/NUT_PROT/NRG_DEP-validiteitsfixes, movement-label`

---

## S4 — Vraagset-herverdeling 16→17 (bump 1.5.0, of gecombineerd met S3)

**Doel:** tier-1 in balans: slaap −2, verbinding +1, voeding +1, beweging +1 — netto 17 vragen, elk interventiedomein ≥ 2 items.

**Lees eerst:** `AANBEVELING_SDT_VITALITEIT_VERBINDING.md` §2 · `LEEFSTIJLCHECK_SCOPE_REVIEW.md` §1/§2d · expertreview §8.2/8.8/8.9 · `src/app/intake/slaap/page.tsx` (bestaande slaap-check-in als landingsplek voor SLP_ONSET/WAKE).

**Wijzigingen:**

1. **Slaap −2:** SLP_ONSET en SLP_WAKE uit tier-1 (`QUESTIONS`), sleep_score = gemiddelde van SLP_QUAL + SLP_CONS. De twee items verhuizen inhoudelijk naar de slaap-check-in (herformuleerd conform §8.2/§3.3: her-inslapen-construct; SOL-vraag zonder "of heel moeilijk"). Bepaal of de slaap-check-in ze al equivalent uitvraagt — zo ja, alleen tier-1-verwijdering + verwijzing.
2. **SLP_CONS naar 4 opties** (§8.9, incl. ploegendienst-anker "Wisselt sterk — door werk, diensten of omstandigheden") — dit is de neutrale herformulering én de weging-gelijktrekking in één.
3. **+CON_NEED** (verbinding, optioneel/overslaanbaar in de UI als dat patroon bestaat — anders gewoon vraag 2): "Hoeveel sociaal contact heb je nodig om je goed te voelen?" — "Ik zit goed met een paar diepe contacten" / "Ik heb regelmatig contact met verschillende mensen nodig" / "Wisselt / weet niet". **Telt niet mee in de score** (personalisatie-modifier); opslag in `answers`, gebruik in habit-differentiatie (scope-review §2f: drie varianten) en later PlanCondition (S7).
4. **+NUT_VEG** (voeding): groente/plantaardig-item, frequentie-anker (Schijf-van-Vijf-porties); telt mee in nutrition_score (drie items). Evidence-entry: Dinu 2018 umbrella / Gezondheidsraad (DOI's verifiëren).
5. **+MOV_SIT** (beweging): zit-item ("Hoeveel uur zit je op een gewone dag aaneengesloten…" — formuleer met een concreet uren-anker, omgekeerd gescoord); telt mee in movement_score (drie items). Evidence: Ekelund 2016, WHO 2020.
6. **+NUT_O3 "ik eet geen vis"-optie** (§8.5): zelfde score-impact, eigen adviespad (algenolie/ALA) in de advies-copy; onderbouwing vermeldt het ijkpunt (Gezondheidsraad 1×/week vs omega-3-optimum 2×).
7. **LIF_SUN-opties herformuleren** (§8.8 — onderkant discriminerend maken); waarden blijven 4/3/2/1.
8. **Alle randen mee:** QuestionEvidence-entries voor nieuwe/gewijzigde vragen (met geverifieerde refs) · `/onderbouwing` toont ze automatisch? (verifieer render-bron) · `vitality-habit-kernel.ts` PILLAR_QUESTIONS + habit-regels voor NUT_VEG/MOV_SIT/CON_NEED-differentiatie · `themes.ts` recognition-lines waar relevant · urgentie/banden opnieuw checken (17 items) · tests · dev-data · `RULES_VERSION = "1.5.0"` + delta (of combineer met S3 tot één 1.4.0 — zie volgorde-rationale).

**Acceptatie:** 17 vragen in tier-1 · elk interventiedomein ≥ 2 gescoorde items · CON_NEED beïnvloedt score niet maar wél de habit-copy · invultijd-inschatting ~gelijk (17 × ~12 sec) · alle tests groen · delta gedocumenteerd.
**Risico/valkuil:** completion-rate — dit is de stap om `intake_completed` scherp te monitoren; spreek af dat een daling > enkele procentpunten binnen twee weken tot herziening van de nieuwe items leidt. Hermeting over de 1.3→1.5-grens: alleen regelset-bewust vergelijken.
**Meetpunt:** `intake_completed` vóór/ná · `intake_evidence_expanded` per nieuwe vraag (als evidence-UX al klikbaar is).
**Voorgestelde commit:** `feat(engine): RULES_VERSION 1.5.0 — tier-1-herverdeling: slaap 4→2, +CON_NEED/+NUT_VEG/+MOV_SIT, geen-vis-route, LIF_SUN-opties`

---

## S5 — Verbinding-fundament: plan-template, profiellabel, content-map

**Doel:** verbinding kan een volwaardige uitkomst dragen: eigen leefstijlplan, eigen label, werkende content-koppeling — de landingsplek voor S6.

**Lees eerst:** `src/data/lifestyle-plans/sleep.ts` (template-patroon, volledig) + `index.ts` · `src/types/lifestyle-plan.ts` · scope-review §2f/§2g · `docs/plan/LEEFSTIJLPLAN_HANDBOOK.md` · `docs/core/WRITING_VOICE.md`.

**Wijzigingen:**

1. **`src/data/lifestyle-plans/connection.ts`** — nieuw `LifestylePlanTemplate` (domain: "connection", guideThema: "verbinding"): recognition → mechanism (waarom verbinding na 40 anders werkt: netwerk verwatert door werk/gezin; kwaliteit > kwantiteit) → fasen (deze-week: één betekenisvol contact verdiepen · week-2-4: wederkerigheid + één terugkerend contactmoment in eigen vorm · week-4-12: maatschappelijke verbondenheid/structuur). Copy volgt de habit-differentiatie (laag-volume vs hoog-volume behoefte via CON_NEED waar beschikbaar); bronnen in `source`-velden (Holt-Lunstad 2010, Cohen & Wills — al geverifieerd). Géén supplement-stappen in dit plan (er is geen verbinding-supplementroute en dat blijft zo).
2. **`index.ts`**: `connection` toevoegen aan `PLAN_TEMPLATES` en `PLAN_TEMPLATE_DOMAINS`.
3. **Profiellabel**: verbinding-primair krijgt een eigen label i.p.v. "In Balans" (`getProfileLabel` in `intake-engine.ts` + `ProfileLabel["name"]`-union). Naamvoorstel afstemmen op de schrijfstem (bv. "Stille Kracht" / "Op Jezelf" — kies in sessie, check dat er geen botsende profielpagina-slug bestaat). Documenteer dat dit de label-uitkomst wijzigt voor nieuwe sessies (geen scoring-wijziging).
4. **`THEME_CONTENT_MAP.connection`**: `profileSlug` invullen zodra het label een profielpagina heeft; `pillarHref` pas wanneer er een pillar-pagina bestaat (kan later — noteer als open punt, forceer geen lege pagina).
5. **Taxonomy-proxy vervangen:** de grade-C-link `verbinding-steun → stress-werk-grenzen-stellen` (Fable-audit) vervangen door een koppeling naar het nieuwe plan/kennisbank-item `sociale-verbinding` (check `src/data/approach/category-taxonomy.ts`).

**Acceptatie:** plan verschijnt voor verbinding-primaire sessies (test via dev-data) · label ≠ "In Balans" bij verbinding-primair · taxonomy bevat geen werkstress-proxy meer als enige verbinding-link · tests (o.a. `insight-metadata.test.ts`, `primary-theme.test.ts`) groen · 375px-check plan-weergave.
**Meetpunt:** `plan.viewed` / `plan.step_state_changed` voor het nieuwe plan-domein.
**Voorgestelde commit:** `feat(verbinding): connection-leefstijlplan + eigen profiellabel + content-koppeling`

---

## S6 — Verbinding-check-in (gratis) + premium plan-gate + SVS-anker

**Doel:** de verdiepende verbinding-vragenlijst in het dashboard — **gratis check-in, verdiepend plan premium** (besloten 11 jul). Plus het SVS-criteriumanker in de hermeting.

**Lees eerst:** `AANBEVELING_SDT_VITALITEIT_VERBINDING.md` §3 (volledig ontwerp) · voedingscheck als patroon: `src/app/intake/voeding/page.tsx`, `NutritionCapture.tsx`, `NutritionResultView.tsx`, `src/app/api/intake/nutrition-log/route.ts`, `src/lib/nutrition-advice.ts` · gate-patroon: `src/lib/kennisbank-access.ts` + `KennisbankVerdiepingGate.tsx` (uit de moat-implementatie) · `VerbindingScreen.tsx` (huidige premium-placeholder) · memory: migraties via Dashboard SQL Editor.

**Deelstappen (waarschijnlijk 2–3 sessies):**

1. **Ontwerp-bevestiging & opslag (sessie 1):** bepaal opslagvorm naar analogie van de voedingscheck (eigen tabel of jsonb — volg het bestaande nutrition-log-patroon; als een migratie nodig is: SQL voorbereiden, Dennis voert uit via Dashboard). Zes items, drie assen (exacte teksten in aanbeveling §3): BPNSFS-relatedness (2, satisfactie + frustratie), De Jong Gierveld-bewerking (2, ⚠️ nooit "eenzaamheid"-label in UI), wederkerigheid/belasting (2). Antwoordschaal consistent (4-punts, geen "weet niet"-straf). Route `/intake/verbinding` — zelfde shell als de andere check-ins.
2. **Profiel & advies (sessie 2):** regelgebaseerde profielbepaling (geen LLM): "tevreden klein netwerk" (bevestiging, geen interventie) · "gever zonder tankstation" (wederkerigheid-advies) · "contact-gemis" (opbouw-route, maatschappelijke verbondenheid als laagdrempeligste pad) · mengprofielen → prioriteitsregel. Resultaatscherm in coaching-taal, patroon-framing, disclaimer. Koppeling naar het `connection.ts`-plan: **teaser zichtbaar, volledige plan-verdieping achter de bestaande gratis-account/premium-gate** conform "Verdieping na je check"-mechanisme — hergebruik `kennisbank-access`-logica, geen tweede gate-systeem bouwen.
3. **Dashboard-integratie + SVS-anker (sessie 3):** `VerbindingScreen` ombouwen: gratis check-in-CTA + (na afronden) profiel-samenvatting + gegate plan-verdieping; de bestaande `dashboard_verbinding_premium_upsell`-events blijven kloppen of worden vervangen (meting mee-migreren!). **SVS-anker:** 1–2 Subjective Vitality Scale-items (Ryan & Frederick 1997; vertaling in sessie opstellen, ongescoord, expliciet "helpt ons de check verbeteren") toevoegen aan de hermeting-flow; opslag bij de sessie; nadrukkelijk NIET in de vitaliteitsscore.
4. **Meting (verplicht in dezelfde wijziging):** check-in-events naar voedingscheck-analogie (started/completed/result_viewed) + gate-events (`gate_view`/`gate_intake`/`gate_login`-slugs hergebruiken). Elk nieuw client-event op de drie registratiepunten. Geen PII in payloads.

**Acceptatie:** check-in volledig doorloopbaar zonder account (gratis) · plan-verdieping gegate · profielen deterministisch getest (unit-tests op de regelset) · SVS-items in hermeting, niet in score · events zichtbaar in dev · 375px-check hele flow · compliance-check: geen diagnose-taal, geen "eenzaamheidsscore".
**Risico/valkuil:** dit is de gevoeligste copy van het product (eenzaamheid/steun) — laat de resultaat-copy expliciet door Dennis reviewen vóór live; De Jong Gierveld-bewerking mag niet als klinisch instrument gepresenteerd worden. DB-migratie alleen via Dashboard.
**Meetpunt:** check-in started/completed-funnel · gate-events · `plan.viewed` na gate.
**Voorgestelde commits:** per sessie één (`feat(verbinding): check-in flow + opslag`, `feat(verbinding): profielbepaling + resultaat + plan-gate`, `feat(verbinding): dashboard-integratie + SVS-anker + events`).

---

## S7 — Motivatie-module (V4–V6) → PlanCondition-personalisatie

**Doel (later — pas na S6-data):** zelfeffectiviteit, autonome motivatie en gewoonte-automatisme (SDT-rapport V4–V6) als optionele module ná het plan; voedt een motivatieprofiel dat via nieuwe `PlanCondition`-dimensies de plandosering stuurt (kleine stappen vs uitdaging). Ontwerp: SRBAI (Gardner 2012), TSRQ-stijl item, Bandura-stijl item — refs verifiëren. **Niet starten vóór S6 twee weken data heeft.** Scope-review L4 + SDT-rapport P2 zijn de ontwerpbronnen.

---

## B1 — Openstaand productbesluit (Dennis)

**Roken:** uitvragen als signaalvraag (analoog LIF_ALC; quick-win = verwijzing Thuisarts/ikstopnu; geen supplementpad) **óf** documenteren als bewuste grens in `docs/core/DOMAIN_MODEL.md`. De expertreview (§5.1) acht de huidige stilte onverdedigbaar voor een check die "vitaliteit" claimt; beide opties zijn compliance-veilig. Bij "uitvragen": meenemen in S4 (dan 18 vragen — weeg de completion-monitoring zwaarder) of als latere kleine bump.

## B2 — Naam & validiteitsclaim "vitaliteitsscore" (Dennis)

**Eerlijke bevinding:** de score meet leefstijl (de vijf knoppen), niet vitaliteit (de uitkomst) — energie/herstel zijn bewust readouts buiten de score. De naam belooft strikt genomen de uitkomst terwijl de input wordt gemeten.
**Aanbeveling (Claude, 11 jul):** naam **houden**, definitie aanscherpen via de S1-framing-zin ("hoe goed je leefstijl je vitaliteit ondersteunt" = ondersteuningsscore); het SVS-anker (S6) laat de naam zich empirisch verdienen. Hernoemen (→ "Leefstijlscore") alleen verplicht als de convergente validatie faalt (score blijkt niet samen te hangen met ervaren vitaliteit).
**Validiteits-lat:** fit-for-purpose, niet klinisch — vier treden: constructie (S0–S4) → interne kwaliteit (S2, herhalen bij ~150–300 sessies/regelset) → convergent (SVS-correlatie, richtwaarde r ≈ .4–.6) → responsiviteit/test-hertest (hermeting-data, 3–6 mnd). Overweeg een /onderbouwing-pagina "wat deze score wel en niet is en hoe we hem valideren" — transparantie als merkwapen; claim "gevalideerd" pas ná trede 3–4, tot die tijd de bestaande alignment-framing.

---

## Bewust NIET doen (uit de drie rapporten — niet heropenen)

1. Geen mortaliteits-/LEVY-percentages of "gelijk aan roken"-claims in de UI (MDR-grens) — alleen op `/onderbouwing` als leefstijlfactor.
2. Geen persoonlijkheidstest of MBTI-achtige typering — alleen behoefte-/discrepantievragen.
3. Geen mentale-klachten-screening (PHQ/GAD-achtig) en geen medicatie/aandoeningen-uitvraag (AVG art. 9).
4. Autonomie/competentie niet in de vitaliteitsscore — SDT stuurt personalisatie, niet de score.
5. Geen derde tier-1-verbindingvraag; geen tier-1 boven 17 (18 alleen bij roken-besluit) zonder dat er een vraag uit gaat.
6. Geen LLM in de engine (fase 1); check-in-profielen blijven regelgebaseerd.
7. Voedingsadvies niet dupliceren tussen leefstijlcheck en voedingscheck — de naad blijft: tier-1 signaleert, voedingscheck verdiept.
8. Referenties nooit ongeverifieerd op `/onderbouwing` — reeds geverifieerd (11 jul): Holt-Lunstad 2010, Cohen & Wills 1985, Sutcliffe/Dunbar 2012; al het overige eerst checken.

---

## Logboek

| Datum | Stap | Sessie-resultaat |
|-------|------|------------------|
| 11 jul 2026 | — | Plan opgesteld; besluiten vastgelegd (check-in gratis / plan premium); S0-instructies overgenomen uit de eerdere L0-prompt |
| 12 jul 2026 | S0 | Uitgevoerd: habit-kernel CON_SOC-regel, `STATIC_HEFBOOM.connection`, evidence (3 refs × 2 plekken + rationale-bullet + transparantie-note), `connection.md` herschreven, `ANALYSIS_PILLAR_COVERAGE.md` gecorrigeerd. Afwijking: CON_SOC-habitregel op verzoek Dennis herzien naar feit-eerst variant (zie sectie hierboven). tsc + vitest groen (123 files / 1095 tests). Niet gecommit. |
| 16 jul 2026 | S1 | Uitgevoerd: MOV_CARD herformuleerd (spreektest/zone-2-variant gekozen door Dennis, incl. subtitle; consistent in intake + movement-check-in + chat-label + evidence-copy), LIF_SUN-subtitle daglicht-eerst, `vitalityScoreFraming` op resultaatscherm (RevealHeroCard), transparantie-note toegevoegd. S1.3-inventaris: bewust geen wijziging (één-pad-principe + feit-eerst-besluit; keuze-architectuur = S7). 0 `value:`-velden geraakt; tsc + vitest groen (131 files / 1164 tests) + eslint schoon. Niet gecommit. |
| 16 jul 2026 | S2 | Uitgevoerd: `scripts/item-analyse.mjs` + `npm run analyse:items` + rapport `docs/research/ITEM_ANALYSE_BASELINE.md`. **N=1 → geen empirische baseline**; script/engine-math gevalideerd via drift=0. Gevolg: S3 math-gedreven, drempels behouden, empirische herijking uitgesteld (N≥100). Databron (dev vs prod) bevestigen vóór S3. Geen `src/`-wijziging. Niet gecommit. |
