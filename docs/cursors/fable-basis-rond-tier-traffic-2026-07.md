# Fable-prompt — basis rond: tier-ladder, Kompas & traffic (juli 2026)

Eén zelfstandige copy-paste prompt voor Claude Fable. Draai hem als **aparte sessie**,
**ná** de roadmap-evaluatie uit `docs/cursors/fable-roadmap-evaluatie-vervolg-2026-07.md`.

**Achtergrond.** De roadmap-evaluatie beantwoordt "wat is technisch af / wat mag vóór
verkeer". Deze prompt pakt de laag erboven: product/strategie. Vier vragen lopen door
elkaar — (A) hoe rond is de gratis→betaald-ladder eigenlijk, (B) wat moet er van de
nutriënt-deepresearch in content landen, (C) is "laagste prijs + partnerdeals + hoge
commissie" een kans of een merk-breker, en (E) kan faceless YouTube nú al als
traffic-kanaal starten. Deze prompt dwingt Fable die vier in één sequentie te beantwoorden.

**Bindende lens (vastgelegd):** *basis rond krijgen is leidend*. Wetenschap, YouTube en
businessmodel zijn input voor die sequentie — geen literatuurreview op zichzelf, en geen
greenfield business-pivot zonder fit-check tegen merk en plannen.

**Sessie-volgorde:**

1. Eerst `docs/cursors/fable-roadmap-evaluatie-vervolg-2026-07.md` (technische roadmap-waarheid)
2. Daarna deze prompt (gratis ladder, content-moat, traffic, betaald)
3. Compliance-eindoordeel blijft klein en optioneel parallel (alleen als papierwerk verkeer blokkeert)

**Scope-besluit (vastgelegd):** geen code, geen commits — output is een rapport. Geen
herhaling van de roadmap-code-scorecard; geen nieuwe nutrient-literatuurzoektocht;
handoff-prompts alleen als titel + 1 zin.

---

## Prompt — basis rond (tier / Kompas / traffic)

```text
MODEL-CONTEXT: Claude Fable — product-/strategie-analyse "basis rond", geen code wijzigen.
PROJECT: PerfectSupplement (perfectsupplement.nl) — Next.js 16 App Router, TypeScript strict, Supabase (RLS), systemd-deploy op Hetzner. Onafhankelijk supplementen-vergelijkingsplatform voor mannen 40+, positionering "Consumentenbond van supplementen".
TAAL: Nederlands in output; bestandspaden en code in Engels.
CONSTRAINTS: geen code-edits, geen commits, geen migraties, geen `next build`; alleen lezen + rapporteren.

## Waarom deze sessie

De technische roadmap-waarheid is (of wordt) apart vastgesteld via de roadmap-evaluatie
(docs/cursors/fable-roadmap-evaluatie-vervolg-2026-07.md). Deze sessie beantwoordt de
productlaag erboven: hoe rond is de gratis→betaald-ladder, wat moet er van de
nutriënt-deepresearch in content landen, houdt het idee "laagste prijs + partnerdeals +
hoge commissie" stand tegen het merk, en kan faceless YouTube nú starten als traffic-kanaal.

BINDENDE LENS (niet heronderhandelen): basis rond krijgen is leidend. Wetenschap, YouTube
en businessmodel zijn input voor die sequentie — geen literatuurreview op zichzelf, geen
greenfield business-pivot zonder fit-check tegen BRAND_POSITIONING en de PartnerDesk/af_*-plannen.

Zoek eerst in docs/cursors/ naar het rapport dat uit de roadmap-evaluatie-prompt is gekomen
(juli 2026). Bestaat het: neem de code-scorecard daaruit als vertrekpunt en herbevestig
alleen de claims waar jouw advies direct op leunt. Bestaat het niet: doe minimale eigen
spotchecks (lijst hieronder), maar bouw GEEN volledige code-scorecard — dat is de andere sessie.

## Harde sprint-regel (verankerd — niet heronderhandelen)

Uit docs/core/CURRENT_SPRINT.md (16 jul): geen S4/S6, geen Stripe, geen drempel-tuning op
N<100 — vóór de week-0 aflezing van echt verkeer. S4 = vraagset-herverdeling 16→17 (bump
1.5.0), S6 = verbinding-check-in + premium plan-gate; beide uit
docs/plan/PLAN_LEEFSTIJLCHECK_UITVOERING.md. Elke aanbeveling die hiermee botst label je
expliciet als "ná verkeer", met de concrete trigger (metric + drempel) die hem ontgrendelt.
Alles wat je adviseert te doen vóór week-0 is meet-, content- of traffic-werk.

## Dennis-hypothesen (stress-testen, niet gehoorzamen)

H1. "Speciale partnerdeals + altijd laagste prijs + hoge commissie bij ons" is een kansrijke
    uitbreiding van het businessmodel.
H2. Faceless YouTube (Veo2 als productietool) kan nú starten als traffic-kanaal, vóór week-0.
H3. Het gratis Kompas moet eerst sterker worden vóór er een betaald aanbod komt.

Per hypothese: expliciet oordeel met bewijs — bevestigen, aanscherpen of verwerpen mag,
maar kies.

WERKWIJZE (verplicht, in volgorde — alleen analyse):
F0 Lens herijken — formuleer in max 5 regels wat "basis rond" concreet betekent gegeven de pre-traffic-sprint en de vier ringen van de ladder (F1); dit wordt de meetlat voor F2–F6
F1 Ladder-scorecard — stand per ring, met bewijs (pad:regel of doc+datum):
   • Ring 1 publiek: pillars, blog, /beste/*, methodologie
   • Ring 2 gratis account + Kompas: dashboard, DomainDeep, voeding-log, check-ins
   • Ring 3 waitlist / "Premium · begeleiding" (geen Stripe)
   • Ring 4 toekomst: rapportage + betaalde diepte
   Let op: kennisbank-insightTier (src/data/kennisbank.ts, src/types/insight.ts) is één
   laag binnen ring 1/2, niet de hele ladder. Bekende asymmetrie om te toetsen: voeding is
   verder dan de andere domeinen (docs/plan/PLAN_NUTRITION_SELFEVAL_LOOP.md, backlog
   "voeding in trend"). Eindoordeel F1 in één zin: "basis is X% rond; het bindende gat is …"
F2 Wetenschap → content-moat — hergebruik docs/research/DEEPRESEARCH_micro_marco_nutriëntstatus_bij_mannen_>40jaar.md als SSOT, géén nieuwe literatuurzoektocht:
   • Top-tekorten (vitamine D, eiwit, omega-3, magnesium, …) mappen op bestaande dekking
     (pillars, kennisbank, /beste/*, supplementgidsen) vs gaten
   • Man/vrouw/tijd-nuances alleen waar ze het product (man 40+) of copy raken; geen
     gender-architectuur
   • Voeding vs supplement + "wanneer is een supplement echt nodig" + activiteitsgradaties
     → compliance-safe formuleren: inname ≠ status (docs/core/COMPLIANCE.md), geen
     medische claims
   • Output: max 5 content-stukken die de gratis ladder versterken ÉN later betaald/
     rapportage voeden — plus expliciete NIET-lijst
   Claimt de DEEPRESEARCH een gat dat product-kritisch is: max 1 zin "extern verifiëren",
   niet zelf gaan zoeken.
F3 Business-fork (H1) — stress-test tegen docs/core/BRAND_POSITIONING.md §1–5 (o.a. §1:
   "affiliate volgt de redactionele keuze, niet andersom") en de §7-regel "korting-codes of
   exclusieve deals als hoofdboodschap ondermijnt de Consumentenbond-positionering", plus de
   PartnerDesk/af_*-plannen. Verdict: KEEP / REFINE / KILL, met:
   • wanneer prijs-transparantie wél past (objectieve prijs-op-dat-moment ná redactionele
     shortlist, Consumentenbond-achtig)
   • wanneer exclusieve deals merkbrekend zijn
   • timing: vóór verkeer relevant, of pas ná N-verkeer + PartnerDesk-rijpheid (noem N)
F4 Gratis Kompas-hefboom (H3) — kies ÉÉN volgende hefboom (niet vijf), met koppeling naar
   de latere betaalde rapportage/diepte en een meetpunt. Kandidaten (kies met onderbouwing,
   aanvullen mag alleen met bewijs uit docs):
   • voeding in trend / self-eval-lus afronden
   • identiteit-sectie (PAL/eiwit) — groot, eerst scope
   • DomainDeep-pariteit andere domeinen vs voeding-diepte
   • hermeting / delta-leesbaarheid
   Geen Stripe vóór week-0 — dat is geen kandidaat.
F5 YouTube-playbook (H2) — praktisch, onder de pre-traffic-regel:
   • Go/no-go: mag je nú starten? Ja/nee met voorwaarden (CTA → check, geen medische
     claims, meetpunt vanaf video 1)
   • Toets eerst docs/plan/PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md: er liggen al 3
     pilot-scripts + video-compliance-checklist — hergebruiken, aanpassen of vervangen,
     met reden
   • Opening-video: ÉÉN onderwerp kiezen (bijv. "waarom leefstijl eerst", "welke
     nutriënten vaak tekort na 40", "waarom wij X niet verkopen") — getoetst aan de
     DEEPRESEARCH én de handtekening-uitsluitingen (melatonine geen koop-CTA, ashwagandha
     on-hold, geen energie-claims op omega-3; BRAND_POSITIONING §5/§9)
   • Veo2 = productietool, geen strategie: noem format (lengte, hook, CTA), geen tool-howto
   • Funnel: YT → pillar/blog/check; meting via GA4 + bestaande events, geen nieuwe PII
F6 Sequentie + handoffs — 30 dagen (pre-traffic) + 90 dagen (ná verkeer) als één
   doorlopende lijst; expliciete NIET-lijst met reden; max 3 Fable/Cursor-handoff-prompts
   (alleen titel + 1 zin, geen uitwerking); Dennis-checklist (handmatige acties buiten de repo)

## Verplichte bronnen

Kader (leidend bij conflict):
- docs/core/CURRENT_SPRINT.md
- docs/cursors/pre-traffic-gates-2026-07.md
- docs/cursors/fable-roadmap-evaluatie-vervolg-2026-07.md + diens rapport indien aanwezig

Merk & model:
- docs/core/BRAND_POSITIONING.md — vooral §1–5, §7 "Wat niet", §9
- docs/core/STEPPED_CARE_MODEL.md — tier-logica gratis→betaald
- docs/core/COMPLIANCE.md — inname ≠ status, claim-grenzen

Wetenschap-SSOT:
- docs/research/DEEPRESEARCH_micro_marco_nutriëntstatus_bij_mannen_>40jaar.md

Moat & kennisbank:
- docs/cursors/fable-moat-google-ai-premium-2026-07.md — teaser+gate-besluit, "Verdieping na je check", melatonine publiek-uitzondering
- docs/cursors/fable-kennisbank-tier-herziening-2026-07.md

Voeding & YouTube:
- docs/plan/PLAN_NUTRITION_SELFEVAL_LOOP.md
- docs/plan/PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md — bestaande pilot-scripts + compliance-checklist

PartnerDesk / eigen programma (voor F3):
- docs/plan/PRODUCTVISIE_AFFILIATE_PLATFORM.md
- docs/plan/ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md

Code-spotchecks (minimaal deze; alleen uitbreiden waar een advies erop leunt):
- src/lib/db/entitlements.ts — welke features bestaan er écht achter premium (SSOT)
- src/components/dashboard/DomainDeepTool.tsx — Kompas-diepte + preview→waitlist-pad
- src/app/api/account/waitlist/route.ts — waitlist zonder Stripe
- src/data/kennisbank.ts + src/types/insight.ts — insightTier-gating
- src/lib/events.ts + src/app/api/intake/events/route.ts — bestaande event-types voor funnel-/YT-meting
- src/data/supplements/ + src/data/supplement-guides/ — /beste/*- en gids-dekking vs DEEPRESEARCH-tekorten

## Outputstructuur (verplicht)

1. **Executive summary** — max 10 regels, opent met het F1-eindoordeel ("basis is X% rond; het bindende gat is …") + de drie hypothese-verdicten in één regel elk
2. **Ladder-scorecard** — tabel: Ring | Wat er staat (pad:regel of doc+datum) | Wat ontbreekt | Oordeel af / bijna / gat
3. **Wetenschap → content-map** — tekort × bestaande dekking × gat; max 5 content-stukken (titel, doel-ring, welk tekort, compliance-noot) + NIET-lijst
4. **Business-fork verdict** — KEEP / REFINE / KILL met merk-toets, prijs-transparantie-grens en timing-trigger
5. **Kompas-keuze** — de éne hefboom, koppeling naar betaalde rapportage/diepte, meetpunt
6. **YouTube-playbook** — go/no-go + voorwaarden, opening-video (1 onderwerp), format, funnel, meetpunten
7. **Sequentie** — 30 dagen (pre-traffic) + 90 dagen (ná verkeer) als één lijst; expliciete NIET-lijst met reden
8. **Dennis-checklist** + max 3 handoff-prompts (titel + 1 zin)

## Regels

- Geen code, geen commits, geen migraties — alleen rapport
- Elke status-claim met bewijs (pad:regel of doc+datum); "niet verifieerbaar vanuit de repo" is een geldig antwoord en gaat naar de Dennis-checklist
- Geen vage "overweeg"-taal — kies, met onderbouwing; ook bij de drie hypothesen
- Alles vóór de week-0-aflezing is meet-, content- of traffic-werk; geen Stripe, geen S4/S6, geen drempel-tuning
- Compliance overal: inname ≠ status, geen medische claims, geen PII in GA4/Clarity
- Hergebruik bestaande event-types, views en content vóór je nieuwe verzint (meet-standaard CLAUDE.md; YouTube-scripts uit PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md eerst toetsen)
- Handoff-prompts NIET uitwerken — alleen titel + 1 zin; uitwerking volgt in aparte sessies ná akkoord
```

---

## Na uitvoering

1. Ladder-scorecard + de drie hypothese-verdicten reviewen; het F3-besluit (deals/prijs)
   vastleggen — bij KEEP/REFINE als operationele regel in `docs/core/BRAND_POSITIONING.md` §6,
   bij KILL als expliciete NIET-regel
2. Bij go op YouTube: opening-video-format + de video-compliance-checklist uit
   `docs/plan/PLAN_VOEDING_EERST_YOUTUBE_FUNNEL.md` doorlopen vóór opname
3. De gekozen Kompas-hefboom in `docs/core/CURRENT_SPRINT.md` (backlog) zetten met het
   bijbehorende meetpunt
4. De max 3 handoff-prompts pas laten uitwerken in aparte sessies, ná akkoord op de
   30/90-dagen-sequentie
