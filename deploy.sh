#!/bin/bash
set -e  # Stop bij errors

echo "🚀 Deploying PerfectSupplement to Hetzner..."
echo ""

# SSH en voer commands uit
ssh root@178.104.75.207 << 'EOF'
set -e

cd /root/perfectsupplement

echo "📥 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --production=false

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

#!/bin/bash
set -e

echo "🔍 Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Commit them first!"
    git status -s
    exit 1
fi

echo "📤 Pushing to GitHub..."
git push origin main

echo "🚀 Deploying to Hetzner..."
# ... rest van het script
