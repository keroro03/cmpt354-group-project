#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/db/migrations"
SEED_FILE="$ROOT_DIR/db/seeds/01_sample_seed.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is not installed or not in PATH." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set." >&2
  echo "Example: export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db" >&2
  exit 1
fi

db_url="${DATABASE_URL}"
db_url_no_query="${db_url%%\?*}"
db_url_no_query="${db_url_no_query%%\#*}"
target_db="${db_url_no_query##*/}"
target_prefix="${db_url_no_query%/*}"
admin_url="${target_prefix}/postgres"

if [[ -z "$target_db" || "$target_db" == "$db_url_no_query" ]]; then
  echo "Error: Could not parse target database name from DATABASE_URL." >&2
  exit 1
fi

case "$target_db" in
  postgres|template0|template1)
    echo "Error: Refusing to operate on protected database '$target_db'." >&2
    exit 1
    ;;
esac

echo "Target database: $target_db"
echo "Bootstrap connection: $admin_url"
echo "Resetting database (drop + recreate)..."
psql "$admin_url" -v ON_ERROR_STOP=1 -v target_db="$target_db" <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'target_db'
  AND pid <> pg_backend_pid();

SELECT format('DROP DATABASE IF EXISTS %I', :'target_db') \gexec
SELECT format('CREATE DATABASE %I', :'target_db') \gexec
SQL

shopt -s nullglob
migration_files=("$MIGRATIONS_DIR"/*.up.sql)

if [[ ${#migration_files[@]} -eq 0 ]]; then
  echo "No up migrations found in $MIGRATIONS_DIR"
  exit 1
fi

IFS=$'\n' sorted_files=($(printf '%s\n' "${migration_files[@]}" | sort))
unset IFS

for file in "${sorted_files[@]}"; do
  echo "Applying: $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

if [[ ! -f "$SEED_FILE" ]]; then
  echo "Error: Seed file not found at $SEED_FILE" >&2
  exit 1
fi

echo "Loading seed data: $SEED_FILE"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SEED_FILE"

echo "Database reset, schema migrations, and seed load completed successfully."
