# Spinnenweb-integriteit + broken interne links — read-only (R2)

**Frequentie:** per sprint (na elke "Wave") — geschikt als cloud-Routine tegen main
**Type:** read-only audit — rapporteert, wijzigt niets
**Owner:** Dennis

---

## Rol

Je bent content-architect voor PerfectSupplement. Je controleert of het interne
linknetwerk ("spinnenweb") heel is: geen dode interne links, en elke pillar /
profiel / vergelijking / cluster-blog is verbonden volgens de regels. Je WIJZIGT
GEEN bestanden. Eén rapport; Dennis beslist.

## Bronnen — lees vóór je concludeert

- `docs/core/CONTENT_GAPS.md` — sectie **"Spinnenweb-integriteit checklist"** en de
  link-/profiel-matrices. Dit is de norm waartegen je toetst.
- `docs/core/CURRENT_SPRINT.md` — wat in de laatste Wave is opgeleverd.
- `docs/core/PERSONALIZATION_ENGINE.md` — hoe profielen ↔ pillars ↔ vergelijkingen
  samenhangen.
- `docs/PROJECT_STATE.md` — **auto-gegenereerd** (run eerst `npm run generate-state`):
  actuele lijst van supplements, pillars, profiles, blogs, kennisbank-termen.

## Methode

1. **Routekaart bouwen.** Verzamel alle geldige interne routes:
   - Top-level mappen in `src/app/` (bv. `/energie-na-40`, `/beste`, `/blog`,
     `/profiel`, `/kennisbank`, `/supplementen`, `/thema`, `/gids`).
   - Dynamische slugs uit data: `src/data/supplements/*`, `src/data/profiles/*`,
     `src/data/blog/*`, kennisbank-termen in `src/data/kennisbank.ts`.
2. **Alle interne links verzamelen.** Pak elke `href: "/..."` uit `src/data/**` en
   de relevante paginacomponenten.
3. **Resolven.** Elke link moet naar een bestaande route wijzen.

## Wat je rapporteert (read-only)

### A. Broken interne links
| Bestand:regel | Link | Probleem |
|---|---|---|

Let specifiek op verouderde cornerstone-links die naar de oude `/gids/*` wezen
terwijl de pillar verhuisd is (bv. `/gids/energie` → `/energie-na-40`,
`/gids/stress` → `/stress-verminderen-man`; zie CONTENT_GAPS Wave 1/3).

### B. Spinnenweb-gaten (tegen de CONTENT_GAPS-checklist)
| Knoop | Regel | Status |
|---|---|---|

Toets minimaal:
- Elke pillar linkt naar het bijbehorende profiel.
- Elke `/beste/*` vergelijking heeft een "past bij profiel X"-blok.
- Elke nieuwe cluster-blog linkt naar ≥ 2 gerelateerde pagina's.
- Elke profielpagina heeft pillar- + cluster/vergelijking-links volgens de matrix.
- Nieuwe pagina's uit de laatste Wave zijn opgenomen in het netwerk (niet weespagina).

## Wat je NIET doet
- Geen edits, geen commits, geen nieuwe links toevoegen.
- Bij twijfel of een route bestaat: "onbekend — check `src/app/<route>`", niet gokken.

## Checklist (in rapport)
- [ ] `npm run generate-state` gedraaid (PROJECT_STATE actueel)
- [ ] Alle interne `href` geresolved tegen echte routes
- [ ] Verouderde `/gids/*`-cornerstone-links gecheckt
- [ ] Spinnenweb-checklist uit CONTENT_GAPS afgelopen
- [ ] Weespagina's (0 inkomende interne links) gemeld

---

TOEGESTANE BESTANDEN (alleen lezen, niets wijzigen):
- `src/data/**`, `src/app/**`, `src/components/**`, `docs/**`

Bij een voorstel tot wijziging: STOP en meld in het rapport, wijzig niets.

Niet automatisch committen. Stop na het rapport zodat Dennis reviewt.
