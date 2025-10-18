import os
import sys

# Ensure project root is on sys.path for imports
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import tempfile
import pytest


@pytest.fixture
def app():
    # create a temporary sqlite database for tests
    db_fd, db_path = tempfile.mkstemp()
    os.environ['DATABASE_URL'] = 'sqlite:///' + db_path
    from app import create_app, db
    app = create_app()
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
    yield app

    # teardown
    with app.app_context():
        db.drop_all()
    os.close(db_fd)
    try:
        os.remove(db_path)
    except Exception:
        pass


@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client


@pytest.fixture
def db_session(app):
    from app import db as _db
    with app.app_context():
        yield _db.session
        _db.session.rollback()
