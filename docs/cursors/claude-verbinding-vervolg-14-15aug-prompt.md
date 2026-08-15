# Prompt — Verbinding vervolg 14-15 augustus: compliance-inhaalslag, Connection Profile slice 2, echte check W1-W4

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar een nieuwe Claude Code-sessie in deze repo. Geen Artifacts nodig — dit is direct-in-`src/`-werk, geen HTML-prebuild-iteratie.
> **Vereiste context (laat de sessie deze eerst lezen, in deze volgorde):**
>
> 1. `[BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md](../design/BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md)` — de check, de ladder, §C compliance-kader, L1-L4 alle BESLIST
> 2. `[verbinding-piramide-prebuild-v1-2026-08.html](../design/verbinding-piramide-prebuild-v1-2026-08.html)` — **is de bron**, geen mockup. `LAYERS`, `Q_LABELS`, `actionBudget()`, `resolveConnectionFocusLayer()`, `VANGNET` worden woordelijk overgenomen
> 3. `[BESLUIT_CONNECTION_PROFILE_V1_2026-08.md](../design/BESLUIT_CONNECTION_PROFILE_V1_2026-08.md)` — §8 datamodel, §12 slice 1 (klaar) + slice 2 (te bouwen)
> 4. `[BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md](../design/BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md)` — waarom Blok D hieronder NIET nu gebouwd wordt
>
> **Opgesteld:** 13 augustus 2026, na het opruimen van `VerbindingScreen.tsx` (optie C: dode beloftes weg, zelfselectie-ladder erin) en het bouwen van Connection Profile slice 1 (vocabulaire, datamodel, firewall-test — 30 tests groen).

---

## 0 · Waar we staan — lees dit voor je begint

Drie dingen zijn **klaar en gecommit** (7 commits op `main`, niet gepusht):

| Klaar | Waar |
|---|---|
| CON_SOC-schaalreparatie (`rules_version 1.6.0`) | `src/data/intake-questions.ts`, `src/lib/rules-version.ts` |
| Verbinding-piramide prebuild v1 (6 staten × 7 surfaces) | `docs/design/verbinding-piramide-prebuild-v1-2026-08.html` |
| `VerbindingScreen.tsx` gestript + zelfselectie-ladder | `src/components/dashboard/VerbindingScreen.tsx`, `ConnectionPriorityOverview.tsx` |
| Connection Profile slice 1 (vocabulaire, 2 tabellen, module, firewall-test) | `src/data/connection/vocabulary.ts`, `src/lib/connection-profile/` |

Drie dingen zijn **ontworpen maar nul regels gebouwd**:

| Niet gebouwd | Bewijs |
|---|---|
| De échte verbinding-check | geen `src/app/intake/verbinding/`, geen `connection-checkin`-API-route, `kompas-domain-actions.ts:108` zegt nog letterlijk `DEFER` |
| Connection Profile slice 2 (onboarding, API, dashboard-surfaces) | geen API-route, geen UI-component buiten de module uit slice 1 |
| DPIA/COMPLIANCE-dekking voor verbinding | **`docs/core/DPIA.md` noemt "verbinding" nul keer** — terwijl het domein al sinds 1 juli live staat (`121db26`, rules_version 1.3.0) |

Dat laatste is geen designkeuze die nog open staat — het is een **achterstand**. Begin daar.

**Migratie-blokkade:** `supabase/migrations/20260813120000_cprofile.sql` staat klaar maar is **niet uitgevoerd**. Blok B hieronder kan niet werken zonder die migratie. Als de sessie bij Blok B komt en de tabellen bestaan niet, stop en meld dat aan Dennis — draai het zelf niet via `supabase db push` (CLAUDE.md: remote CLI-historie is leeg, altijd via Dashboard SQL Editor, en dat doet Dennis).

---

## Prompt (copy-paste)

```text
═══════════════════════════════════════════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Je werkt in PerfectSupplement (perfectsupplement.nl), een supplementen-
vergelijker voor mannen 40+. Lees CLAUDE.md eerst — het overschrijft alle
standaardgedrag. Kernregels die hier extra hard gelden:

  · NOOIT automatisch committen. Stop na elke blok zodat Dennis kan reviewen.
  · Verifieer met tsc --noEmit + vitest + eslint --max-warnings 0 (klaar-check
    skill) NA ELK BLOK, niet pas aan het eind.
  · grep -rn "console.log" src/ moet leeg zijn vóór je een blok afrondt.
  · Bij elke nieuwe CTA/knop/keuze-vertakking: bouw het meetpunt in DEZELFDE
    wijziging (domain_events → 3 registratieplekken; GA4 trackEvent behoeft
    dat niet, zie DomainLifestyleLadder.tsx als precedent).

Werk de vier blokken hieronder in volgorde af. Stop na elk blok en rapporteer
kort wat er klaar is, wat je hebt getest, en het meetpunt (per CLAUDE.md-regel
"Meld bij elke afronding"). Ga NIET door naar het volgende blok zonder
akkoord — dit is geen los-lopende taak maar vier losstaande reviewmomenten.

═══════════════════════════════════════════════════════════════════════════════
BLOK A — Compliance-inhaalslag (verwacht: ochtend 14 aug, ~1-2 uur)
═══════════════════════════════════════════════════════════════════════════════

Puur documentatie, nul code-risico, geen afhankelijkheden. Dit dekt een
bestaand gat: verbinding draait al sinds 1 juli in productie zonder DPIA-rij.

A1. docs/core/DPIA.md — §1.3 Categorieën persoonsgegevens krijgt een rij:
    "Verbinding-checkin (CON_SOC, bestaand sinds rules_version 1.3.0) —
    Ja, gezondheidsgegevens". Volg het patroon van de bestaande rijen voor
    slaap/stress in dezelfde sectie exact.

    §3 Risico's krijgt R8, letterlijk uit BESLUIT_VERBINDING_PIRAMIDE_V1 §C3:
    "Vragen over sociaal contact raken schaamte en worden als beoordeling
    gelezen. Kans: middel. Impact: middel. Maatregel: geen toestandslabels,
    geen klinische afkap, zelf-kalibratievraag (CON_FIT) die 'weinig contact
    als eigen keuze' expliciet valide maakt, één neutrale doorverwijsregel
    zonder trigger-copy, geen e-mailnurture op een laag verbinding-antwoord."

    Voeg ook een rij toe voor het Connection Profile (los van CON_SOC):
    "Connection Profile (cprofile_*, vanaf 13 aug) — Nee, gewone
    persoonsgegevens (art. 6), bewust GEEN gezondheidsgegevens — zie
    BESLUIT_CONNECTION_PROFILE_V1 §7 firewall."

A2. docs/core/COMPLIANCE.md — nieuwe sectie "Verbinding" naar het patroon van
    de bestaande secties. Moet minimaal bevatten:
      · Geen EFSA-claim koppelt een voedingsstof aan sociaal contact — nooit
        een schap op dit domein, structureel (§C6 van het besluitdoc)
      · Verboden woorden uit §I van het besluitdoc (eenzaam, isolatie, etc.)
      · Connection Profile is GEEN gezondheidsdata — vermeld de firewall
        expliciet zodat een toekomstige lezer niet per ongeluk CON_* en
        cprofile_* aan elkaar knoopt

A3. Check of consent-texts.ts een verwijzing naar deze twee nieuwe DPIA-rijen
    nodig heeft (waarschijnlijk niet — domain_checkin_logging en
    connection_profile_storage bestaan al) — alleen aanpassen als er
    daadwerkelijk een gat is, niet preventief.

Verifieer: dit zijn .md-bestanden, geen tsc/vitest nodig. Wel: lees de
volledige sectie terug en controleer dat er geen verboden woord uit §I
(BESLUIT_VERBINDING_PIRAMIDE_V1) in je eigen nieuwe tekst staat.

STOP. Rapporteer. Wacht op akkoord voor Blok B.

═══════════════════════════════════════════════════════════════════════════════
BLOK B — Connection Profile slice 2 (verwacht: rest van 14 aug)
═══════════════════════════════════════════════════════════════════════════════

VOORWAARDE: vraag eerst of supabase/migrations/20260813120000_cprofile.sql
al is uitgevoerd via de Dashboard SQL Editor. Zo niet: STOP hier, meld het,
ga niet verder — je kunt dit niet zelf draaien (CLAUDE.md).

Bron: BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §6 (de flow), §10 (dashboard-
plaatsing, "geen los profielscherm"), §12 slice 2.

B1. API-route src/app/api/account/connection-profile/route.ts
      · GET: loadConnectionProfile(accountId) uit de bestaande store.ts
      · POST: saveConnectionProfile(accountId, body) — normalizeProfileInput
        zit al in store.ts, hergebruik hem, voeg geen tweede validatielaag toe
      · Consent-gate: connection_profile_storage uit consent-texts.ts (staat
        al klaar sinds slice 1) — volg het patroon van een bestaande
        account-API-route qua auth/session-check (zoek een precedent in
        src/app/api/account/)
      · Service-role only via createSupabaseAdmin(), zoals de rest van deze
        module. GEEN aanraking van intake_sessions of CON_*-tabellen — de
        firewall-test in src/lib/connection-profile/__tests__/firewall.test.ts
        moet groen BLIJVEN, niet alleen nu groen zijn.

B2. Zesstapsflow — component(en) onder src/components/account/ of een nieuwe
    map src/components/connection-profile/ (kies zelf, wees consistent met
    hoe vergelijkbare multi-stap-flows in deze repo zijn opgezet — kijk naar
    het patroon van IntakeQuestion/IntakeIntro voor de stap-navigatie-vorm,
    kopieer niet de intake-specifieke logica).
      Stappen exact uit §6: interesses (3-6) → brengen (1-4) → ontdekken
      (1-3) → wat doe je al (0-4) → vorm+beschikbaarheid → gebied+afstand+
      leeftijdsband. Alles aantikken, geen vrije-tekst-verplichting.
      Optioneel 140-tekens-veld mag in stap 6 of een losse afsluitstap.

B3. Resultaatscherm "Dit past bij jou" — resolveProfileHighlights() uit
    highlights.ts (bestaat al, getest) rendert de vier blokken uit §6. GEEN
    nieuwe logica hier, alleen render.

    HARDE EIS, letterlijk uit het besluitdoc: dit scherm bevat NERGENS de
    woorden "later", "binnenkort", "matching" of "community" — dat is precies
    de fout die net uit VerbindingScreen is gehaald. Er staat een test die dit
    voor highlights.ts al afdwingt (highlights.test.ts); zorg dat de
    component die tekst niet zelf alsnog toevoegt buiten wat highlights.ts
    teruggeeft.

B4. Dashboard-plaatsing — §10, DRIE oppervlakken, GEEN eigen tab:
      · Instellen: ingang "Wat bij jou past" in CockpitProfileMenu.tsx, BOVEN
        het bestaande "Instellingen"-item (zie MENU_ITEM-patroon in dat
        bestand — het menu heeft nu precies twee items, dit wordt de derde)
      · Terugkerend: een "Voor jou"-blok — kies zelf een logische plek op de
        dashboard-home, klein beginnen (één CockpitTile is genoeg voor nu)
      · Identiteit: "Jouw onderwerpen"-rij, altijd bewerkbaar — mag in
        dezelfde tegel als "Voor jou" zitten in v1, hoeft geen aparte
        component te zijn

    LOCK: noem GEEN van deze drie oppervlakken "Mijn Verbinding" of "Mijn
    Profiel" — zie §10 van het besluitdoc voor waarom. Gebruik de drie namen
    hierboven letterlijk, of vraag als een betere naam zich aandient.

B5. Meetpunten — drie nieuwe events, GA4 trackEvent volstaat (zelfde patroon
    als verbinding_ladder_layer_open, geen domain_events-allowlist nodig):
      · cprofile_step_completed{step} — waar valt de flow af? Dit is de
        kernmeting uit het besluitdoc.
      · cprofile_completed{n_interest, n_brengen, n_ontdekken}
      · cprofile_highlight_click{kind}

    Meld bij afronding expliciet: "Meetpunt: cprofile_step_completed —
    hier lees je af of stap 2 ('wat kun je brengen') te confronterend is."
    Dat is letterlijk de enige aanname in het hele ontwerp die niet uit
    bestaand bewijs volgt (§S8/§12 van het besluitdoc).

Verifieer: klaar-check skill volledig (tsc + vitest + lint + console.log-grep).
Draai specifiek ook src/lib/connection-profile/__tests__/firewall.test.ts en
bevestig dat hij nog steeds slaagt — dat is de garantie die niet stilzwijgend
mag verzwakken.

STOP. Rapporteer. Wacht op akkoord voor Blok C.

═══════════════════════════════════════════════════════════════════════════════
BLOK C — De échte verbinding-check, W1-W4 (verwacht: 15 aug)
═══════════════════════════════════════════════════════════════════════════════

Dit is de grootste blok en dekt NIET de hele W1-W10 uit
BESLUIT_VERBINDING_PIRAMIDE_V1 §K — alleen W1-W4. W5-W10 (Voortgang-tak,
Kompas-tak, meetpunten, DPIA-detail, artikel, premium-plan) zijn een
vervolgprompt, niet dit tweedaagse blok. Zeg dat expliciet als je klaar bent
met W1-W4 — verzin niet zelf dat je "ook meteen W5 doet".

BRON: verbinding-piramide-prebuild-v1-2026-08.html IS de spec. Niet
herinterpreteren, niet "verbeteren" — woordelijk overnemen zoals de
prebuild dat zelf al zegt in zijn eigen commentblok bovenaan (lock 1).

W1 · src/data/connection-checkin/index.ts
      V1-V8 uit de prebuild (Q_LABELS + de acht vraagobjecten V1-V8 uit
      §D2 van BESLUIT_VERBINDING_PIRAMIDE_V1). V1 = CON_SOC, WOORDELIJK
      gelijk aan het bestaande item in intake-questions.ts (inclusief de
      1.6.0-gerepareerde schaal 4/3/2/1) — dit is de ENIGE scoredrager.
      V2-V8 zijn nieuw, gaan naar raw_inputs, sturen NOOIT de score.

      LET OP besluit L7 uit de prebuild-notities: CON_CONF (V5) krijgt de
      waarden 4/3/2/1, NIET 4/4/2/1 zoals de oorspronkelijke besluittekst
      suggereerde — dat zou dezelfde meetfout herintroduceren die net bij
      CON_SOC is gerepareerd. De prebuild-JS (Q_LABELS.CON_CONF) heeft dit
      al goed staan; gebruik die versie, niet de oude besluittekst.

      leefstijlcheck-evidence.ts uitbreiden met de nieuwe velden, patroon
      van het bestaande CON_SOC-blok (regel ~595) volgen.

W2 · src/data/connection/lifestyle-priorities.ts BESTAAT AL (uit de
      VerbindingScreen-strip-opdracht) — dit is al de W2-databron, woordelijk
      uit de prebuild LAYERS. NIET opnieuw aanmaken. Wel toevoegen:
      src/lib/connection-ladder.ts — resolveConnectionFocusLayer() en
      resolveConnectionLayerStates() 1:1 overgenomen uit de prebuild
      (regels rond "RESOLVER" in het JS-blok), inclusief actionBudget().

      Spiegel het patroon van sleep-ladder.ts (resolveSleepFocusLayer) qua
      bestandsvorm — lees dat bestand als referentie voor de vorm, niet voor
      de inhoud.

W3 · ConnectionCheckin.tsx + src/app/api/intake/connection-checkin/route.ts
      Consent-verplicht (domain_checkin_logging, bestaat al), rate-limited
      zoals sleep-checkin/route.ts, service-role, domain_key =
      "connection_score" in intake_domain_checkin (geen migratie nodig —
      domain_key is text zonder CHECK-constraint, bevestigd in het
      besluitdoc §G).

      HARDE EIS: de vangnetregel (CONNECTION_SAFETY_NET_LINE, bestaat al in
      src/data/connection/lifestyle-priorities.ts) staat op ELKE staat van
      dit component, ook C4 (CON_FIT=4, geen winst-laag) en zelfs de
      lege/geen-check-staat. Niet-conditioneel — dat is besluit L2, gelockt.

W4 · ConnectionCheckinReadout.tsx
      Byte-identiek patroon aan hoe SleepCheckinReadout / de bestaande
      readout-componenten SSOT tussen check-in-resultaat en Voortgang delen
      (lock 9 in de prebuild: ".checkin-readout is byte-identiek op VR en VL,
      alleen het gewicht van de vervolg-affordance verschilt"). Delta op
      letterlijke antwoordlabels, geen scores, geen "band"-woorden — kill-
      lijst uit §I van het besluitdoc volgt.

      GEEN RING (besluit uit de prebuild, lock 8): de stand toont het eigen
      antwoordlabel plus de neutrale badge "Jouw ijkpunt" — het `own`-patroon
      uit beweging (MOVEMENT_FACT_STATUS_LABELS), niet KompasDomainGauge.

      LET OP: dit is een nog-open besluit (L5 in de prebuild-notities,
      niet formeel BESLIST zoals L1-L4). Bouw het zonder ring zoals de
      prebuild het toont, maar meld expliciet in je rapportage dat dit een
      aanname is die Dennis nog moet bevestigen — niet stilzwijgend
      doorbouwen alsof het net zo vast staat als L1-L4.

NIET IN DIT BLOK (W5-W10, expliciet uitstellen):
  · VoortgangDomeinScreen-tak + DomainLifestyleLadder domain-type uitbreiden
    naar "verbinding" (W5)
  · kompas-domain-actions.ts DEFER-tak vervangen (W6)
  · domain_events-registratie voor de check zelf (W7) — LET OP: dit is
    anders dan de GA4-events uit Blok B; connection_checkin_completed hoort
    WEL in de 3-registratieplekken-allowlist omdat dat een domain_event is,
    geen losse GA4-trackEvent. Behandel dat in W7, niet nu.
  · Artikel (W9), premium-plan (W10)

Verifieer: volledige klaar-check. Draai ook een handmatige controle: render
elke van de zes acceptatiestaten uit §J van BESLUIT_VERBINDING_PIRAMIDE_V1
(C1 eerste check, C3 laagste antwoord = precies 1 actie, C4 CON_FIT=4 = nul
acties) en bevestig dat de React-implementatie hetzelfde gedrag vertoont als
de prebuild-JS voor dezelfde staat — niet alleen "compileert zonder fouten".

STOP. Rapporteer. Dit is het einde van het tweedaagse blok.

═══════════════════════════════════════════════════════════════════════════════
BLOK D — EXPLICIET NIET NU (zodat niemand het per ongeluk oppakt)
═══════════════════════════════════════════════════════════════════════════════

  · Gelegenheden-gids + drempelkaart (F3/F4 sociaal product) — blokkeert op
    S5 (wie doet de redactie, organisatorisch besluit, geen coderegel) en
    op W1-W10 hierboven (de gids hangt aan actionBudget uit de echte check).
  · Uitnodiging-opsteller (F1 sociaal product) — kan technisch los, maar
    hoort na de echte check zodat hij aan een winst-laag kan hangen in
    plaats van aan de zelfselectie-ladder die straks vervangen wordt.
  · Model G (online matching, firewall, avatar) — apart traject, drie
    voorwaarden nog niet vervuld (§S7 sociaal-product-besluit).
  · L0 uit BESLUIT_VERBINDING_PIRAMIDE_V1 (het oude DEFER-route-a/b/c-
    besluit) — is INHOUDELIJK AL INGEHAALD door de VerbindingScreen-strip
    (optie C, self-selectie i.p.v. gedegradeerde CON_SOC-ladder). Stel
    Dennis voor dit besluit als "vervallen, zie S8" te markeren in het
    besluitdoc zelf — niet zelf herschrijven zonder akkoord, het is zijn doc.

═══════════════════════════════════════════════════════════════════════════════
```

---

## Waarom deze volgorde, kort

**Blok A eerst, niet als afsluiter.** DPIA-schuld die al drie weken loopt is geen "nice to have onderaan" — het is het enige blok met externe blootstelling als het blijft liggen, en het kost een uur, geen dag.

**Blok B vóór Blok C**, ondanks dat Blok C (de échte check) de grotere, "belangrijkere" bouw lijkt. Reden: Connection Profile slice 1 staat al klaar en getest — slice 2 afmaken levert een compleet, verzendbaar stuk op in één dag. De echte check is 8-10 slices in het oorspronkelijke plan; een halve W1-W4 zonder W5-W8 is geen bruikbaar tussenresultaat voor een gebruiker (er is dan een check zonder dat hij ergens vandaan bereikbaar is). Eerst iets afmaken, dan aan iets groters beginnen.

**Blok C is bewust afgekapt op W4.** Alles verder (W5-W10) is een eigen vervolgprompt — dat voorkomt dat "sterke prompt die alles dekt" verandert in een prompt die te veel belooft voor twee dagen en daardoor overal half werk oplevert.
