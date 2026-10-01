#!/bin/bash
set -e  # Stop bij errors

echo "🔍 Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Je hebt uncommitted changes. Commit ze eerst."
    git status -s
    exit 1
fi

echo "🔀 Lokale main bijwerken met GitHub..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "   Je stond op '$CURRENT_BRANCH' — overschakelen naar main."
    git checkout main
fi
git fetch origin main
if ! git merge --ff-only origin/main; then
    echo "⚠️  Lokale main is afgeweken van GitHub. Deploy gestopt — niets gepusht."
    echo "   Bekijk het verschil met: git log --oneline --graph main origin/main"
    exit 1
fi
AHEAD=$(git rev-list --count origin/main..main)
if [[ "$AHEAD" != "0" ]]; then
    echo "⚠️  Lokale main heeft $AHEAD commit(s) die niet op GitHub staan."
    echo "   Werk gaat via een PR, niet rechtstreeks naar main. Deploy gestopt."
    git log --oneline origin/main..main
    exit 1
fi
echo "   main = origin/main ($(git rev-parse --short HEAD))"

echo "🗄️  Checking remote Supabase schema (npm run check:db-schema)..."
if ! npm run check:db-schema; then
    echo "⚠️  Schema-check faalt — ontbrekende kolom/tabel/view op productie (zie MISSING hierboven)."
    echo "   Draai de bijbehorende migratie in de Supabase Dashboard SQL Editor en probeer opnieuw."
    exit 1
fi

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
bash scripts/deploy-remote.sh "$OLD_LOCK_HASH"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Check: https://perfectsupplement.nl"
EOF

echo ""
echo "✨ Done! Your site is live."
