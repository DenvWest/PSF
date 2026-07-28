# Cursor-prompt — Voortgang: visuele harmonisatie met Kompas

> Vervolg op [`cursor-voortgang-statistieken-advies-implementatie-prompt.md`](cursor-voortgang-statistieken-advies-implementatie-prompt.md).
> Die 4 slices zijn gebouwd en werken functioneel. Dit is een visuele
> polish-pas, geen architectuurwijziging.

## Rol

Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context — het probleem

Op `/dashboard?tab=voortgang` ogen Statistieken en Favorieten smaller/minder
"af" dan Kompas Home, terwijl beide binnen dezelfde `max-w-[720px]`-container
in `Dashboard.tsx` renderen (regel ~4058-4064) — er is dus **geen harde
width-cap** die het verschil verklaart. Grep op `maxWidth`/`max-w-` in
`VoortgangHub.tsx` en `src/components/dashboard/voortgang/*.tsx` levert niets
op. Het verschil zit in het **visuele systeem**, niet in de layout-breedte:

| | Kompas / VoortgangKompasPanels | Voortgang-subschermen (nu) |
|---|---|---|
| Kaart-component | `CockpitTile` (`src/components/dashboard/cockpit/CockpitTile.tsx`) | `Card` (`src/components/app/primitives.tsx`) |
| Achtergrond | donker, `bg-black/20` | licht (`surface="light"`) óf `var(--panel)` (dark-default) — inconsistent per plek |
| Border radius | `rounded-2xl` (16px) | `borderRadius: 24` |
| Padding | `p-4` (16px) | `pad={18/20/22}` — groter, minder compact |
| Eyebrow-stijl | ingebouwd (`text-[10px] uppercase tracking-[0.14em] text-[#9FB0A6]`) | losse inline `<div>` per component, niet herbruikt |

Dit is vermoedelijk wat "niet volledige breedte" oplevert: grotere padding +
groter radius + een ander achtergrondcontrast lezen als "kleiner"/"losser"
naast de strakke, compacte `CockpitTile`-kaarten erboven — ook al is de
buitenrand exact even breed. **Verifieer dit visueel op localhost eerst**
(desktop én 375px) voordat je gaat schuiven — dit is een hypothese, geen
bevestigde diagnose.

## Taak

Harmoniseer de kaart-taal binnen Voortgang naar `CockpitTile`, zodat
Statistieken, Favorieten én de Hub in één visuele lijn staan met Kompas Home.

Bestanden om te herzien (in deze volgorde — begin met wat het meest opvalt):

1. `src/components/dashboard/voortgang/StatistiekenAdviesSection.tsx` — alle
   `<Card pad={18}>`-instanties naar `CockpitTile`
2. `src/components/dashboard/voortgang/EvidenceLadderCard.tsx`
3. `src/components/dashboard/voortgang/FavorietenKeuzeSection.tsx`
4. `src/components/dashboard/voortgang/FavorietenAanraderSection.tsx`
5. `src/components/dashboard/voortgang/VoortgangReisStrip.tsx`
6. `src/components/dashboard/SupplementVerdictPanel.tsx` — let op: wordt
   gebruikt met `variant="summary"` (in `KompasOndersteuningTile`, al donker)
   én `variant="full"` (in Favorieten) — beide varianten moeten na deze pas
   dezelfde kaart-taal gebruiken
7. `src/components/dashboard/VoortgangHub.tsx` — `HubCard`,
   `VoortgangSubHeader`, `StatistiekenSoftUpsell`: bewust NIET naar
   `CockpitTile` als het de premium-upsell-stijl breekt — beoordeel per kaart,
   niet mechanisch

## Wat NIET verandert

- Geen nieuwe layout-breedte-logica in `Dashboard.tsx` — de 720px-container
  blijft zoals hij is, dit is puur een kaart-restyle eronder
- Geen wijziging aan `VoortgangKompasPanels.tsx` of `KompasOndersteuningTile.tsx`
  — die zijn al de referentiestijl
- `intake-engine.ts` niet aanraken
- Functionaliteit, props, event-tracking, copy: ongewijzigd — dit is uitsluitend
  visueel

## Constraints

- Imports via `@/`
- Nederlandse UI strings, Engelse variabelen/functies
- `.env.local` niet aanraken
- Verander niets aan `src/components/dashboard/beweging/` of ongerelateerd
  bewegingsplan-werk
- Geen git commands, geen commit

## Acceptatiecriterium

- [ ] Statistieken en Favorieten ogen op desktop en 375px als één visuele
      familie met Kompas Home (donkere kaarten, consistente radius/padding)
- [ ] Geen visuele regressie op de Hub-landingpagina (die had via
      `VoortgangKompasPanels` al de juiste stijl — controleer dat 'ie nog
      klopt na de wijzigingen in gedeelde componenten zoals `SupplementVerdictPanel`)
- [ ] `npx tsc --noEmit`, `npx vitest run`, `npx eslint --max-warnings 0` groen
- [ ] Geen nieuwe `console.log`
- [ ] 375px zonder horizontale scroll

## Verificatie

1. `npx tsc --noEmit`
2. `npx vitest run`
3. `npx eslint --max-warnings 0`
4. `grep -rn "console.log" src/`
5. Bekijk `/dashboard?tab=voortgang` op desktop én 375px voor Hub, Statistieken
   én Favorieten — leg naast Kompas Home (`/dashboard?tab=vandaag`) voor
   directe vergelijking

Niet automatisch committen. Stop na de wijzigingen zodat Dennis kan reviewen.

Voorgestelde commit:
```
git add -A && git commit -m "style(voortgang): kaarttaal harmoniseren met kompas — cockpittile i.p.v. card"
```
