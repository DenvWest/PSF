#!/bin/bash
# Draait OP DE SERVER, na `git pull`, vanuit deploy.sh én .github/workflows/deploy.yml.
# Gebruik: bash scripts/deploy-remote.sh <package-lock-hash van vóór de pull>
set -e

OLD_LOCK_HASH="${1:-none}"
NEW_LOCK_HASH=$(git rev-parse HEAD:package-lock.json 2>/dev/null || echo "none")

# Elke build vervangt .next/static door bestanden met nieuwe hashnamen. Pagina's
# die nog openstaan en Clarity-opnames (die de CSS pas bij afspelen ophalen)
# verwijzen naar de oude namen en krijgen dan een 404: ongestylede replays en
# ChunkLoadErrors. Daarom bewaren we de assets van eerdere builds nog 14 dagen.
STATIC_ARCHIVE=".next-static-archive"
STATIC_KEEP_DAYS=14

if [[ "$OLD_LOCK_HASH" != "$NEW_LOCK_HASH" || ! -d node_modules ]]; then
    echo "📦 package-lock.json gewijzigd — installing dependencies..."
    npm ci
else
    echo "📦 package-lock.json ongewijzigd — dependencies overslaan"
fi

if [[ -d .next/static ]]; then
    echo "🗃️  Assets van de huidige build archiveren..."
    mkdir -p "$STATIC_ARCHIVE"
    cp -a .next/static/. "$STATIC_ARCHIVE/"
fi

# Turbopack's persistente cache hield op 23 sep 2026 een CSS-artefact van
# 17 sep vast: globals.css was gewijzigd, maar de gebouwde bundel miste alles
# vanaf de `.vd-*`-blokken. De JS was wel nieuw, dus "Je patroon" rende live
# volledig ongestyled. De cache overleeft een git pull en wordt niet
# ongeldig verklaard, dus gooien we 'm per deploy weg.
echo "🧹 Build-cache opruimen..."
rm -rf .next/cache/turbopack

echo "🏗️  Building production version..."
npm run build

if [[ -d "$STATIC_ARCHIVE" ]]; then
    echo "🗃️  Oude assets (< ${STATIC_KEEP_DAYS} dagen) terugzetten naast de nieuwe build..."
    find "$STATIC_ARCHIVE" -type f -mtime +"$STATIC_KEEP_DAYS" -delete
    find "$STATIC_ARCHIVE" -type d -empty -delete
    mkdir -p "$STATIC_ARCHIVE"
    cp -an "$STATIC_ARCHIVE/." .next/static/
fi

echo "🔄 Restarting Next.js service..."
sudo systemctl restart perfectsupplement

echo ""
echo "⏳ Waiting for service to start..."
sleep 3

echo "✅ Checking service status..."
sudo systemctl status perfectsupplement --no-pager -l
