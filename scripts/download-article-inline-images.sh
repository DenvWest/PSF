#!/usr/bin/env bash
# Download + resize inline article images from Unsplash (IDs not used as covers).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLOG_OUT="$ROOT/public/images/blog/inline"
KB_OUT="$ROOT/public/images/kennisbank/inline"
TMP="$ROOT/public/images/.tmp-inline-download"
mkdir -p "$TMP" "$BLOG_OUT" "$KB_OUT"

# kind|slug|unsplash-photo-id
MAP=(
  "blog|cortisol-verlagen-natuurlijk|1500534623283-312aade485b7"
  "blog|cortisol-en-slaap|1505693416388-ac5ce068fe85"
  "blog|ademhaling-tegen-stress|1545205597-3d9d02c29597"
  "blog|stress-werk-grenzen-stellen|1497366754035-f200968a6e72"
  "blog|cortisol-en-testosteron|1541534741688-6078c6bfb5c5"
  "blog|ashwagandha-werking-mannen|1465146633011-14f8e0781093"
  "blog|slaap-verbeteren-40-plus|1560448204-e02f11c3d0e2"
  "blog|slaaphygiene-mannen-40-plus|1540518614846-7eded433c457"
  "blog|magnesium-en-slaap|1540420773420-3366772f4999"
  "blog|magnesium-en-slaapkwaliteit|1555041469-a586c61ea9bc"
  "blog|magnesium-in-combinatie-met-medicijnen|1576091160399-112ba8d25d1d"
  "blog|melatonine-wanneer-wel-niet|1505691938895-1758d7feb511"
  "blog|melatonine-na-40|1522708323590-d24dbb6b0267"
  "blog|slaapritme-herstellen|1470071459604-3b5ec3a7fe05"
  "blog|vitamine-d-en-slaap|1631049307264-da0ec9d70304"
  "blog|energie-verhogen-natuurlijk|1501785888041-af3ef285b470"
  "blog|vitamine-d-tekort-herkennen|1518837695005-2083093ee35b"
  "blog|testosteron-en-energie-na-40|1551632811-561732d1e306"
  "blog|omega-3-concentratie-energie|1551963831-b3b1ca40c98e"
  "blog|vitamine-d-en-energie|1472214103451-9374bd1c798e"
  "blog|eiwit-na-40|1556679343-c7306c1976bc"
  "blog|eiwitinname-timing-mannen-40|1558160074-4d7d8bdf4256"
  "blog|middagdip-bloedsuiker-na-40|1564890369478-c89ca6d9cde9"
  "blog|krachttraining-na-40|1581009146145-b5ef050c2e1e"
  "blog|alcohol-slaap-energie-na-40|1495474472287-4d71bcdd2085"
  "blog|zout-kalium-bloeddruk-na-40|1552321554-5fefe8c9ef14"
  "blog|zonnebrand-en-vitamine-d|1500534314209-a25ddb2bd429"
  "blog|vitamine-d-zon-nederland|1501854140801-50d01698950b"
  "blog|vitamine-d-meten-wanneer-zinvol|1579684385127-1ef15d508118"
  "blog|vitamine-d-seizoenen-jaarritme|1447752875215-b2761acb3c5d"
  "blog|vitamine-d-aandoeningen-onderzoek|1481627834876-b7833e8f5570"
  "blog|vitamine-d-en-k2-samen|1540189549336-e6e99c3679fe"
  "blog|vitamine-d-hoge-doses-social-media|1542491218-cdf4a1eb1e0e"
  "blog|overgang|1589156280159-27698a70f29e"
  "blog|testosteron-na-40|1581009146145-b5ef050c2e1e"
  "blog|buikvet-cortisol-slaap-mannen|1551632811-561732d1e306"
  "blog|krachtverlies-eiwitbehoefte-na-40|1504674900247-0877df9cc836"
  "blog|magnesium-herstel-mannen-40|1439066615861-d1af74d74000"
  "blog|slaapkwaliteit-testosteron-herstel|1541781774459-bb2af2f05b55"
  "blog|vermoeidheid-bloedwaarden-checken-mannen|1559757175-5700dde675bc"
  "blog|overgang-slaapproblemen-opvliegers|1560448204-e02f11c3d0e2"
  "blog|overgang-buikvet-gewichtstoename|1594381898411-846e7d193883"
  "blog|overgang-stress-cortisol|1506126613408-eca07ce68773"
  "blog|vitamine-d-botgezondheid-overgang|1506905925346-21bda4d32df4"
  "blog|creatine-en-herstel|1439066615861-d1af74d74000"
  "blog|creatine-bijwerkingen-nieren-haaruitval|1509042239860-f550ce710b93"
  "blog|creatine-dosering-en-laadfase|1574680096145-d05b474e2155"
  "blog|creatine-wanneer-innemen|1517963879433-6ad2b056d712"
  "blog|creatine-vormen-en-keurmerken|1461749280684-dccba630e2f6"
  "blog|creatine-water-vasthouden-en-gewicht|1554995207-c18c203602cb"
  "blog|creatine-en-brein-slaaptekort|1504384308090-c894fdcc538d"
  "blog|creatine-voor-vrouwen-na-40|1556911220-e15b29be8c8f"
  "blog|zink-en-testosteron|1488459716781-31db52582fe9"
  "blog|omega-3-en-herstel|1475113548554-5a36f1f523d6"
  "blog|multivitamine-zinvol-na-40|1616486338812-3dadae4b4ace"
  "blog|beste-omega-3-supplement|1618221195710-dd6b41faaea6"
  "blog|wat-is-omega-3|1600210492486-724fe5c67fb0"
  "blog|waar-let-je-op-bij-omega-3|1497215728101-856f4ea42174"
  "blog|beste-magnesium|1600607687939-ce8a6c25118c"
  "blog|supplement-kiezen-waar-op-letten|1582719478250-c89cae4dc85b"
  "kennisbank|biobeschikbaarheid|1600566753086-00f18fb6b3ea"
  "kennisbank|chelaatvorm|1608571423902-eed4a5ad8108"
  "kennisbank|adaptogens|1600585154340-be6161a56a0c"
  "kennisbank|epa-dha|1464822759023-fed622ff2c3b"
  "kennisbank|circadiaan-ritme|1600596542815-ffad4c1539a9"
  "kennisbank|adh|1512917774080-9991f1c4c750"
  "kennisbank|efsa-claims|1521737604893-d14cc237f11d"
  "kennisbank|derde-partij-testen|1576086213369-97a306d36557"
  "kennisbank|slaaphygiene|1556912173-3bb406ef7e77"
  "kennisbank|eiwitbehoefte-na-40|1567620905732-2d1ec7ab7445"
  "kennisbank|kalium-natrium-balans|1564013799919-ab600027ffc6"
  "kennisbank|healthspan|1476514525535-07fb3b4ae5f1"
  "kennisbank|hpa-as|1418065460487-3e41a6c84dc5"
  "kennisbank|cortisol|1570129477492-45c003edd2be"
  "kennisbank|melatonine|1493809842364-78817add7ffb"
  "kennisbank|mitochondrien|1448375240586-882707db888b"
  "kennisbank|nervus-vagus|1500382017468-9049fed747ef"
  "kennisbank|atp|1502672260266-1c1ef2d93688"
  "kennisbank|testosteron|1426604966848-d7adac402bff"
  "kennisbank|slaapschuld|1522071820081-009f0129c71c"
  "kennisbank|sociale-verbinding|1543269865-cbf427effbad"
  "kennisbank|magnesiumvormen|1511632765486-a01980e01a18"
  "kennisbank|overtrainingssyndroom|1552664730-d307ca884978"
  "kennisbank|vitamine-d|1500530855697-b586d89ba3ee"
  "kennisbank|vitamine-k2|1516549655169-df83a0774514"
  "kennisbank|vitamine-d-inname|1505751172876-fa1923c5c528"
  "kennisbank|insulineresistentie|1579684453423-f84349ef60b0"
  "kennisbank|oxidatieve-stress|1530497610245-94d3c16cda28"
  "kennisbank|multivitamine|1542838132-92c53300491e"
  "kennisbank|ps-score-model|1524995997946-a1c2e315a42f"
  "kennisbank|scoregewichten|1551601651-2a8555f1a136"
  "kennisbank|onderzoeksdosis|1532187863486-abf9dbad1b69"
  "kennisbank|claimdekking|1581091226825-a6a2a5aee158"
  "kennisbank|etikettransparantie|1581092160562-40aa08e78837"
  "kennisbank|onafhankelijke-toetsing|1559839734-2b71ea197ec2"
)

FAILED=()
OK=0
for entry in "${MAP[@]}"; do
  kind="${entry%%|*}"
  rest="${entry#*|}"
  slug="${rest%%|*}"
  id="${rest##*|}"

  if [ "$kind" = "blog" ]; then
    dest="$BLOG_OUT/${slug}.jpg"
  else
    dest="$KB_OUT/${slug}.jpg"
  fi
  if [ -f "$dest" ]; then
    echo "→ $kind/$slug SKIP existing"
    OK=$((OK + 1))
    continue
  fi
  raw="$TMP/${kind}-${slug}.jpg"
  url="https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&h=900&q=80"
  echo "→ $kind/$slug ($id)"
  if curl -fsSL --max-time 30 -A "Mozilla/5.0" -o "$raw" "$url"; then
    if file "$raw" | grep -qiE 'JPEG|PNG|WebP|image'; then
      magick "$raw" -resize '1600x900^' -gravity center -extent 1600x900 -quality 82 "$dest"
      echo "  OK $(du -h "$dest" | cut -f1)"
      OK=$((OK + 1))
    else
      echo "  FAIL not an image ($(file -b "$raw" | head -c 80))"
      FAILED+=("$kind|$slug|$id")
    fi
  else
    echo "  FAIL download"
    FAILED+=("$kind|$slug|$id")
  fi
done

echo ""
echo "OK: $OK  Failed: ${#FAILED[@]}"
printf '%s\n' "${FAILED[@]}"
rm -rf "$TMP"
if [ "${#FAILED[@]}" -gt 0 ]; then
  exit 1
fi
