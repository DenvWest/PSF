#!/usr/bin/env bash
# Download + resize kennisbank cover images from Unsplash CDN (verified photo IDs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/images/kennisbank"
TMP="$OUT/.tmp-download"
mkdir -p "$TMP" "$OUT"

# slug|unsplash-photo-id
MAP=(
  "biobeschikbaarheid|1556910103-1c02745aae4d"
  "chelaatvorm|1576678927484-cc907957088c"
  "adaptogens|1515377905703-c4788e51af15"
  "epa-dha|1519708227418-c8fd9a32b7a2"
  # live file: epa-dha-v2.jpg (cache-bust rename)
  "circadiaan-ritme|1495567720989-cebdbdd97913"
  # adh — AI (ATTRIBUTION.md)
  "efsa-claims|1454165804606-c3d57bc86b40"
  # derde-partij-testen — AI (ATTRIBUTION.md)
  "slaaphygiene|1522771739844-6a9f6d5f14af"
  "eiwitbehoefte-na-40|1546069901-ba9599a7e63c"
  "kalium-natrium-balans|1512621776951-a57141f2eefd"
  "healthspan|1476480862126-209bfaa8edc8"
  "hpa-as|1506126613408-eca07ce68773"
  "cortisol|1506126613408-eca07ce68773"
  "melatonine|1419242902214-272b3f66ee7a"
  "mitochondrien|1469474968028-56623f02e42e"
  "nervus-vagus|1544367567-0f2fcb009e0b"
  "atp|1434682881908-b43d0467b798"
  "testosteron|1517836357463-d25dfeac3438"
  "slaapschuld|1511295742362-92c96b1cf484"
  "sociale-verbinding|1529156069898-49953e39b3ac"
  "magnesiumvormen|1498837167922-ddd27525d352"
  "overtrainingssyndroom|1517838277536-f5f99be501cd"
  "vitamine-d|1507525428034-b723cf961d3e"
  "vitamine-k2|1550572017-edd951b55104"
  "vitamine-d-inname|1559757175-5700dde675bc"
  "insulineresistentie|1455619452474-d2be8b1e70cd"
  "oxidatieve-stress|1506905925346-21bda4d32df4"
  "multivitamine|1556910103-1c02745aae4d"
  "ps-score-model|1554224155-6726b3ff858f"
  # scoregewichten — geen eigen cover; thema-ps-score fallback
  "onderzoeksdosis|1532094349884-543bc11b234d"
  # claimdekking — AI (ATTRIBUTION.md)
  "etikettransparantie|1556909114-f6e7ad7d3136"
  "onafhankelijke-toetsing|1582719471384-894fbb16e074"
)

FAILED=()
OK=0
for entry in "${MAP[@]}"; do
  slug="${entry%%|*}"
  id="${entry##*|}"
  dest="$OUT/${slug}.jpg"
  raw="$TMP/${slug}.jpg"
  url="https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&h=900&q=80"
  echo "→ $slug ($id)"
  if curl -fsSL --max-time 30 -A "Mozilla/5.0" -o "$raw" "$url"; then
    if file "$raw" | grep -qiE 'JPEG|PNG|WebP|image'; then
      magick "$raw" -resize '1600x900^' -gravity center -extent 1600x900 -quality 82 "$dest"
      echo "  OK $(du -h "$dest" | cut -f1)"
      OK=$((OK + 1))
    else
      echo "  FAIL not an image ($(file -b "$raw" | head -c 80))"
      FAILED+=("$slug|$id")
    fi
  else
    echo "  FAIL download"
    FAILED+=("$slug|$id")
  fi
done

echo ""
echo "OK: $OK  Failed: ${#FAILED[@]}"
printf '%s\n' "${FAILED[@]}"
rm -rf "$TMP"
