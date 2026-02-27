#!/usr/bin/env bash

# ---------------------------------------------------------
# EVcharge - Android Import Script
# Installs release package into Termux runtime directory
# ---------------------------------------------------------

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

# ---- CONFIGURATION ----
SOURCE_DIR="/storage/emulated/0/Prog/Share/EVcharge"
ARCHIVE_NAME="evcharge_release.tar.gz"
ARCHIVE_PATH="$SOURCE_DIR/$ARCHIVE_NAME"

TARGET_DIR="$HOME/EVcharge"

# ---- CHECK ARCHIVE ----
if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "❌ Archive not found:"
    echo "   $ARCHIVE_PATH"
    exit 1
fi

# ---- STOP SERVER (if running) ----
echo "Stopping lighttpd (if running)..."
pkill lighttpd 2>/dev/null

# ---- EXTRACT TO TEMP FOLDER ----
echo "Extracting release..."
rm -rf "$TARGET_DIR/release"
mkdir -p "$TARGET_DIR"
tar -xzf "$ARCHIVE_PATH" -C "$TARGET_DIR"

# ---- REPLACE RUNTIME FILES ----
echo "Updating runtime directories..."

rm -rf "$TARGET_DIR/www"
rm -rf "$TARGET_DIR/cgi-bin"

mv "$TARGET_DIR/release/www" "$TARGET_DIR/"
mv "$TARGET_DIR/release/cgi-bin" "$TARGET_DIR/"
mv "$TARGET_DIR/release/lighttpd.conf" "$TARGET_DIR/"

rm -rf "$TARGET_DIR/release"

echo "✔ Deployment complete."

echo ""
echo "Start server with:"
echo "  lighttpd -D -f $HOME/EVcharge/lighttpd.conf"
echo ""
