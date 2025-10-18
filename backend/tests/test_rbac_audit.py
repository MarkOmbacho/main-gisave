import os
import tempfile
from app import create_app, db
from app.models import User, AuditLog


def client_fixture():
    db_fd, db_path = tempfile.mkstemp()
    os.environ['DATABASE_URL'] = 'sqlite:///' + db_path
    app = create_app()
    app.config['TESTING'] = True
    return app.test_client(), app


def test_rbac_and_audit():
    client, app = client_fixture()
    with app.app_context():
        db.create_all()
        # create admin and user
        admin = User(name='Admin', email='admin2@example.com', password_hash='x', role='admin')
        user = User(name='User', email='user2@example.com', password_hash='x', role='student')
        db.session.add_all([admin, user])
        db.session.commit()
        # craft admin token
        import jwt
        secret = app.config.get('JWT_SECRET') or app.config.get('SECRET_KEY')
        admin_token = jwt.encode({'sub': admin.user_id, 'role': 'admin', 'exp': 9999999999, 'tv': admin.token_version or 0}, secret, algorithm='HS256')
        # user update by admin
        rv = client.put(f'/users/{user.user_id}', json={'name': 'User X'}, headers={'Authorization': f'Bearer {admin_token}'})
        assert rv.status_code == 200
        # check audit log
        log = AuditLog.query.filter_by(action='update_user', target=str(user.user_id)).first()
        assert log is not None

        # now try user updating another user's profile (should be forbidden)
        user_token = jwt.encode({'sub': user.user_id, 'role': 'student', 'exp': 9999999999, 'tv': user.token_version or 0}, secret, algorithm='HS256')
        rv = client.put(f'/users/{admin.user_id}', json={'name': 'Hacked'}, headers={'Authorization': f'Bearer {user_token}'})
        assert rv.status_code == 403
