#!/usr/bin/env bash
# Download + resize blog cover images from Unsplash CDN (verified photo IDs).
set -euo pipefail
OUT="/home/dennisvanwestbroek/psf/public/images/blog"
TMP="$OUT/.tmp-download"
mkdir -p "$TMP"

# slug|unsplash-photo-id (all HTTP 200 verified)
MAP=(
  "cortisol-verlagen-natuurlijk|1506126613408-eca07ce68773"
  "cortisol-en-slaap|1541781774459-bb2af2f05b55"
  "ademhaling-tegen-stress|1544367567-0f2fcb009e0b"
  "stress-werk-grenzen-stellen|1497366216548-37526070297c"
  "cortisol-en-testosteron|1571019614242-c5c5dee9f50b"
  "slaap-verbeteren-40-plus|1522771739844-6a9f6d5f14af"
  "slaaphygiene-mannen-40-plus|1511295742362-92c96b1cf484"
  "magnesium-en-slaap|1519681393784-d120267933ba"
  "melatonine-wanneer-wel-niet|1419242902214-272b3f66ee7a"
  "melatonine-na-40|1495567720989-cebdbdd97913"
  "slaapritme-herstellen|1530026405186-ed1f139313f8"
  "vitamine-d-en-slaap|1506905925346-21bda4d32df4"
  "energie-verhogen-natuurlijk|1476480862126-209bfaa8edc8"
  "vitamine-d-tekort-herkennen|1469474968028-56623f02e42e"
  "testosteron-en-energie-na-40|1517836357463-d25dfeac3438"
  "omega-3-concentratie-energie|1519708227418-c8fd9a32b7a2"
  "vitamine-d-en-energie|1507525428034-b723cf961d3e"
  "eiwit-na-40|1546069901-ba9599a7e63c"
  "eiwitinname-timing-mannen-40|1504674900247-0877df9cc836"
  "middagdip-bloedsuiker-na-40|1455619452474-d2be8b1e70cd"
  "krachttraining-na-40|1434682881908-b43d0467b798"
  "alcohol-slaap-energie-na-40|1510812431401-41d2bd2722f3"
  "zout-kalium-bloeddruk-na-40|1512621776951-a57141f2eefd"
  "zonnebrand-en-vitamine-d|1557683316-973673baf926"
  "vitamine-d-zon-nederland|1495567720989-cebdbdd97913"
  "vitamine-d-meten-wanneer-zinvol|1559757175-5700dde675bc"
  "vitamine-d-seizoenen-jaarritme|1469474968028-56623f02e42e"
  "vitamine-d-aandoeningen-onderzoek|1532094349884-543bc11b234d"
  "ashwagandha-werking-mannen|1515377905703-c4788e51af15"
  "magnesium-en-slaapkwaliteit|1498837167922-ddd27525d352"
  "magnesium-in-combinatie-met-medicijnen|1607613009820-a29f7bb81c04"
  "creatine-en-herstel|1517838277536-f5f99be501cd"
  "creatine-bijwerkingen-nieren-haaruitval|1571019613454-1cb2f99b2d8b"
  "creatine-dosering-en-laadfase|1599058917212-d750089bc07e"
  "creatine-wanneer-innemen|1534438327276-14e5300c3a48"
  "creatine-vormen-en-keurmerken|1556909114-f6e7ad7d3136"
  "creatine-water-vasthouden-en-gewicht|1576678927484-cc907957088c"
  "creatine-en-brein-slaaptekort|1511988617509-a57c8a288659"
  "creatine-voor-vrouwen-na-40|1518611012118-696072aa579a"
  "vitamine-d-en-k2-samen|1550572017-edd951b55104"
  "vitamine-d-hoge-doses-social-media|1611162617474-5b21e879e113"
  "zink-en-testosteron|1476224203421-9ac39bcb3327"
  "omega-3-en-herstel|1565299624946-b28f40a0ae38"
  "multivitamine-zinvol-na-40|1556910103-1c02745aae4d"
  "beste-omega-3-supplement|1547592166-23ac45744acd"
  "wat-is-omega-3|1441986300917-64674bd600d8"
  "waar-let-je-op-bij-omega-3|1486312338219-ce68d2c6f44d"
  "beste-magnesium|1522202176988-66273c2fd55f"
  "supplement-kiezen-waar-op-letten|1454165804606-c3d57bc86b40"
)

# Fix duplicates: vitamine-d-zon and melatonine-na-40 share; vitamine-d-seizoenen and tekort share
# Reassign with remaining unique IDs from pool extras used above carefully:
# melatonine-na-40 stays autumn sun; vitamine-d-zon uses mountains already used by vitamine-d-en-slaap
# Use: 1551836022 and 1517245386807 for the two that need uniqueness

FAILED=()
OK=0
for entry in "${MAP[@]}"; do
  slug="${entry%%|*}"
  id="${entry##*|}"
  # override duplicates
  case "$slug" in
    vitamine-d-zon-nederland) id="1551836022-d5d88e9218df" ;;
    vitamine-d-seizoenen-jaarritme) id="1517245386807-bb43f82c33c4" ;;
  esac
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
