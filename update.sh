#!/usr/bin/env bash

set -euo pipefail

echo "Updating packages.json..."

DATE="$(date '+%Y-%m-%d %H:%M')"

# Track requested updates
UPDATES=()

# Parse args like:
# --update=PAC --update=PDASM
for arg in "$@"; do
  case $arg in
    --update=*)
      UPDATES+=("${arg#*=}")
      ;;
    *)
      echo "Unknown argument: $arg"
      exit 1
      ;;
  esac
done

# Start with existing packages.json
TMP_JSON="$(cat data/packages.json)"

# Only update modified
if [ ${#UPDATES[@]} -eq 0 ]; then
  echo "Updating only package list..."

  TMP_JSON=$(echo "$TMP_JSON" | jq \
    --arg modified "$DATE" \
    '.modified = $modified')

  echo "$TMP_JSON" > data/packages.tmp.json

  echo "packages edit done!"

  mv data/packages.tmp.json data/packages.json

  echo "Moving Done!"
  echo "Done."
  exit 0
fi

# Helper function
update_package() {
  local name="$1"
  local zip_path="$2"

  echo "Updating $name..."

  BUILD_DATE=$(unzip -p "$zip_path" nfx.json | jq -r '.Build.Date')

  TMP_JSON=$(echo "$TMP_JSON" | jq \
    --arg name "$name" \
    --arg date "$BUILD_DATE" \
    '
    (.packages[] | select(.name == $name).update) = $date
    ')
}

# Process requested updates
for update in "${UPDATES[@]}"; do
  case "$update" in
    PAC)
      update_package "PAC" "data/PAC/nfx_zip/PAC-v1.0.2.zip"
      ;;
    NFX)
      update_package "NFX" "data/NFX/nfx_zip/NFX-v1.0.2.zip"
      ;;
    PDASM)
      update_package "PDASM" "data/PDASM/nfx_zip/PDASM.zip"
      ;;
    PHEONIX|Pheonix-Engine)
      update_package "Pheonix-Engine" "data/Pheonix-Engine/nfx_zip/Pheonix-Engine.zip"
      ;;
    *)
      echo "Unknown update target: $update"
      exit 1
      ;;
  esac
done

TMP_JSON=$(echo "$TMP_JSON" | jq \
  --arg modified "$DATE" \
  '.modified = $modified')

echo "$TMP_JSON" > data/packages.tmp.json

echo "packages edit done!"

mv data/packages.tmp.json data/packages.json

echo "Moving Done!"
echo "Done."