# Gate 6 — F1a-meetvenster: verdict

> **Besluit: PROVISIONAL.** Venster is 3 van 14 dagen vol. Geen productie-actie op de
> voorselectie. HERORDENEN + voorselectie blijven ongewijzigd staan tot 20 augustus 2026.
> Opgesteld 9 augustus 2026. Geen code in dit document.

---

## 1. Vensterstatus

| | |
|---|---|
| Referentiedeploy | `7d6205b` — *feat(beweging): GA4-meetpunten voor voorselectie-effectiviteit* |
| Deploy-moment | **2026-08-06 06:38 (UTC+2)** |
| Vandaag | 2026-08-09 |
| Verstreken | **3 van 14 dagen** |
| Venster vol op | **2026-08-20 06:38** |

**P1 (meetperiode, zodra vol):** 2026-08-06 t/m 2026-08-19 (14 dagen)
**P0 (baseline):** 2026-07-23 t/m 2026-08-05 (14 dagen)

Conform de beslisboom (venster < 14 dagen) is dit een **provisional read**. Zelfs een gunstig
cijfer vandaag is geen PASS: drie dagen bevat één weekend-vertekening en geen enkele
terugkeer-cyclus van een gebruiker die de check-in wekelijks doet.

---

## 2. Twee defecten in de gate-definitie — lees dit vóór je cijfers invult

De gate zoals afgesproken is op twee punten niet uitvoerbaar tegen de code die live staat.
Beide zijn hier gecorrigeerd; de correcties zijn verwerkt in de queries in §3.

### 2.1 De primaire KPI heeft géén P0-baseline — de Δ-regel vervalt

`accepted_default` en `preselect_source` zijn **in `7d6205b` zelf geïntroduceerd**
(`git log -S "accepted_default"` geeft precies één commit: `7d6205b`). Vóór 6 augustus 06:38
bestond de parameter niet.

Gevolg: `accepted_default_rate` over P0 is niet 0% — hij is **ondefinieerd**. GA4 rapporteert
de parameter voor alle P0-events als `(not set)`. Wie die als `false` telt, krijgt een
baseline van 0% en dus automatisch een Δ van +40 tot +70pp. Dat cijfer zou de gate halen
zonder iets te bewijzen.

**De regel `Δ accepted_default ≥ +10pp` is daarmee niet toepasbaar.** Twee eerlijke
alternatieven, met mijn aanbeveling:

| Optie | Regel | Oordeel |
|---|---|---|
| **A — absolute drempel** ✅ **GEKOZEN** | `accepted_default_rate` over volle P1 ≥ **60%** | De voorselectie bestaat om ingedrukt te worden. Onder 60% raadt hij vaker mis dan goed en is hij ruis; boven 60% draagt hij. Geen baseline nodig. |
| B — interne contrast | rate bij `preselect_source: "checkin"` vs `"plan"` | Meet iets anders: welke *bron* beter voorspelt, niet of voorselecteren werkt. Bewaar dit als vervolgvraag. |

> **🔒 LOCK — vastgelegd door Dennis op 2026-08-09, vóór enig P1-cijfer zichtbaar was.**
> Gate 6 slaagt op de primaire KPI bij `accepted_default_rate ≥ 60%` over de volle P1
> (2026-08-06 t/m 2026-08-19), gemeten zoals in §3.1. Deze drempel wordt niet herzien nadat
> het cijfer bekend is — dat is het hele punt van vooraf vastleggen.

### 2.2 Twee parameterwaarden in de gate-tekst bestaan niet in de code

| In de gate-tekst | In de code | Correctie |
|---|---|---|
| `choice IN ('herstel','matig','trainen','kort')` | `type StepAlternativeChoice = "herstel" \| "matig" \| "trainen"` (`MovementTodayHero.tsx:44`) | **`'kort'` bestaat niet.** `BESLUIT_BEWEGING_PRODUCT_EN_IA.md §H` plande `choice:"kort"`, maar de "Ik doe de korte"-knop is geïmplementeerd als `choice: "geen_tijd"` met `from`/`to` (`MovementTodayHero.tsx:403`) — en die hoort per gate-afspraak juist **niet** in de noemer. Noemer = 3 waarden. |
| `dashboard_vandaag_action_toggled WHERE state = 'done'` | payload is `{ domain, done: boolean, streak, surface }` (`use-daily-action-log.ts:117-122`) | Parameter heet **`done`** en is een boolean. Filter op `done = true`. Er is geen `state`-parameter. |

Bovendien: GA4 krijgt **geen `user_id`** mee — `AnalyticsLoader.tsx:71` doet een kale
`gtag('config', …)`. Een ratio over `distinct (account_id, date)` is in GA4 dus niet te
bouwen; GA4 telt devices (`client_id`). Zie §3.2 voor de twee bruikbare vormen.

### 2.3 De check-nudge staat op de bevriezingslijst — en slice 2 dooft hem

`claude-opus-beweging-versmelting-verdict-2026-08.md §I` (slice 1) bevriest in dit venster
expliciet drie dingen: **hero-copy, voorselectie-logica, én de check-nudge**.

De slice-2-spec §5 noemt als bedoeld gevolg: *"`showBeweegcheckNudge` in `BewegingScreen.tsx`
dooft zodra de check gedaan is"*. Dat is dezelfde check-nudge. Slice 2 raakt de hero niet — dat
is onafhankelijk geverifieerd (§2.4) — maar hij raakt wél één van de drie bevroren elementen.

**Hoe erg is dat?** Beperkt, maar niet nul, en de bias loopt de verkeerde kant op:

- De **primaire KPI** blijft schoon. `accepted_default` zit op `dashboard_vandaag_step_alternative`
  in de hero; de nudge is een link ernaast en verandert geen keuzegedrag binnen de kaart.
- De **regressiewacht** krijgt een lichte, gunstige vertekening. De nudge is een concurrerend
  klikdoel naast de hero. Hij verdwijnt alleen voor gebruikers die een volledige beweegcheck
  deden — een kleine groep — maar voor hen daalt de afleiding, wat de compleetie eerder omhoog
  dan omlaag duwt. Een PASS op de regressiewacht ná 20 augustus is dan deels aan slice 2 toe te
  schrijven, niet volledig aan HERORDENEN.

**Consequentie voor het verdict op 20 augustus:** noteer bij de regressiewacht hoeveel accounts
in P1 een volledige beweegcheck afrondden (`select count(distinct session_id) from
intake_domain_checkin where domain_key = 'movement_score' and created_at >= '2026-08-06'`).
Is dat aantal klein ten opzichte van de noemer, dan is de vertekening verwaarloosbaar en telt
de regressiewacht gewoon. Is het een substantieel deel, splits de regressiewacht dan op
check-gedaan versus niet.

Dit is geen reden om slice 2 uit te stellen — de fix is zichtbaar voor elke gebruiker die de
beweegcheck deed en nu ten onrechte "geen beweegcheck" te zien krijgt. Het is wel iets om
bewust te besluiten in plaats van per ongeluk te doen.

### 2.4 Onafhankelijke verificatie: slice 2 raakt de voorselectie niet

De slice-2-spec §4 corrigeert het versmelting-verdict §H/§I op het punt dat slice 2 "verandert
wat de hero voorstelt". Die correctie is hier nagerekend en klopt:

- `resolveRecommendedTodayChoiceKind(rcvFeel, recovery)` (`movement-today-choices.ts:326-348`)
  leest uitsluitend `RCV_FEEL` en de recovery-hint. Geen enkel pad naar `MOV2_CARD/VIG/SIT/STR`.
- `deriveMovementCurrent` wordt geconsumeerd door `LeefstijllijnSection`, `BewegingScreen`,
  `MovementCockpit` en `VoortgangDomeinScreen` — **niet** door `MovementTodayHero`
  (`grep -rn "deriveMovementCurrent" src/`).

De uitspraak in versmelting-verdict §I regel 265 (*"Slice 2 verandert wat de hero voorstelt en
mag dus niet in hetzelfde venster"*) is daarmee achterhaald door spec §4. Werk die regel bij,
anders blijft er een tegenstrijdige instructie in de bronnen staan.

---

## 3. De queries — exact, in te vullen door Dennis

Alle vier de cijfers moeten uit **hetzelfde** GA4-property en dezelfde tijdzone (UTC+2) komen.
Vensters lopen van 06-08 00:00 t/m 19-08 23:59 (P1) en 23-07 00:00 t/m 05-08 23:59 (P0).

### 3.1 Primaire KPI — voorselectie-acceptatie (alleen P1)

**GA4 › Verkennen › Vrije vorm**

- Dimensies: `Gebeurtenisnaam`, aangepaste dimensie `choice`, aangepaste dimensie `accepted_default`, aangepaste dimensie `surface`
- Statistiek: `Aantal gebeurtenissen`
- Filter: `Gebeurtenisnaam = dashboard_vandaag_step_alternative` **EN** `surface = kompas_beweging`
- Periode: 2026-08-06 t/m 2026-08-19

Vul in:

| choice | `accepted_default = true` | `accepted_default = false` | totaal |
|---|---|---|---|
| herstel | | | |
| matig | | | |
| trainen | | | |
| **subtotaal (noemer)** | **A =** | **B =** | **A+B =** |
| geen_tijd *(buiten de ratio — alleen ter context)* | — | — | |
| wijzig_keuze *(buiten de ratio — alleen ter context)* | — | — | |

`accepted_default_rate = A ÷ (A + B)` = **____ %**

> Als `accepted_default` niet als aangepaste dimensie is geregistreerd in de GA4-admin, is dit
> cijfer niet op te halen en moet dat eerst gebeuren — registratie werkt **niet** met
> terugwerkende kracht. Controleer dit **nu**, niet op 20 augustus.

Contextregel (geen gate-criterium, wel nodig om het cijfer te duiden): het aandeel
`geen_tijd` en `wijzig_keuze` in het totaal. Een hoge acceptatie naast veel `wijzig_keuze`
betekent iets anders dan een hoge acceptatie met bijna geen afwijkingen.

### 3.2 Regressiewacht — hero-compleetie mag niet dalen

Deze is **wél** over beide vensters te meten: `dashboard_vandaag_action_toggled` en
`dashboard_vandaag_card_shown` bestaan sinds `4c4dea7` (2026-07-21 15:54), dus twee dagen
vóór P0 begint.

**Vorm 1 — GA4, device-scoped (de gate-versie, uitvoerbaar vandaag)**

Twee verkenningen, beide met `Actieve gebruikers` als statistiek en `Datum` als dimensie:

- **Teller:** `Gebeurtenisnaam = dashboard_vandaag_action_toggled` EN `surface = kompas_beweging` EN `done = true`
- **Noemer:** `Gebeurtenisnaam = dashboard_vandaag_card_shown` EN `surface = kompas_beweging`

| | P0 (23-07 → 05-08) | P1 (06-08 → 19-08) | Δ |
|---|---|---|---|
| Gebruikers met `action_toggled{done:true}` | | | |
| Gebruikers met `card_shown` | | | |
| **compleetie-ratio** | **____ %** | **____ %** | **____ pp** |

**Vorm 2 — Supabase, account-scoped (durable cross-check, dichter bij de afspraak)**

`daily_action_log` heeft `account_id`, `domain`, `action_key`, `log_date` — dit is de enige bron
waarin `(account_id, date)` echt bestaat. Draaien in de Dashboard SQL Editor:

```sql
with periods as (
  select 'P0' as period, date '2026-07-23' as start_date, date '2026-08-05' as end_date
  union all
  select 'P1', date '2026-08-06', date '2026-08-19'
)
select
  p.period,
  count(distinct (l.account_id::text || l.log_date::text))
    filter (where l.domain = 'beweging')                      as beweging_account_days,
  count(distinct (l.account_id::text || l.log_date::text))    as actieve_account_days,
  round(
    100.0 * count(distinct (l.account_id::text || l.log_date::text))
      filter (where l.domain = 'beweging')
    / nullif(count(distinct (l.account_id::text || l.log_date::text)), 0),
  1) as ratio_pct
from periods p
join daily_action_log l
  on l.log_date between p.start_date and p.end_date
group by p.period
order by p.period;
```

Noemer hier is *accounts die die dag íets afvinkten* (elk domein), niet *dashboard-bezoek* —
dat laatste is server-side nergens vastgelegd. Het is een striktere noemer dan de GA4-versie
en dus een conservatievere lezing. Gebruik vorm 1 als het gate-cijfer en vorm 2 als
sanity-check; wijken ze sterk af, geloof de Supabase-versie voor de richting en de GA4-versie
voor het niveau.

**PASS-regressie:** Δ ≥ 0 pp. **FAIL-regressie:** Δ < 0 pp.

### 3.3 Bias-notities bij P0 — noteer ze bij het cijfer

- **P0 is geen rustig venster.** Op 4 en 5 augustus landden ~25 commits aan Mijn Dag, de
  agenda-timeline, de tijdkiezer en de dashboard-drawer (`git log --since='2026-08-04'`).
  Een deel van elke P0↔P1-verschuiving is dashboard-churn, niet de voorselectie.
- **De laatste ~4 uur van P0 is besmet.** `0afe695` (voorselectie zelf) ging live op
  2026-08-05 20:15, nog binnen P0. Het effect zit er dus al minimaal in — dat drukt de Δ naar
  beneden en maakt een PASS conservatiever, geen optimistischer.
- **P0 mist het `accepted_default`-veld volledig.** Zie §2.1.

---

## 4. Besluit

**PROVISIONAL.** Venster 3/14. Geen richting af te lezen: de primaire KPI heeft nog geen
volle week aan events en de gate-definitie moet eerst gerepareerd worden (§2.1, §2.2) voordat
een getal betekenis heeft.

Er is **geen** aanleiding om de voorselectie nu terug te draaien — er is niets dat een FAIL
aanwijst, en er is evenmin iets dat een PASS draagt. De juiste actie is wachten.

### Consequentie voor deploy-set 3

| | |
|---|---|
| **Deploy-set 3 (slice 2 + treden + brug) mag door** | ✅ Ja — **deploy-OK gegeven door Dennis op 2026-08-09**, met de vertekening uit §2.3 bewust geaccepteerd |
| **Waarom dit het venster niet breekt** | Geen van de drie raakt `MovementTodayHero.tsx`, de voorselectie-logica of de events die de gate meet. Slice 2 schrijft naar `intake_sessions.answers`; `preselect_source` wordt bepaald door `resolveRecommendedTodayChoiceKind()` en leest die velden niet — nagerekend in §2.4. Diff van `MovementTodayHero.tsx` = leeg is acceptatiecriterium 8. |
| **Wat het wél vertekent** | De check-nudge dooft voor wie een volledige beweegcheck deed — één van de drie bevroren elementen. Lichte, gunstige bias op de regressiewacht. Zie §2.3 voor de correctie bij het aflezen. |
| **Wat het wél doet** | Eén GA4-annotatie midden in het F1a-venster. Dat is bewust: één grens, drie wijzigingen, geen van drieën op de gemeten surface. Noteer in de annotatie dat gate 6 op dat moment PROVISIONAL was. |
| **Alternatief als je het venster schoon wil houden** | Deploy-set 3 uitstellen tot ná 20 augustus. Kost twee weken, koopt een annotatie-vrij venster. **Mijn advies: niet doen** — de gemeten surface wordt niet aangeraakt, en slice 2 dicht een frictie die vandaag zichtbaar is voor elke gebruiker die de beweegcheck deed. |

### Als de gate op 20 augustus FAIL wordt

Deploy-set 3 hoeft dan niet teruggedraaid: slice 2, de treden en de brug raken de voorselectie
niet. Plan in dat geval **slice 2b** apart — revert van de voorselectie-logica in
`MovementTodayHero.tsx` — vóór de eerstvolgende deploy die de hero aanraakt. HERORDENEN blijft
in alle gevallen staan.

---

## 5. Actielijst

| # | Actie | Wie | Wanneer |
|---|---|---|---|
| 1 | Bevestig `accepted_default` als aangepaste dimensie in GA4-admin | Dennis | **nu** — registratie werkt niet met terugwerkende kracht |
| 2 | ~~Bevestig drempel §2.1 optie A (≥ 60% absoluut)~~ | Dennis | ✅ vastgelegd 09-08 |
| 3 | ~~Deploy-OK voor set 3 bij PROVISIONAL~~ | Dennis | ✅ gegeven 09-08 |
| 4 | Cijfers §3.1 + §3.2 invullen | Dennis | 20-08 |
| 5 | Dit document afronden naar PASS/FAIL | Claude | 20-08 |
| 6 | Versmelting-verdict §I r.265 bijwerken (achterhaald door spec §4) | Claude | los, klein |
| 7 | Besluit: check-nudge-vertekening §2.3 accepteren of slice 2 uitstellen | Dennis | vóór fase C |

**Meetpunt:** `dashboard_vandaag_step_alternative{choice, accepted_default, surface}` (primaire
KPI) · `dashboard_vandaag_action_toggled{surface:"kompas_beweging", done:true}` t.o.v.
`dashboard_vandaag_card_shown{surface:"kompas_beweging"}` (regressiewacht) — hier lees je het
effect af.
