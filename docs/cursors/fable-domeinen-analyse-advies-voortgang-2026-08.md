# Fable-prompt — Domeinen als analyse + advies × conversiekaart × productbron (augustus 2026)

Eén zelfstandige copy-paste prompt voor één Fable-sessie. Bestandspaden, exports en
as-built-feiten geverifieerd tegen `main` op **2026-08-02**, commit `c3f73f1`.
Geen code gewijzigd, geen commits.

## Context — het probleem dat deze ronde oplost

De zeven domeinen zijn ongelijk volwassen. Beweging is doe/oefening-rijk (eigen
sessiecatalogus, doe-surface-besluit in
[`BESLUIT_BEWEGING_PRODUCT_EN_IA.md`](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)).
Voeding heeft de rijkste analyse-keten (log → delta → advies-personalisatie → Favorieten).
Slaap, stress en verbinding zijn dunner; energie en herstel zijn readouts zonder plan.
De Voortgang-conversiekaart
([`voortgang-conversiekaart-prebuild-2026-07.html`](../design/voortgang-conversiekaart-prebuild-2026-07.html))
is geparkeerd tot de domeinen het sjabloon kunnen voeden
([`voortgang-plan-later.md`](../design/voortgang-plan-later.md), voorkeur-notitie 30 jul:
v1-compositiemodel = referentiepunt). Productaanbevelingen komen nu uitsluitend uit
vragenlijst + signalen ([`recommendation-engine.ts`](../../src/lib/recommendation-engine.ts));
wearables/bloed zijn horizon.

Deze prompt laat Fable per domein bepalen: **wat is de minimale aanpassing met de grootste
winst zodat elk domein primair analyse + advies is** (geen oefeningenbibliotheek), schaalbaar
de conversiekaart voedt, en productaanbevelingen affiliate-first levert met een toekomstvaste
productbron-abstractie.

## Waarom Fable (niet Opus)

| Job in deze ronde | Model |
|---|---|
| Cross-domein effort×impact, schaalbaarheid, productbron-architectuur, poort "wanneer Voortgang uit park" | **Fable** |
| Conversiekaart-compositie herontwerpen / pixel-craft | Niet — prebuild is referentie; Fable levert alleen het feed-contract |
| Wireframe-polish per domein ná het Fable-verdict | Optionele Opus-follow-up (sectie K verwijst door) |

## Vaste besluiten (Dennis, 2 aug — niet heropenen in de sessie)

| Keuze | Default |
|---|---|
| Output | **1B**: analyse + concrete product/IA-specs die later 1:1 Cursor-prompts worden — geen React/diffs, geen nieuwe HTML-prebuild |
| Eigen producten | **2A**: abstracte productbron (nu affiliate → `/beste/*`; later eigen SKU of white-label coach-catalogus); merkbelofte "geen eigen producten" ([`BRAND_POSITIONING.md`](../core/BRAND_POSITIONING.md) §1) blijft vandaag intact |
| Domeinmodel | 5 interventies + 2 readouts — [`DOMAIN_MODEL.md`](../core/DOMAIN_MODEL.md), [`domain-role.ts`](../../src/lib/domain-role.ts) |
| UX-hiërarchie | Analyse primair, actie secundair (DOMAIN_MODEL §5.1); oefeningen = detail in sheet, geen eigen primary |
| Surface-sjabloon | 1 doe-surface + analyse/advies op Voortgang (Beweging-besluit C.4 generaliseren); klaar-staat-regel: advies wordt pas prominenter ná de open dagstap |
| Conversiekaart | v1-prebuild = referentie, niet herontwerp; Fable specificeert het feed-contract (meetlat, focuschip, stages, Mijn Dag-koppeling, events) + delta-tabel "wat de prebuild nog nodig heeft" |
| Product | Nu: engine → `comparisonPath`/`hubSlug` (geen shop-URL in het dashboard). Later: `ProductSource`-abstractie (affiliate \| own/coach catalog) zonder UI-omslag |
| Premium | Basis-analyse gratis; premium = begeleiding / diepere longitudinaliteit later — geen gated "betere producten" |
| Wearables/bloed | Alleen analyse-enrichment + zekerheidsladder; geen checklist-input; bloed referral-only, niet opslaan/duiden ([`STEPPED_CARE_MODEL.md`](../core/STEPPED_CARE_MODEL.md)) |
| Compliance | Adviezen, geen diagnoses; EFSA via [`approved-claims.ts`](../../src/data/approved-claims.ts); geen PII in GA4/Clarity |

## Gebruiksinstructie

1. Plak de prompt hieronder integraal in een **nieuwe Fable-sessie met repo-toegang**
   (Claude Code in `~/psf`). Fable leest de leeslijst zelf — geen bijlagen meeplakken.
2. Output = één verdict-rapport:
   `docs/cursors/fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md` met de
   secties A–N. Fable raakt géén andere bestanden en commit niet.
3. Ná jouw review van het verdict: de Cursor-bouwpakketten uit sectie M worden per golf
   als aparte implementatie-prompts uitgewerkt. Opus-follow-up alleen als sectie K
   surface-craft/copy-compositie per domein aanwijst.
4. Niets wordt gebouwd vóór review — dit is een besluitronde, geen bouwronde.

---

## Prompt — domeinanalyse × conversiekaart × productbron

```text
MODEL-CONTEXT: Claude Fable — strategie/verdict-analyse met expliciete redeneerstappen.
Dit is een ANALYSE-sessie: geen code-implementatie, geen React/diffs, geen commits,
geen nieuwe HTML-prebuild. Eindproduct = één markdown-rapport.
PROJECT: PerfectSupplement (Next.js 16, TypeScript strict, Supabase) — mannen 40+,
"Consumentenbond van supplementen", affiliate-monetisatie op /beste/*.
TAAL: rapport in het Nederlands; code-identifiers Engels.

LEES VÓÓR JE BEGINT (leeslijst — open ze echt, citeer met pad:regel):
- Concept: docs/core/DOMAIN_MODEL.md (m.n. §5.1 analyse primair / actie secundair),
  docs/core/STEPPED_CARE_MODEL.md, docs/core/BRAND_POSITIONING.md (§1 "geen eigen
  producten", §4 moat)
- Design: docs/design/voortgang-conversiekaart-prebuild-2026-07.html +
  docs/design/voortgang-prebuild-notitie-2026-07.md (stage-model, meetlat,
  meetpunt-inventaris), docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md (m.n. A.1
  noordster, C.1 drie surfaces, C.4 generieke regel voor andere domeinen, D.1
  first-viewport contract, E.3 analyse-readout op de doe-surface),
  docs/design/voortgang-plan-later.md ("Voortgang meet, Mijn Dag doet" +
  voorkeur-notitie 30 jul)
- Plan: docs/plan/PLAN_DOMAIN_DEEP_TOOL.md (§4.1 domein-matrix, §4.2 shell),
  docs/plan/ANALYSIS_PILLAR_COVERAGE.md (dekkingsmatrix, kruisregels, wearable-beslispunt)
- Eerdere Fable-context (NIET heropenen zonder onderbouwing):
  docs/cursors/fable-vervolg-geintegreerd-2026-07.md,
  docs/cursors/fable-conversie-datastrategie-2026-07.md
- Reeds besloten volgordes/plannen (respecteren, in sectie H integreren — niet
  herbeslissen): docs/plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md,
  docs/plan/PLAN_DOELGREEP_DOSIS_NA_CHECK.md,
  docs/plan/BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md
- Code-SSOT's: src/lib/domain-role.ts, src/lib/recommendation-engine.ts +
  src/types/recommendation.ts, src/lib/build-recommendations.ts,
  src/lib/supplement-eligibility.ts, src/data/lifestyle-plans/*,
  src/data/dashboard/index.ts (PILLARS), src/data/domain-supplement-candidates.ts,
  src/types/wearable-signals.ts + src/app/api/account/wearable/snapshot/route.ts,
  src/lib/dashboard-readout.ts, src/components/dashboard/voortgang/ (map-inventaris)

WERKWIJZE (Fable-lens, verplicht in deze volgorde — schrijf elke fase kort uit):
F0  North star — 1 alinea: welk product-gat sluit deze ronde?
F1  Verificatie — open de genoemde bestanden; noteer per claim WEL/NIET + bewijspad
    (pad:regel). Bij afwijking van de as-built-bullets hieronder: melden, niet gokken.
Dan per domein en per architectuurvraag: KEEP / REFINE / KILL / DEFER met max 5 regels
onderbouwing per verdict → effort×impact-matrix → beslissingspoorten → bouwgolven.

CENTRALE VRAAG
Per domein: wat is de minimale aanpassing met de grootste winst zodat elk domein
primair analyse + advies is (niet oefeningenbibliotheek), schaalbaar voedt aan de
conversiekaart (Signaal → Routekaart → Actie → Meetlat → Advies/Favorieten), en
productaanbevelingen affiliate-first levert met een toekomstvaste
productbron-abstractie (vragenlijst nu; wearables/bloed later als analyse-enrichment)?

VASTGEZETTE DEFAULTS (niet heropenen; wél toetsen op interne consistentie — bij een
botsing met de code of tussen defaults onderling: signaleren in sectie L, niet
herbeslissen):
1. Domeinmodel = 5 interventies (slaap, stress, voeding, beweging, verbinding) +
   2 readouts (energie, herstel) — DOMAIN_ROLE / READOUT_DRIVERS in domain-role.ts.
2. UX-hiërarchie = analyse primair, actie secundair (DOMAIN_MODEL §5.1); oefeningen
   zijn detail in een sheet, nooit een eigen primary surface.
3. Surface-sjabloon = per interventiedomein 1 doe-surface + analyse/advies op
   Voortgang; generaliseer het Beweging-besluit (BESLUIT_BEWEGING C.4) en de
   Voeding-keten. Klaar-staat-regel: advies wordt pas prominenter dan de dagstap
   ná de open dagstap (D.1-contract).
4. Conversiekaart-v1-prebuild = referentie, geen herontwerp. Jij levert het
   feed-contract + delta-tabel; geen nieuwe HTML.
5. Product vandaag = engine → comparisonPath/hubSlug (interne routes, geen shop-URL
   in het dashboard). Later = ProductSource-abstractie (affiliate | own/coach
   catalog) zonder UI-omslag. Merkbelofte "geen eigen producten" blijft vandaag
   intact; dit is een interface-extensiepunt, geen go-to-market.
6. Premium = basis-analyse gratis; premium is begeleiding / diepere
   longitudinaliteit later. Nooit gated "betere producten".
7. Wearables/bloed = analyse-enrichment + zekerheidsladder op de analyse-laag
   (WearableSignalSnapshot-vorm); nooit checklist-input; bloed referral-only,
   niet opslaan of duiden (STEPPED_CARE).
8. Compliance = adviezen geen diagnoses; EFSA via approved-claims; geen PII in
   GA4/Clarity; affiliate-links nooit in het dashboard zelf.

F1 — VERIFICATIE-TARGETS (stand 2 aug 2026, commit c3f73f1 — toets, corrigeer waar
de repo inmiddels verder is):

| Bestand | Wat controleren |
|---|---|
| src/lib/domain-role.ts | DOMAIN_ROLE (5+2), READOUT_DRIVERS: energie ← slaap/voeding/beweging; herstel ← slaap/beweging/stress; isReadout/isInterventionDomain |
| src/data/dashboard/index.ts | PILLARS (r.16): 7 pijlers — de UI-bron naast domain-role |
| src/types/recommendation.ts | RecommendationInput (r.5-11): { scores, signals, profileLabel, answers, rulesVersion } — GEEN wearable/blood-veld |
| src/lib/recommendation-engine.ts | getRecommendations (r.384), getPillarRecommendation (r.402), collectVerdictTriggers (r.434), getCatalogEntry (r.461), matchesOvertrainerAnswers (r.34); catalog-entries met comparisonPath (/beste/*) + hubSlug |
| src/lib/build-recommendations.ts | hubSlug→gids / comparisonPath→/beste/* mapping (r.82-96) — de enige productroute-uitgang |
| src/lib/supplement-eligibility.ts | canShowSupplementStrip (r.18), canShowSupplementRecommendation (r.24), buildRecommendationsEligibility (r.34), isNutritionLogCompleted (r.12) — de bestaande klaar-staat-poort voor product |
| src/data/domain-supplement-candidates.ts | per-domein supplement-kandidaten — product-hook per domein |
| src/data/lifestyle-plans/ | sleep/stress/nutrition/movement + index — verbinding heeft GEEN plan-template |
| src/data/movement/ | session-catalog.ts, sport-catalog.ts, movement-forms.ts, targets.ts, pal-reference.ts, daily-rhythm.ts, log-modalities.ts — beweging is het enige domein met sessiecatalogus |
| src/lib/movement-session-log.ts + movement-week-roadmap.ts + movement-plan-execution.ts | de doe/log-keten van beweging |
| src/data/nutrition/ + src/data/dashboard/nutrition-curated.ts + src/lib/nutrition-delta.ts + nutrition-advice-personalization.ts + nutrition-log-response.ts + nutrition-lifestyle-extras.ts | de voeding-analyse-keten — rijkste keten richting Favorieten |
| src/components/dashboard/voortgang/ | productie-Voortgang: VoortgangHero, VoortgangRouteList, StatistiekenBlikNav/Panels, FavorietenKeuzeSection, FavorietenAanraderSection, VoortgangBewijsband, DomeinDoelZetten e.a. — dit is NIET de conversiekaart |
| src/types/wearable-signals.ts + src/app/api/account/wearable/snapshot/route.ts | WearableSignalSnapshot (analyse-laag, expliciet niet checklist) + snapshot-route — de bestaande stub |
| src/lib/dashboard-readout.ts | getReadoutPresentation: driverLabels + primaryCta per readout |
| src/lib/events.ts + src/lib/intake-events-client.ts + src/app/api/intake/events/route.ts + src/lib/account-events-client.ts + src/app/api/account/events/route.ts | drie-plekken-registratie (intake) + account-allowlist — het registratiepad voor elk nieuw meetpunt |
| docs/design/voortgang-prebuild-notitie-2026-07.md | stage-model Test→Check→Advies→Favorieten→Beste (stage 5 = ghost), meetlat-samenvoeging (één tegel, rijen met sparkline+delta+ijkpunt-chip, gedeelde focusschaal), Mijn Dag-koppelstrip, event-inventaris |

AS-BUILT-BULLETS (geverifieerd 2 aug — jouw F1 toetst ze):
- 7 scores; plan-templates alleen voor sleep/stress/nutrition/movement; verbinding =
  interventiedomein zonder plan-template; readouts zonder plan.
- Voeding = rijkste analyse-keten naar Favorieten; beweging = enige sessiecatalogus
  + doe-surface-besluit; slaap/stress dunner (plan + check-in, weinig analyse-diepte);
  verbinding vrijwel leeg.
- Voortgang in productie (src/components/dashboard/voortgang/) ≠ conversiekaart-
  prebuild; de kaart is geparkeerd (voortgang-plan-later.md, 30 jul: v1-compositie =
  referentiepunt, beweging heeft voorrang).
- Productrecs komen uitsluitend uit RecommendationInput (vragenlijst + signalen);
  wearable-stub bestaat maar voedt niets in de rec-keten.

OUTPUT — SECTIES A–N (alle veertien verplicht, in deze volgorde):

A  North star + scope. Wat deze ronde WEL en NIET beslist. Max 1 pagina.

B  F1 as-is gap-matrix per domein (alle 7). Kolommen: analyse-diepte ·
   doe-surface · Voortgang-feeds · product-hook · schaalbaarheidschuld. Per cel
   WEL/NIET/DEELS + bewijspad (pad:regel). Dit is de feitenbasis voor alles hierna.

C  Uniform domeincontract. Generaliseer Beweging (C.4) + Voeding tot één contract
   met vier lagen: Analyse-shell (welke data, welke lijn/trend, welke check-in) ·
   Advies-ladder (leefstijl eerst → supplement, stepped-care-conform) ·
   Product-oordeel (wanneer en hoe een comparisonPath/hubSlug verschijnt;
   eligibility-poort) · klaar-staat-gate (wanneer mag advies prominenter dan de
   dagstap). Specificeer per laag de minimale data-input zodat óók een dun domein
   (verbinding) het contract kan dragen zonder nep-diepte.

D  Per domein (7×): KEEP / REFINE / KILL / DEFER op de huidige invulling + 1–3
   bets met effort×impact. Bets = minimale aanpassing, maximale winst richting het
   C-contract. Geen bet mag een oefeningenbibliotheek bouwen; geen bet mag een
   domein "vullen" met content die de check niet meet.

E  Readouts-spec (energie/herstel). Hoe een readout het C-contract gedeeltelijk
   draagt: drivers-CTA (getReadoutPresentation), nooit een eigen plan, nooit een
   eigen product-primary. Wat een readout WEL aan de conversiekaart mag leveren.

F  Productbron-architectuur. (1) RecommendationInput vandaag: wat de vragenlijst
   levert en waar dat knelt. (2) Extensiepunten: wearable-snapshot en
   blood-referral-metadata als OPTIONELE enrichment-velden — hoe die de zekerheids-
   ladder verhogen zonder de basis-keten te breken. (3) ProductSource-interface:
   affiliate-first (comparisonPath/hubSlug) als eerste implementatie; own-SKU /
   white-label coach-catalogus als tweede implementatie ACHTER dezelfde interface —
   welke velden, welke resolutie-volgorde, en waarom de UI bij een omslag niets
   merkt. Expliciet: geen go-to-market, alleen het interface-extensiepunt.

G  Koppelcontract → conversiekaart. Welke velden, events en states elk "klaar"
   domein moet leveren aan de v1-prebuild: meetlat-rij (score, delta, sparkline-bron,
   ijkpunt-chip), focuschip, stage-bepaling (Test→Check→Advies→Favorieten→Beste),
   Mijn Dag-koppeling, event-namen. Plus een delta-tabel: wat de prebuild aanneemt
   vs wat de productie-code vandaag kan leveren — per delta: welk domein/welke bet
   uit D hem dicht. Geen nieuwe HTML; de prebuild wordt niet herschreven.

H  Bouwgolven + poort. Groepeer de D-bets in golven (afhankelijkheden expliciet)
   en integreer met de al vastgelegde volgordes (eigen-ijkpunt-plan, doelgreep-
   dosis, stappenplan-roadmap) — niet herprioriteren wat daar al ligt, wel de naad
   benoemen. Formuleer de expliciete poort: "Voortgang-v1 mag uit park wanneer
   [meetbare condities]". De poort is een checklist, geen datum.

I  Meetpunten. Hergebruik bestaande event-types eerst; elk nieuw event alleen met
   het volledige registratiepad (drie-plekken of account-allowlist) benoemd.
   Per golf: "Meetpunt: <event(s)> — hier lees je het effect af."

J  Premium-grens per laag. Waar de gratis analyse ophoudt en begeleiding begint —
   per laag van het C-contract. Geen nieuwe locks zonder meetpunt; geen gated
   producten (default 6).

K  Copy-/IA-skeletons. Tekst- en mermaid-skeletons per domeintype (rijk /
   middel / dun / readout) — geen pixel-wireframes. Waar surface-craft of
   copy-compositie per domein nodig is: markeer als "Opus-follow-up" met een
   1-regel-briefing per item.

L  Open risico's + bewuste NIET-lijst. Incl. elke botsing tussen defaults en
   code die je in F1 vond.

M  Cursor-bouwpakketten. Per golf uit H één prompt-skelet (rol, leeslijst,
   taak-kern, constraints, acceptatie, verificatie — het bestaande
   Cursor-promptpatroon uit docs/cursors/). Skelet = structuur + kernbeslissingen;
   de volledige prompts volgen ná review.

N  Verdict in 10 regels voor Dennis. Wat je beslist hebt, wat je van hem nodig
   hebt, wat de eerstvolgende actie is.

CONSTRAINTS (altijd):
- Geen codewijzigingen, geen commits, geen nieuwe HTML-prebuild, geen wijzigingen
  aan bestaande docs — alleen het nieuwe verdict-rapport.
- Niet heropenen: het 5+2-model, "energie als interventie", de vastgezette
  defaults 1-8, en besluiten uit de eerdere Fable-docs (tenzij je een aantoonbare
  code-botsing vindt — dan signaleren in L).
- Geen private-label go-to-market; alleen het ProductSource-interface-extensiepunt.
- Geen medische claims in voorgestelde copy; inname-taal, geen status-taal;
  "adviezen, geen diagnoses".
- Affiliate-links horen niet in het dashboard; productroutes in het dashboard
  blijven interne comparisonPath/hubSlug-routes.
- Elke aanname die je niet in code of docs kunt verifiëren: expliciet markeren
  als AANNAME, niet als feit presenteren.

SLOTINSTRUCTIE
Schrijf het volledige rapport (A–N) naar
docs/cursors/fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md.
Raak geen andere bestanden aan. Geen git-commando's. Stop na het schrijven zodat
Dennis kan reviewen.
```

---

## Na de sessie

- **Verdict-review door Dennis** → daarna worden de M-skeletten per golf uitgewerkt tot
  volledige Cursor-prompts (aparte sessies, implementatie in `src/`).
- **Opus-follow-up** alleen voor de items die sectie K expliciet doorverwijst
  (surface-craft / copy-compositie per domein) — niet standaard.
- De conversiekaart-prebuild blijft ongewijzigd staan als referentie; de poort uit
  sectie H bepaalt wanneer Voortgang-v1 uit park mag.
