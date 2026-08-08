# Besluit — Fit-prefs: “wat past bij jou” vs Consumentenbond-oordeel

> **Status: productlock. Geen code, geen schema, geen implementatieslice.**  
> Opgesteld 4 augustus 2026. Aanleiding: meetboog × persoonlijk kompas × Consumentenbond-oordeel.  
> **Aanvulling op** `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](BESLUIT_BEWEGING_PRODUCT_EN_IA.md)` en  
> `[beweging-keuze-consumentenbond-prebuild-v3-2026-08.html](beweging-keuze-consumentenbond-prebuild-v3-2026-08.html)`.  
> Merkanker: `[../core/BRAND_POSITIONING.md](../core/BRAND_POSITIONING.md)` — *Consumentenbond … maar dan voor jouw profiel*.

---

## 1. Noordster

> **Consumentenbond-oordeel is vast. Persoonlijke fit sorteert en filtert. Nooit één samengevoegd cijfer.**

Domeinscores (0–100) meten *hoe het gaat*. Fit-prefs meten *wat jij zwaar vindt bij een keuze*. Die mag je niet mengen in één balk of één “8,4 voor jou”.

---

## 2. Harde locks (niet heronderhandelen zonder PIVOT)


| #   | Lock                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | **Dual readout forever:** Bond = gecheckt / sterk / zwak / niet (of gelijkwaardig). Fit = sortering, filter, lens `Voor jou` — herschrijft het oordeel niet.                                         |
| L2  | **Geen samengevoegd fit×bond-cijfer.** Dat wordt quiz-met-affiliate-uitkomst.                                                                                                                        |
| L3  | **Fit-prefs ≤ 5 dimensies**, bij voorkeur **discrete ankers** (niet / beetje / belangrijk / doorslaggevend). Max 3 continue sliders als UI dat echt nodig heeft — geen breed 0–100-paneel in intake. |
| L4  | **Fit-prefs niet dumpen in dag-0-intake.** Domeinscores blijven SSOT voor prioriteit/urgentie/profiel. Fit hoort op **keuzemoment** (scherm B / advies) of als **korte post-reveal**-stap.           |
| L5  | **Meetboog:** vooraf = check (+ later optioneel dunne fit) · tijdens = **één** evaluatievraag in nurture/mail · eind = hermeting (+ optionele fit-herijking op 1 scherm).                            |
| L6  | **Ladder-split:** stepped-care + keuzecatalogus = JA op adviesmoment. Ordinale fase-/level-ladder (“fase 1 van 3”) = **KILL** (al in Beweging-besluit).                                              |
| L7  | **Moeite** = bijstelling *ná* voorstel (bv. “Ik doe de korte”), geen intake-as over alle dimensies.                                                                                                  |
| L8  | **Gender geen product-gate in datalaag.** Architectuur blijft gender-neutraal; content-lens is later een contentvraag.                                                                               |
| L9  | **Externe feedback-SaaS = DEFER.** Eerst eigen lichte fit/NPS-vraag; privacy/register-gate pas als conversie dat bewijst.                                                                            |
| L10 | **Scope nu:** eerst Beweging B/E volgens bestaande prebuild + pre-E audit. Fit-prefs generaliseren naar andere pijlers **ná** die track.                                                             |


---

## 3. Starterset fit-dimensies (max 4 tot B live is)

Alleen deze vier zijn “GO om te ontwerpen”; meer = PIVOT.


| Id            | Vraag (NL)               | Ankers                                      | Voedt                                                               |
| ------------- | ------------------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| `locatie`     | Dichtbij of online?      | bij_mij · online · maakt_niet_uit           | Lens Bij jou / Voor jou; postcode-pad                               |
| `begeleiding` | Alleen of met iemand?    | zelf · met_coach · maakt_niet_uit           | Type Dienst vs Basis; premium-deur C                                |
| `prijs`       | Wat mag het kosten?      | gratis_eerst · betaald_ok · kwaliteit_eerst | Filter betaalde kaarten; stepped care                               |
| `reviews`     | Hoe zwaar wegen reviews? | laag · midden · hoog                        | Sorteer-hulp binnen zelfde Bond-niveau — **nooit** Bond-niveau zelf |


`reviews` mag later dan de eerste drie als UI-budget krap is.

---

## 4. Lagenkaart (waar dit leeft)


| Laag                     | Job                                            | Fit-prefs?                          |
| ------------------------ | ---------------------------------------------- | ----------------------------------- |
| Persoon                  | Preferenties + prioriteit (engine of user-pin) | Ja — dun                            |
| Kompas / doe-surface (E) | Wat telt vandaag                               | Nee — geen fit-paneel               |
| Product/dienst (B)       | Opties kiezen                                  | Ja — lens + filter                  |
| Consumentenbond          | Vast oordeel + voortgang op gedrag             | Nee — oordeel onafhankelijk van fit |


---

## 5. Timing t.o.v. Claude-prompts en prebuild


| Actie                                                      | Nu?                              | Waarom                                                            |
| ---------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| Dit besluit + verwijzing in bestaande Claude-prompts       | **JA**                           | Zonder lock heropent elke chat het model                          |
| Nieuwe visie-/brainstorm-prompt naar Claude over fit-prefs | **NEE nu**                       | Vertraagt pre-E / E; heronderhandelt gelockte grond               |
| Pre-E audit / E-implementatie                              | **JA, met deze lock in context** | E heeft geen fit-UI; Claude mag fit niet in doe-surface smokkelen |
| B-implementatie of B-prebuild-revisie                      | **Dan wél gericht prompt**       | Lens `Voor jou` + dimensies uit §3; dual readout afdwingen        |
| Eigen fit-prefs UI / post-reveal / nurture-evaluatievraag  | **Later, eigen slice + prompt**  | Ná B/E-track                                                      |


**Regel:** lock eerst (dit doc). Aparte Claude-prompt over fit **pas** als je B of fit-UI ontwerpt — niet vóór de huidige prebuild-E-route, en niet als losse heropening van het hele plan.

---

## 6. Wat Claude wél / niet mag voorstellen

**Wel:** sortering binnen hetzelfde verdict-niveau; filterchips uit §3; één evaluatievraag in mail; fit-herijking naast hermeting.

**Niet:** Bond-score × fit-gewicht → één cijfer; fit-sliders in dag-0-intake; fase-ladder als motivatie; externe review-platform als waarheid; gender als schema-gate; fit-paneel op doe-surface E.