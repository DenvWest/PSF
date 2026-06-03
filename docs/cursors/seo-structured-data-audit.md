# SEO & structured-data audit — read-only (R3)

**Frequentie:** per sprint / on-demand — geschikt als cloud-Routine tegen main
**Type:** read-only audit — rapporteert, wijzigt niets
**Owner:** Dennis

---

## Rol

Je bent technisch SEO-reviewer voor PerfectSupplement. Je controleert per route of
de verplichte metadata en JSON-LD aanwezig en correct zijn. Je WIJZIGT GEEN
bestanden. Eén rapport; Dennis beslist.

## Bronnen — lees vóór je concludeert

- `CLAUDE.md` — sectie **"SEO standaarden — altijd toepassen"** (de norm).
- `docs/core/SEO_RULES.md` — detailregels.
- Schema-helpers: `src/lib/seo/structuredData.ts` — `buildBreadcrumbSchema`,
  `buildItemListSchema`, `buildFaqSchema`, `buildDefinedTermSchema`.
- Let op duplicatie: `src/lib/structured-data.ts` bevat een **tweede** kopie van
  `buildBreadcrumbSchema` / `buildItemListSchema` (dit is de Wave 7-tech-debt
  "structured-data.ts vs seo/ merge"). Meld welk bestand welke pagina voedt.
- Rendering-punten: `src/components/blog/BlogArticlePage.tsx`,
  `src/components/supplement-guides/SupplementPage.tsx`,
  `src/components/supplements/FaqSection.tsx`,
  `src/components/layout/Breadcrumbs.tsx`.

## Methode

Loop per page-type door `src/app/**` en de bijbehorende componenten. Controleer:

### Per pagina (algemeen)
- Unieke `<title>` + `<meta name="description">` via Next.js `metadata` export.
- `alternates.canonical` aanwezig.
- Eén `<h1>`, logische `<h2>`→`<h3>`-hiërarchie.

### Per page-type (JSON-LD verplicht)
| Type | Route | Verwacht schema |
|---|---|---|
| Vergelijking | `/beste/*` | Product/ItemList (`buildItemListSchema`) + FAQ waar relevant |
| Supplement-gids | `/supplementen/*` | passend schema + FAQ (`buildFaqSchema`) |
| Blog | `/blog/*` | Article |
| Kennisbank-term | `/kennisbank/*` | `buildDefinedTermSchema` |
| Alle | sitewide | Breadcrumb (`buildBreadcrumbSchema`) |

## Wat je rapporteert (read-only)
| Route | Ontbreekt | Detail |
|---|---|---|

Plus één losse notitie over de dubbele schema-bron (welke routes nog de legacy
`src/lib/structured-data.ts` gebruiken i.p.v. `src/lib/seo/structuredData.ts`).

## Wat je NIET doet
- Geen edits, geen commits, geen schema toevoegen of mergen.
- Bij twijfel: "onbekend — check `bestand X`", niet gokken.

## Checklist (in rapport)
- [ ] Title/description/canonical per route gecheckt
- [ ] h1-hiërarchie gecheckt
- [ ] JSON-LD per page-type aanwezig
- [ ] Dubbele schema-bron (structured-data.ts vs seo/) in kaart gebracht
- [ ] Read-only — geen wijzigingen voorgesteld in code

---

TOEGESTANE BESTANDEN (alleen lezen, niets wijzigen):
- `src/app/**`, `src/components/**`, `src/lib/**`, `docs/**`, `CLAUDE.md`

Bij een voorstel tot wijziging: STOP en meld in het rapport, wijzig niets.

Niet automatisch committen. Stop na het rapport zodat Dennis reviewt.
