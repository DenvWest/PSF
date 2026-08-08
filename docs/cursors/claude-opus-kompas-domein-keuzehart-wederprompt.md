# Wederprompt — Kompas-domein keuzehart: vier correcties, drie besluiten, zeven open punten

> **Gebruik:** plak het blok onder **Prompt (copy-paste)** als **antwoord in hetzelfde Claude-gesprek** waarin verdict A–H is geleverd. Niet in een nieuw gesprek — dit wederwoord veronderstelt dat A–H in context staat.
> **Output:** alleen de herziene delen (A′, B′, C′, F′, G′) plus de nieuwe secties. Geen code.
> **Opgesteld:** 6 augustus 2026.
> **Vorige stap:** `[claude-opus-kompas-domein-keuzehart-prompt.md](claude-opus-kompas-domein-keuzehart-prompt.md)`

## Waarom dit wederwoord nodig is

Het verdict is grotendeels raak: HERORDENEN, de bewakingsgrens, de art. 9-lijn en het minimum van 8 opties zijn overgenomen. Vier dingen kloppen niet en zijn zo geformuleerd dat ze in de implementatie pas pijn doen.

**De ingang naar `#b` is verkeerd afgeleid.** Claude bewijst dat de first viewport met één vraag moet openen, en concludeert dat de deur naar `#b` alleen in de klaar-staat mag staan. Dat is een sprong: permanent zichtbaar zijn en in het eerste beeld staan zijn twee dingen. Zonder dat onderscheid blijft de keuze een beloning na afvinken, en dat is precies waarom het nu niet werkt. De enige deur die vandaag bestaat staat op Mijn Dag en zegt zelf dat de keuzelijst er nog niet is (`[AgendaDayTimeline.tsx:57](../../src/components/dashboard/agenda/AgendaDayTimeline.tsx)`).

**Het meetplan is intern inconsistent.** Bij slice 3 verwerpt Claude consent-vertekening en kiest server-side; bij slice 1 zet hij de kernmetriek op `dashboard.verdict_clicked` — een client-event dat zonder analytics-consent gedropt wordt. Dat event draagt bovendien `ingredient_key` en wordt alleen gebruikt door `[KompasOndersteuningTile.tsx:128](../../src/components/dashboard/kompas/KompasOndersteuningTile.tsx)` en `[SupplementVerdictPanel.tsx:128](../../src/components/dashboard/SupplementVerdictPanel.tsx)` voor supplementoordelen.

`**dashboard_vandaag_step_alternative` wordt semantisch overladen.** Die GA4-param draagt nu vijf waarden met één betekenis — dosis-bijstelling: `herstel`, `matig`, `trainen` (`[MovementTodayHero.tsx:44](../../src/components/dashboard/beweging/MovementTodayHero.tsx)`), plus `wijzig_keuze` (r375) en `geen_tijd` (r403). Er "deur naar #b" en "lens gewisseld" bij zetten maakt de reeks onleesbaar.

**Er ontstaan twee roadmaps.** Slice 1–5 leeft naast F0/F1a/F1b/F2/F3 uit `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` §I en de deploy-statusnotitie.

## Besluiten die Dennis vooraf nam

- **B1-plus**, niet B1-strikt: doe-staat opent met één vraag, maar de ingang naar `#b` staat permanent in de domein-header/rail.
- **Catalogus statisch in `src/data/` in slice 1**, met het doel-tabelschema nú vastgelegd zodat slice 3 geen herbouw is.
- **Stress en verbinding krijgen een dienst-first schap** (coaching, leefstijlbegeleiding, groepen, sociaal netwerk), niet een productschap.

---

## Prompt (copy-paste)

```text
Dank — A t/m H is scherp en het meeste gaat mee. Hieronder wat vaststaat, vier
correcties, drie besluiten van mij, en de punten die je nu moet sluiten.

Zelfde regels als daarvoor: geen code, geen diffs, geen JSX, geen SQL-DDL, geen
HTML-prebuild. Nederlands, identifiers Engels. Een tabelschema mag je als tabel in
proza geven (kolom | type | waarom), niet als create table.

Lever ALLEEN de gewijzigde en nieuwe delen: A′, B′, C′, F′, G′ plus de nieuwe
secties. Herhaal niet wat hieronder al vaststaat.

═══════════════════════════════════════════════════════════════════
VASTGESTELD — niet heropenen
═══════════════════════════════════════════════════════════════════

- HERORDENEN staat. De preselect blijft staan als regressiewacht; 0afe695 en
  7d6205b worden niet teruggedraaid.
- Trefzekerheid-readout: geschrapt als eigen feature. Zelfbeoordeling verhuist naar
  de hertest ("klopte ons voorstel") op 14/30 dagen. De budget-as vervalt als losse
  sortering en wordt fit-werk in #b.
- De bewakingsgrens staat exact zoals jij hem formuleerde: ≥ 10 procentpunt stijging
  in accepted_default:true tegenover Δ ≤ 0 op distinct (account, datum)-paren met
  daily_action_toggled{domain:"beweging", done:true} per actief account, over 14
  dagen versus de 14 ervóór. Account-dagen, geen rijen.
- Bond-as = bewijs over de optie. Fit-as = volgorde plus de "alleen als…"-conditie.
  Copy-correctie op de prebuild-chips, geen PIVOT.
- Gratis en nooit premium: bond-oordeel, keuze-catalogus, fit-lens, Favorieten,
  Mijn Dag-koppeling, hertest 14/30d. Premium = coach (arbeid) + trends (historie).
  Geen vierde entitlement. Zolang DARK_LAUNCH aan staat: beschrijving plus
  wachtlijstknop, nul lege sloten, meetpunt premium.waitlist_joined.
- Ervaringsvraag = art. 9. Registeruitbreiding van §18 moet gemerged zijn vóór de
  eerste 1–5 wordt weggeschreven, inclusief PDF-regeneratie. Gedragslog dagelijks,
  ervaringsvraag maximaal 1× per week, alleen in de klaar-staat, stopt bij de
  hertest op dag 14.
- Eenmalige opties (PT-intake) krijgen een status op het Favorieten-record en
  verschijnen nooit in daily_action_log. daily_action_log houdt het monopolie.
- Reminders: één globale tijd uit account_priority_pref.scheduled_time, kanaal
  e-mail, aan/uit, maximaal één per dag. Web-push en agenda-import blijven
  geparkeerd. movement.nudge_sent cron-only, dus alleen src/lib/events.ts.

═══════════════════════════════════════════════════════════════════
CORRECTIE 1 — B1-plus, niet B1-strikt (raakt B′ en F′)
═══════════════════════════════════════════════════════════════════

Je bewijst overtuigend dat de first viewport met één vraag opent. Daaruit volgt
NIET dat de ingang naar #b alleen in de klaar-staat mag staan. Dat zijn twee
verschillende eigenschappen:

  - inhoud van de first viewport  → één vraag, geen etalage. Akkoord, blijft.
  - persistentie van de ingang    → altijd bereikbaar, ook in de open staat.

Bewijs dat het huidige model faalt op de tweede, niet op de eerste: de enige deur
die vandaag bestaat is HELP_SHEET_NOTE op Mijn Dag (AgendaDayTimeline.tsx:57), die
letterlijk zegt "geen keuzelijst … een volledige hulpkeuze komt later", doorgegeven
als helperNote bij createOrigin "meer_hulp" (r548-550). Een deur die pas verschijnt
nadat je hebt afgevinkt, bestaat niet voor wie nog niet afvinkt — en dat is precies
de groep die iets anders nodig heeft.

Besluit: B1-PLUS. De ingang naar #b is een vaste ingang in de domein-header of de
context-rail (src/lib/context-rail.ts en
src/components/dashboard/cockpit/CockpitContextRail.tsx — die rail draagt vandaag al
beweging-specifieke tools), zichtbaar in elke staat, terwijl de first viewport
onveranderd één vraag stelt.

Wat jij nu moet leveren in B′:
- De vorm van die permanente ingang: plaats, label, en de copy per staat
  (first-run / open / klaar / al iets gekozen). Eén regel per staat.
- Waarom dit géén etalage wordt: wat maakt een ingang een ingang en geen schap.
- Het effect op je attributie-argument. Je stelde dat de vensters scheidbaar zijn
  zolang de first viewport niet verandert. De header verandert wél. Zeg of
  dashboard_vandaag_card_shown daarmee vervuild raakt, en zo ja: wat de correctie
  is (aparte impressie-teller op de ingang, of een verschoven baseline).
- Of de rail op mobiel (375px) überhaupt bestaat, of dat de ingang daar een andere
  vorm moet krijgen. Verifieer in de code, neem niets aan.

═══════════════════════════════════════════════════════════════════
CORRECTIE 2 — je meetplan is intern inconsistent (raakt G′)
═══════════════════════════════════════════════════════════════════

Bij slice 3 verwerp je client-side meten omdat het consent-vertekend is, en kies je
bewust server-side. Bij slice 1 zet je de kernmetriek — de oordeel-uitklap — op
dashboard.verdict_clicked, dat client-side is en dus precies die vertekening heeft.
Dat kan niet allebei.

Bovendien is dat event geen neutrale bus. Het loopt via emitIntakeClientEvent, staat
in de intake-allowlist (src/app/api/intake/events/route.ts:18), draagt ingredient_key
als payload, en wordt uitsluitend gebruikt door KompasOndersteuningTile.tsx:128 en
SupplementVerdictPanel.tsx:128 voor supplementoordelen. Er een catalogus-optie
doorheen duwen breekt het payload-contract en maakt de bestaande supplement-serie
onleesbaar, ook mét een surface-parameter.

Wat jij nu moet leveren in G′:
- Herzie het meetpunt voor de oordeel-uitklap in slice 1. Als een nieuw durable
  event nodig is, zeg dat, en zeg op welke plekken het geregistreerd moet worden.
  Server-side waar het kan.
- Formuleer de regel die je zelf al hanteerde, expliciet als contract: welke
  metriek mag op welke laag, en wanneer is hergebruik van een bestaand event
  schadelijker dan een nieuw type. Dat is de regel die dit soort fouten voorkomt.
- Loop alle acht meetpunten uit je tabel langs die regel. Ik verwacht dat er meer
  dan één sneuvelt.

═══════════════════════════════════════════════════════════════════
CORRECTIE 3 — semantische overlading (raakt G′)
═══════════════════════════════════════════════════════════════════

dashboard_vandaag_step_alternative draagt vandaag vijf waarden met één betekenis:
dosis-bijstelling. herstel / matig / trainen uit StepAlternativeChoice
(MovementTodayHero.tsx:44), plus wijzig_keuze (r375) en geen_tijd (r403).

Jij wil er choice:"keuzeladder" (deur openen) en choice:"lens" (sortering wisselen)
bij zetten. Dat zijn drie onverenigbare betekenissen in één param. De projectregel
"hergebruik bestaande event-types" bestaat om wildgroei te voorkomen, niet om
semantiek te stapelen — een param die drie dingen betekent is geen meetpunt meer.

Geef in G′ de grens: wanneer is iets dezelfde gebeurtenis met een andere waarde, en
wanneer is het een andere gebeurtenis. Pas die grens toe op deze twee gevallen.

═══════════════════════════════════════════════════════════════════
CORRECTIE 4 — twee roadmaps (raakt F′)
═══════════════════════════════════════════════════════════════════

Slice 1–5 staat los van de bestaande F-nummering in
BESLUIT_BEWEGING_PRODUCT_EN_IA.md §I (F1 / F2 / F3) en in
beweging-f0-deploy1-status-2026-08.md (F0 live, F1a in Deploy 2, F1b geparkeerd).
Twee nummeringen naast elkaar betekent dat over een maand niemand meer weet wat
"slice 3" was.

Lever in F′ één roadmap: map je slices op de bestaande F-fasen of vervang die
nummering expliciet, zeg wat er uit de oude roadmap sneuvelt of verschuift, en waar
F1b (de e-mailnudge) landt nu die jouw slice 5 is geworden.

═══════════════════════════════════════════════════════════════════
BESLUIT VAN MIJ — catalogus-opslag (raakt C′ en F′)
═══════════════════════════════════════════════════════════════════

Slice 1 gebruikt een statisch databestand in src/data/. Maar het doel-tabelschema
leg je NU vast, want ik wil dit over alle domeinen uitrollen en oordelen moeten
onderhouden worden — anders is slice 3 een herbouw in plaats van een uitbreiding.

Lever:
- Het doel-tabelschema als prozatabel: kolom | type | waarom. Denk minimaal aan
  option_key, domein, type (basis/dienst/product), rol (aanvulling/vervanging),
  verdict, onderbouwing, of wij eraan verdienen, en de herzieningsvelden.
- Hoe de verdict-store generaliseert van ingredient_key naar een optie-sleutel.
  De store draagt al rules_version en next_review_at
  (supplement-verdict-store.ts:13-14) en is nu getypeerd op IngredientClaimKey.
  Zeg wat er breekt en of dat één store wordt of twee naast elkaar.
- De vorm van het statische bestand in slice 1 zó dat het veld-voor-veld op dat
  schema past — geen conversie later.
- Het migratiemoment: bij welke slice, en op welk signaal (aantal opties, aantal
  domeinen, of het eerste oordeel dat herzien moet worden).

═══════════════════════════════════════════════════════════════════
BESLUIT VAN MIJ — stress en verbinding zijn dienst-first (raakt C′)
═══════════════════════════════════════════════════════════════════

Je bezwaar "leeg schap" gaat uit van een productschap. Dat is niet wat ik bouw.
Voor stress en verbinding is het schap dienst-first: coaching, leefstijlbegeleiding,
groepen, cursussen — en voor verbinding expliciet sociaal-netwerk-opties zoals
groepssport, buurtinitiatief, vrijwilligerswerk, of samen bewegen met iemand.

Dat past ook op je eigen constatering: stress staat op lifestyle_first
(domain-product-stance.ts:29-32) met de reden dat de check inname niet meet. Een
schap zonder supplementen is daar geen gat maar de logische uitkomst.

Beantwoord in C′:
- Dekt dienst-first de ondergrens van 8 eerlijk, of verschuift de ondergrens per
  optietype? Geldt "≥ 3 gecheckt/sterk, ≥ 3 zwak, ≥ 2 niet" per type of over types
  heen? En geldt "≥ 3 waar wij niets aan verdienen" nog als bijna alles dienst is?
- Welk oordeel-raamwerk toets je een dienst op? De prebuild noemt voor de
  begeleidingskaart drie assen: opzegtermijn, wie de begeleiding doet, en wat er na
  week 8 overblijft — als kwaliteitsregel op v3 regel 866 en uitgeschreven in de
  oordeel-uitklap op regel 876-879 (Gecheckt / Sterk / Zwak / Oordeel, met de
  commissieregel eronder op r881). Generaliseer dat naar een vaste, korte set assen
  per optietype
  (basis / dienst / product / sociaal), zodat het oordeel reproduceerbaar is en niet
  per kaart opnieuw bedacht wordt. Dit is het raamwerk dat de redactie gaat gebruiken.
- Een sociaal-netwerk-optie heeft geen aanbieder, geen opzegtermijn en geen
  commissie. Kan die een bond-oordeel dragen, of is dat een vierde optietype met een
  eigen toetslat? Beslis, en zeg wat het met de disclosure-regel doet als er niets
  te verdienen valt.
- Verbinding heeft geen eigen check (kompas-domain-actions.ts:109-110), en dat was
  je reden om het te blokkeren. Herzie dat in het licht van dienst-first: kan een
  schap eerlijk zijn zonder eigen basisadvies om iets "naast" te zetten? Als je bij
  blokkeren blijft: wat is de kleinste verbinding-check die het deblokkeert, waar
  hangt die in de meetboog, en welke slice wordt dat?
- PartnerDesk: je stelde zelf dat de lens "Bij jou" alleen uit pd_partners mag komen
  en nooit uit handwerk. Zeg wanneer in de roadmap dat kan, en wat de minimale
  pd_*-vulling is voordat die lens bestaansrecht heeft.

═══════════════════════════════════════════════════════════════════
WAT IK VAN JE WIL — output
═══════════════════════════════════════════════════════════════════

A′  Alleen als correctie 1 of 4 je verdict op het preselect-spoor verandert.
    Zo niet: één regel "ongewijzigd" en door.
B′  Surface-model met B1-plus: de vier staten, de permanente ingang (vorm, plaats,
    copy per staat), en het herziene attributie-argument.
C′  Contract herzien: dienst-first schap, oordeel-assen per optietype, sociaal als
    vierde type of niet, verbinding wel of niet gedeblokkeerd, doel-tabelschema en
    migratiepad, PartnerDesk-moment voor "Bij jou".
F′  Eén roadmap, F-nummering, met wat er sneuvelt en waar F1b landt. Maximaal 5
    stappen. Slice 1 bevat nu ook de permanente ingang.
G′  Meetplan herzien onder de laag-regel en de overladings-grens. Per stap één
    succes- en één schade-metriek, op dezelfde laag.
H′  Tegenspraak opnieuw, maar nu tegen DIT wederwoord. Waar zit B1-plus fout, waar
    zit dienst-first fout, en waar maakt het vooraf vastleggen van een tabelschema
    het product juist trager. Sluit af met wat jij zou doen als je alleen was.

Constraints ongewijzigd: geen code, locks uit BESLUIT_FIT_PREFS.md blijven staan,
geen samengevoegd fit×bond-cijfer, geen vierde entitlement, geen medische claims,
geen essay vóór A′.

Acceptatiecriterium:
- [ ] B′ scheidt first-viewport-inhoud van ingang-persistentie expliciet
- [ ] G′ bevat de laag-regel én de overladings-grens als toepasbaar contract
- [ ] G′ heeft alle acht oude meetpunten langs die regel gelegd
- [ ] C′ bevat een prozatabel met het doel-schema en een migratiemoment
- [ ] C′ heeft een vaste set oordeel-assen per optietype
- [ ] C′ beslist over verbinding: geblokkeerd of gedeblokkeerd, met reden
- [ ] F′ is één nummering, geen twee
- [ ] H′ valt dit wederwoord aan, niet je eigen vorige verdict
- [ ] Geen enkele regel code
```

---

## Na dit wederwoord

Als A′–H′ landt zonder nieuwe openingen, is het model klaar en volgt de eerste
implementatie-prompt: **slice 1** (keuze-staat als lees-staat + permanente ingang,
beweging, statisch databestand op het doel-schema). Die gaat als aparte prompt, nooit
samen met de Favorieten-opslag of de fit-lens.

**Meetpunt van dit document:** geen — besluitstuk. Het meetplan uit G′ hoort bij de
slices.