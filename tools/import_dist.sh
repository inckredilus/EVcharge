#!/data/data/com.termux/files/usr/bin/bash
set -e

PROJECT_DIR="/storage/emulated/0/Prog/JavaScript/EVcharge"
ZIP_SOURCE="/storage/emulated/0/Prog/Share/dist.zip"

echo "🔍 Looking for dist.zip..."
if [ ! -f "$ZIP_SOURCE" ]; then
    echo "❌ dist.zip not found in $ZIP_SOURCE"
    exit 1
fi

cd "$PROJECT_DIR"

echo "🗑️ Removing old dist directory..."
rm -rf dist

echo "📦 Unzipping new dist..."
unzip "$ZIP_SOURCE"

echo "🎉 Import complete! New build installed."

echo ""
echo "To restart your local server, run:"
echo "busybox httpd -p 8081 -h $PROJECT_DIR/dist"
