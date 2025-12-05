#!/bin/bash

# ---- ENVIRONMENT CHECK ----
is_windows() {
    case "$(uname -s)" in
        MINGW*|MSYS*|CYGWIN*) return 0 ;;
        *) return 1 ;;
    esac
}

if ! is_windows; then
    echo "❌ ERROR: deploy.sh must be run on Windows (Git Bash / VSCode)."
    exit 1
fi

echo "✔ Environment OK: Windows detected"

# ---- PATH CONFIG ----
ONEDRIVE_PATH="/c/Users/Admin/OneDrive/Prog/Share/EVcharge"
ZIP_NAME="evcharge_dist.zip"

# ---- BUILD PROJECT ----
echo "🏗  Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

# ---- PACKAGE dist/ ----
echo "📦 Creating ZIP archive..."
mkdir -p "$ONEDRIVE_PATH"

cd dist || { echo "❌ dist/ folder missing"; exit 1; }
tar -czf "$ONEDRIVE_PATH/$ZIP_NAME" ./*
cd ..

echo "✔ ZIP stored at: $ONEDRIVE_PATH/$ZIP_NAME"
echo "➡️ Transfer this ZIP to your phone via OneDrive"

