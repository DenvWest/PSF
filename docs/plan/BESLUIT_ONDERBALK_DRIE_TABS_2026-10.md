# Besluit — onderbalk: drie tabs + Meer

**Datum:** 5 oktober 2026
**Status:** besloten (Dennis liet de keuze aan Claude), gebouwd op `feat/onderbalk-drie-tabs`
**Herziet:** `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.1 (vier tabs, labels Dagboek · Mijn Dag · Je patroon · Keuze)

## Aanleiding

Op mobiel (375px) zag de onderbalk er rommelig uit: "Je patr…" werd afgekapt en er zat een groot gat tussen Keuze en Meer. De oorzaak was de opmaak, niet het aantal: de vier tabs deelden samen één helft van de balk en Meer kreeg in z'n eentje de andere helft. Dennis vroeg of vijf items te veel is.

## Besluit

1. **Drie tabs in de navigatie, in de volgorde van de lus:** Dagboek (meten) → Patroon (wegen) → Keuze (kiezen). Daarnaast Meer. Vier even brede vakken, labels voluit.
2. **Mijn Dag gaat naar Meer**, samen met Doelen. Het blijft een volwaardig scherm onder `?tab=agenda`. Staat het open, dan licht Meer op.
3. **Het label "Je patroon" wordt "Patroon"**, de schermtitel blijft "Je patroon". Het is korter en past bij de andere labels van één woord.
4. **De ids blijven** (`vandaag · voortgang · keuze · agenda`): geen URL-breuk, meetreeksen blijven doorlopen.

## Afgewezen

- **"Voortgang" als label.** Suggereert een balk die je naar 100% duwt; botst met de regel "geen percentage als voortgang" (voedingsfocus-besluit §3.3). Het scherm laat een patroon zien, geen vordering.
- **Mijn Dag, Doelen en Recepten onder een "+"-knop.** In voedingsapps (Yazio-voorbeeld) betekent "+" *iets toevoegen* (eten loggen), en staan Doelen/Recepten juist onder Meer. "+" blijft gereserveerd voor een latere actieknop "toevoegen aan dagboek". Recepten bestaan nog niet; dat is nieuw werk.
- **Vier tabs + Meer houden en alleen de breedte repareren.** Mijn Dag op plek twee brak de lus (plannen komt na kiezen), en vier labels plus Meer blijven krap op 375px.

## Meetpunt

`dashboard_more_item_click` met `item: "mijn_dag"`: hoe vaak Mijn Dag nog via Meer wordt geopend. Daalt dat sterk ten opzichte van de oude tabkliks (`dashboard_tab_selected` op `agenda`), dan is het verstoppen te ver gegaan.
