# Prompt voor een volgende sessie: doel koppelen aan je patroon, en een premium weeksamenvatting

**Datum:** 10 oktober 2026
**Status:** Open. Besloten dat dit een aparte sessie krijgt (Dennis, 10 okt), niet in de Keuze/Patroon-plakken.
**Lees eerst:** `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` (wat gratis is en wat premium; weekmail zonder voedingsgegevens), `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md` (proef 30 dagen bij 5 van 7 dagen, €49/jaar bij te stellen, Stripe), `BESLUIT_PATROON_OP_KEUZE_NIVEAU_2026-10.md` (waar Patroon nu staat), `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` (calorieën/macro's informatief, geen oordeel), `BESLUIT_DOELEN_VERBONDEN_2026-10.md`, `docs/core/STEPPED_CARE_MODEL.md`, `docs/core/WRITING_VOICE.md`. Draai daarna `grep -rli "premium\|weekmail\|samenvatting\|doel" docs/plan/` volgens CLAUDE.md.

## Vragen van Dennis

1. **Doel koppelen aan je patroon.** Kan de hero in Per stof zeggen wat een stof met jouw doel te maken heeft (moe voelen, slaap, energie)? Is dat gratis of premium?
2. **Premium weeksamenvatting.** Kan er een betaalde, geautomatiseerde samenvatting komen van wat je at: welke stoffen op koers, welke maaltijd draagt wat?
3. **Nurture-mail.** Hoe sluit een mail daarop aan, zonder voedingsgegevens in de mail?

## Wat er al vastligt (niet opnieuw bespreken)

- Gratis: vandaag en 7 dagen, je eigen getallen, norm en bronnen. Premium: 30–90 dagen, verband per maaltijd over tijd, voorstellen, vergelijking met eerdere weken.
- Weekmail: alleen "je weekoverzicht staat klaar · 5 van 7 dagen ingevuld" plus link achter de login; geen stoffen, producten, percentages of maaltijden (art. 9-gegevens). Eigen opt-in, vanaf 3 ingevulde dagen.
- Geen LLM in mail of rapport; regelgebaseerd, op de bestaande rekenpaden (`nutrition-stof-meting.ts`, `nutrition-maaltijd-patroon.ts`). Geen weekscore of cijfer.
- Supplementadvies pas na 30 dagen volledige dagen, nooit voor zink en vitamine D, nooit "je hebt een tekort".
- Geen oordeel-labels op calorieën of vetten ("goede/slechte"): gezondheidsclaim. De ontstekings- en doelkant ("laaggradige ontsteking") hoort bij een eventueel medisch product en blijft buiten het platform.

## Voorlopige richting (Claude, 10 okt, nog te toetsen)

- **Doelverwijzing:** een zin in de hero ("Je doel is energie. Eiwit en ijzer horen daar vaak bij") alleen met een EFSA-claim of Gezondheidsraad-bron en uit de bestaande gidsen. De verwijzing is gratis; het verband over tijd per doel is premium.
- **Weeksamenvatting:** regelgebaseerde zinnen uit bestaande data ("magnesium op 3 van 7 dagen op koers; je ontbijt droeg het minst bij"), in het rapport achter de login. Gratis: 7 dagen. Premium: de vergelijking met eerdere weken en het verband per maaltijd.
- **Nurture:** de mail meldt alleen dat het overzicht klaarstaat; de inhoud blijft achter de login.

## Gevraagde uitkomst

Eén aanbeveling met onderbouwing: wat is gratis en wat premium bij doel en samenvatting, de zinnen die de regels kunnen opleveren (met bron per claim), de plek in de weekmail-flow, en de meetpunten. Leg het vast in `docs/plan/` en bouw daarna in plakken. Raakt Stripe of een migratie: eerst het blok in `supabase/migrations/OPENSTAAND.md` en migratie-eerst naar main.
