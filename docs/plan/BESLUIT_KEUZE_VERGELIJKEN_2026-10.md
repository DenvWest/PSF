# Besluit: Keuze blijft Keuze — Vergelijken (voeding naast supplement, met PS-Score) en Favorieten

**Datum:** 6 oktober 2026
**Status:** Besloten (Dennis: "akkoord met voorstel bij keuze"), nog te bouwen.
**Raakt:** `src/lib/schap-tabs.ts`, `src/components/dashboard/voortgang/SchapView.tsx`, `NutrientLogboekPanel`
**Laat staan:** `BESLUIT_ONDERBALK_DRIE_TABS_2026-10.md` (Dagboek · Patroon · Keuze, ids ongewijzigd)

## Aanleiding

Dennis vroeg:
1. Keuze hernoemen naar **Supplementen**?
2. Daar vooral voeding en supplementen vergelijken (bij Producten).
3. Voedingslogboek veranderen in **PSF-score**.
4. Favorieten blijft voor de supplementen die iemand bewaart.

Op de vraag wat "PSF-score" betekent: **de PS-Score van supplementen** (0–100, productkwaliteit), niet een score voor iemands voeding.

## Besluiten

1. **De tab blijft "Keuze".** Afgewezen: "Supplementen" als naam van de hoofdtab.
   - Het dashboard is voeding eerst; het systeem bewijst nooit een tekort, en kopen of affiliate hoort niet in het dashboard (cockpit-besluit, juli 2026). Een hoofdtab "Supplementen" zegt het omgekeerde.
   - `/supplementen` is al de publieke catalogus met PS-Score: twee plekken met dezelfde naam en een andere inhoud.
   - De lus meten → wegen → kiezen (Dagboek → Patroon → Keuze) blijft heel.
2. **Onderdelen van Keuze (voeding):**
   - **Vergelijken** (vervangt Producten): per stof voeding naast supplement — portie, wat het levert, % van de norm — en bij elk supplement zijn **PS-Score** met een link naar `/supplementen?categorie=<stof>`.
   - **Voedingslogboek gaat op in Vergelijken.** Het toont nu al per stof de route (voeding of supplement); als apart tabblad dubbelt het.
   - **Favorieten** blijft: de supplementen die je met ☆ bewaarde (sinds 6 okt ook vanuit Je patroon, zie `BESLUIT_MICRO_IN_BEELD_2026-10.md` §6).
3. **De PS-Score is een productscore, geen persoonsscore.** Geen "PSF-score" voor iemands voeding: die is eerder afgewezen (geen tweede score; een "hoe gezond"-cijfer verbergt welke stof het verschil maakt — `BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`).
4. De poort van het voedingslogboek blijft gelden in Vergelijken: staat je voedingsbasis niet, dan blijven de supplementknoppen dicht, met de reden erbij.

## Open bij het bouwen

- Hoe de PS-Score per stof uit `src/lib/supplement-hub/product-catalog.ts` in het dashboard komt (top-product per stof of een korte lijst), zonder affiliate-links in het dashboard zelf.
- Meetpunten: tabwissel (bestaand), klik naar de catalogus vanuit Vergelijken (nieuw).
