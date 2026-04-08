# Library Management System - Setup Guide

This document covers how to set up and run the Library Management System for CMPT 354.

## Prerequisites

- **Node.js** (v18+) and npm
- **Python** (3.9+) and pip
- **PostgreSQL** (14+)

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd cmpt354-group-project

# 2. Set up the backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Return to the project root
cd ..
```

## Install PostgreSQL (`psql`) on macOS

```bash
# 1. Install PostgreSQL
brew install postgresql@18

# 2. Start PostgreSQL
brew services start postgresql@18

# 3. Verify psql is available
psql --version
```

If `psql` is not found, add PostgreSQL to your `PATH` and reload your shell:

```bash
# Intel Homebrew
echo 'export PATH="/usr/local/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

For Apple Silicon/Homebrew, use:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Database Setup

```bash
# Set the database connection string
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db

# Create/reset the database, apply schema, and load seed data
./scripts/migrate_up.sh

# Start the backend
cd backend
python app.py

# Start the frontend (new terminal)
cd ../frontend
npm run dev
```

---

### Database Connection

You can set these in a `.env` file in the `backend/` directory or export them as environment variables.

Use this value for local development:

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db
```

`./scripts/migrate_up.sh` is the normal one-command database setup path. It creates or resets the target database, applies the schema, and loads the seed data, so no separate seed command is required in the normal workflow.

## Suggested Workflow

Use this workflow when starting the app locally.

`Terminal 1` - from the project root:

```bash
./scripts/migrate_up.sh
```

`Terminal 2`:

```bash
cd backend
python app.py
```

`Terminal 3`:

```bash
cd frontend
npm run dev
```
