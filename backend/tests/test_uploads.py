import os
import tempfile

from app import create_app, db


def test_file_upload_and_use():
    db_fd, db_path = tempfile.mkstemp()
    os.environ['DATABASE_URL'] = 'sqlite:///' + db_path
    app = create_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # create a user
            from app.models import User
            u = User(name='Uploader', email='up@example.com', password_hash='x')
            db.session.add(u)
            db.session.commit()

        data = {
            'file': (tempfile.NamedTemporaryFile(suffix='.txt', delete=False), 'doc.txt')
        }
        # write to tmp file
        tf = data['file'][0]
        tf.write(b'hello')
        tf.flush()
        tf.close()

        with open(tf.name, 'rb') as fh:
            resp = client.post('/mentors/upload', data={'file': (fh, 'doc.txt')}, content_type='multipart/form-data')
        assert resp.status_code == 201
        url = resp.get_json()['url']
        assert url.startswith('/instance/')
