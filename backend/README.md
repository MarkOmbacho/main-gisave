# Girls I Save - Backend

This is a Flask-based backend scaffold for the Girls I Save application.

Overview:
- Flask app factory pattern
- SQLAlchemy models for Users, Programs, Enrollments, Mentors, Sessions, Payments, BlogPosts, Notifications, Analytics
- JWT-based authentication
- Payments webhook endpoint (M-Pesa) stub with idempotency handling
- Simple in-app notifications and analytics logging

Quickstart (local development):
1. Create a Python virtual environment and activate it.
2. Install dependencies: pip install -r requirements.txt
3. Set environment variables (see `.env.example`).
4. Run migrations: flask db upgrade
5. Start dev server: flask run

Cross-Origin Resource Sharing (CORS):
- The app enables CORS for all origins by default for development. In production, set specific origins in the app CORS configuration.

Deployment to cPanel:
- cPanel's Python app requires a `passenger_wsgi.py` entrypoint (included).
- Set `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET`, and mail configuration in the cPanel application settings.
- Install dependencies into the cPanel virtualenv and restart the app.

Testing:
- Run unit tests with `pytest` from the `backend/` directory.

Deployment to cPanel:
- cPanel's Python app requires a `passenger_wsgi.py` entrypoint (included).
- Configure the virtual environment, WSGI entry, and environment variables in cPanel.
- Use your cPanel-provided MySQL or PostgreSQL connection, set DATABASE_URL accordingly.

See the rest of the files for API routes and configuration.

Docker (local dev)
-------------------
If you prefer running the backend + redis + worker locally via Docker Compose:

1. Build and start services:

	docker compose up --build

2. The API will be available at http://localhost:5000 and a Celery worker will be available to process email tasks.

Notes: This compose file uses the repo root as the application context and a sqlite file for simplicity. For a MySQL development environment replace the `DATABASE_URL` with a MySQL container and update `requirements.txt` accordingly.

Admin UI
--------

The Flask-Admin powered admin UI is optional and disabled by default. To enable it set the environment variable `ENABLE_ADMIN=1` or set `ENABLE_ADMIN=True` in app config. Example:

```powershell
$env:ENABLE_ADMIN = '1'
flask run
```

Compatibility note: Flask-Admin has historically required certain SQLAlchemy internals that changed between SQLAlchemy 1.4 and 2.x. If the admin import fails the app will still start but the admin UI will be skipped. For production usage where the admin UI is required, pin compatible dependency versions in `backend/requirements.txt` (for example a working combination is `SQLAlchemy==1.4.x` with `Flask-Admin==1.6.x`), test locally, then deploy with the same pinned versions.
