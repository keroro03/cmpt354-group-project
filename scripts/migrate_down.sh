#!/usr/bin/env bash
set -euo pipefail

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
echo "Dropping target database..."
psql "$admin_url" -v ON_ERROR_STOP=1 -v target_db="$target_db" <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'target_db'
  AND pid <> pg_backend_pid();

SELECT format('DROP DATABASE IF EXISTS %I', :'target_db') \gexec
SQL

echo "Database '$target_db' dropped successfully."
