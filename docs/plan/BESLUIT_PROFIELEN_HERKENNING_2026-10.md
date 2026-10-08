# Besluit — de vier profielpagina's blijven, als herkenning

**Datum:** 8 oktober 2026
**Status:** besluit genomen (Dennis, 8 okt), uitgevoerd in dezelfde PR als de copy-sweep "Leefstijlcheck → Wat mis je?"
**Vervolg op:** `PROMPT_LEEFSTIJLCHECK_NAAR_WAT_MIS_JE_2026-10.md` §2 · `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.9 · `CORRECTIE_VOEDINGCHECK_NAAMGEVING_2026-09.md`
**Herroept deels:** `ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md` §24 punt 5 ("een profielpagina ís de uitkomst van de brede check")

## Aanleiding

De vier profielen (Onrustige Slaper, Lage Energie, Stressdrager, Overtrainer op `/profiel/*`) zijn uitkomstlabels van de brede Leefstijlcheck. Die check staat sinds 17 september op `/intake/leefstijl` en wordt niet meer aangeboden. De check op `/intake` ("Wat mis je?") meet voeding en daglicht en geeft geen profiellabel.

Toch beloofden de pagina's en de teasers ernaartoe iets anders: "Ben jij een Onrustige Slaper?", "Twijfel je of dit profiel bij jou past? Ontdek in 3 minuten … of Onrustige Slaper bij jouw situatie past", "Ontdek jouw leefstijloverzicht — match met Onrustige Slaper". Wie daarop klikte, kwam bij een voedingscheck die die vraag niet beantwoordt.

## Besluit

**De profielpagina's blijven bestaan, als herkenningspagina's.** Het patroon herken je zelf; de pagina beschrijft wat erachter kan zitten en wat je kunt doen. De CTA zegt eerlijk wat de check doet: laten zien welke voedingsstoffen je bord waarschijnlijk mist.

Concreet:

- Geen enkele CTA belooft nog dat de check je profiel bepaalt. `intakeCtaMatchProfile` ("match met …") is weg.
- De afsluiter per profiel (`guidanceCta`) koppelt het patroon aan het bord, bijv. Onrustige Slaper: "Wat doet je bord met je slaap? Dit patroon herken je zelf — daar is geen test voor nodig. De check laat zien welke voedingsstoffen je waarschijnlijk mist …".
- De stap "Meten" in de stappenplannen zegt niet meer "doe de Leefstijlcheck opnieuw en vergelijk je score", maar verwijst naar wat de lezer zelf bijhoudt (ochtendscore, weeklog, lijstje van week 1).
- De teasers in de webgidsen heten "Lees het patroon Onrustige Slaper →" in plaats van "Ben jij een Onrustige Slaper? →". Ze blijven staan; ze zijn interne links naar herkenningscontent, geen check-CTA.
- Hero- en afsluiter-CTA op de profielpagina's krijgen een meetpunt (`intake_cta_clicked`, `locatie` = `profiel_hero_<slug>` / `profiel_afsluiter_<slug>` / `profiel_overzicht`). Die hadden ze niet.

## Afgewezen

- **Opnemen in de webgidsen, met 301's.** De webgidsen zijn net ingezoomd op voeding (PR #181, #186); de profielen gaan over slaap-, stress- en trainingsgedrag en zouden die focus weer verbreden. Daarnaast linken bestaande dashboards van brede-check-gebruikers (`check-lens.ts`, `?from=intake`) en de nurture-mails ("Herlees je profiel →") naar `/profiel/*`; een 301 naar een gids zou die mensen bij andere inhoud laten landen dan hun label beloofde.
- **Terug als uitkomst van de check.** "Wat mis je?" meet voeding en daglicht, geen slaap of stress. Een profiellabel zou nergens op rusten, of de check moet weer breder worden — precies wat §3.9 heeft afgewezen ("korter is de oplossing, niet completer").

## Wat niet verandert

- De profielpagina's zelf (herkenning, uitleg, stappenplan, supplementen) en hun URL's.
- De nurture-hoofdreeks blijft "je deed de Leefstijlcheck" zeggen: die reeks wordt alleen ingepland vanuit `/api/intake/session`, dus elke ontvanger deed de brede check. Alleen dag 21 en dag 30 beloofden een scorevergelijking die `/intake` niet meer levert; die wijzen nu naar "Wat mis je?".
- `/intake/leefstijl`, `IntakeIntro`, de `NutritionCapture`-401-doorverwijzing naar `/intake/leefstijl`, `/onderbouwing` (onderbouwing van de brede check) en dashboardcopy voor brede-check-sessies houden de naam Leefstijlcheck — daar gaat het echt over die check.

## Nog open (niet in deze PR)

1. **Nurture "Bekijk je leefstijl-overzicht"** gaat via de recovery-link naar `/intake?resultaten=true`. Dat toont sinds 17 sep de voedingsuitslag, niet het leefstijloverzicht van een brede-check-sessie. Functionele vraag: moet `recover` voor een brede sessie naar `/intake/leefstijl?resultaten=true`?
2. **"Voedingscheck" als naam** staat nog op ~20 plekken (dashboard, `/voeding`, `/onderbouwing/voeding`, `BlogControleerVerbeterPad`). Die naam is in §3.9 afgewezen; eigen sweep.
3. **Duur van de check** is niet eenduidig: `CONTENT_CHECKS.voeding.duurLabel` = "1 minuut" (homepage, micro-regel), terwijl o.a. `GuideOptIn`, `HubPersonalBar` en `MovementClosingCta` "3 minuten" zeggen.
4. **`AanpakMode`** (`/inzichten`, "Jouw aanpak") rekent op brede-check-domeinscores. Of een "Wat mis je?"-sessie daar context oplevert, hangt af van `CHECK_SESSION_CREATE_ENABLED` en `account-dashboard.ts`.
5. **Juridische pagina's** (`/privacy`, `/medische-disclaimer`) noemen de Leefstijlcheck als verwerking. Klopt zolang `/intake/leefstijl` bestaat; bij een volgende juridische ronde "Wat mis je?" expliciet toevoegen.
