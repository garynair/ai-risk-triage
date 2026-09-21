#!/usr/bin/env bash
# Creates the "AI Use-Case Register" database inside a Notion page you choose.
#
# Usage:
#   export NOTION_TOKEN=...            # connection access token (see docs/SETUP.md for a safe way)
#   export NOTION_PARENT_PAGE=...      # page URL or 32-char page ID, shared with your connection
#   bash notion/create_register_db.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${NOTION_TOKEN:?Set NOTION_TOKEN (your Notion connection access token)}"
: "${NOTION_PARENT_PAGE:?Set NOTION_PARENT_PAGE (URL or ID of the page that will hold the database)}"

# Strip anything that can't be part of a token (guards against hidden characters from copy/paste)
TOKEN=$(printf '%s' "$NOTION_TOKEN" | tr -cd 'A-Za-z0-9_')

# Accept a full URL or a bare ID; take the last 32-hex-character run
PAGE_ID=$(printf '%s' "$NOTION_PARENT_PAGE" | sed 's/[?#].*//' | tr -d '-' | grep -oE '[0-9a-fA-F]{32,}' | tail -1 | grep -oE '.{32}$' || true)
[ -n "$PAGE_ID" ] || { echo "Could not find a 32-character page ID in NOTION_PARENT_PAGE"; exit 1; }

BODY=$(python3 -c 'import json,sys; s=json.load(open("register_schema.json")); s["parent"]={"type":"page_id","page_id":sys.argv[1]}; print(json.dumps(s))' "$PAGE_ID")

RESP=$(curl -sS -w '\n%{http_code}' https://api.notion.com/v1/databases \
  -H "Authorization: Bearer ${TOKEN}" -H "Notion-Version: 2022-06-28" -H "Content-Type: application/json" \
  --data "$BODY")
CODE=$(printf '%s' "$RESP" | tail -1)
JSON=$(printf '%s' "$RESP" | sed '$d')

if [ "$CODE" != "200" ]; then
  echo "FAILED (HTTP $CODE):"; printf '%s\n' "${JSON:-<empty response>}"
  case "$CODE" in
    400) echo "Hint: empty body usually means hidden characters in the token; non-empty body explains the field error." ;;
    401) echo "Hint: token invalid - copy it again with Notion's copy button." ;;
    404) echo "Hint: the page isn't shared with your connection (connection > Content access > add the page)." ;;
  esac
  exit 1
fi
ID=$(printf '%s' "$JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')
echo "Database created. DATABASE_ID = $ID"
echo "Paste it into the 'Build Register Entry' node in n8n."
