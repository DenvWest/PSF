# Vakantieweek — wat Cursor (Composer) kan doen

**Datum:** 13 september 2026 · **Hoort bij:** [VAKANTIEWEEK_STRATEGIE_2026-09.md](VAKANTIEWEEK_STRATEGIE_2026-09.md) (los te gebruiken)
**Idee:** de codeerbare conversie- en meet-fixes delegeren aan Cursor, zodat jij vrij bent voor het
distributiewerk. Elke prompt volgt je eigen skelet uit
[CURSOR_PROMPT_TEMPLATE.md](../core/CURSOR_PROMPT_TEMPLATE.md).

---

## De rolverdeling (lees dit eerst)

`[FEIT]` **Cursor kan Search Console, GA4 en Supabase niet zien.** Daar zit precies de grens.

| Cursor doet (code) | Jij doet (oordeel + distributie) |
|---|---|
| Snippet/H1/CTA in bestanden wijzigen | Aflezen wélke URL rankt en of de CTR stijgt |
| Meet-instrumentatie auditen + tests toevoegen | Klikken op je eigen link en in Supabase checken dat de rij landt |
| Snippet aanscherpen op een bekende zoekvraag | Beslissen welke 15 vragen je doelgroep echt stelt |
| Dode code opruimen, klaar-check draaien, committen | Het ene kanaal kiezen en er echt behulpzaam zijn |

**Discipline (zelfde als het weekplan):** het scorebord is externe bezoekers + affiliate-klikken, niet
commits. Zet niet alle zes prompts in de wachtrij om je "productief" te voelen — **prompt 1 en 2 zijn de
echte waarde.** 3–4 zijn mooi meegenomen. 5–6 zijn optioneel.

**Wat je Cursor deze week NIET laat doen:** USDA/`observed`, Kompas/voeding/dashboard, nieuwe `/beste/*`- of
blogpagina's in bulk, Stripe, multi-tenancy. Dat is de val uit het weekplan — ook via Cursor blijft het de val.

**Elke prompt commit na een groene klaar-check, maar pusht nooit** (jouw vaste regel). Niets gaat live tot
jij `deploy.sh` draait — dat is meteen je natuurlijke review-poort voor de gated prompts.

---

## Prompt 1 — Meet-audit: klik → affiliate_clicks → GA4 (must-have) ⭐

> Zonder afleesbare funnel levert de kanaaltest geen getal op. Dit is de belangrijkste Cursor-taak.

```text
## Rol
Je bent Next.js/TypeScript developer + meet-auditor voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/core/AFFILIATE_SYSTEM.md
- CLAUDE.md (§Meet-standaarden, §Affiliate links)
- Bestanden:
  - src/app/api/affiliate/click/route.ts   (insert in affiliate_clicks — vorm is vastgepind)
  - src/lib/__tests__/affiliate-click-route.test.ts  (pint de insert-vorm)
  - src/lib/affiliate-analytics.ts          (leest affiliate_clicks per pagina/categorie)
  - src/components/supplements/             (de /beste/*-productkaarten + CTA's)
  - src/app/beste/[supplement]/page.tsx

## Taak
AUDIT-EERST, minimale diff. Doel: bewijs dat elke uitgaande affiliate-link op elke /beste/*-pagina
de klik registreert met de juiste `pagina`, `categorie` en sub-ID, én dat het bijbehorende GA4-event vuurt.
1. Traceer het pad van een productkaart-klik op /beste/* tot de insert in affiliate_clicks. Schrijf in je
   antwoord een korte tabel: per /beste/*-stof of de klik-capture + het GA4-event aanwezig zijn.
2. Repareer ALLEEN echte gaten (een link die de capture niet raakt, een ontbrekend/verkeerd pagina- of
   categorie-veld, een ontbrekend GA4-event). Verander NIET de vorm/velden van de affiliate_clicks-insert
   zelf — die is bewust vastgepind (zie de test).
3. Voeg een vitest toe die per /beste/*-stof afdwingt dat de uitgaande links de juiste tracking-params
   dragen, zodat een toekomstige regressie rood wordt.

## Constraints
- Imports via `@/`; Nederlandse UI, Engelse code.
- Verander NIETS aan: src/data/affiliate-links.ts, src/lib/scoring.ts, globals.css, deploy.sh,
  src/app/intake/, .env.local.
- Wijzig de affiliate_clicks-insertvorm niet; laat rel="nofollow sponsored" + target="_blank" intact;
  Arctic Blue sld= nooit vervangen.
- Bij twijfel of iets een "gat" is: rapporteer het, wijzig het niet.

## Acceptatiecriterium
- [ ] Findings-tabel per /beste/*-stof (capture + GA4 aan/uit)
- [ ] Alleen echte gaten gedicht, insertvorm ongewijzigd
- [ ] Nieuwe vitest die de tracking-params per pagina afdwingt
- [ ] Geen console.log; tsc/vitest/eslint groen; gecommit (niet gepusht)

## Verificatie
1. grep -rn "console.log" src/
2. npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/
3. Groen → git add (alleen deze taak) + git commit. Nooit git push.
```

**Wat jij daarna doet:** klik zelf op een `/beste/*`-affiliate-link en bevestig in Supabase dat de rij
daadwerkelijk landt (dat kan Cursor niet).

---

## Prompt 2 — Magnesium H1-botsing oplossen (must-have, jij houdt de meet-gate) ⭐

> `[FEIT]` Live botsing: `/beste/magnesium` h1 = "Welke magnesium past bij jou?" (`src/data/supplements/magnesium.ts:15`)
> vs. `/supplementen/magnesium` h1 = "Magnesium: welke vorm past bij jou?" (`src/data/supplement-guides/magnesium.ts:11`).
> Besluit-rolverdeling: /beste = commercieel, /supplementen = informationeel
> ([BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md](../research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md)).

**Jij eerst (5 min, Cursor kan dit niet):** kijk in Search Console welke URL rankt op "beste magnesium" /
"magnesium vergelijken", en noteer de huidige CTR als baseline. Rankt `/beste/magnesium` → gebruik de prompt
zoals hij staat. Rankt `/supplementen/magnesium` op de commerciële zoekopdracht → zeg dat tegen Cursor, dan
draait hij de H1-wissel om. **Deploy pas na deze keuze** (Cursor commit alleen).

```text
## Rol
Je bent Next.js/TypeScript + SEO-developer voor PerfectSupplement.

## Context
Lees vóór je begint:
- docs/research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md (de rolverdeling)
- docs/core/SEO_RULES.md
- Bestanden:
  - src/data/supplements/magnesium.ts        (/beste/magnesium — nu h1 "Welke magnesium past bij jou?")
  - src/data/supplement-guides/magnesium.ts  (/supplementen/magnesium — informationeel, laten staan)

## Taak
Haal de H1-botsing weg volgens de rolverdeling. Standaard (rankt /beste/magnesium):
- Zet in src/data/supplements/magnesium.ts de h1 naar een commerciële vorm die begint met "Beste",
  in lijn met de bestaande commerciële seoTitle — bijv. "Beste magnesium supplement: vergeleken op vorm,
  dosering en prijs per dag". Eén onderscheidend element in de zin zelf (niet "welke past bij jou").
- Laat /supplementen/magnesium ongemoeid (die blijft informationeel: "Magnesium: welke vorm past bij jou?").
- Raak de seoTitle/seoDescription alleen aan als de h1-wijziging ze inconsistent maakt.
Wijzig NIETS aan de productdata, affiliate-links of scoring.

## Constraints
- Imports via `@/`; Nederlandse UI, Engelse code.
- Eén h1 per pagina; do-not-touch: affiliate-links.ts, scoring.ts, globals.css, deploy.sh, intake/, .env.local.
- Geen nieuwe /beste/*- of blogpagina's.

## Acceptatiecriterium
- [ ] /beste/magnesium h1 begint met "Beste" en botst niet meer met de gids-H1
- [ ] /supplementen/magnesium ongewijzigd
- [ ] Geen console.log; tsc/vitest/eslint groen; gecommit (niet gepusht)

## Verificatie
1. grep -rn "console.log" src/
2. npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/
3. Groen → git add + git commit -m "fix(seo): magnesium /beste H1 commercieel, botsing met gids weg". Nooit git push.
```

**Na 2–3 weken:** CTR vóór/na terugkijken in Search Console op dezelfde impressie-orde.

---

## Prompt 3 — Affiliate-CTA boven de vouw op mobiel (375px) (should-have)

```text
## Rol
Je bent Next.js/Tailwind front-end developer voor PerfectSupplement. Doelgroep gebruikt vooral telefoon.

## Context
- Bestanden: src/components/supplements/ (BuyingGuide + productkaarten), src/app/beste/[supplement]/page.tsx
- docs/core/DESIGN_TOKENS.md

## Taak
Zorg dat op /beste/vitamine-d en /beste/magnesium op 375px breedte de eerste affiliate-CTA (of de
top-productkaart met knop) zichtbaar is zonder scrollen, óf dat er direct onder de intro een duidelijke
"Bekijk de nr. 1 →"-verwijzing naar de vergelijkingstabel staat. Minimale layout-ingreep; geen redesign.
De vergelijkingstabel moet snel en zonder horizontale overflow renderen op 375px.

## Constraints
- Imports via `@/`; geen inline styles; Tailwind in JSX; geen aparte CSS.
- do-not-touch: affiliate-links.ts, scoring.ts, globals.css, deploy.sh, intake/, .env.local.
- rel="nofollow sponsored" + target="_blank" op affiliate-links intact.

## Acceptatiecriterium
- [ ] Eerste CTA/verwijzing zichtbaar boven de vouw op 375px (documenteer hoe je het verifieerde)
- [ ] Geen horizontale overflow op 375px
- [ ] Geen console.log; tsc/vitest/eslint groen; gecommit (niet gepusht)

## Verificatie
1. grep -rn "console.log" src/
2. npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/
3. Groen → git add + git commit. Nooit git push.
```

**Wat jij daarna doet:** open beide pagina's op je telefoon en controleer het echt.

---

## Prompt 4 — Snippet aanscherpen op "magnesium in combinatie met medicijnen" (should-have)

> `[FEIT]` Die zoekopdracht haalt nu al ~70 impressies zonder dekkend antwoord; het artikel bestáát al.

```text
## Rol
Je bent SEO-copy + Next.js developer voor PerfectSupplement.

## Context
- Bestand: src/data/blog/magnesium-in-combinatie-met-medicijnen.ts (bestaand artikel; metaDescription ~r80)
- docs/core/SEO_RULES.md · CLAUDE.md (geen affiliate links in blogposts)

## Taak
Scherp de title/metaDescription van dit bestaande artikel aan zodat het de zoekvraag "magnesium in
combinatie met medicijnen" direct pakt (concreet, onderscheidend, geen generieke "wat is magnesium"-zin).
Controleer of de openingsalinea de vraag binnen de eerste twee zinnen beantwoordt; zo niet, herschrijf
alleen die aanhef. Interne link naar /beste/magnesium of /supplementen/magnesium moet aanwezig zijn
(geen affiliate-link in de blogpost). Verander de inhoudelijke body verder niet.

## Constraints
- Imports via `@/`; Nederlandse UI, Engelse code; geen affiliate-links in blogcontent.
- do-not-touch: affiliate-links.ts, scoring.ts, globals.css, deploy.sh, intake/, .env.local.

## Acceptatiecriterium
- [ ] title + metaDescription gericht op "magnesium in combinatie met medicijnen"
- [ ] Aanhef beantwoordt de vraag in ≤2 zinnen; interne link aanwezig
- [ ] Geen console.log; tsc/vitest/eslint groen; gecommit (niet gepusht)

## Verificatie
1. grep -rn "console.log" src/
2. npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/
3. Groen → git add + git commit. Nooit git push.
```

---

## Prompt 5 — (optioneel, gated) omega-3 root-URL's 301'en

> `[FEIT]` Alleen omega-3 heeft losse root-URL's (`/wat-is-omega-3`, `/waar-let-je-op-bij-omega-3`) die met
> `/supplementen/omega-3` samenvallen (BESLUIT_BESTE_VS §Bevinding 3). **Jij eerst:** bevestig in Search
> Console dat die twee géén eigen impressies hebben. Pas dán deze prompt.

```text
## Rol
Je bent Next.js developer voor PerfectSupplement.

## Context
- Bestanden: next.config.ts (bestaande redirects), src/app/wat-is-omega-3/, src/app/waar-let-je-op-bij-omega-3/
- docs/core/SEO_RULES.md

## Taak
Voeg permanente 301-redirects toe van /wat-is-omega-3 en /waar-let-je-op-bij-omega-3 naar
/supplementen/omega-3 in next.config.ts, in het bestaande redirect-patroon. Verwijder de oude route-mappen
pas als de redirect staat en tsc groen is. Geen andere routes aanraken.

## Constraints
- do-not-touch: affiliate-links.ts, scoring.ts, globals.css, deploy.sh, intake/, .env.local.
- Alleen deze twee URL's; geen andere redirect-wijzigingen.

## Acceptatiecriterium
- [ ] Beide oude URL's 301 → /supplementen/omega-3
- [ ] Geen dode imports/links naar de verwijderde routes
- [ ] tsc/vitest/eslint groen; gecommit (niet gepusht)

## Verificatie
1. grep -rn "console.log" src/
2. npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/
3. Groen → git add + git commit. Nooit git push.
```

---

## Prompt 6 — (optioneel, laag) dode scaffolding verwijderen

> Eerlijk gelabeld: dit is géén distributiewerk (het is stap 4 uit het verdict), maar het is veilig en
> verkleint het oppervlak. Alleen als je Cursor iets risicoloos wilt laten doen. `[FEIT]` Het verdict
> verifieerde 0 niet-test-importeurs voor `src/config/theme.ts` en `src/lib/org-context.ts`.

```text
## Rol
Je bent Next.js developer + opruimer voor PerfectSupplement.

## Context
- docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md (§"Wat ik zou schrappen", bak 4)
- Bestanden (verifieer eerst 0 niet-test-importeurs met een grep): src/config/theme.ts, src/lib/org-context.ts

## Taak
Verwijder alleen bestanden waarvan je met een grep bevestigt dat ze 0 niet-test-importeurs hebben, te
beginnen met src/config/theme.ts en src/lib/org-context.ts. Verwijder meelopende dode tests. Raak
src/lib/dashboard-dev-data.ts NIET aan (staat in het productiepad — zie het verdict). Bij de minste twijfel:
laat staan en rapporteer.

## Constraints
- Verwijder niets met een levende importeur; do-not-touch: affiliate-links.ts, scoring.ts, globals.css,
  deploy.sh, intake/, .env.local, dashboard-dev-data.ts.

## Acceptatiecriterium
- [ ] Alleen bewezen-dode bestanden weg; grep-bewijs in je antwoord
- [ ] tsc/vitest/eslint groen; gecommit (niet gepusht)

## Verificatie
1. grep -rn "console.log" src/
2. npx tsc --noEmit && npx vitest run && npx eslint --max-warnings 0 src/
3. Groen → git add + git commit. Nooit git push.
```

---

## Volgorde en tijd

| # | Prompt | Waarde | Cursor of gated |
|---|---|---|---|
| 1 | Meet-audit affiliate_clicks + GA4 | ⭐ must | Cursor volledig |
| 2 | Magnesium H1-botsing | ⭐ must | Gated: jij checkt SC eerst |
| 3 | CTA boven de vouw 375px | should | Cursor, jij verifieert op telefoon |
| 4 | Snippet "magnesium + medicijnen" | should | Cursor volledig |
| 5 | omega-3 root-URL's 301 | optioneel | Gated: jij checkt 0 impressies |
| 6 | Dode scaffolding weg | optioneel/laag | Cursor, veilig |

**Realistisch voor een vakantieweek:** laat Cursor prompt 1 draaien terwijl jij dag 1 je nulpunt meet;
prompt 2 zodra je de SC-check hebt; 3–4 als er tijd/zin is. 5–6 alleen als je Cursor bezig wilt houden —
niet omdat het de naald beweegt.
