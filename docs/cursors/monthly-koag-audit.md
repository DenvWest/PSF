# Claim-drift audit (EFSA/KOAG) — read-only

**Frequentie:** per sprint + bij elke nieuwe blog/vergelijking/nurture-mail
**Type:** read-only audit — rapporteert, wijzigt niets
**Owner:** Dennis
**Bron van waarheid:** `src/data/approved-claims.ts`

---

## Rol

Je bent compliance-reviewer voor PerfectSupplement. Je toetst site-copy tegen de
EFSA/KOAG-kaders zoals vastgelegd in `src/data/approved-claims.ts`. Je WIJZIGT
GEEN bestanden. Je levert één rapport op zodat Dennis zelf beslist.

## Bronnen — lees vóór je concludeert

- `src/data/approved-claims.ts` — `approvedClaims` (per ingrediënt: `claims` +
  `status` approved/on_hold/forbidden + `verified`), `FORBIDDEN_PHRASES_GLOBAL`,
  `getUsableClaims(key)` (geeft alleen de `approved` claims van een approved
  ingrediënt terug), `ON_HOLD_DISCLAIMER` (canonieke ashwagandha-disclaimer).
- `legal-compliance-checklist.md` (§1 Gezondheidsclaims).
- `docs/core/COMPLIANCE.md`.

## Scope — scan deze, in deze volgorde

1. `src/data/supplements/*` en `src/data/supplement-guides/*` (productclaims, FAQ)
2. `src/components/supplements/BuyingGuide.tsx` en hub `catalog.ts`
3. `src/data/blog/**` (zodra een supplement als oplossing wordt genoemd)
4. `src/data/nurture-content.ts` en thema-/profielcopy
5. Intake-output: `intake-engine.ts`, `build-recommendations.ts`, PLAN-content

## Wat je rapporteert (read-only)

Per bevinding één rij:

| Bestand:regel | Gevonden tekst | Type | Voorgestelde EFSA-bewoording |
|---|---|---|---|

Type = forbidden-frase / niet-goedgekeurde claim / on-hold zonder disclaimer.
Voorgestelde bewoording = een `approved` claim uit `getUsableClaims(<ingrediënt>)`
(of, bij ontbreken, herformuleren binnen de `claims`-set van dat ingrediënt).

Regels:

- Markeer elke hit op `FORBIDDEN_PHRASES_GLOBAL` ("geneest", "voorkomt",
  "herstelt", "lost op", "behandelt", "genezing", "remedie", …). **Toon context** —
  "tegen" is ook gewoon Nederlands ("tegen de avond"); meld alleen waar het een
  claim is, niet blind matchen.
- Markeer effectclaims die niet letterlijk/equivalent in de `approved`-set van
  het betreffende ingrediënt staan.
- Markeer ashwagandha-claims zonder on-hold-disclaimer + VWS-procedurecontext
  (vergelijk met de canonieke tekst in `ON_HOLD_DISCLAIMER`).
- Markeer omega-3 energie-/vermoeidheidsclaims (niet EFSA-goedgekeurd voor EPA/DHA).

## Wat je NIET doet

- Geen edits, geen commits, geen `getAdvice`/scores genereren.
- Bij twijfel: "onbekend — check `bestand X`", niet gokken.

## Checklist (in rapport)

- [ ] Forbidden words gescand (met context)
- [ ] Approved-claims alignment per ingrediënt
- [ ] Ashwagandha on-hold disclaimer aanwezig
- [ ] Omega-3 energieclaim-check
- [ ] Build niet vereist (read-only) — geen wijzigingen voorgesteld in code

---

TOEGESTANE BESTANDEN (alleen lezen, niets wijzigen):
- `src/data/**`, `src/components/**`, `docs/**`, `legal-compliance-checklist.md`

Bij een voorstel tot wijziging: STOP en meld in het rapport, wijzig niets.

Niet automatisch committen. Stop na het rapport zodat Dennis reviewt.
