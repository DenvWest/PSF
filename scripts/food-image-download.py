#!/usr/bin/env python3
"""Download curated Pexels photos for food-catalog entries.

Square product thumbnails (1200x1200), one file per photo-owner key.

Fill IMAGES only after reviewing scripts/out/food-image-candidates.tsv —
never copy the search script's top-1 blindly. Each chosen id gets a short
comment describing what is on the photo (same habit as kennisbank covers).

Does not share ids or the TSV with download-kennisbank-pexels.py.
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
OUT_DIR = ROOT / "public/images/voedingsmiddelen"
TSV_PATH = ROOT / "scripts/food-image-ids.tsv"
UA = "PerfectSupplement/1.0 editorial stock fetch (https://perfectsupplement.nl)"

# Catalog photo-owner key -> Pexels id.
# Copy pairs here from food-image-candidates.tsv after a human picked a row.
IMAGES: dict[str, int] = {
    # "spinazie-gekookt": 1234567,  # cooked spinach in a bowl
}

# If a primary id 404s — never reuse an id already assigned.
RESERVE: list[int] = []


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


def crop_square(data: bytes, dest: Path) -> None:
    im = Image.open(BytesIO(data)).convert("RGB")
    target = 1200
    src_w, src_h = im.size
    side = min(src_w, src_h)
    left = (src_w - side) // 2
    top = (src_h - side) // 2
    im = im.crop((left, top, left + side, top + side))
    im = im.resize((target, target), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=82, optimize=True)


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
        crop_square(data, dest)
        print(f"OK  {label:42s} pexels/{photo_id}  {dest.stat().st_size:7d}b")
        return photo_id
    except Exception as err:  # noqa: BLE001
        last_err = err
        print(f"FAIL {label} pexels/{photo_id}: {err}")
    if not RESERVE:
        raise RuntimeError(
            f"could not download {label}: {last_err} (RESERVE is empty — add fallback ids)"
        )
    for _ in range(8):
        fallback = take_reserve(used)
        try:
            data = fetch(fallback)
            crop_square(data, dest)
            print(f"OK  {label:42s} pexels/{fallback} (fallback)  {dest.stat().st_size:7d}b")
            return fallback
        except Exception as err:  # noqa: BLE001
            last_err = err
            print(f"FAIL {label} fallback pexels/{fallback}: {err}")
    raise RuntimeError(f"could not download {label}: {last_err}")


def main() -> int:
    if not IMAGES:
        print(
            "IMAGES is empty. Review scripts/out/food-image-candidates.tsv, "
            "then paste chosen key -> pexels_id pairs into IMAGES."
        )
        return 0

    used = set(IMAGES.values())
    if len(used) != len(IMAGES):
        print("duplicate pexels ids in IMAGES")
        return 1

    only = set(sys.argv[1:])
    jobs: list[tuple[str, Path, int]] = []
    for key, photo_id in IMAGES.items():
        if only and key not in only:
            continue
        jobs.append((key, OUT_DIR / f"{key}.jpg", photo_id))

    mapping: dict[str, int] = {}
    failed: list[str] = []
    for key, dest, photo_id in jobs:
        try:
            actual = save_one(key, dest, photo_id, used)
            mapping[key] = actual
            time.sleep(0.12)
        except Exception as err:  # noqa: BLE001
            failed.append(f"{key}: {err}")

    previous: dict[str, str] = {}
    if TSV_PATH.exists():
        for line in TSV_PATH.read_text(encoding="utf-8").splitlines()[1:]:
            if not line.strip():
                continue
            key, value = line.split("\t", 1)
            previous[key] = value
    previous.update({key: str(photo_id) for key, photo_id in mapping.items()})

    lines = ["key\tpexels_id"]
    for key in sorted(previous):
        lines.append(f"{key}\t{previous[key]}")
    TSV_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nwrote {TSV_PATH} ({len(previous)} ids)")
    if failed:
        print("FAILED:")
        print("\n".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
