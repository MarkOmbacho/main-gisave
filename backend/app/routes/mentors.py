from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import MentorApplication, User, Mentor, AuditLog
from ..utils import require_roles, get_jwt_payload
import json
from ..storage import save_upload, get_public_url_for_local
from flask import current_app

mentors_bp = Blueprint('mentors', __name__)


@mentors_bp.route('/apply', methods=['POST'])
def apply():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    expertise = data.get('expertise', '')
    documents = data.get('documents', [])  # list of URLs for now

    if not user_id:
        return jsonify({'error': 'user_id required'}), 400

    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({'error': 'user not found'}), 404

    apprec = MentorApplication(user_id=user_id, expertise=expertise, documents=json.dumps(documents))
    db.session.add(apprec)
    db.session.commit()

    # create in-app notification for admins (simple approach: notify user as well)
    try:
        from ..models import Notification
        admin_note = Notification(user_id=None, title='New mentor application', message=f'User {user.email} applied', type='mentor_application')
        db.session.add(admin_note)
        # notify user too
        user_note = Notification(user_id=user.user_id, title='Application received', message='Your mentor application was received', type='mentor_application')
        db.session.add(user_note)
        db.session.commit()
    except Exception:
        current_app.logger.exception('failed to create notifications')

    # notify admins via email (best-effort)
    try:
        current_app.celery.send_task('app.tasks.send_email', args=['admin@example.com', 'New mentor application', f'User {user.email} applied'])
    except Exception:
        current_app.logger.exception('failed to enqueue admin notification')

    return jsonify({'message': 'application submitted', 'application_id': apprec.id}), 201



@mentors_bp.route('/upload', methods=['POST'])
def upload_document():
    # expects multipart/form-data with file field named 'file'
    if 'file' not in request.files:
        return jsonify({'error': 'file required'}), 400
    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'file required'}), 400
    upload_dir = current_app.config.get('UPLOAD_DIR') or (current_app.instance_path + '/uploads')
    path = save_upload(f, upload_dir)
    url = get_public_url_for_local(path, current_app)
    return jsonify({'url': url}), 201


@mentors_bp.route('/applications', methods=['GET'])
@require_roles('admin')
def list_applications():
    apps = MentorApplication.query.order_by(MentorApplication.submitted_at.desc()).all()
    out = []
    for a in apps:
        out.append({'id': a.id, 'user_id': a.user_id, 'expertise': a.expertise, 'documents': json.loads(a.documents or '[]'), 'status': a.status, 'admin_note': a.admin_note})
    return jsonify(out)


@mentors_bp.route('/applications/<int:app_id>/decide', methods=['POST'])
@require_roles('admin')
def decide_application(app_id):
    data = request.get_json() or {}
    action = data.get('action')  # 'approve' or 'reject'
    note = data.get('note')
    apprec = MentorApplication.query.filter_by(id=app_id).first()
    if not apprec:
        return jsonify({'error': 'application not found'}), 404

    if action not in ('approve', 'reject'):
        return jsonify({'error': 'invalid action'}), 400

    apprec.status = 'approved' if action == 'approve' else 'rejected'
    apprec.admin_note = note
    db.session.commit()

    # if approved, create Mentor profile
    if action == 'approve':
        m = Mentor(mentor_id=apprec.user_id)
        db.session.add(m)
        db.session.commit()

    # create in-app notification for the user
    try:
        from ..models import Notification
        notif = Notification(user_id=apprec.user_id, title=f'Application {apprec.status}', message=f'Your application was {apprec.status}', type='mentor_application')
        db.session.add(notif)
        db.session.commit()
    except Exception:
        current_app.logger.exception('failed to create notification for applicant')

    # audit log
    try:
        payload = get_jwt_payload()
        actor_id = payload.get('sub') if payload else None
    except Exception:
        actor_id = None
    al = AuditLog(actor_id=actor_id, action=f'mentor_application_{apprec.status}', target=str(apprec.user_id), detail=note)
    db.session.add(al)
    db.session.commit()

    return jsonify({'message': f'application {apprec.status}'}), 200


@mentors_bp.route('/list', methods=['GET'])
def list_mentors_public():
    """Return mentor profiles only to requests with a valid backend JWT in Authorization header."""
    auth = request.headers.get('Authorization')
    if not auth or not auth.startswith('Bearer '):
        return jsonify({'error': 'missing token'}), 401
    token = auth.split(' ', 1)[1]
    secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    try:
        import jwt
        payload = jwt.decode(token, secret, algorithms=['HS256'])
    except Exception as e:
        current_app.logger.info('invalid token for mentors list: %s', e)
        return jsonify({'error': 'invalid token'}), 401

    # optional: enforce role if needed
    # if payload.get('role') not in ('student', 'mentor', 'admin'):
    #     return jsonify({'error': 'forbidden'}), 403

    mentors = Mentor.query.all()
    out = []
    for m in mentors:
        user = User.query.filter_by(user_id=m.mentor_id).first()
        out.append({
            'mentor_id': m.mentor_id,
            'name': user.name if user else None,
            'email': user.email if user else None,
            'profile_photo_url': user.profile_photo_url if user else None,
            'bio': user.bio if user else None,
            'expertise_areas': (m.expertise_areas.split(',') if m.expertise_areas else []),
            'availability_status': m.availability_status,
        })
    return jsonify(out)


@mentors_bp.route('/dev/become-mentor', methods=['POST'])
def dev_become_mentor():
    """Dev endpoint: Convert logged-in user to a mentor (requires valid JWT)."""
    auth = request.headers.get('Authorization')
    if not auth or not auth.startswith('Bearer '):
        return jsonify({'error': 'missing token'}), 401
    token = auth.split(' ', 1)[1]
    secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    try:
        import jwt
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload.get('sub')
    except Exception as e:
        current_app.logger.warning('dev_become_mentor: token decode failed: %s', e)
        return jsonify({'error': 'invalid token'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404

    # Check if already a mentor
    existing_mentor = Mentor.query.filter_by(mentor_id=user_id).first()
    if existing_mentor:
        return jsonify({'message': 'already a mentor', 'mentor_id': user_id}), 200

    # Create mentor profile
    data = request.get_json() or {}
    expertise = data.get('expertise_areas', 'General Mentoring')
    availability = data.get('availability_status', 'available')
    
    mentor = Mentor(
        mentor_id=user_id,
        expertise_areas=expertise,
        availability_status=availability
    )
    db.session.add(mentor)
    db.session.commit()
    
    current_app.logger.info(f'dev_become_mentor: user {user_id} became a mentor')
    return jsonify({'message': 'mentor profile created', 'mentor_id': user_id}), 201

