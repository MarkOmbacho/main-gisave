"""Seed script for Girls I Save backend.

Usage:
  Set environment variable DATABASE_URL to your MySQL URL (or use .env) then run:
    python scripts/seed.py

This script is idempotent: it will create tables (via SQLAlchemy's create_all)
and insert an admin user plus sample mentor, program, and blog if they don't
already exist.
"""
import os
import sys

# Ensure project root is on sys.path so `app` package can be imported
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app import create_app, db
from app.models import User, Mentor, Program, BlogPost
import bcrypt


def get_env(name: str, default: str = None) -> str:
    return os.environ.get(name, default)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def seed():
    app = create_app()
    with app.app_context():
        print('Creating database tables (if not exist)...')
        db.create_all()

        admin_email = get_env('ADMIN_EMAIL', 'admin@girlsisave.org')
        admin_password = get_env('ADMIN_PASSWORD', 'ChangeMe123!')

        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            print(f'Creating admin user: {admin_email}')
            admin = User(
                name='Site Admin',
                email=admin_email,
                password_hash=hash_password(admin_password),
                role='admin',
                is_premium=True,
            )
            db.session.add(admin)
            db.session.commit()
        else:
            print('Admin user already exists')

        # Sample mentor (as a user + mentor profile)
        mentor_email = get_env('SAMPLE_MENTOR_EMAIL', 'mentor1@girlsisave.org')
        mentor = User.query.filter_by(email=mentor_email).first()
        if not mentor:
            print(f'Creating sample mentor: {mentor_email}')
            mentor = User(
                name='Mentor One',
                email=mentor_email,
                password_hash=hash_password('mentorpass'),
                role='mentor',
                is_premium=False,
            )
            db.session.add(mentor)
            db.session.commit()
            mprofile = Mentor(mentor_id=mentor.user_id, expertise_areas='Tech,Engineering', availability_status='available')
            db.session.add(mprofile)
            db.session.commit()
        else:
            print('Sample mentor already exists')

        # Sample program
        prog_title = 'Intro to Tech'
        prog = Program.query.filter_by(title=prog_title).first()
        if not prog:
            print(f'Creating sample program: {prog_title}')
            prog = Program(
                title=prog_title,
                description='A beginner-friendly STEM introduction program.',
                category='Tech',
                duration='4 weeks',
                eligibility='Open to all young women',
                created_by=admin.user_id,
            )
            db.session.add(prog)
            db.session.commit()
        else:
            print('Sample program already exists')

        # Sample blog post
        post_title = 'Welcome to Girls I Save'
        post = BlogPost.query.filter_by(title=post_title).first()
        if not post:
            print('Creating sample blog post')
            post = BlogPost(
                author_id=admin.user_id,
                title=post_title,
                content='This is a sample blog post to welcome users to the platform.',
                tags='welcome,announcement',
                status='published',
            )
            db.session.add(post)
            db.session.commit()
        else:
            print('Sample blog post already exists')

        print('Seeding complete.')


if __name__ == '__main__':
    seed()
