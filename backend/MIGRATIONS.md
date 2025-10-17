# Migrations and Seeding

This document explains how to generate and run database migrations and seed the database.

Local dev (SQLite)
1. Create and activate virtualenv:
   - powershell: python -m venv venv; .\venv\Scripts\Activate.ps1
2. Install requirements: pip install -r requirements.txt
3. Set DATABASE_URL to local sqlite for dev if desired (optional). By default the app uses a sqlite file when DATABASE_URL is unset.
4. Initialize migrations (one-time):
   - flask db init
   - flask db migrate -m "initial"
   - flask db upgrade

Recent actions:
- The Alembic migration environment was initialized (`flask db init`) and a baseline stamp was applied
   to mark the current schema as the head revision. This was done because the database already contained
   tables created by the seed script. To create future migrations use `flask db migrate -m "message"` and
   `flask db upgrade`.

Notes:
- `PyMySQL` was added to `requirements.txt` to support MySQL in production.
   Ensure your cPanel MySQL connection string uses the `mysql+pymysql://` dialect.

Seeding sample data
- Run the seed script to create an admin user and sample data:
  - python scripts/seed.py

Generating migrations for MySQL (cPanel)
1. On your local machine or a development environment that mirrors production, set DATABASE_URL to your MySQL connection string, e.g.:
   - export DATABASE_URL=mysql+pymysql://user:password@host:3306/dbname
2. Run:
   - flask db migrate -m "create tables"
   - flask db upgrade
3. Commit the generated migration files to the repository so they can be run on production.

Running migrations on cPanel
- cPanel's Python app allows running commands inside the virtualenv. Use the cPanel terminal or SSH (if enabled) to run:
  - . path/to/virtualenv/bin/activate
  - flask db upgrade

Notes
- Alembic/Flask-Migrate will generate SQL compatible with your configured dialect. Review generated migrations before applying to production.
- If your cPanel DB is MySQL, ensure `pymysql` or a compatible driver is installed in the virtualenv (add to `requirements.txt` if needed).
