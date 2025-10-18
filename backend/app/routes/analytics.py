from flask import Blueprint, request, jsonify
from .. import db
from ..models import AnalyticsLog

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/log', methods=['POST'])
def log_event():
    data = request.get_json() or {}
    log = AnalyticsLog(user_id=data.get('user_id'), action=data.get('action'), metadata_json=data.get('metadata'))
    db.session.add(log)
    db.session.commit()
    return jsonify({'message': 'logged'})


@analytics_bp.route('/summary/users', methods=['GET'])
def users_summary():
    # Example: count new users per day for last 7 days
    sql = (
        "SELECT date(date_joined) as day, count(*) as cnt "
        "FROM users WHERE date_joined > now() - interval '7 days' "
        "GROUP BY day ORDER BY day"
    )
    result = db.session.execute(sql)
    rows = [{'day': r[0].isoformat(), 'count': r[1]} for r in result]
    return jsonify(rows)
