from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import User, AuditLog
from ..utils import require_roles, get_jwt_payload

users_bp = Blueprint('users', __name__)


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'user_id': user.user_id, 'name': user.name, 'email': user.email, 'role': user.role})


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
