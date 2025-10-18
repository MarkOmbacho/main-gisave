from functools import wraps
from flask import request, jsonify, current_app
import jwt


def get_jwt_payload():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ', 1)[1]
    secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None


def require_roles(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            payload = get_jwt_payload()
            if not payload:
                return jsonify({'error': 'missing or invalid auth'}), 401
            user_role = payload.get('role')
            user_id = payload.get('sub')
            # admin bypass
            if 'admin' in roles and user_role == 'admin':
                return f(*args, **kwargs)
            if user_role not in roles:
                return jsonify({'error': 'forbidden'}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
from functools import wraps
from flask import request, jsonify
import jwt
import os

JWT_SECRET = os.environ.get('JWT_SECRET', os.environ.get('SECRET_KEY'))


def require_auth(roles=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            auth = request.headers.get('Authorization')
            if not auth:
                return jsonify({'error': 'missing token'}), 401
            try:
                scheme, token = auth.split(' ')
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                if roles and payload.get('role') not in roles:
                    return jsonify({'error': 'forbidden'}), 403
                request.user = payload
            except Exception as e:
                return jsonify({'error': 'invalid token', 'details': str(e)}), 401
            return f(*args, **kwargs)
        return wrapped
    return decorator
