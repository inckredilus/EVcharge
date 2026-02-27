#!/bin/bash

# ---------------------------------------------------------
# EVcharge - Windows Release Deployment Script
# Creates release tarball for Android (Termux)
# ---------------------------------------------------------

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

# ---- PATH CONFIGURATION ----
ONEDRIVE_PATH="/c/Users/Admin/OneDrive/Prog/Share/EVcharge"
ARCHIVE_NAME="evcharge_release.tar.gz"
ARCHIVE_PATH="$ONEDRIVE_PATH/$ARCHIVE_NAME"

# ---- BUILD REACT APP ----
echo "Building React app..."
npm run build || exit 1

# ---- PREPARE TEMP RELEASE FOLDER ----
echo "Preparing release structure..."
rm -rf release
mkdir -p release/www
mkdir -p release/cgi-bin

# Copy React build
cp -r dist/* release/www/

# Copy CGI and config
cp cgi/write_csv.cgi release/cgi-bin/
cp lighttpd/lighttpd.conf release/

# ---- CREATE ARCHIVE ----
echo "Creating release archive..."
rm -f "$ARCHIVE_PATH"
tar -czf "$ARCHIVE_PATH" release

# Cleanup temp folder
rm -rf release

echo ""
echo "✔ Release package created:"
echo "  $ARCHIVE_PATH"
echo ""
echo "Next steps on Android:"
echo "1) Copy archive to:"
echo "   /storage/emulated/0/Prog/Share/EVcharge/"
echo "2) Run your import script in Termux"
echo ""
