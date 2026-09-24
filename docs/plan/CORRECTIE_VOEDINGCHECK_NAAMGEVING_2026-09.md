# Correctie — "Voedingcheck" teruggedraaid naar het bestaande besluit

**Datum:** 24 september 2026
**Status:** correctie uitgevoerd
**Aanleiding:** een sessie bouwde zonder `docs/plan/` te raadplegen een pivot
richting "Voedingcheck" als nieuwe merknaam en `/check` als keuzescherm
tussen twee checks — zonder te weten dat `BESLUIT_VOEDINGSFOCUS_DASHBOARD_
2026-09.md` §3.9 hier al over ging.

## Wat er fout ging

Commit `6e912ba` op `main` had de pivot uit §3.9 al correct uitgevoerd: de
brede check verhuisde naar `/intake/leefstijl` ("niet meer aangeboden"),
`/intake` zelf werd de voedingscheck, getiteld **"Wat mis je?"** —
"Voedingscheck" is in dat besluit expliciet afgewezen als naam ("te smal: de
check vraagt ook naar daglicht, geen voeding").

Een feature-branch (`claude/leefstijl-naar-voeding-check-bnsawt`) introduceerde
daarna, in 9 commits, opnieuw "Voedingcheck" als merknaam, wees CTA's naar
`/intake/voeding` in plaats van het canonieke `/intake`, en bouwde tot slot
een `/check`-keuzescherm dat rechtstreeks inging tegen een expliciet
acceptatiecriterium in `ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md`
("Geen enkel item biedt twee checks als gelijkwaardige primaire CTA").

## Wat is gecorrigeerd

- `/check`-route en het keuzescherm-component verwijderd.
- Alle CTA's (header, footer, homepage, floating CTA, blog, methodologie)
  terug naar één canonieke ingang: `/intake`.
- "Voedingcheck" als merknaam vervangen door neutrale taal ("de check") of,
  op koptekst-achtige plekken, de bestaande tagline **"Wat mis je?"**.
- **Bijvangst, twee losse pre-existing bugs, los van bovenstaande, ook
  gefixt:**
  - `CONTENT_CHECKS.leefstijl.href` verwees nog naar `/intake` (de
    voedingscheck) i.p.v. `/intake/leefstijl` — nu gecorrigeerd.
    `CONTENT_CHECKS.voeding.href` verwees naar het niet meer gepromote
    `/intake/voeding` — nu ook `/intake`.
  - `NutritionCapture.tsx`'s 401-hand-off-scherm linkte circulair naar
    zichzelf (`/intake`) in plaats van naar de check die daadwerkelijk een
    sessie aanmaakt (`/intake/leefstijl`).

## Nog open — sessie-architectuur

De onderliggende blokkade die dit zichtbaar maakte, is **niet** vandaag
opgelost: `nutrition-log` kan alleen opslaan met een sessie die uitsluitend
via de (niet meer gepromote) brede check ontstaat. Voor de geschetste
toekomst (affiliate-attributie, nurture-mails, n8n-outbox) is een eigen,
lichte sessie-ingang voor de check op `/intake` de kern — zie het besluit
zelf voor de aanbeveling (nullable brede-check-kolommen op
`intake_sessions`, `account-dashboard.ts` leren een voedingscheck-only
sessie te herkennen). Vraagt een eigen besluitdocument vóór er schema
wijzigt.
