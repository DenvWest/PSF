# Implementatiespec — Slice 2: F1a-nazorg sync (beweegcheck → programma)

> **Status: uitvoerbare spec. Geen code geschreven, geen commit.**
> Opgesteld 6 augustus 2026, direct uitvoerbaar op **20 augustus 2026** (2 weken na `7d6205b`, 06:38 — het F1a-meetvenster uit `claude-opus-beweging-versmelting-verdict-2026-08.md` §I).
> **Niet eerder starten.** Deze wijziging raakt geen enkele bevroren surface (zie §5), maar de afspraak was expliciet: wachten tot het venster vol is. Hou je daaraan, ook al is de technische noodzaak daarvoor lager dan aanvankelijk gedacht (zie §4-correctie).
> **Eerste stap op implementatiedag: herlees `route.ts` en `movement-target.ts` vers.** Twee weken is genoeg tijd voor drift; de regelnummers hieronder zijn oriëntatie, geen garantie.

---

## 1. Wat dit oplost

Frictie #1 uit het verdict: de volledige beweegcheck (`MOV2_CARD`, `MOV2_VIG`, `MOV2_SIT`, `MOV2_STR`) schrijft alleen naar `intake_domain_checkin.raw_inputs`. `deriveMovementCurrent()` (`src/lib/movement-target.ts:108-151`) leest die vier velden uit `answers`, en die bereiken `answers` nooit — dus valt hij altijd terug op `source: "basischeck"` of `"onbekend"`, ook na een net voltooide check.

Precedent voor de fix bestaat al: `src/app/api/account/movement-prefs/route.ts` doet exact dit patroon (read `intake_sessions.answers` → merge specifieke keys → write) voor het plan-profiel. Deze slice kopieert dat patroon, niet een nieuw patroon.

## 2. Geverifieerde feiten (6 augustus 2026)

- `MOVEMENT_REPORT_FIELDS` in `src/lib/movement-checkin-parse.ts:3-14` bevat `MOV2_STR`, `MOV2_CARD`, `MOV2_VIG`, `MOV2_SIT` (plus zes andere, alleen voor de score-engine). Bij `mode: "full"` garandeert `parseFullMovementReport()` dat alle velden gevalideerde integers 1–5 zijn — er is dus nooit een `undefined` te mergen bij een geslaagde full-check.
- `route.ts` heeft `sessionId`, `admin` en `fullReport` al in scope op het moment dat de `intake_domain_checkin`-insert slaagt (rond regel 181-197 vandaag).
- `MOV2_CARD`/`MOV2_VIG`/`MOV2_SIT`/`MOV2_STR` staan al in de `QuestionId`-union (`src/data/intake-questions.ts:56-65`) — schrijven als plain `number` in `intake_sessions.answers` is dus zonder typewijziging compatibel met `IntakeAnswers`.
- `parseAnswers()` in `src/lib/account-dashboard.ts` filtert **alle** keys van `row.answers` op `typeof raw === "number"` — geen allowlist per key. Zodra de vier velden als number in de jsonb staan, bereiken ze `model.answers` automatisch. **Geen wijziging nodig in `account-dashboard.ts`.**
- `pulseReport` (mode `"pulse"`) bevat alleen `RCV_FEEL` — nooit de vier CARD/VIG/SIT/STR-velden. Pulse-checks mogen dus nooit aan deze merge deelnemen.

## 3. De wijziging — twee bestanden

### 3a. `src/lib/movement-target.ts` — nieuwe merge-functie

Co-locate naast `deriveMovementCurrent()`, die de vier velden al als literals hardcodeert. Extraheer die vier keys als gedeelde bron, zodat lezer en schrijver niet uit de pas kunnen lopen:

```ts
export const MOVEMENT_CURRENT_ANSWER_KEYS = [
  "MOV2_CARD",
  "MOV2_VIG",
  "MOV2_SIT",
  "MOV2_STR",
] as const;

export function mergeMovementCheckinIntoAnswers(
  current: unknown,
  report: Pick<Record<string, number>, (typeof MOVEMENT_CURRENT_ANSWER_KEYS)[number]>,
): Record<string, unknown> {
  const record =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  for (const key of MOVEMENT_CURRENT_ANSWER_KEYS) {
    record[key] = report[key];
  }
  return record;
}
```

Ververs `deriveMovementCurrent()` optioneel om `MOVEMENT_CURRENT_ANSWER_KEYS` te gebruiken in plaats van losse `answers.MOV2_CARD`-literals — niet verplicht voor deze slice, wel de juiste follow-up als het toch al open staat.

**Bewuste keuze:** géén cross-import van `MovementCheckinReport` uit `movement-checkin-parse.ts`. De functie neemt een generieke `Record<string, number>`-subset aan; de aanroeper (de route) geeft `fullReport` door, dat toevallig aan die vorm voldoet. Voorkomt een onnodige koppeling tussen twee modules die vandaag niets van elkaar weten.

### 3b. `src/app/api/intake/movement-checkin/route.ts` — de schrijfstap

Direct ná de geslaagde `intake_domain_checkin`-insert (ná de `if (checkinError)`-guard, vóór of naast de bestaande event-emits), alleen voor `mode === "full"`:

```ts
if (mode === "full" && fullReport) {
  const { data: sessionRow } = await admin
    .from("intake_sessions")
    .select("answers")
    .eq("id", sessionId)
    .single();

  if (sessionRow) {
    const { error: answersError } = await admin
      .from("intake_sessions")
      .update({ answers: mergeMovementCheckinIntoAnswers(sessionRow.answers, fullReport) })
      .eq("id", sessionId);

    if (answersError) {
      console.error("[api/intake/movement-checkin] answers merge error:", answersError);
    }
  }
}
```

Import erbij: `import { mergeMovementCheckinIntoAnswers } from "@/lib/movement-target";`

**Non-blocking, bewust.** Zelfde stijl als de bestaande `try/catch`-emits verderop in dit bestand (regel 199-225 vandaag): een fout hier logt en gaat door. De checkin zelf is al veilig opgeslagen via de `intake_domain_checkin`-insert; de sync naar `answers` is een verrijking, geen voorwaarde voor een geslaagde response.

## 4. Correctie op het verdict-document

`claude-opus-beweging-versmelting-verdict-2026-08.md` §H suggereerde dat deze slice een nieuwe waarde `preselect_source: "beweegcheck"` zou opleveren in `dashboard_vandaag_card_shown`. **Dat klopt niet, en is bij dezen gecorrigeerd.**

`preselect_source` wordt in `MovementTodayHero.tsx` uitsluitend bepaald door `resolveRecommendedTodayChoiceKind(rcvFeelForHint, recovery)` — die leest `RCV_FEEL` (via `movement-recovery-context.ts`, een pad dat al werkt) en de recovery-hint, nooit `deriveMovementCurrent()`. Deze slice raakt die functie op geen enkele manier.

**Gevolg, positief:** de daadwerkelijke blast radius van slice 2 is kleiner dan ik in het verdict inschatte. De enige aanraking van iets dat in de buurt komt van de hero is `showBeweegcheckNudge` in `BewegingScreen.tsx` (een link die *naast*, niet *in*, `MovementTodayHero` staat). De kern-mechaniek van de hero — `Gedaan`, `Ik doe de korte`, de tier-voorselectie, `dashboard_vandaag_action_toggled`, `dashboard_vandaag_step_alternative` — blijft volledig ongemoeid. De wacht-tot-20-augustus-afspraak staat, maar is dus een voorzorgsmaatregel, geen technische noodzaak.

## 5. Wat er wél en niet verandert

**Wél (gevolg, geen losse code):**
- `deriveMovementCurrent()` retourneert `source: "beweegcheck"` voor accounts met een volledige check — zonder dat deze functie zelf wijzigt.
- `MovementProgramSheet.tsx` toont onder "Jouw doel" de echte band-labels i.p.v. "Nog geen beweegcheck gedaan" — zonder wijziging aan dat component.
- `movement-target.ts`'s `suggestTargetMinutes`/`suggestTargetStrength` gebruiken het echte huidige-beeld — zonder wijziging aan die functies.
- `showBeweegcheckNudge` in `BewegingScreen.tsx` dooft zodra de check gedaan is — zonder wijziging aan dat component.

**Niet — expliciete non-goals, om scope-creep op implementatiedag te voorkomen:**
- `RCV_FEEL`'s bestaande pad (via `movement-recovery-context.ts` → `model.movementRcvFeel`) blijft onaangeraakt. Geen dubbele opslag.
- Geen carry-over van MOV2_* naar een nieuwe sessie in `carryOverMovementPlanProfile` (`movement-plan-profile.ts:178-213`). Een nieuwe sessie hoort een verse beweegcheck te krijgen; oude CARD/VIG/SIT/STR-waarden meenemen zou een gedateerd huidige-beeld als actueel voorspiegelen.
- Geen staleness-check ("negeer als ouder dan N dagen"). Bestaat ook niet voor de originele `MOV_CARD`/`MOV_STR` uit de basis-intake — toevoegen alleen hier zou een nieuw, inconsistent patroon zijn.
- Geen van de zes overige `MOV2_*`-velden (COND/PAIN/MOB/FUNC/CONSIST/MOTIV) — die voeden `movementScoreV150()` in `intake-engine.ts`, niet `deriveMovementCurrent()`, en vallen buiten wat deze slice moet oplossen.
- Geen wijziging aan `MovementTodayHero.tsx`, `MovementCockpit.tsx`, `AgendaTodayHero.tsx`, `agenda-plan-duration.ts`, `day-model.ts` — geen van allen leest `deriveMovementCurrent()`.

## 6. Acceptatiecriteria

1. Na een volledige beweegcheck (`mode: "full"`) bevat `intake_sessions.answers` voor die sessie `MOV2_CARD`, `MOV2_VIG`, `MOV2_SIT`, `MOV2_STR` met de zojuist ingevulde waarden.
2. Een pulse-check (`mode: "pulse"`) verandert geen van die vier velden — bestaande waarden blijven exact staan.
3. `deriveMovementCurrent(model.answers).source === "beweegcheck"` ná een dashboard-reload (dus via `account-dashboard.ts`, niet alleen client-side state).
4. `MovementProgramSheet` toont de echte band-labels i.p.v. de "geen beweegcheck"-tekst.
5. `showBeweegcheckNudge` verdwijnt zodra `movementCurrent.source === "beweegcheck"`.
6. Twee opeenvolgende volledige checks: de tweede overschrijft de eerste (laatste-wint — zelfde gedrag als `MOV_CARD`/`MOV_STR` uit de basis-intake).
7. Bij een databasefout op de answers-merge blijft de checkin zelf toch geslaagd — de merge is non-blocking en de bestaande response (`assessment`, `start`, `mode`) verandert niet.
8. **Nul** wijzigingen aan `dashboard_vandaag_card_shown`, `dashboard_vandaag_step_alternative`, of enig ander event in `MovementTodayHero.tsx` — toetsbaar via een diff van dat bestand: leeg.
9. `npx tsc --noEmit`, `vitest`, `eslint --max-warnings 0` slagen; `grep -rn "console.log" src/` blijft schoon (het bestaande `console.error`-gebruik in dit bestand mag blijven staan, dat is geen debug-log).

## 7. Testplan

- **Nieuw:** unit test voor `mergeMovementCheckinIntoAnswers` — bestaande waarden blijven staan op andere keys, de vier CARD/VIG/SIT/STR-velden worden overschreven, `current: null`/`undefined`/non-object valt terug op een leeg object. Plek: check eerst of `src/lib/__tests__/movement-target.test.ts` al bestaat; zo niet, aanmaken.
- **Uitbreiden indien aanwezig:** een routetest voor `movement-checkin/route.ts` (check eerst `src/app/api/intake/movement-checkin/__tests__/` of vergelijkbaar) met twee cases: full-mode → answers bevatten de vier velden; pulse-mode → answers ongewijzigd.
- **Regressie, geen wijziging verwacht:** `day-model.test.ts`, `agenda-plan-duration.test.ts` — raken `movementDayChoice`, niet `deriveMovementCurrent`. Meedraaien als sanity-check, niet als doel.

## 8. Meetpunt

Geen nieuw client-event. Dit is een databack-fill-naad, geen nieuwe CTA, knop, keuze-vertakking of opt-in — de meet-standaarden uit `CLAUDE.md` schrijven registratie voor bij *nieuwe of geactiveerde* interactie, niet bij een datastroom-fix zonder zichtbaar nieuw gedrag.

**Verificatie op implementatiedag:** één testaccount door de volledige beweegcheck (`/intake/beweging`, niet pulse-mode) halen, en in de Supabase Dashboard SQL Editor controleren dat `intake_sessions.answers->>'MOV2_CARD'` gevuld is voor die sessie. Daarna handmatig de programma-sheet en de Beweging-surface bekijken (nudge weg, band-labels aanwezig). Geen doorlopende dashboard-meting nodig.

## 9. Volgorde op implementatiedag

1. `git log` + verse `Read` van `route.ts`, `movement-target.ts`, `movement-checkin-parse.ts` — controleer of de regelnummers en aannames in deze spec nog kloppen.
2. `movement-target.ts`: `MOVEMENT_CURRENT_ANSWER_KEYS` + `mergeMovementCheckinIntoAnswers` toevoegen.
3. `route.ts`: de merge-stap inpluggen ná de checkin-insert, import toevoegen.
4. Tests (§7).
5. `klaar-check`-skill draaien (tsc + vitest + eslint + console.log-grep + affiliate-slug-check — de laatste is hier niet van toepassing, maar hoort bij de standaardcheck).
6. Handmatige verificatie zoals in §8.
7. Stoppen voor review — geen commit.

## 10. Bestandenlijst

| Bestand | Actie |
| --- | --- |
| `src/lib/movement-target.ts` | Wijzigen — nieuwe export `MOVEMENT_CURRENT_ANSWER_KEYS` + `mergeMovementCheckinIntoAnswers` |
| `src/app/api/intake/movement-checkin/route.ts` | Wijzigen — merge-stap + import |
| `src/lib/__tests__/movement-target.test.ts` | Nieuw (indien nog niet bestaand) of uitbreiden |
| `src/app/api/intake/movement-checkin/__tests__/*` | Uitbreiden indien aanwezig |
| Alles in §5 "Niet" | Niet aanraken |
