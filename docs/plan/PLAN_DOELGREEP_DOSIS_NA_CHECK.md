# Doelgreep — de balk verleggen als dosiskeuze, niet als score

> **Status (26 jul 2026): vastgelegd, bouw uitgesteld tot stap 8** van de geconsolideerde bouwvolgorde (zie §6). Aanleiding: de vraag of de voortgangsbalk in Kompas dynamisch-interactief kan worden — dat iemand na de leefstijlcheck (in dit geval de beweegcheck) de balk zelf verschuift, en dat daar een tiny-habit-plan uit rolt.
> Antwoord in één zin: **ja, maar op de route-as, niet op de score-as** — en dat is geen nieuw concept maar de UI-vorm van lock 5 uit [`BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md`](./BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) §5.1.
> Verwant: [`PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md`](./PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md) (het doel als *narratief*; dit doc is dezelfde belofte als *keuze*), [`BEWEEG_COCKPIT_FUTURE_YOU.md`](./BEWEEG_COCKPIT_FUTURE_YOU.md) besluit 4 (nooit een tweede score).

---

## 0. De kern in drie zinnen

1. De gemeten balk blijft onaanraakbaar; er komt een **tweede greep op dezelfde balk**: "hier sta je" (afgeleid, hard) naast "hier wil je deze cyclus heen" (gekozen, zacht).
2. Die greep drukt **dosis** uit (weekfrequentie), nooit scorepunten — niemand heeft een mentaal model van "beweging 45 → 70", en een score-uitkomst beloven is een claim die we niet mogen maken.
3. Het is technisch bijna gratis: `weeklyFrequency` (`1x|2x|3x`) bestaat al in [`movement-plan-profile.ts:37-47`](../../src/lib/movement-plan-profile.ts#L37-L47). Nieuw is de *presentatie* (greep naast de gemeten stand), de **cap-regel** en het moment.

---

## 1. Waarom de score-as verboden blijft

De balken in [`LeefstijlKompas.tsx`](../../src/components/dashboard/kompas/LeefstijlKompas.tsx) tonen `metrics.currentScore` uit de engine (RULES_VERSION 1.4.0). Sleepbaar maken breekt drie dingen tegelijk:

| Wat breekt | Waar het zit |
|---|---|
| De hermeting wordt betekenisloos — "ben ik verbeterd of heb ik de balk versleept?" | deltalogica in [`kompas-home.ts:135-148`](../../src/lib/kompas-home.ts#L135-L148) |
| De evidence-lock uit de bewegingsanalyse: *minuten = evidence, nooit een tweede score*. Zelfrapportage via slider ís een tweede scorebron | `movement_session_log`, `BEWEEG_COCKPIT_FUTURE_YOU.md` besluit 4 |
| De positionering — een meter die je zelf opdraait is geen meting | "Consumentenbond van supplementen" |

Lock 5 zegt dit al in het algemeen, en dit doc is er de directe toepassing van:

| As | Wat het is | Wie schrijft |
|---|---|---|
| **Positie** — "hoe ver ben ik" | afgeleid feit | niemand — pure functie van (daily-log, routestructuur) |
| **Route** — "wat is mijn plan" | keuze | **alleen de gebruiker** |

De doelgreep is een route-schrijver. Daarmee is hij niet alleen toegestaan maar precies wat lock 5 voorschrijft: het systeem stelt voor, de gebruiker commit.

---

## 2. Waarom dit voor beweging juist sterk is

`getMovementTrack()` ([`movement-plan-track.ts:20`](../../src/lib/movement-plan-track.ts#L20)) leidt de track nu volledig af uit `MOV_STR`/`MOV_CARD` — dus uit wat iemand **kan**. De ontbrekende tweede as is wat iemand **wil**. Een greep is de goedkoopste manier om dat uit te vragen: geen extra vraagscherm, wél autonomie (het SDT-rapport onder [`PLAN_LEEFSTIJLCHECK_UITVOERING.md`](./PLAN_LEEFSTIJLCHECK_UITVOERING.md) wijst zelfgekozen doelmoeilijkheid aan als de sterkste hefboom op volhouden).

De winst zit dus niet in dataverrijking maar in **commitment**: het probleem met tiny habits is nooit welk gedrag, maar hoeveel iemand aandurft.

---

## 3. Het model — drie stops op een bestaande as

| Stop | `weeklyFrequency` | Week-dosis | Tiny habit die eruit rolt |
|---|---|---|---|
| Rustig | `1x` | 1× 10 min kracht + 2× wandelen | "Vandaag 10 min, thuis" |
| Opbouwen | `2x` | 2× 20 min + 2× zone 2 | "Vandaag kracht, 20 min" |
| Stevig | `3x` | 3× kracht + 2× zone 2 (30 min) | "Vandaag zone 2, 30 min" |

De balk toont drie lagen: **gemeten segment** (hard), **gekozen dosis** (greep), en een **vage projectiezone** erachter — een richting, geen belofte. Geen getal op de greep, geen voorspelde score.

De tiny habit is geen nieuw mechanisme: het is de bestaande `resolvePlanStepContent`-stap, alleen gekozen uit een dosis die de gebruiker heeft gecommit in plaats van puur afgeleid uit de checkantwoorden.

---

## 4. Plaatsing — een moment, geen permanent bedieningselement

- **Waar het gebeurt:** in de overgang check → plan, direct na de beweegcheck. *"Je staat hier. Hoe ver wil je deze 30 dagen komen?"* Daar zit de energie, en het levert meteen het plan.
- **Waar het daarna leeft:** als stil streepje op de kompasbalk ("jouw doel"), niet als sleepbaar element op Home. Zo houdt het Kompas zijn readout-rol (cockpit-besluit: Kompas = één rol, zie [`ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md`](./ANALYSE_DASHBOARD_HOME_EN_COCKPIT_IA.md)).
- **Waar het opnieuw gevraagd wordt:** per 30-dagen-cyclus, die al bestaat in [`kompas-home.ts:102-119`](../../src/lib/kompas-home.ts#L102-L119). Dat maakt de hermeting eindelijk een afrekening: *"je koos Opbouwen, je haalde 18 van 30 dagen, je beweegscore ging +6."*
- **Geen nieuwe editor.** De greep schrijft naar `MovementPlanProfilePatch` — hetzelfde pad als het bestaande profiel-sheet, conform stap 8 van de bouwvolgorde.

---

## 5. Twee risico's met hun mitigatie

1. **Overcommitment.** Sliders lokken te hoge keuzes uit (planning fallacy); week 1 faalt en de retentie is weg. **Cap op +1 stop boven de gemeten stand**; hogere stops zichtbaar maar `locked` — dat statustype bestaat al in [`movement-journey.ts:16`](../../src/lib/movement-journey.ts#L16). Copy: "we starten hier, volgende cyclus kun je verhogen." Nooit *"te ambitieus"* als oordeel terugkoppelen.
2. **Blind shippen.** Dit raakt de kernlus (check → plan → agenda), dus meten is verplicht in dezelfde wijziging. Nieuw event **`plan.dose_selected`** met `{ domain, chosenStop, measuredStop, wasCapped }` — registratie op de drie verplichte plekken (`src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`), naast het bestaande `movement.session_logged`. De afleesvraag: **haalratio per gekozen stop** bij hermeting. Werkt de greep, dan halen Opbouwen-kiezers een hoger dagenpercentage dan wie geen greep kreeg.

---

## 6. Waarom niet nu bouwen

Niet omdat het zwak is, maar omdat de dosis-stops **de routestructuur** zijn, en die krijgt zijn definitieve vorm in stappen 4-6 van de bouwvolgorde:

- **S2** (fase-as + fase-paneel) en **S3** (programma-kaart) bepalen hoe een route wordt getoond en waar de doorway zit.
- **S4** (veldsplitsing locatie/sport) raakt exact het profiel-veld waar de greep naartoe schrijft.

Een greep die nu op de huidige `getMovementTrack`-bands wordt gebouwd, is bij S3/S4 opnieuw werk — en de kans is groot dat er dan twee schrijvers naar dezelfde route ontstaan, precies de fragmentatie die lock 5 verbiedt.

**Plek in de volgorde: stap 8** — "klikbare/uitklapbare route-waypoints + *Jouw doel* met CTA naar het bestaande profiel-sheet". Daar is al een doel-element voorzien; dit doc vult in wát die CTA opent. Eerst afmaken wat loopt: leefstijlring Fase A-C en het doelnarratief (dat besluit staat al op "akkoord om te bouwen").

---

## 7. Besluiten (26 jul 2026)

1. **Doelgreep = dosis, nooit score.** De gemeten balk blijft onaanraakbaar in alle oppervlakken.
2. **Geen scorepunten op de greep**, geen voorspelde score-uitkomst — richting mag, belofte niet.
3. **Cap +1 stop** boven de gemeten stand; hogere stops zichtbaar maar vergrendeld.
4. **Eén moment na de check**, daarna een stille markering; herhaald per 30-dagen-cyclus.
5. **Geen nieuw datamodel** — `weeklyFrequency` + `MovementPlanProfilePatch` zijn de opslag. Geen migratie nodig.
6. **Bouw uitgesteld tot stap 8**, ná S2/S3/S4.

## 8. Open vragen

- Geldt de greep straks per domein of alleen voor beweging? Slaap/voeding hebben geen even natuurlijke dosis-as (frequentie is daar geen goede maat) — voorstel: beweging eerst, de rest pas als de haalratio bewijst dat het werkt.
- Wat gebeurt er bij een gemiste cyclus — greep automatisch terug naar de gemeten stand, of vasthouden? Voorstel: vasthouden en vragen, nooit stil verlagen (dat leest als straf).

*Opgesteld 26 juli 2026 n.a.v. de vraag of de Kompas-voortgangsbalk interactief kan worden. Verandert geen bestaande DEFER/FREEZE/KILL-status.*
