#!/usr/bin/env sh
# ---------------------------------------------------------
# EVcharge - CGI endpoint
# Receives CSV payload via POST and appends to data file
# ---------------------------------------------------------

# Required CGI response header
echo "Content-Type: text/plain"
echo ""

# Determine base directory dynamically
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Data directory (relative to project root)
CSV_DIR="$BASE_DIR/data"
CSV_FILE="$CSV_DIR/evcharge.csv"

# Ensure data directory exists
mkdir -p "$CSV_DIR"

# Read POST body
BODY="$(cat)"

# Create file with header if it does not exist
if [ ! -f "$CSV_FILE" ]; then
  printf "%s\n" "Mileage;startDate;startTime;endDate;endTime;kWh;cost;notes" > "$CSV_FILE"
fi

# Append received CSV lines safely
printf "%s\n" "$BODY" >> "$CSV_FILE"

echo "OK"
