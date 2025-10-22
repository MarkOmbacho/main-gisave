# Setup Guide: Database, Features & Admin Dashboard

## Overview

This guide helps you set up:
1. ✅ Persistent MySQL database on Render
2. ✅ Short-term features (email verification, image optimization, profile tracking)
3. ✅ Admin dashboard for managing blogs and mentors

---

## Part 1: Database Setup on Render

### Step 1: Create MySQL Instance on Render

1. Go to **https://render.com/dashboard**
2. Click **"New +"** → **"Database"** → **"MySQL"**
3. Configure:
   - **Name**: `gisave-db`
   - **Database**: `gisave`
   - **User**: `gisave_user`
   - **Region**: Choose closest to your location
   - **Version**: MySQL 8.0 or latest

4. Click **"Create Database"**
5. Wait 5-10 minutes for creation

### Step 2: Get Connection String

1. After MySQL instance is ready, go to **Info** tab
2. Copy **"Internal Database URL"** 
   - Format: `mysql+pymysql://user:password@host:port/database`

3. Add to Render Backend Service:
   - Go to your **Web Service** → **Environment**
   - Set `DATABASE_URL` = the copied URL
   - Save (auto-redeploy)

### Step 3: Run Migrations

Render will automatically run migrations if your Flask app includes:
```python
from flask_migrate import Migrate
migrate = Migrate(app, db)
```

After deployment, your tables will be created automatically.

---

## Part 2: Short-Term Features

### Feature 1: Email Verification

**Already in your models:** `email_verified`, `verification_token`, `verification_expires`

**To implement:**

1. On signup, generate verification token
2. Send verification email
3. User clicks link to verify
4. Set `email_verified = True`

**Files to update:**
- `backend/app/routes/auth.py` - Add verification endpoints
- `backend/app/email_templates.py` - Create email templates

### Feature 2: Password Reset

**Already in your models:** `reset_token`, `reset_expires`

**To implement:**
1. User requests password reset
2. Generate `reset_token` with expiry
3. Send reset email with link
4. User clicks link and enters new password
5. Validate token and update password

### Feature 3: Image Optimization

**Current:** Avatar upload stores raw file

**Optimize by:**
1. Resize images to standard sizes (100x100, 200x200)
2. Convert to optimized format (WebP)
3. Cache headers for CDN

**Package needed:** `Pillow` (already in requirements.txt as `bcrypt`)

### Feature 4: Profile Completion Tracking

**Display:**
- Profile completion percentage (0-100%)
- Badges/milestones
- Missing field indicators

**Fields to track:**
- Name ✅
- Bio ✅
- Avatar ✅
- Region ✅
- Expertise (for mentors)

---

## Part 3: Admin Dashboard

### Option A: Flask-Admin (Recommended for Quick Setup)

**What it provides:**
- Automatic CRUD interface for all models
- User management
- Blog management
- Mentor management
- Role-based access control

**Status:** Flask-Admin is already in `requirements.txt`

### Option B: Custom React Dashboard (More Control)

**What you'd build:**
- Custom admin interface in React
- Drag-and-drop blog editor
- Mentor approval workflow
- Analytics dashboard

---

## Implementation Steps

### Step 1: Enable Flask-Admin

Update `backend/app/__init__.py`:

```python
# In create_app function
enable_admin = os.environ.get('ENABLE_ADMIN') == '1'
if enable_admin:
    try:
        from .admin import init_admin
        init_admin(app, db)
        app.logger.info('Flask-Admin enabled')
    except Exception:
        app.logger.exception('failed to initialize admin UI')
```

### Step 2: Create Admin Views

Create `backend/app/admin.py`:

```python
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from . import db
from .models import User, BlogPost, Mentor, MentorApplication

class AdminView(ModelView):
    def is_accessible(self):
        # Only admins can access
        return current_user.is_authenticated and current_user.role == 'admin'

class BlogPostAdmin(AdminView):
    column_list = ['id', 'title', 'author', 'created_at', 'published']
    form_columns = ['title', 'content', 'author_id', 'published']

class MentorAdmin(AdminView):
    column_list = ['mentor_id', 'expertise_areas', 'availability_status', 'rating']
    form_columns = ['expertise_areas', 'availability_status']

def init_admin(app, db):
    admin = Admin(app, name='Girls I Save Admin', template_mode='bootstrap4')
    admin.add_view(AdminView(User, db.session))
    admin.add_view(BlogPostAdmin(BlogPost, db.session))
    admin.add_view(MentorAdmin(Mentor, db.session))
    admin.add_view(AdminView(MentorApplication, db.session))
```

### Step 3: Protect Admin Routes

In `backend/app/routes/admin.py`:

```python
@admin_bp.before_request
def check_admin():
    """Ensure only admins can access admin routes"""
    if not current_user.is_authenticated or current_user.role != 'admin':
        return jsonify({'error': 'unauthorized'}), 403

@admin_bp.route('/blogs', methods=['POST'])
def create_blog():
    """Create a new blog post"""
    data = request.get_json()
    blog = BlogPost(
        title=data.get('title'),
        content=data.get('content'),
        author_id=current_user.user_id
    )
    db.session.add(blog)
    db.session.commit()
    return jsonify({'id': blog.id}), 201

@admin_bp.route('/mentors/<int:mentor_id>/approve', methods=['POST'])
def approve_mentor(mentor_id):
    """Approve a mentor application"""
    app = MentorApplication.query.get_or_404(mentor_id)
    app.status = 'approved'
    db.session.commit()
    return jsonify({'message': 'approved'})
```

---

## File Structure After Implementation

```
backend/
├── app/
│   ├── __init__.py              ← Enable Flask-Admin
│   ├── admin.py                 ← NEW: Admin views
│   ├── models.py                ✅ Already has all fields
│   ├── routes/
│   │   ├── admin.py             ✅ Admin endpoints
│   │   ├── auth.py              ← Add email verification
│   │   ├── blogs.py             ← Add blog management
│   │   ├── mentors.py           ✅ Already has mentors
│   │   └── users.py             ✅ Already has profile
│   ├── email_templates.py       ← Add verification & reset emails
│   └── storage.py               ← Add image optimization
├── requirements.txt             ✅ Has Flask-Admin
├── wsgi.py
└── .env                         ← Add ENABLE_ADMIN=1
```

---

## Database Schema Summary

Your models already include all necessary fields:

### Users Table
- Basic: `user_id`, `name`, `email`, `password_hash`
- Auth: `verification_token`, `reset_token`, `refresh_token`
- Status: `email_verified`, `is_active`, `is_premium`
- Profile: `profile_photo_url`, `bio`, `region`, `role`

### Blogs Table
- `id`, `title`, `content`, `author_id`
- `created_at`, `updated_at`, `published`

### Mentors Table
- `mentor_id`, `expertise_areas`, `availability_status`
- `rating`, `sessions_completed`, `total_mentees`

### Mentor Applications Table
- `id`, `user_id`, `expertise`, `documents`
- `status` (pending/approved/rejected), `admin_note`

---

## Quick Start Checklist

### Database
- [ ] Create MySQL instance on Render
- [ ] Copy connection string
- [ ] Set `DATABASE_URL` in Render environment
- [ ] Verify connection in logs

### Short-Term Features
- [ ] Implement email verification
- [ ] Implement password reset
- [ ] Add image optimization
- [ ] Add profile completion percentage

### Admin Dashboard
- [ ] Set `ENABLE_ADMIN=1` in environment
- [ ] Create `admin.py` file
- [ ] Access at `/admin`
- [ ] Create first blog post
- [ ] Approve a mentor

---

## Accessing Admin Dashboard

### After Setup:

1. **URL**: `https://your-backend.onrender.com/admin`
2. **Create Admin User** (via Flask shell or direct DB):
   ```bash
   export FLASK_APP=wsgi.py
   flask shell
   >>> from app.models import User
   >>> user = User(name='Admin', email='admin@example.com', role='admin')
   >>> db.session.add(user)
   >>> db.session.commit()
   ```

3. **Login** with admin credentials
4. **Manage** blogs, mentors, users

---

## Environment Variables

Add to `backend/.env`:

```bash
ENABLE_ADMIN=1
FLASK_ENV=production
SECRET_KEY=your_secret_key
DATABASE_URL=mysql+pymysql://user:pass@host/db
JWT_SECRET=your_jwt_secret
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
```

---

## Next: Implementation Steps

### Priority 1: Database
1. Create MySQL on Render
2. Configure DATABASE_URL
3. Deploy and verify

### Priority 2: Admin Dashboard
1. Implement Flask-Admin views
2. Create admin user
3. Test blog creation
4. Test mentor approval

### Priority 3: Features
1. Email verification
2. Password reset
3. Image optimization
4. Profile completion tracking

---

## Resources

- Flask-Admin: https://flask-admin.readthedocs.io
- SQLAlchemy: https://docs.sqlalchemy.org
- Flask-Mail: https://pythonhosted.org/Flask-Mail/
- Render MySQL: https://render.com/docs/mysql

