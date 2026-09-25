# Besluit — "Bekijk jouw voeding" / "Liever een supplement" per stof

**Datum:** 25 september 2026 (akkoord Dennis, herzien na conflict met `nutrition-route-choice.ts` — zie §8)
**Status:** besloten, gebouwd
**Vervolg op:** `BESLUIT_VOEDINGSCHECK_RESULTAAT_PER_STOF_2026-09.md` (per-stof-rijen, 24 sep)
**Aanleiding:** UX-review van `/intake?resultaten=true` — zie ook de teruggedraaide
EFSA-claim-guard hieronder in §5, die aan hetzelfde onderliggende punt raakte.

---

## 1. Het probleem

`resolveDoor()` in `nutrition-route-status.ts` opent de supplementdeur voor een
stof alleen in drie gevallen: `off_route` (opt-out, bijv. geen vis door dieet),
vitamine D in het donkere halfjaar, of `unmeasured`. Bij een gewone `below`/`near`-
status — "1× per dag eiwit" tegen een richtlijn van 3× — blijft de deur dicht
met de boodschap "dit kun je met je bord dichten".

Dat klopt zolang het bord ook echt haalbaar is. Maar iemand kan een structureel
laag eiwitpatroon hebben door tijd, geld of eetlust — niet door dieetkeuze. Voor
die persoon is "dit kun je met je bord dichten" een dooddoener: hij weet dat al,
en het is precies waarom hij een aanvulling overweegt. De huidige logica kent
maar één manier om de deur open te krijgen (een afgeleide dieetopt-out via
`preference`/`allergies`), en geen manier om een **voorkeur** te laten meewegen.

Eiwitpoeder is bovendien een bestaand, actief verkocht product
(`eiwitpoederData` als vergelijkingspagina, `eiwitpoeder` als geldige
`SupplementCategory`) — de deur dichthouden is dus geen productbeperking, het
is een aanname over wat iemand hoort te doen.

## 2. Wat dit niet is

**Geen EFSA-claim-kwestie.** Een eerdere poging voegde hier een guard toe die
`doorOpen` liet afhangen van `getUsableClaims()` — die twee dingen zijn
losstaand. Claims regelen of je een gezondheidsbewering ("draagt bij aan...")
mag tonen; de catalogus-link regelt of je naar een productoverzicht mag
verwijzen. Eiwit heeft geen EFSA-claim en wordt wél verkocht. Die guard is
teruggedraaid (25 sep) en komt niet terug op deze plek.

**Geen nieuwe vraag in de check zelf.** Een extra vraag per stof ("hoe wil je
dit dichten?") raakt de vragenset, de scoring en `RULES_VERSION` — een veel
groter en duurder stuk dan het probleem rechtvaardigt, en concurreert met de
lopende afspraak om de check op ~10-13 vragen te houden (§3.8 van het
voedingsfocus-besluit). Dit voorstel raakt de check niet.

## 3. Gebouwd: twee altijd-zichtbare knoppen, geen poort-uitzondering

Het oorspronkelijke voorstel (een keuze die de poort *opent*, zie de
doorgestreepte tekst die eerst hier stond) botste met een al bestaand,
onderbouwd besluit — zie §8. De uiteindelijke, gebouwde vorm omzeilt dat
conflict volledig door de poort-logica helemaal niet aan te raken:

Elke rij krijgt, direct onder "Jij nu"/"Richtlijn", twee knoppen die altijd
allebei zichtbaar en klikbaar zijn, ongeacht `doorOpen`:

- **"Bekijk jouw voeding →"** — naar het dagboek (`/dashboard?tab=vandaag`).
  Staat links, is de visueel primaire kleur (groen), en is de default-actie
  in de copy van de uitlegkop: voeding eerst.
- **"Liever een supplement →"** — naar `/supplementen?categorie=<stof>`, de
  productcatalogus van die stof. Staat rechts, secundaire (neutrale) kleur.
  **Dit is geen omweg om de poort** (`isRouteChoiceAllowed` in
  `nutrition-route-choice.ts` blijft ongewijzigd en blijft gelden voor het
  dashboard/Keuze-systeem) — het is gewoon altijd mogelijk om de catalogus te
  bekijken, wat via de generieke `/supplementen`-hub toch al kon.

Het bestaande, poort-afhankelijke "Supplement"-blok onderaan de rij
(`doorReasonNl` + knop bij `doorOpen`) blijft ongewijzigd bestaan — dat blijft
de plek die uitlegt *waarom* eten het niet dicht en het gat aantoonbaar
aanvulling nodig heeft. De onderste knop is verwijderd (was dubbel met de
nieuwe "Liever een supplement"); alleen de uitleg (`doorReasonNl`) blijft
staan.

Geen nieuwe database-kolom, geen persistentie van een voorkeur: de keuze is
gewoon een klik naar een bestemming, geen bewaarde staat.

## 4. Wat dit niet doet

- Geen `off_route`/vitamine-D-logica aanraken — die blijft zoals hij is,
  want die dekt een ander soort geval (het bord heeft structureel geen
  alternatief, niet "ik wil liever niet").
- Geen wijziging aan `resolveDoor()`, `resolveNutritionGate` of
  `isRouteChoiceAllowed` — de poort-logica en het dashboard-Keuze-systeem
  blijven precies zoals ze waren.
- Geen migratie, geen nieuwe kolom, geen persistentie van een keuze.
- `/beste/*` en de vergelijkingspagina's blijven ongemoeid.

## 5. Wat hier eerder misging (voor de volgende sessie)

25 september: een sessie bouwde een guard die `doorOpen` liet samenvallen met
`getUsableClaims()`, zonder dit voor te leggen. Eiwit heeft geen EFSA-claim en
zou daardoor nooit meer een supplementlink krijgen — terwijl eiwitpoeder gewoon
verkocht wordt. Teruggedraaid vóór merge (PR #36 gesloten, niet gemerged).
**Les: `doorOpen` gaat over "is dit een geldige productroute", nooit over "mag
ik hier een gezondheidsclaim tonen".** Die twee blijven gescheiden systemen.

## 6. Meetpunt

- **"Bekijk jouw voeding" klik:** GA4 `nutrition_result_dagboek_click`
  (surface `check_rij_actie`, nutrient) — hergebruikt het event uit de
  vorige stap (24-sep-PR #35), nieuwe surface om de knoppen te onderscheiden.
- **"Liever een supplement" klik:** GA4 `nutrition_supplement_vergelijk_click`
  (surface `check_rij_actie`, nutrient) — hergebruikt het bestaande event,
  zelfde reden.

## 7. Een uitlegkop onder de hero

`/intake?resultaten=true` kreeg ook een dichtgeklapte "Hoe werkt
PerfectSupplement?"-sectie direct onder de hero, vóór de per-stof-rijen. Legt
in drie zinnen uit: de check meet frequentie per stof, elke rij heeft de twee
knoppen (voeding eerst, supplement altijd als tweede optie), en dat EFSA-claims
alleen bepalen welke *tekst* over een product mag, niet of je een supplement
mag overwegen.

## 8. Wat hier eerder misging (voor de volgende sessie) — twee lessen

**Les 1 — EFSA-claims ≠ productroute.** 25 september: een sessie bouwde een
guard die `doorOpen` liet samenvallen met `getUsableClaims()`, zonder dit voor
te leggen. Eiwit heeft geen EFSA-claim en zou daardoor nooit meer een
supplementlink krijgen — terwijl eiwitpoeder gewoon verkocht wordt.
Teruggedraaid vóór merge (PR #36 gesloten, niet gemerged). **`doorOpen` gaat
over "is dit een geldige productroute", nooit over "mag ik hier een
gezondheidsclaim tonen".** Die twee blijven gescheiden systemen.

**Les 2 — er lag al een systeem met de tegenovergestelde regel.**
`nutrition-route-choice.ts` (dashboard, `NutrientRouteChoiceCard` op laag 5)
bestond al vóór dit besluit en legt vast: `isRouteChoiceAllowed()` staat
"potje"/"beide" alleen toe als de poort al open is, met expliciete
onderbouwing *"anders is de keuzeknop een omweg om de laag-6-poort heen"*. Het
oorspronkelijke voorstel in dit document (§3, eerste versie) zou die deur juist
hebben willen opzetten op basis van een gebruikerskeuze — een direct conflict
dat pas opviel tijdens de bouw, niet tijdens het eerste akkoord.

**Wat dit conflict oploste:** in plaats van de poort-logica te wijzigen (en zo
`isRouteChoiceAllowed`'s onderbouwing tegen te spreken), krijgt elke rij een
tweede, altijd-beschikbare knoop naar de catalogus die *los* staat van de
poort — zie §3. Dat behoudt de poort-regel voor het dashboard/Keuze-systeem
volledig intact en lost het oorspronkelijke probleem (eiwit met "1× per dag"
kreeg nooit een link) toch op.

**Les voor de volgende sessie:** vóór je een deur-/poortregel wijzigt, grep op
`isRouteChoiceAllowed`, `resolveDoor`, `supplementDoorOpen` en
`resolveNutritionGate` — er kunnen meerdere plekken zijn die dezelfde regel op
een net andere manier vastleggen.
