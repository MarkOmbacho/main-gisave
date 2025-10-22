# Complete MySQL Database Setup on Render

Your backend is ready to connect to a persistent MySQL database. Follow this guide to set it up!

## Phase 1: Create MySQL Instance on Render

### Step 1: Navigate to Render Dashboard
1. Go to [render.com](https://render.com)
2. Login to your account
3. Click **New +** button in top right
4. Select **MySQL**

### Step 2: Configure MySQL Instance
1. **Name**: `girlsisave-mysql` (or your choice)
2. **Database**: `girlsisave` (or your choice)
3. **Username**: `girlsisave_user` (or your choice - save this!)
4. **Password**: Generate strong password, click icon to generate. Save this!
5. **Region**: Choose same region as your backend (lower latency)
6. **Plan**: Start with **Starter** plan (free tier eligible)

### Step 3: Create Instance
- Click **Create MySQL Database**
- Wait 2-3 minutes for instance to be created
- You'll see the database connection details

### Step 4: Get Connection Details
Once created, Render will show your database URL. It looks like:
```
mysql+pymysql://girlsisave_user:PASSWORD@dpg-xxxxx.render.internal:3306/girlsisave
```

**⚠️ Important: Copy the full connection URL - you'll need it next**

---

## Phase 2: Connect Backend to Database

### Step 1: Add Environment Variable to Backend (Render)
1. Go to your **backend service** on Render (not the database)
2. Click **Environment**
3. Click **Add Environment Variable**
4. **Key**: `DATABASE_URL`
5. **Value**: Paste the full MySQL connection URL from Phase 1
6. **Add Environment Variable**

### Step 2: Verify Other Required Variables
Ensure these are set in your backend environment:
```
FLASK_ENV=production
JWT_SECRET=your-jwt-secret-key (use existing or generate new)
ENABLE_ADMIN=true
```

### Step 3: Manual Deploy Backend
1. Go to your backend service dashboard
2. Click **Deploy** button (to trigger database migration)
3. Watch the deploy logs
4. You should see: "Creating tables..." then "Tables created successfully"

**If deployment fails:**
- Check logs for connection errors
- Verify DATABASE_URL is correct (no typos)
- Ensure MySQL instance is in "Available" status on Render

---

## Phase 3: Local Development Database Setup

### Option A: Use Same Render MySQL Locally (Recommended for Testing)

1. Create `.env` file in `backend/` directory:
```bash
DATABASE_URL=mysql+pymysql://girlsisave_user:PASSWORD@dpg-xxxxx.render.internal:3306/girlsisave
FLASK_ENV=development
JWT_SECRET=your-secret-key
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run migrations:
```bash
flask db upgrade
```

4. Run local dev server:
```bash
flask run
```

### Option B: Use Local MySQL (Better for Local Development)

If you prefer local MySQL instead of remote:

1. **Install MySQL Server**
   - Windows: Download from [mysql.com](https://dev.mysql.com/downloads/windows/installer/)
   - Mac: `brew install mysql`
   - Linux: `apt-get install mysql-server`

2. **Start MySQL**
   ```bash
   # Windows (if installed as service)
   net start MySQL80
   
   # Mac/Linux
   mysql.server start
   ```

3. **Create database and user**
   ```bash
   mysql -u root -p
   ```
   Then paste:
   ```sql
   CREATE DATABASE girlsisave_dev;
   CREATE USER 'gis_dev'@'localhost' IDENTIFIED BY 'dev_password_123';
   GRANT ALL PRIVILEGES ON girlsisave_dev.* TO 'gis_dev'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Create `.env` in backend:**
   ```
   DATABASE_URL=mysql+pymysql://gis_dev:dev_password_123@localhost:3306/girlsisave_dev
   FLASK_ENV=development
   JWT_SECRET=dev-secret-key
   ```

5. **Run migrations:**
   ```bash
   cd backend
   flask db upgrade
   ```

---

## Phase 4: Verify Database Connection

### Check Tables Were Created

**Via Render CLI (if installed):**
```bash
render mysql --database girlsisave
```

**Or via Backend Logs:**
After deploy, check backend service logs on Render - you should see:
```
[INFO] Creating table users...
[INFO] Creating table blog_posts...
[INFO] Creating table mentors...
[INFO] All tables created successfully!
```

### Test Connection with Backend

1. SSH into backend service (or run locally)
2. Test connection:
```bash
flask shell
>>> from app import db
>>> from app.models import User
>>> User.query.count()  # Should return 0 (empty table)
```

If no errors - **database is connected! ✅**

---

## Phase 5: Populate Initial Data

### Seed Database with Test Data

```bash
cd backend
python scripts/seed_minimal.py
```

This creates:
- 2 admin test users
- 2 blog posts
- 2 mentor profiles

Check output - should see:
```
✓ Users created
✓ Blogs created
✓ Mentors created
```

### Access Admin Dashboard

1. Deploy backend (if you modified any code)
2. Login via frontend with test credentials (if seeded)
3. Go to `https://your-render-backend.onrender.com/admin`
4. Create/edit blogs, manage mentors, etc.

---

## Phase 6: Production Checklist

### Before Going Live

- [ ] MySQL instance created on Render
- [ ] DATABASE_URL set in backend environment
- [ ] Backend deployed successfully
- [ ] Tables created (check logs)
- [ ] Admin user created and verified
- [ ] Can access `/admin` dashboard
- [ ] Can create/edit blog posts via admin
- [ ] Profile page works (saving data to database)
- [ ] Mentor applications save to database

### Database Backup Strategy

**Automated Backups (Render):**
- Render automatically backs up MySQL daily
- Backups retained for 7 days
- View backups in database service dashboard

**Manual Backups (Recommended):**
```bash
# Export database to backup file
mysqldump -u girlsisave_user -p -h dpg-xxxxx.render.internal girlsisave > backup_2024.sql

# Restore from backup
mysql -u girlsisave_user -p -h dpg-xxxxx.render.internal girlsisave < backup_2024.sql
```

---

## Phase 7: Common Issues & Solutions

### Issue: "Connection refused" when deploying

**Cause**: Database URL is incorrect or instance not ready yet

**Solution**:
1. Verify DATABASE_URL in environment (no typos)
2. Wait 5+ minutes for MySQL instance to fully initialize
3. Check instance status on Render is "Available" (green)
4. Re-deploy backend

### Issue: "Access denied for user"

**Cause**: Username/password mismatch

**Solution**:
1. Go to MySQL instance details on Render
2. Copy exact connection URL again
3. Update DATABASE_URL in backend environment
4. Redeploy

### Issue: Tables not created after deploy

**Cause**: Flask-Migrate not running

**Solution**:
1. Check backend logs for migration errors
2. Run manually:
```bash
# In Render Shell (if available)
flask db upgrade

# Or rebuild the backend
# Push a new commit to trigger rebuild
git add .
git commit -m "Trigger rebuild"
git push
```

### Issue: Admin dashboard shows "403 Forbidden"

**Cause**: User role not set to "admin"

**Solution**:
```bash
# Connect to MySQL
mysql -u girlsisave_user -p -h dpg-xxxxx.render.internal girlsisave

# Update your user role
UPDATE users SET role='admin' WHERE email='your@email.com';
EXIT;
```

### Issue: Frontend can't connect to database-stored data

**Cause**: Likely frontend is not waiting for backend response, or JWT token is invalid

**Solution**:
1. Check frontend browser console for errors
2. Verify JWT token is being sent with requests
3. Check backend logs for 401/403 errors
4. See `src/hooks/useAuth.tsx` for token management

---

## Phase 8: Database Schema Reference

Your database will have these tables:

### `users` table
```
user_id (UUID)
email (unique)
name
password_hash
bio
region
profile_photo_url
role (admin/user)
email_verified (boolean)
verification_token
verification_expires
reset_token
reset_expires
refresh_token
is_premium
is_active
date_joined
```

### `blog_posts` table
```
id
title
content
author_id (foreign key to users)
published (boolean)
created_at
updated_at
```

### `mentors` table
```
mentor_id (foreign key to users)
expertise_areas (JSON)
availability_status
rating (float)
sessions_completed
total_mentees
```

### `mentor_applications` table
```
id
user_id (foreign key to users)
expertise
documents (JSON/uploaded files)
status (pending/approved/rejected)
admin_note
created_at
```

### `audit_logs` table
```
id
actor_id (admin user who made change)
action (created/updated/deleted)
target (model name)
detail (JSON with change details)
timestamp
```

---

## Phase 9: Next Steps

After database is set up:

1. **Create Admin Content**
   - Login to `/admin`
   - Create blog posts
   - Review/approve mentor applications

2. **Test User Flow**
   - Signup via frontend
   - View profile (data saves to database)
   - View blogs (queries from database)

3. **Monitor**
   - Check Render dashboard for database usage
   - Review backend logs for errors
   - Set up error notifications

4. **Scale (Future)**
   - When needed, upgrade MySQL instance
   - Enable read replicas for high traffic
   - Set up automated backups to S3

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **MySQL Docs**: https://dev.mysql.com/doc/
- **Flask-SQLAlchemy**: https://flask-sqlalchemy.palletsprojects.com/
- **Flask-Migrate**: https://flask-migrate.readthedocs.io/
