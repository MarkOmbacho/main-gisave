import os
import sys
from datetime import datetime

# Ensure backend package (the backend/ directory) is on sys.path so imports work
THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app, db
from app.models import User, Mentor, BlogPost

app = create_app()

with app.app_context():
    # Ensure tables exist (useful for local dev without running migrations)
    db.create_all()

    # Minimal seed: 2 mentors (as Users with Mentor relation) and 2 blog posts
    # Check if already present
    if User.query.filter_by(email='mentor1@girlsisave.org').first():
        print('Seed already applied (mentor1 exists).')
    else:
        m1 = User(name='Mentor One', email='mentor1@girlsisave.org', password_hash='seeded')
        m2 = User(name='Mentor Two', email='mentor2@girlsisave.org', password_hash='seeded')
        db.session.add_all([m1, m2])
        db.session.commit()

        mentor1 = Mentor(mentor_id=m1.user_id, expertise_areas='python,mentoring', availability_status='available')
        mentor2 = Mentor(mentor_id=m2.user_id, expertise_areas='web,design', availability_status='available')
        db.session.add_all([mentor1, mentor2])

        post1 = BlogPost(author_id=m1.user_id, title='Intro to our Mentorship', content='This is a seeded blog post about our mentorship program.', status='published')
        post2 = BlogPost(author_id=m2.user_id, title='Program Highlights', content='This is a seeded blog post highlighting program success stories.', status='published')
        db.session.add_all([post1, post2])

        db.session.commit()
        print('Minimal seed applied: 2 mentors and 2 blog posts created.')
