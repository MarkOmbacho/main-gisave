
from flask import Blueprint, request, jsonify, current_app, make_response
from ..models import User, BlogPost
from .. import db
import datetime

admin_bp = Blueprint('admin_routes', __name__)

@admin_bp.route('/metrics', methods=['GET'])
def admin_metrics():
    from ..models import User, Mentor, Program, BlogPost, Payment
    users = User.query.count()
    mentors = Mentor.query.count()
    programs = Program.query.count()
    pending_moderation = BlogPost.query.filter_by(status='pending').count()
    payments = Payment.query.count()
    # Achievements: placeholder, count of users with is_premium or similar
    achievements = User.query.filter_by(is_premium=True).count()
    return {
        'users': users,
        'mentors': mentors,
        'programs': programs,
        'pendingModeration': pending_moderation,
        'payments': payments,
        'achievements': achievements,
    }


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email = data.get('email')
    token = data.get('token')
    # token is expected to be a valid JWT token already; we just validate role and set a cookie
    import jwt
    secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
    except Exception:
        return jsonify({'error': 'invalid token'}), 401
    if payload.get('role') != 'admin':
        return jsonify({'error': 'forbidden'}), 403
    resp = make_response({'message': 'admin cookie set'})
    # set a short-lived cookie for admin UI
    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    resp.set_cookie('admin_token', token, httponly=True, samesite='Lax', expires=expires)
    return resp


@admin_bp.route('/moderation/queue', methods=['GET'])
def moderation_queue():
    # list pending blog posts
    posts = BlogPost.query.filter(BlogPost.status == 'pending').order_by(BlogPost.created_at.desc()).all()
    out = []
    for p in posts:
        out.append({'post_id': p.post_id, 'title': p.title, 'author_id': p.author_id, 'created_at': p.created_at})
    return jsonify(out)
