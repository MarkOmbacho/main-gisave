import jwt
import os
from app.models import User, BlogPost
import datetime


def make_token(app, payload):
    secret = app.config.get('JWT_SECRET') or app.config.get('SECRET_KEY')
    return jwt.encode(payload, secret, algorithm='HS256')


def test_admin_login_and_cookie(client, app, db_session):
    # create admin user
    admin = User(name='Admin', email='admin@example.com', password_hash='x', role='admin')
    db_session.add(admin)
    db_session.commit()

    token = make_token(app, {'user_id': admin.user_id, 'role': 'admin'})
    rv = client.post('/admin/login', json={'email': admin.email, 'token': token})
    assert rv.status_code == 200
    assert 'admin_token' in rv.headers.get('Set-Cookie')


def test_moderation_queue(client, app, db_session):
    # create pending posts
    p1 = BlogPost(author_id=1, title='P1', content='x', status='pending')
    p2 = BlogPost(author_id=1, title='P2', content='x', status='pending')
    db_session.add_all([p1, p2])
    db_session.commit()
    rv = client.get('/admin/moderation/queue')
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, list)
    assert len(data) >= 2
