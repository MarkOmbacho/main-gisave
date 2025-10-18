from flask_admin import Admin, expose, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask import current_app, request, redirect, url_for
import jwt


def _get_payload():
    # Support Authorization header or admin_token cookie for browser admin sessions
    auth = request.headers.get('Authorization', '')
    token = None
    if auth.startswith('Bearer '):
        token = auth.split(' ', 1)[1]
    else:
        token = request.cookies.get('admin_token')
    secret = current_app.config.get('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    try:
        return jwt.decode(token, secret, algorithms=['HS256'])
    except Exception:
        return None


class SecureAdminIndexView(AdminIndexView):
    def is_accessible(self):
        payload = _get_payload()
        return payload and payload.get('role') == 'admin'

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('auth.login'))


class SecureModelView(ModelView):
    def is_accessible(self):
        payload = _get_payload()
        return payload and payload.get('role') == 'admin'


def init_admin(app, db):
    admin = Admin(app, name='GirlsISave Admin', index_view=SecureAdminIndexView())
    # register common admin views
    try:
        from .models import User, AuditLog, BlogPost, Program, Payment, Mentor, MentorApplication
    except Exception:
        # fall back if models missing
        from .models import User, AuditLog
        admin.add_view(SecureModelView(User, db.session))
        admin.add_view(SecureModelView(AuditLog, db.session))
    else:
        admin.add_view(SecureModelView(User, db.session))
        admin.add_view(SecureModelView(AuditLog, db.session))
        admin.add_view(SecureModelView(BlogPost, db.session))
        admin.add_view(SecureModelView(Program, db.session))
        admin.add_view(SecureModelView(Payment, db.session))
        admin.add_view(SecureModelView(Mentor, db.session))
        admin.add_view(SecureModelView(MentorApplication, db.session))
    try:
        from .models import MentorApplication
        admin.add_view(SecureModelView(MentorApplication, db.session))
    except Exception:
        app.logger.warning('could not register MentorApplication admin view')
    return admin
