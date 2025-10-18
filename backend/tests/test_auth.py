import os
import tempfile
import pytest
from app import create_app, db


@pytest.fixture
def client():
    db_fd, db_path = tempfile.mkstemp()
    os.environ['DATABASE_URL'] = 'sqlite:///' + db_path
    app = create_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client


def test_register_and_login(client):
    rv = client.post('/auth/register', json={'email': 'a@example.com', 'password': 'pass123', 'name': 'Alice'})
    assert rv.status_code == 201
    rv = client.post('/auth/login', json={'email': 'a@example.com', 'password': 'pass123'})
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'access_token' in data and 'refresh_token' in data
