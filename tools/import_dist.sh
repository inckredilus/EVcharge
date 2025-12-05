#!/data/data/com.termux/files/usr/bin/bash

# ---- ENVIRONMENT CHECK ----
is_android() {
    case "$PREFIX" in
        *com.termux*) return 0 ;;
        *) return 1 ;;
    esac
}

if ! is_android; then
    echo "❌ ERROR: import.sh must be run on Android/Termux."
    exit 1
fi

echo "✔ Environment OK: Android/Termux detected"

# ---- PATH CONFIG ----
ZIP_NAME="evcharge_dist.zip"
SOURCE_ZIP="$HOME/storage/shared/OneDrive/Prog/Share/EVcharge/$ZIP_NAME"
TARGET_DIR="$HOME/EVcharge/www"

# ---- CHECK ZIP EXISTS ----
if [ ! -f "$SOURCE_ZIP" ]; then
    echo "❌ ZIP file not found at:"
    echo "   $SOURCE_ZIP"
    echo "📌 Check that OneDrive has synced."
    exit 1
fi

echo "📂 ZIP found: $SOURCE_ZIP"

# ---- PREPARE TARGET DIR ----
mkdir -p "$TARGET_DIR"

echo "🧹 Cleaning old dist in: $TARGET_DIR"
rm -rf "$TARGET_DIR"/*

# ---- EXTRACT ----
echo "📦 Extracting ZIP..."
cd "$TARGET_DIR" || exit 1
tar -xzf "$SOURCE_ZIP"

echo "✔ Deployment complete!"
echo "✨ Files extracted to: $TARGET_DIR"
