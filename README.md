# cmpt354-group-project

## Backend setup (Flask)

1. `cd backend`
2. `python -m venv .venv`
3. `source .venv/bin/activate` (Windows: `.venv\\Scripts\\activate`)
4. `pip install -r requirements.txt`

## Install PostgreSQL (`psql`) on macOS

1. Install PostgreSQL:
   - `brew install postgresql@18`
2. Start PostgreSQL service:
   - `brew services start postgresql@18`
3. Verify `psql`:
   - `psql --version`
4. If `psql` is not found, add PostgreSQL to your PATH:
   - `echo 'export PATH="/usr/local/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc`
   - `source ~/.zshrc`
   - Apple Silicon/Homebrew in `/opt/homebrew`: use `/opt/homebrew/opt/postgresql@18/bin` instead.

## DB migrations (PostgreSQL)

1. Ensure `psql` is installed and running against your target database.
2. Set `DATABASE_URL`:
   - `export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db`
3. Run up migrations:
   - `./scripts/migrate_up.sh`
4. Run down migrations:
   - `./scripts/migrate_down.sh`
