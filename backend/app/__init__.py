from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
from flask_mail import Mail
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from celery import Celery
from .tasks import register_tasks

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()


def make_celery(app: Flask):
    celery = Celery(
        app.import_name,
        broker=app.config.get('CELERY_BROKER_URL'),
        backend=app.config.get('CELERY_BACKEND'),
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


def create_app(config_object=None):
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///data.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    if config_object:
        app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"]) 
    limiter.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # register blueprints
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.programs import programs_bp
    from .routes.payments import payments_bp
    from .routes.blogs import blogs_bp
    from .routes.notifications import notifications_bp
    from .routes.analytics import analytics_bp
    from .routes.mentors import mentors_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(programs_bp, url_prefix='/programs')
    app.register_blueprint(payments_bp, url_prefix='/payments')
    app.register_blueprint(blogs_bp, url_prefix='/blogs')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')
    app.register_blueprint(analytics_bp, url_prefix='/analytics')
    app.register_blueprint(mentors_bp, url_prefix='/mentors')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    # create celery instance attached to app for tasks (only if broker configured)
    broker = app.config.get('CELERY_BROKER_URL')
    if broker:
        app.celery = make_celery(app)
        try:
            register_tasks(app.celery, app)
        except Exception:
            app.logger.exception('failed to register celery tasks')
    else:
        # attach a dummy celery-like object with send_task to avoid broker errors in tests
        class DummyCelery:
            def send_task(self, *args, **kwargs):
                app.logger.debug('dummy send_task called', args)
        app.celery = DummyCelery()

    # admin UI (optional)
    enable_admin = app.config.get('ENABLE_ADMIN') or os.environ.get('ENABLE_ADMIN') == '1'
    if enable_admin:
        try:
            # quick compatibility check: associationproxy symbol is used by Flask-Admin's SQLA tools
            try:
                from sqlalchemy.ext.associationproxy import ASSOCIATION_PROXY  # type: ignore
            except Exception:
                app.logger.warning('Skipping admin init: sqlalchemy.associationproxy.ASSOCIATION_PROXY not available')
            else:
                from .admin import init_admin
                init_admin(app, db)
        except Exception:
            app.logger.exception('failed to initialize admin UI')
    else:
        app.logger.info('Flask-Admin disabled (ENABLE_ADMIN not set)')

    @app.route('/')
    def index():
        return {'status': 'ok', 'service': 'girls-i-save backend'}

    # Development-only static serving for uploaded files under instance/uploads
    @app.route('/instance/uploads/<path:filename>')
    def _instance_uploads(filename):
        from flask import send_from_directory
        upload_dir = app.config.get('UPLOAD_DIR') or (app.instance_path + '/uploads')
        return send_from_directory(upload_dir, filename)

    return app
