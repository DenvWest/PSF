# Besluit — "Hoe dit werkt" = drie vragen, overal dezelfde uitleg

**Datum:** 7 oktober 2026
**Status:** gebouwd op `feat/hoe-werkt-drie-vragen`
**Volgt uit:** `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` (voeding eerst, de lus Dagboek → Patroon → Keuze), `BESLUIT_ONDERBALK_DRIE_TABS_2026-10.md`, `BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`

## Aanleiding

Dennis: "Hoe werkt dit dashboard aanpassen aan wat het nu is en wordt — ook op inlogscherm, startscherm en check." De uitleg ging nog over de brede Leefstijlcheck (18 vragen, 7 pijlers, scores, check-ins, hermeting), die sinds 17 sep niet meer wordt aangeboden.

## Besluit

De uitleg is overal dezelfde drie vragen, in deze volgorde (één bron: `src/data/how-it-works.ts`):

1. **Heb je wel een supplement nodig?** — de check · Patroon
2. **Welke voeding brengt je naar je norm?** — Dagboek · Patroon · Doelen
3. **Welk supplement is goed beoordeeld én past bij wat je eet?** — Keuze (PS-Score = productscore, niet een persoonsscore)

Plus één disclaimer: we kijken naar wat je eet, niet naar je bloed; een tekort stelt alleen een arts vast.

**Plekken:** Context-paneel dashboard ("Hoe dit werkt"), `/hoe-werkt-dashboard` (hero, drie vragen, stappen 1–5, FAQ, HowTo-schema), inlogscherm (nieuwe bezoeker), resultaat van de check ("Hoe werkt PerfectSupplement?").

## Afgewezen / opgeruimd

- De 7-pijler-preview met vitaliteitsscore op `/hoe-werkt-dashboard` — verkocht een dashboard dat niet meer bestaat.
- De 6-stappenroute (Leefstijlcheck → leefstijloverzicht → check-ins → hermeting) en `src/data/dashboard-route.ts` (grotendeels dode exports).
- De link "doe de volledige Leefstijlcheck" op het checkresultaat: wees naar `/intake`, dus naar zichzelf.

## Open

- Footer en de standaard meta-description van de site noemen nog "Gratis Leefstijlcheck"; `INTAKE_CTA`/`INTAKE_DELIVERABLE` dragen nog leefstijloverzicht-taal. Aparte, site-brede opruimronde.
- `/methodologie` (sectie Voortgang: "Kompas · Voortgang · Hermeting") is nog de oude uitleg.

## Aanvulling 7 oktober — terug naar hetzelfde dashboardscherm

De link "Hoe werkt dit dashboard?" in het Context-paneel neemt de huidige dashboard-URL mee als `?terug=` (`buildHoeWerktDashboardHref`). Op `/hoe-werkt-dashboard` vervangt dan een knop "← Dashboard" het kruisje (dat naar de homepage ging) en brengt je naar precies dat scherm terug. `parseDashboardReturnHref` laat alleen `/dashboard`-paden toe (geen open redirect). De browser-terugknop werkte al: tab, scherm, domein, onderdeel, dag en Patroon-stand staan in de URL.
Zonder `?terug=` (bookmark, inlogscherm, /methodologie) krijgt een ingelogde bezoeker (geldige `psf_account`-cookie) ook "← Dashboard", naar `/dashboard`; alleen een anonieme bezoeker houdt het kruisje naar de homepage.
Meetpunt: `dashboard_back_click` met `surface: "hoe_werkt_dashboard"` + Clarity `dashboard_back`.
