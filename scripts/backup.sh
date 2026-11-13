#!/usr/bin/env bash
# Renfit — MongoDB backup.
#
# Dumps the `renfit` database from the running mongo container into a single
# compressed archive, verifies it, and deletes archives older than KEEP_DAYS.
#
#   scripts/backup.sh                 # → backups/renfit-YYYYmmdd-HHMMSS.archive.gz
#
# Settings (env vars, all optional):
#   BACKUP_DIR       where archives go            (default: <repo>/backups)
#   KEEP_DAYS        delete archives older than   (default: 14)
#   MONGO_CONTAINER  mongo container name          (default: renfit-mongo)
#   DB_NAME          database to dump              (default: renfit)
#   BACKUP_LABEL     filename prefix               (default: renfit)
#
# Nightly on the VPS (crontab -e):
#   15 3 * * * /opt/renfit/scripts/backup.sh >> /var/log/renfit-backup.log 2>&1
#
# Archives contain member data (password hashes, body composition, photos):
# they are created owner-only (umask 077). Copy them off the VPS regularly —
# a backup on the same disk does not survive losing that disk.
set -euo pipefail
umask 077

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$REPO_DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
MONGO_CONTAINER="${MONGO_CONTAINER:-renfit-mongo}"
DB_NAME="${DB_NAME:-renfit}"
BACKUP_LABEL="${BACKUP_LABEL:-renfit}"

log() { echo "[$(date '+%F %T')] backup: $*"; }

if ! docker inspect -f '{{.State.Running}}' "$MONGO_CONTAINER" 2>/dev/null | grep -q true; then
  log "ERROR: container '$MONGO_CONTAINER' is not running"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y%m%d-%H%M%S)"
final="$BACKUP_DIR/$BACKUP_LABEL-$stamp.archive.gz"
partial="$final.partial"
trap 'rm -f "$partial"' EXIT

docker exec "$MONGO_CONTAINER" mongodump --quiet --db "$DB_NAME" --archive --gzip > "$partial"

# Verify before keeping it: non-empty and a valid gzip stream.
if [[ ! -s "$partial" ]] || ! gzip -t "$partial" 2>/dev/null; then
  log "ERROR: dump is empty or corrupt — not kept"
  exit 1
fi
mv "$partial" "$final"
log "OK $final ($(du -h "$final" | cut -f1))"

# Rotation: only touches this script's own archives.
deleted="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.archive.gz' -mtime "+$KEEP_DAYS" -print -delete | wc -l)"
if [[ "$deleted" -gt 0 ]]; then log "rotated out $deleted archive(s) older than $KEEP_DAYS days"; fi
