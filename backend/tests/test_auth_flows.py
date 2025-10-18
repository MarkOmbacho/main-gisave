import os
import tempfile
import pytest
from app import create_app, db
from app.models import User


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


def register_user(client, email='b@example.com'):
    rv = client.post('/auth/register', json={'email': email, 'password': 'pass123', 'name': 'Bob'})
    assert rv.status_code == 201


def test_forgot_and_reset_flow(client):
    register_user(client, 'c@example.com')
    # request reset
    rv = client.post('/auth/forgot-password', json={'email': 'c@example.com'})
    assert rv.status_code == 200
    # fetch token from DB
    from app.models import User
    user = User.query.filter_by(email='c@example.com').first()
    assert user.reset_token is not None
    token = user.reset_token
    # reset password
    rv = client.post('/auth/reset-password', json={'token': token, 'password': 'newpass'})
    assert rv.status_code == 200
    # login with new password
    rv = client.post('/auth/login', json={'email': 'c@example.com', 'password': 'newpass'})
    assert rv.status_code == 200


def test_verify_and_refresh_flow(client):
    register_user(client, 'd@example.com')
    user = User.query.filter_by(email='d@example.com').first()
    # ensure verification token set
    assert user.verification_token is not None
    token = user.verification_token
    rv = client.post('/auth/verify-email', json={'token': token})
    assert rv.status_code == 200
    # login and refresh
    rv = client.post('/auth/login', json={'email': 'd@example.com', 'password': 'pass123'})
    data = rv.get_json()
    refresh = data['refresh_token']
    rv = client.post('/auth/refresh-token', json={'refresh_token': refresh})
    assert rv.status_code == 200
