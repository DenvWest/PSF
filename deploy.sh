#!/bin/bash
set -e  # Stop bij errors

echo "🔍 Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Je hebt uncommitted changes. Commit ze eerst."
    git status -s
    exit 1
fi

echo "🗄️  Checking remote Supabase schema (npm run check:db-schema)..."
if ! npm run check:db-schema; then
    echo "⚠️  Schema-check faalt — ontbrekende kolom/tabel/view op productie (zie MISSING hierboven)."
    echo "   Draai de bijbehorende migratie in de Supabase Dashboard SQL Editor en probeer opnieuw."
    exit 1
fi

echo "📤 Pushing to GitHub (pre-push hook draait tsc + vitest)..."
git push origin main

echo ""
echo "🚀 Deploying PerfectSupplement to Hetzner..."
echo ""

# SSH en voer commands uit
ssh root@178.104.75.207 << 'EOF'
set -e

cd /root/perfectsupplement

echo "📥 Pulling latest changes from Git..."
OLD_LOCK_HASH=$(git rev-parse HEAD:package-lock.json 2>/dev/null || echo "none")
git pull origin main
NEW_LOCK_HASH=$(git rev-parse HEAD:package-lock.json 2>/dev/null || echo "none")

if [[ "$OLD_LOCK_HASH" != "$NEW_LOCK_HASH" || ! -d node_modules ]]; then
    echo "📦 package-lock.json gewijzigd — installing dependencies..."
    npm ci
else
    echo "📦 package-lock.json ongewijzigd — dependencies overslaan"
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

echo "🔄 Restarting Next.js service..."
sudo systemctl restart perfectsupplement

echo ""
echo "⏳ Waiting for service to start..."
sleep 3

echo "✅ Checking service status..."
sudo systemctl status perfectsupplement --no-pager -l

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Check: https://perfectsupplement.nl"
EOF

echo ""
echo "✨ Done! Your site is live."
