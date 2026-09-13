# Vakantieweek — sterk 7-dagen codeerplan (jij + Claude · jij + Cursor)

**Datum:** 13 september 2026 · **Type:** codeerplan, twee sporen die elkaar versterken
**Umbrella:** [VAKANTIEWEEK_STRATEGIE_2026-09.md](VAKANTIEWEEK_STRATEGIE_2026-09.md) (het waarom).
Dit is hét codeerplan; de andere twee vakantie-docs blijven als achtergrond/promptbibliotheek.

**Richtsnoer:** al het codeerwerk hieronder dient één doel — **bezoekers → klikken → omzet** op wat er al
staat. Geen USDA, Kompas, nieuwe `/beste/*`- of blogpagina's, Stripe of multi-tenancy.

---

## Het versterkingsprincipe

> **Claude legt de rails. Cursor rijdt erop. Jij bent de piloot van allebei.**

| Claude bouwt (rails) | → versterkt → | Cursor doet (zichtbare laag) |
|---|---|---|
| Regressietest die afdwingt dat elke `/beste`-link getrackt wordt | → | CTA's plaatsen is dan gegarandeerd meetbaar |
| Snippet-contract-test (flag generieke/dubbele titels) | → | Copy schrijven met groen/rood signaal per pagina |
| Conversie-readout (klikken per pagina) | → | Vertelt Cursor wélke pagina als eerste beter moet |
| SEO-data-contract (H1-rolverdeling) | → | Cursor's copy blijft binnen de rolverdeling |

Netto: Claude maakt het **meetbaar en veilig**, Cursor maakt het **beter en zichtbaar**, en de meting zegt
elke dag waar Cursor daarna heen moet. Dat is de lus.

---

## Spoor A — Jij + Claude (de rails: meting, tests, contracten)

Claude Code kan de codebase verkennen, redeneren, tests schrijven en de volledige klaar-check draaien.
Geef Claude de kruislingse en oordeelstaken.

| # | Taak | Bestanden | Gated? |
|---|---|---|---|
| **A1** | **Meet-audit + regressietest** — bewijs klik → `affiliate_clicks` → GA4 op alle 7 `/beste`; test die tracking-params per pagina afdwingt; verifieer dat UTM's doorkomen in GA4 | `api/affiliate/click/route.ts`, `lib/affiliate-analytics.ts`, `lib/__tests__/…` | nee |
| **A2** | **Conversie-readout** — breid de bestaande admin-affiliate-analytics uit tot een blik per `/beste`-pagina: klikken + (plak-in SC-impressies) → CTR en klik-ratio. Eén scherm dat jij dagelijks checkt tijdens de push | `lib/affiliate-analytics.ts`, `app/api/admin/data/route.ts`, admin-component | nee |
| **A3** | **Snippet-contract-test** — vitest die generieke of dubbele `seoTitle`/H1 flag over `/beste/*` + `/supplementen/*` (vangt de kannibalisatie uit het besluit van 4 sep) | `data/supplements/*`, `data/supplement-guides/*`, `lib/__tests__/…` | nee |
| **A4** | **Magnesium H1-rolverdeling** op de rankende URL (commercieel op `/beste`, informationeel op gids) | `data/supplements/magnesium.ts`, `data/supplement-guides/magnesium.ts` | **ja — jij checkt SC** |
| **A5** | **omega-3 root-URL's 301** → `/supplementen/omega-3` | `next.config.ts`, `app/wat-is-omega-3/`, `app/waar-let-je-op-bij-omega-3/` | **ja — jij bevestigt 0 impr** |
| **A6** | **Review + eindpas** — alle Cursor-diffs nalopen, volledige klaar-check, optioneel dode scaffolding weg (`config/theme.ts`, `lib/org-context.ts`) | div. | nee |

### Ready prompt — A1 (plak in Claude Code)
```text
## Rol
Next.js/TS developer + meet-auditor voor PerfectSupplement.
## Context
docs/core/AFFILIATE_SYSTEM.md, CLAUDE.md (§Meet-standaarden). Bestanden:
src/app/api/affiliate/click/route.ts, src/lib/affiliate-analytics.ts,
src/lib/__tests__/affiliate-click-route.test.ts, src/components/supplements/, src/app/beste/[supplement]/page.tsx
## Taak
Audit-eerst, minimale diff. Bewijs per /beste/*-stof (tabel in je antwoord) dat elke uitgaande affiliate-link
de klik registreert met juiste pagina/categorie/sub-ID én dat het GA4-event vuurt; en dat UTM-params op de
landing doorkomen naar GA4. Dicht alleen echte gaten — verander de affiliate_clicks-INSERTVORM niet (test pint
hem). Voeg een vitest toe die per /beste/*-pagina de tracking-params afdwingt.
## Constraints
Imports via @/. Nooit aanraken: data/affiliate-links.ts, lib/scoring.ts, globals.css, deploy.sh, app/intake/,
.env.local. rel="nofollow sponsored"+target="_blank" intact; Arctic Blue sld= nooit vervangen.
## Acceptatie
Findings-tabel; alleen echte gaten gedicht; nieuwe vitest; geen console.log; tsc+vitest+eslint groen; gecommit (niet gepusht).
## Verificatie
grep -rn "console.log" src/  →  npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/  →  git add+commit. Nooit push.
```

### Ready prompt — A2 (plak in Claude Code)
```text
## Rol
Next.js/TS developer voor PerfectSupplement.
## Context
src/lib/affiliate-analytics.ts (leest affiliate_clicks per pagina/categorie), src/app/api/admin/data/route.ts,
de admin-shell onder src/app/admin/site. docs/core/ACCOUNT_DASHBOARD_SYSTEM.md.
## Taak
Bouw een compacte conversie-readout in de admin: per /beste/*-pagina de affiliate-klikken over een periode,
plus twee handmatige invulvelden (SC-impressies, gemiddelde positie) waaruit CTR en klik-ratio worden berekend.
Eén tabel, 7 rijen, mobiel leesbaar. Hergebruik de bestaande analytics-functies; verzin geen nieuwe tabel.
Geen PII. Meetpunt: bestaand admin-event hergebruiken.
## Constraints + Acceptatie + Verificatie
(zoals A1: @-imports, do-not-touch-lijst, klaar-check groen, committen niet pushen)
```

*(A3–A6-prompts: zelfde skelet; zeg tegen Claude welke taak en welke bestanden. A4/A5 pas ná je SC-check.)*

---

## Spoor B — Jij + Cursor (de zichtbare laag: copy, CTA, mobiel)

Snelle, lokale edits met directe browser-feedback — waar Cursor sterk in is en jij het live ziet.

| # | Taak | Bestanden | Reinforcement |
|---|---|---|---|
| **B1** | **Onderscheidende snippets voor de 5 resterende `/beste`** (magnesium, ashwagandha, creatine, zink, eiwitpoeder) in de stijl van omega-3 ("4 visoliën op mg EPA+DHA") — voordeel/onderscheid ín de title | `data/supplements/{stof}.ts` | gestuurd door A3-test |
| **B2** | **StickyMobileCta op alle 7 aansluiten + 375px-check** — primaire affiliate-CTA bereikbaar zonder scrollen; `ComparisonTable` geen horizontale overflow | `components/supplements/StickyMobileCta.tsx`, `ComparisonTable.tsx`, `beste/[supplement]/page.tsx` | bewaakt door A1-test |
| **B3** | **Blog-snippet "magnesium + medicijnen"** (70 impr) aanscherpen; aanhef beantwoordt de vraag in ≤2 zinnen | `data/blog/magnesium-in-combinatie-met-medicijnen.ts` | leest A2-readout |
| **B4** | **Datagedreven fix** — verbeter de pagina die (per A2 + jouw push) veel bezoek maar weinig klikken kreeg | volgt uit de data | dít is de lus |
| **B5** | **FAQ-item** waar een geseede vraag geen on-page antwoord heeft (vuurt bestaande FAQ-rich-result) | `components/supplements/FaqSection.tsx` + `data/supplements/{stof}.ts` | — |

### Ready prompt — B1 (plak in Cursor Composer)
```text
## Rol
SEO-copy + Next.js developer voor PerfectSupplement.
## Context
docs/research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md (rolverdeling), docs/core/SEO_RULES.md.
Voorbeeld dat al goed staat: src/data/supplements/omega-3.ts (seoTitle "Beste omega-3: 4 visoliën op mg EPA+DHA…").
Bestanden: src/data/supplements/{magnesium,ashwagandha,creatine,zink,eiwitpoeder}.ts
## Taak
Herschrijf seoTitle + seoDescription van deze 5 zodat elk een concreet onderscheidend element ín de title draagt
(waarop je vergelijkt, aantal producten, prijs per dag) — géén generieke "onafhankelijk vergeleken"-zin, en géén
"welke past bij jou" (die hoort niet op /beste). H1 op /beste begint met "Beste". Raak productdata/affiliate niet aan.
## Constraints
@-imports; NL UI, EN code; nooit aanraken: affiliate-links.ts, scoring.ts, globals.css, deploy.sh, intake/, .env.local.
## Acceptatie
5 onderscheidende snippets; A3-snippet-test groen; geen console.log; tsc+vitest+eslint groen; gecommit (niet gepusht).
## Verificatie
grep console.log → tsc+vitest+eslint → git add+commit. Nooit push.
```

### Ready prompt — B2 (plak in Cursor Composer)
```text
## Rol
Next.js/Tailwind front-end voor PerfectSupplement. Doelgroep = telefoon.
## Context
src/components/supplements/StickyMobileCta.tsx, ComparisonTable.tsx, src/app/beste/[supplement]/page.tsx.
## Taak
Zorg dat StickyMobileCta op alle 7 /beste-pagina's actief is en de primaire affiliate-CTA toont; op 375px
bereikbaar zonder scrollen; ComparisonTable geen horizontale overflow op 375px. Minimale ingreep, geen redesign.
## Constraints + Acceptatie + Verificatie
(zoals B1; rel="nofollow sponsored"+target="_blank" intact; documenteer hoe je 375px verifieerde; committen niet pushen)
```

---

## De 7 dagen — drie banen naast elkaar

> Jij = piloot (distributie + meet-beslissingen + deploy). De gated taken (A4/A5) wachten op jouw SC-check.

| Dag | Jij (distributie) | Spoor A — Claude | Spoor B — Cursor |
|---|---|---|---|
| **Ma** | Nulpunt (7-rijen SC), e-maillijst checken, kanaal kiezen, 15 vragen | **A1** meet-audit + test · start **A2** readout | **B1** snippets 5 stoffen |
| **Di** | Eerste 3–4 kanaalbijdragen; geef Claude de SC-uitslag magnesium | **A2** afmaken · **A4** magnesium H1 (na uitslag) | **B2** StickyMobileCta + 375px |
| **Wo** | Distributie-push (5–7 bijdragen); bevestig omega-3 0-impr | **A3** snippet-contract-test · **A5** omega-3 301 | **B3** blog-snippet medicijnen |
| **Do** | Lezen: welke post → sessie → klik? Verdubbel op wat werkt | (ondersteun B4) | **B4** datagedreven fix op de zwakste-converterende pagina |
| **Vr** | Laatste bijdragen + wekelijkse cadans; **deploy** | **A6** review + eindpas + klaar-check | **B5** FAQ-item (optioneel) |
| **Weekend** | Vrij (evt. 1 pag. retro) | — | — |

**Volgorde die het enige raakvlak oplost:** A1 (dag ma) schrijft de guard-test vóór B2 (dag di) de componenten
raakt — de test bewaakt Cursor's wijziging. En A3 (wo) staat vóór B1's afronding als contract; laat B1 desnoods
di klaarzetten en wo groen maken tegen A3.

---

## Minimum / ideaal / stretch

- **Minimum:** A1 + A2 staan → funnel afleesbaar, readout live. B1 snippets geshipt. Dat alleen maakt de week meetbaar.
- **Ideaal:** + A4 (magnesium H1) + B2 (mobiele CTA op alle 7) + B3, gedeployd.
- **Stretch:** + A3-contract, A5 (301), en B4 (datagedreven fix uit dag 4) — de volledige meet→verbeter-lus één keer rondgedraaid.

---

## Vaste regels (beide sporen)

- Na groene klaar-check (`console.log`-grep + `tsc` + `vitest` + `eslint --max-warnings 0`): committen, **nooit pushen**.
- Eén commit per afgeronde taak; niets live tot jij `deploy.sh` draait.
- Nooit aanraken: `data/affiliate-links.ts`, `lib/scoring.ts`, `globals.css`, `deploy.sh`, `app/intake/`, `.env.local`.
- Bestand-eigendom per de tabellen hierboven — Claude en Cursor raken elkaars bestanden niet.
- Het scorebord blijft: **externe bezoekers + affiliate-klikken.** De code dient dat, niet andersom.
