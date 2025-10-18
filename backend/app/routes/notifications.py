from flask import Blueprint, jsonify
from .. import db
from ..models import Notification

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/user/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    items = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).all()
    out = []
    for n in items:
        out.append({
            'notification_id': n.notification_id,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat(),
        })
    return jsonify(out)


@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
def mark_read(notification_id):
    n = Notification.query.get_or_404(notification_id)
    n.is_read = True
    db.session.commit()
    return jsonify({'message': 'marked'})
