#!/usr/bin/env python3
"""
Open Food Facts-dump → NDJSON in de vorm van de tabel `sm_products`.

Leest de officiële Parquet-dump (ODbL), houdt Nederlandse producten met
voedingswaarden over en schrijft één JSON-object per regel. Schrijft niets
naar Supabase; dat doet `scripts/off-laden.mjs`.

## Waarom Python en DuckDB

De dump is ~4 GB. DuckDB leest Parquet kolomsgewijs en filtert zonder alles in
het geheugen te laden. Dit script draait los van de app: er komt geen
afhankelijkheid in package.json. Installeer in een venv buiten het project:

    python3 -m venv /pad/naar/offenv && /pad/naar/offenv/bin/pip install duckdb

## Gebruik

    python3 scripts/off-extract.py --parquet=/pad/food.parquet --snapshot=2026-10-04

De dump is te downloaden van
https://huggingface.co/datasets/openfoodfacts/product-database (food.parquet).
`--snapshot` is de datum van de dump (komt in `snapshot_datum`).

## Regels

  - Alleen waarden zoals OFF ze per 100 g/ml geeft (`100g`-veld). Dat veld staat
    altijd in gram (energie in kcal), welke eenheid de bijdrager ook invoerde
    (`unit`). Natrium gaat van gram naar mg. Dat is een eenheidsomrekening, geen
    bewerking van de inhoud.
  - Calcium, ijzer, vitamine C en vitamine D worden niet overgenomen. De
    Parquet-dump zet de schattingen die OFF uit de ingrediëntenlijst berekent
    (`nutriments_estimated` in de API) zonder vlag tussen de etiketwaarden; ± drie
    kwart van die micro's is zo'n schatting. De kolommen blijven `null` tot er
    een bron is die etiket en schatting scheidt (REVIEW_OFF_IMPORT_2026-10.md #1).
  - Een rij zonder energy-kcal wordt overgeslagen. Onmogelijke waarden (zelfde
    grenzen als de check-constraints in `20261003090000_sm_products.sql` en
    `isPlausibelSupermarktProduct`) laten de hele rij vallen, zoals de TS-schrijver.
  - Geen verzonnen 0: ontbreekt een stof, dan is het `null`.
  - `zoek_tekst` gebruikt dezelfde normalisatie als `normaliseerZoektekst` in
    `src/lib/supermarkt-products.ts` (NFD, accenten weg, kleine letters, spaties).
"""

import argparse
import html
import json
import math
import os
import sys
import unicodedata

OFF_NAAR_KOLOM = {
    "energy-kcal": ("energy_kcal", "kcal"),
    "fat": ("fat_g", "g"),
    "saturated-fat": ("saturated_fat_g", "g"),
    "carbohydrates": ("carbohydrate_g", "g"),
    "sugars": ("sugars_g", "g"),
    "fiber": ("fiber_g", "g"),
    "proteins": ("protein_g", "g"),
    "salt": ("salt_g", "g"),
    "sodium": ("sodium_mg", "mg"),
}

NAAR_GRAM = {"g": 1.0, "mg": 1e-3, "µg": 1e-6, "ug": 1e-6, "mcg": 1e-6, "kg": 1e3}

GRENZEN = {
    "energy_kcal": (0, 900),
    "fat_g": (0, 100),
    "saturated_fat_g": (0, 100),
    "carbohydrate_g": (0, 100),
    "sugars_g": (0, 100),
    "fiber_g": (0, 100),
    "protein_g": (0, 100),
    "salt_g": (0, 100),
    "sodium_mg": (0, None),
    "calcium_mg": (0, None),
    "iron_mg": (0, None),
    "vitamin_c_mg": (0, None),
    "vitamin_d_ug": (0, None),
}

# Fysiek haalbare bovengrens per 100 g voor micro's. Daarboven is het een
# invoerfout in OFF (bijv. 9.010 mg vitamine C in koekjes; puur zout bevat
# ± 39.300 mg natrium): de waarde gaat naar null, de rest van de rij blijft.
MICRO_MAX = {
    "sodium_mg": 40000,
    "calcium_mg": 3000,
    "iron_mg": 100,
    "vitamin_c_mg": 2000,
    "vitamin_d_ug": 250,
}

AFRONDING = {
    "energy_kcal": 1,
    "sodium_mg": 1,
    "calcium_mg": 1,
    "iron_mg": 2,
    "vitamin_c_mg": 2,
    "vitamin_d_ug": 2,
}


tellers_micro = {}


def normaliseer_zoektekst(tekst):
    ontleed = unicodedata.normalize("NFD", tekst)
    zonder = "".join(c for c in ontleed if not unicodedata.category(c).startswith("M"))
    return " ".join(zonder.lower().split())


def omrekenen(waarde_100g, invoer_eenheid, doel_eenheid):
    """`100g`-veld (gram, energie in kcal) → doeleenheid van de kolom.

    `invoer_eenheid` is de eenheid waarin de bijdrager `value` invoerde; die zegt
    niets over het `100g`-veld en telt alleen bij energie.
    """
    if doel_eenheid == "kcal":
        return waarde_100g if invoer_eenheid in (None, "", "kcal") else None
    return waarde_100g / NAAR_GRAM[doel_eenheid]


def kies_naam(product_name):
    if not product_name:
        return None
    voorkeur = {"nl": 0, "main": 1, "en": 2}
    kandidaten = [p for p in product_name if p and p.get("text") and p["text"].strip()]
    if not kandidaten:
        return None
    kandidaten.sort(key=lambda p: voorkeur.get(p.get("lang"), 9))
    return " ".join(html.unescape(kandidaten[0]["text"]).split())


def bouw_rij(code, product_name, brands, categories, nutriments, snapshot):
    naam = kies_naam(product_name)
    if not naam or not code or not code.isdigit() or not 8 <= len(code) <= 14:
        return None, "geen_naam_of_code"
    naam = naam[:300]

    waarden = {}
    for n in nutriments or []:
        doel = OFF_NAAR_KOLOM.get(n["name"])
        if not doel or n.get("100g") is None:
            continue
        kolom, eenheid = doel
        waarde = omrekenen(float(n["100g"]), n.get("unit"), eenheid)
        if waarde is None or not math.isfinite(waarde):
            continue
        waarden[kolom] = round(waarde, AFRONDING.get(kolom, 2))

    if waarden.get("energy_kcal") is None:
        return None, "geen_energie"
    for kolom, (min_, max_) in GRENZEN.items():
        w = waarden.get(kolom)
        if w is None:
            continue
        if w < min_ or (max_ is not None and w > max_):
            return None, "onmogelijke_waarde"

    for kolom, grens in MICRO_MAX.items():
        if waarden.get(kolom) is not None and waarden[kolom] > grens:
            waarden[kolom] = None
            tellers_micro[kolom] = tellers_micro.get(kolom, 0) + 1

    macros = [waarden.get(k) for k in ("protein_g", "carbohydrate_g", "fat_g")]
    if all(m is not None for m in macros):
        berekend = 4 * macros[0] + 4 * macros[1] + 9 * macros[2] + 2 * (waarden.get("fiber_g") or 0)
        if abs(waarden["energy_kcal"] - berekend) > max(60, 0.5 * waarden["energy_kcal"]):
            return None, "energie_onverenigbaar"

    merk = None
    if brands:
        eerste = html.unescape(brands.split(",")[0]).strip()
        merk = eerste[:200] or None
    categorie = None
    if categories:
        laatste = categories.split(",")[-1].strip()
        categorie = laatste[:300] or None

    rij = {
        "prod_id": f"off:{code}",
        "bron": "off",
        "bron_id": code,
        "snapshot_datum": snapshot,
        "naam": naam,
        "merk": merk,
        "categorie": categorie,
        "zoek_tekst": normaliseer_zoektekst(f"{naam} {merk}" if merk else naam),
    }
    for kolom, _ in GRENZEN.items():
        rij[kolom] = waarden.get(kolom)
    return rij, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--parquet", required=True)
    ap.add_argument("--snapshot", required=True, help="YYYY-MM-DD van de dump")
    ap.add_argument("--uit", default="scripts/out/off-nl.ndjson")
    args = ap.parse_args()

    import duckdb

    os.makedirs(os.path.dirname(args.uit) or ".", exist_ok=True)
    con = duckdb.connect()
    cursor = con.execute(
        """
        select code, product_name, brands, categories, nutriments
        from read_parquet(?)
        where list_contains(countries_tags, 'en:netherlands')
          and not coalesce(obsolete, false)
          and nutriments is not null
        """,
        [args.parquet],
    )

    tellers = {"gelezen": 0, "geschreven": 0}
    overgeslagen = {}
    gezien = set()
    with open(args.uit, "w", encoding="utf-8") as uit:
        while True:
            batch = cursor.fetchmany(5000)
            if not batch:
                break
            for code, naam, brands, categories, nutriments in batch:
                tellers["gelezen"] += 1
                rij, reden = bouw_rij(code, naam, brands, categories, nutriments, args.snapshot)
                if rij is None:
                    overgeslagen[reden] = overgeslagen.get(reden, 0) + 1
                    continue
                if rij["prod_id"] in gezien:
                    overgeslagen["dubbel"] = overgeslagen.get("dubbel", 0) + 1
                    continue
                gezien.add(rij["prod_id"])
                uit.write(json.dumps(rij, ensure_ascii=False, allow_nan=False) + "\n")
                tellers["geschreven"] += 1

    print(json.dumps({**tellers, "overgeslagen": overgeslagen, "micro_op_null": tellers_micro}, indent=2), file=sys.stderr)


if __name__ == "__main__":
    main()
