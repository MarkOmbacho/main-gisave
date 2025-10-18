import tempfile
import os
import jwt
from app import create_app, db
from app.models import MentorApplication, User, Mentor


def test_mentor_apply_and_approve():
    db_fd, db_path = tempfile.mkstemp()
    os.environ['DATABASE_URL'] = 'sqlite:///' + db_path
    app = create_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # create admin and a user
            admin = User(name='Admin', email='admin@example.com', password_hash='x', role='admin')
            user = User(name='Mentor', email='mentor@example.com', password_hash='x', role='student')
            db.session.add_all([admin, user])
            db.session.commit()
            uid = user.user_id
            admin_id = admin.user_id

            # submit application
        rv = client.post('/mentors/apply', json={'user_id': uid, 'expertise': 'math', 'documents': ['http://example.com/id.png']})
        assert rv.status_code == 201
        data = rv.get_json()
        app_id = data['application_id']

        with app.app_context():
            apprec = MentorApplication.query.get(app_id)
            assert apprec is not None

            # check that notification for the user was created
            from app.models import Notification
            n = Notification.query.filter_by(user_id=uid, type='mentor_application').first()
            assert n is not None

            # craft admin token
            secret = app.config.get('JWT_SECRET') or app.config.get('SECRET_KEY')
            admin_token = jwt.encode({'sub': admin_id, 'role': 'admin', 'exp': 9999999999, 'tv': 0}, secret, algorithm='HS256')

        rv = client.post(f'/mentors/applications/{app_id}/decide', json={'action': 'approve', 'note': 'looks good'}, headers={'Authorization': f'Bearer {admin_token}'})
        assert rv.status_code == 200

        with app.app_context():
            # Mentor profile created
            m = Mentor.query.filter_by(mentor_id=user.user_id).first()
            assert m is not None
