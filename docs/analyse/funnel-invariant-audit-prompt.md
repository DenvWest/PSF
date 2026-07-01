# Funnel-invariant-audit — herbruikbare prompt

> **Status:** prompt-doc (geen code, geen bevinding). Dit is een *tool*, geen analyse.
> Draai 'm **maandelijks** of **na elke grote funnel-wijziging** (reveal/nurture/dashboard/routing).
> Datum aangemaakt: 1 juli 2026.
>
> **Waarom deze bestaat.** De vorige analyse
> ([leefstijlcheck-supplement-dashboard-analyse.md](./leefstijlcheck-supplement-dashboard-analyse.md))
> was *ontdekkend* ("waar zit de fragmentatie?"). Nu de recommendation-SSOT staat, is de vraag
> *bewakend*: **blijft het één bron, en zijn de invarianten testbaar afgedwongen?** Je verschuift van
> *"vind de rommel"* naar *"bewijs dat de rommel niet kan terugkomen"* — output is een set
> invariant-tests die in CI komen, zodat de pipeline sterk **blijft** in plaats van opnieuw te driften.

---

## Rol
Principal engineer. Voer een READ-ONLY invariant- & drift-audit uit op de
leefstijlcheck→reveal→nurture→dashboard-pipeline van PerfectSupplement.
Geen code wijzigen, geen git. Output Nederlands, identifiers Engels, bewijs
als bestand:regel. Code is bron van waarheid; docs lopen achter.

## Aanname (verifieer, herhaal niet)
De recommendation-SSOT bestaat: recommendation-engine.ts ← supplement-catalog.ts.
Consumers: reveal-supplement, build-recommendations (hub), resolve-nurture-cta,
resolve-domain-supplement-tip. PLAN-interventies migreerden (mogelijk) van
getSupplementRoute. Account-auth is gehard. Valideer of dit nog klopt.

## Te bewijzen invarianten (per stuk: HOLDT / GESCHONDEN + bewijs)
1. EÉN routing-bron. Geen surface routeert naar /beste/* of supplementen buiten
   recommendation-engine. (grep op COMPARISON_PATHS, /beste/, hardcoded slugs,
   PILLAR_COMPARISON_ROUTES, SUPPLEMENT_ROUTE_DEFINITIONS, getSupplementRoute.)
2. EÉN "belangrijkste domein". reveal-kop, reveal-eerste-stap, nurture
   primary_domain en dashboard priority leiden allemaal af uit dezelfde ladder.
   Toon een score-vector waar ze divergeren, of bewijs dat het onmogelijk is.
3. Compliance-gate sluitend. Elk pad naar een supplement-CTA passeert
   resolveGatedComparisonPath (approved-only). Zoek paden die 'm omzeilen
   (partner/chat/getAdvice, e-mailtemplates, profielpagina's).
4. Event-integriteit. Elk domain_event-type heeft één betekenis; geen type wordt
   als drager voor meerdere gebeurtenissen hergebruikt; geen PII in GA4/Clarity.
5. Snapshot vs live. Bij nurture-send: welke velden komen uit de snapshot, welke
   live? Kan een revoke/anonimisering een al-geclaimde mail nog lekken?
6. Idempotentie & dedup. Her-intake, dubbele cron-run, crash tijdens send:
   ontstaan dubbele sequences of dubbele sends?
7. RULES_VERSION-discipline. Is elke beslis-/adviesregel-wijziging gebumpt en
   blijven baseline↔hermeting-vergelijkingen regelset-bewust?

## Per invariant
- Bewijs (bestand:regel) + de scherpste tegenvoorbeeld-score-vector.
- Is er een test die 'm afdwingt? Zo nee: schrijf het acceptatiecriterium voor
  een vitest-invariant-test (geen implementatie).

## Output
1. Invariant-scorebord (7 rijen: HOLDT/GESCHONDEN/ONBEKEND + bewijs).
2. Drift sinds vorige audit (nieuwe parallelle bronnen, nieuwe ongegate paden).
3. Top-3 invarianten die als CI-test geborgd moeten worden (acceptatiecriteria).
4. Eén "canary"-test-suite-voorstel die breekt zodra iemand de SSOT omzeilt.
