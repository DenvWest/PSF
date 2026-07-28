# Cursor-prompt — Voortgang: Statistieken-advies + Favorieten herpositionering

> Uitvoeringsdocument voor Fase C uit de Voortgang-herstructurering. Bron van
> waarheid voor IA, wireframes, copy en acceptatiecriteria is
> [`docs/cursors/claude-opus-voortgang-statistieken-advies-2026-07.md`](claude-opus-voortgang-statistieken-advies-2026-07.md)
> ("het architectuurdocument"). Dit bestand herhaalt die inhoud niet — het
> wijst ernaar en zet de volgorde + house rules neer.

---

## Rol

Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context — lees vóór je begint

- `docs/cursors/claude-opus-voortgang-statistieken-advies-2026-07.md` — volledig:
  sectie B (informatiemodel), en per slice de bijbehorende sectie C/D/E, H (copy),
  I (meetplan) en J (bestanden + acceptatiecriteria)
- `CLAUDE.md` — projectregels, met name "Meet-standaarden" (elke nieuwe CTA
  krijgt een meetpunt in dezelfde wijziging) en "Git & deploy"
- Checkpoint-commit `ce11e3e` op branch `s0-s1-stappenplan-ontdichten` bevat de
  huidige staat: verdict-engine + Favorieten-koppeling + Slice 0 (databuis).
  Bouw hierop voort, niet op een oudere staat.

Startpunt-bestanden om te kennen (niet blind kopiëren, wel het patroon volgen):

- `src/components/dashboard/VoortgangHub.tsx` — alle Voortgang-schermen
- `src/components/dashboard/SupplementVerdictPanel.tsx` — bestaand verdict-paneel
- `src/lib/supplement-verdict-copy.ts` — `buildVerdictCards`, `buildVerdictSummary`
- `src/lib/nutrition-advice.ts` — `buildNutritionAdvice` (voeding-eerst ladder)
- `src/data/leefstijlcheck-evidence.ts` — evidence per intake-vraag
- `src/types/dashboard.ts`, `src/types/verdict.ts` — na Slice 0: `basedOn` op
  `StoredSupplementVerdict`, `nutrient` op `NutritionIntakeItem`

## Taak — vier slices, in deze volgorde

Werk de slices **na elkaar** af, niet parallel. Stop na elke slice voor review
(zie Verificatie). Ga pas door naar de volgende na akkoord.

### 1. Slice 3 — Favorieten herpositionering

Lost de huidige doublure op: `SupplementVerdictPanel` (alle oordelen) staat nu
gestapeld bóven `buildRecommendations` (aanrader-lijst) in `FavorietenView` —
zelfde informatie, twee keer, geen hiërarchie.

Architectuurdocument: **sectie D** (IA + wireframe + "wat verhuist"),
**sectie J → Slice 3** (bestanden + acceptatiecriteria).

### 2. Slice 1 — Statistieken advies-blok (gratis)

De kernfeature: waar-sta-je-snapshot, voeding-eerst ladder, verdict-samenvatting
(max 3), poortstaat als voeding nog niet is ingevuld. Vervangt de huidige
premium-only opening van het Statistieken-scherm.

Architectuurdocument: **sectie C** (wireframes 375px + desktop, gratis/premium-grens),
**sectie H** (copy-hiërarchie, verboden formuleringen), **sectie J → Slice 1**.

### 3. Slice 2 — Evidence-disclosure

Accordeon per zwak domein, gekoppeld via `basedOn.triggeredBy` aan
`LEEFSTIJLCHECK_EVIDENCE_BY_ID`. Vereist een nieuwe domein→vraag-map.

Architectuurdocument: **sectie G** (evidence-koppeling, inclusief de
prefix-afleiding-vs-expliciete-map afweging — kies expliciete map, zoals
daar onderbouwd), **sectie J → Slice 2**.

### 4. Slice 4 — Hub reis-strip

Reis-strip (check → nu → hermeting) + hubkaart voor "Inzichten" (lost een
navigatielek op: dat scherm bestaat al maar heeft geen ingang) + hubkaart-
ondertitel Statistieken herschrijven (nu belooft die "trends met Premium",
wat de nieuwe gratis inhoud onvindbaar maakt).

Architectuurdocument: **sectie E**, **sectie J → Slice 4**.

## Constraints

- Imports via `@/` (niet relatief)
- Nederlandse UI strings, Engelse variabelen/functies
- `intake-engine.ts` **niet aanraken** — geen enkele slice heeft dat nodig
- `.env.local` niet aanraken
- Verander niets aan `src/components/dashboard/beweging/` of
  `src/components/dashboard/kompas/KompasOndersteuningTile.tsx` — daar loopt
  ongerelateerd werk, nog ongecommit
- Claimtekst uitsluitend via `getUsableClaims()` / `nutritionSupplementGate()`
  — nooit met de hand geschreven (zie architectuurdocument sectie K)
- Redentekst uitsluitend via `REASON_TEXT` in `supplement-verdict-copy.ts`
- Nieuwe componenten in `src/components/dashboard/voortgang/` (nieuwe map),
  niet in `Dashboard.tsx` zelf — dat bestand mag geen regels winnen
- Elk nieuw client-event: registreer op de drie plekken uit CLAUDE.md
  (`lib/events.ts` + `lib/intake-events-client.ts` + allowlist in
  `app/api/intake/events/route.ts`) — zie architectuurdocument sectie I voor
  welke events hergebruikt worden en welke nieuw zijn
- Geen git commands, geen commit

## Acceptatiecriterium

Per slice: het acceptatiecriterium staat expliciet in sectie J van het
architectuurdocument, onder de kop van die slice. Aanvullend, voor elke slice:

- [ ] `npx tsc --noEmit` groen
- [ ] `npx vitest run` groen (bestaande + nieuwe tests)
- [ ] `npx eslint --max-warnings 0` groen
- [ ] Geen nieuwe `console.log` in `src/`
- [ ] 375px zonder horizontale scroll (test in browser devtools, niet alleen lezen)
- [ ] Geen letterlijke gezondheidsclaim buiten `getUsableClaims()`-output

## Verificatie — draai vóór je stopt, per slice

1. `npx tsc --noEmit`
2. `npx vitest run`
3. `npx eslint --max-warnings 0`
4. `grep -rn "console.log" src/`
5. Start `next dev` (als niet al actief) en bekijk het gewijzigde scherm op
   375px én desktop — niet alleen de wireframe naast de code leggen

Niet automatisch committen. Stop na elke slice zodat Dennis kan reviewen.

Voorgestelde commits (één per slice, pas na akkoord):

```
git add -A && git commit -m "feat(voortgang): favorieten herpositioneren — eigen keuze, aanrader, alle oordelen"
git add -A && git commit -m "feat(voortgang): statistieken advies-blok — voeding-eerst ladder + verdict-samenvatting"
git add -A && git commit -m "feat(voortgang): evidence-disclosure per domein in statistieken"
git add -A && git commit -m "feat(voortgang): hub reis-strip + inzichten-kaart"
```
