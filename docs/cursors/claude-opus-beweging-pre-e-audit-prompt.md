# Prompt — Pre-E audit: wat moet kloppen vóór je `#e` (of B) bouwt

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek).  
> **Output:** uitsluitend audit-verdict + geordende werklijst — **geen code, geen diffs, geen implementatie**.  
> **Opgesteld:** 4 augustus 2026.  
> **Doel:** vóór je `#e` (Elke dag daarna) of B (Maak een keuze) laat implementeren: vaststellen wat in de live repo al dicht is, wat nog open staat, en wat **niet** in dezelfde slice mag.

## Plaats in de reeks


| Doc                                                                                                                                        | Relatie                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Dit document                                                                                                                               | **Check eerst** — gate vóór implementatie-prompts |
| `[beweging-keuze-consumentenbond-prebuild-v3-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html)` `#e` / `#b` | Doel-UI (prebuild), nog niet 1:1 live             |
| `[claude-opus-beweging-mijn-dag-verdict-2026-08.md](claude-opus-beweging-mijn-dag-verdict-2026-08.md)`                                     | Gelockte agenda/pariteit-besluiten (KILL/GO)      |
| `[BESLUIT_BEWEGING_PRODUCT_EN_IA.md](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md)`                                                         | Surface-IA: doe vs advies                         |
| `[BESLUIT_FIT_PREFS.md](../design/BESLUIT_FIT_PREFS.md)`                                                                                   | Dual readout Bond×fit; geen fit-paneel op E       |


## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek) met toegang tot de repo, of plak de relevante bestanden.
2. Kopieer het blok onder **Prompt (copy-paste)**.
3. Review sectie **A** (wat dicht/open) en **E** (de ene volgende implementatie-slice).
4. Daarna pas: aparte implementatie-prompt voor **E** of **F0-rest** — nooit B + E + agenda in één prompt.

## Wat Dennis al vooraf weet (hint, niet als waar aannemen — Opus moet verifiëren)

Voorlopige steekproef 4 aug 2026 (mag door Opus worden bevestigd of weerlegd):

- Rail `statusDone` lijkt via `useTodayActionDone` → `isTodayActionDone` te lopen (`Dashboard.tsx`) — H4 uit het mijn-dag-verdict mogelijk **dicht**.
- `set_movement_day_choice` in `priority-pref/route.ts` lijkt **geen** `emitEvent` te doen — H2 mogelijk **open**.
- `persistChoice` in `MovementTodayHero` lijkt fire-and-forget zonder `onPrefUpdated` — H1 mogelijk **open**.
- Tray toont “Nog geen moment gekozen” zonder tier/duur-regel — H3a mogelijk **open**.
- `buildAnalysisBlock` zet `done: false` hard — H5 mogelijk **open**.
- B-keuzeladder (Consumentenbond-kaarten) bestaat **niet** in live Beweging; Favorieten = focus-pijler, geen optiecatalogus.

---

## Prompt (copy-paste)

```text
## Rol
Je bent Senior product-engineer + UX-auditor voor PerfectSupplement
(perfectsupplement.nl). Je doet een PRE-IMPLEMENTATIE-AUDIT: wat moet dicht
zijn vóór we prebuild-scherm E (“Elke dag daarna”) of B (“Maak een keuze”)
in het beweging-kompas laten bouwen.

Je schrijft GEEN code, GEEN diffs, GEEN JSX, GEEN SQL, GEEN Tailwind-patches.
Output in het Nederlands; identifiers/paden in het Engels.

## Context — lees en verifieer in de repo (niet aannemen)

Docs (lock, niet heronderhandelen tenzij je een PIVOT markeert met onderbouwing):
- docs/design/beweging-keuze-consumentenbond-prebuild-v3-2026-08.html
  (secties #s-e en #s-b + ontwerpnotitie bovenaan / chrome details)
- docs/cursors/claude-opus-beweging-mijn-dag-verdict-2026-08.md
  (sectie A KILL/GO, H open gaten, J slices)
- docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md
  (doe-surface vs advies; stepped care)
- docs/design/BESLUIT_FIT_PREFS.md
  (Bond-oordeel vast; fit sorteert/filtert; GEEN fit-paneel op doe-surface E;
   GEEN samengevoegd fit×bond-cijfer; fit-UI pas op B / later — niet in deze audit
   als nieuwe slice voorstellen)

Code (minimaal openen):
- src/components/dashboard/BewegingScreen.tsx
- src/components/dashboard/beweging/MovementCockpit.tsx
- src/components/dashboard/beweging/MovementTodayHero.tsx
- src/components/dashboard/Dashboard.tsx (statusDone / useTodayActionDone)
- src/lib/use-today-action-done.ts
- src/lib/day-model.ts (isTodayActionDone)
- src/lib/priority-pref-client.ts (postMovementDayChoice)
- src/app/api/account/priority-pref/route.ts (set_movement_day_choice + emitEvent)
- src/lib/events.ts (DOMAIN_EVENT_TYPES — zoek movement_day_choice*)
- src/lib/agenda-timeline.ts (buildAnalysisBlock, resolvePlanStepPlacement, done)
- src/components/dashboard/agenda/AgendaPlanStepStrip.tsx
- src/components/dashboard/agenda/AgendaDayTimeline.tsx
- src/components/dashboard/agenda/AgendaTodayHero.tsx
- src/components/dashboard/voortgang/FavorietenKeuzeSection.tsx

Recent landingspad (context, geen opdracht om te herbouwen):
- week/maand agenda: AgendaWeekTimeGrid, AgendaContextSidebar, AgendaMonthGrid
- quiet-day / tray / basis-aanvulling commits

## Product-frames die je mag gebruiken

1) Prebuild v3: A en E zijn ÉÉN surface met staten
   first-run | vandaag-open | vandaag-klaar.
   Tabs A/E zijn prototype-chrome, geen twee routes.

2) E (doe-staat elke dag):
   - First viewport = één vraag: deed je het (of de korte)?
   - Geen keuzelijst / Consumentenbond-etalage in open-staat.
   - Deur naar B alleen in klaar-staat of “meer hulp” (quiet door).
   - Review 1–5 na Gedaan is onderdeel van E, niet van B.

3) B (keuze-ladder):
   - Apart surface/slice: type · lens · help · verdict-niveau · oordeel · actieset.
   - “Zet op Mijn Dag” is conditioned; bij verdict=niet → “zet klaar voor hertest”.
   - GEEN auto-materialisatie van programma/partner naar agenda_blocks.

4) Mijn Dag (agenda) — gelockte KILLs:
   - Programma-dosis → automatisch agenda_blocks = KILL
   - agenda_block telt als dagstap gedaan = KILL
   - Dagstap → automatisch een tijd zonder expliciete gebruikerstijd = KILL
   - step_id op agenda_block als “waarheid” = KILL
   - Tweede completion-bron naast daily_action_log = KILL

5) Meetregel: geen twee conversie-gevoelige surface-wijzigingen in één deploy
   zonder los effect (attributie).

## Taak

Lever exact deze secties:

### A. Gap-matrix (verplicht tabel)

Voor elk item: Status = DICHT | DEELS | OPEN | N.V.T.
Bewijs = bestand:regel of “niet gevonden”.
Risico als je E toch bouwt terwijl dit open is = één zin.

Rijen (minimaal):
A1. Eén gedaan-antwoord overal (rail/inspector/Mijn Dag/Beweging lezen
    daily_action_log / isTodayActionDone — geen activeHabit.state als SSOT)
A2. Model-refresh: movement_day_choice gezet op Beweging → Mijn Dag toont
    dezelfde tier/titel ZONDER full reload (onPrefUpdated / in-memory patch)
A3. Durable domain event op set_movement_day_choice (events.ts + emit in route;
    choice:null = wis) — niet alleen GA4 dashboard_vandaag_step_alternative
A4. Duur + tier readout op tray/detail (“Trainen · 30–45 min”-achtig);
    geen bewerkbare duur/eindtijd
A5. Plan-stap in grid ALLEEN bij expliciete scheduled_time; anders tray
A6. buildAnalysisBlock / plan-stap done-veld niet hard false als het in grid
    een done-UI kan tonen (of expliciet: done-affordance alleen in detail)
A7. Live Beweging first viewport vs E-prebuild: wat is er al (Gedaan / korte /
    wijzig keuze / programma-sheet) en wat ontbreekt (klaar-staat review,
    quiet door naar B, “Verder vandaag”-strip, state first-run vs return)
A8. B-keuzeladder live aanwezig? (catalogus + oordeel + Favorieten-opties)
A9. Week/maand-agenda: is kalender-UX “klaar genoeg” om E niet te blokkeren,
    of blokkeert iets concreets E?

### B. Wat E WEL mag worden (wanneer je later een implementatie-prompt stuurt)

Max 8 bullets. Alleen user-visible gedrag + data-writes die bij E horen.
Voorbeeldrichting (pas aan na audit): staten open/klaar; Gedaan + korte →
daily_action_log; optionele 1–5 review; quiet deur-link naar B (route/sheet stub
ok); geen nieuwe agenda_blocks uit E.

### C. Wat E NIET mag (harde out-of-scope)

Minimaal expliciet noemen:
- B keuzeladder / partnerkaarten / postcode-lens / oordeel-UI bouwen
- C premium “Sterk na 40” / meetpad-upsell
- D volledige Mijn Dag-herbouw / week-grid / maand
- Auto “Zet op Mijn Dag” die agenda_blocks of scheduled_time schrijft zonder
  bestaande Verplaats/tijd-flow
- Programma-dosis → agenda_blocks
- Web-push, e-mailnudge F1b, coach, agenda-import
- Nieuwe art.9-stromen zonder register

### D. Afhankelijkheden — mag E starten?

Eén van:
- GO — E mag als volgende implementatie-slice (noem welke A-rijen DICHT genoeg zijn)
- GO-MET-MICROFIX — eerst ≤3 gerichte fixes (noem ze), dan E; fixes zijn GEEN
  B en GEEN kalender-herbouw
- NO-GO — eerst F0/F1a-rest (noem exact welke A-rijen); E daarna

Onderbouw met attributie: waarom mag dit wél of niet in één deploy met iets anders.

### E. De ene volgende implementatie-slice (opdracht voor Dennis)

Schrijf 1 alinea: titel van de slice + acceptatiecriteria (5–7 toetsbare bullets)
+ Meetpunt (welke bestaande of nieuwe events; nieuwe client-events = 3 plekken;
server emitEvent alleen events.ts).
Parklijst: wat bewust later komt (B slice 1, F1b, …).

### F. Prompt-split advies

Antwoord kort:
1) Stuur `#e` apart als implementatie-prompt? JA/NEE + waarom.
2) Mag B in dezelfde prompt als E? JA/NEE + waarom.
3) Mag agenda week/maand in dezelfde prompt als E? JA/NEE + waarom.

## Constraints
- Geen code. Geen “ik ga dit nu bouwen”.
- Verzin geen schermstaat; baseer op bestanden. Label aannames als AANNAME.
- Heropen geen KILL uit het mijn-dag-verdict zonder PIVOT + waarom + wat kapotgaat.
- Geen medische claims / diagnose-taal in voorgestelde copy.
- Antwoord gestructureerd A–F; geen essay vóór de tabellen.

## Acceptatiecriterium
- [ ] Elke A-rij heeft Status + Bewijs + Risico
- [ ] Sectie C noemt B, C-premium, agenda-auto-materialisatie expliciet als NEE
- [ ] Sectie D is één duidelijke GO / GO-MET-MICROFIX / NO-GO
- [ ] Sectie E heeft Meetpunt-regel
- [ ] Sectie F beantwoordt de drie JA/NEE-vragen

## Verificatie
Voor je stopt: herlees A1–A9 tegen de bestanden die je noemt.
Geen git commit. Geen patches.
```

---

## Na deze audit — `#e` apart sturen?

**Ja.** Stuur `#e` als **aparte** implementatie-prompt, ná (of parallel aan alleen microfixes uit D), nooit in dezelfde prompt als B of als week/maand-kalenderwerk.

### E — WEL (implementatie-scope later)


| Wel                                | Toelichting                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Eén Beweging-surface, return-staat | Prebuild: plan staat; vraag is Gedaan / korte                                     |
| Open-staat CTA’s                   | Primary Gedaan, soft “Ik doe de korte”; beide → `daily_action_log`                |
| Klaar-staat                        | Bevestiging + optionele review 1–5 + skip                                         |
| Quiet deur naar B                  | Alleen klaar-staat / “meer hulp” — link of stub-route, **geen** B-UI meebouwen    |
| Programma-readout                  | Uitklap “Je programma · …” als readout, geen tweede afvinklijst                   |
| “Verder vandaag”                   | Compacte cross-domein regels (als al data bestaat); geen nieuw commercieel schap  |
| Meting                             | Gedaan/korte/review events (hergebruik of registreer); Meetpunt in dezelfde slice |


### E — NIET


| Niet                                                | Waarom                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| B keuzeladder + oordeelkaarten                      | Andere slice (Consumentenbond); attributie + scope                                            |
| “Zet op Mijn Dag” die blocks/tijd auto-schrijft     | KILL mijn-dag-verdict                                                                         |
| C premium / Sterk na 40                             | Lock: vast op C ná meetpad                                                                    |
| D Mijn Dag fullbleed / week-grid / maand            | Al (deels) gedaan; andere naad                                                                |
| First-run A volledig herbouwen in dezelfde PR als E | Mag later; E = return-staat. A+E delen component, maar first-run-verkoop is aparte acceptatie |
| Partner/postcode/affiliate-live data                | B-slice; mock later                                                                           |
| Nudge / push / coach / import                       | Parklijst                                                                                     |


### Volgorde die we aanhouden

1. **Deze audit-prompt** → GO / GO-MET-MICROFIX / NO-GO
2. Eventuele **microfixes** (pariteit/event/refresh) — eigen kleine prompt
3. **Implementatie-prompt E** (alleen WEL-tabel)
4. Daarna **B slice 1** (keuzeladder + oordeel), zonder agenda-auto-write
5. Pas later: echte Mijn Dag-bridge vanuit gekozen aanvulling onder tray/grid-regels

