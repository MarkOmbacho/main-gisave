from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import User
import bcrypt
import jwt
import secrets
from datetime import datetime, timedelta, timezone
import secrets

auth_bp = Blueprint('auth', __name__)


def _ensure_aware(dt: "datetime | None"):
    """Return a timezone-aware datetime in UTC. If dt is None, return None.
    If dt has no tzinfo, assume UTC and attach timezone.utc.
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'email already exists'}), 400

    hashed = hash_password(password)
    user = User(name=name, email=email, password_hash=hashed, role=role)
    db.session.add(user)
    db.session.commit()

    # log analytics could be added here

    # create verification token
    try:
        token = secrets.token_urlsafe(32)
        user.verification_token = token
        user.verification_expires = datetime.now(timezone.utc) + timedelta(days=2)
        db.session.commit()
        current_app.celery.send_task('app.tasks.send_email', args=[user.email, 'Verify your email', f"Use this token to verify: {token}"])
    except Exception:
        current_app.logger.exception('failed to enqueue verification email')

    return jsonify({'message': 'registered'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({'error': 'invalid credentials'}), 401

    payload = {
        'sub': user.user_id,
        'role': user.role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
        'tv': user.token_version or 0,
    }
    secret = (
        current_app.config.get('JWT_SECRET')
        or current_app.config.get('SECRET_KEY')
    )
    # access token short-lived (15 minutes)
    access_payload = dict(payload)
    access_payload['exp'] = datetime.now(timezone.utc) + timedelta(minutes=15)
    access_token = jwt.encode(access_payload, secret, algorithm='HS256')

    # create rotating refresh token stored server-side
    refresh = secrets.token_urlsafe(48)
    user.refresh_token = refresh
    user.refresh_expires = datetime.now(timezone.utc) + timedelta(days=30)
    db.session.commit()
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'access_token': access_token, 'refresh_token': refresh, 'user': {'user_id': user.user_id, 'email': user.email, 'name': user.name, 'role': user.role}})


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'error': 'email required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        # don't reveal user existence
        return jsonify({'message': 'if the email exists, a reset link was sent'}), 200

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_expires = datetime.now(timezone.utc) + timedelta(hours=2)
    db.session.commit()

    # enqueue email (best-effort)
    try:
        current_app.celery.send_task('app.tasks.send_email', args=[user.email, 'Password reset', f"Use this token to reset: {token}"])
    except Exception:
        current_app.logger.exception('failed to enqueue reset email')

    return jsonify({'message': 'if the email exists, a reset link was sent'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    password = data.get('password')
    if not token or not password:
        return jsonify({'error': 'token and password required'}), 400
    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_expires or _ensure_aware(user.reset_expires) < datetime.now(timezone.utc):
        return jsonify({'error': 'invalid or expired token'}), 400

    user.password_hash = hash_password(password)
    user.reset_token = None
    user.reset_expires = None
    # bump token_version to invalidate existing refresh tokens
    user.token_version = (user.token_version or 0) + 1
    db.session.commit()

    return jsonify({'message': 'password updated'}), 200


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json() or {}
    token = data.get('token')
    if not token:
        return jsonify({'error': 'token required'}), 400
    user = User.query.filter_by(verification_token=token).first()
    if not user or not user.verification_expires or _ensure_aware(user.verification_expires) < datetime.now(timezone.utc):
        return jsonify({'error': 'invalid or expired token'}), 400
    user.email_verified = True
    user.verification_token = None
    user.verification_expires = None
    db.session.commit()
    return jsonify({'message': 'email verified'}), 200


@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    data = request.get_json() or {}
    refresh = data.get('refresh_token')
    if not refresh:
        return jsonify({'error': 'refresh_token required'}), 400
    user = User.query.filter_by(refresh_token=refresh).first()
    if not user or not user.refresh_expires or _ensure_aware(user.refresh_expires) < datetime.now(timezone.utc):
        return jsonify({'error': 'invalid or expired refresh token'}), 401

    # rotate refresh token
    new_refresh = secrets.token_urlsafe(48)
    user.refresh_token = new_refresh
    user.refresh_expires = datetime.now(timezone.utc) + timedelta(days=30)
    db.session.commit()

    secret = (
        current_app.config.get('JWT_SECRET')
        or current_app.config.get('SECRET_KEY')
    )
    access_payload = {'sub': user.user_id, 'role': user.role, 'exp': datetime.now(timezone.utc) + timedelta(minutes=15), 'tv': user.token_version or 0}
    access_token = jwt.encode(access_payload, secret, algorithm='HS256')
    return jsonify({'access_token': access_token, 'refresh_token': new_refresh}), 200
