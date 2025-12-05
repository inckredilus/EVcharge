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

# Path inside Windows (Git Bash / VS Code terminal)
ONEDRIVE_PATH="/c/Users/Admin/OneDrive/Prog/Share/EVcharge"

# Ensure destination directory exists
if [ ! -d "$ONEDRIVE_PATH" ]; then
    echo "Creating OneDrive share directory: $ONEDRIVE_PATH"
    mkdir -p "$ONEDRIVE_PATH"
fi

ARCHIVE_NAME="evcharge_dist.tar.gz"
ARCHIVE_PATH="$ONEDRIVE_PATH/$ARCHIVE_NAME"

# Remove old archive if exists
if [ -f "$ARCHIVE_PATH" ]; then
    echo "Removing existing archive: $ARCHIVE_PATH"
    rm -f "$ARCHIVE_PATH"
fi

# Create tar.gz from the dist folder in the current directory
echo "Creating archive from ./dist..."
tar -czf "$ARCHIVE_PATH" dist

echo "Done!"
echo "Archive created at:"
echo "  $ARCHIVE_PATH"
echo ""
echo "Copy this file manually to the Android share folder:"
echo "/storage/emulated/0/Prog/Share/EVcharge/"