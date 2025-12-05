#!/usr/bin/env bash
set -e

echo "🔧 Building Vite app..."
npm run build

echo "📦 Creating dist.zip..."
rm -f dist.zip
#zip -r dist.zip dist
tar -a -c -f dist.zip dist

ONEDRIVE_PATH="/c/Users/Admin/OneDrive/Prog/Share/EVcharge/"

echo "🔁 Copying dist.zip to OneDrive share folder..."
cp dist.zip "$ONEDRIVE_PATH"

echo "✅ deploy.sh finished successfully!"
echo "➡️  dist.zip is now in OneDrive: Prog/Share"
