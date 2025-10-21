from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import User, AuditLog
from ..utils import require_roles, get_jwt_payload
import jwt
from datetime import datetime, timezone, timedelta
from flask import current_app
from ..storage import save_upload, get_public_url_for_local

users_bp = Blueprint('users', __name__)


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'user_id': user.user_id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'bio': user.bio,
        'region': user.region,
        'profile_photo_url': user.profile_photo_url,
    })


@users_bp.route('/<int:user_id>', methods=['PUT'])
@require_roles('admin', 'student', 'mentor')
def update_user(user_id):
    payload = get_jwt_payload()
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    # allow users to update their own profile, or admin to update anyone
    if payload.get('sub') != user.user_id and payload.get('role') != 'admin':
        return jsonify({'error': 'forbidden'}), 403
    user.name = data.get('name', user.name)
    user.bio = data.get('bio', user.bio)
    user.region = data.get('region', user.region)
    db.session.commit()

    # record audit log
    try:
        actor_id = payload.get('sub')
        log = AuditLog(actor_id=actor_id, action='update_user', target=str(user.user_id), detail=str(data))
        db.session.add(log)
        db.session.commit()
    except Exception:
        current_app.logger.exception('failed to record audit log')

    return jsonify({'message': 'updated'})


@users_bp.route('/sync', methods=['POST'])
def sync_user():
    """Create or update a backend User record from frontend/auth provider data.
    Expected JSON: { email, name, profile_photo_url, bio }
    """
    try:
        data = request.get_json() or {}
        email = data.get('email')
        if not email:
            return jsonify({'error': 'email required'}), 400
        user = User.query.filter_by(email=email).first()
        if user:
            user.name = data.get('name', user.name)
            user.profile_photo_url = data.get('profile_photo_url', user.profile_photo_url)
            user.bio = data.get('bio', user.bio)
            db.session.commit()
            current_app.logger.info(f'sync_user: updated user {user.user_id} for {email}')
            return jsonify({'message': 'updated', 'user_id': user.user_id}), 200

        # create new user record (no password) - placeholder password_hash
        user = User(name=data.get('name') or '', email=email, password_hash=data.get('password_hash', ''))
        user.profile_photo_url = data.get('profile_photo_url')
        user.bio = data.get('bio')
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f'sync_user: created user {user.user_id} for {email}')
        return jsonify({'message': 'created', 'user_id': user.user_id}), 201
    except Exception as e:
        current_app.logger.exception('sync_user failed')
        return jsonify({'error': 'sync_user failed', 'details': str(e)}), 500


@users_bp.route('/debug/create-mentor', methods=['POST'])
def debug_create_mentor():
    """Dev-only helper: create a Mentor profile for an existing user by email."""
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'error': 'email required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'user not found'}), 404
    from ..models import Mentor
    if Mentor.query.filter_by(mentor_id=user.user_id).first():
        return jsonify({'message': 'mentor exists'}), 200
    m = Mentor(mentor_id=user.user_id, expertise_areas=data.get('expertise', 'general'))
    db.session.add(m)
    db.session.commit()
    return jsonify({'message': 'mentor created', 'mentor_id': user.user_id}), 201


@users_bp.route('/sync-token', methods=['POST'])
def sync_token():
    """Create/update user (if needed) and return a backend JWT for subsequent API calls.
    Expected JSON: { email, name?, profile_photo_url?, bio? }
    """
    try:
        data = request.get_json() or {}
        email = data.get('email')
        if not email:
            return jsonify({'error': 'email required'}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(name=data.get('name') or '', email=email, password_hash='')
            user.profile_photo_url = data.get('profile_photo_url')
            user.bio = data.get('bio')
            db.session.add(user)
            db.session.commit()
            current_app.logger.info(f'sync_token: created user {user.user_id} for {email}')

        secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
        payload = {'sub': user.user_id, 'role': user.role or 'student', 'exp': datetime.now(timezone.utc) + timedelta(days=7)}
        token = jwt.encode(payload, secret, algorithm='HS256')
        current_app.logger.info(f'sync_token: issued token for user {user.user_id}')
        return jsonify({'access_token': token, 'user_id': user.user_id}), 200
    except Exception as e:
        current_app.logger.exception('sync_token failed')
        return jsonify({'error': 'sync_token failed', 'details': str(e)}), 500


@users_bp.route('/me', methods=['PUT'])
def update_profile():
    # uses require_auth decorator logic manually (we can't import decorator easily here)
    auth = request.headers.get('Authorization')
    if not auth or not auth.startswith('Bearer '):
        current_app.logger.warning('update_profile: missing Authorization header')
        return jsonify({'error': 'missing token'}), 401
    token = auth.split(' ', 1)[1]
    secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        current_app.logger.info(f'update_profile: token decoded for user {payload.get("sub")}')
    except Exception as e:
        current_app.logger.warning(f'update_profile: token decode failed: {e}')
        return jsonify({'error': 'invalid token', 'details': str(e)}), 401
    user_id = payload.get('sub')
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    user.name = data.get('name', user.name)
    user.bio = data.get('bio', user.bio)
    user.region = data.get('region', user.region)
    user.profile_photo_url = data.get('profile_photo_url', user.profile_photo_url)
    db.session.commit()
    current_app.logger.info(f'update_profile: user {user_id} profile updated')
    return jsonify({'message': 'updated', 'user_id': user.user_id}), 200


@users_bp.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    # expects multipart/form-data with 'file' and 'user_id'
    if 'file' not in request.files:
        return jsonify({'error': 'file required'}), 400
    f = request.files['file']
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'user not found'}), 404
    import traceback
    upload_dir = current_app.config.get('UPLOAD_DIR') or (current_app.instance_path + '/uploads')
    # debug prints to ensure we see values in the server console for E2E debugging
    print(f"upload_avatar DEBUG: upload_dir={upload_dir}, filename={getattr(f, 'filename', None)}, user_id={user_id}")
    current_app.logger.info('upload_avatar: upload_dir=%s, filename=%s, user_id=%s', upload_dir, getattr(f, 'filename', None), user_id)
    try:
        path = save_upload(f, upload_dir)
        current_app.logger.info('upload_avatar: saved to %s', path)
    except Exception as e:
        tb = traceback.format_exc()
        current_app.logger.error('upload_avatar: save_upload failed: %s\n%s', e, tb)
        return jsonify({'error': 'save_failed', 'details': str(e)}), 500

    try:
        url = get_public_url_for_local(path, current_app)
    except Exception as e:
        tb = traceback.format_exc()
        current_app.logger.error('upload_avatar: get_public_url_for_local failed: %s\n%s', e, tb)
        return jsonify({'error': 'url_failed', 'details': str(e)}), 500

    try:
        user.profile_photo_url = url
        db.session.commit()
    except Exception as e:
        tb = traceback.format_exc()
        current_app.logger.error('upload_avatar: db commit failed: %s\n%s', e, tb)
        return jsonify({'error': 'db_failed', 'details': str(e)}), 500

    return jsonify({'message': 'uploaded', 'url': url}), 201


@users_bp.route('/<int:user_id>/profile', methods=['PUT'])
def update_profile_public(user_id):
    # Dev-friendly profile update endpoint (no auth) to let users set up profile after signup
    data = request.get_json() or {}
    user = User.query.get_or_404(user_id)
    user.name = data.get('name', user.name)
    user.bio = data.get('bio', user.bio)
    user.region = data.get('region', user.region)
    if data.get('profile_photo_url'):
        user.profile_photo_url = data.get('profile_photo_url')
    db.session.commit()
    return jsonify({'message': 'profile updated', 'user_id': user.user_id}), 200
