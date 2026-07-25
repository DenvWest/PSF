# Plan — Wekelijkse leefstijllog

> **Status:** besluit + fasering, klaar voor review. Opgesteld 23 juli 2026, geverifieerd tegen `main`.
> **Kern:** afgeleide read-laag boven bestaande logs. Geen nieuw invoerscherm, geen nieuwe tabel in fase A.
> **Geen codewijziging in dit document.**

## Verdict

| Vraag | Antwoord |
|---|---|
| Slim idee? | **Ja**, mits afgeleide read-laag boven de bestaande append-only logs — niet als formulier dat alles opnieuw vraagt. |
| Mag het? | **Ja**, binnen het bestaande art. 9-consentkader. Maar het register en de privacyverklaring hebben nú al gaten die je hiermee vergroot; dicht die in dezelfde PR. |
| Is het medisch? | **Nee** in klinische zin — geen dossier, geen diagnose. **Ja** als bijzondere persoonsgegevens (art. 9). Behandel het consequent als art. 9. |
| Verbinding + matching? | Productmatig sterk, juridisch de zwaarste variant. Kan niet meeliften op bestaand consent. Apart doel, aparte opt-in, DPIA-revisie. |
| Punten vs leeftijdsgenoten? | Al ontworpen in [`PLAN_VITALITEIT_PUNTEN_COMMUNITY.md`](PLAN_VITALITEIT_PUNTEN_COMMUNITY.md) §3.4/§7: alleen niet-gezondheidsartefacten — nooit domeinscores, banden of profiellabels. |

---

## 1. Het gat, geverifieerd

Er zijn drie lagen die niet samenkomen:

| Laag | Bron | Wie leest het |
|---|---|---|
| Dagelijkse uitvoering | `daily_action_log` (account-scoped) | Vandaag-hero, week-ritme, agenda-dots, stappenplan |
| Episodische meting | `intake_domain_checkin`, `intake_intake_log` | Leefstijllijn |
| Wekelijkse aggregatie | fragmentarisch: `?range=7`, `buildWeekRhythm()`, week-samenvatting bewegen | alleen beweging |

De sluitsteen ontbreekt: [`leefstijllijn.ts`](../../src/lib/leefstijllijn.ts) importeert alleen `PILLARS`, `domain-role` en types — **geen enkele gedragsbron**. De lijn beweegt dus uitsluitend op check-ins en het voedingslog, nooit op wat iemand dagelijks daadwerkelijk doet. Precies het closed-loop-gat dat de beweeg-blauwdruk ook noemt: gedrag loggen ≠ je lijn zien bewegen.

---

## 2. Architectuur — afleiden, niet dupliceren

Volg het patroon uit [`PLAN_VITALITEIT_PUNTEN_COMMUNITY.md`](PLAN_VITALITEIT_PUNTEN_COMMUNITY.md) §3.2 ("Agenda — MVP = afgeleid, geen nieuwe tabel").

`buildWeeklyLifestyleLog(accountId, isoWeek)` als pure read-functie in `src/lib/`:

| Bron | Wekelijkse metric |
|---|---|
| `daily_action_log` | dagen actief per domein, voltooide stap-ids |
| `movement_session_log` | minuten, sessies, modaliteitsmix |
| `intake_domain_checkin` | laatste hercheck-score per domein in die week |
| `intake_intake_log` | voedings-snapshot(s) |
| `plan_progress` | fase-/stap-transities — secundair, en pas betrouwbaar ná de bron-unificatie (zie §6) |

De gebruiker vinkt dagelijks af; de week is een **read-model**. Geen tweede invoermoment, geen tweede waarheid.

---

## 3. Twee meetlatten — niet mengen

| Meetlat | Wat het meet | Bron | Art. 9-gevolg |
|---|---|---|---|
| **Adherence** | % dagen met ≥1 actie t.o.v. je plandoel | `daily_action_log` | Gedrag, geen nieuwe gezondheidsmeting |
| **Beleving** | hoe je je voelt op een domein | `intake_domain_checkin` | Bestaande check-in-grondslag |

De Leefstijllijn kan beide tonen, maar **visueel gescheiden**. Adherence is geen score en mag er ook niet als score uitzien: iemand die zich beroerd voelt terwijl hij netjes afvinkt, moet dat verschil kunnen zien in plaats van het weggemiddeld te krijgen. Dit is dezelfde scheiding die [`PLAN_SOFTPILLAR_SELFEVAL_LOOP.md`](PLAN_SOFTPILLAR_SELFEVAL_LOOP.md) voorschrijft, en dezelfde reden waarom minuten uit de gedaan-log evidence zijn en nooit een tweede score.

Wekelijks opnieuw vijftien intake-vragen stellen is uitgesloten.

---

## 4. Juridisch — wat het is en niet is

**Wel:** gezondheidsgerelateerde gegevens onder art. 9 AVG (slaap, stress, beweging, voeding, verbinding, herstel). Bestaande grondslag = uitdrukkelijke toestemming; de drie relevante consent-types bestaan en worden vastgelegd: `health_data_processing` ([`intake-consent.ts`](../../src/lib/intake-consent.ts)), `domain_checkin_logging` ([`domain-checkin-consent.ts`](../../src/lib/domain-checkin-consent.ts)) en `account_storage` ([`account-storage-consent.ts`](../../src/lib/account-storage-consent.ts)).

**Niet:** geen medisch dossier (WGBO), geen diagnose, geen geautomatiseerde besluitvorming in de zin van art. 22 — adviezen blijven informatief.

**Belangrijk:** een afgeleide read-laag introduceert géén nieuw verwerkingsdoel zolang hij dezelfde gegevens voor hetzelfde doel toont aan dezelfde persoon. Fase A is daarmee juridisch licht. Zodra je gaat **delen** (peer, community) of **matchen**, is dat wél een nieuw doel met eigen opt-in.

---

## 5. Compliance-gaten — dicht dit in dezelfde PR

Het register beschrijft verwerkingen per **doel**, niet per tabel (18 entries, laatst bijgewerkt 21 juli 2026). "Tabel niet gevonden" is dus geen bewijs van een gat — maar deze drie zijn na controle wél echte gaten:

| Gat | Waarom het niet gedekt is |
|---|---|
| **`daily_action_log`** | Entry 11 "Leefstijlplan-voortgang" dekt expliciet `plan_progress`: *"Pseudoniem sessie-id"*, *"Bijzondere gegevens: Nee in `plan_progress` zelf"*. `daily_action_log` is **account-scoped** (`account_id` FK naar `accounts`) en is inmiddels de executie-SSOT. Andere scope, andere gevoeligheid — entry 11 is er niet op uit te rekken. Vraagt een eigen entry. |
| **Voedingslog (`intake_intake_log`)** | Nul treffers op *voeding*, *maaltijd* of *inname* in het hele register, terwijl de tabel sinds 10 juni bestaat en in juni een `nutrition_score` kreeg. |
| **`body_metrics`** | Dit is een **consent-type**, geen tabel ([`body-metrics-consent.ts`](../../src/lib/body-metrics-consent.ts), gebruikt door de eiwitdoel-kaart). Er wordt dus toestemming vastgelegd voor het verwerken van lichaamsgegevens, maar geen enkele register-entry beschrijft die verwerking. Een consent zonder registerregel is het lastigste soort gat om later uit te leggen. |

**Privacyverklaring loopt achter:** [`src/app/privacy/page.tsx`](../../src/app/privacy/page.tsx) staat op *4 juli 2026*, het register op *21 juli*. Bewegingssessie-log, domein-hercheck en de dagelijkse afvinkacties ontbreken publiek.

Zonder deze drie entries is fase A nog verdedigbaar (bestaande gegevens, bestaand doel), maar elke stap richting delen of peer-vergelijking maakt het gat aantoonbaar.

---

## 6. Volgorde t.o.v. de beweeg-blauwdruk

De wekelijkse log leunt op een betrouwbare fase- en gedragsbron. Uit [`BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md`](BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG.md) §1d: Vandaag en het stappenplan berekenen dezelfde fase uit **twee verschillende bronnen** (`plan_progress` versus daily-log-afgeleide staat). Zolang dat zo is, aggregeert een weekmodel over een inconsistente basis.

**Dus:** fase A komt ná slice **S5** (bron-unificatie), niet ervoor. S5b is de hermeting-haak; S6 is de sport-lens — die volgorde staat in §7 van de blauwdruk.

---

## 7. Fasering

| Fase | Wat | Risico | Nieuw doel? |
|---|---|---|---|
| **A** | `buildWeeklyLifestyleLog()` + sectie "Deze week per domein" in Voortgang. Geen nieuwe user-input. Register-entries + privacy-update in dezelfde PR. | laag | nee |
| **B** | Adherence-lijn naast de episodische score in de Leefstijllijn, visueel gescheiden. | laag | nee |
| **C** | Weekreflectie verbinding: één vraag per week via de check-in-route, opslag in `intake_domain_checkin` met `domain_key = connection`. | midden | nee (bestaand check-in-doel) |
| **D** | Punten + community: `points_ledger`, consent `community_sharing` (default uit), payload-allowlist punten/streaks/mijlpalen. | midden | **ja** |
| **E** | Wearables/HRV via de OAuth-gate uit [`ARCHITECTUUR_LIFESTYLE_PLANNER.md`](ARCHITECTUUR_LIFESTYLE_PLANNER.md) §15 — DPA en DPIA vóór activatie. | hoog | **ja** |
| **F** | Sociale matching. Alleen na A–D, met eigen DPIA-revisie en juridische review. | hoog | **ja** |

### Fase F — waarom apart

| Aspect | Vereiste |
|---|---|
| Doel | Nieuw: `social_matching` of vergelijkbaar |
| Consent | Apart en expliciet — nooit impliciet via intake of account |
| Minimalisatie | Alleen matching-attributen (regio, tijdvak, voorkeur groep/solo). Nooit ruwe domeinscores naar andere gebruikers |
| DPIA | Revisie, mogelijk AP-consultatie bij schaal |
| Copy | Coach-taal. "Eenzaamheid" is geen klinische term en wordt niet als label gebruikt |
| Techniek | Geen enkele user-to-user-functionaliteit in de codebase — dit is greenfield |

---

## 8. Wat bewust niet

- **Geen wekelijks invoerformulier** dat alles opnieuw vraagt. Dubbel werk, lagere adherence, en het breekt de "één invoermoment"-regel.
- **Geen domeinscores delen of vergelijken met leeftijdsgenoten.** Dat is art. 9-publicatie plus merkrisico. [`score-display.ts`](../../src/lib/score-display.ts) kent bewust geen leeftijdspercentielen.
- **Geen matching op eenzaamheid** zonder eigen doel, consent en DPIA.
- **Geen weekscore als enige waarheid.** Adherence ≠ beleving; twee meetlatten, gescheiden getoond.
- **Geen automatische planwijziging** op basis van een weekaggregaat — dat raakt dezelfde attributie- en vertrouwensgrens als de hermeting-haak.

---

Meetpunt: geen — dit document activeert niets. Fase A registreert zijn events bij implementatie (drievoudige client-event-registratie waar van toepassing).
