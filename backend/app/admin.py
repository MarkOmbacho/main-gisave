from flask_admin import Admin, expose, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask import current_app, request, redirect, url_for, jsonify, session
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
    
    def on_model_change(self, form, model, is_created):
        """Log admin changes"""
        payload = _get_payload()
        user_id = payload.get('sub') if payload else 'unknown'
        action = 'created' if is_created else 'updated'
        model_name = model.__class__.__name__
        current_app.logger.info(f'Admin user {user_id}: {model_name} {action}')


class UserAdmin(SecureModelView):
    """Admin view for managing users"""
    column_list = ['user_id', 'name', 'email', 'role', 'email_verified', 'is_premium', 'date_joined']
    column_searchable_list = ['name', 'email']
    column_filters = ['role', 'is_premium', 'email_verified', 'is_active']
    form_columns = ['name', 'email', 'role', 'is_active', 'is_premium', 'bio', 'region', 'notifications_enabled']


class BlogPostAdmin(SecureModelView):
    """Admin view for managing blog posts"""
    column_list = ['id', 'title', 'author', 'created_at', 'published']
    column_searchable_list = ['title', 'content']
    column_filters = ['published', 'created_at']
    form_columns = ['title', 'content', 'author_id', 'published']


class MentorAdmin(SecureModelView):
    """Admin view for managing mentors"""
    column_list = ['mentor_id', 'expertise_areas', 'availability_status', 'rating', 'sessions_completed']
    column_filters = ['availability_status']
    form_columns = ['expertise_areas', 'availability_status', 'rating', 'sessions_completed', 'total_mentees']


class MentorApplicationAdmin(SecureModelView):
    """Admin view for managing mentor applications"""
    column_list = ['id', 'user_id', 'expertise', 'status', 'admin_note']
    column_searchable_list = ['expertise', 'admin_note']
    column_filters = ['status']
    form_columns = ['user_id', 'expertise', 'status', 'admin_note']


def init_admin(app, db):
    admin = Admin(app, name='Girls I Save Admin', index_view=SecureAdminIndexView(), template_mode='bootstrap4')
    
    # Register admin views
    try:
        from .models import User, AuditLog, BlogPost, Program, Payment, Mentor, MentorApplication
        
        admin.add_view(UserAdmin(User, db.session, name='Users'))
        admin.add_view(AuditLog(AuditLog, db.session, name='Audit Logs')) if AuditLog else None
        admin.add_view(BlogPostAdmin(BlogPost, db.session, name='Blogs'))
        admin.add_view(SecureModelView(Program, db.session, name='Programs'))
        admin.add_view(SecureModelView(Payment, db.session, name='Payments')) if Payment else None
        admin.add_view(MentorAdmin(Mentor, db.session, name='Mentors'))
        admin.add_view(MentorApplicationAdmin(MentorApplication, db.session, name='Mentor Applications'))
        
        current_app.logger.info('Flask-Admin initialized successfully with all views')
    except Exception as e:
        current_app.logger.exception('Error initializing admin views')
        # Fallback to basic views
        try:
            from .models import User, AuditLog
            admin.add_view(UserAdmin(User, db.session, name='Users'))
            admin.add_view(SecureModelView(AuditLog, db.session, name='Audit Logs'))
            current_app.logger.info('Flask-Admin initialized with basic views')
        except Exception as e2:
            current_app.logger.exception('Error initializing basic admin views')
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
