#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/db/migrations"

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is not installed or not in PATH." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set." >&2
  echo "Example: export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db" >&2
  exit 1
fi

shopt -s nullglob
migration_files=("$MIGRATIONS_DIR"/*.down.sql)

if [[ ${#migration_files[@]} -eq 0 ]]; then
  echo "No down migrations found in $MIGRATIONS_DIR"
  exit 0
fi

IFS=$'\n' sorted_files=($(printf '%s\n' "${migration_files[@]}" | sort -r))
unset IFS

for file in "${sorted_files[@]}"; do
  echo "Reverting: $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "All down migrations applied successfully."
