# Spec — Voedingsbronnen: verificatielaag

> **Versie 1.1 — 27 augustus 2026.** Vervangt v1.0 (1 augustus 2026).
> **Status:** ontwerp, geen code. Build-time datawerk, geen runtime-subsysteem, geen migratie.
>
> **Wat er veranderde t.o.v. v1.0.** Drie open punten dicht, na audit van het werkelijke
> NEVO 2025/9.0-detailbestand. De kolomnamen staan er nu in plaats van "verifiëren" (§6.4).
> Er is een verplichte dedup-regel bijgekomen omdat `PROT` in twee voedingsstofgroepen zit —
> zonder die regel telt de eiwit-claimtoets dubbel (§6.5). De `allowsPaywall`-renderregel is
> aangescherpt van spec-zin naar code plus test, met een expliciete gratis/premium-grens (§6.1).
> Nieuw: een dekkingscontrole op ALA/EPA/DHA die vóór het adapterwerk moet draaien, omdat een
> laag gevulde vetzuurkolom de hele omega-3-lijst omgooit (§8.0), en een bouwvolgorde (§12).
> De rest van v1.0 staat ongewijzigd.
>
> **Wat er veranderde t.o.v. v0.1.** Die versie ontwierp een nieuw contentblok met een eigen
> Postgres-tabel, alsof er niets bestond. Er bestaat wél iets: [`src/data/nutrition/food-sources.ts`](../../src/data/nutrition/food-sources.ts)
> staat er al, portie-gebaseerd, en wacht letterlijk op deze verificatie ("verifiëren tegen
> NEVO/Voedingscentrum vóór livegang"). Deze versie maakt van de spec een **verificatielaag onder
> een bestaande registry** in plaats van een parallel systeem. Verder: bron-agnostisch (§6),
> de claimregels per nutriënt gecorrigeerd (§4), %RI wél tonen (§9), denylist i.p.v. allowlist (§7).

## 1. Doel

Elke waarde in de voedingsbronnen-registry herleidbaar maken tot een erkende voedingsdatabank,
en per nutriënt vastleggen of het voedingsmiddel onder de **wettelijke claimdrempel** valt.

**Wel:**
- Verificatie van bestaande, met de hand samengestelde waarden tegen een gezaghebbende bron
- Claimniveau per (voedingsmiddel, nutriënt): *bron van* / *rijk aan* / geen claim
- Herkomst (`provenance`) per waarde: bron-id, versie, code in die bron, verificatiedatum
- Bronwissel of bron-aanvulling zonder de registry of de UI aan te raken

**Niet:**
- Geen innameberekening, geen voedingsdagboek, geen portieregistratie
- Geen tekortdetectie, geen "je haalt dit niet uit voeding"
- Geen productscore, geen Nutri-Score/Yuka-achtige beoordeling van merkproducten
- Geen personalisatie op basis van leefstijlcheck-uitkomsten

**Harde grens.** Deze laag is content en herkomst. Hij mag nooit een input worden van
`isComparisonAllowed`, van de tier-gate, of van `computeNutritionScore`. De supplementselectie
blijft statisch via [`approved-claims.ts`](../../src/data/approved-claims.ts).

## 2. Wat er al staat (geverifieerd tegen `main`)

| Bestand | Rol | Status |
|---|---|---|
| [`food-sources.ts`](../../src/data/nutrition/food-sources.ts) | `FOOD_SOURCES: Record<NutrientId, readonly FoodSource[]>` — voedingsmiddel → portie + hoeveelheid + portiegroep + seizoen | Bestaat, 5 nutriënten, **dormant** (geen UI-consumer) |
| [`portion-dictionary.ts`](../../src/data/nutrition/portion-dictionary.ts) | `PortionGroup` → gram-equivalent | Bestaat, waarden gemarkeerd indicatief |
| [`intake-reference.ts`](../../src/data/nutrition/intake-reference.ts) | `NutrientId` + referentielabels + `claimKey` | Bestaat |
| [`step-sourcing.ts`](../../src/lib/step-sourcing.ts) | `StepSourcing = self \| food \| product`, `nutrientFromActionKey()` | Bestaat, `ORDERING_ENABLED = false` |

Twee bestaande ontwerpregels blijven leidend en worden hier **niet** omgekeerd:

1. **De registry is portie-gebaseerd, niet per 100 g.** Reden staat in de header van
   `food-sources.ts`: de lijst staat er om te kúnnen kiezen tussen bronnen, niet om inname te
   berekenen. De bron levert per 100 g; de registry vertaalt dat naar een portie die je herkent.
2. **Waarden tellen niet op tot een dagtotaal.** De band per nutriënt komt uit frequentievragen
   (`estimateNutritionIntake`), niet uit grammen.

## 3. Drie lagen

```
Laag 1  Claimregels        EU-recht. Bron-onafhankelijk. Verandert nooit mee met de databron.
           ↓
Laag 2  Bronadapter        Per databron: kolommen, eenheden, dekking, licentie. Vervangbaar.
           ↓
Laag 3  Registry           food-sources.ts. NL-labels, porties, seizoen. Blijft de renderlaag.
```

De scheiding is het hele punt. Laag 1 is wet en verandert alleen als de verordening verandert.
Laag 3 is redactie en verandert alleen als jij een voedingsmiddel toevoegt. Alleen laag 2 is
bron-specifiek — en dat is precies één bestand per bron.

## 4. Laag 1 — claimregels (bron-onafhankelijk)

Verordening (EG) nr. 1924/2006, bijlage. **Er is niet één regel maar drie regelvormen**, en de
oude spec paste de vitamine/mineraal-regel ten onrechte op alles toe.

### 4.1 De drie regelvormen

| Vorm | Geldt voor | *Bron van* | *Rijk aan* |
|---|---|---|---|
| `nrv_share` | vitamines en mineralen | ≥ 15% RI per 100 g · ≥ 7,5% RI per 100 ml | tweemaal de bron-van-waarde |
| `energy_share` | **eiwit** | ≥ 12% van de energetische waarde uit eiwit | ≥ 20% |
| `absolute_dual` | **omega-3** | ≥ 0,3 g ALA per 100 g **én** per 100 kcal, óf ≥ 40 mg EPA+DHA per 100 g **én** per 100 kcal | 0,6 g ALA, óf 80 mg EPA+DHA (beide assen) |

RI-waarden voor `nrv_share`: Verordening 1169/2011, bijlage XIII deel A.

**Waarom dit ertoe doet.** Eiwit is je hero-nutriënt ([`protein-target.ts`](../../src/lib/protein-target.ts),
[`nutrition-protein-emphasis.ts`](../../src/lib/nutrition-protein-emphasis.ts),
[`aanpak-q1-eiwit.ts`](../../src/lib/aanpak-q1-eiwit.ts)) en omega-3 heeft een eigen `/beste/`-pad.
Onder de 15%-RI-regel van v0.1 was voor geen van beide een correcte claimtoets mogelijk — eiwit
heeft wel een RI (50 g) maar die stuurt de claim niet, en omega-3 heeft er geen enkele. De oude
spec dekte 20 vitamines en mineralen en precies nul van de twee nutriënten waar het product op leunt.

**Gevolg voor de adapter:** hij moet ook **energie (kcal)** kunnen leveren. Zonder energiekolom
zijn `energy_share` en `absolute_dual` niet te toetsen.

### 4.2 De 100 ml-regel

Vloeibare levensmiddelen gebruiken 7,5% RI per 100 ml, niet 15% per 100 g. Bronbestanden mengen
vaak vaste stoffen en dranken in één tabel (NEVO zet de eenheid in de productnaam). De adapter
moet per rij een `basis: "per_100g" | "per_100ml"` afgeven; laat de regellaag dat afhandelen,
niet de redactie.

### 4.3 Vorm

```ts
type ClaimRule =
  | { form: "nrv_share"; nrv: number; unit: "mg" | "ug" }
  | { form: "energy_share" }
  | { form: "absolute_dual"; ala: number; epaDha: number };

type ClaimLevel = "none" | "source" | "rich";

// Pure functie, geen bron-kennis, volledig unit-testbaar.
function resolveClaimLevel(
  rule: ClaimRule,
  row: { amount: number | null; energyKcal: number | null; basis: Basis },
): ClaimLevel;
```

## 5. Scope — vijf nutriënten

`FOOD_SOURCES` dekt vandaag `protein · omega3 · magnesium · vitamin_d · zinc`. Dat is de scope.

Uitbreiden gebeurt **niet** omdat een bron een kolom heeft, maar omdat een nutriënt een
interventiepad krijgt: een `NutrientId`, een `comparisonPath` en een `claimKey` in
`approved-claims.ts`. Zonder die drie heeft een bronnenlijst nergens om te staan. De 20-rijige
nutriënttabel uit v0.1 was databank-gedreven scope, niet productscope.

| Nutriënt | Regelvorm | Drempel *bron van* | Drempel *rijk aan* |
|---|---|---|---|
| Eiwit | `energy_share` | 12% van de energie | 20% |
| Omega-3 | `absolute_dual` | 0,3 g ALA · 40 mg EPA+DHA | 0,6 g · 80 mg |
| Magnesium | `nrv_share`, RI 375 mg | 56,25 mg /100 g | 112,5 mg |
| Vitamine D | `nrv_share`, RI 5 µg | 0,75 µg /100 g | 1,5 µg |
| Zink | `nrv_share`, RI 10 mg | 1,5 mg /100 g | 3,0 mg |

Vitamine D-noot uit v0.1 blijft staan: de RI is wettelijk 5 µg, lager dan de Nederlandse
voedingsnorm. De claimdrempel volgt de verordening, niet het voedingsadvies. Niet aanpassen.
De bestaande `zonlicht`-regel in `VITAMIN_D_SOURCES` heeft `amount: null` en valt per
constructie buiten elke claimtoets — dat is correct en moet zo blijven.

## 6. Laag 2 — het bronadapter-contract

Eén bestand per bron in `src/data/nutrition/sources/`. Dit is de enige plek met bronkennis.

```ts
interface NutrientSource {
  id: string;                    // "nevo-2025-9.0"
  labelNl: string;               // "NEVO-online"
  version: string;               // "2025/9.0"
  publisher: string;             // "RIVM, Bilthoven"

  license: {
    attributionNl: string;       // exacte, verplichte bronvermeldingszin
    attributionRequired: boolean;
    allowsDerivedValues: boolean;   // mag je herberekenen in de opgeslagen dataset?
    allowsPaywall: boolean;         // mag dit achter een betaalmuur?
    url: string;
  };

  // Welke nutriënten kan deze bron leveren, in de definitie die de claim vereist?
  coverage: Partial<Record<NutrientId, { column: string; unit: string }>>;
  energyColumn: string | null;   // vereist voor eiwit en omega-3

  parse(raw: string): SourceRow[];
}
```

### 6.1 Waarom licentie *data* is en geen voetnoot

Dit is de kern van de bron-agnostische vraag. De voorwaarden verschillen fundamenteel:

| Bron | Attributie | Herberekening | Doorbelasten aan eindgebruiker |
|---|---|---|---|
| NEVO (RIVM) | verplicht, exacte zin | verboden in de opgeslagen dataset | **verboden** |
| USDA FoodData Central | niet verplicht | vrij | vrij |
| Ciqual (ANSES) / Frida (DTU) | open licentie, attributie | vrij | vrij |

*Voorwaarden per bron verifiëren vóór gebruik; bovenstaande is een schets van het verschil, geen juridisch advies.*

`allowsPaywall: false` bij NEVO is geen detail: zodra een voedingsbronnenblok achter de
premium-gate zou komen, is dat een licentievraag. Als de bronvermelding een hardcoded string in
een component is, ontdek je dat nooit. Als het een veld is, kan de renderlaag het afdwingen.

**Renderregel — verscherpt in v1.1.** Een surface achter een entitlement rendert alleen bronnen
met `allowsPaywall: true`. Dat is één guard plus één test, niet een zin in een spec:

```ts
export function renderableSources(
  sources: readonly NutrientSource[],
  behindEntitlement: boolean,
): readonly NutrientSource[] {
  return behindEntitlement
    ? sources.filter((s) => s.license.allowsPaywall)
    : sources;
}
```

Test: NEVO achter een gate levert een lege lijst, en de UI rendert dan niets — dezelfde lege
staat als in §9.

**Waar de grens vandaag ligt.** NEVO heeft `allowsPaywall: false`, dus het voedingsbronnenblok
is permanent een gratis surface. Dat is geen concessie: publieke onderbouwing op `/beste/*` en
`/supplementen/*` is precies waar dit blok het meeste waard is.

| Kant | Wat er staat | Herkomst |
|---|---|---|
| Gratis | voedingsbronnenblok, %RI per 100 g, claimniveau, bronvermelding | NEVO |
| Premium | check-uitkomst, inname-banden, ladder, hermeting, trend, keuzehistorie, supplementvergelijking | eigen afleiding |

Die grens loopt al door de architectuur, en dat is de reden dat hij houdbaar is: de band uit
[`estimateNutritionIntake`](../../src/lib/nutrition-intake-estimate.ts) komt uit
frequentievragen, niet uit grammen — een eigen afleiding, geen NEVO-waarde. De regel uit de
header van `food-sources.ts` dat waarden nooit optellen tot een dagtotaal, houdt de premium-kant
per constructie NEVO-vrij.

**Wat nooit mag:** een NEVO-getal achter de entitlement-gate. Niet "jouw magnesium: 240 mg" in
een premium-scherm. Komt die wens er ooit, dan is dat eerst een schriftelijke vraag aan RIVM en
geen implementatiedetail.

### 6.2 Definitieverschillen tussen bronnen

Dezelfde nutriëntnaam betekent niet hetzelfde bestand-op-bestand: vitamine A als RE of RAE,
niacine als nicotinezuur of als niacine-equivalent, folaat totaal of als DFE, vitamine E als
α-tocoferol of als tocoferol-equivalent. De **claim** schrijft de definitie voor; de adapter
declareert of hij die kan leveren. Kan hij het niet in de vereiste definitie, dan staat de
nutriënt niet in `coverage` — geen benadering, geen fallback naar een naburige kolom.

De "kolomkeuzes die bewust afwijken" uit v0.1 (VITA_RE i.p.v. VITA_RAE, NIA i.p.v. NIAEQ, FOL
i.p.v. FOLAC) waren precies dit, alleen ad hoc opgeschreven voor één bron. Ze horen thuis als
commentaar bij de `coverage`-entry van de betreffende adapter.

### 6.3 Gaten vullen met een tweede bron

De echte reden dat meerdere bronnen mogelijk moeten zijn: NEVO heeft geen kolom voor biotine,
pantotheenzuur, mangaan, chroom, molybdeen en fluoride. Krijgt een van die ooit een
interventiepad, dan is een tweede bron de enige uitweg.

Drie regels als het zover komt:

1. **Provenance per (voedingsmiddel, nutriënt)-paar**, nooit per voedingsmiddel. Eén rij mag
   magnesium uit bron A en selenium uit bron B hebben, mits beide herleidbaar.
2. **Nooit optellen of middelen over bronnen heen.** Verschillende analysemethodes.
3. **Toon welke bron**, zodra er meer dan één in beeld is. Bij één bron volstaat één regel onder
   het blok.

Vandaag: NEVO als enige en primaire bron voor Nederlandse voedingsmiddelen — NL-namen,
NL-bereidingswijzen, NL-verrijkingspraktijk. Bron-agnostisch betekent hier niet "meteen twee
bronnen", het betekent "de bron staat in één bestand".

### 6.4 De NEVO-adapter

Eerste en voorlopig enige invulling. NEVO-online 2025/9.0, RIVM, Bilthoven.

**Bestandsvorm — kies er één.** RIVM levert dezelfde release in twee vormen. v1.0 beschreef de
CSV, terwijl de audit op de ODS is gedaan:

- **CSV** — scheidingsteken pipe, decimaalteken komma, UTF-8 met BOM
- **ODS** — één worksheet `NEVO2025_v9.0_Details`, 17 kolommen, 270.810 rijen

Aanbeveling: converteer het bronbestand eenmalig naar een genormaliseerd tussenbestand
(`data/staging/nevo-2025-9.0.ndjson`) en laat de adapter daarop lezen. Dan is de bestandsvorm
één conversiestap en geen adapterzorg.

**Bronbestand en tussenbestand blijven buiten git en buiten de bundle** — `data/raw/` en
`data/staging/` in `.gitignore`. Meeleveren is redistributie en dat is een andere licentievraag
dan gebruik.

**Kolommen — geverifieerd tegen het detailbestand 2025/9.0.** Long-format: één rij per
(voedingsmiddel, voedingsstof, voedingsstofgroep).

| # | Kolom | Rol in de adapter |
|---|---|---|
| 1 | `NEVO-versie/NEVO-version` | → `version` |
| 2 | `Voedingsmiddelgroep` | filter §7.2 |
| 4 | `NEVO-code` | `sourceCode` |
| 5 | `Voedingsmiddelnaam/Dutch food name` | koppeling aan de registry; filter §7.3 |
| 7 | `Hoeveelheid/Quantity` | → `basis` |
| 8 | `Voedingsstofgroep` | **niet in de sleutel** — zie §6.5 |
| 10 | `Nutrient-code` | sleutel in `coverage` |
| 13 | `Gehalte/Value` | waarde, ongewijzigd |
| 14 | `Eenheid/Unit` | `g` · `mg` · `µg` · `kcal` · `kJ` |
| 15 | `Spoor / Verrijkt/Trace / Fortified` | leeg · `TR` · `+` — zie §7.1 en §7.4 |
| 16 | `Broncode/Source code` | provenance |
| 17 | `Referentie/Reference` | provenance |

De basis staat dus in **kolom 7** en niet in de productnaam, zoals v1.0 aannam. 2.275
voedingsmiddelen zijn per 100 g, 53 per 100 ml.

**Nutrient-codes — deels bevestigd, rest nog lezen.** De "niets aannemen"-regel uit v1.0 blijft
gelden voor alles wat hieronder niet als bevestigd staat.

| Code | Status |
|---|---|
| `PROT` | bevestigd |
| `FAT` · `CHO` · `FIBT` · `ASH` | bevestigd — relevant voor §6.5 |
| energie | bestaat als **twee rijen per voedingsmiddel**, eenheid `kcal` en `kJ`, dekking 100% (2.328 van 2.328). De code zelf nog lezen. |
| `MG` · `VITD` · `ZN` · ALA/EPA/DHA | **niet bevestigd** — lezen bij het schrijven van de adapter |

Dat energie voor élk voedingsmiddel bestaat, is het bruikbaarste stuk: de `energy_share`-toets
voor eiwit kan daarmee altijd draaien.

- `attributionNl`: `Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven`
- `allowsDerivedValues: false` → de **opgeslagen** waarde blijft per 100 g en ongewijzigd.
  Portievertaling gebeurt in laag 3 en is een eigen aanvulling, zichtbaar gescheiden
  (prefix `ps_` op eigen velden, broncodes behouden hun originele naam).
- `allowsPaywall: false` → zie §6.1

### 6.5 Dedup — verplicht, vóór elke aggregatie

**Nieuw in v1.1, en de belangrijkste regel in dit hoofdstuk.**

Het detailbestand telt 270.810 rijen maar slechts 260.400 unieke (voedingsmiddel,
voedingsstof)-feiten. Het verschil van 10.410 rijen komt vrijwel volledig doordat vijf
voedingsstoffen in **twee** voedingsstofgroepen zijn ingedeeld:

| Nutrient-code | Voedingsstofgroepen |
|---|---|
| `PROT` | Energie en macronutriënten; Eiwitten |
| `FAT` | Energie en macronutriënten; Vet en vetzuurclusters |
| `CHO` | Energie en macronutriënten; Koolhydraten |
| `FIBT` | Energie en macronutriënten; Koolhydraten |
| `ASH` | Energie en macronutriënten; Mineralen en spoorelementen |

`PROT` staat in die lijst, en eiwit is de hero-nutriënt van dit product
([`protein-target.ts`](../../src/lib/protein-target.ts),
[`aanpak-q1-eiwit.ts`](../../src/lib/aanpak-q1-eiwit.ts)). Een parse die groepeert of optelt
zonder dedup verdubbelt de eiwitwaarde. De `energy_share`-toets uit §4.1 komt daarmee
structureel te hoog uit en vrijwel elk voedingsmiddel haalt dan "rijk aan eiwit" — een
verkeerde claim op een pagina die claims juist moet dichttimmeren.

**Regel.** De canonieke sleutel is `(NEVO-code, Nutrient-code)`. `Voedingsstofgroep` zit
**niet** in de sleutel en heeft in deze laag verder geen functie: dedup gooit weg wat overblijft.

**Assert, geen stille dedup.** De adapter faalt hard zodra twee rijen met dezelfde sleutel
verschillen in waarde of eenheid:

```ts
// per sleutelgroep, vóór het wegschrijven van de canonieke rij
assertSame(group, "Gehalte/Value");
assertSame(group, "Eenheid/Unit");
```

Dat onderscheidt een onschuldig dubbel groepslidmaatschap van een echte broninconsistentie.
In 2025/9.0 bestaan verder nog twee **exacte** duplicaatrijen (NEVO 1906 en NEVO 619, beide bij
vrije suikers); die passeren de assert en verdwijnen correct in de dedup.

Een genormaliseerd datamodel zou hiervoor een aparte M:N-relatie `nutrient_group_membership`
aanleggen. Hier is dat overbodig: de voedingsstofgroep wordt nergens in deze spec gebruikt, dus
hij gaat weg in plaats van naar een tweede tabel.

## 7. Filterregels

Toepassen na de claimtoets, in deze volgorde.

**7.1 Lege waarde is geen nul.** Een lege cel betekent "niet geanalyseerd", niet "bevat niets".
Rijen zonder waarde worden uitgesloten, niet als 0 behandeld. Een `parseFloat` die `NaN`
stilzwijgend naar 0 duwt, vervuilt alles. Dit is de belangrijkste regel in dit hoofdstuk.

*Aanscherping v1.1 — drie toestanden, niet twee.* Kolom 15 onderscheidt een ontbrekende rij van
een spoor: `TR` betekent aanwezig maar te laag om te kwantificeren, en staat in het bestand met
waarde 0 (1.185 rijen, 292 voedingsmiddelen). Voor de claimtoets verandert dat niets — 0 haalt
geen enkele drempel — maar het verificatierapport uit §8 mag "spoor" niet als "niet gevonden"
melden, want dat stuurt de redactie de verkeerde kant op. Bewaar de vlag:

```
kwantificeerbaar  → amountPer100 = x
spoor             → amountPer100 = 0, isTrace = true
niet geanalyseerd → geen rij
```

**7.2 Uitgesloten voedingsmiddelgroepen** (ongewijzigd uit v0.1, blijft juist):

| Groep | Reden |
|---|---|
| Kruiden en specerijen | Portie-onrealistisch; gedroogde basilicum haalt 711 mg magnesium/100 g |
| Flesvoeding en preparaten | Apart gereguleerd, verrijkt |
| Alcoholische dranken | Ongewenste associatie op een gezondheidsplatform |
| Suiker, snoep, zoet beleg en zoete sauzen | Geloofwaardigheid; cacaopoeder scoort hoog op magnesium |
| Diversen | Restcategorie |

**7.3 Naamgebaseerde uitsluiting — versmald.** Alleen `poeder`, `extract`, `geconcentreerd`.
`gedroogd` is geschrapt: dat filter sloopt ook normale rauwe vormen (gedroogde peulvruchten zijn
de standaardvorm waarin je linzen koopt). Wat er dan alsnog doorheen komt, vang je op met 7.5.

**7.4 Verrijkte producten uitsluiten.** Concreet in v1.1: kolom 15 bevat `+` → uitsluiten. Het
gaat om 956 rijen bij 256 voedingsmiddelen. Een verrijkt ontbijtgraan is geen natuurlijke bron
en vertroebelt juist het onderscheid tussen voeding en suppletie.

Let op dat de vlag geldt **per (voedingsmiddel, nutriënt)** en niet per voedingsmiddel: melk met
toegevoegd vitamine D is verrijkt voor vitamine D en niet voor eiwit. Sluit uit op
nutriëntniveau; gooi niet het hele voedingsmiddel weg.

**7.5 Denylist in plaats van allowlist.** v0.1 eiste een handmatige reviewpass over ~20 × 15
items met een allowlist als resultaat. Dat is de grootste kostenpost én verouderd bij elke
bronversie. Omgekeerd: de regels bepalen wat kwalificeert, en een korte
`ps_food_source_denylist` (nutriënt + broncode + reden + datum) haalt uitschieters eruit die de
regels missen. Onderhoud schaalt dan met uitzonderingen, niet met de omvang van de databank.

## 8. Het verificatieproces — build-time, geen database

### 8.0 Dekkingscontrole vóór het adapterwerk (nieuw in v1.1)

Eén script van een half dagje, en het bepaalt of §5 overeind blijft. RIVM waarschuwt expliciet
dat afzonderlijke vetzuren, vezels, mineralen en vitaminen niet voor ieder voedingsmiddel zijn
ingevuld; de gepubliceerde vullingsgraad bevestigt dat (vitamine K 55,76%, jodium 79,38%,
vitamine D 97,77%, energie en eiwit 100%).

Voor ALA, EPA en DHA is die dekking **niet bekend**, en dat is het enige echte risico in §5:
zonder vetzuurwaarden is de `absolute_dual`-toets voor omega-3 niet uitvoerbaar en valt de
omega-3-lijst deels of geheel om. Draai daarom eerst, vóór er één regel adaptercode staat:

1. dekking per nutriënt voor de vijf uit §5, plus energie
2. de dedup-assert uit §6.5 op de volledige set — faalt die, dan is de bron anders dan gedacht
3. hoeveel van de bestaande registry-regels een bronrij hebben mét waarde voor hun nutriënt

Blijkt 1 laag voor de vetzuren, dan gaat omega-3 uit §5 of krijgt het een tweede bron (§6.3) —
een besluit dat vóór de bouw valt in plaats van halverwege.

**Er komt geen Postgres-tabel.** v0.1 ontwierp `nevo_foods` + `nevo_nutrient_thresholds` +
`ps_food_source_allowlist`. Dat is een runtime-subsysteem voor iets dat geen runtime-vraag is:
de registry is statische TypeScript, het bronbestand is een groot CSV dat je niet meeship't, en
verificatie gebeurt bij redactiewijzigingen — niet per request. Geen migratie, geen RLS-vraag,
geen service-role.

In plaats daarvan: `scripts/verify-food-sources.mjs`, aangeroepen via
`npm run check:food-sources` (zelfde patroon als `check:db-schema`).

Het script leest het lokale bronbestand en rapporteert per regel in `FOOD_SOURCES`:

| Uitkomst | Betekenis |
|---|---|
| ✅ match | Waarde valt binnen de tolerantie van de bronwaarde × portiegewicht |
| ⚠️ afwijking | Buiten tolerantie → redactionele beslissing, met beide getallen in het rapport |
| ⚠️ geen claim | Voedingsmiddel haalt de drempel niet → hoort er waarschijnlijk niet in |
| ❌ niet gevonden | Geen bronrij te koppelen → handmatig een broncode toewijzen |
| ➕ kandidaat | Kwalificeert wél, staat niet in de registry → suggestie |

Tolerantie is een redactionele keuze (voorstel: 20% — bereidingswijze en variëteit veroorzaken
grotere spreiding dan meetfout). Het script **patcht niets automatisch**; het levert een rapport
en een voorgesteld `provenance`-blok dat je met de hand overneemt. De registry blijft door
mensen geredigeerd.

Uitbreiding van `FoodSource`:

```ts
interface FoodSourceProvenance {
  sourceId: string;      // "nevo-2025-9.0"
  sourceCode: string;    // broncode van het voedingsmiddel
  amountPer100: number;  // ongewijzigde bronwaarde
  basis: "per_100g" | "per_100ml";
  claimLevel: ClaimLevel;
  verifiedAt: string;    // ISO-datum
}
```

Zolang `provenance` ontbreekt, geldt de waarde als onbevestigd — dat is precies de blokkade die
de "VERIFY vóór livegang"-noot vandaag bedoelt, nu machinaal leesbaar in plaats van als
commentaar.

## 9. Renderregels

**Plaatsing.** In de informatiesectie of onder een stap, niet in de aanbevelingsflow. Minimaal
één volledige sectiescheiding tussen de bronnenlijst en een affiliate-CTA. Een voedingslijst
direct boven een koopknop leest als "voeding schiet tekort, vandaar dit supplement" — een
impliciete claim die nergens onderbouwd is.

**Weergave — herzien.** Toon per regel: naam, portie, hoeveelheid in die portie, en **%RI per
100 g** met het claimniveau. v0.1 verbood percentages omdat dat "richting innameadvies kantelt".
Dat is te streng en werkt averechts: 1169/2011 standaardiseert %RI juist, het is de meest
transparante weergave die bestaat, en het is letterlijk de rekengrootheid waarop de claim rust.
Weglaten maakt het blok minder navolgbaar, niet compliance-veiliger.

De grens ligt elders en blijft hard: **%RI per 100 g als eigenschap van het voedingsmiddel** mag;
**"je haalt X% van je dagbehoefte" als eigenschap van de gebruiker** mag niet. Verschil is het
onderwerp van de zin. Voor eiwit en omega-3 vervalt %RI en toon je het claimniveau zelf
(`bron van` / `rijk aan`).

**Portie versus 100 g.** De opgeslagen waarde is ongewijzigd per 100 g (licentie). De getoonde
waarde is per portie, uit `portion-dictionary.ts` — een eigen aanvulling, als zodanig herkenbaar.
Dit is geen omzeiling: de licentie verbiedt herberekening in de opgeslagen dataset, niet een
afgeleide weergave die als eigen aanvulling gemarkeerd is.

**Copy-register.** Beschrijvend, niet vergelijkend. Toegestaan: "Magnesium zit onder meer in deze
voedingsmiddelen." Niet toegestaan binnen dit blok: "aanvullend op", "als je dit niet genoeg
binnenkrijgt", of elke formulering die dit voedingsmiddel tegenover een supplement zet.
Vergelijkende voedingsclaims mogen onder 1924/2006 alleen tussen levensmiddelen van dezelfde
categorie; voeding versus supplement valt daarbuiten.

> **Reikwijdte van die regel — expliciet.** Hij geldt voor **dit blok**, niet voor het product.
> [`nutrition-advice.ts`](../../src/lib/nutrition-advice.ts) doet gap → leefstijlactie → gegate
> supplement, en dat is geen vergelijkende claim maar een volgorde. Die keten blijft ongewijzigd.
> Een naïeve lezing van de copy-regel zou hem verbieden; dat is een over-lezing.

**Lege staat.** Nutriënt zonder dekking in `coverage`, of zonder gekwalificeerde bronnen: het blok
rendert niet. Geen placeholder, geen "geen data beschikbaar".

**Bronvermelding.** `license.attributionNl` van elke gebruikte bron, altijd zichtbaar onder het
blok. Uit het adapterveld, nooit hardcoded in een component.

## 10. Wat expliciet buiten deze spec valt

- Merkgebonden producten (LEDA/NVIP) en supplementensamenstellingen (NES)
- Elke vorm van productscore of categorie-ranking (Nutri-Score/Yuka-model)
- Elke vorm van innameberekening of dagtotaal
- Koppeling aan leefstijlcheck-uitkomsten of aan `computeNutritionScore`
- Portiegroottes uit het aparte RIVM-portiebestand — `portion-dictionary.ts` blijft de bron
  voor porties, met eigen verificatie

## 11. Open beslissingen

| # | Vraag | Voorstel |
|---|---|---|
| 1 | Tolerantie bij verificatie | 20%; spreiding door bereidingswijze en variëteit is groter dan meetfout |
| 2 | Afwijking buiten tolerantie: bronwaarde overnemen of registry-waarde houden? | Bronwaarde overnemen, tenzij de registry-regel een bereidingsvorm beschrijft die de bron niet kent |
| 3 | Top-N per nutriënt in de UI | 6 — gelijk aan wat `FOOD_SOURCES` vandaag per nutriënt heeft |
| 4 | Sorteervolgorde | Aflopend op hoeveelheid per portie (staat er al zo in), met cap van 2 vlees-items in de lijst — spreiding is redactie, geen data |
| 5 | Vetten en oliën binnen scope? | Ja; olijfolie en vette vis zijn juist relevant voor omega-3 |
| 6 | Samengestelde gerechten | Uitsluiten — redactioneel zwak en portie-ambigu |
| 7 | Wanneer bouwen | **Herzien in v1.1:** naar voren. Dit is vergelijkingspagina-werk, geen cockpitwerk — geverifieerde voedingsbronnen op `/beste/*` zijn publieke onderbouwing. Hangt nog steeds aan niets in de cockpit en kan volledig los. |
| 8 | Bestandsvorm CSV of ODS | ODS, met eenmalige conversie naar een genormaliseerd tussenbestand (§6.4) |
| 9 | Omega-3 in scope houden? | Pas beslissen ná de dekkingscontrole §8.0 |
| 10 | Energie-code in NEVO | Lezen bij stap 1; de kolom bestaat en is 100% gedekt, alleen de code staat nog open |

## 12. Bouwvolgorde (nieuw in v1.1)

Vijf stappen, elk apart reviewbaar. Niets hiervan raakt de cockpit, de tier-gate of
`computeNutritionScore`.

| # | Stap | Klaar wanneer |
|---|---|---|
| 1 | Dekkingscontrole §8.0 en dedup-assert §6.5 | rapport op tafel; besluit over omega-3 genomen |
| 2 | `resolveClaimLevel()` als pure functie | unit-tests op alle drie de regelvormen uit §4.1, geen bronkennis in de functie |
| 3 | NEVO-adapter `src/data/nutrition/sources/nevo-2025.ts` | `license`-blok volledig, kolomnamen uit §6.4 geverifieerd tegen het bestand |
| 4 | `npm run check:food-sources` | rapport met de vijf uitkomsten uit §8; patcht niets |
| 5 | Provenance met de hand overnemen, `FOOD_SOURCES` uit dormant op één publieke pagina | blok rendert mét bronvermelding; `renderableSources()`-test groen |

**Meetpunt (stap 5).** Dit blok is de eerste plek waar herkomst en claimniveau zichtbaar worden.
Registreer een view- en een expand-event op het bronnenblok, zodat je kunt aflezen of de
onderbouwing achter een supplementkeuze überhaupt gelezen wordt. Registratie op de drie plekken
uit CLAUDE.md: `src/lib/events.ts`, `src/lib/intake-events-client.ts` en de allowlist in
`src/app/api/intake/events/route.ts`.
