# Prompt voor een volgende sessie: oude Leefstijlcheck-copy en profielen afstemmen op "Wat mis je?"

**Datum:** 8 oktober 2026
**Status:** Uitgevoerd 8 okt 2026 (branch `feat/wat-mis-je-copy`). Profielbesluit: `BESLUIT_PROFIELEN_HERKENNING_2026-10.md` — daar ook wat nog open staat.
**Lees eerst:** `CORRECTIE_VOEDINGCHECK_NAAMGEVING_2026-09.md` (de check heet "Wat mis je?", niet "Voedingcheck"; één ingang: `/intake`), `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.9 (de brede check staat op `/intake/leefstijl` en wordt niet meer aangeboden), `ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md` (nooit twee checks als gelijkwaardige CTA), `docs/core/WRITING_VOICE.md`, en `grep -rli "profiel" docs/plan/` voor eerdere besluiten over de profielen.

## Wat al gedaan is

- PR #181 en #186: de zeven webgidsen `<thema>-en-voeding`. De hub-knop (`DomainHubConnector`) zegt nu "Wat mis je? Doe de gratis check →".

## Wat nog open staat

### 1. Leefstijlcheck-CTA's op de rest van de site

Ongeveer 45 plekken in zo'n 30 bestanden. Zoek met:

```
grep -rnoiE "(doe|start|begin|naar) de (gratis )?leefstijl ?check|gratis leefstijl ?check|leefstijlcheck (doen|starten)" src --include=*.tsx --include=*.ts | grep -v __tests__
```

De grootste groepen zijn:
- de nurture-content en de mailtemplates (`src/data/nurture-content.ts`, `src/lib/email-templates/guide-nurture/*`)
- de copy van de check zelf (`src/lib/intake-product-copy.ts`, `IntakeIntro`, `SleepCheckin`, `StressCheckin`, `NutritionCapture`, `MovementCapture`)
- de profielen (`src/data/profiles/*`, `src/app/profiel/*`)
- de inzichten en de kennisbank (`AanpakMode`, `InsightPhaseNote`, `InzichtenPremiumKennisbankUpsell`, `KennisbankVerdiepingGate`, `KennisbankTier1FooterCta`)
- losse pagina's (`layout.tsx`, `not-found.tsx`, `onderbouwing`, `inzichten`, `voeding-na-40`, `gids/slaap`)

Let op: niet elke "Leefstijlcheck" is fout. Waar het echt over de brede check of over historische resultaten gaat (een dashboard van iemand die de oude check deed, `/intake/leefstijl`), kan de naam kloppen. Maak per groep die afweging en maak niet blind één zoek-en-vervang.

### 2. De profielen: "Ben jij een Onrustige Slaper?"

- De vier profielen (Onrustige Slaper, Lage Energie, Stressdrager, Overtrainer, op `/profiel/*`) zijn **uitkomstlabels van de oude, brede Leefstijlcheck**. De huidige check op `/intake` ("Wat mis je?") geeft die labels niet. Een pagina die belooft "ontdek of jij een Onrustige Slaper bent" en dan naar `/intake` stuurt, belooft iets wat de check niet doet.
- Waar ze worden gepromoot:
  - het teaserblok "Herken je dit patroon? Misschien ben je een Onrustige Slaper. Ben jij een Onrustige Slaper? →" op `/slaap-en-voeding` (rond regel 313)
  - links naar `/profiel/*` in `testosteron-en-voeding`, `herstel-en-voeding`, `MovementRecognition`, blogs (onder andere `cortisol-en-slaap.ts`, met de oude copy "14 vragen, 1 minuut"), de kennisbank, de content-graph en de nurture-helpers (`src/lib/email-templates/nurture/helpers.ts`)
- **Te beslissen met Dennis** (geef één aanbeveling met onderbouwing):
  - houden als herkenningspagina's (SEO: "wakker om 3 uur") met een eerlijke CTA naar "Wat mis je?"
  - of opnemen in de webgidsen, met 301's
  - of terug laten komen als uitkomst van de check
  - En wat gebeurt er met de profiel-teasers in de gidsen?
- Check ook de nurture-intro en de mails op de oude belofte van de check ("14 vragen", "je profiel", "Herstelplan") en op de profiellabels.

## Werkwijze

- Eigen worktree en PR. Meetpunten blijven of komen erbij: een CTA die verandert, houdt zijn event (`intake_cta_clicked` met `locatie`, `hub_connector_click`).
- Het besluit over de profielen leg je vast in `docs/plan/` (datum, status, wat is afgewezen en waarom).
