# Overdracht — productplatform: stand per 30 september 2026 en de volgende stap (hub uit de database)

**Datum:** 30 september 2026
**Status:** §F en §G gebouwd en gemerged, behalve PR #68 (wacht op akkoord). Volgende stap nog niet gestart, nog geen plan goedgekeurd.
**Besluiten en afwegingen:** `BESLUIT_PRODUCTPLATFORM_ADMIN_2026-09.md` (lees dat eerst)
**Bron van de opdracht:** `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §F, §G, §J

---

## 1. Wat er staat

| PR | Wat |
|----|-----|
| #58 | §G: sectie **Omzet** op `/admin/partners/[slug]` (dekking, handmatige conversie, goedkeuren/afkeuren, grootboek, signalen `commission_mismatch` en `conversions_unreviewed`) |
| #61 | `/admin/producten` (lijst) + productdossier + **publiceerpoort** (6 criteria, server-side) |
| #62 | Dossier bewerkbaar: werkzame stoffen, afbeeldingen (bron/licentie), prijzen, bronnen |
| #63 | `/admin/merken`, `/admin/categorieen` |
| #64 | Nieuw product aanmaken, stoffen/claims/afbeeldingen/aanbiedingen/certificeringen toevoegen |
| #65 | `sup_products.score_inputs` (migratie `20260930143532`) + formulier + backfill-route |
| #66 | `/admin/retailers`; `OPENSTAAND.md` opgeschoond (baseline `20260930143532`) |
| #67 | `/admin/import` (CSV, controle vooraf, alles als concept) |
| **#68 (open)** | Zachte waarschuwing bij dunne scoredekking (< 75 %) + het besluitdocument + deze overdracht |

Migraties: alles gedraaid, `OPENSTAAND.md` zegt "niets openstaand".

## 2. Testdata die nog in de database staat (opruimen)

Uit de handmatige tests van Dennis, in de Supabase SQL Editor:

```sql
-- Testconversies bij VitalNutrition (§G)
delete from public.pd_ledger_entries
 where conversion_id in (select id from public.pd_conversions
   where ingest_method = 'manual'
     and partner_id = (select id from public.pd_partners where slug = 'vitalnutrition'));
delete from public.pd_conversions
 where ingest_method = 'manual'
   and partner_id = (select id from public.pd_partners where slug = 'vitalnutrition');

-- Testproduct (onderdelen gaan mee via cascade); controleer eerst of het niet gepubliceerd is
select slug, status from public.sup_products where slug = 'vital-nutrition-whey-vital-test';
delete from public.sup_products where slug = 'vital-nutrition-whey-vital-test';
```

Controleer ook `select slug, name from public.sup_brands order by created_at desc limit 5;` op een testmerk uit de Merken-test.

## 3. Volgende stap: hub, productpagina's en sitemap uit de database

**Probleem.** Een in de admin gemaakt product staat op `/beste/<categorie>` (DB-loader) maar **niet** op de hub `/supplementen`, niet als `/product/<slug>` en niet in de sitemap. Die drie lezen nog uit statische bestanden.

**Raakpunten (gecontroleerd op 30 sep):**
- `src/lib/supplement-hub/product-catalog.ts` bouwt `HubProduct[]` **synchroon** uit `ComparisonPageData` + `PRODUCT_SCORE_INPUTS` (`getHubProducts()`, `getHubProductBySlug()`, `getHubProductSlugs()`, `getCategoryPeers()`).
- Gebruikers: `src/app/supplementen/page.tsx` (`force-dynamic`), `src/app/product/[slug]/page.tsx` (`generateStaticParams`, dus statisch), `src/app/sitemap.ts`, `ProductCatalog`, `ProductCatalogCard`, `ProductDetail`.
- Er bestaat al een patroon voor DB met statische terugval: `src/lib/supplement-catalog-db/page-products.ts` (`loadProductsForPage`, degradeert nooit tot een crash).

**Voorkennis die het plan bepaalt:**
1. `HubProduct` bevat velden die niet in de database zitten: `prijsPerEtiketdagCent` en `prijsGecontroleerdOp` (bewust niet in `score_inputs`, want de score is prijsvrij), `guideHref`, thema's, `EVIDENCE_DOSE` en de kostenberekening. Prijs per dag moet uit `sup_offers` + verpakkingsgegevens komen.
2. **Verpakking en portie zijn leeg in de database.** In het dossier staat bij Etiket "Verpakking —" en "Portie —" (`container_size`, `servings_per_container`, `serving_size` zijn niet gevuld door de backfill). Zonder die velden is prijs per dag niet uit de database te berekenen. Dit is een voorwaarde, geen detail.
3. `product-catalog.test.ts` faalt nu als een product in `PRODUCT_SCORE_INPUTS` ontbreekt of een `formKey` onbekend is; dat moet mee veranderen.
4. `generateStaticParams` op `/product/[slug]` vraagt om een eigen keuze: statisch met `revalidatePath` na publiceren (admin-acties doen dat al voor `/beste/[supplement]`), of dynamisch.

**Voorgestelde volgorde (nog niet besloten; leg eerst voor aan Dennis):**
1. **Voorwaarde:** verpakkingsgegevens en portie invoerbaar maken in het dossier (Etiket) en de 25 bestaande producten vullen (backfill uit de statische data of handmatig). Prijs per dag berekenen uit aanbieding + verpakking.
2. **Pariteit bewijzen vóór omschakelen:** een DB-loader `loadHubProducts()` die dezelfde `HubProduct[]` teruggeeft, met een test/script dat statisch en DB vergelijkt (zoals eerder bij `/beste/magnesium`: 336 regels, 0 diff). Nog niets live omzetten.
3. **Terugval-patroon** zoals `page-products.ts`: DB eerst, bij fout of lege catalogus de statische data. Eerst achter een vlag of per categorie (zoals `DB_BACKED_CATEGORIES`).
4. Eerst `/supplementen` (al `force-dynamic`, dus laagste risico), daarna `/product/[slug]` en de sitemap.
5. Pas als alles minstens één deploy stabiel draait: de statische bronnen (`score-inputs.ts`, delen van `ComparisonPageData`) uitfaseren.

**Risico's:** live SEO-pagina's (sitemap, canonical, JSON-LD), affiliate-links moeten intact blijven (`rel="nofollow sponsored"`, Arctic Blue niet door Daisycon vervangen), geen medische claims (`approved-claims.ts`), cache/revalidatie na publiceren. Mobiel testen op 375px.

## 4. Openstaande beslissingen voor Dennis

- **Akkoord #68 mergen.**
- Akkoord op het plan hierboven (of een andere volgorde) vóór er code komt.
- Wat met de "dpa"-vraag: bedoelde Dennis de DPIA of iets anders in de privacydocumenten? In het besluitdoc staat dat productbeheer geen persoonsgegevens en geen nieuwe verwerker heeft; bevestiging of aanvulling is aan Dennis/de jurist.
- Score-onderdelen: Dennis overweegt ze aan te passen. De dekkingsdrempel is relatief gemaakt zodat dat niets breekt; bij wijziging van onderdelen ook `PS_SCORE_MODEL_VERSION` en `sup_score_models` bijwerken.

## 5. Zo begin je een verse sessie

1. `cd ~/psf` en `git fetch origin`. De hoofdmap staat op `kennisbank-beelden-context` (met `origin/main` erin gemerged op 30 sep). Nooit vanaf die branch werken aan productplatform: altijd `git worktree add -b feat/<naam> .claude/worktrees/<naam> origin/main` en `ln -s ~/psf/node_modules` erin.
2. Lees in deze volgorde: dit document, `BESLUIT_PRODUCTPLATFORM_ADMIN_2026-09.md`, `ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md` §F/§J, en `CLAUDE.md` (regels over `docs/plan/`, migraties, meetpunten, deploy).
3. Controleer of #68 gemerged is: `gh pr view 68 --json state`.
4. Dev-server voor handmatig testen: draai `npm run dev -- -p 3001` **vanuit de worktree** en controleer met `ls -l /proc/$(ss -ltnp | grep ':3001' | sed -E 's/.*pid=([0-9]+).*/\1/')/cwd` dat de juiste map draait. Stop een oude server met `kill <pid>`, nooit `pkill -f` (dat raakt de eigen shell). Poort 3000 is Dennis' eigen server.
5. Werkwijze per plak: worktree, bouwen, `grep console.log` + `tsc` + `vitest` + `eslint --max-warnings 0` (+ `npm run check:migraties`), commit, push, PR, dev-server op 3001 voor Dennis, na zijn akkoord en groene CI `gh pr merge <n> --squash`. Deployen (`bash deploy.sh`) doet alleen Dennis.
6. Een migratie? Blok in `supabase/migrations/OPENSTAAND.md` in dezelfde commit, met "Blokkeert deploy".
7. Beslissingen over architectuur of scope leg je vast in `docs/plan/` (datum, status, wat afgewezen en waarom).

## 6. Bekende valkuilen uit deze sessie

- Poort 3001 kan nog een oude server van een vorige worktree draaien: dan zie je 404's op nieuwe pagina's. Altijd de `cwd` controleren.
- `InlineField` is gedeeld voor partner, contact, product, merk, categorie en retailer; nieuwe entiteiten krijgen een case in `saveField`.
- URL-validatie loopt via `validateOptionalUrl` (weigert `javascript:1` zonder schema).
- De veiligheidscontrole van de shell kan tijdelijk uitvallen ("no verdict"); dan even wachten en dezelfde opdracht opnieuw proberen.
