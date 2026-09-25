# Voorstel — supplementvoorkeur per stof op het resultaat

**Datum:** 25 september 2026
**Status:** voorstel, wacht op akkoord Dennis vóór bouw
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

## 3. Voorstel: een voorkeur op het resultaat, niet in de check

Op elke rij waar de deur nu dicht is *om een reden die met eten te dichten
heet te zijn* (dus `status` is `below`/`near`/`gap`, niet `covered`,
`off_route` of `unmeasured`), krijgt de rij een kleine, secundaire vraag onder
"Wat je doet":

> Lukt dit via je bord, of wil je liever ook een supplement erbij?
> [ Via mijn bord ] [ Liever ook een supplement ]

- **Default = "Via mijn bord"** (geen wijziging als niemand klikt) — de
  bord-eerst-volgorde uit het 24-sep-besluit blijft de norm, dit is een
  uitzondering die de gebruiker zelf aanvraagt, niet iets wat we aanbieden.
- Kiest iemand **"Liever ook een supplement"**, dan opent de deur voor die
  stof en verschijnt de "Jij nu"-supplementlink, met een aangepaste
  `doorReasonNl` ("Je gaf aan dat een supplement je beter uitkomt.") in plaats
  van de automatische reden.
- De keuze wordt onthouden in `intake_intake_log.raw_inputs` (nieuw veld
  `supplementPreference: Record<NutrientId, boolean>`, jsonb — **geen
  migratie nodig**, dezelfde kolom draagt al `preference`/`allergies`) zodat
  hij bij een volgende check-weergave (herladen via `?resultaten=true`)
  intact blijft, net als de sliders nu al herstellen.
- Zonder account (`fromDashboard === false`, geen sessie om op te slaan)
  blijft de keuze client-side (React state) voor de duur van dat bezoek — geen
  localStorage (CLAUDE.md: "Geen localStorage — alles via Supabase"), dus hij
  gaat verloren bij een refresh. Dat is acceptabel: wie zonder account komt
  krijgt sowieso geen historie.

## 4. Wat dit niet doet

- Geen `off_route`/vitamine-D-logica aanraken — die blijft zoals hij is,
  want die dekt een ander soort geval (het bord heeft structureel geen
  alternatief, niet "ik wil liever niet").
- Geen migratie.
- Geen wijziging aan `resolveNutritionGate` (de check-brede poort) — dit werkt
  alleen op de per-stof-deur binnen een al open poort.
- `/beste/*` en de vergelijkingspagina's blijven ongemoeid.

## 5. Wat hier eerder misging (voor de volgende sessie)

25 september: een sessie bouwde een guard die `doorOpen` liet samenvallen met
`getUsableClaims()`, zonder dit voor te leggen. Eiwit heeft geen EFSA-claim en
zou daardoor nooit meer een supplementlink krijgen — terwijl eiwitpoeder gewoon
verkocht wordt. Teruggedraaid vóór merge (PR #36 gesloten, niet gemerged).
**Les: `doorOpen` gaat over "is dit een geldige productroute", nooit over "mag
ik hier een gezondheidsclaim tonen".** Die twee blijven gescheiden systemen.

## 6. Meetpunt (bij bouw)

- Klik op "Liever ook een supplement": GA4 `nutrition_result_supplement_preference_set`
  (nutrient, surface: `check_rij`)
- Hergebruikt de bestaande `nutrition_supplement_vergelijk_click` zodra de
  deur via deze weg opengaat — geen nieuw klik-event nodig, `doorReasonNl`
  in de payload maakt het onderscheid al zichtbaar in analyse.

## 7. Openstaand — vraagt Dennis' akkoord vóór bouw

- Tekst van de twee knoppen ("Via mijn bord" / "Liever ook een supplement")
  — voorstel, geen definitieve copy.
- Geldt dit voor alle stoffen met `below`/`near`/`gap`, of expliciet niet voor
  vitamine D (waar het bord sowieso beperkt is en de zon-uitzondering al een
  andere route heeft)?
- Zichtbaar voor iedereen, of pas na de eerste keer scrollen/openen van de rij
  (voorkomt dat de rij nog voller oogt bovenaan)?
