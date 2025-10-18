from . import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255), nullable=True)
    verification_expires = db.Column(db.DateTime(timezone=True), nullable=True)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_expires = db.Column(db.DateTime(timezone=True), nullable=True)
    token_version = db.Column(db.Integer, default=0)
    refresh_token = db.Column(db.String(255), nullable=True)
    refresh_expires = db.Column(db.DateTime(timezone=True), nullable=True)
    role = db.Column(db.String(32), default='student')
    is_premium = db.Column(db.Boolean, default=False)
    profile_photo_url = db.Column(db.String(512))
    bio = db.Column(db.Text)
    region = db.Column(db.String(128))
    date_joined = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime(timezone=True))
    notifications_enabled = db.Column(db.Boolean, default=True)

    # relationships
    mentor_profile = db.relationship('Mentor', backref='user', uselist=False)
    posts = db.relationship('BlogPost', backref='author')


class Mentor(db.Model):
    __tablename__ = 'mentors'
    mentor_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    expertise_areas = db.Column(db.Text)  # comma-separated list
    availability_status = db.Column(db.String(32), default='available')
    rating = db.Column(db.Float, default=0.0)
    sessions_completed = db.Column(db.Integer, default=0)
    total_mentees = db.Column(db.Integer, default=0)


class MentorApplication(db.Model):
    __tablename__ = 'mentor_applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    expertise = db.Column(db.Text)
    documents = db.Column(db.Text)  # JSON list of document URLs (stored as string)
    status = db.Column(db.String(32), default='pending')
    admin_note = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Program(db.Model):
    __tablename__ = 'programs'
    program_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(128))
    duration = db.Column(db.String(64))
    eligibility = db.Column(db.Text)
    status = db.Column(db.String(32), default='active')
    created_by = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ProgramEnrollment(db.Model):
    __tablename__ = 'program_enrollments'
    enrollment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    program_id = db.Column(db.Integer, db.ForeignKey('programs.program_id'))
    status = db.Column(db.String(32), default='applied')
    date_enrolled = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    progress_percent = db.Column(db.Integer, default=0)
    completion_certificate_url = db.Column(db.String(512))


class MentorshipSession(db.Model):
    __tablename__ = 'mentorship_sessions'
    session_id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.mentor_id'))
    mentee_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    date_booked = db.Column(db.DateTime(timezone=True))
    time_slot = db.Column(db.String(64))
    status = db.Column(db.String(32), default='pending')
    chat_enabled = db.Column(db.Boolean, default=False)
    session_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    amount = db.Column(db.Numeric(10, 2))
    currency = db.Column(db.String(8), default='KES')
    method = db.Column(db.String(64))
    transaction_reference = db.Column(db.String(255), unique=True)
    status = db.Column(db.String(32))
    payment_type = db.Column(db.String(64))
    date_paid = db.Column(db.DateTime(timezone=True))

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    post_id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    title = db.Column(db.String(255))
    content = db.Column(db.Text)
    tags = db.Column(db.Text)
    cover_image_url = db.Column(db.String(512))
    status = db.Column(db.String(32), default='draft')
    views_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Notification(db.Model):
    __tablename__ = 'notifications'
    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    title = db.Column(db.String(255))
    message = db.Column(db.Text)
    type = db.Column(db.String(64))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AnalyticsLog(db.Model):
    __tablename__ = 'analytics_logs'
    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    action = db.Column(db.String(128))
    metadata_json = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(128))
    target = db.Column(db.String(128))
    detail = db.Column(db.Text)
    timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
