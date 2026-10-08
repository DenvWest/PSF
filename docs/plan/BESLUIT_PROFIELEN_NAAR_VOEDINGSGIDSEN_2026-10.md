# Besluit — de vier profielpagina's verdwijnen, met een 301 naar de voedingsgids

**Datum:** 8 oktober 2026
**Status:** besluit genomen (Dennis, 8 okt), uitgevoerd in PR #190
**Vervolg op:** `PROMPT_LEEFSTIJLCHECK_NAAR_WAT_MIS_JE_2026-10.md` §2 · `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.9 · `CORRECTIE_VOEDINGCHECK_NAAMGEVING_2026-09.md`
**Herroept:** `ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md` §24 punt 5 ("een profielpagina ís de uitkomst van de brede check"; profielen als knopen in de graaf)

## Aanleiding

De vier profielen (Onrustige Slaper, Lage Energie, Stressdrager, Overtrainer op `/profiel/*`) zijn uitkomstlabels van de brede Leefstijlcheck. Die check staat sinds 17 september op `/intake/leefstijl` en wordt niet meer aangeboden. De check op `/intake` ("Wat mis je?") meet voeding en daglicht en geeft geen profiellabel. Toch beloofden de pagina's en de teasers ernaartoe iets anders: "Ben jij een Onrustige Slaper?", "Ontdek … of Onrustige Slaper bij jouw situatie past", "match met Onrustige Slaper".

## Besluit, in twee rondes

**Ronde 1 (8 okt, ochtend): houden als herkenning.** Elke check-belofte eruit, CTA eerlijk naar "Wat mis je?". Dat stond in de eerste commit van PR #190.

**Ronde 2 (8 okt, middag): weg, met 301's.** Dennis: alles naar voeding, er zijn geen actieve gebruikers van de oude check. Daarmee viel het bezwaar uit ronde 1 weg: dashboards en nurture-mails van brede-check-gebruikers die naar `/profiel/*` linken. De herkenning plus voeding staat al in de `<thema>-en-voeding`-gidsen; een profielpagina daarnaast was een tweede ingang zonder voeding.

| Oud | 301 naar |
|---|---|
| `/profiel` | `/gidsen` |
| `/profiel/onrustige-slaper` | `/slaap-en-voeding` |
| `/profiel/stressdrager` | `/stress-en-voeding` |
| `/profiel/lage-energie` | `/energie-en-voeding` |
| `/profiel/overtrainer` | `/herstel-en-voeding` |

De oudere redirects (`/profiel/lage-batterij`, `stille-slijter`, `stilzitter`, `herstel`, `basis-mist`, `stille-tekorten`) wijzen nu direct naar de eindbestemming, zonder keten.

Weg uit de code: `src/app/profiel/*`, `src/data/profiles/*`, `src/types/profile-page.ts`, het blok "Past bij dit profiel" (`ComparisonProfileFits` + `supplement-profile-fits.ts`) op `/beste/*` en `/supplementen/*`, de profielknopen in de contentgraaf, de profielvariant van de check-lens, de footer-link en de sitemap-sectie. Inline links in gidsen, blogs, de kennisbank en `MovementRecognition` wijzen nu naar de bijbehorende `<thema>-en-voeding`-gids.

## Afgewezen

- **Overtrainer houden en herschrijven op voeding (eiwit, herstel).** Dat wordt een kopie van `/herstel-en-voeding`.
- **Houden als herkenningspagina (ronde 1).** Het waren pagina's over slaap-, stress- en trainingsgedrag, met voeding hooguit als bijzaak. Met voeding als enige focus voegen ze niets toe naast de gidsen.
- **Terug als uitkomst van de check.** "Wat mis je?" meet geen slaap of stress. Een label zou nergens op rusten, of de check moet weer breder worden, en dat heeft §3.9 afgewezen.

## Naam van de check

Dennis vroeg in dezelfde ronde om "overal voedingscheck". Dat botst met §3.9 (de naam "Voedingscheck" is afgewezen: te smal, de check vraagt ook naar daglicht). Na overleg: **de inhoud wordt overal voeding-eerst en de naam blijft "Wat mis je?"**. De resterende zichtbare "voedingscheck"-teksten (~50, onder andere in het dashboard, op `/voeding` en op `/onderbouwing/voeding`) heten in PR #190 "de check" of "Wat mis je?". Event-namen (`dashboard_voedingscheck_cta_click`) en id's blijven, omdat ze in de meting staan.

## Wat bewust blijft

- `/intake/leefstijl`, `IntakeIntro`, de `NutritionCapture`-401 naar `/intake/leefstijl`, `/onderbouwing` (onderbouwing van de brede check) en de dashboardcopy voor brede-check-sessies houden de naam Leefstijlcheck.
- **De nurture-hoofdreeks** gaat later in één keer om, na het premium-besluit. Zie het open punt in `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md`. Tot dan vangen de 301's de profiel-links in die mails op. De gids-mails zijn wel al omgezet.

## Nog open

1. **De recovery-link "Bekijk je leefstijl-overzicht"** landt op `/intake?resultaten=true`, en dat is de voedingsuitslag. Dit gaat mee met de nurture-herschrijving.
2. **De duur van de check** is niet eenduidig: `CONTENT_CHECKS.voeding.duurLabel` = "1 minuut", terwijl `GuideOptIn`, `HubPersonalBar` en `MovementClosingCta` "3 minuten" zeggen.
3. **`AanpakMode`** (`/inzichten`) rekent op domeinscores van de brede check.
4. **Juridische pagina's** (`/privacy`, `/medische-disclaimer`) noemen de Leefstijlcheck als verwerking. Bij de volgende juridische ronde "Wat mis je?" expliciet opnemen.
