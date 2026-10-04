#!/usr/bin/env python3
"""
Dekkingsmeting: hoeveel van de producten uit de eerste supermarktdataset staan
in Open Food Facts (NL)?

Leest `scripts/out/supermarkt-rapport.json` (de lokale extractie van de eerste
dataset, niet in git) en `scripts/out/off-nl.ndjson` (uitvoer van
`off-extract.py`). De dataset heeft geen barcodes, dus de koppeling gaat op
naam, en wordt bevestigd met de calorie-waarde. Het resultaat is een bandbreedte:

  - `exact`:    zelfde woorden (volgorde en maten genegeerd) én kcal binnen
                max(10 kcal, 10%). Ondergrens; vrijwel geen valse matches.
  - `ruim`:     woordoverlap (Jaccard ≥ 0,7), eenduidig beste kandidaat én kcal
                binnen max(10 kcal, 10%). Bovengrens van wat naam + kcal samen
                kunnen bevestigen; valse matches zijn mogelijk (zie steekproef).

Schrijft een markdown-rapport naar `docs/plan/STEEKPROEF_OFF_DEKKING_2026-10.md`.
De dataset zelf blijft lokaal; het rapport bevat per keten alleen aantallen en
een kleine steekproef met namen.

Gebruik:  python3 scripts/off-dekking.py
"""

import json
import random
import re
import unicodedata
from collections import defaultdict

RAPPORT = "scripts/out/supermarkt-rapport.json"
OFF = "scripts/out/off-nl.ndjson"
UIT = "docs/plan/STEEKPROEF_OFF_DEKKING_2026-10.md"

STOP = {"de", "het", "een", "en", "van", "met", "voor", "in", "op", "bio", "a", "la", "le"}
MAAT = re.compile(r"\b\d+([.,]\d+)?\s*(g|gr|gram|kg|ml|cl|l|liter|st|stuks?|x|pak|pakken)\b")


def tokens(tekst):
    t = unicodedata.normalize("NFD", tekst)
    t = "".join(c for c in t if not unicodedata.category(c).startswith("M")).lower()
    t = MAAT.sub(" ", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return frozenset(w for w in t.split() if w not in STOP and len(w) > 1)


def kcal_ok(a, b):
    return a is not None and b is not None and abs(a - b) <= max(10, 0.1 * max(a, b))


def main():
    off = []
    with open(OFF, encoding="utf-8") as f:
        for regel in f:
            r = json.loads(regel)
            naam = r["naam"]
            off.append(
                (
                    tokens(naam),
                    tokens(f"{r['merk']} {naam}") if r["merk"] else tokens(naam),
                    r["energy_kcal"],
                    naam,
                    r["merk"],
                )
            )

    exact = defaultdict(list)
    index = defaultdict(list)
    for i, (t_naam, t_merknaam, _, _, _) in enumerate(off):
        exact[t_naam].append(i)
        exact[t_merknaam].append(i)
        for w in t_merknaam | t_naam:
            index[w].append(i)
    zeldzaam = {w for w, lijst in index.items() if len(lijst) <= 400}

    rapport = json.load(open(RAPPORT, encoding="utf-8"))
    random.seed(7)
    uit = {}
    voorbeelden = defaultdict(list)

    for keten, blok in rapport["supermarkten"].items():
        totaal = n_exact = n_ruim = 0
        for p in blok["producten"]:
            if p.get("energyKcal") is None:
                continue
            totaal += 1
            t = tokens(p["naam"])
            if not t:
                continue
            gevonden = [i for i in exact.get(t, []) if kcal_ok(p["energyKcal"], off[i][2])]
            if gevonden:
                n_exact += 1
                if len(voorbeelden[keten]) < 6 and random.random() < 0.02:
                    voorbeelden[keten].append(("exact", p["naam"], off[gevonden[0]][3], off[gevonden[0]][4]))
                continue
            kandidaten = set()
            for w in t & zeldzaam:
                kandidaten.update(index[w])
            scores = []
            for i in kandidaten:
                o = off[i][1] | off[i][0]
                score = len(t & o) / len(t | o)
                if score >= 0.7 and kcal_ok(p["energyKcal"], off[i][2]):
                    scores.append((score, i))
            scores.sort(reverse=True)
            if scores and (len(scores) == 1 or scores[0][0] > scores[1][0]):
                n_ruim += 1
                if len(voorbeelden[keten + "-ruim"]) < 12 and random.random() < 0.05:
                    i = scores[0][1]
                    voorbeelden[keten + "-ruim"].append(("ruim", p["naam"], off[i][3], off[i][4]))
        uit[keten] = (totaal, n_exact, n_ruim)

    regels = [
        "# Steekproef — dekking van Open Food Facts op de eerste supermarktdataset",
        "",
        "**Datum:** 4 oktober 2026  ",
        "**Script:** `scripts/off-dekking.py` (leest de lokale extractie, niet in git)  ",
        "**OFF-dump:** food.parquet van 4 oktober 2026, Nederlandse producten met energie "
        f"en geldige waarden: {len(off):,} rijen.".replace(",", "."),
        "",
        "De dataset heeft geen barcodes. De koppeling gaat dus op naam en wordt bevestigd "
        "met de calorie-waarde (binnen max(10 kcal, 10%)). `exact` is een ondergrens "
        "(zelfde woorden); `exact + ruim` is een bovengrens (woordoverlap ≥ 0,7, "
        "eenduidige beste kandidaat). De werkelijke dekking ligt ertussen.",
        "",
        "| Keten | Producten met kcal | Exact | Exact + ruim | Dekking (onder – boven) |",
        "|---|---:|---:|---:|---|",
    ]
    tot = [0, 0, 0]
    for keten, (t, e, r) in uit.items():
        regels.append(f"| {keten} | {t} | {e} | {e + r} | {100 * e / t:.0f}% – {100 * (e + r) / t:.0f}% |")
        tot = [tot[0] + t, tot[1] + e, tot[2] + r]
    regels.append(
        f"| **Totaal** | {tot[0]} | {tot[1]} | {tot[1] + tot[2]} | "
        f"**{100 * tot[1] / tot[0]:.0f}% – {100 * (tot[1] + tot[2]) / tot[0]:.0f}%** |"
    )
    regels += ["", "## Steekproef van koppelingen (beoordeel op valse matches)", ""]
    for sleutel, lijst in voorbeelden.items():
        regels.append(f"**{sleutel}**")
        for soort, scrape, offnaam, merk in lijst:
            regels.append(f"- {scrape}  →  {offnaam}" + (f" ({merk})" if merk else ""))
        regels.append("")
    open(UIT, "w", encoding="utf-8").write("\n".join(regels) + "\n")
    print("\n".join(regels[:16]))


if __name__ == "__main__":
    main()
