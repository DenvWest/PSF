# Besluit — onderbalk: ＋ toevoegen, helemaal rechts

**Datum:** 7 oktober 2026
**Status:** besloten door Dennis, gebouwd op `feat/onderbalk-plus`
**Vult aan:** `BESLUIT_ONDERBALK_DRIE_TABS_2026-10.md` — dat besluit hield "＋" vrij voor "een latere actieknop toevoegen aan dagboek". Dit is die knop.

## Aanleiding

Dennis vroeg of Patroon naar Meer kon, met alleen Dagboek en Keuze als tabs, en een ＋-scherm zoals bij MyFitnessPal om een maaltijd, voedingsproduct of supplement toe te voegen.

## Besluit

1. **Onderbalk (mobiel): Dagboek · Patroon · Keuze · Meer · ＋.** Vijf even brede vakken; ＋ helemaal rechts (keuze Dennis), als gevulde ronde knop zonder label, zodat hij leest als actie en niet als bestemming.
2. **Patroon en Keuze blijven tabs.** De lus meten → wegen → kiezen blijft zichtbaar. Patroon is waar het waarom staat; bij MyFitnessPal zit de voortgang in Meer omdat die daar een gewichtsgrafiek is, hier is het patroon de kern.
3. **＋ opent een sheet met drie ingangen**, allemaal naar het bestaande zoekscherm van het dagboek (geen tweede invoerflow):
   - **Maaltijd**: kies ontbijt, lunch, avondeten of tussendoor; zoekt in alles.
   - **Voedingsproduct toevoegen**: zoekt in alles.
   - **Supplement toevoegen**: opent op "Mijn supplementen".
   Zonder uitlegregels en zonder "komt bij lunch": niet suggestief (Dennis, 7 okt). Op de achtergrond kiest het zoekscherm het eetmoment dat bij de klok past; je wijzigt het daar.
   Daaronder één kale link **Supplement kiezen** → Keuze, voor wie nog niets neemt. Supplement toevoegen zelf gaat níet naar Keuze: ＋ betekent "toevoegen wat je nam", geen vergelijking.
4. **Werkt vanaf elk tabblad** via de bestaande dagboek-deeplink (`?tab=vandaag&zoek=…&moment=…`), zoals ＋ bij een bron in Je patroon al deed.
5. **Alleen de mobiele onderbalk.** In de header (vanaf `sm`) staan de knoppen per maaltijd al in beeld; daar komt ＋ pas als het meetpunt erom vraagt.

## Afgewezen

- **Patroon naar Meer.** Breekt de lus; het patroon is de reden om te blijven loggen. Opnieuw te wegen als `dashboard_tab_selected` op `voortgang` laag blijft ten opzichte van ＋.
- **Keuze naar Meer** (Dagboek · Patroon · Meer · ＋). Keuze is waar de lus sluit en waar de vergelijking zit (verdict "focus op de vergelijking").
- **＋ in het midden** (MyFitnessPal-stijl). Dennis koos rechts: duim-bereik op de telefoon, en de tabs houden hun volgorde.

## Meetpunt

`dashboard_plus_item_click` met `item: maaltijd | voedingsproduct | supplement | supplement_kiezen` (en `moment` bij de eerste drie), plus Clarity-tag `dashboard_plus_menu=open`. Vergelijk met `nutrition_dagboek_maaltijd_geopend` (de knoppen per maaltijd): neemt ＋ het loggen over, of komt het erbij?
