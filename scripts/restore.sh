#!/usr/bin/env bash
# Renfit — MongoDB restore.
#
#   scripts/restore.sh backups/renfit-20261114-031500.archive.gz
#       Replaces the live `renfit` database with the archive. Asks you to type
#       "restore" first, takes a safety backup of the current data
#       (backups/pre-restore-*.archive.gz), and stops the backend while
#       restoring so no writes interleave. Users must log in again afterwards
#       only if the archive predates their session.
#
#   scripts/restore.sh <archive> --into renfit_check
#       Restores into a separate scratch database instead — the live data and
#       the backend are not touched. Use it to check that a backup is good;
#       drop it afterwards with:
#         docker exec renfit-mongo mongosh --quiet --eval 'db.getSiblingDB("renfit_check").dropDatabase()'
#
#   --yes   skip the confirmation prompt (for scripted use)
#
# Env vars: MONGO_CONTAINER (default renfit-mongo), DB_NAME (default renfit).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MONGO_CONTAINER="${MONGO_CONTAINER:-renfit-mongo}"
DB_NAME="${DB_NAME:-renfit}"

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

archive=""; into=""; yes=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --into) into="${2:-}"; [[ -n "$into" ]] || usage; shift 2 ;;
    --yes) yes=true; shift ;;
    -h|--help) usage ;;
    *) [[ -z "$archive" ]] || usage; archive="$1"; shift ;;
  esac
done
[[ -n "$archive" ]] || usage
[[ -f "$archive" ]] || { echo "No such file: $archive"; exit 1; }
gzip -t "$archive" 2>/dev/null || { echo "Not a valid backup archive (gzip check failed): $archive"; exit 1; }
[[ "$into" != "$DB_NAME" ]] || { echo "--into must differ from the live database '$DB_NAME'"; exit 1; }

if ! docker inspect -f '{{.State.Running}}' "$MONGO_CONTAINER" 2>/dev/null | grep -q true; then
  echo "Container '$MONGO_CONTAINER' is not running — start it with: docker compose up -d mongo"
  exit 1
fi

# ── Scratch restore: live data untouched ─────────────────────────────────
if [[ -n "$into" ]]; then
  docker exec -i "$MONGO_CONTAINER" mongorestore --quiet --archive --gzip --drop \
    --nsFrom "$DB_NAME.*" --nsTo "$into.*" < "$archive"
  echo "Restored $archive into scratch database '$into'. Collections:"
  docker exec "$MONGO_CONTAINER" mongosh "$into" --quiet --eval \
    'db.getCollectionNames().sort().forEach(c => print("  " + c + ": " + db[c].countDocuments()))'
  exit 0
fi

# ── Live restore ─────────────────────────────────────────────────────────
echo "This REPLACES the live '$DB_NAME' database with:"
echo "  $archive ($(du -h "$archive" | cut -f1), $(date -r "$archive" '+%F %T'))"
if ! $yes; then
  read -r -p 'Type "restore" to continue: ' answer
  [[ "$answer" == "restore" ]] || { echo "Cancelled."; exit 1; }
fi

echo "1/3 Safety backup of current data..."
BACKUP_LABEL=pre-restore "$REPO_DIR/scripts/backup.sh"

echo "2/3 Stopping backend and restoring..."
cd "$REPO_DIR"
docker compose stop backend >/dev/null
trap 'echo "Starting backend again..."; docker compose start backend >/dev/null' EXIT
docker exec -i "$MONGO_CONTAINER" mongorestore --quiet --archive --gzip --drop \
  --nsInclude "$DB_NAME.*" < "$archive"

echo "3/3 Done. Collections now:"
docker exec "$MONGO_CONTAINER" mongosh "$DB_NAME" --quiet --eval \
  'db.getCollectionNames().sort().forEach(c => print("  " + c + ": " + db[c].countDocuments()))'
