import json
from app.models import User, BlogPost


def test_create_and_publish_blog(client, app, db_session):
    # create user
    user = User(name='Author', email='author@example.com', password_hash='x')
    db_session.add(user)
    db_session.commit()

    rv = client.post('/blogs/', json={'author_id': user.user_id, 'title': 'Hello', 'content': 'World'})
    assert rv.status_code == 201
    data = rv.get_json()
    post_id = data['post_id']

    # publish
    rv2 = client.post(f'/blogs/{post_id}/publish')
    assert rv2.status_code == 200
    j = rv2.get_json()
    assert j['message'] == 'published'

    # check post status
    p = BlogPost.query.get(post_id)
    assert p.status == 'published'


def test_moderate_blog_reject(client, app, db_session):
    user = User(name='Author2', email='a2@example.com', password_hash='x')
    db_session.add(user)
    db_session.commit()

    rv = client.post('/blogs/', json={'author_id': user.user_id, 'title': 'Moderate', 'content': 'X'})
    data = rv.get_json()
    post_id = data['post_id']

    rv2 = client.post(f'/blogs/{post_id}/moderate', json={'action': 'reject', 'note': 'Not a fit'})
    assert rv2.status_code == 200
    j = rv2.get_json()
    assert j['status'] == 'rejected'
