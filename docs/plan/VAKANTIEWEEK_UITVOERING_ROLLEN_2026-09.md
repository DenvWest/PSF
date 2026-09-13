# Vakantieweek — wie doet wat (Dennis · Claude · Cursor), 7 dagen

**Datum:** 13 september 2026 · **Type:** uitvoeringsmap / rolverdeling
**Doel:** één plek die zegt wie welke taak doet, in welke volgorde, zonder dat twee uitvoerders
hetzelfde bestand raken.

---

## Eerst: hoe de drie docs samenhangen (dit nam de verwarring weg)

De Cursor-prompts zijn **geen apart plan** — het zijn een uitvoerdersplak van hetzelfde weekplan.
Drie docs, drie rollen:

| Doc | Wat het is | Voor wie |
|---|---|---|
| [VAKANTIEWEEK_STRATEGIE_2026-09.md](VAKANTIEWEEK_STRATEGIE_2026-09.md) | **Het waarom + het besluit** (distributie boven product) + jouw eigen 7 dagen | Dennis (lees 1×) |
| **Dit doc** | **Wie doet wat wanneer** — Dennis · Claude · Cursor over 7 dagen, botsvrij | Dennis (dagelijks) |
| [VAKANTIEWEEK_CURSOR_COMPOSER_2026-09.md](VAKANTIEWEEK_CURSOR_COMPOSER_2026-09.md) | **De kant-en-klare Cursor-prompts** om te plakken | Cursor-baan |

`[FEIT]` Antwoord op "is dit anders dan het vakantieplan?": nee — het is het codeerbare deel ervan,
uitgesplitst per uitvoerder. Het vakantieplan blijft leidend: **de code is de minderheid van de waarde;
de 7 dagen zijn vooral distributie (jouw werk).**

---

## Past dit naast alles wat al gebouwd is? Ja — geverifieerd 13 sep

- Working tree schoon; branch 0 achter / 2 voor op `origin/main` (alles t/m PR #11 zit eronder).
- Doel-bestanden stabiel (laatste echte edits 28 aug–5 sep), **geen** ervan uit de USDA/voeding-golf.
- De taken raken de `/beste`- + meet-kant; de recente 82 commits raakten voeding/Kompas. **Lage botskans.**
- **Voorwaarde:** laat Claude én Cursor werken vanaf déze branch of een verse branch van de laatste `main`,
  zodat beide op alles-tot-nu bouwen.

---

## De eerlijke CTO-noot: heb je twee AI-coders nodig?

`[OORDEEL]` Het totale codeerwerk hier is **~1–2 dagen**, niet vijf. Twee AI-agents parallel op een solo-
vakantie is meer coördinatielast dan winst. Twee werkbare opties:

1. **Simpel (aanbevolen):** één coder. Laat **Claude** de kruislingse/gated taken doen (meet-audit, SEO-
   data, opruimen) en gebruik **Cursor** alleen voor de snelle visuele edit als je tóch achter je scherm zit.
2. **Beide parallel:** kan, mits je de bestand-eigendom hieronder respecteert (geen overlap) en de volgorde
   aanhoudt. Gebruik dit alleen als je het leuk vindt, niet om "meer" te doen.

Hoe dan ook: **rek dit niet uit om de week te vullen.** Zodra de musts staan, is de rest van de week distributie.

---

## Bestand-eigendom (het anti-bots-contract)

Niemand raakt andermans bestanden. Dit is de hele truc om Claude + Cursor naast elkaar te laten lopen.

| Bestand(en) | Eigenaar | Taak |
|---|---|---|
| `src/app/api/affiliate/click/route.ts`, `src/lib/affiliate-analytics.ts`, `src/lib/__tests__/…` (nieuwe test) | **Claude** | Meet-audit + regressietest |
| `src/data/supplements/magnesium.ts`, `src/data/supplement-guides/magnesium.ts` | **Claude** | H1-botsing (gated) |
| `next.config.ts`, `src/app/wat-is-omega-3/`, `src/app/waar-let-je-op-bij-omega-3/` | **Claude** | omega-3 301 (gated) |
| `src/config/theme.ts`, `src/lib/org-context.ts` (+ dode tests) | **Claude** | opruimen (optioneel) |
| `src/components/supplements/*` (layout/CTA) | **Cursor** | CTA boven de vouw op 375px |
| `src/data/blog/magnesium-in-combinatie-met-medicijnen.ts` | **Cursor** | snippet aanscherpen |

**Enige raakvlak:** Claude's meet-audit schrijft een test die de `/beste`-uitgaande links controleert; Cursor's
CTA-wijziging raakt diezelfde componenten. **Volgorde lost dit op:** Claude eerst (de test bewaakt daarna
Cursor's wijziging). Zie dag 1 → dag 2.

**Beide banen:** na groene klaar-check committen, **nooit pushen**. Niets live tot jij `deploy.sh` draait —
dat is je review-poort, met name voor de gated taken.

---

## De 7 dagen — drie banen naast elkaar

> Jouw baan (Dennis) = het vakantieplan (distributie + meet-beslissingen). Claude/Cursor = code.
> Alleen jij ziet Search Console / GA4 / Supabase — de gated taken wachten daarom op jou.

### Dag 1 (ma) — nulpunt + de niet-gated code starten
- **Dennis:** SC 7-rijen-tabel `/beste/*`; check e-maillijst (`guide_opt_ins`/`premium_waitlist`); kies één
  kanaal; 15 vragen ↔ pagina. Klik zelf op een affiliate-link en bevestig de rij in Supabase.
- **Claude:** taak **C1 — meet-audit** (klik → affiliate_clicks → GA4) + regressietest. Niet gated, hoogste waarde.
- **Cursor:** nog niks óf **K2 — blog-snippet** (niet gated) als je zin hebt.

### Dag 2 (di) — de musts afmaken
- **Dennis:** eerste 3–4 kanaalbijdragen. Geef Claude de SC-uitslag: welke URL rankt op "beste magnesium"?
- **Claude:** taak **C2 — magnesium H1** op de rankende URL (na je uitslag).
- **Cursor:** taak **K1 — CTA boven de vouw op 375px** (nu Claude's guard-test uit dag 1 staat).

### Dag 3 (wo) — distributie-push
- **Dennis:** 5–7 bijdragen; referrals in GA4 realtime volgen. Bevestig of de omega-3-root-URL's 0 impressies hebben.
- **Claude:** taak **C3 — omega-3 301** (alleen als je 0 impressies bevestigt).
- **Cursor:** **K2** afmaken als nog niet gedaan.

### Dag 4 (do) — lezen & verdubbelen
- **Dennis:** welke posts leverden sessies/klikken? Verdubbel op wat werkte.
- **Claude of Cursor:** één conversieverbetering op basis van wat je zag (bv. duidelijker volgende stap op de
  landingspagina die mensen raakten). Klein.

### Dag 5 (vr) — consolideren
- **Dennis:** laatste bijdragen + herhaalbare wekelijkse cadans opzetten. Review de diffs. **Deploy.**
- **Claude:** optioneel **C4 — dode scaffolding** opruimen; volledige klaar-check over alles.
- **Cursor:** —

### Weekend — vrij.

---

## Minimum / ideaal / stretch (code-kant)

- **Minimum:** C1 (meet-audit) staat → je funnel is afleesbaar. Dat alleen al maakt de kanaaltest zinvol.
- **Ideaal:** C1 + C2 (magnesium H1) + K1 (CTA) geshipt en gedeployd.
- **Stretch:** + K2, C3, en één datagedreven conversiefix uit dag 4.

---

## Wat geen van beide agents deze week doet

USDA/`observed`, Kompas/voeding/dashboard, nieuwe `/beste/*`- of blogpagina's in bulk, Stripe, multi-tenancy.
Dat is de val uit het weekplan — via Claude of Cursor blijft het de val.

---

*De concrete Claude-taken (C1–C4) en Cursor-prompts (K1–K2, +optioneel) staan uitgeschreven in
[VAKANTIEWEEK_CURSOR_COMPOSER_2026-09.md](VAKANTIEWEEK_CURSOR_COMPOSER_2026-09.md) — die prompts werken voor
beide agents; alleen de eigenaar verschilt per de tabel hierboven.*
