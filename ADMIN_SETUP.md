# Admin Dashboard Setup Guide

Your admin dashboard is now enhanced with specialized views for managing content!

## 1. Access the Admin Panel

After deploying to Render, visit:
```
https://your-render-backend-url/admin
```

Or locally during development:
```
http://localhost:5000/admin
```

## 2. Authentication

The admin panel uses JWT authentication:

**Option A: Login via Frontend**
1. Go to `/auth` on frontend
2. Sign up or login with an admin account
3. You'll receive a JWT token that grants admin access
4. Navigate to `/admin` - you'll be automatically authenticated

**Option B: Token in URL**
```
https://your-backend/admin?token=YOUR_JWT_TOKEN
```

**Option C: Bearer Token (API Requests)**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/admin
```

## 3. Make Your Account an Admin

To enable admin access, your user account must have `role='admin'` in the database:

```bash
# Option 1: Update via Flask shell (local development)
$ flask shell
>>> from app.models import User
>>> admin_user = User.query.filter_by(email='your@email.com').first()
>>> admin_user.role = 'admin'
>>> db.session.commit()
>>> exit()

# Option 2: Direct database update
UPDATE users SET role='admin' WHERE email='your@email.com';
```

## 4. Admin Features by Model

### Users Management
- **View**: All users with ID, name, email, role, verification status
- **Search**: By name or email
- **Filter**: By role (admin/user), premium status, email verified status
- **Edit**: User details, role, premium status

### Blog Management
- **View**: All blog posts with title, author, creation date, published status
- **Search**: By post title or content
- **Filter**: By published/draft status
- **Edit**: Blog title, content, author assignment, publication status
- **Action**: Publish/unpublish posts directly

### Mentor Management
- **View**: All mentors with expertise areas, availability, rating, session count
- **Filter**: By availability status
- **Edit**: Mentor profile details, availability, ratings

### Mentor Applications
- **View**: All pending mentor applications
- **Search**: By expertise
- **Filter**: By status (pending/approved/rejected)
- **Edit**: Update application status, add admin notes (for rejection reasons)

### Audit Logs
- **View**: Complete audit trail of admin actions
- **Filter**: By date and action type
- **Purpose**: Track who changed what and when

## 5. Deployment Checklist

### Before Deploying to Render:

1. **Database Created** ✓
   - MySQL instance running on Render
   - `DATABASE_URL` environment variable set

2. **Admin User Created** ✓
   ```bash
   # After first deployment, update user role:
   UPDATE users SET role='admin' WHERE email='your-admin@email.com';
   ```

3. **Environment Variables Set** ✓
   ```
   FLASK_ENV=production
   DATABASE_URL=mysql+pymysql://user:pass@host:3306/dbname
   JWT_SECRET=your-secure-jwt-secret
   ENABLE_ADMIN=true
   ```

4. **Changes Pushed to GitHub** ✓
   ```bash
   git add backend/app/admin.py
   git commit -m "Enhanced admin dashboard with detailed model views"
   git push origin main
   ```

## 6. Common Admin Tasks

### Create a New Blog Post
1. Go to Admin > Blogs
2. Click "Create" button
3. Enter title, content, select author
4. Check "Published" to make it live
5. Save

### Approve a Mentor Application
1. Go to Admin > Mentor Applications
2. Click on pending application
3. Update status to "approved"
4. Add admin note if needed
5. Save (system will notify the user)

### Manage User Roles
1. Go to Admin > Users
2. Find user by email (search box)
3. Click edit
4. Change role to "admin" if needed
5. Save

## 7. Troubleshooting

### Admin panel returns "403 Forbidden"
- **Cause**: Your user account doesn't have `role='admin'`
- **Solution**: Update user role in database (see step 3)

### JWT token errors when accessing admin
- **Cause**: Token has expired or is invalid
- **Solution**: Login again via frontend or get fresh token via `/users/sync-token`

### Models not showing up in admin
- **Cause**: Import error in admin.py
- **Solution**: Check backend logs on Render dashboard for import errors
- **Debug**: Run `python -c "from app.models import User; print(User)"` in backend directory

### Changes not persisting
- **Cause**: Database connection issue
- **Solution**: Verify `DATABASE_URL` environment variable in Render dashboard

## 8. Next Steps

1. **Deploy**: Push changes to GitHub - auto-deploy will trigger
2. **Create Admin User**: Update your user account role in database
3. **Login**: Access `/admin` from your Render backend URL
4. **Start Managing**: Create blogs, approve mentors, manage users!

## 9. Security Notes

- ✅ Admin panel requires authentication (no public access)
- ✅ JWT tokens expire after 7 days (set in backend)
- ✅ All admin actions are logged in audit table
- ✅ Only users with `role='admin'` can access admin features
- ✅ Passwords are hashed with bcrypt before storage

For additional security in production:
- Add IP whitelist for admin endpoints
- Enable 2FA for admin accounts
- Implement rate limiting on admin actions
- Regular backup of admin activity logs
