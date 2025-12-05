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

# Where the file is located on the phone
SOURCE_DIR="/storage/emulated/0/Prog/Share/EVcharge"
ARCHIVE_NAME="evcharge_dist.tar.gz"
ARCHIVE_PATH="$SOURCE_DIR/$ARCHIVE_NAME"

# Where the app lives (dist/ will be replaced here)
APP_DIR="/storage/emulated/0/Prog/JavaScript/EVcharge"

cd "$APP_DIR"

# Ensure archive exists
if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "ERROR: Archive not found at:"
    echo "  $ARCHIVE_PATH"
    exit 1
fi

echo "Removing old dist/..."
rm -rf dist

echo "Extracting new dist/ from archive..."
tar -xzf "$ARCHIVE_PATH"

# dist/ will appear automatically from the archive

echo "Done!"
echo "dist/ has been updated."