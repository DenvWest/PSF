# BESLUIT — Connection Profile v1: de identiteitslaag voor verbinding

> **Status:** ontwerp + bouwvoorstel. Vervangt het advies uit `BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md` §S9 over volgorde.

> **Datum:** 13 augustus 2026

> **Reeks:** `BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` (de gezondheidscheck — blijft gescheiden) · `BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md` (§G firewall, §S9 volgorde-correctie) · dit document (het profiel)

> **Noordster:** *Het systeem weet niet wie je bent. Het weet wat je hebt gekozen.*

---

## 0 · De twee vondsten in de opdracht, en de val erin

**Vondst 1 — brengen × ontdekken is het sterkste idee in deze hele reeks.** Vrijwel elk matchingproduct koppelt op *gelijkenis*: zelfde interesses, zelfde leeftijd, zelfde buurt. Gelijkenis vraagt dichtheid — je hebt veel mensen nodig voordat er twee genoeg op elkaar lijken. **Complementariteit vraagt dat niet.** "Ik kan houtbewerking" × "ik wil houtbewerking leren" is bij twee gebruikers al een match, en het is een *betere* match dan twee mensen die allebei van wandelen houden.

Dat corrigeert mijn eerdere cold-start-bezwaar op een tweede punt: complementair matchen werkt bij lage aantallen waar gelijkenis-matchen faalt. Het is daarmee niet alleen een aardig veld — het is de reden dat dit profiel überhaupt kan werken vóór er schaal is.

Ontwerpconsequentie: **brengen en ontdekken delen één vocabulaire.** Twee rollen, één lijst. Daardoor is de match een simpele doorsnede — `brengen(A) ∩ ontdekken(B)` — en niet een semantisch probleem dat om een vectordatabase vraagt.

**Vondst 2 — de eis "±2 minuten en dan meteen iets terug" is de echte ontwerpbeperking.** Hij dwingt twee dingen af: alles is aantikken (geen vrije tekst als dragende structuur), en **de opbrengst mag niet van andere gebruikers afhangen.** Dat tweede is de harde test. Een profiel dat pas iets oplevert als er genoeg anderen zijn, is een leeg formulier met een belofte.

**De val.** We hebben net vier `binnenkort`-beloftes van het verbinding-scherm gehaald omdat ze geloofwaardigheid kostten. Een profiel dat zegt *"later kun je hiermee mensen vinden"* is exact dezelfde fout, groter. **Lock: in v1 komt het woord matching, community of "later" niet voor in de gerenderde tekst.** Het profiel verdient zijn plek op wat het vandaag doet, of het wordt niet gebouwd.

---

## 1 · Wat ik schrap, en waarom

De opdracht vraagt om kritisch zijn. Vier categorieën uit de brief gaan eruit.

| Geschrapt | Reden |
|---|---|
| **Taal / talen** | Nederlandstalig product, Nederlandse doelgroep. Het veld doet pas iets als je erop filtert, en dat doen we niet. Toevoegen wanneer er bewijs is dat het knelt, niet ervoor. |
| **Werk- / studiesituatie** | Als *identiteit* is dit statussignalering met lage matchingwaarde. Het bruikbare deel — waar ben je goed in, waar kun je iemand mee helpen — zit al volledig in **Wat ik kan brengen**, en dáár is het bovendien actiegericht in plaats van een etiket. "Ik kan je helpen met een offerte" verbindt; "consultant" niet. |
| **Levensfase** | Twee bezwaren. Het praktische deel (kinderen thuis, wisseldiensten, met pensioen) zit al in **Beschikbaarheid**. En bij mannen 40–65 loopt "levensfase" onvermijdelijk richting scheiding, empty nest en verlies — gevoelig terrein dat we nergens voor nodig hebben. |
| **De vier sliders** (rustig↔sociaal, ontdekken↔verdiepen, leren↔delen, vaste groep↔nieuwe mensen) | Dit is zelf-typologie, en zelf-typologie is een persoonlijkheidslabel met een schuifje eromheen — het staat op je eigen blacklist. Het actiegerichte deel zit al in **Verbindingsvorm** (1-op-1 vs. groep) en in **brengen vs. ontdekken** (delen vs. leren). De sliders voegen een as toe die we moeten verdedigen en niet kunnen gebruiken. |

Eén categorie voeg ik **toe** die niet in de brief stond:

| Toegevoegd | Reden |
|---|---|
| **Wat ik al doe** | De goedkoopste sociale actie is niet iets nieuws beginnen maar iemand vragen bij iets dat er al staat. Dit veld maakt dat mogelijk ("je loopt dinsdag al — vraag er iemand bij"), personaliseert de opbrengst op dag één, en is later een sterk matchingsignaal: mensen die hetzelfde al dóén zijn makkelijker te koppelen dan mensen die hetzelfde *willen*. |

---

## 2 · De v1-set — tien categorieën

| # | Veld | Waarom waardevol | V1/V2 | Matchingwaarde | Privacy |
|---|---|---|---|---|---|
| 1 | **Interesses** | de ruggengraat van personalisatie; stuurt content, activiteiten en later groepen | **V1** | hoog | 🟢 |
| 2 | **Wat ik kan brengen** | complementariteit; werkt bij lage aantallen; geeft mensen een rol i.p.v. een behoefte | **V1** | **hoogst** | 🟢 |
| 3 | **Wat ik wil ontdekken** | de andere helft van de doorsnede; ook los bruikbaar voor contentaanbevelingen | **V1** | **hoogst** | 🟢 |
| 4 | **Wat ik al doe** | aanhaken bij bestaand ritme; sterkste voorspeller van daadwerkelijk samen iets doen | **V1** | hoog | 🟢 |
| 5 | **Verbindingsvorm** | 1-op-1 vs. groep, doen vs. leren, online vs. lokaal — bepaalt of een voorstel past | **V1** | hoog | 🟢 |
| 6 | **Beschikbaarheid** (4 blokken) | zonder overlap in tijd is elke match theorie | **V1** | hoog | 🟢 |
| 7 | **Gebied** (PC2/PC3) | lokale relevantie zonder adres | **V1** | hoog | 🟢 |
| 8 | **Reisafstand** | eigen keuze i.p.v. onze aanname; maakt "online" een gelijkwaardige optie | **V1** | midden | 🟢 |
| 9 | **Leeftijdsband** | de meest gevraagde filter in deze doelgroep ("niet met 25-jarigen"); band, nooit geboortedatum | **V1** | midden | 🟡 |
| 10 | **Zichtbaarheid** | in v1 vastgezet op privé — het veld bestaat, de keuze nog niet | **V1** | n.v.t. | 🟢 |
| — | Pseudoniem + avatar | pas zinvol als er iets zichtbaar ís; nu een belofte | **V2** | — | 🟢 |
| — | Taal · werk · levensfase · sliders | zie §1 | **geschrapt** | — | — |

Tien velden, waarvan zes multi-select uit een vaste woordenlijst. Invultijd: geschat 90–120 seconden.

---

## 3 · Exacte opties per categorie

### 3.1 · Gedeelde onderwerp-woordenlijst — dit is de kern

Eén lijst, **drie rollen**: interesse, brengen, ontdekken. Dat maakt de latere match een doorsnede in plaats van een taalmodel.

```
beweging_sport · buiten_natuur · koken_voeding · klussen_techniek ·
tuin_groen · muziek · kunst_cultuur · lezen_schrijven · fotografie ·
ondernemen_werk · geld_financien · technologie_ai · wetenschap ·
duurzaamheid · geschiedenis · reizen · auto_motor · spel_kaarten ·
vrijwilligerswerk · gezondheid_leefstijl
```

Twintig tags. Bewust grofmazig: fijnere tags maken de doorsnede leger, en dat is precies wat je bij lage aantallen niet wilt.

> ⚠️ **`gezondheid_leefstijl` als interesse is géén gezondheidsgegeven.** Het is een onderwerp waar iemand over wil lezen of praten, zelf aangevinkt — categorisch iets anders dan `CON_SOC`. Wel de reden dat §7 een expliciete regel bevat dat deze tag nooit als gezondheidssignaal mag worden gelezen.

**Rollen:**
- **Interesses** — "hier lees en kijk ik graag over" (stuurt content)
- **Wat ik kan brengen** — "hier kan ik iemand mee helpen of over vertellen" (stuurt complementariteit)
- **Wat ik wil ontdekken** — "hier wil ik beter in worden" (stuurt content én complementariteit)

### 3.2 · Wat ik al doe

Aparte, kleinere lijst — dit gaat over activiteiten met een ritme, niet over onderwerpen.

```
wandelen · fietsen · hardlopen · sportschool · teamsport · zwemmen ·
klussen_sleutelen · tuinieren · koken · muziek_maken · vrijwilligerswerk ·
vereniging_club · niets_vasts
```

`niets_vasts` is geen restcategorie maar een bruikbaar antwoord: het routeert naar de vlakken P1 en P3 in plaats van naar "vraag iemand erbij".

### 3.3 · Verbindingsvorm (multi)

```
een_op_een · kleine_groep · grotere_groep ·
samen_doen · samen_leren · kennis_delen ·
lokaal_ontmoeten · online · maakt_niet_uit
```

### 3.4 · Beschikbaarheid (multi, vier blokken)

```
doordeweeks_overdag · doordeweeks_avond · zaterdag · zondag
```

Bewust grof. Een uurroostertje is v3-precisie op v1-data en verlaagt de invulkans.

### 3.5 · Enkelvoudige velden

| Veld | Opties |
|---|---|
| **Gebied** | eerste 2–3 cijfers postcode (invoer), opgeslagen als PC2 |
| **Reisafstand** | `tot_5km` · `tot_15km` · `tot_30km` · `heel_nl` · `alleen_online` |
| **Leeftijdsband** | `35_44` · `45_54` · `55_64` · `65_plus` · `zeg_ik_liever_niet` |
| **Zichtbaarheid** | v1: hardcoded `prive`. Kolom bestaat, keuze niet. |

`zeg_ik_liever_niet` hoort erbij en moet er hetzelfde uitzien als de rest — het is de UI-vorm van dataminimalisatie.

---

## 4 · Wat bewust niet wordt verzameld

**Nooit, ook niet in V2 of V3:**

| Uitgesloten | Waarom |
|---|---|
| Diagnoses, aandoeningen, klachten, medicatie | art. 9; buiten het beoogde doel van dit profiel |
| `CON_*`-antwoorden, `connection_score`, `domain_scores`, urgentieniveaus, profiellabels | §7 — de firewall |
| Afgeleide gezondheidsclassificaties | idem |
| Psychologische of persoonlijkheidslabels, door ons toegekend | het profiel bestaat uit keuzes, niet uit oordelen |
| Automatisch geïnfereerde "sociale behoefte" | de inferentie die het hele ontwerp vermijdt |
| Exacte geboortedatum | band volstaat voor elk gebruik dat we hebben |
| Exact adres, GPS, realtime locatie | PC2 volstaat |
| Contactenlijst, telefoonnummer, e-mail van derden | nooit gegevens van iemand die geen gebruiker is |
| Profielfoto | zet het datingpatroon aan dat de rest uitschakelt |
| Vrije tekst als dragende structuur | onmodereerbaar, onmatchbaar, en een bewaarrisico zonder opbrengst |

**Vrije tekst, precies:** één optioneel veld van max 140 tekens ("waar wil je mee aan de slag?"), **niet indexeerbaar, niet matchbaar, nooit zichtbaar voor anderen, nooit in een event.** Het bestaat alleen zodat iemand kwijt kan wat niet in de tags past. Levert het bij review niets op, dan gaat het eruit.

---

## 5 · Drie soorten data — de harde regels

| | Wat | Regel |
|---|---|---|
| **A · User-declared** | alles in §3 | **Mag personalisatie en later matching sturen.** Dit is de enige klasse die identiteit mag vormen. |
| **B · System-derived** | bekeken onderwerpen, geopende vlakken, aangeklikte content | **Mag rangschikken, nooit labelen.** Nooit teruggeschreven naar het profiel, nooit getoond als "jij bent…", nooit alleen doorslaggevend. Bij tegenspraak wint A altijd. |
| **C · Gezondheidsdata** | `CON_*`, scores, urgentie, labels | **Staat volledig buiten deze laag.** Geen FK, geen join, geen import, geen afgeleide. |

Samengevat in één regel die op de muur kan: **A bepaalt, B rangschikt, C blijft buiten.**

**Waarom B in v1 niet gebouwd wordt:** gedragsafleiding is pas nuttig bij volume, en het is de snelste route naar een profiel dat de gebruiker niet herkent. Bouw A goed, meet gedrag apart voor productinzicht, en koppel pas als er een aantoonbare reden is.

---

## 6 · De onboarding — ±2 minuten, opbrengst zonder anderen

Zes stappen, elk één scherm, alles aantikken.

| Stap | Vraag | Interactie | Sec |
|---|---|---|---|
| 1 | "Waar gaat je aandacht naar uit?" | 20 tags, kies 3–6 | 25 |
| 2 | "Waar zou je iemand mee kunnen helpen?" | zelfde 20 tags, kies 1–4 | 20 |
| 3 | "Waar wil jij beter in worden?" | zelfde 20 tags, kies 1–3 | 15 |
| 4 | "Wat doe je al met enige regelmaat?" | 13 activiteiten, kies 0–4 | 15 |
| 5 | "Hoe zie je contact het liefst?" + "Wanneer kan het?" | vorm (multi) + 4 tijdblokken | 20 |
| 6 | "Waar zoek je het?" | postcodegebied + afstand + leeftijdsband | 20 |

**Stap 2 is de belangrijkste en de moeilijkste.** "Waar kun je iemand mee helpen" voelt bij deze doelgroep als opscheppen. De copy moet het omdraaien naar iets feitelijks:

> **Waar zou je iemand mee kunnen helpen?**
> Niet waar je de beste in bent — waar je genoeg van weet om iemand op weg te helpen. Dat is een lagere lat dan je denkt, en het is precies waar mensen elkaar op vinden.

### De opbrengst — direct, en zonder één andere gebruiker

> **Dit past bij jou**
>
> **Jouw onderwerpen** · Buiten & natuur · Klussen & techniek · Koken
>
> **4 artikelen** die hierbij aansluiten → *(bestaande inzichten-content, gefilterd op tag)*
>
> **2 manieren die bij jou passen** · Samen iets doen · Eén-op-één
> → uit de zes vlakken, gefilterd op je verbindingsvorm
>
> **Je eerste stap**
> Je loopt al wekelijks. Dat is het goedkoopste moment om iemand bij te vragen — je hoeft er geen uur voor vrij te maken.
> *(uit "wat ik al doe" × vlak P3)*
>
> **Wat je invulde blijft privé.** Niemand ziet dit; het bepaalt alleen wat wij je laten zien.

Elk van die vier blokken is berekenbaar uit **statische data plus het eigen profiel**. Nul afhankelijkheid van andere gebruikers, nul beloftes over de toekomst.

---

## 7 · De architecturale grens met CON_*

Documentatie is geen grens. Vier maatregelen, waarvan drie afdwingbaar:

1. **Aparte tabellen** — `cprofile_*`. Geen kolom, view of FK naar `intake_sessions`, `intake_domain_checkin` of `domain_scores`.
2. **Aparte module** — `src/lib/connection-profile/`. Mag `@/lib/intake-engine`, `@/lib/account-dashboard` en `@/lib/vitaliteit` **niet** importeren.
3. **Een test die dat bewaakt** — leest de bestanden onder `src/lib/connection-profile/` en `src/data/connection/` en faalt bij een treffer op `CON_`, `connection_score`, `domain_scores`, `intake_engine`, `urgency`, `profile_label`. Dit is de enige maatregel die overleeft als iemand over een jaar "even snel" iets koppelt.
4. **Aparte toestemming** — eigen consent-tekst en eigen `consent_records`-rij, los intrekbaar zonder de leefstijlcheck te raken.

**Wat wél gedeeld is: `account_id`.** Het is dezelfde ingelogde persoon, dus die koppeling is noodzakelijk en onschadelijk. Ze maakt een join technisch mogelijk — vandaar maatregel 3. Wanneer matching landt, komt er een pseudonieme projectie tussen (§9), zodat wat andere gebruikers zien nooit het account is.

**Extra regel:** de tag `gezondheid_leefstijl` mag nergens als gezondheidssignaal worden gelezen. Het is een onderwerpvoorkeur en niets anders.

---

## 8 · Datamodel — twee tabellen, geen migratiechaos

De brief noemt acht tabellen. Dat is te veel: zes daarvan zijn dezelfde vorm (profiel → meerdere tags) en horen één tabel te zijn met een discriminator. Nieuwe kenmerken toevoegen wordt dan een nieuwe `kind`-waarde plus een tag in de code — **geen DDL, geen migratie.**

```sql
create table public.cprofile_profile (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references public.accounts (id) on delete cascade,
  organization_id   uuid not null default '...' references public.organizations (id),
  area_pc2          text,                        -- '35', nooit volledige postcode
  travel_radius     text,                        -- enum-as-text
  age_band          text,                        -- enum-as-text, nullable
  visibility        text not null default 'prive',
  note              text,                        -- max 140, niet matchbaar
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (account_id)
);

create table public.cprofile_tag (
  profile_id  uuid not null references public.cprofile_profile (id) on delete cascade,
  kind        text not null,   -- interest | brengen | ontdekken | doet | vorm | beschikbaarheid
  tag_id      text not null,   -- verwijst naar de statische vocabulaire in src/data/connection/
  primary_key (profile_id, kind, tag_id)
);

create index cprofile_tag_match_idx on public.cprofile_tag (kind, tag_id);
```

**RLS deny-all, service-role only** — zelfde patroon als `pd_*` en `af_*`.

**De vocabulaire staat in `src/data/connection/vocabulary.ts`, niet in de database.** Git wordt de audit (wie wijzigde welke tag wanneer), `tsc` de validatie, en er is geen seed-script. Zelfde keuze als bij het aanbieder-besluit.

**Waarom deze vorm toekomstvast is:** de match die je later wilt maken is één query op één index —

```sql
-- brengen(A) ∩ ontdekken(B), zonder één regel AI
select b.profile_id
from cprofile_tag a
join cprofile_tag b on a.tag_id = b.tag_id
where a.profile_id = $1 and a.kind = 'brengen' and b.kind = 'ontdekken';
```

Geen vectordatabase, geen embeddings, geen model. Dat is precies wat je bedoelt met "bouw nu alleen de fundering".

---

## 9 · Wat welke velden later mogelijk maken

**Matching (V2+):** `brengen × ontdekken` is de motor. `beschikbaarheid` en `area_pc2 + travel_radius` zijn de filters die een match praktisch maken. `vorm` bepaalt of het voorstel een koffie, een groep of een videocall is. `age_band` is een filter die de gebruiker zelf zet, nooit wij.

**Community (V2+):** `interest` en `doet` vormen de natuurlijke groepen — een groep is een tag met genoeg mensen erin. Dat betekent dat communities *ontstaan* uit het profiel in plaats van dat iemand ze moet aanmaken, wat het klassieke lege-groep-probleem omzeilt.

**Avatar / persoonlijke assistent (V3+, alleen als het ooit zin heeft):** de drie rollen zijn precies de context die een assistent nodig heeft — waar je aandacht naar uitgaat, waar je goed in bent, waar je heen wil. Dat is een gestructureerde profielrepresentatie, geen vrije tekst, en dus zonder model bruikbaar. **Bouw hier nu niets voor.** Het staat hier alleen om te laten zien dat het datamodel het niet in de weg zit.

---

## 10 · Dashboard — geen profielscherm

Je voorkeur is juist, en er is een naam-val die ik expliciet wil markeren.

**Noem dit niet "Mijn Verbinding".** Dat bindt het profiel aan het gezondheidsdomein verbinding — precies de koppeling die §7 verbiedt, dan alleen in de naamgeving. Wie het zo noemt, legt over een jaar alsnog de join.

**"Mijn Profiel"** is ook fout: dat leest als accountinstellingen, en dan wordt het ingevuld met de motivatie van een adresformulier.

**Aanbeveling — drie oppervlakken, geen tab:**

| Waar | Naam | Wat |
|---|---|---|
| Instellen | **"Wat bij jou past"** | de zesstapsflow, eenmalig, daarna bewerkbaar |
| Terugkerend | **"Voor jou"** | het blok dat door het dashboard heen personaliseert |
| Identiteit | **"Jouw onderwerpen"** · Natuur · Techniek · Koken | één rij, altijd bewerkbaar, altijd zichtbaar wáár de personalisatie vandaan komt |

Die laatste rij is niet decoratief: het is de zichtbare verantwoording van elke aanbeveling. Wie snapt waaróm hij iets ziet, ervaart personalisatie niet als profilering. Dat is dezelfde regel als de herkomstlabels uit `§5B` van het sociaal-productdocument.

---

## 11 · Wat dit betekent voor de gezondheidscheck

Ongewijzigd, en bewust op afstand. De verbinding-check (W1–W10) is een **ander product met een ander doel**: hij meet leefstijl en geeft een prioriteitenvolgorde. Het profiel personaliseert en verbindt. Ze delen de gebruiker en verder niets.

Praktisch: de prebuild blijft de specificatie voor de check, de zes vlakken worden door beide gebruikt — het profiel filtert ze op vorm, de check ordent ze op antwoord — en `CONNECTION_PRIORITY_LAYERS` is de gedeelde bron. **Dat is een gedeelde *inhoud*, geen gedeelde *persoonsgegevens*.** Die scheiding is precies goed.

---

## 12 · BUILD THIS NOW

### Slice 1 — de fundering, zonder scherm

**Bouwen:**

1. `src/data/connection/vocabulary.ts` — de 20 onderwerptags, 13 activiteiten, verbindingsvormen, tijdblokken, afstands- en leeftijdsbanden. Getypeerd, met NL-labels. Eén bron.
2. `supabase/migrations/*_cprofile.sql` — de twee tabellen uit §8, RLS deny-all. **Uitvoeren via de Dashboard SQL Editor**, nooit `supabase db push`.
3. `src/lib/connection-profile/` — lezen/schrijven via `createSupabaseAdmin()`, plus `resolveProfileHighlights(profile)` die de vier opbrengstblokken uit §6 berekent uit statische data.
4. `src/lib/connection-profile/__tests__/firewall.test.ts` — de grenstest uit §7.3. **Deze eerst schrijven**, zodat de grens bestaat voordat er code is om hem te overtreden.
5. Consent-tekst `connection_profile_storage` in `consent-texts.ts`.

### Slice 2 — de flow en de opbrengst

6. De zesstapsflow, één scherm per stap, alles aantikken.
7. Het "Dit past bij jou"-resultaat.
8. `"Jouw onderwerpen"`-rij + `"Voor jou"`-blok op het dashboard.
9. Meetpunten: `cprofile_step_completed{step}` (waar valt hij af), `cprofile_completed{n_interest, n_brengen, n_ontdekken}` (is stap 2 te moeilijk — dat is de kernhypothese), `cprofile_highlight_click{kind}`.

### Expliciet NIET bouwen

| Niet | Waarom |
|---|---|
| Matching, doorsnede-queries, "mensen zoals jij" | geen zichtbaarheid, geen aantallen, geen moderatie |
| Zichtbaarheidsschakelaar | er is niets om zichtbaar voor te zijn; kolom staat vast op `prive` |
| Pseudoniem, handle, avatar | pas zinvol bij zichtbaarheid |
| Chat, groepen, uitnodigingen tussen gebruikers | DSA-last, en buiten scope |
| Gedragsafleiding (klasse B) | eerst A goed |
| Vectordatabase, embeddings, AI-assistent | de doorsnede is een SQL-join |
| Elke zin met "later", "binnenkort" of "matching" in gerenderde tekst | de fout die we net van dit domein hebben weggehaald |

### De ene meting die telt

`cprofile_completed` gedeeld door `cprofile_step_completed{step:1}`. Zakt dat onder ~50%, dan is het profiel te lang of is **stap 2** ("waar kun je iemand mee helpen") te confronterend. Dat is de enige aanname in dit ontwerp die ik niet uit bestaand bewijs kan afleiden, en dus het eerste dat gemeten moet worden.

---

## Open besluiten

**P1 · Bouwen we dit vóór of ná W1–W8 van de gezondheidscheck?** Deze twee concurreren om dezelfde tijd. **Advies: dit eerst** — minder gevoelig, sneller waardevol, en het compoundt (§S9). De check kan daarna, of niet.

**P2 · Blijft het vrije-tekstveld?** 140 tekens, niet matchbaar, alleen voor de gebruiker zelf. **Advies: bouwen en meten** — is de vulgraad laag of levert het niets bruikbaars op, dan bij de eerste review schrappen.

**P3 · Is `age_band` het waard?** Het is het enige 🟡-veld in de set. Het rechtvaardigt zichzelf alleen als er ooit op gefilterd wordt. **Advies: opnemen mét `zeg_ik_liever_niet`** — de doelgroep-JTBD ("niet met 25-jarigen") is reëel en het is de gebruiker die filtert, niet wij.

**P4 · Waar landt de instap?** Het profiel hoort niet onder het verbinding-domein te hangen (§10, naam-val). Kandidaat: eigen instap op de dashboard-home. Vraagt een IA-besluit dat buiten dit document valt.
