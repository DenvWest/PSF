#!/usr/bin/env python3
"""Download unique Pexels photos for kennisbank covers, themes and inlines.

Style: natural photography (food, landscape, objects). No AI, no supplement
jars, no posed people. Each photo id is used at most once.
"""
from __future__ import annotations

import sys
import time
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_COVER = ROOT / "public/images/kennisbank"
OUT_INLINE = ROOT / "public/images/kennisbank/inline"
UA = "PerfectSupplement/1.0 editorial stock fetch (https://perfectsupplement.nl)"

# dest filename stem (without .jpg) -> pexels id
# Natural Unsplash originals that already fit (sunset, salmon, night sky, …)
# are omitted so they are not overwritten.
COVERS: dict[str, int] = {
    "adaptogens": 6694149,  # dried herbs on wooden spoons
    "adh": 416528,  # glass of water
    "hpa-as": 7948527,  # empty autumn forest road
    "cortisol-v2": 7138778,  # herbal tea, no person
    "atp": 4793233,  # dumbbells, no person
    "testosteron": 13863730,  # gym dumbbells, no person
    "slaapschuld": 10554462,  # unmade bed, no person
    "sociale-verbinding": 8472173,  # cafe table, shared coffee
    "overtrainingssyndroom": 19141776,  # empty forest path
    "vitamine-d-inname": 6213751,  # olive oil (fat-soluble intake)
    "onderzoeksdosis": 4110253,  # wooden spoon portion
    "claimdekking": 261579,  # notebooks and coffee, no people
    "etikettransparantie": 1656663,  # market produce without price signs
    "onafhankelijke-toetsing": 2280547,  # microscope close-up, no person
    "derde-partij-testen": 6129866,  # empty test tubes, no person
    "ps-score-model": 606541,  # blank notebook on wood
    "scoregewichten": 8329286,  # measured herbs on wooden spoons
    "wei-eiwit": 8963368,  # milk and eggs
    "leucinedrempel": 1211887,  # feta salad (protein meal)
    "mitochondrien": 371589,  # alpine lake, no person
    "efsa-claims": 590493,  # library lights, spines unreadable
    "biobeschikbaarheid": 1327838,  # tomatoes
    "chelaatvorm": 1435904,  # mushrooms and peppers
    "healthspan": 1179229,  # forest canopy
    "insulineresistentie": 1640777,  # grain and vegetable bowl
    "multivitamine": 1092730,  # fruit bowl
    "nervus-vagus": 1761279,  # forest footbridge
    "vitamine-k2": 4109944,  # stacked cheeses, no newspaper text
    "thema-lichaam-veroudering": 414171,  # mountain landscape
    "thema-leefstijl-herstel": 8017404,  # empty bed, natural light
    "thema-ps-score": 6690217,  # tea and notebook
    "thema-longevity": 417074,  # mountain lake
    "thema-supplementwetenschap": 1340116,  # spice spoons
}

INLINES: dict[str, int] = {
    "biobeschikbaarheid": 1028599,  # citrus
    "chelaatvorm": 4033325,  # almonds (mineral-rich food)
    "adaptogens": 6694167,  # chamomile + lavender spoons
    "epa-dha": 725991,  # fish
    "circadiaan-ritme": 6694159,  # sunset
    "adh": 327090,  # water
    "efsa-claims": 796602,  # blank notebook, no people
    "derde-partij-testen": 8326143,  # microscope and tubes, no person
    "slaaphygiene": 164595,  # made bed
    "eiwitbehoefte-na-40": 1640771,  # protein mealprep
    "kalium-natrium-balans": 1414651,  # tomatoes / produce
    "healthspan": 775201,  # forest path
    "hpa-as": 1423600,  # forest light
    "cortisol": 1417945,  # green leaves
    "melatonine": 910307,  # night sky
    "mitochondrien": 346529,  # landscape
    "nervus-vagus": 1287145,  # snow mountains, calm
    "atp": 260352,  # dumbbell rack, no person
    "testosteron": 1366919,  # mountain vitality
    "slaapschuld": 12101227,  # rumpled white sheets
    "sociale-verbinding": 851555,  # coffee on a wooden table
    "magnesiumvormen": 2280567,  # leafy greens
    "overtrainingssyndroom": 457882,  # quiet beach rest
    "vitamine-d": 189349,  # ocean sunlight
    "vitamine-k2": 4109943,  # blue cheese, fermented K2 source
    "vitamine-d-inname": 10059902,  # olive oil bottle
    "insulineresistentie": 1640770,  # balanced grain bowls
    "oxidatieve-stress": 1099680,  # berries
    "multivitamine": 1128678,  # mixed fruit
    "ps-score-model": 317356,  # blank sticky notes
    "scoregewichten": 585752,  # desk with coffee and keyboard, no URL
    "onderzoeksdosis": 1640775,  # equal meal portions
    "claimdekking": 733857,  # blank open notebook
    "etikettransparantie": 1656666,  # kale and avocado, no labels
    "onafhankelijke-toetsing": 2280549,  # test tubes, no person
    "wei-eiwit": 101533,  # eggs at breakfast
    "leucinedrempel": 566566,  # eggs on toast
}

# If a primary id 404s — never reuse an id already assigned.
RESERVE = [
    821365,
    1351238,
    1552242,
    891059,
    6694163,
    414612,
    462162,
    531880,
    572897,
    554609,
    1365425,
    1001682,
    807598,
    1072179,
    1002703,
    547115,
    167699,
    210186,
    616409,
    1640774,
    2255935,
]


def pexels_url(photo_id: int) -> str:
    return (
        f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"
        f"?auto=compress&cs=tinysrgb&w=1600"
    )


def fetch(photo_id: int) -> bytes:
    req = urllib.request.Request(
        pexels_url(photo_id),
        headers={
            "User-Agent": UA,
            "Accept": "image/jpeg,image/*;q=0.8,*/*;q=0.5",
            "Referer": "https://www.pexels.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        ctype = resp.headers.get("Content-Type", "")
    if not data.startswith(b"\xff\xd8") and "jpeg" not in ctype.lower():
        raise RuntimeError(f"not jpeg for {photo_id} ({ctype}, {data[:20]!r})")
    return data


def crop_16x9(data: bytes, dest: Path) -> None:
    im = Image.open(BytesIO(data)).convert("RGB")
    target_w, target_h = 1600, 900
    src_w, src_h = im.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        im = im.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        im = im.crop((0, top, src_w, top + new_h))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=82, optimize=True)


def assigned_ids() -> set[int]:
    return set(COVERS.values()) | set(INLINES.values())


def take_reserve(used: set[int]) -> int:
    for photo_id in RESERVE:
        if photo_id not in used:
            used.add(photo_id)
            return photo_id
    raise RuntimeError("reserve pool exhausted")


def save_one(label: str, dest: Path, photo_id: int, used: set[int]) -> int:
    last_err: Exception | None = None
    try:
        data = fetch(photo_id)
        crop_16x9(data, dest)
        print(f"OK  {label:42s} pexels/{photo_id}  {dest.stat().st_size:7d}b")
        return photo_id
    except Exception as err:  # noqa: BLE001
        last_err = err
        print(f"FAIL {label} pexels/{photo_id}: {err}")
    for _ in range(8):
        fallback = take_reserve(used)
        try:
            data = fetch(fallback)
            crop_16x9(data, dest)
            print(f"OK  {label:42s} pexels/{fallback} (fallback)  {dest.stat().st_size:7d}b")
            return fallback
        except Exception as err:  # noqa: BLE001
            last_err = err
            print(f"FAIL {label} fallback pexels/{fallback}: {err}")
    raise RuntimeError(f"could not download {label}: {last_err}")


def main() -> int:
    dupes = set(COVERS.values()) & set(INLINES.values())
    if dupes:
        print(f"duplicate ids between covers and inlines: {sorted(dupes)}")
        return 1
    used = assigned_ids()
    mapping: dict[str, int] = {}
    jobs: list[tuple[str, Path, int]] = []
    only = set(sys.argv[1:])
    for slug, photo_id in COVERS.items():
        label = f"cover/{slug}"
        if only and label not in only and slug not in only:
            continue
        jobs.append((label, OUT_COVER / f"{slug}.jpg", photo_id))
    for slug, photo_id in INLINES.items():
        label = f"inline/{slug}"
        if only and label not in only and f"inline/{slug}" not in only and slug not in only:
            # Allow `inline/slug` or bare slug; bare slug would also match covers.
            if slug in COVERS and f"inline/{slug}" not in only:
                continue
            if only and slug not in only:
                continue
        jobs.append((label, OUT_INLINE / f"{slug}.jpg", photo_id))

    failed: list[str] = []
    for label, dest, photo_id in jobs:
        try:
            actual = save_one(label, dest, photo_id, used)
            mapping[label] = actual
            time.sleep(0.12)
        except Exception as err:  # noqa: BLE001
            failed.append(f"{label}: {err}")

    existing_path = ROOT / "scripts/kennisbank-pexels-ids.tsv"
    previous: dict[str, str] = {}
    if existing_path.exists():
        for line in existing_path.read_text(encoding="utf-8").splitlines()[1:]:
            if not line.strip():
                continue
            key, value = line.split("\t", 1)
            previous[key] = value
    previous.update({key: str(photo_id) for key, photo_id in mapping.items()})

    lines = ["kind/slug\tpexels_id"]
    for key in sorted(previous):
        lines.append(f"{key}\t{previous[key]}")
    existing_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nwrote {existing_path} ({len(previous)} ids)")
    if failed:
        print("FAILED:")
        print("\n".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
