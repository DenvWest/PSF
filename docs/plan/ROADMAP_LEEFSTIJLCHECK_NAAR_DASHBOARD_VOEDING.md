# Roadmap: van Leefstijlcheck naar Dashboard — het voedingsdomein als blauwdruk

**Datum:** 3 september 2026
**Status:** besluitvoorstel, nog niet gebouwd
**Scope:** de doorstroom Leefstijlcheck → Kompas → Voedingcheck → Voortgang → Agenda → Keuze-opties, met voeding als eerste domein dat hem volledig doorloopt.

---

## 0 · De vier lagen, en waarom de scheiding ertoe doet

De strakke scheiding uit de opdracht is juist, en hij is scherper dan de scheiding die er nu feitelijk in de code zit:

| Laag | Centrale vraag | Output | Mag NIET doen |
|---|---|---|---|
| **Leefstijlcheck** | Hoe staat voeding ervoor? | Signaal/score per domein | Anamnese worden |
| **Kompas** | Waar moet ik als eerste naartoe? | 1–3 prioriteiten + één waarom | Analyse tonen |
| **Voedingcheck** | Waar zit het precies? | Voedingsprofiel | Interventies aanbieden |
| **Voortgang** | Hoe ontwikkel ik? | Ladder basis → kwaliteit → verhouding → analyse → aanvullen | Opnieuw diagnosticeren |
| **Agenda** | Wat ga ik doen? | Actie + moment + frequentie | Vertellen wat er mis is |
| **Keuze-opties** | Welke aanpak past bij mij? | Interventies/producten/begeleiding | Onderdeel van de diagnose zijn |

De rechterkolom is de belangrijkste. Elke laag die de taak van een andere laag overneemt, maakt de hele keten onbetrouwbaar — dat is precies het patroon dat nu op drie plekken zit (§2).

**Eén regel die alles eronder draagt:** *diagnose en interventie mogen elkaar nooit raken.* Eerst vaststellen wat er aan de hand is, dan pas wat je eraan kunt doen. Dat is niet alleen productlogica maar ook compliance-logica: zodra een keuze-optie in de diagnose zit, wordt de diagnose een verkoopargument.

---

## 1 · Wat er nu al staat (geverifieerd in de repo)

Niet klein. De meeste bouwstenen bestaan al; het probleem zit in de *naden*, niet in de onderdelen.

**Leefstijlcheck** — `src/data/intake-questions.ts`, 27 vragen over 7 categorieën. Voeding heeft er **twee**: `NUT_O3` (vette vis) en `NUT_PROT` (eiwit per maaltijd, met `NUT_PROT_UNKNOWN`-sentinel).

**Voedingcheck** — `src/data/nutrition/lifescore-questions.ts`, 439 regels: 11 sliders (`vegetables`, `fruit`, `berries`, `nutsSeedsLegumes`, `oilyFish`, `proteinMeals`, `meatLegumes`, `dairy`, `daylight`, `wholegrain`, `sugaryDrinks`, `ultraProcessed`) plus twee meta-vragen (`allergies`, `preference`) met opt-outs.

**Ladder/Voortgang** — `src/lib/nutrition-ladder.ts` is volwassen werk: feitenrijen per laag, plant-equivalentie (§D3), opt-out ≠ nul (§H), `own`-status waar geen norm is, `resolveNutritionFocusLayer`, `resolveNutritionGate`, dekkingsnoemer 3 (niet 6). De zes lagen staan in `src/data/nutrition/lifestyle-pyramid.ts` — en die zijn al **exact** de ladder uit de opdracht:

| Opdracht | Repo (`NUTRITION_LAYERS`) |
|---|---|
| 1. Basisvoeding | `eetbasis` — "Voedingsbasis" |
| 2. Basiskwaliteit | `voedingskwaliteit` |
| 3. Basisverhouding | `verhoudingen` |
| (4. situatie) | `situatie` — read-only |
| 4. Meten & analyseren | `meten-timing` |
| 5. Aanvullen | `aanvullen` — gated |

**Kompas** — `src/lib/nutrition-kompas-samenvatting.ts` levert een tweeluik: `aandacht` (uit de check) en `open` (nog te kiezen), plus `focusLayer`, `gateOpen`, `statusLine`.

**Keuze-opties** — de poort (`resolveNutritionGate`) is al streng en goed geformuleerd: laag 1–2 mag geen `below` meer hebben, én er moet een restsignaal zijn.

---

## 2 · De drie echte breuken

### Breuk 1 — Agenda is niet aangesloten op voeding (de ernstigste)

Grep-uitkomst: `agenda_blocks` / "Zet op Mijn Dag" komt voor in `LadderMomentButton.tsx`, `DomainKompasScreen`, `PrioriteitenLadder`, `NutritionResultView` — maar **geen enkel voedings-component in `src/components/nutrition/` of `src/components/dashboard/voortgang/Nutrient*` schrijft een agendablok.** De hele voedingsketen eindigt bij "hier is je profiel en je keuze-optie".

Dat betekent: laag 3 van de vier ontbreekt. De check signaleert, het Kompas prioriteert, Voortgang meet — maar er wordt nooit gedrag van gemaakt. Dat is óók de reden waarom het domein nu naar supplementen neigt: de enige handeling die het systeem aanbiedt ná de diagnose is de poort naar laag 6.

`NUTRITION_PRIORITY_LAYERS` draagt al drie concrete `actions` per laag ("Zet één portie groente bij je avondeten", "Vervang één zoet drankmoment per dag door water of thee"). Die zijn geschreven als agenda-acties en worden nergens als agenda-actie aangeboden. Het dichtstbijzijnde bestaande patroon is de beweging-naad uit `[[psf-ladder-moment-agenda]]`: favoriet-id `laag-<domein>-p<n>-<slug>`, match op categorie+titel, datum+tijd zonder herhaling.

### Breuk 2 — Kompas toont een telling, geen prioriteit

`buildNutritionKompasSamenvatting` geeft `aandacht: 3, open: 2, focusLayer: 1`. Dat is een *stand*, niet een antwoord op "waar moet ik als eerste naartoe?". De opdracht vraagt om maximaal 1–3 benoemde prioriteiten met één waarom-regel:

> **Jouw focus** — Basisvoeding versterken · Eiwit en vezels beter verdelen · Supplementen kritisch bekijken
> *Waarom: je basis is aanwezig, maar kwaliteit en verdeling bieden de meeste ruimte.*

De data hiervoor bestaat volledig: `buildNutritionFactRows` geeft per rij `label`, `status`, `whyLine`, `layer`. Er is geen nieuwe meting nodig — alleen een **selectie- en formuleringslaag** bovenop de bestaande rijen. Dat is een klein, goed afgebakend stuk werk met grote opbrengst.

### Breuk 3 — de trechter is er niet; iedereen krijgt alle 11 sliders

De Voedingcheck is nu één vaste vragenlijst. De opdracht wil hem als *verdiepingslaag*: gericht doorvragen op wat de leefstijlcheck als aandachtspunt aanmerkte. Nu vult iemand met een perfect eetpatroon evenveel in als iemand met alleen een eiwitverdelingsprobleem.

Het onderliggende probleem: **de leefstijlcheck meet met twee vragen te weinig om te kunnen trechteren.** Met alleen `NUT_O3` en `NUT_PROT` kun je niet bepalen of iemand een kwaliteits-, structuur- of verhoudingsprobleem heeft. De trechter vereist dus eerst §3.

---

## 3 · Laag 1 — wat de Leefstijlcheck over voeding moet vragen

**Uitgangspunt: van 2 naar 5 vragen, niet meer.** Elke extra vraag in de leefstijlcheck kost conversie op de plek waar die het duurst is. Vijf vragen is genoeg om te classificeren *en* om te trechteren; het is niet genoeg om een profiel te maken, en dat hoeft ook niet.

De opdracht noemt zeven onderwerpen (eetpatroon, kwaliteit, balans, omgeving/gedrag, hydratatie, aandachtspunten, supplementen). Die passen niet in vijf vragen — dus hier is de weging. Het criterium: **welke vraag verandert de trechter?** Een vraag die niet bepaalt welke Voedingcheck-module iemand krijgt, hoort niet in de leefstijlcheck.

| # | ID | Vraag | Meet | Trechtert naar |
|---|---|---|---|---|
| 1 | `NUT_STRUCT` *(nieuw)* | Eet je op regelmatige momenten, of schuift het per dag? | Eetstructuur | Module A (eetstructuur) |
| 2 | `NUT_QUAL` *(nieuw)* | Hoe vaak bestaat je maaltijd grotendeels uit onbewerkte producten? | Kwaliteit | Module B (voedingsmiddelgroepen) |
| 3 | `NUT_PROT` *(bestaand)* | Flinke portie eiwit per maaltijd | Verhouding | Module C (verhoudingen) |
| 4 | `NUT_O3` *(bestaand)* | Vette vis | Bronnen | Module B + laag 6-signaal |
| 5 | `NUT_CONTEXT` *(nieuw, meerkeuze)* | Speelt er iets dat je eetpatroon bepaalt? (vegetarisch/vegan · intolerantie · afvallen/aankomen · medicatie · niets) | Situatie | Module D + skip-logica + **doorverwijzing** |

**Wat bewust NIET in de leefstijlcheck komt:**

- **Hydratatie.** Zwak signaal, hoge ruis (iedereen overschat), en het verandert de trechter niet. Hoort in Voedingcheck-module A.
- **Emotioneel eten / snacken.** Gedragsvragen hebben context nodig om niet beschuldigend te lezen — in een 27-vragen-check zonder opbouw wordt dat een oordeel. Module A.
- **Alcohol.** Verdient een eigen behandeling (raakt slaap, lever, energie), niet een halve vraag in het voedingsdomein.
- **Supplementen als losse leefstijlcheck-vraag.** De opdracht wil hem hier compact meenemen. **Ik raad dat af, met één uitzondering.** Reden: de leefstijlcheck bepaalt de *richting*, en supplementgebruik is geen richting — het is een bestaande interventie. Hem hier uitvragen zet supplementen naast voeding in plaats van eronder, en dat is precies wat de ladder (laag 6, gated) wil voorkomen. Bovendien: de meting is waardeloos zonder dosering en reden, en die passen niet in de leefstijlcheck.
  **De uitzondering:** `NUT_CONTEXT` vangt de medicatie-optie op. Dat is het enige stukje supplement-context dat vóór de Voedingcheck moet landen, omdat het een doorverwijzing kan triggeren (§6).

**Score-invariant.** Nieuwe items betekent `RULES_VERSION` ophogen en de hermeting-deltagrens meebewegen — dat is precies waar bij S3 drie P1-bugs zaten (`[[psf-leefstijlcheck-herziening]]`). Het voedingsdomein telt nu twee items; naar vijf verandert de domeinscore-schaal. **Dit is de duurste consequentie van §3 en de reden dat het geen losse quick win is.**

**Uitkomst-copy (opdracht overgenomen, in projectstem):**

> **Voeding — aandachtspunt**
> Je basisvoeding lijkt redelijk, maar vooral de kwaliteit en verhouding kunnen beter. Je grootste kans ligt nu bij meer volwaardige producten en voldoende eiwit verdeeld over de dag.

Feit eerst, dan de actie — conform `[[psf-leefstijlcheck-copy-stijl]]`.

---

## 4 · Laag 2 — Kompas: van telling naar 1–3 prioriteiten

**Nieuwe module: `src/lib/nutrition-prioriteiten.ts`.**

```
buildNutritionPriorities(rows: NutritionFactRow[]): {
  priorities: { label: string; layer: NutritionLadderLayerId; source: NutritionFactRowKey }[]  // max 3
  why: string
}
```

**Selectieregels:**

1. Neem de winst-laag uit `resolveNutritionFocusLayer` — die levert prioriteit 1.
2. Vul aan met `below`-rijen uit lagere lagen (die tellen nog mee, zie `resolveNutritionLayerStates`).
3. Vul zo nodig aan met `near`-rijen uit de winst-laag.
4. Stop bij 3. Bij minder dan 3 échte signalen: toon minder — **nooit opvullen.** Een derde prioriteit die er niet is, maakt de eerste twee minder waard.
5. Rijen met status `own` of exemption `opt-out` komen **nooit** in de prioriteitenlijst. Dat is geen tekort, dat is een andere route.

**Formulering:** prioriteiten zijn richtingen, geen acties. "Basisvoeding versterken", niet "Eet meer groente" — dat laatste is Agenda's werk. De `whyLine` per rij levert het materiaal voor de gezamenlijke waarom-regel.

**Waar het landt:** `NutritionKompasTweeluik.tsx` krijgt een derde element bóven de twee tellingen. De tellingen blijven — ze beantwoorden "hoeveel staat er open", de prioriteiten beantwoorden "waar begin ik". Dat is niet dezelfde vraag.

**Meetpunt:** `nutrition.kompas_priorities_viewed` (aantal + focusLayer) en `nutrition.kompas_priority_clicked` (welke). De tweede is de belangrijke: hij zegt of prioriteiten daadwerkelijk de deur naar Agenda zijn.

---

## 5 · Laag 3 — Agenda: de ontbrekende schakel

Dit is de grootste opbrengst per bouwuur in de hele roadmap, omdat de keten er nu letterlijk ophoudt.

**Contract:**

- Elke prioriteit uit §4 draagt 1–3 concrete acties. `NUTRITION_PRIORITY_LAYERS[n].actions` levert die al voor laag 1–3; laag 4–6 heeft ze bewust niet (en hoort ze niet te krijgen).
- Een actie krijgt de bestaande naad: `LadderMomentButton` → `agenda_blocks` met datum+tijd, geen herhaling, match op categorie+titel.
- Favoriet-id volgt de bestaande conventie: `laag-voeding-p<n>-<slug>`.
- Agenda-categorie: bestaand, uit `src/data/agenda/categories.ts`.

**Frequentie.** De opdracht noemt "Deze week"-acties met een dagritme ("2 porties fruit"). De bestaande agenda-naad schrijft bewust **geen herhaling** (`[[psf-ladder-moment-agenda]]`). Ik zou die keuze hier niet omgooien voor voeding alleen — een herhalend blok dat je vijf dagen niet afvinkt, is een schuldgenerator. In plaats daarvan: **één blok, één moment**, en het reflectiemoment (hieronder) draagt de weekvraag.

**Reflectiemoment.** De opdracht wil "Zondag: hoe ging dit op 5 van de 7 dagen?". Dat is goed, en het is precies de brug terug naar Voortgang. Maar let op: dit is een *zelfrapportage*, geen meting — het mag nooit de voedingsscore raken. Het hoort in de tijdlaag (`src/lib/nutrition-tijdlaag.ts`), naast de eigen reeks, niet in `nutrition-score.ts`. Compliance-regel uit `[[psf-cyclus-reflectiebord]]`: geen LLM per moment.

**Meetpunt:** `nutrition.agenda_action_planned` (welke prioriteit, welke actie) en `nutrition.agenda_action_completed`. Het verschil tussen die twee is de enige eerlijke maat voor of dit domein gedrag oplevert.

---

## 6 · Laag 4 — Voedingcheck als trechter, niet als vragenlijst

**Modulaire opbouw.** De 11 bestaande sliders worden verdeeld over modules; de leefstijlcheck bepaalt welke je krijgt.

| Module | Inhoud | Getriggerd door |
|---|---|---|
| **A · Eetstructuur** | eetmomenten, regelmaat, ontbijt/lunch/avond, tussendoortjes, buiten de deur, hydratatie, snacken/gemak | `NUT_STRUCT` laag |
| **B · Voedingsmiddelgroepen** | de 11 bestaande sliders | `NUT_QUAL` of `NUT_O3` laag |
| **C · Verhoudingen** | `proteinMeals` + eiwitdoel-berekening, vezels, vetkwaliteit | `NUT_PROT` laag |
| **D · Situatie** | `preference`, `allergies`, doel, medicatie | `NUT_CONTEXT` ≠ "niets" |
| **E · Supplementen** | zie hieronder | altijd optioneel aanbieden |

**Voedingsmiddelgroepen, niet losse voedingsmiddelen** — dat is de bestaande opzet en die is juist. De opdrachtlijst (groente, fruit, volkoren, peulvruchten, noten/zaden, zuivel, eieren, vis, vlees/vervangers, vetten/oliën, aardappelen/rijst/pasta, dranken, sterk bewerkt) dekt drie groepen die nu ontbreken: **eieren**, **vetten/oliën**, **aardappelen/rijst/pasta**. Van die drie zou ik alleen **vetten/oliën** toevoegen — dat is een echte kwaliteitsknop (verzadigd vs. onverzadigd) met een NL-richtlijn erachter. Eieren zitten praktisch al in `proteinMeals`; zetmeel-bijgerechten hebben geen bruikbare norm en leveren een rij zonder oordeel op.

**Minimum-set.** Iemand zonder aandachtspunten krijgt niet nul modules — dat maakt de check waardeloos als nulmeting. Voorstel: **module B blijft altijd verplicht** (het is de basis van de ladder), de rest is voorwaardelijk. Dat brengt de mediane check van 13 naar ~8 vragen, en de zware variant naar ~25.

**Supplementen (module E).** Hier volg ik de opdracht wél volledig: aparte laag, met per supplement wat · waarom · hoeveel · hoe vaak · op basis waarvan (eigen keuze / advies professional / bloedonderzoek / anders). Beoordeling in vier klassen: *relevant · mogelijk relevant · waarschijnlijk niet nodig · nader beoordelen*.

**Twee harde regels op module E:**

1. **Supplementgebruik mag de voedingsscore niet raken.** Niet omhoog, niet omlaag. Dit is de "je gebruikt X dus je voeding is goed"-fout, en de bestaande architectuur voorkomt hem al (score komt uit sliders). Bij implementatie: geen supplement-veld in `nutrition-score.ts`.
2. **Bij hoge doseringen, medicatie of een medische situatie → geen oordeel, wel een doorverwijzing.** Klasse "nader beoordelen" is geen tussenoordeel maar een stop. Dit sluit aan op de bestaande compliance-lijn ("adviezen, geen diagnoses") en op `[[psf-evidence-audit-leefstijlcheck]]`.

**Waar dit met de poort botst — en hoe het oplost.** `resolveNutritionGate` houdt laag 6 dicht zolang laag 1–2 een `below` heeft. Iemand die *al* supplementen gebruikt en een gat op laag 1 heeft, krijgt dan een module E die zijn gebruik beoordeelt achter een dichte poort. Dat is geen conflict maar de juiste volgorde: **module E beoordeelt wat je al doet (diagnose), de poort bepaalt of we iets nieuws voorstellen (interventie).** Die twee moeten in de UI zichtbaar uit elkaar liggen — anders leest een dichte poort als "je supplement is fout".

---

## 7 · De trechter als geheel

```
Leefstijlcheck   →  5 vragen  →  signaal + score + moduleselectie
      ↓
Kompas           →  1–3 prioriteiten + één waarom
      ↓
Voedingcheck     →  alleen de modules die je prioriteiten raken  →  voedingsprofiel
      ↓
Voortgang        →  ladder 1-2-3 beoordeeld, 4 read-only, 5 tijdlaag, 6 gated
      ↓
Agenda           →  acties + momenten uit je prioriteiten
      ↓
Keuze-opties     →  pas ná de poort, nooit in de diagnose
```

Twee dingen die deze keten afdwingt en die nu niet afgedwongen zijn:

- **Voortgang mag niet opnieuw diagnosticeren.** De ladder toont de uitkomst van de check, niet een tweede beoordeling. Dat is nu goed geregeld (`buildNutritionFactRows` is de enige bron), en moet zo blijven als module E erbij komt.
- **Keuze-opties zijn geen laag maar een deur.** Ze horen achter de poort, en de poort zit ná Voortgang. Dat staat al goed in `resolveNutritionGate` — de roadmap moet die strengheid niet verwateren als er meer modules komen.

---

## 8 · Bouwvolgorde

Gesorteerd op opbrengst per bouwuur, niet op logische volgorde.

**Plak 1 — Kompas-prioriteiten** (klein, geen migratie, geen score-wijziging)
`nutrition-prioriteiten.ts` + inhaken in `NutritionKompasTweeluik`. Werkt op de data die er al is. Dit is de goedkoopste plak met het duidelijkst zichtbare effect.

**Plak 2 — Agenda-naad voor voeding** (middel, hergebruikt bestaande naad)
`LadderMomentButton` aansluiten op `NUTRITION_PRIORITY_LAYERS[n].actions`, favoriet-id-conventie volgen, meetpunten erbij. Hiermee is de vierlagen-keten voor het eerst compleet.

**Plak 3 — reflectiemoment in de tijdlaag** (klein)
Weekvraag naast de eigen reeks, buiten de score.

**Plak 4 — leefstijlcheck van 2 naar 5 vragen** (groot, raakt `RULES_VERSION`)
Inclusief hermeting-deltagrens en de tests die bij S3 de drie P1-bugs vonden. Niet tegelijk met plak 1–3.

**Plak 5 — Voedingcheck modulariseren** (groot, hangt van plak 4 af)
Moduleselectie kan pas als de leefstijlcheck genoeg meet om op te trechteren.

**Plak 6 — module E, supplementencheck** (middel, hoogste compliance-risico)
Als laatste, want hij vereist de doorverwijslogica uit plak 4 (`NUT_CONTEXT`) en hij moet strikt gescheiden blijven van de poort.

---

## 9 · Wat ik niet zou doen

- **Hydratatie, alcohol en emotioneel eten in de leefstijlcheck.** Ze trechteren niet, ze kosten conversie, en ze horen in module A.
- **Supplementen als losse leefstijlcheck-vraag.** Zet supplementen naast voeding in plaats van eronder; ondermijnt de gated laag 6.
- **Herhalende agendablokken voor voeding.** Wijkt af van de bestaande naad en produceert schuld bij niet-afvinken.
- **De 11 sliders uitbreiden naar de volledige opdrachtlijst.** Eieren en zetmeel leveren rijen zonder oordeel op; alleen vetten/oliën verdient een plek.
- **Alle zes plakken tegelijk.** Plak 4 raakt de score-invariant; die verdient een eigen hermeting-testronde.

---

## 10 · Besluiten na review (3 sep) — de negen punten uitgewerkt

### 10.1 · Zesde vraag: het doel

**Akkoord met vijf, plus een zesde: `NUT_DOEL`.** Die verdient zijn plek, maar om een andere reden dan de andere vijf: hij trechtert niet, hij **kadert**.

De vijf vragen uit §3 bepalen *welke modules* je krijgt. Het doel bepaalt *hoe de uitkomst leest*. Dezelfde `below` op eiwitritme betekent iets anders voor iemand die spiermassa wil behouden dan voor iemand die wil afvallen — de meting is identiek, de prioriteitsvolgorde niet.

Dit sluit direct aan op het bestaande ijkpunt-werk (`[[psf-eigen-ijkpunt-doel]]`, `PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md`): situatie-enum + eigen woorden + 0–10 per check. **Gebruik die structuur, verzin geen tweede.** Concreet in de leefstijlcheck alleen de enum-helft; de eigen woorden en de 0–10 horen bij de Voedingcheck, niet bij een 27-vragen-check.

| ID | Vraag | Vorm |
|---|---|---|
| `NUT_DOEL` | Waar wil je met je voeding naartoe? | enum: energie overdag · gewicht omlaag · spier/kracht behouden · algemeen gezonder · klachten verminderen · weet ik nog niet |

"Weet ik nog niet" is een volwaardig antwoord, geen skip. Wie dat kiest krijgt de neutrale prioriteitsvolgorde (laagste laag eerst) — dat is de bestaande `resolveNutritionFocusLayer`, en die is prima als default.

**Wat het doel wél mag en niet mag.** Het mag de *volgorde* van prioriteiten kleuren en de copy kiezen. Het mag **nooit** de meting of de score veranderen — anders krijgt iemand die "gewicht omlaag" kiest een andere voedingsscore bij hetzelfde eetpatroon, en dan is de score geen meting meer. Zelfde regel als bij supplementen (§6).

**"Klachten verminderen" is de doorverwijs-trigger.** Samen met de medicatie-optie uit `NUT_CONTEXT` is dat het signaal dat iemand buiten wat een leefstijlcheck kan beoordelen valt.

### 10.2 · Doorverwijzing nu, behandelaar later — en de multitenant-vraag

Je stelt de goede vraag, en het antwoord bestaat uit twee delen die je uit elkaar moet houden.

**Nu (2026): doorverwijzen is een uitgang, geen feature.** `NUT_CONTEXT` = medicatie of `NUT_DOEL` = klachten → de check geeft geen oordeel op dat punt en zegt waarom. Geen doorverwijsnetwerk, geen partnerlijst, geen intake voor een behandelaar. Dat is één copy-blok en een status-uitzondering in de ladder. Kosten: klein. Compliance-winst: groot.

**Later: multitenant met een medische/niet-medische scheiding.** Dit is een reële richting, en de architectuur staat er beter voor dan je misschien denkt — `intake_sessions` heeft al een `organization_id`, en de `pd_*`/`af_*`-families zijn al service-role-only gebouwd. Maar drie dingen moeten hard zijn vóórdat een behandelaar meekijkt:

1. **De grens medisch/niet-medisch is geen instelling maar een aparte verwerkingsgrondslag.** Zodra een behandelaar gezondheidsgegevens van een cliënt inziet, is dat bijzondere persoonsgegevens onder AVG art. 9 — andere grondslag, andere bewaartermijn, andere DPIA. Dat is niet "een poort openzetten"; dat is een tweede product met een eigen juridische huid.
2. **Mono-tenant blijft de bouwstand.** De `organization_id`-naad houden we nullable en ongebruikt, precies zoals de `account_id`-naad in `af_*` (`[[psf-affiliate-automatisering]]`). Naad reserveren ≠ multitenant bouwen.
3. **De DPIA (`[[psf-compliance-status]]`) moet dit expliciet dekken** vóór de eerste behandelaar. §0/§6 zijn al gefixt maar gaan over de consumentenkant.

**Concreet voor deze roadmap:** neem de doorverwijs-uitgang mee in plak 4. Neem multitenant **niet** mee — noteer alleen dat `NUT_DOEL` en `NUT_CONTEXT` de velden zijn waar een latere behandelaarsblik op zou landen, zodat we ze nu al schoon opslaan (enum, geen vrije tekst in events — `[[psf-eigen-ijkpunt-doel]]`).

### 10.3 · Prioriteiten náást de balk, en in "Context bij vandaag"

Akkoord: de Kompas-telling blijft, de prioriteiten komen ernaast. Twee plaatsingen:

**Kompas (`NutritionKompasTweeluik`)** — prioriteiten links naast de balk, telling rechts. De balk zegt *hoe ver*, de prioriteiten zeggen *waarheen*. Naast elkaar, want dat is één blik.

**Context bij vandaag** — dit is precies waar `kompas-context-spine.ts` voor bestaat (`[[psf-kompas-contextkolom-per-domein]]`: spine met eigen balk per domein — urgentie/doel/keuze/schap/ritme). De voedingsprioriteiten horen in de **keuze**-balk van die spine. Belangrijk: `kompas-aanbeveling.ts` heeft al de regel *"nooit 'Grootste winst' op een laag die dat niet zei"* — die invariant moet blijven gelden als de prioriteiten er komen.

### 10.4 · Reflectiemoment: na een geplande actie, plus wat de wetenschap zegt

**Akkoord met "na een geplande actie"** in plaats van een vaste wekelijkse vraag. Reden: een vaste zondagvraag zonder geplande actie is een vraag over niets, en die leert mensen de vraag te negeren.

**Wat er wetenschappelijk het best werkt**, en wat daarvan hier past:

| Mechanisme | Werkt | Past hier? |
|---|---|---|
| Implementatie-intenties (wanneer/waar vooraf vastleggen) | Sterk, breed gerepliceerd | **Ja** — dat is precies wat het agendablok al ís |
| Zelfmonitoring van gedrag | Sterk bij voeding | **Ja, mits kort** — zie het 2+2-logboek hieronder |
| Terugkoppeling op eigen reeks (niet op norm) | Sterk | **Ja** — bestaat al in `nutrition-tijdlaag.ts` |
| Dagelijks alles bijhouden | Effect verdwijnt zodra het stopt; hoge uitval | **Nee** |
| Streaks / niet-afvinken-straf | Werkt kort, produceert schuld | **Nee** — zie §9 |

Het reflectiemoment wordt dus: **één vraag, gekoppeld aan het blok dat je zelf plande**, in je eigen woorden ("ging dit?"), zonder norm ernaast. Landt in de tijdlaag, niet in de score.

### 10.5 · Het 2+2-logboek: twee doordeweekse dagen, twee weekenddagen

**Dit is inhoudelijk de sterkste suggestie van de hele review, en hij is voedingswetenschappelijk correct.** De reden dat voedingsonderzoek met meerdaagse registraties werkt en met eendaagse niet, is precies de dag-tot-dag-variatie die jij noemt. Weekend-eetpatronen wijken systematisch af van doordeweekse — dat is een van de best gedocumenteerde patronen in voedingsonderzoek.

**Wat het oplevert dat de sliders niet kunnen.** De 11 sliders vragen naar een *gemiddelde* ("hoe vaak meestal"). Mensen antwoorden dan met hun beste dag, of met hun bedoeling. Een 2+2-registratie meet twee dingen die daar niet uit komen:

1. **Het niveauverschil** — hoe ver ligt je weekend van je week af. Dat is een eigen bevinding, en het is bruikbaar: iemand met een prima weekpatroon en een ontspoord weekend heeft een ander aandachtspunt dan iemand met een vlak matig patroon.
2. **De kalibratie van de sliders** — het verschil tussen wat je zei en wat je registreerde. Dat is een *dekkingsmaat*, geen fout: het maakt de check eerlijker over zijn eigen onzekerheid.

**Waar het landt: laag 5 (Meten & timing).** Dit is precies de laag die nu leeg staat en op `wacht` is gezet. Dat is nu terecht — er is niets te meten. Met een 2+2-logboek heeft laag 5 voor het eerst inhoud, en de bestaande formulering blijft kloppen: *"tellen en timen blijven dicht — gereedschap, geen fundament"*. Een 2+2-registratie is geen calorieën tellen; het is een steekproef.

**Toegangspunten (jouw vraag 2):** beide, met verschillende rollen.

- **Zijbalk bij Voortgang → Voeding**: het logboek zelf, als gereedschap onder laag 5. Dit is de hoofdingang.
- **Kompas/Vandaag**: alleen een uitnodiging wanneer de check zegt dat het iets oplevert (bijv. bij `own`-rijen of tegenstrijdige antwoorden), niet als vaste tegel.

**Harde grens:** een 2+2-logboek levert **geen tweede score**. Zelfde lock als bij beweging (`[[psf-beweging-analyse-evidence]]`: *minuten = evidence, nooit 2e score*). Het verrijkt de readout, het vervangt hem niet.

### 10.6 · "Grootste winst" weg uit Voedingsbasis

**Akkoord, en het is een goede vondst.** Het probleem is precies wat je beschrijft: op P1 Voedingsbasis staat een oordeel over de hele ladder, midden in een scherm dat over één laag gaat.

Waar het nu zit: `LeefstijlprofielDomeinScherm.tsx:430` toont *"Je kijkt naar prioriteit N. Jouw grootste winst zit op prioriteit M."* Dat is een navigatie-hint vermomd als oordeel.

**Voorstel:** de regel verdwijnt uit de kop van het laagscherm en komt terug op twee plekken waar hij wél hoort:

1. **Onderaan het laagscherm**, als afsluiting: nadat je gezien hebt hoe déze laag ervoor staat, mag het scherm zeggen waar de winst zit. Volgorde: eerst feiten, dan richting.
2. **In de zijbalk, onder "Advies"** — daar is het een navigatiehulp tussen lagen, en dat is wat het is.

De `focusLayer`-logica zelf blijft ongemoeid; alleen de plaatsing verandert. Dit is de goedkoopste verbetering in de hele lijst.

### 10.7 · Voedingsdatabase uitbreiden voor structuur/kwaliteit/diversiteit

**Ja — maar de uitbreiding zit niet in méér voedingsmiddelen.** `food-sources.ts` heeft 79 bronnen; dat is genoeg. De drie assen die je noemt worden geen van drieën beter van rij 80.

| As | Wat je nu meet | Wat ontbreekt |
|---|---|---|
| **Structuur** | niets | eetmomenten, regelmaat, buiten de deur → **module A**, geen database |
| **Kwaliteit** | `ultraProcessed` (1 slider, "vuistregel, geen richtlijn") | een bewerkingsgraad-as per voedselgroep |
| **Diversiteit** | `berries` als proxy voor variatie | aantal verschillende bronnen per groep |

**Diversiteit is de echte database-uitbreiding**, en hij is klein: een `diversity`-veld per `FoodSource`-groep, of eenvoudiger — een telling van hoeveel verschillende bronnen iemand in het 2+2-logboek noemt. Dat laatste heeft geen database-uitbreiding nodig, alleen het logboek uit §10.5. **Doe dat eerst.**

**Kwaliteit verdient wél een velduitbreiding**: een bewerkingsgraad-indicatie per bron, zodat "granen" niet één rij is maar een as van volkoren tot geraffineerd. Dat is een literatuuroordeel, geen NEVO-waarde — dus het valt onder dezelfde regel als `bioavailability` (§10.9): eigen verificatiespoor, `verified: true` slaat er niet op.

**Volgorde:** logboek (§10.5) → diversiteit uit logboek → pas daarna een velduitbreiding, als de eerste twee laten zien dat hij nodig is.

### 10.8 · Agenda voor voeding: aandachtspunt én affiliate — maar gescheiden

Je noemt twee dingen die de agenda straks moet dragen: **(1)** een aandachtspunt, **(2)** iets kopen/affiliate/contract. Die twee moeten in de agenda net zo gescheiden zijn als in de rest van de keten.

**Wat mag:** een agendablok "Kies volkorenbrood bij de boodschappen" is een aandachtspunt-actie. Dat de gebruiker daarbij iets koopt, maakt het geen affiliate-actie — er zit geen link in en er wordt geen product genoemd.

**Wat niet mag:** een agendablok dat naar een product linkt. Reden: de agenda is de gedragslaag, en die staat vóór de poort. Een affiliate-link in de agenda omzeilt `resolveNutritionGate` volledig — dan heb je een poort die alleen op één scherm dicht zit. Dat is precies de "keuze-opties horen niet in de diagnose"-regel uit §0, één laag verderop.

**De juiste vorm:** de agenda-actie mag naar het **schap** verwijzen (waar de poort geldt), nooit naar een product. Het schap is al de plek waar activiteiten en supplementen samen liggen (`[[psf-deur-schap-onderbouwing]]`), en de poort hangt daar al aan.

**Contracten (PartnerDesk, `pd_*`)** horen hier helemaal niet — dat is upstream partnerbeheer en heeft geen naad met de gebruikerskant van de agenda. Niet verwarren (CLAUDE.md, "drie betekenissen van affiliate").

### 10.9 · NEVO-onderbouwing: wat mag, en wat er nog open staat

**De legaliteitsvraag is al beantwoord en het antwoord is goed** (`docs/plan/BESLUIT_NEVO_BRONVERMELDING.md`): CC BY 4.0 op data.overheid.nl staat afgeleide werken toe, RIVM's eigen voorwaarden zeggen "only unchanged". Het besluit houdt de strengste lezing aan, en dat is de juiste keuze.

**Wat dat concreet betekent — en dit beantwoordt je twijfel over literatuur weghalen:**

- **NEVO-waarden**: overnemen mag, ongewijzigd, met `NEVO-online versie 2025/9.0, RIVM, Bilthoven`. Staat als `NEVO_CITATION`, met een test die versie en plaats bewaakt. ✅
- **Literatuuroordelen** (`bioavailability`, `variability`, `preparationNote`, `qualityNote`): die komen **niet** uit NEVO en vallen dus **niet** onder de RIVM-voorwaarden. Ze hebben hun eigen verificatiespoor.

**Dus nee — literatuur weghalen zou juist verkeerd zijn.** De literatuurvelden dragen bij magnesium en zink de zwaarste conclusie (fytaat maakt magnesium uit brood iets anders dan magnesium uit vlees). Zonder die velden is de tabel een gehaltelijst zonder betekenis. De licentiescheiding is er al: `verified: true` slaat alléén op `nutrientValue`, niet op de rest van de rij. Dat is precies de juiste constructie.

**Wat er wél open staat: de import is half af.** 47 van de 79 bronnen dragen `verified: true`. De overige 32 hebben nog een indicatieve literatuurwaarde zonder NEVO-verificatie. Dat is de openstaande klus uit het importpad (stap 1–4 van het besluitdoc), en het is een handmatige stap omdat de download een akkoord vereist.

**Aanbeveling:** maak die 32 af vóórdat de voedingsbasis-tabel als richtlijn-instrument gaat dienen (§10.10). Een tabel die "hier sta jij, hier ligt de richtlijn" belooft, moet aan beide kanten geverifieerd zijn.

### 10.10 · Het richtlijn-probleem: geen groen-naar-rood maatstaf

Dit is de scherpste observatie van de review, en de diagnose is precies goed. Ik heb het in de code teruggevonden.

**Wat er nu gebeurt.** `VoedingsbasisOverzicht` toont per categorie `Jij` en `Aanbevolen` met een statusbolletje (ruimte/bijna/op orde). Maar `categorieKaarten()` in `nutrition-voedselgroepen.ts` haalt `aanbevolen` uit `row.benchmarkLabel` — en dat veld is **leeg voor elke rij zonder norm**. Concreet:

| Categorie | Heeft richtlijn? |
|---|---|
| Groente, Fruit | ✅ WHO ≥400 g |
| Granen | ✅ |
| Vlees & vis | ⚠️ deels — `visbron` wel, `eiwitbronnen` **niet** (`own`, "geen-norm") |
| Zuivel | ❌ `own` |
| Noten & peulvruchten | ❌ `own` |
| Suiker & bewerkt | ⚠️ `ultraProcessed` = "vuistregel, geen richtlijn" |

Dus: **drie van de zeven categorieën tonen een lege richtlijn-kolom en een statusbolletje zonder kleur.** De gebruiker ziet een tabel die een vergelijking belooft en hem op de helft van de rijen niet levert.

**Wat er níét kan.** Een norm verzinnen waar er geen is. Dat is niet alleen fout, het botst met de expliciete invariant in `nutrition-ladder.ts`: *"Nooit een badge die suggereert dat er een grens was die je miste."* Die regel is goed en moet blijven.

**Wat wel kan — drie dingen, oplopend in kosten:**

**(a) De lege cel een betekenis geven.** Nu leest een lege richtlijn-cel als een ontbrekend getal. Zet er staan wat er ís: *"Geen NL-richtlijn — jouw antwoord is het ijkpunt"*. Dat is geen omweg maar de eerlijke uitkomst, en de status `own` bestaat er al voor. Kosten: copy. **Doe dit hoe dan ook.**

**(b) Een tweede as: je eigen reeks.** Waar geen norm is, is wél richting — als je twee metingen hebt. Voor `own`-rijen wordt de vergelijking dan niet "jij vs. richtlijn" maar "jij vs. jij, vorige keer". Dat is precies wat `nutrition-delta.ts` en `nutrition-tijdlaag.ts` al doen, alleen niet in deze tabel. Kosten: middel. Vereist een tweede check — dus het werkt pas bij hermeting.

**(c) Waar wél een richtlijn bestaat, hem strakker gebruiken.** Voor zuivel en noten/peulvruchten bestaat er een Nederlandse Schijf-van-Vijf-aanbeveling; die is nu niet opgenomen omdat de *vraagvorm* (frequentie) niet matcht met de *normvorm* (gram/dag). Dat is een echte mismatch en geen luiheid. Oplossing: de vraag aanpassen naar een vorm die tegen de norm te leggen is — dat hoort bij plak 5 (Voedingcheck modulariseren), niet bij een losse fix.

**Groen-naar-rood specifiek.** De drie statuskleuren bestaan al (`#C8956C` ruimte / `#C99A3C` bijna / `#9CC5A9` op orde). Wat ontbreekt is niet de schaal maar de **dekking**. Na (a) en (c) dekt de schaal vijf van de zeven categorieën met een echte norm, en de andere twee met een expliciete "eigen ijkpunt"-markering. Dat is eerlijker dan zeven categorieën met een half-lege schaal.

### 10.11 · Het conversiemiddel

Je vraagt het direct, dus het directe antwoord: **het conversiemiddel is de Voedingcheck zelf, en de agenda-actie is wat hem laat kleven.**

De keten heeft nu twee conversiemomenten en gebruikt er één:

1. **Leefstijlcheck → Voedingcheck.** Dit werkt al: een aandachtspunt op voeding is een aanleiding om door te klikken. De trechter uit §6 maakt hem *beter* omdat de check korter en persoonlijker wordt ("we vragen alleen wat bij jouw uitkomst hoort").
2. **Voedingcheck → gedrag → terugkomen.** Dit werkt nu **niet**, want er is geen agenda-naad (§2, breuk 1). Iemand vult de check in, ziet zijn profiel, en heeft geen reden om terug te komen tot de hermeting over weken.

**Dat tweede moment is het conversiemiddel dat je mist.** Niet een betere CTA op de check, maar een reden om morgen terug te zijn. De volgorde is dus: agenda-naad (plak 2) vóór trechter (plak 5) — ook al voelt de trechter als de grotere verbetering.

**Wat het conversiemiddel níét is:** de poort naar laag 6. Die is bewust streng, en dat moet zo blijven. Een poort die opengaat om conversie te halen is geen poort.

**Meetpunt om dit af te lezen:** het verschil tussen `nutrition.agenda_action_planned` en `nutrition.agenda_action_completed`, en het percentage dat binnen 7 dagen terugkeert na een geplande actie. Dat tweede getal is de enige eerlijke maat voor of deze keten gedrag oplevert.

---

## 11 · Herziene bouwvolgorde

De volgorde uit §8 verandert op twee punten: het "grootste winst"-verzetje en de lege richtlijn-cel zijn goedkope fixes die niet hoeven te wachten.

| Plak | Wat | Kosten | Hangt af van |
|---|---|---|---|
| **0** | "Grootste winst" verplaatsen (§10.6) + lege richtlijn-cel betekenis geven (§10.10a) | klein | — |
| **1** | Kompas-prioriteiten, náást de balk + in context-spine (§4, §10.3) | klein | — |
| **2** | Agenda-naad voor voeding, schap-verwijzing i.p.v. product (§5, §10.8) | middel | 1 |
| **3** | Reflectiemoment na geplande actie (§10.4) | klein | 2 |
| **4** | 2+2-logboek onder laag 5, zijbalk-ingang (§10.5) | middel | — |
| **5** | Diversiteit uit logboek (§10.7) | klein | 4 |
| **6** | Leefstijlcheck 2 → 6 vragen incl. `NUT_DOEL` + doorverwijs-uitgang (§3, §10.1, §10.2) | **groot**, raakt `RULES_VERSION` | — |
| **7** | Voedingcheck modulariseren + vraagvorm-fix voor normmatching (§6, §10.10c) | groot | 6 |
| **8** | Module E supplementencheck (§6) | middel, hoogste compliance-risico | 6, 7 |
| **—** | NEVO-import afmaken: 32 resterende bronnen (§10.9) | handmatig | vóór 7 |

**Niet in deze roadmap:** multitenant/behandelaarstoegang (§10.2 — alleen de naad schoonhouden), database-velduitbreiding voor bewerkingsgraad (§10.7 — pas na plak 5), affiliate in de agenda (§10.8 — mag niet).

---

## 12 · Het dagboek verdiepen — drie informatieniveaus (3 sep, na plak 5)

Aanleiding: het 2+2-dagboek draait live, maar met zeven grove groepen. De vraag is hoeveel dieper het mag gaan, en waar dat ophoudt. Het antwoord uit de review — **drie informatieniveaus, waarvan er twee onder de motorkap blijven** — is juist, en de code staat er beter voor dan verwacht.

### 12.1 · Wat er al ligt (geverifieerd)

**Niveau 2 en 3 bestaan al grotendeels.** Dat is de belangrijkste vondst van deze analyse.

| Laag | Bestaat als | Stand |
|---|---|---|
| Macro's (eiwit) | `NUTRIENT_SIGNAL_SOURCES.protein` — 3 gewogen velden | ✅ werkt |
| Micro's, risicogestuurd | `nutrientReferences` — 5 stoffen mét interventiepad | ✅ werkt |
| Bijdrage per bron | `contributionFor()` — aandeel binnen eigen antwoorden | ✅ werkt |
| Vertrouwensniveau | `NutrientConfidence` 1–4, per stof | ✅ werkt |
| Bronnentabel | `food-sources.ts` — 79 rijen, 47 NEVO-geverifieerd | ⚠️ half |

De vijf nutriënten (`protein`, `omega3`, `magnesium`, `vitamin_d`, `zinc`) zijn **precies de risicogestuurde selectie** die de review voorstelt: alleen stoffen met een interventiepad, niet "we meten er 25". En `nutrition-contribution.ts` draagt al de harde grens die daarbij hoort:

> **Geen milligrammen, geen dagtotalen, geen percentage van een ADH.** De `share` is een aandeel binnen je eigen antwoorden, niet een fractie van een norm.

Drie redenen staan daar gedocumenteerd: de check meet frequenties niet grammen, `food-sources` is nog niet volledig geverifieerd, en bij magnesium/zink bepaalt fytaat de opname méér dan het gehalte. **Die grens moet blijven staan** — ook als het dagboek preciezer wordt.

### 12.2 · Het echte gat: het dagboek voedt de nutriëntlaag niet

`NUTRIENT_SIGNAL_SOURCES` leest uit `NutritionSelfReport` — velden als `oilyFishPerWeek`, `nutsSeedsLegumesPerWeek`, `dairyServingsPerDay`. Die komen uit de **check** (de elf sliders), niet uit het dagboek.

Het dagboek schrijft `{groente: 3, "vlees-vis": 2}`. Dat is grover: "vlees & vis" is één bak waar de nutriëntlaag *vis apart* nodig heeft voor omega-3, en *vlees apart* voor zink.

**Dus: het dagboek kan de nutriëntlaag vandaag niet voeden, en dat is precies waar een verfijning van de groepen iets oplevert.** Niet omdat meer categorieën op zichzelf beter zijn, maar omdat een paar gerichte splitsingen het dagboek koppelbaar maken aan wat er al draait.

### 12.3 · Van 7 naar 12 groepen — de splitsingen die iets doen

De review noemt 12–15 groepen. Ik zou naar **12** gaan, en elke splitsing verantwoorden vanuit wat hij ontsluit — niet vanuit volledigheid.

| Nu (7) | Wordt (12) | Wat het ontsluit |
|---|---|---|
| Groente | Groente | — |
| Fruit | Fruit | — |
| **Vlees & vis** | **Vis** | omega-3-route wordt voedbaar uit het dagboek |
| | **Vlees & gevogelte** | zink-route idem |
| | **Vlees-/visvervangers** | vegetarische route krijgt eigen signaal |
| Zuivel | Zuivel & alternatieven | — |
| — | **Eieren** | eiwitverdeling; nu onzichtbaar |
| Granen | Volkoren granen | — |
| — | **Aardappelen/rijst/pasta** | scheidt volkoren van zetmeel |
| Noten & peulvruchten | **Noten & zaden** | magnesium-route (fytaat-context) |
| | **Peulvruchten** | eiwit + vezels, andere fytaat-context |
| — | **Oliën & vetten** | vetkwaliteit — de enige echte kwaliteitsknop die ontbreekt |
| Suiker & bewerkt | Snacks, snoep & gebak | — |
| | (blijft samen) | |
| — | **Dranken** | suikerhoudend vs. water; nu alleen in de check |

Wat ik **niet** overneem uit de 15-lijst: "bewerkte kant-en-klaarmaaltijden/fastfood" als aparte groep naast snacks. Dat is dezelfde as (bewerkingsgraad) in twee bakken, en het dwingt de invuller tot een indeling die hij zelf niet maakt.

**Kosten:** 12 rijen plus/min in plaats van 7. Dat is de grens van wat per dag nog invulbaar is — daarboven wordt het een formulier.

### 12.4 · Supabase: waarom dit géén migratie kost

De tabel slaat `portions jsonb` op:

```
portions jsonb not null default '{}'::jsonb
```

Een JSONB-map met groep-ids als sleutel. **Meer groepen = meer sleutels, geen schemawijziging.** De migratie uit plak 4 is er precies op gebouwd:

> `portions` — Porties per voedselgroep-id. Ontbrekende groep betekent niet-ingevuld, niet nul.

Wat wél moet:

1. **`VOEDSELGROEPEN` uitbreiden** in `nutrition-voedselgroepen.ts` — dat is de bron voor zowel de categorietabel op laag 1 als `DAGBOEK_GROEPEN`.
2. **`rowKeys` per nieuwe groep bepalen** — welke feitenrij(en) uit de check hoort erbij. Hier zit het denkwerk: "Eieren" hangt aan `eiwitbronnen`, "Oliën & vetten" aan niets bestaands (dus `own`-status, zie §10.10).
3. **`sanitizePortions()` volgt automatisch** — die valideert tegen `DAGBOEK_GROEPEN`.
4. **Bestaande rijen blijven geldig.** Een dag die met 7 groepen is ingevuld mist straks 5 sleutels, en dat leest als "niet ingevuld" — precies wat de kolomcomment belooft. Geen backfill.

**Eén ding dat wél breekt:** `berekenBreedte()` deelt door `DAGBOEK_GROEPEN.length`. Een dag uit het 7-groepen-tijdperk krijgt dan "3 van de 12" terwijl er 12 nooit gevraagd zijn. Fix: de noemer per dag vastleggen bij invoer, of breedte alleen berekenen over dagen ná de uitbreiding. Dat is dezelfde soort versie-grens als `NUTRITION_DELTA_COMPARABLE_FROM` — en hij verdient dezelfde behandeling.

### 12.5 · Variatie ≠ aantal producten

De review legt hier de vinger op het juiste punt: *"30 verschillende ultra-bewerkte producten is natuurlijk geen betere voeding."*

Daarom telt een diversiteitsmaat **alleen binnen volwaardige groepen**. Concreet: groente, fruit, volkoren, peulvruchten, noten/zaden, vis — niet snacks, niet dranken, niet kant-en-klaar.

En de uitkomst is een band, geen getal: *laag · gemiddeld · goed · zeer gevarieerd*. Niet "je eet 27 producten" — dat getal suggereert een precisie die een steekproef van vier dagen niet heeft, en het nodigt uit tot optimaliseren op het getal.

**Maar let op:** dit vereist alsnog dat het dagboek weet *welke* groente, en dat is de bronnenvraag uit §10.7 die ik toen als te duur afwees. Met 12 groepen wordt de vraag anders: **spreiding over 12 groepen is al een bruikbare variatie-proxy**, en die is gratis. Echte diversiteit binnen een groep blijft wachten op een invoervorm die niemand afschrikt.

### 12.6 · Wat de gebruiker ziet

De review sluit met de belangrijkste regel, en die verdient een lock:

> De gebruiker ziet vooral begrijpelijke conclusies als "eiwitverdeling kan beter" of "weinig bronnen van omega-3", niet een dashboard met 30 nutriënten.

Dat is exact wat `NutrientRouteStatus` al doet (`gap` / `partial` / `off_route` / `unmeasured`) en wat de sufficiency-laag op P4 toont. **De verdieping zit in de invoer en in de motorkap — niet in de uitvoer.** Meer groepen invullen betekent scherpere routes, niet meer schermen.

### 12.7 · Voorstel: 7 dagen optioneel, 4 blijft de norm

Op de vraag "is 7 dagen optioneel?": **ja, maar niet als doel.**

- **4 dagen (2+2) blijft de norm** en de voortgangsteller. Dat is de afruil die data oplevert.
- **Extra dagen mogen**, en tellen mee in breedte en weekendvergelijking — de rekenfuncties middelen al over wat er is.
- **Geen tweede teller, geen "7/7"-doel.** Zodra 7 een doel wordt, is 4 een halve prestatie, en dan hebben we de streak terug die we in plak 3 bewust weerden.

Praktisch: het paneel zegt na vier dagen "Nog een dag invullen" in plaats van "compleet — klaar". Dat staat er al.

### 12.8 · Bouwvolgorde voor deze verdieping

| Plak | Wat | Kosten | Vereist |
|---|---|---|---|
| **7a** | `VOEDSELGROEPEN` 7 → 12, met `rowKeys` per groep | middel | — |
| **7b** | Breedte-noemer versievast maken (§12.4) | klein | 7a |
| **7c** | Dagboek koppelen aan `NUTRIENT_SIGNAL_SOURCES` — vis/vlees/noten apart voeden de routes | **groot** | 7a |
| **7d** | Variatie-band over volwaardige groepen (§12.5) | klein | 7a |
| — | NEVO-import afmaken (32 rijen) | handmatig | vóór 7c |

**7c is de plak die het meeste oplevert en het meeste denkwerk kost.** Hij maakt van het dagboek een tweede bron naast de check — en dan komt de kalibratievraag uit §10.5 pas echt tot leven: wat je zei tegenover wat je registreerde, per nutriënt.

### 12.9 · Wat ik hier niet zou doen

- **Macro's in grammen tonen.** "237 gram koolhydraten" hoort bij een voedingsanalyse, niet bij patroonherkenning. De review zegt dit zelf en het staat al als lock in `nutrition-contribution.ts`.
- **Alle micronutriënten uitvragen.** De vijf met een interventiepad zijn de vijf waar we iets mee kunnen. Een zesde toevoegen zonder route betekent een bevinding zonder vervolg.
- **Een aparte "voedingsanalyse"-module bouwen.** De 3–7 daagse registratie uit de review ís het dagboek, met meer dagen. Twee modules die hetzelfde vragen is de valkuil die `intake_intake_log` naast `account_nutrition_daybook` al bijna opleverde.
