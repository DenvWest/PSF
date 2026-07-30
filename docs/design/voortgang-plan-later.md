# Voortgang — wat eruit ging en wat er moet bestaan voordat het terug mag

> Bij [`voortgang-statistieken-prebuild-v2.html`](voortgang-statistieken-prebuild-v2.html).
> v1 ([`voortgang-conversiekaart-prebuild-2026-07.html`](voortgang-conversiekaart-prebuild-2026-07.html))
> blijft als referentie staan en is niet gewijzigd.
>
> De regel achter bijna elk item hieronder: **Voortgang meet, Mijn Dag doet.** Alles wat
> afvinken, tellen of vooruitblikken is, hoort niet in een scherm dat "waar sta ik" moet
> beantwoorden. En: een ghost die je niet kunt bouwen is geen richting, maar ruis.

> **Voorkeur (30 jul 2026).** Dennis is over v1 — de conversiekaart (hero, stage-model,
> rail-inventaris) — tevredener dan over de niveau-herbouw van Statistieken in v2. Vervolgwerk
> op Voortgang begint dus bij het v1-compositiemodel als referentiepunt; v2's kruimelpad/
> accordeon-richting voor Statistieken is niet automatisch de volgende stap. Beweging heeft nu
> voorrang — dit is een parkeerpunt voor wanneer Voortgang weer oppakt, geen beslissing over de
> inhoud van v2 zelf.

---

## 1 · Trede 4 "In je omgeving"

**Wat het was.** De vierde trede van de leefstijl-ladder: biologische en lokale bronnen in je
omgeving, als paars-gestippelde ghost met een stem-knop (`dashboard_omgeving_interest_clicked`).

**Waarom eruit.** De ladder werd een accordeon met precies één open trede. Een vierde trede die
per definitie nooit open kan, is dan een permanent gesloten rij die alleen ruimte kost. De
inhoud was bovendien geen advies maar een idee: er zijn geen partners, geen prijzen, geen
voorraad, en geen verwerkingsgrondslag om er ooit iets mee te doen.

**Wat er eerst moet bestaan.** Een verwerkingsdoel voor locatie, een register-uitbreiding, een
privacytekst en aparte toestemming — plus minstens één partner met een echte bronnenlijst.
Aanknopingspunt in code: `src/lib/nutrition-season.ts` (lokaal en seizoen zijn hetzelfde
onderwerp; `FoodSource.seasonMonths` bestaat nu).

---

## 2 · Stage 5 "Beste" op de routekaart

**Wat het was.** De vijfde stage in de horizontale rail, met paars gestippeld laatste
lijnsegment en een `gh`-badge: later herbestellen en trouw blijven, gekoppeld aan je profiel.

**Waarom eruit.** v2 heeft geen routekaart meer op Statistieken — het kruimelpad is de
navigatie geworden. En een stage die "nog niet gebouwd, geen datum, geen koop-CTA" zegt, is
vijf keer per sessie dezelfde niet-mededeling.

**Wat er eerst moet bestaan.** Een gebruikerslijst van wat iemand slikt (zie item 3) plus een
herbestel-moment dat uit echte data volgt. Zonder die twee is "Beste" een lege stap.

---

## 3 · Rail-item "Wat je gebruikt"

**Wat het was.** Achtste rail-item met een `Ghost`-badge en een eigen paneel dat uitlegde wat
het níet is (geen winkelkoppeling, geen bestelgegevens, geen abonnement).

**Waarom eruit.** Een badge in de navigatie belooft dat er iets klaarstaat. Het item stond
naast vier werkende items en was niet van ze te onderscheiden zonder de badge te lezen. Het
staat nu als één regel op de pagina *Wat er nog niet is* — zie item 8.

**Wat er eerst moet bestaan.** Een tabel voor zelf ingevoerde middelen (naam, sinds wanneer,
hoeveelheid), een verwerkingsdoel en toestemming. Dit is ook de plek waar de sourcing-naad uit
deze ronde op uitkomt: `StepSourcing` met `kind:"product"` in
[`src/types/lifestyle-plan.ts`](../../src/types/lifestyle-plan.ts), en `ORDERING_ENABLED` in
[`src/lib/step-sourcing.ts`](../../src/lib/step-sourcing.ts) als de enige schakelaar.

---

## 4 · Ghost-checkpunt "Bloedwaarde · bestaat hier niet"

**Wat het was.** Een vierde punt op de checkpunten-rail in Over tijd, met een paars
lijnsegment ernaartoe (`--ghostat` werd in JS gezet omdat het aantal checks per state verschilt).

**Waarom eruit.** Het punt stond op een tijdlijn en suggereerde daarmee een moment in de tijd,
terwijl de eerlijke boodschap juist is dat een bloedwaarde er voor vier van de vijf stoffen
níet toe doet. De as klopte niet: dit is geen kwestie van wanneer, maar van of.

**Wat ervoor in de plaats kwam.** De inhoudelijke nuance per stof staat nu als tekst onder
"Wat deze stand harder zou maken" op niveau 3 · Stand, achter één disclosure — met de conclusie
erboven dat beter bijhouden voor alle vijf de goedkoopste stap omhoog is. Vitamine D (25(OH)D)
blijft de enige waar een prik echt iets toevoegt.

**Wat er eerst moet bestaan.** `bloed: { ok, why }` als getypeerd veld op `NutrientReference`
in [`src/data/nutrition/intake-reference.ts`](../../src/data/nutrition/intake-reference.ts) —
nu nog copy in de prebuild. Pas als dat data is, kan een UI hier iets mee doen.

---

## 5 · De 14-dots-strip in Advies

**Wat het was.** Veertien blokjes per gap-nutriënt met de dagen waarop de gekoppelde Mijn
Dag-actie aanstond, plus een teller ("9 van 14").

**Waarom eruit.** Dit is de meest zichtbare uiting van de grensvervaging: een gedragslogboek dat
in een meetscherm woonde. De strip stond in Voortgang én op Mijn Dag, en de gebruiker moest zelf
uitzoeken welke van de twee de waarheid was.

**Wat ervoor in de plaats kwam.** Eén leesregel op trede 1: *"Staat nu op Mijn Dag: een handvol
noten bij de lunch, 9 van 14 dagen →"* — een link, geen instrument. De strip zelf staat op
Mijn Dag, waar hij hoort.

**Wat er eerst moet bestaan.** Niets. Dit komt niet terug in Voortgang.

---

## 6 · De actiekaart met dagenteller, elke checkbox en elke toggle

**Wat het was.** `.nut-act` — een omkaderd blok per nutriënt met de gekoppelde actie, de
dagenteller en (in de bronnenlijst) aantikbare bronnen die direct aan/uit gingen.

**Waarom eruit.** Zelfde grens. Bovendien maakte "een bron aantikken" van elke lijstrij een
schakelaar, wat drie betekenissen op één rij legde: lezen, vergelijken en schrijven.

**Wat ervoor in de plaats kwam.** Advies heeft exact één schrijfactie — de primaire knop *"Zet
een bron op Mijn Dag"* — en exact één leesregel die naar Mijn Dag verwijst. De bronrijen zijn
weer leesbaar: naam, portie, waarde, balkje.

**Wat er eerst moet bestaan.** Niets. Dit komt niet terug in Voortgang.

---

## 7 · De spoor-pillen (zes pillen: Alle vijf + de vijf stoffen)

**Wat het was.** Een horizontale rij pillen boven de blik-tabs die de gedeelde stofselectie
vasthield over Stand/Advies/Over tijd heen, met een eigen sticky-gedrag op desktop.

**Waarom eruit.** Het idee klopte — één subject dat de drie blikken deelt — maar de vorm was een
tweede navigatie naast de blik-tabs, met een eigen sticky-hoogte (op mobiel 204px van een
667px-scherm) en een eigen leeg-staat-probleem. Het kruimelpad doet nu hetzelfde werk: het
*is* de selectie, en het draagt bovendien het niveau. Twee balken werden er één.

**Wat er eerst moet bestaan.** Niets. Het kruimelpad vervangt dit volledig.

---

## 8 · De vier "Nog in aanbouw"-rail-items met badges

**Wat het was.** Lichaamssamenstelling (`Vooruitblik`), Wearable koppelen (`Animo peilen`),
Begeleiding (`Wachtlijst`) en Wat je gebruikt (`Ghost`) als vier navigatie-items met elk een
eigen paneel en een eigen interesse- of wachtlijstknop.

**Waarom eruit.** Vier badges verspreid door de navigatie maken de hele navigatie onbetrouwbaar:
je moet elk item lezen om te weten of het bestaat. Bovendien telde de helft van die knoppen
"stemmen" die nergens naartoe gingen.

**Wat ervoor in de plaats kwam.** Eén regel onderaan de rail — *"Wat er nog niet is →"* — naar
één pagina die alle vier opsomt met waarom ze er niet zijn. Geen badges, geen knoppen, geen datum.

**Wat er eerst moet bestaan.** Per item iets echts: lengte/gewicht (lichaamssamenstelling), een
wearable-koppeling met partner (wearable), een product en een prijs (begeleiding), een tabel plus
toestemming (wat je gebruikt). De wachtlijst mag terug zodra er een product ís om op te wachten.

---

## 9 · De soort-chip op de bronrij (noten-zaden / groente / peulvrucht)

**Wat het was.** Een uppercase categoriechip rechts op elke voedingsbron, naast de waarde.

**Waarom eruit.** Naam plus portie zegt dat al. "Amandelen · 25 g" is geen puzzel die
"NOTEN-ZADEN" moet oplossen. Drie coderingen voor hetzelfde ding (naam, portie, categorie) op
één rij van 52px was de directe bron van de drukte in dat blok.

**Wat blijft.** Het seizoen-chipje — dat voegt wél informatie toe die niet uit de naam volgt.
De categorie zelf leeft nu als data in `FoodSource.portionGroup`
([`src/data/nutrition/food-sources.ts`](../../src/data/nutrition/food-sources.ts)), waar hij
nuttig is voor berekening, en niet meer als derde label in de UI.

---

## 10 · Zes zichtbare bronnen → drie

**Wat het was.** Zes bronnen zichtbaar per stof, de rest achter "Toon N bronnen meer".

**Waarom eruit.** Zes rijen van 52px is 312px voordat je bij de knop bent. Drie is genoeg om te
kúnnen kiezen — en dat is het hele doel van de lijst; hij is uitdrukkelijk geen dagtotaal.

**Wat er nu staat.** Drie bronnen plus één disclosure *"Meer bronnen (7)"*. De lijsten in
`FOOD_SOURCES` staan aflopend op hoeveelheid, zodat "de eerste drie" ook echt de sterkste drie
zijn; het meterbalkje normaliseert op de sterkste bron in de lijst.

---

## 11 · De scrub-liniaal in Over tijd

**Wat het was.** De bewijsband uit de v1-hero, verplaatst naar Statistieken → Over tijd: 30
dagen om met `pointerdown` doorheen te scrubben (`dashboard_voortgang_band_scrub`).

**Waarom eruit.** Scrubben is exploratie. Niveau 1 · Over tijd moet één vraag beantwoorden —
"beweegt het?" — en de cyclusliniaal is daar leesbaar genoeg voor. De liniaal staat er nog,
maar als `role="img"`: te lezen, niet aan te raken.

**Wat er eerst moet bestaan.** Een reden om per dag te kunnen inzoomen, dus dagelijkse data die
per dag iets betekent. Die is er niet: de banden komen uit weekfrequenties.

---

## 12 · De events `dashboard_statistieken_spoor_select` en `dashboard_statistieken_blik_switch`

**Wat ze waren.** `spoor_select {nutrient, blik}` op een spoor-pil; `blik_switch {to, nutrient}`
op een blik-tab.

**Waarom eruit.** Beide gingen uit van een platte selectie (welke stof) naast een blik. Het model
heeft nu een niveau erbij, en dat is precies wat je wilt kunnen aflezen: zakken mensen door naar
niveau 3, of blijven ze op niveau 1 hangen?

**Wat ervoor in de plaats kwam — volledig vervangend:**

| Event | Payload | Trigger |
|---|---|---|
| `dashboard_statistieken_niveau` | `{van, naar, object}` | kruimelpad-segment of lijstrij |
| `dashboard_statistieken_facet` | `{facet, object, niveau}` | blik-tab |
| `dashboard_advies_trede_open` | `{signaal, trede}` | accordeon-trede openen |
| `dashboard_bron_naar_mijndag` | `{signaal, bron}` | de enige primaire knop |
| `dashboard_bronnen_meer` | `{signaal, aantal}` | disclosure "Meer bronnen (N)" |

`object` is `"jij"`, een domein-id of een nutriënt-id — dezelfde sleutel op elk niveau, want het
is hetzelfde soort object. Bij implementatie: registreren in `src/lib/events.ts` +
`src/lib/intake-events-client.ts` + de allowlist in
`src/app/api/intake/events/route.ts`, en een GA4-annotatie zetten op het moment dat de twee oude
events stoppen.

---

## Verificatie van v2

Gemeten in een echte 375px-viewport (de pagina in een `<iframe width="375">`; Chrome
`--headless --window-size=375` rendert op ~500px en schaalt de screenshot, dus die methode is
niet bruikbaar):

- `window.innerWidth` = **375**, `document.documentElement.scrollWidth` = **375**,
  `document.body.scrollWidth` = **375** — geen horizontale overflow. De enige elementen die
  buiten de viewport uitsteken zitten in `#railstrip`, een bewuste `overflow-x:auto`-scroller.
- **Sticky-hoogte: 89px** (kruimelpad 44px + blik-tabs 45px), binnen het budget van 96px.
  Onder 900px pint alleen de blik-tabs; het kruimelpad scrollt mee, want welk object je bekijkt
  staat sowieso in elke kaartkop. Spoor en blik zijn siblings zónder wrapper — een sticky kind
  kan niet buiten zijn ouder blijven staan.
- **233 weergaven doorlopen** (5 states × alle bereikbare niveaus × 3 facetten, plus elke
  accordeon-trede, beide disclosures, de primaire knop en de zes panelen): geen console-fout,
  geen lege of kapotte weergave, nergens meer dan 7 kaarten, nergens meer dan 5 tikdoelen per
  kaart, elke kaart precies één `<h2>` met een eyebrow erboven, geen tikdoel onder 44×44px.
- **Ladder-invariant** over 60 renders: altijd precies één open trede, altijd precies één
  `.rungbody`, de twee gesloten treden zijn knoppen en de open trede is dat níet — hem sluiten
  zou nul treden open laten, en dat mag niet bestaan.
- **Spacing-schaal**: 0 margin/padding-waarden buiten `var(--s1)`–`var(--s7)` (en `0`), zowel in
  de CSS als in inline styles; geen enkele marge of padding wordt in JS gezet.
- In `wachtend` is niveau 3 onbereikbaar en toont niveau 2 · Voeding de voedingscheck-CTA —
  bevestigd door de harness, die daar expliciet "L3 onbereikbaar" rapporteert.

**Eén bewuste afwijking van v1.** De Google-Fonts-`<link>` is niet overgenomen: de opdracht
vraagt één zelfstandig bestand zonder CDN. DM Sans / DM Serif Display staan als eerste keuze in
de font-stack en vallen terug op systeemfonts. De gemeten 89px is dus met systeemfonts; met DM
Sans geladen kan dat een paar px schelen — `syncSticky()` herrekent bij `resize` en bij
`document.fonts.ready`, en logt de uitkomst naar de console en naar de prebuild-balk.
