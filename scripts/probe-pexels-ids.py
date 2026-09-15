#!/usr/bin/env python3
"""Probe candidate Pexels IDs into /tmp/pexels-candidates for visual review."""
from __future__ import annotations

import sys
import time
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

OUT = Path("/tmp/pexels-candidates")
OUT.mkdir(parents=True, exist_ok=True)
UA = "PerfectSupplement/1.0 editorial stock fetch (https://perfectsupplement.nl)"

CANDIDATES = [
    # notebooks / paper / desk
    733857, 891059, 317356, 261579, 261662, 1766604, 374746, 636237, 694740,
    159711, 590493, 851213, 606541, 4348404, 4050315, 5717472, 1925536,
    273238, 395204, 265722, 159866, 159144, 261687, 261628, 585752, 669615,
    904616, 1181772, 3184454, 261763, 3178818, 4348401, 5717469, 5797907,
    4050290, 4050302, 4050318, 4050320, 4050287,
    # landscapes
    572897, 531880, 147411, 414612, 462162, 1365425, 1001682, 807598, 1072179,
    326055, 371589, 547115, 206359, 268533, 210186, 167699, 34950, 158607,
    417173, 46253, 1002703, 1059905, 554609, 8329286, 414612, 462162,
    # food / protein / measuring
    1640770, 1640773, 1640774, 1640775, 566566, 806357, 162712, 416656,
    4110252, 1556707, 824635, 461198, 376464, 101533, 1656663, 1656666,
    419802, 4033146, 4033148, 4033325, 6287295, 4397899, 6944172, 3737670,
    3825574, 2280547, 616409, 12606673, 33783, 36487, 289363, 2255935,
    1352196, 302899, 374885, 414645, 373893, 1058277, 3184192, 3184183,
    37354, 1099680, 1414651, 793759, 1028599,
    # greens / magnesium
    1640771, 1640772, 1640776, 1640778, 1435904, 1458695, 1458699, 1458701,
    2255939, 2255940, 289368, 289372, 1352198, 1092730, 1128678,
    # lab-ish without people
    2280571, 2280549, 2280574, 3735425, 3735432, 572216, 2280567, 2280553,
    3825525, 3825527, 4033141, 256262, 8325750, 8326143,
    # cafe / two cups / table
    302901, 302902, 374906, 374908, 414646, 414648, 680298, 6802982,
    1058276, 1058278, 3184186, 3184196, 851555, 851557, 851559,
    # extra food
    1640779, 1640780, 1640781, 1640782, 1640783, 1640784, 1640785,
    566345, 566344, 566343, 4110251, 4110253, 1556706, 1556708, 806358,
    416657, 416658, 162713, 162714, 101534, 101535,
    # extra measuring / kitchen
    4033140, 4033142, 4033143, 4033144, 4033145, 4033147, 4033149,
    6287290, 6287291, 6287296, 4397900, 4397901, 6944170, 6944171,
    616401, 616402, 616403, 616405, 616406, 616407, 616408, 616410,
]


def fetch(photo_id: int) -> bytes:
    url = (
        f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"
        f"?auto=compress&cs=tinysrgb&w=800"
    )
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "image/jpeg,image/*;q=0.8,*/*;q=0.5",
            "Referer": "https://www.pexels.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = resp.read()
        ctype = resp.headers.get("Content-Type", "")
    if not data.startswith(b"\xff\xd8") and "jpeg" not in ctype.lower():
        raise RuntimeError(f"not jpeg ({ctype})")
    return data


def save_thumb(photo_id: int, data: bytes) -> None:
    im = Image.open(BytesIO(data)).convert("RGB")
    im.thumbnail((640, 360))
    dest = OUT / f"{photo_id}.jpg"
    im.save(dest, "JPEG", quality=70, optimize=True)


def main() -> int:
    ok = 0
    fail = 0
    seen: set[int] = set()
    for photo_id in CANDIDATES:
        if photo_id in seen:
            continue
        seen.add(photo_id)
        dest = OUT / f"{photo_id}.jpg"
        if dest.exists() and dest.stat().st_size > 2000:
            print(f"SKIP {photo_id}")
            ok += 1
            continue
        try:
            data = fetch(photo_id)
            save_thumb(photo_id, data)
            print(f"OK   {photo_id}  {dest.stat().st_size}")
            ok += 1
        except Exception as err:  # noqa: BLE001
            print(f"FAIL {photo_id}: {err}")
            fail += 1
        time.sleep(0.08)
    print(f"\ndone ok={ok} fail={fail} dir={OUT}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
