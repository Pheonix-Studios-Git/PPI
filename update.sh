#!/usr/bin/env bash
set -euo pipefail

echo "Updating packages.json..."

DATE="$(date '+%Y-%m-%d %H:%M')"

PAC_JSON=$(unzip -p data/PAC/nfx_zip/PAC.zip nfx.json)
NFX_JSON=$(unzip -p data/NFX/nfx_zip/NFX.zip nfx.json)
PDASM_JSON=$(unzip -p data/PDASM/nfx_zip/PDASM.zip nfx.json)
PHEONIX_JSON=$(unzip -p data/Pheonix-Engine/nfx_zip/Pheonix-Engine.zip nfx.json)

jq \
  --argjson pac "$PAC_JSON" \
  --argjson nfx "$NFX_JSON" \
  --argjson pdasm "$PDASM_JSON" \
  --argjson pheonix "$PHEONIX_JSON" \
  --arg date "$DATE" \
  '
  (.packages[] | select(.name=="PAC").update) = $pac.Build.Date |
  (.packages[] | select(.name=="NFX").update) = $nfx.Build.Date |
  (.packages[] | select(.name=="PDASM").update) = $pdasm.Build.Date |
  (.packages[] | select(.name=="Pheonix-Engine").update) = $pheonix.Build.Date |
  (.modified) = $date
  ' data/packages.json > data/packages.tmp.json

mv data/packages.tmp.json data/packages.json

echo "Done."