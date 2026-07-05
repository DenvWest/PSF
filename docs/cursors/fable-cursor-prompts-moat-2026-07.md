# Fable-prompts — moat-implementatie (juli 2026)

Vier onderdelen na het besluitdocument `fable-moat-google-ai-premium-2026-07.md` (scenario 2:
teaser+gate bevestigd). Prompt 1–3 zijn zelfstandige copy-paste Cursor-prompts volgens
`docs/core/CURSOR_PROMPT_TEMPLATE.md`. Alle bestandspaden, functienamen en API-shapes zijn
geverifieerd tegen de codebase op 2026-07-05.

---

## 1. Implementatie-volgorde

**Prompt 0 vervalt als werk**: beide conversie-blokkeerders zijn al uitgevoerd (waitlist-fix =
commit `8382a17`; account-scoped events-route = commit `13fc9c6`, `src/app/api/account/events/route.ts`
bestaat) — Prompt 3 is dus gedeblokkeerd. Volgorde: **Prompt 1 (copy-rename) → Prompt 2 (teaser+gate)
→ Prompt 3 (weaving-consumer)**. P1 vóór P3 omdat beide `src/app/inzichten/page.tsx` raken (P1 alleen
de premium-feed-hero-copy, P3 alleen hub-logica); P2 vóór P3 omdat beide `src/app/kennisbank/[slug]/page.tsx`
raken (P2 herstructureert de render, P3 voegt daarna één regel toe). Elke prompt is ~0,5–1 dag Cursor-werk
en apart shipbaar; er zit geen harde afhankelijkheid tussen P1 en P2.

---

## 2. Prompt 0 — Conversie-blokkeerders (referentie)

Gebruik **geen nieuwe prompt**. De waitlist-500-fix (prompt 3 uit
`docs/cursors/fable-prompts-retentie-backlog-2026-07.md`) is uitgevoerd en gecommit (`8382a17`);
de account-events-route uit het conversieplan is live (`src/app/api/account/events/route.ts`,
commit `13fc9c6`). Resterende retentie-prompts 1–2 (Vandaag-kaart, Hermeting-reminder) staan
los van dit moat-werk en blijven in dat document; niets dupliceren.

---

## 3. Prompt 1 — Copy-rename "Verdieping na je check"

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/core/WRITING_VOICE.md (toon)
- docs/cursors/fable-moat-google-ai-premium-2026-07.md §3D.1 en §3D.5 (waarom deze rename)
- Bestanden (exacte paden, geverifieerd):
  - src/components/insights/InzichtenPremiumKennisbank.tsx — hub-blok + feed-grid van de tier 2–3
    begrippen; user-facing strings: eyebrow "Verdiepend — voor jou", h2 "Begrippen bij je check-in",
    subline "Verdiepende kennisbank — passend bij …", aria-labels "Verdiepende begrippen"
  - src/components/insights/InzichtenPremiumKennisbankUpsell.tsx — upsell voor anoniem op
    /inzichten?kennisbank=premium; belooft nu "beschikbaar voor account-houders"
  - src/app/inzichten/page.tsx — premium-feed-hero (het blok onder `isPremiumFeed`, regels ±297–317):
    eyebrow "Verdiepende begrippen", h1 "Kennisbank na je check-in"
  - src/components/dashboard/RecommendedInsights.tsx — footer-link "Verdiepende begrippen →" (regel ±92)

Achtergrond: de tier 2–3 kennisbank is gratis (account-gated), maar Plus (€49/jaar, betaald) komt
eraan. "Premium" mag user-facing alleen nog de betaalde Plus-context betekenen (zoals in
src/components/dashboard/DomainDeepTool.tsx — NIET aanraken). De gratis laag heet vanaf nu overal
"Verdieping na je check", met expliciete "gratis"-geruststelling.

## Taak
Copy-only rename in vier bestanden. Exacte wijzigingen:

1. src/components/insights/InzichtenPremiumKennisbank.tsx (hub-mode blok):
   - eyebrow `Verdiepend — voor jou` → `Verdieping na je check`
   - h2 `Begrippen bij je check-in` blijft staan
   - subline `Verdiepende kennisbank — passend bij {priorityLabel.toLowerCase()}` →
     `Gratis met je account — passend bij {priorityLabel.toLowerCase()}`
   - beide `aria-label="Verdiepende begrippen"` → `aria-label="Verdieping na je check"`
   - link `Alle verdiepende begrippen →` blijft staan (beschrijvend, geen tier-naam)

2. src/app/inzichten/page.tsx (alleen het premium-feed-hero-blok):
   - eyebrow `Verdiepende begrippen` → `Kennisbank`
   - h1 `Kennisbank na je check-in` → `Verdieping na je check`
   - voeg ná de bestaande body-alinea (die eindigt op "…persoonlijke context.") één zin toe binnen
     dezelfde <p>: ` Gratis met je account — geen abonnement nodig.`
   - de begrippen-teller en al het overige blijven ongewijzigd

3. src/components/insights/InzichtenPremiumKennisbankUpsell.tsx:
   - eyebrow `Verdiepende begrippen` → `Kennisbank`
   - h1 `Kennisbank na je Leefstijlcheck` → `Verdieping na je check`
   - intro-alinea vervangen door:
     `Gratis — geen abonnement nodig. Verdiepende begrippen uit de kennisbank lees je na je gratis
     Leefstijlcheck, ingelogd met je account. Zo koppelen we achtergrondkennis aan wat je in je
     dashboard ziet.`
     (eerste vier woorden in een <strong>)
   - kaart-alinea vervangen door:
     `Maak eerst je gratis Leefstijlcheck en log in om de verdieping te lezen — of log direct in
     als je al een account hebt. Dit is geen betaalde functie.`
   - beide CTA's (Start Leefstijlcheck → /intake, Inloggen → /account/login) ongewijzigd

4. src/components/dashboard/RecommendedInsights.tsx:
   - linklabel `Verdiepende begrippen →` → `Verdieping na je check →`

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- Server components default; "use client" alleen waar het al staat
- Semantic HTML behouden; één h1 per pagina
- Geen medische claims; geen scores of urgentie-getallen user-facing
- COPY-ONLY — verander NIET: componentbestandsnamen, exportnamen, de query-param `kennisbank=premium`,
  GA4-eventnamen (`inzichten_premium_kennisbank_click`, `dashboard_premium_kennisbank_click`),
  het anchor-id `premium-kennisbank` (wordt gebruikt door buildPremiumKennisbankHref in
  src/data/insights.ts), event-payloads, styling, layout
- "Premium"-strings in de Plus-context (src/components/dashboard/DomainDeepTool.tsx,
  PremiumWaitlistCard.tsx, StressScreen.tsx, VerbindingScreen.tsx) NIET aanraken
- Verander NIETS aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] `grep -rn "Verdieping na je check" src/` levert treffers in exact de 4 genoemde bestanden
- [ ] Geen user-facing "premium" meer op de gratis kennisbank-oppervlakken; Plus-context ongewijzigd
- [ ] Upsell en feed-hero bevatten allebei een expliciete "gratis / geen abonnement"-zin
- [ ] `buildPremiumKennisbankHref` en het `#premium-kennisbank`-anchor werken ongewijzigd
- [ ] Geen nieuwe console.log in src/
- [ ] tsc groen; build groen
- [ ] Meetpunt-melding: dit is een copy-rename zonder nieuwe CTA — bestaande events
      (`inzichten_premium_kennisbank_click`, `dashboard_premium_kennisbank_click`) blijven
      byte-gelijk; geen nieuw meetpunt nodig

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npx tsc --noEmit
3. npx vitest run
4. npm run build   (stop een draaiende `next dev` eerst — nooit builden naast een live dev-server)

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat(inzichten): gratis tier heet overal 'Verdieping na je check' — premium gereserveerd voor Plus"
```

---

## 4. Prompt 2 — Kennisbank teaser+gate + sitemap /inzichten + gate-meetpunt

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/cursors/fable-moat-google-ai-premium-2026-07.md §3D (besluit teaser+gate, scenario 2)
- docs/core/SEO_RULES.md en docs/core/COMPLIANCE.md
- .cursor/rules/meten.mdc (laag-keuze meetpunten)
- Bestanden (exacte paden, geverifieerd):
  - src/app/kennisbank/[slug]/page.tsx — TermPage rendert nu ALTIJD alle drie content-secties
    (`wat-is-het`, `hoe-werkt-het`, `waarom-dit-ertoe-doet`) + ArticleReferentiesFooter; heeft
    generateStaticParams over alle terms; metadata via term.metaTitle/metaDescription
  - src/data/kennisbank.ts — interface KennisbankTerm (regels 12–35) met
    `insightTier: 1 | 2 | 3` en `content: { whatIsIt, howItWorks, whyItMatters }`;
    melatonine-entry begint op regel ±480 (`slug: 'melatonine'`)
  - src/lib/inzichten-visitor-context.ts — KOPIEER DIT PATROON voor de access-check:
    getAccountFromCookie() → loadAccountDashboardData(account.id) → empty/!current = geen toegang
  - src/components/insights/InzichtenPremiumKennisbankUpsell.tsx — KOPIEER de kaart-styling
    (rounded-[20px] border bg-white, CTA-paar /intake + /account/login) voor het gate-blok;
    dit bestand zelf NIET wijzigen
  - src/lib/article-toc.ts — buildKennisbankTocItems levert de 3 vaste TOC-items; NIET wijzigen,
    filter in de page
  - src/lib/seo/structuredData.ts — buildDefinedTermSchema gebruikt al ALLEEN shortDefinition
    (regels 127–144); geen wijziging nodig, wel verifiëren
  - src/app/sitemap.ts — /inzichten ontbreekt; kennisbank-entries (regels 74–77) blijven
  - src/lib/ga4.ts (trackEvent) en src/lib/clarity.ts (clarityTag) — bestaande helpers

Achtergrond (moat-besluit): tier ≥2 begrippen zijn vandaag volledig publiek én geïndexeerd — de
"gate" bestaat alleen als UI op /inzichten. Vanaf nu: `shortDefinition` + `whatIsIt` publiek
(teaser, blijft ranken), `howItWorks` + `whyItMatters` + referenties alleen voor account +
afgeronde check. Server-side weglaten — de gated tekst mag NIET in de HTML zitten. Geen noindex,
geen 403, geen redirect: URL, canonical, breadcrumbs en DefinedTerm-schema blijven. Crawler en
anonieme bezoeker zien exact hetzelfde (geen cloaking).

## Taak

1. NIEUW `src/lib/kennisbank-access.ts`:
   - `export async function canAccessVerdieping(): Promise<boolean>`
   - Zelfde criterium als de premium-feed: `getAccountFromCookie()` (uit @/lib/account-server);
     geen account → false; anders `loadAccountDashboardData(account.id)` (uit
     @/lib/account-dashboard); `dashboard.empty || !dashboard.current` → false; anders true.
   - Kopieer de structuur van src/lib/inzichten-visitor-context.ts regel voor regel; alleen het
     returntype verschilt (boolean).

2. `src/data/kennisbank.ts`:
   - Voeg aan interface KennisbankTerm toe:
     `/** Handtekening-uitzondering: volledig publiek ondanks tier >= 2 (bv. melatonine-uitsluiting). */`
     `publicFullContent?: boolean`
   - Voeg `publicFullContent: true,` toe aan de melatonine-entry (slug: 'melatonine', regel ±480),
     direct onder `insightTier: 3,`.
   - Verander verder NIETS aan content of tiers.

3. NIEUW `src/components/kennisbank/KennisbankVerdiepingGate.tsx` ("use client"):
   - Props: `{ termSlug: string; termName: string }`
   - Kaart in de stijl van de upsell (max-w, rounded-[20px] border border-[#E7E5E4] bg-white,
     centered padding), semantisch als <aside aria-label="Verdieping na je check">.
   - Copy (exact, eerste zin in <strong>):
     kop (h2): `De verdieping is gratis — geen abonnement nodig.`
     alinea: `Hier gaat {termName} verder: hoe het werkt, waarom het ertoe doet voor jouw keuze,
     en de volledige wetenschappelijke referenties. Je leest het na je gratis Leefstijlcheck,
     ingelogd met je account — zo koppelen we de uitleg aan jouw situatie in plaats van aan
     iedereen tegelijk.`
   - CTA's: primair `Start de gratis check →` naar /intake; secundair
     `Ik heb al een account — inloggen` naar /account/login (zelfde knopstijlen als de upsell).
   - Meetpunt (GA4 + Clarity, GEEN domain_events — dit oppervlak is per definitie anoniem, dus
     geen account-cookie; conform meten.mdc):
     - bij mount éénmalig (useEffect + useRef-guard):
       `trackEvent("inzichten_premium_kennisbank_click", { slug: "gate_view", term: termSlug })`
       en `clarityTag("inzichten_layer", "kennisbank_gate")`
     - onClick intake-CTA: `trackEvent("inzichten_premium_kennisbank_click", { slug: "gate_intake", term: termSlug })`
     - onClick login-CTA: `trackEvent("inzichten_premium_kennisbank_click", { slug: "gate_login", term: termSlug })`
     - Bewust hergebruik van het bestaande eventtype met nieuwe slug-waarden — GEEN nieuw
       GA4-event verzinnen.

4. `src/app/kennisbank/[slug]/page.tsx` — TermPage:
   - Maak TermPage async. Bepaal:
     `const isGated = term.insightTier >= 2 && !term.publicFullContent && !(await canAccessVerdieping());`
   - isGated = false → render exact zoals nu (geen regressie voor tier 1, melatonine, ingelogd+check).
   - isGated = true →
     a) render: breadcrumb, header (h1 + shortDefinition), sectie `wat-is-het` (whatIsIt) — ongewijzigd;
     b) direct daarna <KennisbankVerdiepingGate termSlug={term.slug} termName={term.term} />;
     c) NIET renderen: sectie `hoe-werkt-het`, sectie `waarom-dit-ertoe-doet`, de
        domeinMetBeperktCausaalBewijs-aside, ArticleReferentiesFooter — de teksten mogen nergens
        in de HTML-response voorkomen (server-side weglaten, geen CSS-hide);
     d) WEL blijven renderen (publieke navigatie, geen diepte): "Gerelateerde vergelijkingen",
        "Gerelateerde begrippen", de Leefstijlcheck-CTA-sectie onderaan;
     e) TOC: `const tocItems = isGated ? buildKennisbankTocItems(term).filter((t) => t.id === "wat-is-het") : buildKennisbankTocItems(term);`
        — gebruik die gefilterde lijst voor zowel ArticleSidebar-headings als de mobiele
        ArticleTableOfContents, zodat er geen dode anchors zijn.
   - generateStaticParams blijft staan; het cookie-gebruik maakt de route request-time dynamisch —
     dat is verwacht en akkoord (zelfde patroon als /inzichten).
   - Metadata (metaTitle/metaDescription/canonical/openGraph) ongewijzigd; verifieer dat
     buildDefinedTermSchema alleen shortDefinition bevat (is al zo — niets aanpassen).

5. `src/app/sitemap.ts`:
   - Voeg een entry toe voor `/inzichten`: `entries(["/inzichten"], 0.8, "weekly")`, opgenomen in
     de return-array. Kennisbank- en blog-entries ongewijzigd laten (teasers blijven geïndexeerd —
     bewust besluit, GEEN noindex toevoegen).

Privacy: geen wijziging aan het verwerkingsregister nodig — de gate leest bestaande account-/
sessiedata en rendert anders; er wordt niets nieuws opgeslagen en er is geen nieuwe verwerker.
GA4-payloads bevatten alleen slug-strings, geen PII.

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- Server components default; "use client" alleen in KennisbankVerdiepingGate.tsx
- Semantic HTML; één h1 per pagina; gate als <aside>
- Geen medische claims; geen scores of urgentie-getallen user-facing
- Gated content server-side weglaten — nooit via CSS/hidden props; geen noindex, geen 403,
  geen redirect op term-pagina's
- Hergebruik bestaande event-types; geen nieuwe GA4-eventnamen; geen domain_events op dit oppervlak
- Verander NIETS aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local, src/lib/article-toc.ts,
  src/components/insights/InzichtenPremiumKennisbankUpsell.tsx (alleen als stijlbron lezen),
  de tier-waarden en content-teksten in src/data/kennisbank.ts
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] Anoniem: HTML van /kennisbank/hpa-as (tier 2) bevat `shortDefinition` + whatIsIt-tekst,
      bevat de gate-copy "De verdieping is gratis", en bevat GEEN fragment uit howItWorks of
      whyItMatters en GEEN referenties-footer
- [ ] Anoniem: /kennisbank/biobeschikbaarheid (tier 1) en /kennisbank/melatonine
      (tier 3 + publicFullContent) renderen volledig, byte-vergelijkbaar met vóór deze wijziging
- [ ] Ingelogd met afgeronde check: tier-2/3 pagina's renderen volledig, zonder gate
- [ ] Canonical, BreadcrumbList- en DefinedTerm-schema ongewijzigd aanwezig op gated pagina's
- [ ] Sitemap bevat https://perfectsupplement.nl/inzichten; kennisbank-entries onveranderd
- [ ] TOC/sidebar tonen op gated pagina's alleen "Wat is …?" — geen dode anchors
- [ ] Geen nieuwe console.log in src/
- [ ] tsc groen; vitest groen; build groen
- [ ] Meld bij afronding: "Meetpunt: inzichten_premium_kennisbank_click met slug
      gate_view/gate_intake/gate_login + clarityTag inzichten_layer=kennisbank_gate — hier lees
      je af of de gate converteert i.p.v. alleen blokkeert."

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npx tsc --noEmit
3. npx vitest run
4. npm run build   (stop een draaiende `next dev` eerst — nooit builden naast een live dev-server)
5. Start daarna eenmalig `npm run start` (of de dev-server) en controleer:
   curl -s http://localhost:3000/kennisbank/hpa-as | grep -c "De verdieping is gratis"   → 1
   curl -s http://localhost:3000/kennisbank/hpa-as | grep -ci "hoe werkt het"            → 0
   curl -s http://localhost:3000/kennisbank/melatonine | grep -ci "hoe werkt het"        → ≥1

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat(kennisbank): teaser+gate voor tier>=2 (gratis na check), /inzichten in sitemap, gate-meetpunt"
```

---

## 5. Prompt 3 — Weaving-consumer (plan-bridge, fase-regel, gapSignal, focus.viewed)

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/cursors/fable-inzichten-strategie-2026-07.md (Poort 3 + F5 week 2: eerste metadata-consumer)
- .cursor/rules/meten.mdc (laag-keuze meetpunten)
- Bestanden (exacte paden, geverifieerd):
  - src/types/insight.ts — weaving-velden `planPhase` (1|2|3) en `gapSignal`
    (keyof DeficiencySignals) bestaan; comment zegt "nog geen consumer leest dit veld" — dat los
    jij nu op (comment bijwerken)
  - src/data/insight-metadata.ts — CONTENT_METADATA-overlay + getContentMetadata(slug); vandaag
    getagd: eiwitbehoefte-na-40 (gapSignal protein_gap_signal), magnesium-en-slaapkwaliteit
    (planPhase 2), creatine-en-herstel, cortisol
  - src/lib/inzichten-visitor-context.ts — breid je uit; laadt al loadAccountDashboardData
  - src/lib/__tests__/inzichten-visitor-context.test.ts — bestaande tests bijwerken
  - src/lib/account-dashboard.ts — return bevat al: current.scores, current.vitality,
    profileLabel, answers, planProgress, planDomain (regels 489–515); GEEN extra query nodig
  - src/lib/dashboard-active-plan.ts — buildActivePlanHabit({ priorityId, priorityScore,
    vitality, domainScores, answers, progress }) → { source, phaseId, title, planHref, ... };
    KOPIEER de aanroep-conventie, wijzig dit bestand niet
  - src/lib/intake-engine.ts — getDeficiencySignals(answers) → DeficiencySignals (regel 186)
  - src/lib/reveal-model.ts — mapCheckScoresToDomainScores (zelfde import als in
    src/lib/visitor-personalization.ts)
  - src/app/inzichten/page.tsx — hub rendert visitorContext-afhankelijk; priorityItems =
    filterInsights({ pijler: priorityPillarId }) (regels 92–118)
  - src/components/insights/FocusAreaCard.tsx — KOPIEER het meetpatroon:
    trackEvent("focus_area_click", { pillar, destination })
  - src/components/blog/BlogArticlePage.tsx — artikel-template (fase-regel-mountpunt)
  - src/app/kennisbank/[slug]/page.tsx — term-template (fase-regel-mountpunt; NA prompt 2 is
    hier een gate — de fase-regel komt in de publieke zone, direct na de wat-is-het-sectie)
  - src/lib/account-events-client.ts — emitAccountClientEvent met ClientEmitType-allowlist
    (2 types); breid uit met "focus.viewed"
  - src/app/api/account/events/route.ts — CLIENT_EMIT_TYPES-Set (regels 9–12); breid uit met
    "focus.viewed" ("focus.viewed" staat al in DOMAIN_EVENT_TYPES in src/lib/events.ts:24 en
    heeft vandaag 0 emit-sites)

Architectuur-principe (twee sporen, IA_ECOSYSTEEM.md): blog- en kennisbank-artikelen zijn
statisch/SEO — daar komt een GENERIEKE fase-regel zonder cookies (route blijft statisch
renderbaar). Persoonlijke weaving (plan-bridge, gapSignal-herordening, focus.viewed) komt
uitsluitend op de /inzichten-hub, die al dynamisch is.

## Taak

1. `src/lib/inzichten-visitor-context.ts` — verrijk de context (enige consumer is
   src/app/inzichten/page.tsx + de test):
   - Nieuw returntype:
     `export type InzichtenVisitorContext = VisitorPersonalization & {`
     `  gapSignals: DeficiencySignals | null;`
     `  activePlan: { phaseId: string | null; stepTitle: string; planHref: string } | null;`
     `};`
   - gapSignals: `dashboard.answers ? getDeficiencySignals(dashboard.answers) : null`
   - activePlan: roep buildActivePlanHabit aan met
     priorityId = personalization.priorityPillarId,
     priorityScore = dashboard.current.scores[personalization.priorityPillarId],
     vitality = dashboard.current.vitality,
     domainScores = mapCheckScoresToDomainScores(dashboard.current.scores),
     answers = dashboard.answers, progress = dashboard.planProgress.
     Alleen als het resultaat bestaat én result.planHref niet null is →
     `{ phaseId: result.phaseId, stepTitle: result.title, planHref: result.planHref }`, anders null.
   - Werk src/lib/__tests__/inzichten-visitor-context.test.ts bij: bestaande cases blijven
     gelden; mock-data uitbreiden zodat de nieuwe velden deterministisch getest worden
     (minimaal: geen answers → gapSignals null + activePlan null).

2. NIEUW `src/components/insights/InzichtenPlanBridgeCard.tsx` ("use client"):
   - Props: `{ stepTitle: string; planHref: string; priorityPillarId: PillarId }`
   - Kaart (article, zelfde kaartstijl-familie als FocusAreaCard: rounded-[18px] border bg-white):
     eyebrow `Uit jouw check`, kop (h2) `Verder met je leefstijlplan`,
     regel `Volgende stap: {stepTitle}`, link `Ga naar je plan →` naar planHref.
   - onClick op de link: `trackEvent("focus_area_click", { pillar: priorityPillarId,
     destination: "inzichten_plan_bridge" })` — bestaand event, nieuwe destination-waarde.
   - Geen scores, geen urgentie-taal, geen fase-nummers uit de engine tonen (phaseId is
     intern; alleen de stap-titel is user-facing).

3. NIEUW `src/components/insights/InsightPhaseNote.tsx` ("use client"):
   - Props: `{ planPhase: 1 | 2 | 3 }`
   - Eén regel in een <aside role="note"> met rustige styling (text-sm text-stone-600, subtiele
     border-top of achtergrond):
     `Hoort bij fase {planPhase} van het leefstijlplan. Waar sta jij? ` +
     link `Doe de gratis Leefstijlcheck →` naar /intake.
   - onClick op de link: `trackEvent("focus_area_click", { destination: "artikel_plan_fase" })`.
   - BEWUST zonder cookies/account-logica — statisch-veilig voor SEO-pagina's.

4. Mount de fase-regel (alleen waar metadata bestaat; vandaag rendert dit dus op
   magnesium-en-slaapkwaliteit — dat is goed, de consumer maakt verdere tagging renderend):
   - src/components/blog/BlogArticlePage.tsx: lees
     `const { planPhase } = getContentMetadata(artikel.slug)` (import uit
     @/data/insight-metadata) en render `{planPhase ? <InsightPhaseNote planPhase={planPhase} /> : null}`
     ná de artikel-body en vóór gerelateerd/footer-secties.
   - src/app/kennisbank/[slug]/page.tsx: zelfde patroon met term.slug, gerenderd direct ná de
     `wat-is-het`-sectie (publieke zone — werkt dus ook op gated pagina's). Raak de gate-logica
     uit prompt 2 niet aan; dit is één import + één regel.

5. gapSignal-verrijking "Speelt voor jou nu" in src/app/inzichten/page.tsx:
   - Waar priorityItems wordt opgebouwd: als visitorContext.gapSignals bestaat, sorteer
     priorityItems stabiel zó dat items met `item.gapSignal &&
     visitorContext.gapSignals[item.gapSignal] === true` vooraan staan (hubFeatured pakt dan
     het gap-relevante item). Geen andere feed-logica wijzigen; anonieme bezoekers zien exact
     de huidige volgorde.

6. Plan-bridge mounten in src/app/inzichten/page.tsx (alleen hub-weergave, niet feed/aanpak):
   - Onder de InzichtenContextStrip, alleen als `hasContext && visitorContext.activePlan`:
     `<InzichtenPlanBridgeCard stepTitle={…} planHref={…} priorityPillarId={…} />` in een
     eigen <section aria-label="Jouw plan"> met Container.

7. focus.viewed durable activeren (stub heeft 0 emit-sites):
   - src/lib/account-events-client.ts: voeg `| "focus.viewed"` toe aan ClientEmitType.
   - src/app/api/account/events/route.ts: voeg `"focus.viewed"` toe aan CLIENT_EMIT_TYPES.
   - NIEUW `src/components/insights/InzichtenFocusViewedPing.tsx` ("use client"): rendert null;
     useEffect met useRef-guard → éénmalig
     `emitAccountClientEvent("focus.viewed", { pillar: priorityPillarId, has_plan: hasPlan })`.
   - Mount in src/app/inzichten/page.tsx, alleen als hasContext (er is dan per definitie een
     account-cookie — durable events toegestaan conform meten.mdc; de route dropt zelf al
     silent zonder analytics-consent, dus geen extra consent-check in de client).
   - Payload is kwalitatief (pillar-id + boolean) — geen scores, geen PII (DPIA-R4).

8. src/types/insight.ts: werk de comments op `planPhase`/`gapSignal` bij — "nog geen consumer"
   klopt na deze wijziging niet meer; benoem de consumers (InsightPhaseNote, inzichten-hub).

Privacy: geen wijziging aan het verwerkingsregister nodig — focus.viewed is een bestaand
geregistreerd eventtype op bestaande infrastructuur (PostHog-delivery), zelfde datacategorieën;
geen nieuwe verwerker.

## Constraints
- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- Server components default; "use client" alleen in de drie nieuwe componenten
- Semantic HTML (article/section/aside); één h1 per pagina blijft intact
- Geen medische claims; geen scores of urgentie-getallen user-facing; personalisatie-copy
  verwijst naar "je check", nooit naar clicks
- Geen cookies/auth op blog- en kennisbank-templates zelf (fase-regel is generiek); persoonlijke
  weaving alleen op /inzichten
- Hergebruik bestaande event-types: focus_area_click (nieuwe destinations) en focus.viewed
  (bestaande registratie in src/lib/events.ts) — GEEN nieuwe eventnamen
- Geen affiliate-links op /inzichten of in de fase-regel
- Verander NIETS aan: src/app/intake/, src/data/affiliate-links.ts, src/lib/scoring.ts,
  globals.css, deploy.sh, .env.local, src/lib/dashboard-active-plan.ts, src/lib/events.ts,
  src/data/insight-metadata.ts (tagging is een aparte batch), de gate-logica uit prompt 2
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] Ingelogd + actief plan: hub toont plan-bridge-kaart met actuele stap-titel; klik → planHref
- [ ] Ingelogd zonder plan of anoniem: geen bridge, hub identiek aan vandaag
- [ ] /blog/magnesium-en-slaapkwaliteit (of het canonieke pad) toont de fase-2-regel; artikelen
      zonder planPhase-metadata tonen niets
- [ ] Ingelogd met protein_gap_signal=true: eiwitbehoefte-na-40 staat vooraan in "Speelt voor
      jou nu"; anoniem: volgorde ongewijzigd
- [ ] focus.viewed komt binnen via POST /api/account/events (201/200-pad) bij ingelogd hub-bezoek;
      anoniem wordt er niets gePOST
- [ ] grep op `.planPhase` en `.gapSignal` buiten types/tests levert nu consumers op
- [ ] Bestaande + bijgewerkte tests in inzichten-visitor-context.test.ts groen
- [ ] Geen nieuwe console.log in src/
- [ ] tsc groen; vitest groen; build groen
- [ ] Meld bij afronding: "Meetpunt: focus_area_click destinations inzichten_plan_bridge /
      artikel_plan_fase (GA4) + focus.viewed durable (n8n/PostHog, consented cohort) — hier lees
      je af of kennis tot actie leidt."

## Verificatie
Draai vóór je stopt:
1. grep -rn "console.log" src/
2. npx tsc --noEmit
3. npx vitest run
4. npm run build   (stop een draaiende `next dev` eerst — nooit builden naast een live dev-server)

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
# Voorgestelde commit: git add -A && git commit -m "feat(inzichten): eerste weaving-consumer — plan-bridge, fase-regel, gapSignal-volgorde, focus.viewed durable"
```

---

## 6. Conflict-check (prompt × bestand)

| Bestand | P1 | P2 | P3 | Noot |
|---|---|---|---|---|
| src/components/insights/InzichtenPremiumKennisbank.tsx | ✏️ copy | — | — | |
| src/components/insights/InzichtenPremiumKennisbankUpsell.tsx | ✏️ copy | 👁 stijlbron | — | P2 leest alleen |
| src/app/inzichten/page.tsx | ✏️ hero-copy | — | ✏️ hub-logica | **Volgorde P1 → P3**; disjuncte regio's |
| src/components/dashboard/RecommendedInsights.tsx | ✏️ linklabel | — | — | |
| src/app/kennisbank/[slug]/page.tsx | — | ✏️ gate | ✏️ +1 regel fase-note | **Volgorde P2 → P3** |
| src/data/kennisbank.ts | — | ✏️ flag | — | |
| src/lib/kennisbank-access.ts | — | 🆕 | — | |
| src/components/kennisbank/KennisbankVerdiepingGate.tsx | — | 🆕 | — | |
| src/app/sitemap.ts | — | ✏️ 1 entry | — | |
| src/lib/inzichten-visitor-context.ts (+ test) | — | 👁 patroon | ✏️ verrijking | P2 leest alleen |
| src/components/insights/InzichtenPlanBridgeCard.tsx / InsightPhaseNote.tsx / InzichtenFocusViewedPing.tsx | — | — | 🆕 | |
| src/components/blog/BlogArticlePage.tsx | — | — | ✏️ | |
| src/lib/account-events-client.ts · src/app/api/account/events/route.ts | — | — | ✏️ allowlist | |
| src/types/insight.ts | — | — | ✏️ comments | |

Enige echte overlap: `inzichten/page.tsx` (P1→P3) en `kennisbank/[slug]/page.tsx` (P2→P3) — beide
opgelost door volgorde; P3 raakt daar uitsluitend andere regels dan zijn voorganger.

---

## 7. Dennis week-1 checklist (geen code)

1. **Ring-split per slug bevestigen** — loop de 24 begrippen langs de vuistregel (moat-rapport
   §3B.4). Default staat goed; expliciet te beslissen: blijven `slaaphygiene` en
   `eiwitbehoefte-na-40` tier 2 (gated diepte) of worden het tier-1 acquisitie-toppers?
   Melatonine = publiek-uitzondering (zit in Prompt 2 als `publicFullContent`).
2. **Tier-herziening (optioneel)** — cortisol/testosteron/vitamine-d zijn de best rankende
   kandidaten; hun teaser blijft ranken, dus alleen hertieren als je de díepte publiek wilt.
3. **Handtekening-set vaststellen (4–6)** — voorstel: melatonine (begrip + waarom geen koop-CTA),
   ashwagandha-uitsluiting, omega-3-geen-energie-claim, efsa-claims, derde-partij-testen,
   biobeschikbaarheid. Deze bewust publiek houden én promoten (social pijler 2).
4. **Naam bevestigen** — "Verdieping na je check" (Prompt 1) als vaste term in alle toekomstige
   copy en Cursor-prompts; "premium" alleen nog voor Plus.

---

## 8. Meetplan na 30 dagen (= moat-rapport §3E week 4)

| KPI | Bewijst | Waar aflezen |
|---|---|---|
| `gate_view` → `gate_intake`/`gate_login` CTR | Gate converteert i.p.v. alleen blokkeert | GA4 (event inzichten_premium_kennisbank_click, slug-dimensie) |
| Return visits ingelogd op /inzichten + premium-feed-CTR | Ring 2 levert waarde ná conversie | GA4 + Clarity (inzichten_layer-tag) |
| `focus_area_click` inzichten_plan_bridge / artikel_plan_fase → check-in of plan-stap binnen dezelfde week | De lus werkt (dé maat) | GA4 + focus.viewed/plan-events in n8n-weekrapport (consented cohort) |
| Organische impressies teaser-URL's vóór/na gate | Teaser-model kost geen definitie-rankings | Search Console, handmatig |

---

*Opgesteld: 5 juli 2026 (Fable-sessie moat-prompts). Geen code gewijzigd, geen commits.*
