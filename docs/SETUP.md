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

# 3. Start the backend
cd backend
source .venv/bin/activate (Linux Ubuntu)
pip install -r requirements.txt
python app.py

# 4. Start the frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

### Database Connection

You can set these in a `.env` file in the `backend/` directory or export them as environment variables.


